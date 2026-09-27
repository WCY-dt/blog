# Run with: bundle exec ruby _test/home_feature_test.rb
require 'jekyll'
require_relative '../_plugins/home_post_groups'

# Exercise the actual Liquid selection, with newest-first article fixtures.
source = File.read(File.expand_path('../_layouts/home.html', __dir__), encoding: 'UTF-8')
selection = source.split('<section', 2).first.sub(/\A---.*?---\s*/m, '')
template = Liquid::Template.parse("#{selection}{{ featured_posts | map: 'url' | join: ',' }}")

def post(url, series = nil, **fields)
  { 'url' => url, 'series' => series }.merge(fields.transform_keys(&:to_s))
end

cases = [
  ['standalone stays single', [post('/new'), post('/previous')], '/new', 'production'],
  ['continuous series stops at another article', [post('/7', 'A'), post('/6', 'A'), post('/5', 'A'), post('/other', 'B'), post('/4', 'A')], '/7,/6,/5', 'production'],
  ['hidden posts neither enter nor interrupt the group', [post('/draft', 'B', draft: true), post('/7', 'A'), post('/archived', 'B', archived: true), post('/6', 'A')], '/7,/6', 'production'],
  ['preview drafts stay previewable', [post('/draft', 'B', draft: true), post('/7', 'A')], '/draft', 'development'],
  ['empty series is not a shared series', [post('/new', ''), post('/old', '')], '/new', 'production'],
  ['no public articles', [post('/draft', 'A', draft: true), post('/archive', 'A', archived: true)], '', 'production'],
  ['long update batches remain a single group', (1..7).to_a.reverse.map { |n| post("/#{n}", 'A') }, '/7,/6,/5,/4,/3,/2,/1', 'production']
]

cases.each do |name, posts, expected, environment|
  actual = template.render!({ 'site' => { 'posts' => posts }, 'jekyll' => { 'environment' => environment } }, filters: [Jekyll::Filters, HomePostGroups]).strip
  raise "#{name}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
  puts "PASS #{name}"
end

recent_template = Liquid::Template.parse("#{selection}{% for group in home_post_groups offset:1 limit:3 %}{{ group | map: 'url' | join: ',' }}|{% endfor %}")
recent_cases = [
  ['recent limit counts groups, not chapters', [post('/hero'), post('/a3', 'A'), post('/a2', 'A'), post('/a1', 'A'), post('/single'), post('/b2', 'B'), post('/b1', 'B'), post('/tail')], '/a3,/a2,/a1|/single|/b2,/b1|'],
  ['featured batch is excluded in full', [post('/a3', 'A'), post('/a2', 'A'), post('/b2', 'B'), post('/b1', 'B'), post('/single'), post('/a1', 'A')], '/b2,/b1|/single|/a1|'],
  ['interleaved series stay in distinct batches', [post('/hero'), post('/a2', 'A'), post('/b1', 'B'), post('/a1', 'A')], '/a2|/b1|/a1|'],
  ['hidden posts do not consume recent slots', [post('/hero'), post('/draft', 'B', draft: true), post('/a2', 'A'), post('/archive', nil, archived: true), post('/a1', 'A'), post('/tail')], '/a2,/a1|/tail|']
]
recent_cases.each do |name, posts, expected|
  actual = recent_template.render!({ 'site' => { 'posts' => posts }, 'jekyll' => { 'environment' => 'production' } }, filters: [Jekyll::Filters, HomePostGroups]).strip
  raise "#{name}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
  puts "PASS #{name}"
end
