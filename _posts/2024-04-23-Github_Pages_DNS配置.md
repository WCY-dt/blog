---
layout: post
title:  "Github Pages DNS配置"
date:   2024-04-23 00:00:00 +0800
categories: 网络
tags: dns github
comments: 1
mathjax: true
copyrights: 原创
---

我的 GitHub 用户名是 `wcy-dt`，域名是 [ch3nyang.top](https://ch3nyang.top)，使用 cloudflare 进行 DNS 解析。我希望

1. [ch3nyang.top](https://ch3nyang.top) 访问到 [wcy-dt.github.io](https://wcy-dt.github.io)，且作为主域
2. [www.ch3nyang.top](https://www.ch3nyang.top) 访问到 [wcy-dt.github.io](https://wcy-dt.github.io)
3. [blog.ch3nyang.top](https://blog.ch3nyang.top) 访问到 [wcy-dt.github.io](https://wcy-dt.github.io)
4. [mind.ch3nyang.top](https://mind.ch3nyang.top) 访问到 [wcy-dt.github.io/mindclip](https://wcy-dt.github.io/mindclip)

下面是具体的解决方案：

1. 第 1 点是最容易的，根据 [Github 官方文档](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)，我们可以直接配置APEX域。通常配置四个A记录即可：

   ```dns
   A @ 185.199.108.153
   A @ 185.199.109.153
   A @ 185.199.110.153
   A @ 185.199.111.153
   ```

   然后在 [github.com/WCY-dt/wcy-dt.github.io](https://github.com/WCY-dt/wcy-dt.github.io) 仓库中添加 `CNAME` 文件：

   ```cname
   ch3nyang.top
   ```

   并在该仓库中进入 `Settings->Code and automation->Pages->Custom domain`，将其设置为 `ch3nyang.top`。保存即可。

   > 如果访问后出现“重定向次数过多”，这是因为 GitHub Pages 中打开了 Enforce HTTPS。此时需要在 cloudflare 的 `SSL/TLS->Overview` 里将 Off 或者 Flexible 改为 Full[^1]。

2. 第 2 点需要在 cloudflare 中再配置一条记录：

   ```dns
   CNAME www wcy-dt.github.io
   ```

3. 第 3 点首先在 cloudflare 的 `Rules->Redirect Rules` 里点击 Create rule，设置条件为 Hostname 等于 blog.ch3nyang.top，即

   ```expression
   (http.host eq "blog.ch3nyang.top")
   ```

   选择目的地址为 Dynamic 的 `concat("https://ch3nyang.top",http.request.uri.path)`，代码为 302，同时选中 Preserve query string。[^3]

   然后添加一条 DNS 记录：

   ```dns
   A blog 114.114.114.114
   ```

   其中，这个地址随意[^2]。

4. 第 4 点需要在 [github.com/WCY-dt/mindclip](https://github.com/WCY-dt/mindclip) 仓库中添加 `CNAME` 文件：

   ```cname
   mind.ch3nyang.top
   ```

   并且类似第 1 点，将 `Custom domain` 设置为 `mind.ch3nyang.top`。

   然后到 cloudflare 里添加一条记录：

   ```dns
   CNAME mind wcy-dt.github.io
   ```

[^1]: [https://www.9kr.cc/archives/181/](https://www.9kr.cc/archives/181/)
[^2]: [使用 Cloudflare 的 Page Rules 进行 URL 转发和域名重定向教程](https://www.okaa.io/index.php/2023/09/02/%E4%BD%BF%E7%94%A8-cloudflare-%E7%9A%84-page-rules-%E8%BF%9B%E8%A1%8C-url-%E8%BD%AC%E5%8F%91%E5%92%8C%E5%9F%9F%E5%90%8D%E9%87%8D%E5%AE%9A%E5%90%91%E6%95%99%E7%A8%8B/)
[^3]: [Definitive Guide on Cloudflare Redirects](https://epsilonsynapse.com/tech-salvation/definitive-guide-on-cloudflare-redirects/)
