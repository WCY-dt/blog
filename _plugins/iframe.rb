require 'liquid'
require 'pathname'
require 'cgi'

module Jekyll
  class IframeTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      # Parse parameters: iframe_name [key1=value1] [key2=value2] ...
      parts = markup.strip.split(/\s+/)
      @iframe_name = parts[0]
      @params = {}

      # Parse all key=value pairs
      parts[1..-1].each do |part|
        if part.include?('=')
          key, value = part.split('=', 2)
          @params[key] = value
        end
      end

      # Extract known parameters
      @height = @params.delete('height')
      @is_embedded = (@params.delete('is_embedded') == 'true')
      @hide_header = if @params.has_key?('hide_header')
        (@params.delete('hide_header') == 'true')
      else
        @is_embedded
      end
    end

    def render(context)
      site = context.registers[:site]

      if @iframe_name.nil? || @iframe_name.empty?
        return '<div class="iframe-error">Error: iframe name cannot be empty</div>'
      end

      # Build iframe folder path in assets/post/iframes
      iframe_dir = File.join(site.source, 'assets', 'post', 'iframes', @iframe_name)

      unless Dir.exist?(iframe_dir)
        return "<div class=\"iframe-error\">Error: iframe directory '#{@iframe_name}' not found</div>"
      end

      # Find HTML files
      html_files = Dir.glob(File.join(iframe_dir, '*.html'))

      if html_files.empty?
        return "<div class=\"iframe-error\">Error: no HTML files found in '#{@iframe_name}' directory</div>"
      end

      # Use the first HTML file found
      html_file = html_files.first
      html_filename = File.basename(html_file)

      # Generate path relative to site root
      iframe_src = "/assets/post/iframes/#{@iframe_name}/#{html_filename}"

      # Build query string from additional parameters
      query_string = @params.map { |k, v| "#{CGI.escape(k)}=#{CGI.escape(v)}" }.join('&')
      iframe_src += "?#{query_string}" unless query_string.empty?

      # Generate unique iframe ID
      iframe_id = "iframe-#{@iframe_name}-#{rand(1000..9999)}"

      # Read HTML file content to get title (optional)
      title = @iframe_name
      begin
        content = File.read(html_file)
        if match = content.match(/<title[^>]*>(.*?)<\/title>/i)
          title = match[1].strip
        end
      rescue
        # Use default title if reading fails
      end

      # Generate iframe HTML
      header_html = unless @hide_header
        <<~HEADER
          <div class="iframe-header no-select">
            <span class="iframe-title">#{title}</span>
            <div class="iframe-controls">
              <button class="iframe-refresh-btn" onclick="refreshIframe('#{iframe_id}')" title="Refresh">
                <span class="material-symbols-outlined">refresh</span>
              </button>
              <button class="iframe-fullscreen-btn" onclick="toggleIframeFullscreen('#{iframe_id}')" title="Fullscreen">
                <span class="material-symbols-outlined">open_in_full</span>
              </button>
            </div>
          </div>
        HEADER
      else
        ""
      end

      # Generate iframe style
      container_style = @is_embedded ? "border-radius: 0; box-shadow: none; background-color: var(--white-color);" : ""
      iframe_style = @height ? "height: #{@height};" : ""

      <<~HTML
        <div class="iframe-container" data-iframe-name="#{@iframe_name}" data-height="#{@height || 'auto'}" style="#{container_style}">
          #{header_html}<iframe
            id="#{iframe_id}"
            src="#{iframe_src}"
            frameborder="0"
            allowfullscreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            title="#{title}"
            #{ @height ? "style=\"#{iframe_style}\"" : "onload=\"try { const iframe = this; const body = iframe.contentWindow.document.body; iframe.style.height = body.scrollHeight + 'px'; const resizeObserver = new ResizeObserver(() => { iframe.style.height = body.scrollHeight + 'px'; }); resizeObserver.observe(body); } catch(e) { console.warn('Cannot adjust iframe height due to cross-origin restrictions or unsupported features'); }\"" }>
            <p>Your browser does not support iframes. <a href="#{iframe_src}" target="_blank">Click here to visit the content</a></p>
          </iframe>
        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag('iframe', Jekyll::IframeTag)
