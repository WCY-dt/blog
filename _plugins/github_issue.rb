require 'liquid'
require 'uri'

module Jekyll
  class GitHubIssueTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      # 解析参数
      params = parse_params(@markup)

      # 验证必需参数
      unless params['url']
        raise "GitHub issue requires 'url' parameter"
      end

      # 提取信息
      url = params['url']
      username = params['username'] || extract_username_from_url(url) || 'unknown'
      avatar_url = params['avatar'] || get_default_avatar(username)
      repo_name = params['repo'] || extract_repo_from_url(url)
      issue_number = params['issue'] || extract_issue_number_from_url(url)

      # 获取内容（来自块内容）
      content = super.strip

      # 生成issue展示HTML
      html = generate_issue_html(url, username, avatar_url, repo_name, issue_number, content)

      # 包装在容器中
      "\n\n<div class=\"github-issue-wrapper\">#{html}</div>\n\n"
    end

    private

    def parse_params(markup)
      params = {}

      # 首先尝试提取URL（可能是第一个参数）
      if markup.match(/^(https?:\/\/[^\s]+)/)
        params['url'] = $1
        # 移除已处理的URL，处理剩余参数
        remaining = markup.sub(/^https?:\/\/[^\s]+\s*/, '')

        # 处理剩余的键值对参数
        remaining.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end
      elsif markup.include?('=')
        # 纯键值对格式
        markup.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end
      else
        # 简单格式，只有 URL
        params['url'] = markup.strip
      end

      params
    end

    def extract_username_from_url(url)
      # 对于issue评论，无法从URL直接获取评论者用户名
      # 这里需要通过参数明确指定或者使用默认值
      if url.include?('issuecomment-')
        # 如果是评论URL，返回nil让调用者知道需要手动指定
        return nil
      elsif url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        # 如果是普通issue URL，可能是issue创建者，但也不一定准确
        return $1
      end
      nil
    end

    def get_default_avatar(username)
      # 一些常见用户的头像URL映射
      avatars = {
        'rsc' => 'https://avatars.githubusercontent.com/u/104030?v=4'
      }

      if username == 'unknown'
        'https://github.com/github.png'  # GitHub默认头像
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
      # 生成头像HTML，包含失败时的备用方案
      avatar_html = if avatar_url
        "<span class=\"github-issue-avatar-wrapper\"><img src=\"#{avatar_url}\" alt=\"#{username}\" class=\"github-issue-avatar no-select\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='inline-block';\"><img src=\"/assets/img/github-user-icon.svg\" alt=\"#{username}\" class=\"github-issue-avatar-fallback no-select\" style=\"display: none;\"></span>"
      else
        "<img src=\"/assets/img/github-user-icon.svg\" alt=\"#{username}\" class=\"github-issue-avatar no-select\">"
      end

      <<~HTML
        <div class="github-issue" markdown="1">
        <div class="github-issue-header">
        <div class="github-issue-user">
        #{avatar_html}
        <div class="github-issue-info">
        <strong><a href="https://github.com/#{username}">@#{username}</a></strong>
        <br>
        <span class="github-issue-meta">in <a href="https://github.com/#{repo_name}">#{repo_name}</a> · <a href="#{url}">#{issue_number}</a></span>
        </div>
        <a href="#{url}" class="github-issue-link no-select" title="查看原文"><span class="material-symbols-outlined">open_in_new</span></a>
        </div>
        </div>

        <div class="github-issue-content" markdown="1">

        #{content}

        </div>

        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag('github_issue', Jekyll::GitHubIssueTag)
