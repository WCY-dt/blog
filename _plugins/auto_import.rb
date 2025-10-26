class AutoImport < Jekyll::Generator
  priority :highest

  def generate(site)
    site.documents.each do |doc|
      # Check for mermaid diagrams usage
      if doc.content.include?('```mermaid')
        doc.data['uses_mermaid'] = true
      end
      # Check for MathJax usage
      if doc.content =~ /\$.+\$/ || doc.content =~ /\$\$.+\$\$/
        doc.data['uses_mathjax'] = true
      end
      # Check for code_runner plugin usage
      if doc.content.include?('{% code_runner') || doc.content.include?('{% code_runner_empty') || doc.content.include?('code-runner__container')
        doc.data['uses_code_runner'] = true
      end
      # Check for iframe plugin usage
      if doc.content.include?('{% iframe') || doc.content.include?('iframe-container')
        doc.data['uses_iframe'] = true
      end
      # Check for result plugin usage
      if doc.content.include?('{% result') || doc.content.include?('result-wrapper')
        doc.data['uses_result'] = true
      end
      # Check for file_structure plugin usage
      if doc.content.include?('{% file_structure') || doc.content.include?('file-structure__container')
        doc.data['uses_file_structure'] = true
      end
    end

    site.pages.each do |page|
      # Check for mermaid diagrams usage
      if page.content.include?('```mermaid')
        page.data['uses_mermaid'] = true
      end
      # Check for MathJax usage
      if page.content =~ /\$.+\$/ || page.content =~ /\$\$.+\$\$/
        page.data['uses_mathjax'] = true
      end
      # Check for code_runner plugin usage
      if page.content.include?('{% code_runner') || page.content.include?('{% code_runner_empty') || page.content.include?('code-runner__container')
        page.data['uses_code_runner'] = true
      end
      # Check for iframe plugin usage
      if page.content.include?('{% iframe') || page.content.include?('iframe-container')
        page.data['uses_iframe'] = true
      end
      # Check for result plugin usage
      if page.content.include?('{% result') || page.content.include?('result-wrapper')
        page.data['uses_result'] = true
      end
      # Check for file_structure plugin usage
      if page.content.include?('{% file_structure') || page.content.include?('file-structure__container')
        page.data['uses_file_structure'] = true
      end
    end
  end
end
