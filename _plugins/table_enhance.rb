require 'securerandom'

Jekyll::Hooks.register :posts, :post_render do |post|
  post.output = post.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    wrap_table_with_controls(match)
  end
end

Jekyll::Hooks.register :pages, :post_render do |page|
  page.output = page.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    wrap_table_with_controls(match)
  end
end

def wrap_table_with_controls(table_html)
  table_id = "table-#{SecureRandom.hex(8)}"

  <<~HTML
    <div class="table-wrapper" id="wrapper-#{table_id}" onmouseenter="showTableButtons('#{table_id}')" onmouseleave="hideTableButtons('#{table_id}')">
      <div class="table-buttons no-select">
        <button class="table-fullscreen-button" id="fullscreen-btn-#{table_id}" onclick="toggleTableFullscreen('#{table_id}')" title="Toggle Fullscreen">
          <span class="material-symbols-outlined">open_in_full</span>
        </button>
      </div>
      #{table_html}
    </div>
  HTML
end
