require 'liquid'
require 'cgi'

module Jekyll
  class CodePreviewTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      # Parse parameters: [height=400px] [split=50] [title="My Demo"] [layout=horizontal|vertical]
      @height = '400px'
      @split_ratio = '50' # percentage for left/top panel
      @title = 'Code Preview'
      @layout = 'horizontal' # default to horizontal (left-right)

      # Parse parameters if provided
      # Updated regex to handle quoted strings with spaces
      markup.strip.scan(/(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/).each do |key, quoted_double, quoted_single, unquoted|
        value = quoted_double || quoted_single || unquoted
        case key
        when 'height'
          @height = value
        when 'split'
          @split_ratio = value
        when 'title'
          @title = value
        when 'layout'
          @layout = value.downcase if ['horizontal', 'vertical'].include?(value.downcase)
        end
      end
    end

    def render(context)
      content = super.strip

      # Parse HTML, CSS, and JavaScript from the content
      html_content = extract_code_block(content, 'html')
      css_content = extract_code_block(content, 'css')
      js_content = extract_code_block(content, 'javascript') || extract_code_block(content, 'js')

      if html_content.nil? || html_content.empty?
        return '<div class="code-preview-error">Error: HTML code block is required</div>'
      end

      # Generate combined HTML for iframe
      combined_html = generate_combined_html(html_content, css_content || '', js_content || '')

      # Generate unique ID
      preview_id = "preview-#{rand(100000..999999)}"

      # Generate the dual-panel HTML with tabs
      generate_preview_html(preview_id, html_content, css_content, js_content, combined_html)
    end

    private

    def extract_code_block(content, language)
      # Match code blocks with the specified language
      pattern = /```#{language}\s*\n(.*?)```/m
      match = content.match(pattern)
      match ? match[1].strip : nil
    end

    def generate_combined_html(html, css, js)
      # Create a complete HTML document with embedded CSS and JS
      <<~HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            #{css}
          </style>
        </head>
        <body>
          #{html}
          <script>
            #{js}
          </script>
        </body>
        </html>
      HTML
    end

    def generate_preview_html(id, html_code, css_code, js_code, iframe_content)
      # Calculate flex ratios
      left_flex = @split_ratio.to_i
      right_flex = 100 - left_flex

      # Don't escape here - let Rouge handle it
      # Build tabs HTML with raw code
      tabs_html = build_tabs_html(html_code, css_code, js_code)

      # Determine layout class and flex direction
      layout_class = @layout == 'vertical' ? 'code-preview--vertical' : 'code-preview--horizontal'
      flex_direction = @layout == 'vertical' ? 'column' : 'row'

      <<~HTML
        <div class="code-preview-wrapper" data-height="#{@height}">
          <div class="code-preview #{layout_class}" id="#{id}" style="height: #{@height}; flex-direction: #{flex_direction};">
            <div class="code-preview__source" style="flex: #{left_flex};">
              #{tabs_html}
            </div>
            <div class="code-preview__divider"></div>
            <div class="code-preview__preview" style="flex: #{right_flex};">
              <div class="code-preview__preview-header">
                <span class="code-preview__preview-title">#{@title}</span>
                <div class="code-preview-controls">
                  <button class="code-preview-refresh-btn" onclick="refreshCodePreview('#{id}')" title="Refresh">
                    <span class="material-symbols-outlined">refresh</span>
                  </button>
                  <button class="code-preview-fullscreen-btn" onclick="toggleCodePreviewFullscreen('#{id}')" title="Fullscreen">
                    <span class="material-symbols-outlined">open_in_full</span>
                  </button>
                </div>
              </div>
              <iframe
                class="code-preview__iframe"
                srcdoc="#{CGI.escapeHTML(iframe_content)}"
                frameborder="0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                title="#{@title} Preview"
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>
      HTML
    end

    def build_tabs_html(html_code, css_code, js_code)
      tabs = []
      tabs << { id: 'html', label: 'HTML', code: html_code, active: true, language: 'html' } if html_code && !html_code.empty?
      tabs << { id: 'css', label: 'CSS', code: css_code, active: false, language: 'scss' } if css_code && !css_code.empty?
      tabs << { id: 'js', label: 'JavaScript', code: js_code, active: false, language: 'javascript' } if js_code && !js_code.empty?

      # Set the first tab as active
      tabs.first[:active] = true if tabs.any?

      tab_buttons = tabs.map do |tab|
        active_class = tab[:active] ? ' active' : ''
        "<button class=\"code-preview-tab#{active_class}\" data-tab=\"#{tab[:id]}\">#{tab[:label]}</button>"
      end.join

      tab_contents = tabs.map do |tab|
        active_class = tab[:active] ? ' active' : ''
        # Use Rouge to highlight the code
        highlighted_code = highlight_code(tab[:code], tab[:language])
        <<~TAB
          <div class="code-preview-tab-content#{active_class}" data-tab-content="#{tab[:id]}">
            #{highlighted_code}
          </div>
        TAB
      end.join

      <<~HTML
        <div class="code-preview-tabs">
          <div class="code-preview-tab-buttons">
            #{tab_buttons}
          </div>
          <div class="code-preview-tab-contents">
            #{tab_contents}
          </div>
        </div>
      HTML
    end

    def highlight_code(code, language)
      require 'rouge'

      # Use HTMLLegacy formatter which adds Rouge token classes
      formatter = Rouge::Formatters::HTMLLegacy.new(css_class: 'highlight')
      lexer = Rouge::Lexer.find(language) || Rouge::Lexers::PlainText.new

      highlighted = formatter.format(lexer.lex(code))

      # The formatter already wraps in div.highlight > pre > code
      highlighted
    end
  end
end

Liquid::Template.register_tag('code_preview', Jekyll::CodePreviewTag)
