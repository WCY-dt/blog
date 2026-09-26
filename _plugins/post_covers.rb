require 'date'
require 'digest'
require 'yaml'

# Artwork is maintained separately from posts. Resolve it once before Liquid
# rendering so every view uses the same image, including shared series artwork.
module PostCovers
  ROOT = 'assets/post/covers'.freeze

  class Resolver
    def initialize(source, posts, warn: nil)
      @source = source
      @posts = posts
      @warn = warn || ->(_message) {}
    end

    def apply
      files = cover_files
      entries = @posts.map { |post| [post.basename_without_ext, post.data['series']] }
      entries.concat(unpublished_cover_entries(files, entries.map(&:first)))
      series_covers = resolve_series(files, entries)

      @posts.each do |post|
        # Clear generated values on rebuild when an artwork file is removed.
        post.data.delete('cover_image')
        cover = series_covers[series_key(post.data['series'])] || files[post.basename_without_ext] || files['default']
        post.data['cover_image'] = cover if cover
      end
    end

    private

    def cover_files
      directory = File.join(@source, ROOT)
      return {} unless Dir.exist?(directory)

      Dir.children(directory).sort.each_with_object({}) do |name, files|
        next unless name.end_with?('.webp') && File.file?(File.join(directory, name))

        files[File.basename(name, '.webp')] = "/#{ROOT}/#{name}"
      end
    end

    def series_key(series)
      series.is_a?(String) && !series.strip.empty? ? series : nil
    end

    def resolve_series(files, entries)
      candidates = Hash.new { |hash, key| hash[key] = [] }
      entries.each do |basename, series|
        key = series_key(series)
        candidates[key] << files[basename] if key && files[basename]
      end
      candidates.transform_values do |paths|
        paths = paths.uniq.sort
        if paths.length > 1 && paths.map { |path| Digest::SHA256.file(File.join(@source, path.delete_prefix('/'))).hexdigest }.uniq.length > 1
          @warn.call("Multiple different covers in one series; using #{paths.first}. Candidates: #{paths.join(', ')}")
        end
        paths.first
      end
    end

    # A future or draft post may carry the series' only cover. Read only its
    # front matter; never create a Jekyll document or add it to a public listing.
    def unpublished_cover_entries(files, known_basenames)
      missing = files.keys - known_basenames
      return [] if missing.empty?

      %w[_posts _drafts].flat_map do |folder|
        Dir.glob(File.join(@source, folder, '**', '*')).sort.filter_map do |path|
          next unless File.file?(path)
          basename = File.basename(path, '.*')
          next unless missing.include?(basename)

          [basename, read_series(path)]
        end
      end
    end

    def read_series(path)
      front_matter = []
      closed = false
      File.open(path, 'r:bom|utf-8') do |file|
        return nil unless file.gets&.strip == '---'
        file.each_line do |line|
          if line.strip == '---'
            closed = true
            break
          end
          front_matter << line
        end
      end
      return nil unless closed

      data = YAML.safe_load(front_matter.join, permitted_classes: [Date, Time], aliases: true)
      data.is_a?(Hash) ? data['series'] : nil
    rescue Psych::Exception, ArgumentError => error
      @warn.call("Cannot read cover series from #{path}: #{error.message}")
      nil
    end
  end

  if defined?(Jekyll::Generator)
    class Generator < Jekyll::Generator
      safe true
      priority :high

      def generate(site)
        Resolver.new(site.source, site.posts.docs,
                     warn: ->(message) { Jekyll.logger.warn('Post covers:', message) }).apply
      end
    end
  end
end
