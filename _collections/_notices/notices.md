---
layout: post
title:  "博客更新预告"
date:   2022-11-24 00:00:00 +0800
comments: 0
mathjax: true
copyrights: 原创
---

静态博客一直有个痛点，就是评论系统不好搞。

之前试过很多种，比如 Disqus、Gitalk、Valine 等等，但都不是很理想。它们有的收费了、有的倒闭了、有个自定义功能太差。而且每次换评论系统后，之前的评论就全没了。

所以，我决定把整个博客重构，撸一个后端出来，然后扔到服务器上。暂定的技术栈：

- 前端：Vue + Tailwind
- 后端：SpringBoot + MybatisPlus + SpringSecurity + EasyExcel + Swagger2 + Redis

目前的计划如下：

- [ ] 8.31 完成基础功能（前台+后台+前端），并且部署到我的树莓派服务器上
- [ ] 9.30 完成文章抓取系统，自动从github上抓取我写好的 md 文件
- [ ] 10.31 SEO 优化、广告接入

敬请期待~