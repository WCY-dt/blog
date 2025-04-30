require 'cgi'

module Jekyll
  class BroadcastTag < Liquid::Tag
    def render(context)
      site = context.registers[:site]
      file_path = File.join(site.source, 'broadcast-messages.txt')
      output = []

      if File.exist?(file_path)
        lines = File.readlines(file_path).map(&:strip).reject(&:empty?)

        unless lines.length == 5
          Jekyll.logger.error "Broadcast:", "broadcast-messages.txt must contain exactly 5 messages, but found #{lines.length}"
        end

        lines.each do |line|
          output << "<p>#{CGI.escapeHTML(line)}</p>"
        end
      else
        Jekyll.logger.error "Broadcast:", "broadcast-messages.txt file not found"
      end

      output.join("\n")
    end
  end
end

Liquid::Template.register_tag('broadcast_messages', Jekyll::BroadcastTag)
