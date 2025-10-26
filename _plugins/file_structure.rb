require 'liquid'

module Jekyll
  class FileStructureTag < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @params = {}
      # Parse parameters if any
      unless markup.strip.empty?
        # Match key="value" pairs, allowing spaces in quoted values
        markup.scan(/(\w+)="([^"]*)"/) do |key, value|
          @params[key] = value
        end
      end
    end

    def render(context)
      content = super
      if content.empty?
        return '<div class="file-structure__error no-select">Error: file structure content cannot be empty</div>'
      end

      # Parse the tree structure
      tree = parse_tree(content)

      # Generate HTML
      html = tree.map { |node| generate_html(node) }.join

      title = @params['title'] || 'File Structure'

      # Wrap in container
      container_html = <<~HTML
        <div class="file-structure__container">
          <div class="file-structure__header no-select">
            <span class="file-structure__title">#{title}</span>
            <div class="file-structure__toggle file-structure__toggle--expanded">
              <span class="material-symbols-outlined">collapse_all</span>
            </div>
          </div>
          <div class="file-structure__tree">
            <ul class="file-structure__tree-children file-structure__tree-children--expanded">
              #{html}
            </ul>
          </div>
        </div>
      HTML

      # merge into single line of html
      container_html.gsub(/\s+/, ' ').strip
    end

    private

    def parse_tree(content)
      lines = content.lines.map(&:rstrip).reject(&:empty?)
      # Find minimum indentation
      min_indent = lines.map { |line| line.match(/^(\s*)/)[1].length }.min || 0
      root = { children: [] }
      stack = [root]

      lines.each do |line|
        # Count leading spaces
        indent = line.match(/^(\s*)/)[1].length
        level = (indent - min_indent) / 2  # Remove min_indent's influence

        # Remove leading dashes and spaces
        name = line.sub(/^(\s*)-?\s*/, '')

        # Check if ends with slash for folder indication
        is_folder_by_slash = name.end_with?('/')

        # Determine type based on [FOLDER] or [FILE] prefix
        if name.start_with?('[FOLDER]')
          type = :folder
          name = name.sub(/^\[FOLDER\]/, '').sub(/\/$/, '')
        elsif name.start_with?('[FILE]')
          type = :file
          name = name.sub(/^\[FILE\]/, '').sub(/\/$/, '')
        else
          type = nil
          name = name.sub(/\/$/, '')
        end

        # Adjust stack to current level
        while stack.length > level + 1
          stack.pop
        end

        parent = stack.last

        node = { name: name, children: [], type: type, is_folder_by_slash: is_folder_by_slash }
        parent[:children] << node

        # Always push to stack for potential children
        stack << node
      end

      # Set types based on explicit flag and presence of children
      def set_type(node)
        if node[:type].nil?
          if node[:children].any? || node[:is_folder_by_slash]
            node[:type] = :folder
          else
            node[:type] = :file
          end
        end
        node[:children].each { |child| set_type(child) }
      end

      root[:children].each { |child| set_type(child) }

      root[:children]
    end

    def generate_html(node, level = 0)
      return '' unless node

      if node[:type] == :file
        label_class = 'file-structure__tree-label--' + get_file_class(node[:name])
        icon_html = node[:name] == '...' ? '' : '<span class="file-structure__tree-icon file-structure__tree-icon--file no-select"></span>'
        <<~HTML
          <li class="file-structure__tree-item file-structure__tree-item--file">
            <div class="file-structure__tree-content">
              #{icon_html}
              <span class="file-structure__tree-label #{label_class}">#{node[:name]}</span>
            </div>
          </li>
        HTML
      else
        children_html = node[:children].map { |child| generate_html(child, level + 1) }.join
        expandable_class = node[:children].empty? ? '' : 'file-structure__tree-item--expandable'
        empty_class = node[:children].empty? ? 'file-structure__tree-item--empty' : ''
        icon_html = node[:name] == '...' ? '' : '<span class="file-structure__tree-icon file-structure__tree-icon--folder no-select"></span>'
        <<~HTML
          <li class="file-structure__tree-item file-structure__tree-item--folder #{expandable_class} #{empty_class}">
            <div class="file-structure__tree-content">
              #{icon_html}
              <span class="file-structure__tree-label">#{node[:name]}</span>
            </div>
            <ul class="file-structure__tree-children file-structure__tree-children--expanded">
              #{children_html}
            </ul>
          </li>
        HTML
      end
    end

    def get_file_class(filename)
      ext = File.extname(filename).downcase
      case ext
      when '.c' then 'c'
      when '.clj', '.cljs' then 'clojure'
      when '.cpp', '.cxx', '.cc', '.hpp', '.h' then 'cplusplus'
      when '.cs' then 'csharp'
      when '.css' then 'css'
      when '.ex', '.exs' then 'elixir'
      when '.go' then 'go'
      when '.html', '.htm' then 'html'
      when '.java' then 'java'
      when '.js' then 'javascript'
      when '.json' then 'json'
      when '.jsx' then 'jsx'
      when '.kt', '.kts' then 'kotlin'
      when '.md' then 'markdown'
      when '.php' then 'php'
      when '.proto' then 'prototype'
      when '.py' then 'python'
      when '.rb' then 'ruby'
      when '.rs' then 'rust'
      when '.scss', '.sass' then 'scss'
      when '.sh', '.ps1', '.bash' then 'shell'
      when '.sql' then 'sql'
      when '.swift' then 'swift'
      when '.tsx' then 'tsx'
      when '.ts' then 'typescript'
      when '.xml' then 'xml'
      when '.yaml', '.yml' then 'yaml'
      else ''
      end
    end
  end
end

Liquid::Template.register_tag('file_structure', Jekyll::FileStructureTag)
