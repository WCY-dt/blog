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

      # First, extract the URL (the first parameter)
      if markup.match(/^(https?:\/\/[^\s]+)/)
        params['url'] = $1
        remaining = markup.sub(/^https?:\/\/[^\s]+\s*/, '')

        # Parse other parameters
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

        # Attempt to fetch the webpage title
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

        # If the title cannot be fetched, return the domain name
        return domain
      rescue
        # On error, return the domain name
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

        # Attempt common favicon paths
        favicon_paths = [
          '/favicon.ico',
          '/favicon.png',
          '/apple-touch-icon.png',
          '/assets/favicon.ico',
          '/assets/images/favicon.ico',
          '/static/favicon.ico',
          '/static/images/favicon.ico',
        ]

        # First, try to fetch the favicon link from the page
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

            # Look for the favicon link
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
          # Continue trying default paths
        end

        # If not found on the page, try common paths
        favicon_paths.each do |path|
          favicon_url = "#{base_url}#{path}"
          if check_url_exists(favicon_url)
            return favicon_url
          end
        end

        # Use Google's favicon service as a fallback
        return "https://www.google.com/s2/favicons?domain=#{uri.host}&sz=16"

      rescue
        # On error, use the default icon
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
