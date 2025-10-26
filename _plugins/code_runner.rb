require 'liquid'
require 'cgi'

module Jekyll
  class CodeRunnerTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @params = {}
      markup.strip.split(/\s+/).each do |part|
        if part.include?('=')
          key, value = part.split('=', 2)
          @params[key] = value
        end
      end
      @height = @params.delete('height') || 'auto'
    end

    def render(context)
      content = super.strip
      # Generate unique ID for this instance
      @id = "code-runner-#{rand(10000..99999)}"

      # Language mapping
      language_map = {
        'js' => 'javascript',
        'py' => 'python',
        'c++' => 'cpp',
        'hs' => 'haskell',
        'pl' => 'perl',
        'rb' => 'ruby',
        'rs' => 'rust'
      }

      # Check if code block is present
      has_code_block = content =~ /^```(\w+)/

      if has_code_block
        short_lang = $1.downcase
        @language = language_map[short_lang] || short_lang
        content = content.sub(/^```#{short_lang}\n?/, '').sub(/\n?```$/, '')
        @disabled = 'disabled'
      else
        raise Liquid::SyntaxError, "Use {% code_runner_empty %} for empty code blocks"
      end

      # Escape HTML and preserve line breaks
      content = CGI.escapeHTML(content).gsub("\n", "&#10;")

      <<~HTML
        <div class="code-runner__container" id="#{@id}" data-language="#{@language}" style="height: #{@height};">
          <div class="code-runner__header no-select">
            <div class="code-runner__language-selector">
              <select class="code-runner__language-select" #{@disabled}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="haskell">Haskell</option>
                <option value="java">Java</option>
                <option value="lua">Lua</option>
                <option value="perl">Perl</option>
                <option value="ruby">Ruby</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <div class="code-runner__controls">
              <button class="code-runner__refresh-btn">
                <span class="material-symbols-outlined">refresh</span>
              </button>
              <button class="code-runner__fullscreen-btn">
                <span class="material-symbols-outlined">open_in_full</span>
              </button>
              <button class="code-runner__run-btn">
                <span class="material-symbols-outlined">bug_report</span>
              </button>
            </div>
          </div>
          <div class="code-runner__content">
            <div class="code-runner__editor-section">
              <textarea class="code-runner__editor" name="code" spellcheck="false">#{content}</textarea>
            </div>
            <div class="code-runner__output-section">
              <div class="code-runner__output"></div>
            </div>
          </div>
          <div class="code-runner__status no-select">
            <span class="material-symbols-outlined">feedback</span>
            <span class="code-runner__status-text">Ready</span>
          </div>
        </div>
      HTML
    end
  end

  class CodeRunnerEmptyTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @params = {}
      markup.strip.split(/\s+/).each do |part|
        if part.include?('=')
          key, value = part.split('=', 2)
          @params[key] = value
        end
      end
      @height = @params.delete('height') || 'auto'
    end

    def render(context)
      # Generate unique ID for this instance
      @id = "code-runner-#{rand(10000..99999)}"

      @language = 'python'
      content = ''
      @disabled = ''

      # Escape HTML and preserve line breaks
      content = CGI.escapeHTML(content).gsub("\n", "&#10;")

      <<~HTML
        <div class="code-runner__container" id="#{@id}" data-language="#{@language}" style="height: #{@height};">
          <div class="code-runner__header no-select">
            <div class="code-runner__language-selector">
              <select class="code-runner__language-select no-select" #{@disabled}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="haskell">Haskell</option>
                <option value="java">Java</option>
                <option value="lua">Lua</option>
                <option value="perl">Perl</option>
                <option value="ruby">Ruby</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <div class="code-runner__controls">
              <button class="code-runner__refresh-btn">
                <span class="material-symbols-outlined">refresh</span>
              </button>
              <button class="code-runner__fullscreen-btn">
                <span class="material-symbols-outlined">open_in_full</span>
              </button>
              <button class="code-runner__run-btn">
                <span class="material-symbols-outlined">bug_report</span>
              </button>
            </div>
          </div>
          <div class="code-runner__content">
            <div class="code-runner__editor-section">
              <textarea class="code-runner__editor" name="code" spellcheck="false">#{content}</textarea>
            </div>
            <div class="code-runner__output-section">
              <div class="code-runner__output"></div>
            </div>
          </div>
          <div class="code-runner__status no-select">
            <span class="material-symbols-outlined">feedback</span>
            <span class="code-runner__status-text">Ready</span>
          </div>
        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag('code_runner', Jekyll::CodeRunnerTag)
Liquid::Template.register_tag('code_runner_empty', Jekyll::CodeRunnerEmptyTag)
