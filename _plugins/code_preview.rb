require 'liquid'
require 'cgi'

module Jekyll
  class CodePreviewTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      # Parse parameters: [height=400px] [split=50] [title="My Demo"] [layout=horizontal|vertical] [hide=code|preview]
      @height = '400px'
      @split_ratio = '50' # percentage for left/top panel
      @title = 'Code Preview'
      @layout = 'horizontal' # default to horizontal (left-right)
      @hide = nil # default: show both panels, can be 'code' or 'preview'

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
        when 'hide'
          @hide = value.downcase if ['code', 'preview'].include?(value.downcase)
        end
      end
    end

    def render(context)
      content = super.strip

      # Extract all code blocks
      all_blocks = extract_all_code_blocks(content)

      if all_blocks.empty?
        return '<div class="code-preview-error">Error: At least one code block is required</div>'
      end

      # Check if last block is plaintext (output mode)
      last_block = all_blocks.last
      is_output_mode = last_block[:language] == 'plaintext'

      # Generate unique ID
      preview_id = "preview-#{rand(100000..999999)}"

      if is_output_mode
        # Output mode: code blocks + plaintext output
        code_blocks = all_blocks[0..-2]
        output_content = last_block[:code]

        if code_blocks.empty?
          return '<div class="code-preview-error">Error: At least one code block is required before the plaintext output</div>'
        end

        generate_output_preview_html(preview_id, code_blocks, output_content)
      else
        # Original HTML preview mode (backward compatibility)
        html_content = extract_code_block(content, 'html')
        css_content = extract_code_block(content, 'css')
        js_content = extract_code_block(content, 'javascript') || extract_code_block(content, 'js')

        if html_content.nil? || html_content.empty?
          return '<div class="code-preview-error">Error: HTML code block is required</div>'
        end

        # Generate combined HTML for iframe
        combined_html = generate_combined_html(html_content, css_content || '', js_content || '')

        # Generate the dual-panel HTML with tabs
        generate_preview_html(preview_id, html_content, css_content, js_content, combined_html)
      end
    end

    private

    def extract_all_code_blocks(content)
      # Extract all code blocks with their languages
      blocks = []
      content.scan(/```(\w+)\s*\n(.*?)```/m) do |language, code|
        blocks << { language: language, code: code.strip }
      end
      blocks
    end

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

      # Store preview_id for use in build_tabs_html
      @preview_id = id

      # Don't escape here - let Rouge handle it
      # Build tabs HTML with raw code
      tabs_html = build_tabs_html(html_code, css_code, js_code)

      # Determine layout class and flex direction
      layout_class = @layout == 'vertical' ? 'code-preview--vertical' : 'code-preview--horizontal'
      flex_direction = @layout == 'vertical' ? 'column' : 'row'

      # Determine initial visibility
      source_hidden = @hide == 'code' ? ' hidden' : ''
      preview_hidden = @hide == 'preview' ? ' hidden' : ''
      divider_display = (@hide == 'code' || @hide == 'preview') ? 'display: none;' : ''
      # 被隐藏的面板显示恢复按钮，正在展示的面板不显示恢复按钮
      restore_source_display = @hide == 'code' ? 'display: flex;' : 'display: none;'
      restore_preview_display = @hide == 'preview' ? 'display: flex;' : 'display: none;'

      <<~HTML
        <div class="code-preview-wrapper" data-height="#{@height}">
          <div class="code-preview #{layout_class}" id="#{id}" data-layout="#{@layout}" style="height: #{@height}; flex-direction: #{flex_direction};">
            <button class="code-preview-restore-btn code-preview-restore-btn--source no-select" onclick="toggleCodePreviewPanel('#{id}', 'source')" title="Show Code Panel" style="#{restore_source_display}" data-icon-horizontal="keyboard_arrow_right" data-icon-vertical="keyboard_arrow_down">
              <span class="material-symbols-outlined">#{@layout == 'vertical' ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</span>
            </button>
            <div class="code-preview__source#{source_hidden}" style="flex: #{left_flex};">
              #{tabs_html}
            </div>
            <div class="code-preview__divider" style="#{divider_display}"></div>
            <div class="code-preview__preview#{preview_hidden}" style="flex: #{right_flex};">
              <div class="code-preview__preview-header no-select">
                <span class="code-preview__preview-title">#{@title}</span>
                <div class="code-preview-controls">
                  <button class="code-preview-toggle-btn" onclick="toggleCodePreviewPanel('#{id}', 'preview')" title="Toggle Preview Panel">
                    <span class="material-symbols-outlined">visibility_off</span>
                  </button>
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
            <button class="code-preview-restore-btn code-preview-restore-btn--preview no-select" onclick="toggleCodePreviewPanel('#{id}', 'preview')" title="Show Preview Panel" style="#{restore_preview_display}" data-icon-horizontal="keyboard_arrow_left" data-icon-vertical="keyboard_arrow_up">
              <span class="material-symbols-outlined">#{@layout == 'vertical' ? 'keyboard_arrow_up' : 'keyboard_arrow_left'}</span>
            </button>
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

      # Get the preview ID from context
      preview_id = @preview_id || "preview-#{rand(100000..999999)}"

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
          <div class="code-preview-tab-buttons no-select">
            <div class="code-preview-tab-buttons__tabs">
              #{tab_buttons}
            </div>
            <div class="code-preview-controls">
              <button class="code-preview-toggle-btn" onclick="toggleCodePreviewPanel('#{preview_id}', 'source')" title="Toggle Code Panel">
                <span class="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
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

    def generate_output_preview_html(id, code_blocks, output_content)
      # Calculate flex ratios
      left_flex = @split_ratio.to_i
      right_flex = 100 - left_flex

      # Store preview_id for use in build_code_tabs_html
      @preview_id = id

      # Build tabs HTML for code blocks
      tabs_html = build_code_tabs_html(code_blocks)

      # Determine layout class and flex direction
      layout_class = @layout == 'vertical' ? 'code-preview--vertical' : 'code-preview--horizontal'
      flex_direction = @layout == 'vertical' ? 'column' : 'row'

      # Escape output content for HTML display and preserve line breaks and spaces
      # Strip to remove any leading/trailing whitespace that might cause indentation issues
      # Note: white-space: pre-wrap in CSS will handle the actual rendering of spaces and newlines
      escaped_output = CGI.escapeHTML(output_content.strip)

      # Determine initial visibility
      source_hidden = @hide == 'code' ? ' hidden' : ''
      preview_hidden = @hide == 'preview' ? ' hidden' : ''
      divider_display = (@hide == 'code' || @hide == 'preview') ? 'display: none;' : ''
      # 被隐藏的面板显示恢复按钮，正在展示的面板不显示恢复按钮
      restore_source_display = @hide == 'code' ? 'display: flex;' : 'display: none;'
      restore_preview_display = @hide == 'preview' ? 'display: flex;' : 'display: none;'

      <<~HTML
        <div class="code-preview-wrapper" data-height="#{@height}">
          <div class="code-preview #{layout_class}" id="#{id}" data-layout="#{@layout}" style="height: #{@height}; flex-direction: #{flex_direction};">
            <button class="code-preview-restore-btn code-preview-restore-btn--source no-select" onclick="toggleCodePreviewPanel('#{id}', 'source')" title="Show Code Panel" style="#{restore_source_display}" data-icon-horizontal="keyboard_arrow_right" data-icon-vertical="keyboard_arrow_down">
              <span class="material-symbols-outlined">#{@layout == 'vertical' ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</span>
            </button>
            <div class="code-preview__source#{source_hidden}" style="flex: #{left_flex};">
              #{tabs_html}
            </div>
            <div class="code-preview__divider" style="#{divider_display}"></div>
            <div class="code-preview__preview#{preview_hidden}" style="flex: #{right_flex};">
              <div class="code-preview__preview-header no-select">
                <span class="code-preview__preview-title">#{@title}</span>
                <div class="code-preview-controls">
                  <button class="code-preview-toggle-btn" onclick="toggleCodePreviewPanel('#{id}', 'preview')" title="Toggle Output Panel">
                    <span class="material-symbols-outlined">visibility_off</span>
                  </button>
                  <button class="code-preview-fullscreen-btn" onclick="toggleCodePreviewFullscreen('#{id}')" title="Fullscreen">
                    <span class="material-symbols-outlined">open_in_full</span>
                  </button>
                </div>
              </div>
              <pre class="code-preview__output" style="margin: 0; padding: 16px; overflow: auto; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">#{escaped_output}</pre>
            </div>
            <button class="code-preview-restore-btn code-preview-restore-btn--preview no-select" onclick="toggleCodePreviewPanel('#{id}', 'preview')" title="Show Output Panel" style="#{restore_preview_display}" data-icon-horizontal="keyboard_arrow_left" data-icon-vertical="keyboard_arrow_up">
              <span class="material-symbols-outlined">#{@layout == 'vertical' ? 'keyboard_arrow_up' : 'keyboard_arrow_left'}</span>
            </button>
          </div>
        </div>
      HTML
    end

    def build_code_tabs_html(code_blocks)
      tabs = code_blocks.map.with_index do |block, index|
        {
          id: "code-#{index}",
          label: block[:language].upcase,
          code: block[:code],
          active: index == 0,
          language: block[:language]
        }
      end

      # Get the preview ID from context
      preview_id = @preview_id || "preview-#{rand(100000..999999)}"

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
          <div class="code-preview-tab-buttons no-select">
            <div class="code-preview-tab-buttons__tabs">
              #{tab_buttons}
            </div>
            <div class="code-preview-controls">
              <button class="code-preview-toggle-btn" onclick="toggleCodePreviewPanel('#{preview_id}', 'source')" title="Toggle Code Panel">
                <span class="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>
          <div class="code-preview-tab-contents">
            #{tab_contents}
          </div>
        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag('code_preview', Jekyll::CodePreviewTag)
