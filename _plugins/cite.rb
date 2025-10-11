require 'liquid'
require 'uri'
require 'net/http'
require 'nokogiri'

module Jekyll
  class CiteTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      params = parse_params(@markup)

      unless params['url']
        raise "cite requires a URL parameter"
      end

      url = params['url']
      title = params['title'] || get_website_title(url)
      favicon_url = params['favicon'] || get_favicon_url(url)

      content = super.strip

      html = generate_cite_html(url, title, favicon_url, content)

      "\n\n<div class=\"cite-wrapper\">#{html}</div>\n\n"
    end

    private

    def parse_params(markup)
      params = {}

      # 首先提取 URL（第一个参数）
      if markup.match(/^(https?:\/\/[^\s]+)/)
        params['url'] = $1
        remaining = markup.sub(/^https?:\/\/[^\s]+\s*/, '')

        # 解析其他参数
        remaining.scan(/(\w+)=["']?([^"'\s]+)["']?/) do |key, value|
          params[key] = value
        end
      end

      params
    end

    def get_website_title(url)
      begin
        uri = URI.parse(url)
        domain = uri.host

        # 尝试获取网页标题
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = (uri.scheme == 'https')
        http.open_timeout = 5
        http.read_timeout = 5

        request = Net::HTTP::Get.new(uri.request_uri)
        request['User-Agent'] = 'Mozilla/5.0 (compatible; Jekyll cite)'

        response = http.request(request)

        if response.code == '200'
          doc = Nokogiri::HTML(response.body)
          title_tag = doc.at('title')
          if title_tag && !title_tag.text.strip.empty?
            return title_tag.text.strip
          end
        end

        # 如果无法获取标题，返回域名
        return domain
      rescue => e
        # 出错时返回域名
        begin
          return URI.parse(url).host
        rescue
          return 'Unknown Site'
        end
      end
    end

    def get_favicon_url(url)
      begin
        uri = URI.parse(url)
        base_url = "#{uri.scheme}://#{uri.host}"

        # 尝试常见的 favicon 路径
        favicon_paths = [
          '/favicon.ico',
          '/favicon.png',
          '/apple-touch-icon.png',
          '/assets/favicon.ico',
          '/assets/images/favicon.ico',
          '/static/favicon.ico',
          '/static/images/favicon.ico',
        ]

        # 先尝试从页面获取 favicon 链接
        begin
          http = Net::HTTP.new(uri.host, uri.port)
          http.use_ssl = (uri.scheme == 'https')
          http.open_timeout = 3
          http.read_timeout = 3

          request = Net::HTTP::Get.new(uri.request_uri)
          request['User-Agent'] = 'Mozilla/5.0 (compatible; Jekyll cite)'

          response = http.request(request)

          if response.code == '200'
            doc = Nokogiri::HTML(response.body)

            # 查找 favicon 链接
            favicon_link = doc.at('link[rel*="icon"]')
            if favicon_link && favicon_link['href']
              href = favicon_link['href']
              if href.start_with?('http')
                return href
              elsif href.start_with?('//')
                return "#{uri.scheme}:#{href}"
              elsif href.start_with?('/')
                return "#{base_url}#{href}"
              else
                return "#{base_url}/#{href}"
              end
            end
          end
        rescue
          # 继续尝试默认路径
        end

        # 如果页面中没有找到，尝试常见路径
        favicon_paths.each do |path|
          favicon_url = "#{base_url}#{path}"
          if check_url_exists(favicon_url)
            return favicon_url
          end
        end

        # 使用 Google 的 favicon 服务作为备选
        return "https://www.google.com/s2/favicons?domain=#{uri.host}&sz=16"

      rescue => e
        # 出错时使用默认图标
        return "/assets/img/link-icon.svg"
      end
    end

    def check_url_exists(url)
      begin
        uri = URI.parse(url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = (uri.scheme == 'https')
        http.open_timeout = 2
        http.read_timeout = 2

        request = Net::HTTP::Head.new(uri.request_uri)
        response = http.request(request)

        return response.code.start_with?('2')
      rescue
        return false
      end
    end

    def generate_cite_html(url, title, favicon_url, content)
      domain = URI.parse(url).host rescue 'unknown'

      <<~HTML
        <div class="cite__header">
          <div class="cite__favicon-wrapper">
            <img src="#{favicon_url}" alt="#{title}" class="cite__favicon no-select" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
            <img src="/assets/img/link-icon.svg" alt="#{title}" class="cite__favicon cite__favicon--fallback no-select" style="display: none;">
          </div>
          <div class="cite__info">
            <strong class="cite__info-title">#{title}</strong>
            <br>
            <span class="cite__info-domain">#{domain}</span>
          </div>
          <a href="#{url}" class="cite__link no-select" target="_blank" rel="noopener noreferrer">
            <span class="cite__link-icon material-symbols-outlined">open_in_new</span>
          </a>
        </div>

        <div class="cite__content" markdown="1">

          #{content}

        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag('cite', Jekyll::CiteTag)
