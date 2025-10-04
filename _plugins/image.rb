module Jekyll
  class ImageCaptionTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      parts = @markup.split('|').map(&:strip)

      if parts.length < 1
        raise "ImageCaption tag requires at least an image URL"
      end

      image_url = parts[0]
      caption = parts.length > 1 ? parts[1] : nil
      alt_text = caption || "Image"
      css_class = parts[2] || ""

      html = <<~HTML
        <figure class="image-caption #{css_class}">
          <img src="#{image_url}" alt="#{alt_text}" class="image-caption__image" />
          #{caption ? "<figcaption class=\"image-caption__caption\">#{caption}</figcaption>" : ""}
        </figure>
      HTML

      html
    end
  end

  class ImageGridTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
      parse_params(@markup)
    end

    def parse_params(markup)
      @rows = 1
      @cols = 1
      @css_class = ""

      # Parse parameters like rows=2 cols=3 class=custom-class
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
      content = super.strip

      # Extract image entries from the block content
      images = []

      # Split by newlines and process each line
      content.split("\n").each do |line|
        line = line.strip
        next if line.empty?

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

      if images.empty?
        raise "ImageGrid requires at least one image. Format: image_url | caption (one per line)"
      end

      grid_html = <<~HTML
        <div class="image-grid #{@css_class}" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
      HTML

      images.each do |img|
        grid_html += <<~HTML
          <figure class="image-grid__item" style="flex: 0 0 calc((100% - #{(@cols - 1)}rem) / #{@cols}); display: flex; flex-direction: column; align-items: center;">
            <img src="#{img[:url]}" alt="#{img[:alt]}" class="image-grid__image" style="max-width: 100%; height: auto;" />
            #{img[:caption] ? "<figcaption class=\"image-grid__caption\">#{img[:caption]}</figcaption>" : ""}
          </figure>
        HTML
      end

      grid_html += "</div>"
      grid_html
    end
  end
end

Liquid::Template.register_tag('image_caption', Jekyll::ImageCaptionTag)
Liquid::Template.register_tag('image_grid', Jekyll::ImageGridTag)
