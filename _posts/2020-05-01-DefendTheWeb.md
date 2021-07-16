---
layout: post
title:  "【HackGame】DefendTheWeb <img src='https://img.shields.io/badge/-原创-019733?style=flat'> <img src='https://img.shields.io/badge/-未完待续-blue?style=flat'>"
date:   2020-05-01 00:00:00 +0800
categories: security
tags: game
comments: 1
mathjax: true
---

![](https://pic3.zhimg.com/v2-0017ac4e4fc513fce5f9fb7480c78bcf_1200x500.jpg)

本文介绍了[DefendTheWeb](https://defendtheweb.net/)的部分通关方法（目前更新到Intro9，剩下的如果大家做出来了欢迎发在评论区）

# Intro1

注意需要找到的是可以登陆这个虚拟系统的密码，而不是你在defendtheweb的账号密码。

非常简单，简单到有点傻。

在Chrome里面右键`View Source`， 搜索`password`发现：

```html
<!-- username: deathdog, password: a2e3369fe0 -->
```

所以程序员把账号密码写在了注释里（估计现实中不会有这么傻的程序员）。

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

把这些2进制数字转成16进制

# Intro 9

按照老办法打开源代码，没有什么收获。但是发现这一关多了一个选项`Request details`

打开以后发现是一个找回密码的输入条，需要输入邮箱，试了自己的邮箱发现不对。

然后打开了这个找回密码页面的源代码，发现：

```html
<input type="hidden" name="email2" id="email2" value="admin@defendtheweb.net" maxlength="" placeholder="" class="u-full-width">
```

`email1`里面需要输入跟`email2`里面一样的地址，所以把`email2`的`value`改成了自己的邮箱，然后再在页面上输入我自己的邮箱

**未完待续……**