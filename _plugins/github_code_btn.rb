require 'liquid'
require 'uri'

module Jekyll
  class GitHubCodeBtnTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      unless params['url']
        raise "GitHub code button requires 'url' parameter"
      end

      url = params['url']
      path = params['path'] || extract_path_from_url(url)
      lines = params['lines'] || extract_lines_from_url(url)

      html = generate_button_html(url, path, lines)

      "\n\n<div class=\"github-code-btn-wrapper\">#{html}</div>\n\n"
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

    def generate_button_html(url, path, lines)
      lines_html = lines ? "<div class=\"line-number\">#{lines}</div>" : ""

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

      html.gsub(/>\s+</, '><').gsub(/\s+/, ' ')
    end
  end
end

Liquid::Template.register_tag('github_code_btn', Jekyll::GitHubCodeBtnTag)
