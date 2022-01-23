---
layout: post
title:  "【HackGame】DefendTheWeb"
date:   2020-05-01 00:00:00 +0800
categories: security
tags: game
comments: 1
mathjax: true
copyrights: 原创 未完待续
---

![](https://pic3.zhimg.com/v2-0017ac4e4fc513fce5f9fb7480c78bcf_1200x500.jpg)

本文介绍了[DefendTheWeb](https://defendtheweb.net/)的部分通关方法

# Intro1

注意需要找到的是可以登陆这个虚拟系统的密码，而不是你在defendtheweb的账号密码。

非常简单，简单到有点傻。

在Chrome里面右键`View Source`， 搜索`password`发现：

```html
<!-- username: deathdog, password: a2e3369fe0 -->
```

所以程序员把账号密码写在了注释里。

# Intro 2

和1非常类似，先看源码，发现账号和密码被写在了html里面，只不过字体颜色被设置成了黑色，所以在黑色背景下不可见。所以除了在代码里找到账号密码，还可以直接在页面上框选显示。

```
Username is evil_kitten
Password is 6ac0bb7f83
```

# Intro 3

同样打开源代码，搜索`password`,这回发现题目没有那么傻，密码没有直接写在`form`里面。然后搜索`form`的名字`level-form`，以找到哪里调用或者控制了`level-form`，找到下面的`js`代码：

```javascript
$(function()
{ 
	$('.level form').submit(function(e)
	{ 
		e.preventDefault(); 
		if(document.getElementById('password').value == correct)
        {
        	document.location = '?pass=' + correct;
        } 
        else 
        { 
        	alert('Incorrect password')
        } 
    })
})
```

所以这一关的账号密码是hardcode在了`js`里面。

# Intro 4

再次打开代码，搜索`password`发现

```html
<input type="hidden" name="passwordfile" value="../../extras/ssap.xml">
```

所以密码是被保存在了一个在`ssap.xml`的文件里。

在浏览器里输入`value`里面的路径得到：

```html
{
    "username": "thomas",
    "password": "S9234HKFnsd"
}
```

# Intro 5

打开页面以后直接弹出alert要求输入密码，先随便输入一个，显示`Unauthorized access`

打开代码，搜索`password`,找到一下js代码：

```javascript
var pass;
pass=prompt("Password","");
if (pass=="e256a02c7e") {
   window.location.href="?password=e256a02c7e";
}
```

# Intro 6

这关没有可以键盘输入的地方，开局只有一个drop-down list.

同样打开源代码，找到代码：

```html
<div class="12 columns level-description">
                Login as skullbone to complete the level
            </div>
```

所以知道是要`Login as skullbone`才可以过关。可是在drop-down list里面没有skullbone。

把drop-down list里面的某个值改成`skullbone`, 或者多添加一个skullbone的选项。

# Intro 7

照例打开源代码，搜索`password`，这次却什么线索都没有发现。

如果想对搜索引擎隐藏网站内容，可以在网站顶级目录下建立一个叫做`robots.txt`的文件，在里面声明哪些内容对搜索引擎可见/不可见。

所以，打开`robots.txt`文件`https://defendtheweb.net/robots.txt`查看：

```
User-agent: *
Allow: /
Disallow: /help/contact
Disallow: /profile/
Disallow: /extras/
Disallow: /extras/playground/jf94jhg03.txt

User-agent: Mediapartners-Google
Disallow:
```

然后同在`https://www.hackthis.co.uk/levels/extras/userpass.txt`里面找到

```
visualmaster
0ff735d018
```

# Intro 8

老办法，看代码发现

```html
<input type="hidden" name="file" id="file" value="../../extras/playground/48w3756.txt" maxlength="" placeholder="" class="u-full-width">
```

所以又是把密码存在了文本文件的老套路，打开`https://defendtheweb.net/extras/playground/48w3756.txt`看到：

```
01100010 01110101 01110010 01101110 01100010 01101100 01100001 01111010 01100101 
01001100 01110000 00111001 01000101 01001101 00110010 00110111 01000111 01010010 
```

把这些2进制数字转成 ascii 字符，得到用户名为 burnblaze 及密码。

# Intro 9

按照老办法打开源代码，没有什么收获。但是发现这一关多了一个选项`Request details`

打开以后发现是一个找回密码的输入条，需要输入邮箱，试了自己的邮箱发现不对。

然后打开了这个找回密码页面的源代码，发现：

```html
<input type="hidden" name="email2" id="email2" value="admin@defendtheweb.net" maxlength="" placeholder="" class="u-full-width">
```

`email1`里面需要输入跟`email2`里面一样的地址，所以把`email2`的`value`改成了自己的邮箱，然后再在页面上输入我自己的邮箱

没想到它就直接给了账号密码。

# Intro 12

给了一串东西，一眼 md5。

随便找个在线站点解密一下即可。

# 24 bit

进去让你下载一个 txt。下载下来，打开后发现乱码。

查看二进制文件，发现文件是以 `42 4D` 开头的。显然，这是一个 bmp 文件。于是，更改后缀名，打开文件，得到答案：用户名为 paint，密码为 rules。

# World of Peacecraft / Realistic

这一关属实无聊，密码明文写在 email 的回收站里。

# Secure agent

涉及到了 get 方法中的 User-Agent 字段。我们需要将其修改为 secure_user_agent。

这里我用 burp suite 修改的。

```
GET /playground/secure-agent HTTP/1.1
Host: defendtheweb.net
User-Agent: secure_user_agent
```

# Crypt 1 / Crypt

文字反过来了。

```
Hello, welcome to the crypt levels on hackthis. These levels are all about decryption and logic, you will need to employ a lot of brain power. To complete this level enter this pass: woocrypt
```

# Beach

图片下载下来折腾了好久，一直以为是什么高深的隐写方法。

最后发现答案在属性中。

```
用户名：james
密码：chocolate
```

# Intro 3 / Javascript

检查网页源码。注意到里面有这样两句：

```html
<script>var correct = 'f39a24a537';</script>
```

```html
if(document.getElementById('password').value == correct)
```

# Squashed image / Stego

查看图片二进制文件，在最后看到了

```
secret.txtuser: adminpass: safe
```

# Library Gateway / Realistic

注意到有

```javascript
URL= "members/" + username + " " + password + ".htm";
```

所以我们直接访问 https://defendtheweb.net/extras/playground/real/2/members/

这里面能看到一个 librarian sweetlittlebooks.htm。这便是用户名和密码。

# HTTP method / Intro

没搞出来

# Crypt 2 / Crypt

一眼凯撒密码，偏移为 4

```
Welcome back, this level is not as easy as the last but still not too challenging. So go ahead and enter this pass: shiftthatletter
```

# Sid / Intro

控制台输入

```javascript
console.log(document.cookie);
```

得到了

```
i3_access=false;
```

我们修改它

```javascript
document.cookie="i3_access=true";
```

# Intro 10 / Javascript

和上面有一题几乎一模一样。

```html
<script type='text/javascript'>document['thecode'] = '\x30\x64\x34\x62\x36\x38\x37\x32\x35\x36'</script>
```

然后转换成 ascii 即可。

# SQLi 1 / SQLi

最简单的 sql 绕过，直接用户名输入 `' OR 1=1;#`

# Crypt 3 / Crypt

这个字符格式不标准，我们先处理一下。

```morse
.... .. --..-- / - .... .- -. -.- ... / - --- / ... .- -- ..- . .-.. / -- --- .-. ... . / - .... . / - .-. .- -. ... -- .. ... ... .. --- -. / --- ..-. / - . .-.. . --. .-. .- .--. .... .. -.-. / .. -. ..-. --- .-. -- .- - .. --- -. / .-- .- ... / ... - .- -. -.. .- .-. -.. .. --.. . -.. .-.-.- / .... . / ..- ... . -.. / -.. --- - ... / .- -. -.. / -.. .- ... .... . ... / - --- / -.-. .-. . .- - . / .- / ... - .- -. -.. .- .-. -.. / .-- .- -.-- / --- ..-. / -.-. --- -- -- ..- -. .. -.-. .- - .. --- -. --..-- / .... . / .... .- ... / .... . .-.. .--. . -.. / -.-- --- ..- / - --- -.. .- -.-- / - --- / --. . - / - .... . / .--. .- ... ... ---... / - .... .- -. -.- -.-- --- ..- ... .. .-.
```

翻译得到

```
HI, THANKS TO SAMUEL MORSE THE TRANSMISSION OF TELEGRAPHIC INFORMATION WAS STANDARDIZED. HE USED DOTS AND DASHES TO CREATE A STANDARD WAY OF COMMUNICATION, HE HAS HELPED YOU TODAY TO GET THE PASS: THANKYOUSIR
```

# Intro 11 / Javascript

观察页面 url，发现我们在 input。因此访问 output 看看。

果然找到了密码。

# Recon

获取 ip 可以直接 ping，或者更正规的方法是 nslookup。

运营商使用 whois 查询。

B6-key 在请求头中。

