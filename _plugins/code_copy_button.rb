require 'liquid'
require 'securerandom'

module Jekyll
  # Hook to process generated HTML and add copy buttons to existing code blocks
  Jekyll::Hooks.register :documents, :post_render do |document|
    if document.is_a?(Jekyll::Page) || document.collection.label == 'posts'
      # 只处理HTML输出
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
    # 匹配 <pre><code> 结构，但排除已经有包装器的和mermaid代码块
    content.gsub(/<pre><code(?:\s+class="[^"]*language-([^"\s]*)[^"]*")?[^>]*>(.*?)<\/code><\/pre>/m) do |match|
      language = $1 || ''  # 第一个捕获组是语言
      code_content = $2    # 第二个捕获组是代码内容

      # 跳过mermaid代码块
      if language.downcase == 'mermaid'
        match
      else
        # 检查是否已经被包装
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
    # 生成唯一ID
    code_id = "code-#{SecureRandom.hex(8)}"

    # 保持原有的pre和code标签，只添加包装器和按钮
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
