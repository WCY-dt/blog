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
      comment_date = params['date'] || extract_date_from_url(url)
      repo_name = params['repo'] || extract_repo_from_url(url)
      issue_number = params['issue'] || extract_issue_number_from_url(url)

      # 获取内容（来自块内容）
      content = super.strip

      # 生成issue展示HTML
      html = generate_issue_html(url, username, avatar_url, comment_date, repo_name, issue_number, content)

      # 包装在容器中
      "\n\n#{html}\n\n"
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

    def extract_date_from_url(url)
      # 简化处理，可以根据需要扩展
      if url.include?('issuecomment')
        'commented'
      else
        'posted'
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

    def generate_issue_html(url, username, avatar_url, comment_date, repo_name, issue_number, content)
      <<~HTML
        <div style="border: 1px solid #d1d9e0; border-radius: 0.5rem; overflow: hidden;" markdown="1">
        <div style="background-color: #f6f8fa; padding: 1rem; border-bottom: 1px solid #e1e4e8;">
        <div style="display: flex; align-items: center;">
        <img src="#{avatar_url}" alt="#{username}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 0.5rem;">
        <div style="flex: 1;">
        <strong><a href="https://github.com/#{username}">@#{username}</a> #{comment_date} <a href="#{url}">#{extract_formatted_date(url)}</a></strong>
        <br>
        <span style="font-size: 0.75rem; color: #656d76;">in <a href="https://github.com/#{repo_name}" style="color: #656d76;">#{repo_name}</a> · <a href="#{url}" style="color: #656d76;">#{issue_number}</a></span>
        </div>
        <a href="#{url}" style="color: #656d76; text-decoration: none; margin-left: 0.5rem;" title="查看原文">🔗</a>
        </div>
        </div>

        <div style="background-color: #ffffff; padding: 0 1rem;" markdown="1">

        #{content}

        </div>

        </div>
      HTML
    end

    def extract_formatted_date(url)
      # 可以根据URL或其他信息提取更准确的日期
      # 这里简化处理
      if url.include?('828503689')
        'on Apr 28, 2021'
      else
        'recently'
      end
    end
  end
end

Liquid::Template.register_tag('github_issue', Jekyll::GitHubIssueTag)
