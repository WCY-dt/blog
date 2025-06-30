require 'liquid'
require 'securerandom'

module Jekyll
  Jekyll::Hooks.register :documents, :post_render do |document|
    if document.is_a?(Jekyll::Page) || document.collection.label == 'posts'
      if document.output_ext == '.html'
        document.output = add_copy_buttons_to_existing_code_blocks(document.output)
      end
    end
  end

  Jekyll::Hooks.register :pages, :post_render do |page|
    if page.output_ext == '.html'
      page.output = add_copy_buttons_to_existing_code_blocks(page.output)
    end
  end

  def self.add_copy_buttons_to_existing_code_blocks(content)
    content.gsub(/<pre><code(?:\s+class="[^"]*language-([^"\s]*)[^"]*")?[^>]*>(.*?)<\/code><\/pre>/m) do |match|
      language = $1 || ''
      code_content = $2

      if language.downcase == 'mermaid'
        match
      else
        match_index = content.index(match)
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

  def self.wrap_code_block(match, language)
    code_id = "code-#{SecureRandom.hex(8)}"

    pre_code_with_id = match.sub(/<code/, "<code id=\"#{code_id}\"")

    <<~HTML
      <div class="code-block-wrapper no-select" onmouseenter="showCopyButton('#{code_id}')" onmouseleave="hideCopyButton('#{code_id}')">
        <div class="code-copy-button" id="copy-btn-#{code_id}" onclick="copyCode('#{code_id}')" title="复制代码">
          <span class="copy-icon material-symbols-outlined">content_copy</span>
          <span class="check-icon material-symbols-outlined" style="display: none;">check</span>
        </div>
        #{pre_code_with_id}
      </div>
    HTML
  end
end
