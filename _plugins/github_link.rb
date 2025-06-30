require 'liquid'
require 'uri'

module Jekyll
  class GitHubLinkTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      unless params['url']
        raise "GitHub link requires 'url' parameter"
      end

      url = params['url']
      type = params['type'] || detect_type_from_url(url)
      name = params['name'] || extract_name_from_url(url)
      avatar_url = params['avatar'] || generate_avatar_url(url, type)

      generate_link_html(url, name, avatar_url, type)
    end

    private

    def parse_params(markup)
      params = {}

      if markup.include?('=')
        markup.scan(/(\w+)=["']([^"']+)["']/) do |key, value|
          params[key] = value
        end
      else
        params['url'] = markup.strip
      end

      params
    end

    def detect_type_from_url(url)
      uri = URI.parse(url)
      path_parts = uri.path.split('/').reject(&:empty?)

      if path_parts.length == 1
        'user'
      elsif path_parts.length >= 2
        'repo'
      else
        'user'
      end
    end

    def extract_name_from_url(url)
      uri = URI.parse(url)
      path_parts = uri.path.split('/').reject(&:empty?)

      case detect_type_from_url(url)
      when 'user'
        path_parts[0] || 'GitHub User'
      when 'repo'
        if path_parts.length >= 2
          "#{path_parts[0]}/#{path_parts[1]}"
        else
          path_parts[0] || 'GitHub Repo'
        end
      else
        'GitHub'
      end
    end

    def generate_avatar_url(url, type)
      uri = URI.parse(url)
      path_parts = uri.path.split('/').reject(&:empty?)

      case type
      when 'user'
        username = path_parts[0]
        username ? "https://github.com/#{username}.png?size=32" : nil
      when 'repo'
        username = path_parts[0]
        username ? "https://github.com/#{username}.png?size=32" : nil
      else
        nil
      end
    end

    def generate_link_html(url, name, avatar_url, type)
      fallback_icon_src = case type
      when 'user'
        '/assets/img/github-user-icon.svg'
      when 'repo'
        '/assets/img/github-repo-icon.svg'
      else
        '/assets/img/github-default-icon.svg'
      end

      avatar_html = if avatar_url
        "<span class=\"github-link-avatar-wrapper\"><img src=\"#{avatar_url}\" alt=\"#{name}\" class=\"github-link-avatar no-select\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='inline-block';\"><img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link-fallback no-select\" style=\"display: none;\"></span>"
      else
        "<img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link-icon no-select\">"
      end

      html = "<a href=\"#{url}\" class=\"github-link github-link-#{type}\" target=\"_blank\" rel=\"noopener noreferrer\">#{avatar_html}<span class=\"github-link-name\">#{name}</span></a>"

      html
    end
  end
end

Liquid::Template.register_tag('github_link', Jekyll::GitHubLinkTag)
