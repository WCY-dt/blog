require 'nokogiri' rescue nil # Require Nokogiri for HTML parsing, rescue if not available

# Register a Jekyll hook to modify posts and pages after rendering
Jekyll::Hooks.register [:posts, :pages], :post_render do |doc|
  next if doc.output.nil? # Skip if the document has no output
  next if !defined?(Nokogiri) # Skip if Nokogiri is not defined

  begin
    # Parse the document's HTML output
    doc_html = Nokogiri::HTML(doc.output)

    # Locate the main content container
    container = doc_html.css('#post__content') # Try to find by ID
    container = doc_html.css('.post__content') if container.empty? # Try to find by class
    container = doc_html.css('article') if container.empty? # Fallback to <article> tag

    unless container.empty?
      # Select all header tags within the container
      headers = container.css('h2, h3, h4, h5, h6')

      modified = false
      headers.each do |header|
        # If the header ID starts with a digit, prepend it with "§"
        if header['id'] && header['id'] =~ /^\d/
          header['id'] = "§#{header['id']}"
          modified = true
        end
      end

      # Update the document output if any modifications were made
      doc.output = doc_html.to_s if modified
    end
  rescue => e
    # Log an error if processing fails
    Jekyll.logger.error "Header ID Modifier:", "Error processing #{doc.path}: #{e.message}"
  end
end
