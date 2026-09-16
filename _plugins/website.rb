require 'cgi'
require 'digest'
require 'fileutils'
require 'find'
require 'json'
require 'open3'
require 'pathname'
require 'tmpdir'
require 'uri'

module WebsitePosts
  ROOT = 'assets/post/websites'.freeze
  GENERATED = %w[node_modules dist build out coverage .next .nuxt .output .astro .svelte-kit].freeze

  def self.fail!(message)
    raise Jekyll::Errors::FatalException, "Website posts: #{message}"
  end

  def self.external_url(post)
    config = post.data['website']
    if config.is_a?(Hash) && config.key?('url')
      fail!("#{post.relative_path}: website.url cannot be combined with source, output or other options") unless config.keys == ['url']
      url = config['url']
    elsif config.is_a?(String) && config.match?(/\A(?:[a-z][a-z0-9+.-]*:|\/\/)/i)
      url = config
    else
      return nil
    end

    if url.is_a?(String) && !url.match?(/[[:space:][:cntrl:]\\]/)
      # Validate international URLs without changing their query strings or fragments.
      uri = URI.parse(URI::DEFAULT_PARSER.escape(url, /[^\x00-\x7F]/))
      return url if %w[http https].include?(uri.scheme&.downcase) && uri.host && !uri.host.empty?
    end
    fail!("#{post.relative_path}: website.url must be an absolute http:// or https:// URL")
  rescue URI::InvalidURIError
    fail!("#{post.relative_path}: website.url must be an absolute http:// or https:// URL")
  end

  def self.redirect_html(url, title)
    escaped_url = CGI.escapeHTML(url)
    # JSON quoting plus HTML-safe escapes keep URL text inside the script literal.
    script_url = JSON.generate(url).gsub(/[<>&\u2028\u2029]/) { |char| format('\\u%04x', char.ord) }
    <<~HTML
      <!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>#{CGI.escapeHTML(title.to_s)}</title>
          <link rel="canonical" href="#{escaped_url}">
          <meta http-equiv="refresh" content="0;url=#{escaped_url}">
          <script>window.location.replace(#{script_url});</script>
        </head>
        <body><p>正在跳转，若未自动打开，请<a href="#{escaped_url}">访问网页</a>。</p></body>
      </html>
    HTML
  end

  # Exclude projects only while reading, without changing config.exclude (the watcher
  # uses that configuration). Astro front matter must not be parsed as Jekyll YAML.
  Jekyll::Hooks.register :site, :after_reset do |site|
    next if site.instance_variable_defined?(:@website_previous_exclude)
    site.instance_variable_set(:@website_previous_exclude, site.exclude.dup)
    site.exclude = site.exclude + [ROOT]
  end

  # Never publish project sources, even when explicitly included by site config.
  Jekyll::Hooks.register :site, :post_read do |site|
    previous = site.instance_variable_get(:@website_previous_exclude)
    if previous
      site.exclude = previous
      site.remove_instance_variable(:@website_previous_exclude)
    end
    root = File.expand_path(ROOT, site.source) + File::SEPARATOR
    site.pages.reject! { |page| File.expand_path(page.path, site.source).start_with?(root) }
    site.static_files.reject! { |file| File.expand_path(file.path).start_with?(root) }
  end

  class Asset < Jekyll::StaticFile
    def initialize(site, root, relative, target)
      super(site, root, File.dirname(relative), File.basename(relative))
      @target = target
    end

    def destination(dest)
      File.join(dest, @target)
    end

    # A new content-addressed build can have the same timestamp as its predecessor.
    def modified?
      true
    end
  end

  class Builder
    def initialize(site, post)
      @site, @post = site, post
      config = post.data['website']
      config = { 'source' => config } if config.is_a?(String)
      unless config.is_a?(Hash) && (config.keys - %w[source output]).empty?
        WebsitePosts.fail!("#{post.relative_path}: use website: folder or website: {source: folder, output: dist}")
      end
      @slug = config['source']
      unless @slug.is_a?(String) && @slug.match?(/\A[a-zA-Z0-9][a-zA-Z0-9_-]*\z/)
        WebsitePosts.fail!("#{post.relative_path}: website.source must be a single folder name (letters, numbers, - or _)")
      end
      @source = File.join(site.source, ROOT, @slug)
      WebsitePosts.fail!("missing source directory #{ROOT}/#{@slug}") unless File.directory?(@source)
      if File.symlink?(@source) || !File.realpath(@source).start_with?(File.realpath(site.source) + File::SEPARATOR)
        WebsitePosts.fail!("website source must stay inside the site: #{@slug}")
      end
      @output = config.fetch('output', 'dist')
      unless @output.is_a?(String) && @output.match?(/\A[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\z/) && @output != 'node_modules'
        WebsitePosts.fail!("#{@slug}: output must be a relative build directory, e.g. dist or out")
      end
      @npm = File.file?(File.join(@source, 'package.json'))
      WebsitePosts.fail!("#{@slug}: output is only used for npm projects") if !@npm && config.key?('output')
    end

    def files(root, sources: false)
      result = []
      Find.find(root) do |path|
        next if path == root
        relative = Pathname.new(path).relative_path_from(Pathname.new(root)).to_s.tr('\\', '/')
        name = File.basename(path)
        if sources && (%w[.git .DS_Store].include?(name) || name.start_with?('.env') || GENERATED.include?(name) || relative == @output)
          Find.prune if File.directory?(path)
          next
        end
        WebsitePosts.fail!("#{@slug}: symbolic links are not supported: #{relative}") if File.symlink?(path)
        result << relative if File.file?(path)
      end
      result.sort
    end

    def run!(env, *command, directory:)
      Jekyll.logger.info 'Website posts:', "#{@slug}: #{command.join(' ')}"
      output, status = Open3.capture2e(env, *command, chdir: directory)
      WebsitePosts.fail!("#{@slug}: #{command.join(' ')} failed\n#{output}") unless status.success?
      output.strip
    rescue Errno::ENOENT
      WebsitePosts.fail!("#{@slug}: #{command.first} is unavailable; install Node.js and npm")
    end

    def build
      source_files = files(@source, sources: true)
      unless @npm
        WebsitePosts.fail!("#{@slug}: missing index.html") unless source_files.include?('index.html')
        # Build instructions and dependency metadata are never public assets.
        public_files = source_files.reject do |file|
          file.split('/').any? { |part| part.start_with?('.') } ||
            File.basename(file).match?(/\A(?:README(?:\..*)?|package(?:-lock)?\.json)\z/i)
        end
        return [@source, public_files]
      end

      WebsitePosts.fail!("#{@slug}: commit package-lock.json for reproducible npm ci builds") unless source_files.include?('package-lock.json')
      package = JSON.parse(File.read(File.join(@source, 'package.json')))
      WebsitePosts.fail!("#{@slug}: package.json needs scripts.build") unless package.dig('scripts', 'build').is_a?(String)
      npm = Gem.win_platform? ? 'npm.cmd' : 'npm'
      runtime = @site.instance_variable_get(:@website_runtime)
      unless runtime
        runtime = run!({}, 'node', '--version', directory: @source) + run!({}, npm, '--version', directory: @source)
        @site.instance_variable_set(:@website_runtime, runtime)
      end
      metadata = {
        'title' => @post.data['title'], 'summary' => @post.data['summary'],
        'categories' => @post.data['categories'], 'tags' => @post.data['tags'],
        'url' => @post.url, 'baseurl' => @site.baseurl,
        'date' => @post.date.iso8601, 'content' => @post.content
      }
      base_url = "#{@site.baseurl}#{@post.url}"
      fingerprint = Digest::SHA256.new
      fingerprint << File.binread(__FILE__) << runtime << @output << Jekyll.env << JSON.generate(metadata)
      source_files.each { |file| fingerprint << file << "\0" << Digest::SHA256.file(File.join(@source, file)).hexdigest }
      cache = File.expand_path(File.join('.jekyll-cache', 'website-posts', @slug), @site.source)
      FileUtils.mkdir_p(cache)
      # Temporary build trees and dependencies are kept outside assets/post/websites.
      target = File.join(cache, fingerprint.hexdigest)
      return [target, files(target)] if File.file?(File.join(target, 'index.html'))

      workspace = File.join(cache, 'work')
      project = File.join(workspace, 'source')
      FileUtils.mkdir_p(project)
      manifest = File.join(workspace, 'sources.json')
      previous = File.file?(manifest) ? JSON.parse(File.read(manifest)) : []
      (previous - source_files).each do |file|
        path = File.expand_path(file, project)
        WebsitePosts.fail!("invalid cached source path: #{file}") unless path.start_with?(project + File::SEPARATOR)
        File.delete(path) if File.file?(path)
      end
      source_files.each do |file|
        destination = File.join(project, file)
        FileUtils.mkdir_p(File.dirname(destination))
        FileUtils.cp(File.join(@source, file), destination)
      end
      File.write(manifest, JSON.generate(source_files))
      post_file = File.join(workspace, 'post.json')
      File.write(post_file, JSON.pretty_generate(metadata))
      output_dir = File.join(project, @output)
      if File.exist?(output_dir)
        unless !File.symlink?(output_dir) && File.realpath(output_dir).start_with?(File.realpath(project) + File::SEPARATOR)
          WebsitePosts.fail!("build output must stay inside its cache workspace: #{output_dir}")
        end
        FileUtils.remove_entry(output_dir)
      end
      env = {
        'WEBSITE_BASE_URL' => base_url, 'WEBSITE_OUTPUT_DIR' => output_dir,
        'WEBSITE_POST_FILE' => post_file, 'NODE_ENV' => 'production'
      }
      dependencies = Digest::SHA256.new << runtime
      %w[package.json package-lock.json .npmrc].each do |file|
        path = File.join(@source, file)
        dependencies << File.binread(path) if File.file?(path)
      end
      installed = File.join(workspace, 'dependencies.sha256')
      unless File.file?(installed) && File.read(installed) == dependencies.hexdigest && File.directory?(File.join(project, 'node_modules'))
        File.delete(installed) if File.file?(installed)
        run!(env, npm, 'ci', '--include=dev', '--no-audit', '--no-fund', directory: project)
        FileUtils.mkdir_p(File.join(project, 'node_modules'))
        File.write(installed, dependencies.hexdigest)
      end
      run!(env, npm, 'run', 'build', directory: project)
      WebsitePosts.fail!("#{@slug}: build did not create #{@output}/index.html") unless File.file?(File.join(output_dir, 'index.html'))
      unless !File.symlink?(output_dir) && File.realpath(output_dir).start_with?(File.realpath(project) + File::SEPARATOR)
        WebsitePosts.fail!("#{@slug}: build output must stay inside its cache workspace")
      end
      built_files = files(output_dir)
      # Publish cache entries atomically: failed copies can never become cache hits.
      Dir.mktmpdir('result-', cache) do |temporary|
        staging = File.join(temporary, 'output')
        FileUtils.mkdir_p(staging)
        built_files.each do |file|
          destination = File.join(staging, file)
          FileUtils.mkdir_p(File.dirname(destination))
          FileUtils.cp(File.join(output_dir, file), destination)
        end
        # Both resolved paths are confined to this project's ignored cache directory.
        unless File.realpath(staging).start_with?(File.realpath(cache) + File::SEPARATOR) && File.dirname(File.expand_path(target)) == File.expand_path(cache)
          WebsitePosts.fail!('cache paths must stay inside the website cache')
        end
        File.rename(staging, target)
      end
      [target, files(target)]
    rescue JSON::ParserError => error
      WebsitePosts.fail!("#{@slug}: invalid package.json: #{error.message}")
    end
  end

  class Generator < Jekyll::Generator
    priority :lowest

    def generate(site)
      site.instance_variable_set(:@website_post_outputs, {})
      occupied = (site.pages + site.static_files + site.documents).to_h { |item| [item.destination(site.dest), item] }
      site.posts.docs.each do |post|
        next unless post.data.key?('website')
        post.data['layout'] = nil
        # The webpage's sources are external to the Markdown document. Re-render its
        # small metadata body even under --incremental; the expensive build is cached.
        post.data['regenerate'] = true
        if post.data['draft'] && Jekyll.env == 'production'
          url = CGI.escapeHTML("#{site.baseurl}/404.html")
          html = "<!doctype html><html><head><meta name=\"robots\" content=\"noindex\"><meta http-equiv=\"refresh\" content=\"0;url=#{url}\"></head><body><a href=\"#{url}\">404</a></body></html>"
        elsif (url = WebsitePosts.external_url(post))
          html = WebsitePosts.redirect_html(url, post.data['title'])
        else
          WebsitePosts.fail!("#{post.relative_path}: local website posts need a permalink ending in /") unless post.url.end_with?('/')
          root, files = Builder.new(site, post).build
          html = File.read(File.join(root, 'index.html'), encoding: 'UTF-8')
          post_dir = Pathname.new(File.dirname(post.destination(site.dest))).relative_path_from(Pathname.new(site.dest)).to_s
          files.each do |file|
            next if file == 'index.html'
            asset = Asset.new(site, root, file, File.join(post_dir, file))
            destination = asset.destination(site.dest)
            WebsitePosts.fail!("#{post.relative_path}: asset conflicts with another page: #{destination}") if occupied.key?(destination)
            occupied[destination] = asset
            site.static_files << asset
          end
        end
        site.instance_variable_get(:@website_post_outputs)[post] = html
      end
    end
  end

  # Replace only the written document, after the blog's HTML enhancement hooks.
  # post.content remains rendered Markdown for RSS/search; website HTML stays byte-for-byte intact.
  Jekyll::Hooks.register :site, :post_render do |site|
    (site.instance_variable_get(:@website_post_outputs) || {}).each do |post, html|
      post.output = html
    end
  end
end
