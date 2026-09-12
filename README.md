# Ch3nyang's blog

## 基本信息

本仓库为我的个人博客，主要存放一些技术性文章以及个人笔记。更新频率飘忽不定，尽量每个月尽量更新一篇。

👉 [https://blog.ch3nyang.top/](https://blog.ch3nyang.top/)

英文版本：[https://blog-en.ch3nyang.top/](https://blog-en.ch3nyang.top/)（仅部分文章）

## 功能特色

本博客基于 [Jekyll](https://jekyllrb.com/) 静态网站生成器构建，使用完全自定义的主题 [tangerine](https://github.com/wcy-dt/tangerine)，并集成了多种实用功能：

| 基础功能 | 内容组织 | 用户体验 | 增强功能 | 扩展插件 |
|----------|----------|----------|----------|----------|
| 个性主题 | 文章分类 | 响应式设计 | 代码高亮 | GitHub 插件 |
| RSS 订阅 | 文章标签 | 主题切换 | 代码复制 | 图片排版插件 |
| 评论系统 | 文章系列 | 无障碍访问 | 公式支持 | iframe 插件 |
| SEO 优化 | 文章目录 | 文章搜索 | 流程图支持 | 结果预览插件 |
| 性能优化 | 文章归档 | 文章分享 | 内容折叠 | 外部引用插件 |
|        | 草稿系统 | 版权声明 | 文章总结 | 代码运行插件 |
|        | 随笔模板 | 文章推荐 | 全屏显示 | 文件结构插件 |
|        |         |          |       | 自动导入插件 |
|        |         |          |       | 独立网页文章插件 |

## 本地开发

你可以自由地将本博客的主题用于你的博客。

### 安装与运行

构建前先安装好 [Ruby](https://rubyinstaller.org/downloads/)（≥ 3.4.0）和 [Jekyll](https://jekyllrb.com/docs/installation/) ，然后安装依赖：

```shell
bundle install
```

启动本地服务：

```shell
jekyll serve
```

然后直接使用 [`Live Server`](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 预览实时更新。

绝大多数设置都在 [`_config.yml`](./_config.yml) 文件中，你可以根据自己的需求进行修改。

### 文章编辑

博客文章存放在 [`_posts`](./_posts) 文件夹中，命名格式为 `YYYY-MM-DD-title.md`。博客文章的文件头应该包含以下信息：

```yaml
layout:     post
title:      "原神游玩指南"
date:       2000-01-01 00:00:00 +0800
categories: 游戏 // 只能有一个分类
tags:       开放世界 RPG 原神 // 可以有多个标签，用空格分隔
summary:    "本文为原神游玩指南，介绍了游戏的基本玩法、角色培养、资源获取等内容，帮助新手玩家快速上手原神。" // 文章摘要，显示在主页
comments:   false // 可省略，默认为 true。如果设置为 true，文章会显示评论区；否则不显示
copyrights: original // 可省略，默认为 original。如果设置为 original，文末会显示版权声明；否则不显示
draft:      true // 可省略，默认为 false。如果设置为 true，文章不会显示在主页上
archived:   true // 可省略，默认为 false。如果设置为 true，文章会被标记为已归档
```

您可能还需要修改 [`.github`](./.github) 文件夹下的工作流程文件、网站图标 [`favicon.svg`](./favicon.svg) 以及 [`CNAME`](./CNAME)，以适应您的需求。

文章中的图片存放在 [`assets/post/images`](./assets/post/images) 文件夹中。如果需要引用图片，请使用相对路径，例如：

```markdown
![图片描述](/assets/post/images/图片文件名.webp)
```

[`scripts`](./scripts) 文件夹下提供了脚本，可以帮助对图片进行压缩，也可以自动识别并清楚未使用的图片。如果你需要运行脚本，请先安装好 [webp](https://developers.google.com/speed/webp) 和 [svgo](https://github.com/svg/svgo)，然后运行：

```shell
cd scripts
compress_image.ps1 # 压缩图片
clean_image.ps1    # 清除未使用的图片
```

你可以使用 [`_test`](./_test) 文件夹下的测试文章进行测试。

### 插件系统

详见 [插件测试](./_test/2000-01-02-插件测试.md)。

### 独立网页文章

在文章的 front matter 中添加 `website`，即可在原有文章地址（如 `/post/my-article/`）
直接展示完整网页。网页不经过博客布局、Liquid 或 HTML 增强插件，没有博客的页眉、页脚、
侧栏、评论和分享组件。Markdown 仍用于主页、分类、标签、摘要、搜索和 RSS。

```yaml
---
layout: post
title: "我的交互文章"
date: 2026-09-13 00:00:00 +0800
categories: 技术
tags: 交互 可视化
summary: "这篇网页文章的摘要。"
website: my-article
draft: false
---

这里写供搜索与 RSS 阅读的介绍、总结和正文。
```

每篇网页的源码放在 `assets/post/websites/<目录名>/`。`website` 指向这个单独的目录，
目录名使用字母、数字、短横线或下划线。文章永久链接需以 `/` 结尾；支持站点 `baseurl`。
未被文章引用的项目不会构建或发布；生产环境的草稿不会构建网页，其文章地址跳转至 404。

#### 原生 HTML / CSS / JavaScript

```text
assets/post/websites/my-article/
├── index.html
├── style.css
├── main.js
└── images/
```

没有 `package.json` 时，插件直接发布源文件，不需要 Node.js。入口固定为 `index.html`；
使用 `./style.css`、`./main.js` 等相对地址。网页自行设置 `<title>`、description 等信息，
Markdown 的元数据不会自动插入原始 HTML。框架或库也可以通过浏览器 ESM / CDN 加载，
应锁定版本；远程依赖的可用性由对应服务决定。

可将 [网页测试文章](./_test/2000-01-04-website%20test.md) 复制到 `_posts/`，
预览 [原生网页示例源码](./assets/post/websites/standalone-demo/)。

#### 使用框架和 npm 库

有 `package.json` 时，插件在独立缓存工作目录运行 `npm ci --include=dev` 与
`npm run build`，默认发布 `dist/`。可以使用 React、Vue、Svelte、Astro 等能生成静态文件的
工具链，框架插件和配置由每个项目自己管理。需要服务器运行的 SSR / API 不在静态博客中运行；
使用对应框架的静态导出模式。

```text
assets/post/websites/my-article/
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
├── src/
└── public/
```

必须提交 `package-lock.json`，并在 `package.json` 中提供 `build` 脚本，例如 `vite build`。
本地与 CI 使用 Node.js 24 / npm；本地仍只需要运行 `bundle exec jekyll serve`，无需先逐篇打包。
不要使用 `--safe`，它会禁用自定义 Jekyll 插件。

插件给构建进程提供三个环境变量：

| 变量 | 用途 |
|------|------|
| `WEBSITE_BASE_URL` | 带 `baseurl` 的文章 URL，如 `/blog/post/my-article/` |
| `WEBSITE_OUTPUT_DIR` | 构建输出目录的绝对路径，默认是缓存工作目录中的 `dist/` |
| `WEBSITE_POST_FILE` | JSON 文件的绝对路径，包含 `title`、`summary`、`categories`、`tags`、`date`、`url`、`baseurl` 和 Markdown `content` |

Vite 配置可以这样接入（原有框架的 `plugins` 配置照常保留）：

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.WEBSITE_BASE_URL || './',
  build: {
    outDir: process.env.WEBSITE_OUTPUT_DIR || 'dist',
  },
});
```

Vite 会根据 `base` 调整导入资源的地址，参见 [Vite 构建文档](https://vite.dev/guide/build#public-base-path)。
其他工具也应配置自己的资源前缀和输出路径。如果工具固定输出 `out/`，可配置：

```yaml
website:
  source: my-article
  output: out
```

最终必须生成 `<输出目录>/index.html`。多页静态输出会保留子目录结构；客户端路由建议使用
hash 模式，或预生成各路由的 HTML，GitHub Pages 不提供任意路径的 SPA 回退。
构建失败或缺少入口会让 Jekyll 明确报错，避免部署空白文章。

#### 构建耗时与 Git 差异

插件按文章维护两层缓存，位置是 `.jekyll-cache/website-posts/`：

| 改动 | 网页构建行为 |
|------|--------------|
| 普通博客文章或主题 | 未变的网页复用产物 |
| 某篇网页的源码或 Markdown 元数据 / 正文 | 只打包该项目，复用 npm 依赖 |
| `package.json`、锁文件、`.npmrc`、Node / npm 版本 | 重新安装对应项目的依赖，再打包 |
| 文章 URL、站点 `baseurl`、构建环境或插件代码 | 重新打包，确保资源路径与产物匹配 |

GitHub Actions 会保存并恢复网页产物和依赖缓存。首次构建、缓存被清理或失效时仍需完整构建；
这些缓存只减少网页项目的额外开销，Jekyll 自身仍执行正常构建。`jekyll serve` 监测网页源码变化，
也支持 `--incremental`。框架项目需要高频交互调试时，可在项目目录使用自身的开发服务器与热更新。

Git 只提交可读源码、依赖声明、锁文件和必要资源，不提交 `node_modules`、打包文件或 sourcemap。
插件不会往源码目录安装依赖或写入产物；常见本地构建目录已加入 `.gitignore`，自定义输出目录需自行加入。
因此，修改几行文案不会产生压缩 JS、CSS 或带哈希文件名的大量差异。每个项目的锁文件独立，
普通源码修改不更新锁文件；拆分组件、样式和数据文件，不将整个应用打包成单行 HTML 再提交。

框架源码及未引用项目不会作为 `/assets/post/websites/` 下的静态文件公开。
原生项目除 README、隐藏文件和常见构建目录外按原样发布；npm 项目只发布构建输出。
`.env*` 不复制到构建工作目录，环境相关参数通过构建进程的环境变量提供；修改这些额外变量后应清理网页缓存，
因为插件只跟踪上表中列出的输入。升级依赖安装脚本使用的额外配置时，也应清理缓存重新安装。

插件回归验证（需要 Ruby 的 `minitest`、Jekyll 和 Node.js / npm）：

```shell
ruby scripts/test_website.rb
```

## 版权声明

本博客所有**文章**采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明出处。

本博客其余**代码**采用 [MIT](https://opensource.org/licenses/MIT) 许可协议。
