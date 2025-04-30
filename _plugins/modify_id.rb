require 'nokogiri' rescue nil

Jekyll::Hooks.register [:posts, :pages], :post_render do |doc|
  next if doc.output.nil?
  next if !defined?(Nokogiri)

  begin
    doc_html = Nokogiri::HTML(doc.output)

    container = doc_html.css('#post-content-container')
    container = doc_html.css('.post-content') if container.empty?
    container = doc_html.css('article') if container.empty?

    unless container.empty?
      headers = container.css('h2, h3, h4, h5, h6')

      modified = false
      headers.each do |header|
        if header['id'] && header['id'] =~ /^\d/
          header['id'] = "§#{header['id']}"
          modified = true
        end
      end

      doc.output = doc_html.to_s if modified
    end
  rescue => e
    Jekyll.logger.error "Header ID Modifier:", "Error processing #{doc.path}: #{e.message}"
  end
end
