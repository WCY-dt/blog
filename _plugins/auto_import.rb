class AutoImport < Jekyll::Generator
  def generate(site)
    site.documents.each do |doc|
      if doc.content.include?('```mermaid')
        doc.data['uses_mermaid'] = true
      end
      if doc.content =~ /\$.+\$/ || doc.content =~ /\$\$.+\$\$/
        doc.data['uses_mathjax'] = true
      end
    end

    site.pages.each do |page|
      if page.content.include?('```mermaid')
        page.data['uses_mermaid'] = true
      end
      if page.content =~ /\$.+\$/ || page.content =~ /\$\$.+\$\$/
        page.data['uses_mathjax'] = true
      end
    end
  end
end
