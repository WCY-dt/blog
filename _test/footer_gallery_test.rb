# Run with: bundle exec ruby _test/footer_gallery_test.rb
require_relative '../_plugins/home_discovery'

GalleryPost = Struct.new(:data, :date, :url)
now = Time.utc(2026, 9, 27)
def cover_post(name, now, **data)
  GalleryPost.new({ 'cover_image' => "/covers/#{name}.webp" }.merge(data.transform_keys(&:to_s)), now, "/#{name}/")
end

posts = [
  cover_post('archived', now - 60, archived: true),
  cover_post('current', now - 120),
  cover_post('draft', now - 30, draft: true),
  cover_post('future', now + 60),
  cover_post('default', now),
  cover_post('series-new', now - 180, series: 'Series'),
  cover_post('series-old', now - 240, series: 'Series', archived: true),
  cover_post('current', now - 300, archived: true),
  GalleryPost.new({}, now - 60, '/no-cover/')
]

production = HomeDiscovery.build(posts, now: now)['gallery'].map { |item| item['post'].url }
expected = ['/archived/', '/current/', '/series-new/']
raise "Unexpected published gallery: #{production.inspect}" unless production == expected
puts 'PASS archived covers included; drafts, future posts, default and missing artwork excluded'
puts 'PASS series and shared artwork deduplicated; newest representative preserved'

preview = HomeDiscovery.build(posts, now: now, production: false)['gallery'].map { |item| item['post'].url }
raise 'Development draft behavior changed' unless preview == ['/draft/'] + expected
puts 'PASS development preview preserves its existing draft behavior'
