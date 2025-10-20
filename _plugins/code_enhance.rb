require 'liquid'
require 'securerandom'

module Jekyll
  # Hook to modify documents after rendering
  Jekyll::Hooks.register :documents, :post_render do |document|
    # Only process pages and posts collection
    if document.is_a?(Jekyll::Page) || document.collection.label == 'posts'
      # Only process HTML output
      if document.output_ext == '.html'
        document.output = add_buttons_to_existing_code_blocks(document.output)
      end
    end
  end

  # Hook to modify pages after rendering
  Jekyll::Hooks.register :pages, :post_render do |page|
    # Only process HTML output
    if page.output_ext == '.html'
      page.output = add_buttons_to_existing_code_blocks(page.output)
    end
  end


  # Language display name mapping
  # Only special cases are listed here; others will be capitalized versions of the key
  LANGUAGE_DISPLAY_NAMES = {
    'plaintext' => 'Text',
    'txt' => 'Text',
    'javascript' => 'JavaScript',
    'js' => 'JavaScript',
    'ts' => 'TypeScript',
    'py' => 'Python',
    'rb' => 'Ruby',
    'cpp' => 'C++',
    'cxx' => 'C++',
    'csharp' => 'C#',
    'cs' => 'C#',
    'php' => 'PHP',
    'html' => 'HTML',
    'css' => 'CSS',
    'scss' => 'SCSS',
    'sass' => 'SASS',
    'less' => 'LESS',
    'sql' => 'SQL',
    'mysql' => 'MySQL',
    'postgresql' => 'PostgreSQL',
    'pgsql' => 'PostgreSQL',
    'sqlite' => 'SQLite',
    'oracle' => 'Oracle SQL',
    'golang' => 'Go',
    'sh' => 'Shell',
    'powershell' => 'PowerShell',
    'ps1' => 'PowerShell',
    'pwsh' => 'PowerShell',
    'yaml' => 'YAML',
    'yml' => 'YAML',
    'toml' => 'TOML',
    'ini' => 'INI',
    'make' => 'Makefile',
    'json' => 'JSON',
    'xml' => 'XML',
    'md' => 'Markdown',
    'objective-c' => 'Objective-C',
    'objc' => 'Objective-C',
    'objective-cpp' => 'Objective-C++',
    'pl' => 'Perl',
    'matlab' => 'MATLAB',
    'hs' => 'Haskell',
    'clj' => 'Clojure',
    'ex' => 'Elixir',
    'erl' => 'Erlang',
    'ocaml' => 'OCaml',
    'fsharp' => 'F#',
    'fs' => 'F#',
    'vuejs' => 'Vue',
    'reactjs' => 'React',
    'nodejs' => 'Node.js',
    'node' => 'Node.js',
    'rails' => 'Ruby on Rails',
    'ror' => 'Ruby on Rails',
    'k8s' => 'Kubernetes',
    'cmake' => 'CMake',
    'protobuf' => 'Protocol Buffers',
    'proto' => 'Protocol Buffers',
    'graphql' => 'GraphQL',
    'gql' => 'GraphQL',
    'mongodb' => 'MongoDB',
    'rabbitmq' => 'RabbitMQ',
    'svn' => 'SVN',
    'hg' => 'Mercurial',
    'sublime' => 'Sublime Text',
    'vscode' => 'VS Code',
    'intellij' => 'IntelliJ',
    'ios' => 'iOS',
    'react-native' => 'React Native',
    'nwjs' => 'NW.js',
    'wasm' => 'WebAssembly',
    'webassembly' => 'WebAssembly',
    'asm' => 'Assembly',
    'x86' => 'x86 Assembly',
    'arm' => 'ARM Assembly',
    'nasm' => 'NASM',
    'glsl' => 'GLSL',
    'hlsl' => 'HLSL',
    'metal' => 'Metal Shading Language',
    'cuda' => 'CUDA',
    'opencl' => 'OpenCL',
    'vhdl' => 'VHDL',
    'systemverilog' => 'SystemVerilog',
    'cobol' => 'COBOL',
    'basic' => 'BASIC',
    'vb' => 'Visual Basic',
    'vba' => 'VBA',
    'vbnet' => 'VB.NET',
    'actionscript' => 'ActionScript',
    'as' => 'ActionScript',
    'air' => 'AIR',
    'livescript' => 'LiveScript',
    'coffeescript' => 'CoffeeScript',
    'coffee' => 'CoffeeScript',
    'typescript' => 'TypeScript',
    'purescript' => 'PureScript',
    'rescript' => 'ReScript',
    'clojurescript' => 'ClojureScript',
    'cljs' => 'ClojureScript',
  }.freeze

  # Adds copy and fullscreen buttons to code blocks
  def self.add_buttons_to_existing_code_blocks(content)
    # First, process standard Jekyll code blocks with outer divs
    content = process_standard_code_blocks(content)

    # Then, process non-standard code blocks without outer divs
    process_non_standard_code_blocks(content)
  end

  private

  # Process standard Jekyll code blocks with outer divs
  def self.process_standard_code_blocks(content)
    content.gsub(%r{
      <div\sclass="([^"]*language-([^"\s]+)[^"]*)"[^>]*>  # Outer div with language class
      \s*<div\sclass="([^"]*)"[^>]*>\s*                  # Highlight wrapper div
      <pre\sclass="([^"]*)"[^>]*>\s*                     # Pre tag
      <code[^>]*>([\s\S]*?)</code>\s*                    # Code content
      </pre>\s*</div>\s*</div>                           # Closing tags
    }ix) do |match|
      outer_div_classes = $1
      language_key = $2.downcase
      highlight_div_classes = $3
      pre_classes = $4
      code_content = $5

      # Skip mermaid diagrams
      next match if language_key == 'mermaid'

      # Skip if already processed
      next match if match.include?('code-block-wrapper')

      # Get display name for language
      language_display = LANGUAGE_DISPLAY_NAMES[language_key] ||
                         language_key.split('-').map(&:capitalize).join(' ')

      wrap_standard_code_block(outer_div_classes, highlight_div_classes, pre_classes, code_content, language_display)
    end
  end

  # Process non-standard code blocks without outer divs
  def self.process_non_standard_code_blocks(content)
    content.gsub(%r{
      <pre[^>]*>\s*<code[^>]*class\s*=\s*["'][^"']*language-([^"'\s]+)[^"']*["'][^>]*>([\s\S]*?)</code>\s*</pre>
    }ix) do |match|
      language_key = $1.downcase
      code_content = $2

      # Skip mermaid diagrams
      next match if language_key == 'mermaid'

      # Skip if already processed
      next match if match.include?('code-block-wrapper')

      # Get display name for language
      language_display = LANGUAGE_DISPLAY_NAMES[language_key] ||
                         language_key.split('-').map(&:capitalize).join(' ')

      wrap_non_standard_code_block(code_content, language_display, language_key)
    end
  end

  # Wrap a standard code block with outer divs
  def self.wrap_standard_code_block(outer_div_classes, highlight_div_classes, pre_classes, code_content, language_display)
    # Generate unique ID for this code block
    code_id = "code-#{SecureRandom.hex(8)}"

    # Build the modified structure with our wrapper
    <<~HTML
    <div class="#{outer_div_classes}">
      <div class="#{highlight_div_classes}">
        <div class="code-block-wrapper" id="wrapper-#{code_id}">
          <div class="code-block-buttons no-select">
            <p class="code-language-label">#{language_display}</p>
            <button class="code-fullscreen-button" id="fullscreen-btn-#{code_id}"
                    title="Toggle Fullscreen" type="button">
              <span class="material-symbols-outlined no-select">open_in_full</span>
            </button>
            <button class="code-white-space-button" id="whitespace-btn-#{code_id}"
                    title="Enable Word Wrap" type="button">
              <span class="material-symbols-outlined no-select">format_paragraph</span>
            </button>
            <button class="code-copy-button" id="copy-btn-#{code_id}"
                    title="Copy Code" type="button">
              <span class="copy-icon material-symbols-outlined no-select">content_copy</span>
              <span class="check-icon material-symbols-outlined no-select" style="display: none;">check</span>
            </button>
          </div>
          <pre class="#{pre_classes}"><code id="#{code_id}">#{code_content}</code></pre>
        </div>
      </div>
    </div>
    HTML
  end

  # Wrap a non-standard code block without outer divs
  def self.wrap_non_standard_code_block(code_content, language_display, language_key)
    # Generate unique ID for this code block
    code_id = "code-#{SecureRandom.hex(8)}"

    # Build the modified structure with our wrapper
    <<~HTML
    <div class="language-#{language_key}">
      <div class="highlight">
        <div class="code-block-wrapper" id="wrapper-#{code_id}">
          <div class="code-block-buttons no-select">
            <p class="code-language-label">#{language_display}</p>
            <button class="code-fullscreen-button" id="fullscreen-btn-#{code_id}"
                    title="Toggle Fullscreen" type="button">
              <span class="material-symbols-outlined no-select">open_in_full</span>
            </button>
            <button class="code-white-space-button" id="whitespace-btn-#{code_id}"
                    title="Enable Word Wrap" type="button">
              <span class="material-symbols-outlined no-select">format_paragraph</span>
            </button>
            <button class="code-copy-button" id="copy-btn-#{code_id}"
                    title="Copy Code" type="button">
              <span class="copy-icon material-symbols-outlined no-select">content_copy</span>
              <span class="check-icon material-symbols-outlined no-select" style="display: none;">check</span>
            </button>
          </div>
          <pre class="highlight"><code id="#{code_id}" class="language-#{language_key}">#{code_content}</code></pre>
        </div>
      </div>
    </div>
    HTML
  end
end
