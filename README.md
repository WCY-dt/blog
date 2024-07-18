# Ch3nyang's blog

## 基本信息

本仓库为我的个人博客。博客使用了自己从头打造的 Jekyll 主题，主要存放一些技术性文章以及个人笔记。更新频率飘忽不定，尽量每个月更新至少一篇。

- [main 分支](https://github.com/WCY-dt/blog/tree/main) 为页面发布分支。
- [stale 分支](https://github.com/WCY-dt/blog/tree/stale) 为过时的主题，不再维护。

站点目前使用 GitHub Pages 托管，使用 Cloudflare 做 DNS 解析。

## 站点地址

- [个人主页](https://ch3nyang.top/)
- [博客主页](https://blog.ch3nyang.top/)
- [个人收藏夹](https://mind.ch3nyang.top/)

## 本地开发

你可以自由地将本博客的主题用于你的博客。

推荐使用 Visual Studio Code 编辑器，安装插件 [`Shopify Liquid`](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode) 和 [`markdownlint`](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) 以获得更好的开发体验。

构建前先安装好 Ruby 和 Jekyll，然后安装依赖：

```bash
bundle install
```

启动本地服务：

```bash
jekyll serve
```

然后使用 [`Live Server`](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 预览实时更新。

绝大多数设置都在 [`_config.yml`](./_config.yml) 文件中，你可以根据自己的需求进行修改。

博客文章存放在 [`_posts`](./_posts) 文件夹中，命名格式为 `YYYY-MM-DD-title.md`。博客文章的文件头应该包含以下信息：

```yaml
layout:     post
title:      "原神游玩指南"
date:       2000-01-01 00:00:00 +0800
categories: 游戏 // 只能有一个分类
tags:       开放世界 RPG 原神 // 可以有多个标签，用空格分隔
comments:   true // 如果设置为 true，文章会显示评论区；否则不显示
mathjax:    true // 暂时未支持关闭该功能
copyrights: 原创 // 如果设置为原创，文末会显示版权声明；否则不显示
draft:      true // 可省略，默认为 false。如果设置为 true，文章不会显示在主页上
```

您可能还需要修改 [`.github`](./.github) 文件夹下的工作流程文件、网站图标 [`favicon.svg`](./favicon.svg) 以及 [`CNAME`](./CNAME)，以适应您的需求。

## 开发路线

- [x] 个性主题
- [x] 文章分类
- [x] 文章标签
- [x] 文章系列
- [x] 代码高亮
- [x] 代码复制
- [ ] 代码行号
- [x] RSS 订阅
- [x] 响应式设计
- [x] SEO 优化
- [x] 版权声明
- [x] 性能优化
- [x] 文章搜索
- [x] 相关文章推荐
- [x] 评论系统
- [x] 文章目录
- [x] 文章分享
- [x] 主题切换

## 版权声明

本博客所有**文章**采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明出处。

本博客其余**代码**采用 [MIT](https://opensource.org/licenses/MIT) 许可协议。
