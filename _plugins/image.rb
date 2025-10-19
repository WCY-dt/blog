module Jekyll
  # Tag to generate an image with an optional caption
  class ImageCaptionTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip # Store the tag markup
    end

    def render(context)
      parts = @markup.split('|').map(&:strip) # Split the markup into parts

      # Ensure at least the image URL is provided
      if parts.length < 1
        raise "ImageCaption tag requires at least an image URL"
      end

      image_url = parts[0] # First part is the image URL
      caption = parts.length > 1 ? parts[1] : nil # Second part is the caption (optional)
      alt_text = caption || "Image" # Use caption as alt text if available
      css_class = parts[2] || "" # Third part is the CSS class (optional)

      # Generate the HTML for the image with caption
      html = <<~HTML
        <figure class="image-caption #{css_class}">
          <img src="#{image_url}" alt="#{alt_text}" class="image-caption__image" />
          #{caption ? "<figcaption class=\"image-caption__caption\">#{caption}</figcaption>" : ""}
        </figure>
      HTML

      html
    end
  end

  # Tag to generate a grid of images with optional captions
  class ImageGridTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip # Store the tag markup
      parse_params(@markup) # Parse the parameters from the markup
    end

    # Parse parameters like rows, cols, and class from the markup
    def parse_params(markup)
      @rows = 1 # Default number of rows
      @cols = 1 # Default number of columns
      @css_class = "" # Default CSS class

      # Extract parameters from the markup
      markup.scan(/(\w+)=["']?([^"'\s]+)["']?/).each do |key, value|
        case key
        when 'rows'
          @rows = value.to_i
        when 'cols'
          @cols = value.to_i
        when 'class'
          @css_class = value
        end
      end
    end

    def render(context)
      content = super.strip # Get the content inside the block

      # Extract image entries from the block content
      images = []

      # Process each line of the block content
      content.split("\n").each do |line|
        line = line.strip
        next if line.empty? # Skip empty lines

        # Parse line format: "url | caption" or just "url"
        if line.include?('|')
          parts = line.split('|', 2).map(&:strip)
          image_url = parts[0]
          caption = parts[1]
          alt_text = caption || "Image"
          images << { url: image_url, caption: caption, alt: alt_text }
        else
          # Just URL, no caption
          image_url = line
          images << { url: image_url, caption: nil, alt: "Image" }
        end
      end

      # Raise an error if no images are provided
      if images.empty?
        raise "ImageGrid requires at least one image. Format: image_url | caption (one per line)"
      end

      # Generate the HTML for the image grid
      grid_html = <<~HTML
        <div class="image-grid #{@css_class}" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
      HTML

      # Add each image to the grid
      images.each do |img|
        grid_html += <<~HTML
          <figure class="image-grid__item" style="flex: 0 0 calc((100% - #{(@cols - 1)}rem) / #{@cols}); display: flex; flex-direction: column; align-items: center;">
            <img src="#{img[:url]}" alt="#{img[:alt]}" class="image-grid__image" style="max-width: 100%; height: auto;" />
            #{img[:caption] ? "<figcaption class=\"image-grid__caption\">#{img[:caption]}</figcaption>" : ""}
          </figure>
        HTML
      end

      grid_html += "</div>" # Close the grid container
      grid_html
    end
  end
end

# Register the custom Liquid tags
Liquid::Template.register_tag('image_caption', Jekyll::ImageCaptionTag)
Liquid::Template.register_tag('image_grid', Jekyll::ImageGridTag)
