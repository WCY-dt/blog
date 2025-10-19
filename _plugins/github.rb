require 'liquid'
require 'uri'

module Jekyll
  # Tag to generate a GitHub code button
  class GitHubCodeBtnTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      # Ensure the 'url' parameter is provided
      unless params['url']
        raise "GitHub code button requires 'url' parameter"
      end

      url = params['url']
      path = params['path'] || extract_path_from_url(url) # Extract file path from URL if not provided
      lines = params['lines'] || extract_lines_from_url(url) # Extract line numbers from URL if not provided

      html = generate_button_html(url, path, lines)

      "\n\n<div class=\"github-code-btn-wrapper\">#{html}</div>\n\n"
    end

    private

    # Parse parameters from the tag markup
    def parse_params(markup)
      params = {}

      if markup.include?('=')
        markup.scan(/(\w+)=["']([^"']+)["']/) do |key, value|
          params[key] = value
        end

        unless params['url']
          url_match = markup.match(/^(https?:\/\/[^\s]+)/)
          if url_match
            params['url'] = url_match[1]
          end
        end
      else
        params['url'] = markup.strip
      end

      params
    end

    # Extract the file path from the GitHub URL
    def extract_path_from_url(url)
      uri = URI.parse(url)
      path_parts = uri.path.split('/')

      if path_parts.length >= 5 && path_parts[3] == 'blob'
        repo_name = path_parts[2]
        file_path = path_parts[5..-1].join('/')
        return "#{repo_name}/#{file_path}"
      end

      'source code'
    end

    # Extract line numbers from the GitHub URL fragment
    def extract_lines_from_url(url)
      uri = URI.parse(url)
      fragment = uri.fragment

      if fragment && fragment.match(/^L(\d+)(-L(\d+))?$/)
        if $3
          "L#{$1}-L#{$3}"
        else
          "L#{$1}"
        end
      else
        nil
      end
    end

    # Generate the HTML for the GitHub code button
    def generate_button_html(url, path, lines)
      lines_html = lines ? "<div class=\"github-code-btn__line-number\">#{lines}</div>" : ""

      html = <<~HTML.strip
        <a href="#{url}" class="github-code-btn__btn" target="_blank" rel="noopener noreferrer">
          <div class="github-code-btn__icon no-select">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <use href="/assets/img/github.svg#github"></use>
            </svg>
          </div>
          <div class="github-code-btn__info">
            <div class="github-code-btn__file-path">#{path}</div>
            #{lines_html}
          </div>
        </a>
      HTML

      html.gsub(/>\s+</, '><').gsub(/\s+/, ' ')
    end
  end

  # Tag to generate a GitHub link with an avatar
  class GitHubLinkTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      # Ensure the 'url' parameter is provided
      unless params['url']
        raise "GitHub link requires 'url' parameter"
      end

      url = params['url']
      type = params['type'] || detect_type_from_url(url) # Detect the type (user or repo) from the URL
      name = params['name'] || extract_name_from_url(url) # Extract the name from the URL
      avatar_url = params['avatar'] || generate_avatar_url(url, type) # Generate the avatar URL

      generate_link_html(url, name, avatar_url, type)
    end

    private

    # Parse parameters from the tag markup
    def parse_params(markup)
      params = {}

      if markup.include?('=')
        markup.scan(/(\w+)=["']([^"']+)["']/) do |key, value|
          params[key] = value
        end

        unless params['url']
          url_match = markup.match(/^(https?:\/\/[^\s]+)/)
          if url_match
            params['url'] = url_match[1]
          end
        end
      else
        params['url'] = markup.strip
      end

      params
    end

    # Detect the type (user or repo) from the GitHub URL
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

    # Extract the name (user or repo) from the GitHub URL
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

    # Generate the avatar URL based on the type
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

    # Generate the HTML for the GitHub link
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
        "<span class=\"github-link__avatar-wrapper\"><img src=\"#{avatar_url}\" alt=\"#{name}\" class=\"github-link__avatar github-link__avatar--avatar no-select\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='inline-block';\"><img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link__avatar github-link__avatar--fallback no-select\" style=\"display: none;\"></span>"
      else
        "<img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link__avatar github-link__avatar--icon no-select\">"
      end

      html = "<a href=\"#{url}\" class=\"github-link github-link--#{type}\" target=\"_blank\" rel=\"noopener noreferrer\">#{avatar_html}<span class=\"github-link__name\">#{name}</span></a>"

      html
    end
  end

  # Tag to generate a GitHub issue block
  class GitHubIssueTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      # Ensure the 'url' parameter is provided
      unless params['url']
        raise "GitHub issue requires 'url' parameter"
      end

      url = params['url']
      username = params['username'] || extract_username_from_url(url) || 'unknown' # Extract username from URL
      avatar_url = params['avatar'] || get_default_avatar(username) # Get default avatar if not provided
      repo_name = params['repo'] || extract_repo_from_url(url) # Extract repository name from URL
      issue_number = params['issue'] || extract_issue_number_from_url(url) # Extract issue number from URL

      content = super.strip

      html = generate_issue_html(url, username, avatar_url, repo_name, issue_number, content)

      "\n\n<div class=\"github-issue-wrapper\">#{html}</div>\n\n"
    end

    private

    # Parse parameters from the tag markup
    def parse_params(markup)
      params = {}

      if markup.include?('=')
        markup.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end

        unless params['url']
          url_match = markup.match(/^(https?:\/\/[^\s]+)/)
          if url_match
            params['url'] = url_match[1]
          end
        end
      else
        params['url'] = markup.strip
      end

      params
    end

    # Extract the username from the GitHub URL
    def extract_username_from_url(url)
      if url.include?('issuecomment-')
        return nil
      elsif url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        return $1
      end
      nil
    end

    # Get the default avatar URL for a username
    def get_default_avatar(username)
      avatars = {
        'rsc' => 'https://avatars.githubusercontent.com/u/104030?v=4'
      }

      if username == 'unknown'
        'https://github.com/github.png'
      else
        avatars[username] || "https://github.com/#{username}.png"
      end
    end

    # Extract the repository name from the GitHub URL
    def extract_repo_from_url(url)
      if url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        return "#{$1}/#{$2}"
      end
      'unknown/repo'
    end

    # Extract the issue number from the GitHub URL
    def extract_issue_number_from_url(url)
      if url.match(/\/issues\/(\d+)/)
        return "issue ##{$1}"
      elsif url.match(/\/discussions\/(\d+)/)
        return "discussion ##{$1}"
      elsif url.match(/\/pull\/(\d+)/)
        return "pull ##{$1}"
      end
      'post'
    end

    # Generate the HTML for the GitHub issue block
    def generate_issue_html(url, username, avatar_url, repo_name, issue_number, content)
      avatar_html = if avatar_url
        "<span class=\"github-issue__avatar-wrapper\"><img src=\"#{avatar_url}\" alt=\"#{username}\" class=\"github-issue__avatar github-issue__avatar--avater no-select\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='inline-block';\"><img src=\"/assets/img/github-user-icon.svg\" alt=\"#{username}\" class=\"github-issue__avatar github-issue__avatar--fallback no-select\" style=\"display: none;\"></span>"
      else
        "<img src=\"/assets/img/github-user-icon.svg\" alt=\"#{username}\" class=\"github-issue__avatar github-issue__avatar--icon no-select\">"
      end

      <<~HTML
        <div class="github-issue__header">
          #{avatar_html}
          <div class="github-issue__info">
            <strong><a href="https://github.com/#{username}">@#{username}</a></strong>
            <br>
            <span class="github-issue__info-meta">in <a href="https://github.com/#{repo_name}" class="github-issue__info-meta-link">#{repo_name}</a> · <a href="#{url}" class="github-issue__info-meta-link">#{issue_number}</a></span>
          </div>
          <a href="#{url}" class="github-issue__link no-select"><span class="github-issue__link-icon material-symbols-outlined">open_in_new</span></a>
        </div>

        <div class="github-issue__content" markdown="1">

          #{content}

        </div>
      HTML
    end
  end
end

# Register the custom Liquid tags
Liquid::Template.register_tag('github_code_btn', Jekyll::GitHubCodeBtnTag)
Liquid::Template.register_tag('github_link', Jekyll::GitHubLinkTag)
Liquid::Template.register_tag('github_issue', Jekyll::GitHubIssueTag)
