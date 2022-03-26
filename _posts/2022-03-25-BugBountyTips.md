---
layout: post
title:  "Bug Bounty Tips"
date:   2022-03-19 00:00:00 +0800
categories: 安全
tags: bug
comments: 1
mathjax: true
copyrights: 转载 翻译
---

This is another dose of bug bounty tips from the bug hunting community on Twitter, sharing knowledge for all of us to help us find more vulnerabilities and collect bug bounties. [翻译]

# 1. Heartbleed 漏洞

用一行命令检查 OpenSSL Heartbleed 漏洞的主机名列表（`list.txt` 存储可能存在漏洞的 url 或者 ip）：

```shell
cat list.txt | while read line ; do echo "QUIT" | openssl s_client -connect $line:443 2>&1 | grep 'server extension "heartbeat" (id=15)' || echo $line: safe; done
```

# 2.使用grep提取网址

从数据中提取 URL：

```shell
cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
curl http://host.xx/file.js | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
```

# 3.从APK中提取信息

从解压的 APK 文件中提取潜在敏感信息：

```shell
grep -EHirn "accesskey|admin|aes|api_key|apikey|checkClientTrusted|crypt|http:|https:|password|pinning|secret|SHA256|SharedPreferences|superuser|token|X509TrustManager|insert into" APKfolder/
```

使用这一单行代码，我们可以识别 URL、API 密钥、身份验证token、凭证、证书固定代码等等。

确保已经使用 apktool 解压了 APK 文件：

```shell
apktool d app_name.apk
```

# 4.远程解压zip文件

在远程 Web 服务器上发现了一个非常大的 zip 文件，并且想要检查其内容，但又不等待下载：

```shell
pip install remotezip
# list contents of a remote zip file
remotezip -l "http://site/bigfile.zip"
# extract file.txt from a remote zip file
remotezip "http://site/bigfile.zip" "file.txt"
```

请注意，要使其正常工作，托管 zip 文件的远程 Web 服务器必须支持range HTTP header。

# 5. open redirect 漏洞

以下是发现 Open Redirect 漏洞的部分 url

```shell
/{payload}
?next={payload}
?url={payload}
?target={payload}
?rurl={payload}
?dest={payload}
?destination={payload}
?redir={payload}
?redirect_uri={payload}
?redirect_url={payload}
?redirect={payload}
/redirect/{payload}
/cgi-bin/redirect.cgi?{payload}
/out/{payload}
/out?{payload}
?view={payload}
/login?to={payload}
?image_url={payload}
?go={payload}
?return={payload}
?returnTo={payload}
?return_to={payload}
?checkout_url={payload}
?continue={payload}
?return_path={payload}
```

# 6. JWT token 绕过

以下是绕过 JWT token 身份验证的 3 个技巧。

- 方法一
  1. 捕获 JWT。
  2. 将算法更改为 None。
  3. 使用您想要的任何内容更改正文中声明的内容，例如：`email:attacker@gmail.com`
  4. 使用修改后的 token 发送请求并检查结果。
- 方法二
  1. 捕获 JWT token。
  2. 如果算法是 RS256 更改为 HS256 并使用公钥签署 token（您可以通过访问 jwks Uri 获得站点 https 证书中的公钥）
  3. 使用修改后的 token 发送请求并检查响应。
  4. 如果后端没有算法检查，则存在漏洞。
- 方法三
  1. 检查应用程序是否使用 JWT token进行身份验证。
  2. 如果是这样，请登录到应用程序并捕获 token。（大多数网络应用程序将 token 存储在浏览器的本地存储中）
  3. 从应用程序中注销。
  4. 现在使用之前捕获的token向特权端点发出请求。
  5. 有时，请求会成功，因为 Web 应用程序只是从浏览器中删除token，并且不会将后端的 token 列入黑名单。

# 7. 寻找子域名

查找子域名：

```bash
#!/bin/bash
# $1 => example.domain

amass enum --passive -d $1 -o domains_$1
assetfinder --subs-only $1 | tee -a domains_$1

subfinder -d $1 -o domains_subfinder_$1
cat domains_subfinder_$1 | tee -a domains_$1

sort -u domains_$1 -o domains_$1
cat domains_$1 | filter-resolved | tee -a domains_$1.txt
```

