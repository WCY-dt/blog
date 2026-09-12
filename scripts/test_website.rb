require 'minitest/autorun'
require 'jekyll'
require 'tmpdir'
require 'json'
require_relative '../_plugins/website'
require_relative '../_plugins/table_enhance'
require_relative '../_plugins/id_enhance'

class WebsitePostsTest < Minitest::Test
  def setup
    @temporary = Dir.mktmpdir('website-posts-test-')
    @source = File.join(@temporary, 'site')
    @dest = File.join(@temporary, 'output')
    FileUtils.mkdir_p(@source)
    @previous_environment = ENV['JEKYLL_ENV']
    ENV['JEKYLL_ENV'] = 'test'
    @commands = []
    commands = @commands
    @instrumentation = Module.new do
      define_method(:run!) do |env, *command, directory:|
        commands << command
        super(env, *command, directory: directory)
      end
    end
    WebsitePosts::Builder.prepend(@instrumentation)
  end

  def teardown
    @instrumentation.send(:remove_method, :run!)
    ENV['JEKYLL_ENV'] = @previous_environment
    # The only recursively removed path is the verified directory created by this test.
    assert File.realpath(@temporary).start_with?(File.realpath(Dir.tmpdir) + File::SEPARATOR)
    FileUtils.remove_entry(@temporary)
  end

  def write(path, content)
    path = File.join(@source, path)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, content)
  end

  def post(website: 'demo', draft: false, extra: '')
    write('_posts/2000-01-01-demo.md', <<~POST)
      ---
      layout: post
      title: Metadata title
      categories: Test
      tags: example
      summary: Metadata summary
      draft: #{draft}
      website: #{website}
      #{extra}
      ---
      Searchable **Markdown** body.
    POST
  end

  def build(baseurl: '/blog', incremental: false)
    config = Jekyll.configuration(
      'source' => @source, 'destination' => @dest, 'plugins_dir' => [],
      'permalink' => '/post/:title/', 'baseurl' => baseurl,
      'incremental' => incremental, 'quiet' => true
    )
    site = Jekyll::Site.new(config)
    site.process
    site
  end

  def test_static_page_is_untouched_and_metadata_remains_markdown
    post
    html = '<!doctype html><html><body><article><h2 id="1">{{ untouched }}</h2><table><tr><td>raw</td></tr></table></article></body></html>'
    write('assets/post/websites/demo/index.html', html)
    write('assets/post/websites/demo/main.js', 'console.log("standalone")')
    write('assets/post/websites/demo/.npmrc', 'not public')
    write('assets/post/websites/demo/README.md', 'not public')
    write('assets/post/websites/unreferenced/src/page.astro', "---\nconst x = { not: yaml };\n---\n<div />")
    write('search.json', "---\n---\n{{ site.posts.first.content | jsonify }}")
    site = build
    assert_equal html, File.read(File.join(@dest, 'post/demo/index.html'))
    assert File.file?(File.join(@dest, 'post/demo/main.js'))
    refute File.exist?(File.join(@dest, 'assets/post/websites'))
    refute File.exist?(File.join(@dest, 'post/demo/.npmrc'))
    refute File.exist?(File.join(@dest, 'post/demo/README.md'))
    assert_includes File.read(File.join(@dest, 'search.json')), 'Searchable'
    refute_includes File.read(File.join(@dest, 'search.json')), 'untouched'
    assert_equal 'Metadata summary', site.posts.docs.first.data['summary']
    refute_includes site.config['exclude'], WebsitePosts::ROOT
    assert_empty @commands
  end

  def npm_project
    post
    package = {
      'name' => 'website-test', 'version' => '1.0.0',
      'scripts' => { 'build' => 'node build.cjs' }
    }
    write('assets/post/websites/demo/package.json', JSON.generate(package))
    lock = {
      'name' => 'website-test', 'version' => '1.0.0', 'lockfileVersion' => 3,
      'requires' => true, 'packages' => { '' => { 'name' => 'website-test', 'version' => '1.0.0' } }
    }
    write('assets/post/websites/demo/package-lock.json', JSON.generate(lock))
    write('assets/post/websites/demo/text.txt', 'first revision')
    write('assets/post/websites/demo/build.cjs', <<~JS)
      const fs = require('node:fs');
      const path = require('node:path');
      const out = process.env.WEBSITE_OUTPUT_DIR;
      fs.mkdirSync(out, {recursive: true});
      const post = JSON.parse(fs.readFileSync(process.env.WEBSITE_POST_FILE));
      const text = fs.readFileSync('text.txt', 'utf8');
      fs.writeFileSync(path.join(out, 'index.html'), `<title>${post.title}</title><p>${text}</p><script src="${process.env.WEBSITE_BASE_URL}app.js"></script>`);
      fs.writeFileSync(path.join(out, 'app.js'), 'console.log("built")');
      if (fs.existsSync('old.txt')) fs.writeFileSync(path.join(out, 'old.txt'), 'old');
    JS
    write('assets/post/websites/demo/old.txt', 'old')
  end

  def count_command(*suffix)
    @commands.count { |command| command[1, suffix.length] == suffix }
  end

  def test_build_cache_dependency_reuse_and_invalidation
    npm_project
    build(incremental: true)
    assert_equal 1, count_command('ci')
    assert_equal 1, count_command('run', 'build')
    assert_includes File.read(File.join(@dest, 'post/demo/index.html')), '/blog/post/demo/app.js'
    assert File.exist?(File.join(@dest, 'post/demo/old.txt'))

    build(incremental: true)
    assert_equal 1, count_command('ci')
    assert_equal 1, count_command('run', 'build')

    write('assets/post/websites/demo/text.txt', 'second revision')
    File.delete(File.join(@source, 'assets/post/websites/demo/old.txt'))
    build(incremental: true)
    assert_equal 1, count_command('ci'), 'editing source must reuse installed dependencies'
    assert_equal 2, count_command('run', 'build')
    assert_includes File.read(File.join(@dest, 'post/demo/index.html')), 'second revision'
    refute File.exist?(File.join(@dest, 'post/demo/old.txt')), 'removed source/output must not survive a rebuild'

    build(baseurl: '/changed')
    assert_equal 1, count_command('ci')
    assert_equal 3, count_command('run', 'build')
    assert_includes File.read(File.join(@dest, 'post/demo/index.html')), '/changed/post/demo/app.js'

    path = File.join(@source, 'assets/post/websites/demo/package-lock.json')
    File.write(path, File.read(path) + "\n")
    build(baseurl: '/changed')
    assert_equal 2, count_command('ci'), 'lockfile changes must reinstall dependencies'
    assert_equal 4, count_command('run', 'build')
    refute File.exist?(File.join(@source, 'assets/post/websites/demo/node_modules'))
    refute File.exist?(File.join(@source, 'assets/post/websites/demo/dist'))
    refute File.exist?(File.join(@dest, 'assets/post/websites'))
    refute File.exist?(File.join(@dest, 'post/demo/package.json'))
  end

  def test_missing_lockfile_and_failed_build_stop_publication
    npm_project
    lock = File.join(@source, 'assets/post/websites/demo/package-lock.json')
    original = File.read(lock)
    File.delete(lock)
    assert_raises(Jekyll::Errors::FatalException) { build }
    File.write(lock, original)
    write('assets/post/websites/demo/build.cjs', 'process.exit(1)')
    assert_raises(Jekyll::Errors::FatalException) { build }
    refute File.exist?(File.join(@dest, 'post/demo/index.html'))
  end

  def test_invalid_source_and_missing_entry_fail_clearly
    post(website: '../outside')
    assert_raises(Jekyll::Errors::FatalException) { build }
    post
    write('assets/post/websites/demo/style.css', 'body {}')
    assert_raises(Jekyll::Errors::FatalException) { build }
  end

  def test_production_draft_does_not_build_or_publish_assets
    post(draft: true)
    ENV['JEKYLL_ENV'] = 'production'
    build
    assert_includes File.read(File.join(@dest, 'post/demo/index.html')), '/blog/404.html'
    assert_empty @commands
  end

  def test_vite_react_build
    skip 'Set WEBSITE_TEST_FRAMEWORKS=1 to run the real Vite/React build (downloads npm packages)' unless ENV['WEBSITE_TEST_FRAMEWORKS'] == '1'
    post
    project = 'assets/post/websites/demo'
    write("#{project}/package.json", JSON.generate(
      'name' => 'website-react-test', 'version' => '1.0.0', 'private' => true, 'type' => 'module',
      'scripts' => { 'build' => 'vite build' },
      'dependencies' => { 'react' => '19.3.0', 'react-dom' => '19.3.0' },
      'devDependencies' => { 'vite' => '8.3.0' }
    ))
    write("#{project}/index.html", '<!doctype html><div id="root"></div><script type="module" src="./src/main.jsx"></script>')
    write("#{project}/src/main.jsx", <<~JS)
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import './style.css';
      createRoot(document.getElementById('root')).render(<h1>Standalone React</h1>);
    JS
    write("#{project}/src/style.css", 'body { color: green; }')
    write("#{project}/vite.config.js", <<~JS)
      import { defineConfig } from 'vite';
      export default defineConfig({
        base: process.env.WEBSITE_BASE_URL,
        build: {outDir: process.env.WEBSITE_OUTPUT_DIR},
      });
    JS
    npm = Gem.win_platform? ? 'npm.cmd' : 'npm'
    output, status = Open3.capture2e(npm, 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', chdir: File.join(@source, project))
    assert status.success?, output
    build
    html = File.read(File.join(@dest, 'post/demo/index.html'))
    assert_includes html, '/blog/post/demo/assets/'
    assets = Dir.glob(File.join(@dest, 'post/demo/assets/*'))
    assert assets.any? { |file| file.end_with?('.js') }
    assert assets.any? { |file| file.end_with?('.css') }
    assert assets.select { |file| file.end_with?('.js') }.any? { |file| File.read(file).include?('Standalone React') }
    refute File.exist?(File.join(@dest, 'post/demo/src'))
    refute File.exist?(File.join(@source, project, 'node_modules'))
  end
end
