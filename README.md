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
|        |         |          |       | 独立网页插件 |

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

AI 撰写或修改文章前，请先阅读根目录的 [AGENTS.md](./AGENTS.md)。其中包含文风、大纲与逐段生成流程、插图约定、元数据和插件语法。

博客文章存放在 [`_posts`](./_posts) 文件夹中，命名格式为 `YYYY-MM-DD-title.md`。博客文章的文件头应该包含以下信息：

```yaml
layout:     post
title:      "原神游玩指南"
date:       2000-01-01 00:00:00 +0800
categories: 游戏 // 只能有一个分类
tags:       open-world RPG genshin-impact // 可以有多个标签，用空格分隔
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

使用 `result`（包括静态输出）、`code_runner` 或 `iframe` 的文章会自动添加“实验”标签，在文章列表中突出显示，并可通过标签页集中浏览；也可在文章头部设置 `experiment: true` 手动纳入，或 `experiment: false` 排除自动识别。

封面画廊自动展示未归档文章的全部封面，排除默认占位图，同系列及相同图片各保留一份；点击封面进入对应文章。生产构建会排除草稿。画廊以双排错位缓慢循环，可拖动或暂停，系统开启“减少动态效果”时默认静止。

首页沿用原始封面，不生成额外图片。首屏主图优先加载，其余图片延迟加载；画廊接近视口时才加载可见及相邻封面，远处图片释放引用。画廊离屏或网页处于后台时停止动画。

当最新的可展示文章属于系列时，首页合并最近连续发布的同系列文章，遇到其它可展示文章即停止。合并区共用一张封面，按系列篇序提供独立入口；默认展开最新三篇，更多篇章可展开查看，下方最近文章不再重复列出。归档与生产环境草稿不参与这批更新；仅有一篇时保留单篇主推版式。选择逻辑可用 `bundle exec ruby _test/home_feature_test.rb` 验证。

“最近文章”沿用相同的连续系列合并规则，显示主推之后的最近三组更新；独立文章算一组，连续系列文章也算一组。每组系列共用一张封面，默认展开最新三篇并按篇序排列，其余可以展开查看；被其它文章隔开的同系列更新不会跨批合并。

首页的系列阅读可通过 `_config.yml` 中的 `featured_series` 指定详细展示的系列，值须与文章的 `series` 完全一致；留空、名称无效或该系列不可展示时，自动使用最近更新的系列。其余系列与系列目录页均按各系列最新文章的发布时间倒序排列，系列内部仍按 `series_index` 排列。生产环境草稿不参与排序，全部归档的系列不展示。

长文阅读位置只保存在当前浏览器，最多保留 30 篇、30 天。再次进入文章时可选择继续阅读或忽略；读到正文末尾会清除该篇记录。

详见 [插件测试](./_test/2000-01-02-plugin%20test.md)。

### 字体与触屏

文字字体统一在 [`_sass/_typography.scss`](./_sass/_typography.scss) 配置，不下载额外字体。英文优先 Helvetica Neue / Helvetica，其次 Arial、Liberation Sans；中文按本机可用字体选择苹方、微软雅黑、Noto Sans CJK SC。代码优先 SFMono-Regular / Consolas / Liberation Mono / Menlo，中文优先已有的更纱黑体、Noto 等宽字族，再回退到正文中文字体。正文、工具、脚注、评论、Mermaid 和 RSS 共用这些配置，独立演示内作者自定义的字体不受影响。

字体存在与否及中文字宽取决于操作系统，使用本机字体不能保证各系统字形完全一致。回退策略依据 [MDN 字体匹配说明](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-family)，平台字体参考 [Apple 字体列表](https://developer.apple.com/fonts/system-fonts/) 与 [Windows 11 字体列表](https://learn.microsoft.com/en-us/typography/fonts/windows_11_font_list)。

触屏样式集中在 [`_sass/_touch.scss`](./_sass/_touch.scss)，按输入能力匹配，包括带鼠标的触屏笔记本。独立操作区至少 44px；表格和图表工具常显并在内部预留空间，正文行内链接维持自然排版。主触屏设备不显示鼠标专用提示、列宽拖动手柄或鼠标位移动效；代码、图片和表格仍可通过明确按钮操作。

### RSS 订阅

导航中的 RSS 进入 `/rss/` 订阅说明页，实际订阅地址仍为 `/feed.xml`。所有页面均声明 RSS 自动发现链接，支持的阅读器可从说明页找到订阅源；说明页同时明确提示正确地址。

订阅源不再依赖 XSLT，浏览器直访采用独立 CSS。RSS 提供最近 20 篇已发表文章的摘要与完整静态正文：代码、表格、静态输出、目录树与引用保留可读内容；交互演示提供原文章节入口，Mermaid 和公式保留源码。转换只作用于订阅内容，不影响站内插件。

## 版权声明

本博客所有**文章**采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明出处。

本博客其余**代码**采用 [MIT](https://opensource.org/licenses/MIT) 许可协议。