我们必须安装几个额外的工具：

- https://github.com/OWASP/Amass
- https://github.com/tomnomnom/assetfinder
- https://github.com/projectdiscovery/subfinder
- https://github.com/tomnomnom/hacks/tree/master/filter-resolved

# 8. curl + parallel

快速验证主机名和子域名：

```shell
cat alive-subdomains.txt | parallel -j50 -q curl -w 'Status:%{http_code}\t  Size:%{size_download}\t %{url_effective}\n' -o /dev/null -sk
```

这个程序将并行生成 50 个 curl 实例，并显示每个主机的 HTTP 状态代码和响应大小（以字节为单位）

请确保已经安装了 parallel：

```shell
apt-get -y install parallel
```

# 9.简单的 XSS 检查

使用多个链接在一起的开源工具来识别 XSS 漏洞：

```bash
#!/bin/bash
# $1 => example.domain

subfinder -d $1 -o domains_subfinder_$1
amass enum --passive -d $1 -o domains_$1

cat domains_subfinder_$1 | tee -a domain_$1
cat domains_$1 | filter-resolved | tee -a domains_$1.txt

cat domains_$1.txt | ~/go/bin/httprobe -p http:81 -p http:8080 -p https:8443 | waybackurls | kxss | tee xss.txt
```

需要安装的额外工具：

- https://github.com/projectdiscovery/subfinder
- https://github.com/OWASP/Amass
- https://github.com/tomnomnom/hacks/tree/master/filter-resolved
- https://github.com/tomnomnom/httprobe
- https://github.com/tomnomnom/waybackurls
- https://github.com/tomnomnom/hacks/tree/master/kxss

# 10. 过滤 Burp Suite 中的噪音

在使用 Burp Suite 进行测试时，您可能希望将这些模式添加到 `Burp Suite` > `Proxy` > `Options` > `TLS Pass Through` 设置中：

```
.*\.google\.com
.*\.gstatic\.com
.*\.googleapis\.com
.*\.pki\.goog
.*\.mozilla\..*
```

# 11. 使用 SecurityTrails API 查找子域

使用 SecurityTrails API 来枚举子域名：

```
curl -s --request GET --url https://api.securitytrails.com/v1/domain/target.com/subdomains?apikey=API_KEY | jq '.subdomains[]' | sed 's/\"//g' >test.txt 2>/dev/null && sed "s/$/.target.com/" test.txt | sed 's/ //g' && rm test.txt
```

请注意，要使其正常工作，我们需要一个 SecurityTrails API 密钥。我们可以获得一个免费帐户，每月有 50 个 API 查询（在撰写本文时）。有关其他选项，请参见[此处](https://securitytrails.com/corp/pricing#api)。

## 12.访问隐藏的注册页面

有时，开发人员认为隐藏一个按钮就足够了。尝试访问以下注册 URI：

| **Sign-up URI**                 | **CMS platform** |
| ------------------------------- | ---------------- |
| `/register`                     | Laravel          |
| `/user/register`                | Drupal           |
| `/wp-login.php?action=register` | WordPress        |
| `/register`                     | eZ Publish       |

# 13. 常用 Google dorks

以下是用于识别有关我们目标的有趣和潜在敏感信息的 Google dorks：

```
inurl:example.com intitle:"index of"
inurl:example.com intitle:"index of /" "*key.pem"
inurl:example.com ext:log
inurl:example.com intitle:"index of" ext:sql|xls|xml|json|csv
inurl:example.com "MYSQL_ROOT_PASSWORD:" ext:env OR ext:yml -git
```

有了这些 dork，我们能找到目录列表、日志文件、私钥、电子表格、数据库文件等。

还可以查看 [exploit-db.com](https://www.exploit-db.com/) 以找到更多 dork！

# 14. 在 Drupal 上查找隐藏页面

如果您在 Drupal 网站上搜索，请在 `/node/$` 上使用 Burp Suite Intruder（或任何其他类似工具）进行模糊测试，其中 `$` 是一个数字（从 1 到 500）。例如：

- `https://target.com/node/1`
- `https://target.com/node/2`
- `https://target.com/node/3`
- …
- `https://target.com/node/499`
- `https://target.com/node/500`

我们很可能会找到搜索引擎未引用的隐藏页面（测试、开发）。