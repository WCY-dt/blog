Jekyll::Hooks.register :posts, :post_render do |post|
  post.output = post.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    "<div class='table-wrapper'>#{match}</div>"
  end
end

Jekyll::Hooks.register :pages, :post_render do |page|
  page.output = page.output.gsub(/<table[^>]*>.*?<\/table>/m) do |match|
    "<div class='table-wrapper'>#{match}</div>"
  end
end
