require 'liquid'
require 'securerandom'

module Jekyll
  # Hook to modify documents after rendering
  Jekyll::Hooks.register :documents, :post_render do |document|
    # Check if the document is a page or belongs to the 'posts' collection
    if document.is_a?(Jekyll::Page) || document.collection.label == 'posts'
      # Ensure the output is HTML before processing
      if document.output_ext == '.html'
        document.output = add_copy_buttons_to_existing_code_blocks(document.output)
      end
    end
  end

  # Hook to modify pages after rendering
  Jekyll::Hooks.register :pages, :post_render do |page|
    # Ensure the output is HTML before processing
    if page.output_ext == '.html'
      page.output = add_copy_buttons_to_existing_code_blocks(page.output)
    end
  end

  # Method to add copy buttons to existing code blocks in the content
  def self.add_copy_buttons_to_existing_code_blocks(content)
    content.gsub(/<pre><code(?:\s+class="[^"]*language-([^"\s]*)[^"]*")?[^>]*>(.*?)<\/code><\/pre>/m) do |match|
      language = $1 || '' # Extract the language class if present
      code_content = $2   # Extract the code content

      # Skip processing if the language is 'mermaid'
      if language.downcase == 'mermaid'
        match
      else
        match_index = content.index(match)
        # Check if the code block is already wrapped
        if match_index && match_index > 100
          preceding_content = content[match_index - 100...match_index]
          if preceding_content.include?("code-block-wrapper")
            match
          else
            wrap_code_block(match, language)
          end
        else
          wrap_code_block(match, language)
        end
      end
    end
  end

  private

  # Method to wrap a code block with additional HTML for copy and fullscreen buttons
  def self.wrap_code_block(match, language)
    code_id = "code-#{SecureRandom.hex(8)}" # Generate a unique ID for the code block

    # Add the unique ID to the <code> tag
    pre_code_with_id = match.sub(/<code/, "<code id=\"#{code_id}\"")

    # Return the wrapped HTML structure
    <<~HTML
      <div class="code-block-wrapper no-select" id="wrapper-#{code_id}" onmouseenter="showCodeButtons('#{code_id}')" onmouseleave="hideCodeButtons('#{code_id}')">
        <div class="code-block-buttons">
          <button class="code-fullscreen-button" id="fullscreen-btn-#{code_id}" onclick="toggleCodeFullscreen('#{code_id}')" title="Toggle Fullscreen">
            <span class="material-symbols-outlined no-select">open_in_full</span>
          </button>
          <button class="code-copy-button" id="copy-btn-#{code_id}" onclick="copyCode('#{code_id}')" title="Copy Code">
            <span class="copy-icon material-symbols-outlined no-select">content_copy</span>
            <span class="check-icon material-symbols-outlined no-select" style="display: none;">check</span>
          </button>
        </div>
        #{pre_code_with_id}
      </div>
    HTML
  end
end
