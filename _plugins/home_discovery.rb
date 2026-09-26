require 'set'

# Build discovery entry points from the same published documents as home.
module HomeDiscovery
  def self.experiment?(post)
    return false if post.data['experiment'] == false
    tags = post.data['tags']
    tags = tags.is_a?(String) ? tags.split : Array(tags)
    post.data['experiment'] == true || tags.include?('实验') ||
      post.content.match?(/\{%-?\s*(?:result|code_runner(?:_empty)?|iframe)\b/)
  end

  def self.tag_experiments(posts)
    posts.each do |post|
      post.data['has_experiment'] = experiment?(post)
      next unless post.data['has_experiment']
      tags = post.data['tags']
      tags = tags.is_a?(String) ? tags.split : Array(tags)
      post.data['tags'] = (tags + ['实验']).uniq
    end
  end

  def self.build(posts, now: Time.now, production: true)
    visible = posts.reject do |post|
      post.data['archived'] || (production && post.data['draft']) || post.date > now
    end.sort_by { |post| [-post.date.to_i, post.url] }

    seen_covers = Set.new
    seen_series = Set.new
    gallery = visible.filter_map do |post|
      cover = post.data['cover_image']
      series = post.data['series']
      next if !cover || File.basename(cover) == 'default.webp' || seen_covers.include?(cover)
      next if series && seen_series.include?(series)
      seen_covers.add(cover)
      seen_series.add(series) if series
      { 'post' => post }
    end
    { 'gallery' => gallery }
  end

  if defined?(Jekyll::Generator)
    # Run before archive generators collect tags, so the tag page, search index,
    # article header and all listing cards agree on the same classification.
    Jekyll::Hooks.register :site, :post_read do |site|
      HomeDiscovery.tag_experiments(site.posts.docs)
    end

    class Generator < Jekyll::Generator
      safe true
      priority :low

      def generate(site)
        site.data['home_discovery'] = HomeDiscovery.build(site.posts.docs, now: site.time, production: Jekyll.env == 'production')
      end
    end
  end
end
