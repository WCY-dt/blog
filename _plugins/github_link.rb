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
      # 生成备用SVG图标路径
      fallback_icon_src = case type
      when 'user'
        '/assets/img/github-user-icon.svg'
      when 'repo'
        '/assets/img/github-repo-icon.svg'
      else
        '/assets/img/github-default-icon.svg'
      end

      # 构建头像部分，包含失败时的备用方案
      avatar_html = if avatar_url
        # 使用优雅的JavaScript备用方案，加载失败时显示SVG文件
        "<span class=\"github-link-avatar-wrapper\"><img src=\"#{avatar_url}\" alt=\"#{name}\" class=\"github-link-avatar no-select\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='inline-block';\"><img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link-fallback no-select\" style=\"display: none;\"></span>"
      else
        # 直接使用SVG图标文件
        "<img src=\"#{fallback_icon_src}\" alt=\"#{name}\" class=\"github-link-icon no-select\">"
      end

      # 构建完整的链接HTML（行内小药丸样式）
      html = "<a href=\"#{url}\" class=\"github-link github-link-#{type}\" target=\"_blank\" rel=\"noopener noreferrer\">#{avatar_html}<span class=\"github-link-name\">#{name}</span></a>"

      # 返回HTML，不需要额外的换行，因为这是行内元素
      html
    end
  end
end

Liquid::Template.register_tag('github_link', Jekyll::GitHubLinkTag)
