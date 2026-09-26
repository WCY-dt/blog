require 'securerandom' # Require SecureRandom for generating unique IDs

# Hook to modify posts after rendering
Jekyll::Hooks.register :posts, :post_render do |post|
  # Replace all <table> elements in the post output with enhanced versions
  post.output = post.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    wrap_table_with_controls(match)
  end
end

# Hook to modify pages after rendering
Jekyll::Hooks.register :pages, :post_render do |page|
  # Replace all <table> elements in the page output with enhanced versions
  page.output = page.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    wrap_table_with_controls(match)
  end
end

# Method to wrap a table with additional controls (e.g., fullscreen button)
def wrap_table_with_controls(table_html)
  table_id = "table-#{SecureRandom.hex(8)}" # Generate a unique ID for the table

  # Return the HTML structure with the table wrapped in a container
  <<~HTML
    <div class="table-wrapper" id="wrapper-#{table_id}">
      <div class="table-buttons no-select" role="group" aria-label="表格工具">
        <button class="table-fullscreen-button" id="fullscreen-btn-#{table_id}" onclick="toggleTableFullscreen('#{table_id}')" title="全屏显示表格" aria-label="全屏显示表格" data-tooltip="全屏显示表格">
          <span class="material-symbols-outlined">open_in_full</span>
        </button>
      </div>
      <div class="table-scroll" tabindex="0" role="region" aria-label="表格">#{table_html}</div>
    </div>
  HTML
end
