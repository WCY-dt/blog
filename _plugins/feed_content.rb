require 'liquid'
require 'nokogiri'
require 'uri'

# RSS has no client-side runtime. Convert the blog's rich components into
# ordinary reading content before applying a small, explicit HTML allowlist.
module FeedContent
  class Converter
    TAGS = %w[a abbr b bdi bdo blockquote br caption cite code col colgroup dd del
      div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img ins kbd li mark ol p
      picture pre q rp rt ruby s samp small source span strong sub sup table tbody td
      tfoot th thead time tr u ul var video audio].freeze
    ATTRIBUTES = %w[href src srcset poster alt title lang dir cite datetime colspan
      rowspan scope headers start reversed type width height controls preload].freeze
    REMOVE = [
      'script, style, form, input, select, option, textarea, button, template',
      'object, embed, canvas, svg, link, meta, base, .material-symbols-outlined',
      '.code-block-buttons, .table-buttons, .table-controls, .code-line-numbers',
      '.line-numbers-rows, .lineno, .rouge-gutter, .gutter, .tool-status, .tool-label',
      '.component-pane-label, .file-structure__toggle, .file-structure__tree-icon',
      '.github-link__avatar-wrapper, .github-issue__avatar-wrapper, .cite__favicon-wrapper',
      '.github-link__avatar, .github-issue__avatar, .cite__favicon, .github-code-btn__icon',
      '.github-issue__link, .lightbox, .code-tools, .mermaid-tools'
    ].join(', ').freeze

    def initialize(input, post_url)
      @document = Nokogiri::HTML.fragment(input.to_s)
      @post_url = URI.parse(escape_url(post_url.to_s)).tap do |uri|
        raise ArgumentError, 'rss_content needs an absolute HTTP(S) post URL' unless
          %w[http https].include?(uri.scheme) && uri.host
      end
      @post_url.fragment = nil
      @heading_ids = @document.css('h2[id], h3[id], h4[id], h5[id], h6[id]').to_h do |heading|
        id = heading['id']
        [id, id.match?(/\A\d/) ? "§#{id}" : id]
      end
    end

    def render
      convert_math
      convert_results
      convert_runners
      convert_frames
      convert_mermaid
      convert_trees
      convert_sources
      convert_details
      # Some image viewers wrap the actual image in a button. Retain that image.
      @document.css('button').each { |button| button.replace(button.css('img').map(&:to_html).join) if button.at_css('img') }
      @document.css(REMOVE).remove
      @document.xpath('.//comment()').remove
      normalize_code
      sanitize
      reading_styles
      @document.to_html
    end

    private

    def element(name, text = nil)
      node = Nokogiri::XML::Node.new(name, @document.document)
      node.content = text unless text.nil?
      node
    end

    def code_block(text, language = nil)
      pre = element('pre')
      code = element('code', text)
      code['class'] = "language-#{language}" if language&.match?(/\A[\w+-]+\z/)
      pre.add_child(code)
      pre
    end

    def label(text)
      paragraph = element('p')
      paragraph.add_child(element('strong', text))
      paragraph
    end

    def original_link(node, text)
      heading = node.xpath('preceding::*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6][@id]').last
      url = @post_url.dup
      if heading && !heading['id'].to_s.empty?
        id = heading['id']
        id = "§#{id}" if id.match?(/\A\d/) && heading.name != 'h1'
        url.fragment = escape_url(id)
      end
      paragraph = element('p')
      link = element('a', text)
      link['href'] = url.to_s
      paragraph.add_child(link)
      paragraph
    end

    def convert_math
      @document.css('script[type^="math/tex"]').each do |script|
        source = script.text
        script.replace(script['type'].include?('display') ? code_block("\\[#{source}\\]", 'tex') : element('code', "\\(#{source}\\)"))
      end
      @document.css('.katex, mjx-container').each do |math|
        source = math.at_css('annotation[encoding="application/x-tex"]')&.text
        source ||= math['data-tex']
        math.replace(element('code', "\\(#{source}\\)")) if source
      end
    end

    def convert_results
      @document.css('.result-wrapper').each do |result|
        replacement = element('div')
        result.css('.result-tab-content').each do |tab|
          title = result.at_css(".result-tab[data-tab='#{tab['data-tab-content'].to_s.gsub(/[^\w-]/, '')}']")&.text
          replacement.add_child(label(title.strip)) if title && !title.strip.empty?
          tab.css('pre').each { |pre| replacement.add_child(pre.dup) }
        end
        output = result.at_css('.result__output, .result__image-output')
        if output
          title = result.at_css('.result__preview-title')&.text.to_s.strip
          replacement.add_child(label(title.empty? ? '运行结果' : title))
          replacement.add_child(output.dup)
        elsif result.at_css('iframe')
          replacement.add_child(original_link(result, '在原文查看交互演示'))
        end
        result.replace(replacement)
      end
    end

    def convert_runners
      @document.css('.code-runner__container').each do |runner|
        replacement = element('div')
        source = runner.at_css('textarea.code-runner__editor')&.text.to_s
        unless source.empty?
          language = runner['data-language']
          replacement.add_child(label(language)) if language && !language.empty?
          replacement.add_child(code_block(source, language))
        end
        replacement.add_child(original_link(runner, '在原文运行代码'))
        runner.replace(replacement)
      end
    end

    def convert_frames
      @document.css('.iframe-container').each do |container|
        title = container.at_css('iframe')&.[]('title').to_s.strip
        text = title.empty? ? '在原文查看交互演示' : "在原文查看演示：#{title}"
        container.replace(original_link(container, text))
      end
      @document.css('iframe').each do |frame|
        frame.replace(original_link(frame, '在原文查看嵌入内容'))
      end
    end

    def convert_mermaid
      @document.css('pre').each do |pre|
        next unless ([pre] + pre.ancestors.to_a + pre.css('code').to_a).any? { |node| node['class'].to_s.split.include?('language-mermaid') }
        replacement = element('div')
        replacement.add_child(label('图表源码（Mermaid）'))
        replacement.add_child(code_block(pre.at_css('code')&.text || pre.text, 'mermaid'))
        replacement.add_child(original_link(pre, '在原文查看图表'))
        pre.replace(replacement)
      end
      @document.css('.mermaid:not(pre)').each do |diagram|
        source = diagram['data-source'] || diagram.at_css('code')&.text
        source ||= diagram.text unless diagram.at_css('svg')
        replacement = element('div')
        replacement.add_child(code_block(source, 'mermaid')) if source
        replacement.add_child(original_link(diagram, '在原文查看图表'))
        diagram.replace(replacement)
      end
    end

    def convert_trees
      @document.css('.file-structure__container').each do |tree|
        replacement = element('div')
        title = tree.at_css('.file-structure__title')&.text.to_s.strip
        replacement.add_child(label(title)) unless title.empty?
        lines = []
        walk = lambda do |list, depth|
          list&.element_children&.select { |child| child.name == 'li' }&.each do |item|
            name = item.at_css('.file-structure__tree-label')&.text.to_s.strip
            folder = item['class'].to_s.split.include?('file-structure__tree-item--folder')
            name += '/' if folder && name != '...' && !name.end_with?('/')
            lines << ('  ' * depth + name)
            walk.call(item.element_children.find { |child| child.name == 'ul' }, depth + 1)
          end
        end
        walk.call(tree.at_css('.file-structure__tree > ul'), 0)
        replacement.add_child(code_block(lines.join("\n"), 'text'))
        tree.replace(replacement)
      end
    end

    def convert_sources
      @document.css('.github-link').each do |link|
        name = link.at_css('.github-link__name')&.text || link['href']
        link.content = name
      end
      @document.css('.github-code-btn__btn').each do |link|
        parts = link.css('.github-code-btn__file-path, .github-code-btn__line-number').map { |node| node.text.strip }
        link.content = parts.reject(&:empty?).join(' · ')
      end
      @document.css('.cite-wrapper').each do |citation|
        header = citation.at_css('.cite__header')
        source = citation.at_css('.cite__link')
        next unless header && source
        link = element('a', citation.at_css('.cite__info-title')&.text || source['href'])
        link['href'] = source['href']
        paragraph = element('p', '来源：')
        paragraph.add_child(link)
        header.replace(paragraph)
        body = citation.at_css('.cite__content')
        body.name = 'blockquote' if body
      end
      @document.css('.github-issue__content').each { |content| content.name = 'blockquote' }
    end

    def convert_details
      @document.css('details').each do |details|
        summary = details.at_css('summary')
        summary.replace(label(summary.text)) if summary
        details.name = 'div'
      end
    end

    def normalize_code
      @document.css('pre').each do |pre|
        next unless pre.parent
        pre.css('br').each { |br| br.replace("\n") }
        node = pre.at_css('td.rouge-code, td.code') || pre.at_css('code') || pre
        text = node.text
        language_node = ([node, pre] + pre.ancestors.to_a).find { |candidate| candidate['class'].to_s.match?(/(?:^|\s)language-([\w+-]+)/) }
        language = language_node && language_node['class'][/(?:^|\s)language-([\w+-]+)/, 1]
        pre.replace(code_block(text, language))
      end
    end

    def escape_url(value)
      URI::DEFAULT_PARSER.escape(value, /[^\x21-\x7e]|[<>"{}|\\^`]/)
    end

    def absolute_url(value, kind = 'href')
      value = value.to_s.strip
      return nil if value.empty? || value.match?(/[\x00-\x1f\x7f\\]/)
      if kind == 'href' && value.start_with?('#')
        id = URI::DEFAULT_PARSER.unescape(value.delete_prefix('#'))
        value = "##{@heading_ids.fetch(id, id)}"
      end
      if kind == 'src' && value.match?(/\Adata:image\/(?:png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+\/=]+\z/i)
        return value
      end
      uri = URI.join(@post_url.to_s, escape_url(value))
      schemes = kind == 'href' ? %w[http https mailto tel] : %w[http https]
      return nil unless schemes.include?(uri.scheme&.downcase)
      return nil if %w[http https].include?(uri.scheme&.downcase) && uri.host.to_s.empty?
      uri.to_s
    rescue URI::InvalidURIError, ArgumentError
      nil
    end

    def srcset(value)
      # Data URIs are supported in src, but omitted from multi-candidate srcset.
      remaining = value.to_s.dup
      candidates = []
      until remaining.empty?
        remaining.sub!(/\A[\s,]+/, '')
        url = remaining.slice!(/\A\S+/)
        break unless url
        if url.end_with?(',')
          url.sub!(/,+\z/, '')
          descriptor = ''
        else
          descriptor = remaining.slice!(/\A[^,]*/).to_s.strip
          remaining.sub!(/\A,/, '')
        end
        next unless descriptor.empty? || descriptor.match?(/\A(?:\d+w|(?:\d+(?:\.\d+)?|\.\d+)x)\z/)
        resolved = absolute_url(url, 'srcset')
        candidates << [resolved, descriptor.empty? ? nil : descriptor].compact.join(' ') if resolved
      end
      candidates.join(', ')
    end

    def sanitize
      @document.css('*').to_a.reverse_each do |node|
        next unless node.parent
        unless TAGS.include?(node.name)
          node.replace(node.children)
          next
        end
        node.attribute_nodes.each do |attribute|
          name = attribute.name.downcase
          if name == 'class' && node.name == 'code'
            language = node['class'].to_s[/(?:^|\s)(language-[\w+-]+)/, 1]
            language ? node['class'] = language : node.remove_attribute(name)
          elsif !ATTRIBUTES.include?(name)
            node.remove_attribute(name)
          elsif %w[href src poster cite].include?(name)
            resolved = absolute_url(attribute.value, name)
            resolved ? node[name] = resolved : node.remove_attribute(name)
          elsif name == 'srcset'
            resolved = srcset(attribute.value)
            resolved.empty? ? node.remove_attribute(name) : node[name] = resolved
          elsif %w[width height colspan rowspan start].include?(name)
            node.remove_attribute(name) unless attribute.value.match?(/\A\d{1,5}\z/)
          end
        end
        if %w[video audio].include?(node.name)
          node['controls'] = 'controls'
          node['preload'] = 'none'
          media = node['src'] || node.at_css('source[src]')&.[]('src')
          if media
            fallback = element('p')
            link = element('a', node.name == 'video' ? '打开视频' : '打开音频')
            link['href'] = media
            fallback.add_child(link)
            node.add_next_sibling(fallback)
          end
        end
        node.remove if node.name == 'a' && node.text.strip.empty? && !node.at_css('img')
      end
    end

    # Only these reader-safe structural styles are emitted; source layout, colors
    # and fonts never leak from the website into a subscriber's chosen theme.
    def reading_styles
      @document.css('img, video').each { |node| node['style'] = 'max-width:100%;height:auto;' }
      @document.css('pre').each { |node| node['style'] = 'white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;' }
      @document.css('table').each { |node| node['style'] = 'border-collapse:collapse;max-width:100%;' }
      @document.css('th, td').each { |node| node['style'] = 'border:1px solid;padding:0.4em 0.6em;vertical-align:top;' }
      @document.css('figure').each { |node| node['style'] = 'margin:1em 0;' }
    end
  end

  module Filter
    def rss_content(input, post_url)
      Converter.new(input, post_url).render
    end
  end
end

Liquid::Template.register_filter(FeedContent::Filter)
