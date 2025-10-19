# Ch3nyang's blog

## 基本信息

本仓库为我的个人博客。博客使用了自己从头打造的 Jekyll 主题，主要存放一些技术性文章以及个人笔记。更新频率飘忽不定，尽量每个月尽量更新一篇。

👉 [https://blog.ch3nyang.top/](https://blog.ch3nyang.top/)

英文版本：[https://blog-en.ch3nyang.top/](https://blog-en.ch3nyang.top/)（仅部分文章）

## 功能特色

| 基础功能 | 内容组织 | 用户体验 | 增强功能 | 扩展插件 |
|----------|----------|----------|----------|----------|
| 个性主题 | 文章分类 | 响应式设计 | 代码高亮 | GitHub 插件 |
| RSS 订阅 | 文章标签 | 主题切换 | 代码复制 | 图片排版插件 |
| 评论系统 | 文章系列 | 无障碍访问 | 公式支持 | iframe 插件 |
| SEO 优化 | 文章目录 | 文章搜索 | 流程图支持 | 结果预览插件 |
| 性能优化 | 文章归档 | 文章分享 | 内容折叠 | 外部引用插件 |
|        | 草稿系统 | 版权声明 | 文章总结 |            |
|        |         | 文章推荐 | 全屏显示 |            |

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
mathjax:    true // 可省略，默认为 false。如果设置为 true，会启用数学公式支持
mermaid:    true // 可省略，默认为 false。如果设置为 true，会启用流程图支持
copyrights: original // 可省略，默认为 original。如果设置为 original，文末会显示版权声明；否则不显示
draft:      true // 可省略，默认为 false。如果设置为 true，文章不会显示在主页上
archived:   true // 可省略，默认为 false。如果设置为 true，文章会被标记为已归档
```

您可能还需要修改 [`.github`](./.github) 文件夹下的工作流程文件、网站图标 [`favicon.svg`](./favicon.svg) 以及 [`CNAME`](./CNAME)，以适应您的需求。

文章中的图片存放在 [`assets/post/images`](./assets/post/images) 文件夹中。如果需要引用图片，请使用相对路径，例如：

```markdown
![图片描述](/assets/post/images/图片文件名.webp)
```

[`scripts`](./scripts) 文件夹下提供了脚本，可以帮助将图片转换为 webp 格式，也可以自动识别并清楚未使用的图片。如果你需要运行脚本，请先安装好 [webp](https://developers.google.com/speed/webp) 工具。

你可以使用 [`_test`](./_test) 文件夹下的测试文章进行测试。

### 插件系统

详见 [插件测试](./_test/2000-01-02-插件测试.md)。

## 版权声明

本博客所有**文章**采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明出处。

本博客其余**代码**采用 [MIT](https://opensource.org/licenses/MIT) 许可协议。
