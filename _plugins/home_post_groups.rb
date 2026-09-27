module HomePostGroups
  # Input is Jekyll's newest-first post list. Hidden posts do not split a batch.
  def home_post_groups(posts, production = true)
    groups = []
    posts.each do |post|
      next if post['archived'] || (production && post['draft'])

      series = post['series']
      if series.is_a?(String) && !series.strip.empty? && groups.last&.first&.[]('series') == series
        groups.last << post
      else
        groups << [post]
      end
    end
    groups
  end
end

Liquid::Template.register_filter(HomePostGroups)
