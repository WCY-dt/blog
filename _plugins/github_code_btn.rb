require 'liquid'
require 'uri'

module Jekyll
  class GitHubCodeBtnTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      # 解析参数
      params = parse_params(@markup)

      # 验证必需参数
      unless params['url']
        raise "GitHub code button requires 'url' parameter"
      end

      # 提取信息
      url = params['url']
      path = params['path'] || extract_path_from_url(url)
      lines = params['lines'] || extract_lines_from_url(url)

      # 生成按钮 HTML，并包装在 div 中以避免 Markdown 解析问题
      html = generate_button_html(url, path, lines)

      # 将 HTML 包装在一个容器中，并在前后添加空行
      "\n\n<div class=\"github-code-btn-wrapper\">#{html}</div>\n\n"
    end

    private

    def parse_params(markup)
      params = {}

      # 支持多种参数格式
      # 简单格式：{% github_code_btn https://github.com/... %}
      # 完整格式：{% github_code_btn url="https://github.com/..." path="src/main.c" lines="L10-L20" %}

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

    def extract_path_from_url(url)
      # 从 GitHub URL 中提取文件路径，包含仓库名
      # 例如：https://github.com/user/repo/blob/main/src/main.c#L10-L20
      uri = URI.parse(url)
      path_parts = uri.path.split('/')

      if path_parts.length >= 5 && path_parts[3] == 'blob'
        # 提取仓库名（path_parts[2]）和文件路径（path_parts[5..-1]）
        repo_name = path_parts[2]
        file_path = path_parts[5..-1].join('/')
        return "#{repo_name}/#{file_path}"
      end

      # 如果无法提取，返回默认值
      'source code'
    end

    def extract_lines_from_url(url)
      # 从 URL 的 fragment 中提取行号
      uri = URI.parse(url)
      fragment = uri.fragment

      if fragment && fragment.match(/^L(\d+)(-L(\d+))?$/)
        if $3  # 范围
          "L#{$1}-L#{$3}"
        else   # 单行
          "L#{$1}"
        end
      else
        nil
      end
    end

    def generate_button_html(url, path, lines)
      # 生成紧凑的单行 HTML 以避免 Markdown 解析问题
      lines_html = lines ? "<div class=\"line-number\">#{lines}</div>" : ""

      # 构建完整的按钮 HTML
      html = <<~HTML.strip
        <a href="#{url}" class="github-code-btn" target="_blank" rel="noopener noreferrer">
          <div class="github-icon no-select">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <use href="/assets/img/github.svg#github"></use>
            </svg>
          </div>
          <div class="github-info">
            <div class="file-path">#{path}</div>
            #{lines_html}
          </div>
        </a>
      HTML

      # 将多行 HTML 转换为紧凑的单行格式
      html.gsub(/>\s+</, '><').gsub(/\s+/, ' ')
    end
  end
end

Liquid::Template.register_tag('github_code_btn', Jekyll::GitHubCodeBtnTag)
