require 'liquid'
require 'uri'

module Jekyll
  class GitHubIssueTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      unless params['url']
        raise "GitHub issue requires 'url' parameter"
      end

      url = params['url']
      username = params['username'] || extract_username_from_url(url) || 'unknown'
      avatar_url = params['avatar'] || get_default_avatar(username)
      repo_name = params['repo'] || extract_repo_from_url(url)
      issue_number = params['issue'] || extract_issue_number_from_url(url)

      content = super.strip

      html = generate_issue_html(url, username, avatar_url, repo_name, issue_number, content)

      "\n\n<div class=\"github-issue-wrapper\">#{html}</div>\n\n"
    end

    private

    def parse_params(markup)
      params = {}

      if markup.match(/^(https?:\/\/[^\s]+)/)
        params['url'] = $1
        remaining = markup.sub(/^https?:\/\/[^\s]+\s*/, '')

        remaining.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end
      elsif markup.include?('=')
        markup.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end
      else
        params['url'] = markup.strip
      end

      params
    end

    def extract_username_from_url(url)
      if url.include?('issuecomment-')
        return nil
      elsif url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        return $1
      end
      nil
    end

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

    def extract_repo_from_url(url)
      if url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        return "#{$1}/#{$2}"
      end
      'unknown/repo'
    end

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

Liquid::Template.register_tag('github_issue', Jekyll::GitHubIssueTag)
