require 'liquid'
require 'uri'

module Jekyll
  class GitHubLinkTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      # 解析参数
      params = parse_params(@markup)

      # 验证必需参数
      unless params['url']
        raise "GitHub link requires 'url' parameter"
      end

      url = params['url']
      type = params['type'] || detect_type_from_url(url)
      name = params['name'] || extract_name_from_url(url)
      avatar_url = params['avatar'] || generate_avatar_url(url, type)

      # 生成行内链接 HTML
      generate_link_html(url, name, avatar_url, type)
    end

    private

    def parse_params(markup)
      params = {}

      # 支持多种参数格式
      # 简单格式：{% github_link https://github.com/username %}
      # 完整格式：{% github_link url="https://github.com/username" type="user" name="Display Name" %}

      if markup.include?('=')
        # 键值对格式
        markup.scan(/(\w+)=["']([^"']+)["']/) do |key, value|
          params[key] = value
        end
      else
        # 简单格式，只有 URL
        params['url'] = markup.strip
      end

      params
    end

    def detect_type_from_url(url)
      # 从URL检测是用户还是仓库
      uri = URI.parse(url)
      path_parts = uri.path.split('/').reject(&:empty?)

      if path_parts.length == 1
        # https://github.com/username
        'user'
      elsif path_parts.length >= 2
        # https://github.com/username/repository
        'repo'
      else
        'user' # 默认为用户
      end
    end

    def extract_name_from_url(url)
      # 从URL提取显示名称
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
      # 生成头像URL
      uri = URI.parse(url)
      path_parts = uri.path.split('/').reject(&:empty?)

      case type
      when 'user'
        username = path_parts[0]
        username ? "https://github.com/#{username}.png?size=32" : nil
      when 'repo'
        # 对于仓库，使用仓库拥有者的头像
        username = path_parts[0]
        username ? "https://github.com/#{username}.png?size=32" : nil
      else
        nil
      end
    end

    def generate_link_html(url, name, avatar_url, type)
      # 构建头像部分
      avatar_html = if avatar_url
        "<img src=\"#{avatar_url}\" alt=\"#{name}\" class=\"github-link-avatar\">"
      else
        # 使用SVG图标作为备选
        icon_svg = case type
        when 'user'
          '<svg width="16" height="16" viewBox="0 0 16 16" class="github-link-icon"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'
        when 'repo'
          '<svg width="16" height="16" viewBox="0 0 16 16" class="github-link-icon"><path fill="currentColor" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>'
        else
          '<svg width="16" height="16" viewBox="0 0 16 16" class="github-link-icon"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'
        end
        icon_svg
      end

      # 构建完整的链接HTML（行内小药丸样式）
      html = "<a href=\"#{url}\" class=\"github-link github-link-#{type}\" target=\"_blank\" rel=\"noopener noreferrer\">#{avatar_html}<span class=\"github-link-name\">#{name}</span></a>"

      # 返回HTML，不需要额外的换行，因为这是行内元素
      html
    end
  end
end

Liquid::Template.register_tag('github_link', Jekyll::GitHubLinkTag)
