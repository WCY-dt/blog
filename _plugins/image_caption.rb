module Jekyll
  class ImageCaptionTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      parts = @markup.split('|').map(&:strip)

      if parts.length < 2
        raise "ImageCaption tag requires format: {% image_caption image_url | caption %} or {% image_caption image_url | caption | css_class %}"
      end

      image_url = parts[0]
      caption = parts[1]

      alt_text = caption
      css_class = parts[2] || "image-caption"

      html = <<~HTML
        <figure class="#{css_class}">
          <img src="#{image_url}" alt="#{alt_text}" />
          <figcaption>#{caption}</figcaption>
        </figure>
      HTML

      html
    end
  end
end

Liquid::Template.register_tag('image_caption', Jekyll::ImageCaptionTag)
