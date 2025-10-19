---
layout:     post
title:      "DefendTheWeb"
date:       2021-10-01 00:00:00 +0800
categories: 安全
tags:       game
summary:    "本文介绍了 DefendTheWeb 的部分通关方法。"
mathjax:    true
archived:   true
---

本文介绍了[DefendTheWeb](https://defendtheweb.net/)的部分通关方法

![defendtheweb icon](/assets/post/images/defendtheweb1.webp)

## Intro1

注意需要找到的是可以登陆这个虚拟系统的密码，而不是你在defendtheweb的账号密码。

非常简单，简单到有点傻。

在Chrome里面右键`View Source`， 搜索`password`发现：

```html
<!-- username: deathdog, password: a2e3369fe0 -->
```

所以程序员把账号密码写在了注释里。

## Intro 2

和1非常类似，先看源码，发现账号和密码被写在了html里面，只不过字体颜色被设置成了黑色，所以在黑色背景下不可见。所以除了在代码里找到账号密码，还可以直接在页面上框选显示。

```plaintext
Username is evil_kitten
Password is 6ac0bb7f83
```

## Intro 3

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

## Intro 4

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

## Intro 5

打开页面以后直接弹出alert要求输入密码，先随便输入一个，显示`Unauthorized access`

打开代码，搜索`password`,找到一下js代码：

```javascript
var pass;
pass=prompt("Password","");
if (pass=="e256a02c7e") {
   window.location.href="?password=e256a02c7e";
}
```

## Intro 6

这关没有可以键盘输入的地方，开局只有一个drop-down list.

同样打开源代码，找到代码：

```html
<div class="12 columns level-description">
                Login as skullbone to complete the level
            </div>
```

所以知道是要`Login as skullbone`才可以过关。可是在drop-down list里面没有skullbone。

把drop-down list里面的某个值改成`skullbone`, 或者多添加一个skullbone的选项。

## Intro 7

照例打开源代码，搜索`password`，这次却什么线索都没有发现。

如果想对搜索引擎隐藏网站内容，可以在网站顶级目录下建立一个叫做`robots.txt`的文件，在里面声明哪些内容对搜索引擎可见/不可见。

所以，打开`robots.txt`文件`https://defendtheweb.net/robots.txt`查看：

```plaintext
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

```plaintext
visualmaster
0ff735d018
```

## Intro 8

老办法，看代码发现

```html
<input type="hidden" name="file" id="file" value="../../extras/playground/48w3756.txt" maxlength="" placeholder="" class="u-full-width">
```

所以又是把密码存在了文本文件的老套路，打开`https://defendtheweb.net/extras/playground/48w3756.txt`看到：

```plaintext
01100010 01110101 01110010 01101110 01100010 01101100 01100001 01111010 01100101 
01001100 01110000 00111001 01000101 01001101 00110010 00110111 01000111 01010010 
```

把这些2进制数字转成 ascii 字符，得到用户名为 burnblaze 及密码。

## Intro 9

按照老办法打开源代码，没有什么收获。但是发现这一关多了一个选项`Request details`

打开以后发现是一个找回密码的输入条，需要输入邮箱，试了自己的邮箱发现不对。

然后打开了这个找回密码页面的源代码，发现：

```html
<input type="hidden" name="email2" id="email2" value="admin@defendtheweb.net" maxlength="" placeholder="" class="u-full-width">
```

`email1`里面需要输入跟`email2`里面一样的地址，所以把`email2`的`value`改成了自己的邮箱，然后再在页面上输入我自己的邮箱

没想到它就直接给了账号密码。

## Intro 12

给了一串东西，一眼 md5。

随便找个在线站点解密一下即可。

## 24 bit

进去让你下载一个 txt。下载下来，打开后发现乱码。

查看二进制文件，发现文件是以 `42 4D` 开头的。显然，这是一个 bmp 文件。于是，更改后缀名，打开文件，得到答案：用户名为 paint，密码为 rules。

## World of Peacecraft / Realistic

这一关属实无聊，密码明文写在 email 的回收站里。

## Secure agent

涉及到了 get 方法中的 User-Agent 字段。我们需要将其修改为 secure_user_agent。

这里我用 burp suite 修改的。

```http
GET /playground/secure-agent HTTP/1.1
Host: defendtheweb.net
User-Agent: secure_user_agent
```

## Crypt 1 / Crypt

文字反过来了。

```plaintext
Hello, welcome to the crypt levels on hackthis. These levels are all about decryption and logic, you will need to employ a lot of brain power. To complete this level enter this pass: woocrypt
```

## Beach

图片下载下来折腾了好久，一直以为是什么高深的隐写方法。

最后发现答案在属性中。

```plaintext
用户名：james
密码：chocolate
```

## Intro 3 / Javascript

检查网页源码。注意到里面有这样两句：

```html
<script>var correct = 'f39a24a537';</script>
```

```html
if(document.getElementById('password').value == correct)
```

## Squashed image / Stego

查看图片二进制文件，在最后看到了

```plaintext
secret.txtuser: adminpass: safe
```

## Library Gateway / Realistic

注意到有

```javascript
URL= "members/" + username + " " + password + ".htm";
```

所以我们直接访问 [https://defendtheweb.net/extras/playground/real/2/members/](https://defendtheweb.net/extras/playground/real/2/members/)

这里面能看到一个 librarian sweetlittlebooks.htm。这便是用户名和密码。

## HTTP method / Intro

加一个输入框和提交按钮

```html
<form method="POST">
    <input type="password" name="password" id="password" value="509f5eccb5">
    <input type="hidden" name="token" id="token" value="42a34d1d825e6533b7d2be0b474734ce4947114dcf81e4291bbf48d716c695fc" maxlength="" placeholder="" class="u-full-width">
    <input type="submit" value="Submit">
</form>
```

## Crypt 2 / Crypt

一眼凯撒密码，偏移为 4

```plaintext
Welcome back, this level is not as easy as the last but still not too challenging. So go ahead and enter this pass: shiftthatletter
```

## Sid / Intro

控制台输入

```javascript
console.log(document.cookie);
```

得到了

```plaintext
i3_access=false;
```

我们修改它

```javascript
document.cookie="i3_access=true";
```

## Intro 10 / Javascript

和上面有一题几乎一模一样。

```html
<script type='text/javascript'>document['thecode'] = '\x30\x64\x34\x62\x36\x38\x37\x32\x35\x36'</script>
```

然后转换成 ascii 即可。

## SQLi 1 / SQLi

最简单的 sql 绕过，直接用户名输入 `' OR 1=1;#`

## Crypt 3 / Crypt

这个字符格式不标准，我们先处理一下。

```plaintext
.... .. --..-- / - .... .- -. -.- ... / - --- / ... .- -- ..- . .-.. / -- --- .-. ... . / - .... . / - .-. .- -. ... -- .. ... ... .. --- -. / --- ..-. / - . .-.. . --. .-. .- .--. .... .. -.-. / .. -. ..-. --- .-. -- .- - .. --- -. / .-- .- ... / ... - .- -. -.. .- .-. -.. .. --.. . -.. .-.-.- / .... . / ..- ... . -.. / -.. --- - ... / .- -. -.. / -.. .- ... .... . ... / - --- / -.-. .-. . .- - . / .- / ... - .- -. -.. .- .-. -.. / .-- .- -.-- / --- ..-. / -.-. --- -- -- ..- -. .. -.-. .- - .. --- -. --..-- / .... . / .... .- ... / .... . .-.. .--. . -.. / -.-- --- ..- / - --- -.. .- -.-- / - --- / --. . - / - .... . / .--. .- ... ... ---... / - .... .- -. -.- -.-- --- ..- ... .. .-.
```

翻译得到

```plaintext
HI, THANKS TO SAMUEL MORSE THE TRANSMISSION OF TELEGRAPHIC INFORMATION WAS STANDARDIZED. HE USED DOTS AND DASHES TO CREATE A STANDARD WAY OF COMMUNICATION, HE HAS HELPED YOU TODAY TO GET THE PASS: THANKYOUSIR
```

## Intro 11 / Javascript

观察页面 url，发现我们在 input。因此访问 output 看看。

果然找到了密码。

## Recon

ip 和运营商可以用 whois 查询，这里提供一个比较好的：[https://digital.com/best-web-hosting/who-is/#search=defendtheweb.net](https://digital.com/best-web-hosting/who-is/#search=defendtheweb.net)

B6-key 在请求头中。

IP：`3.10.42.19`

server：`Amazon.com`

B6-Key：`goobles`

## Crypt 4 / Crypt

```plaintext
Dc, gdcl cl h lcrcshn ckqh gz sqwqs guz. Gdcl gcrq qhyd sqggqn cl hllcomqk h ljqycacqk nqshgczmldcj ucgd hmzgdqn sqggqn. Jhll: cdhwqancqmkl
```

分析字母频率与组合（可以试试[Substitution cipher tool](http://www.chaos.org.uk/~eddy/craft/substitute.html)），可以得到

```plaintext
Hi, this is a similar idea to level two. This time each letter is assigned a specified relationship with another letter. Pass: ihavefriends
```

## Map it

根据题目名字提示，我们 nmap 一下

```shell
nmap defendtheweb.net | grep unknown
```

然后尝试得到

```shell
$ nc defendtheweb.net 6776
Welcome weary traveller. I believe you are looking for this: mapthat
```

## Crypt 5 / Crypt

先反转，再和 crypt4 一样的方法

```plaintext
Yes i am a criminal. My crime is that of curiosity. My crime is that of judging people by what they say and think, not what they look like. My crime is that of outsmarting you, Something that you will never forgive me for. But the pass: TheMentor
```

## SQLi 2 / SQLi

首先再 url 栏瞎输入点东西，得到 sql 查询语句

```sql
DEBUG: SELECT username, admin FROM members WHERE username LIKE 'A'%'
```

因此直接构造输入得到 admin 账号 bellamond

`https://defendtheweb.net/playground/sqli2?q=A' OR admin=1;#`

再得到密码 1b774bc166f3f8918e900fcef8752817bae76a37

`https://defendtheweb.net/playground/sqli2?q=' UNION ALL SELECT password,2 FROM members WHERE admin=1;#`

这是个 sha1 加密的串，解密得到 sup3r

## Princess slag / Realistic

一眼漏洞，访问

[https://defendtheweb.net/extras/playground/princess-slag/?p=../admin.php](https://defendtheweb.net/extras/playground/princess-slag/?p=../admin.php)

看到了 php 源码

```php
<!--?php
    session_start();
    if(isset($_GET['password']) ){
        if( $_GET['password'] == '36d545e033'){
            echo "Correct password"
        } else {
            echo "Incorrect password";
        }
    }
?-->
```

## Xmas '08 / Realistic

随便提交一个，发现提交后的地址为 [https://defendtheweb.net/extras/playground/xmas08/mod.php?submit](https://defendtheweb.net/extras/playground/xmas08/mod.php?submit)

这是经典漏洞，我们继续访问 [https://defendtheweb.net/extras/playground/xmas08/mod.php?action](https://defendtheweb.net/extras/playground/xmas08/mod.php?action)，可以看到登陆界面

账号和密码都直接注入 `' or 1=1`

然后打开 index.php，并将内容修改为

```html
<html>
<head>
<title>WARNING!!</title>
<style type="text/css">
body{
    background-color: #000000;
    color: #FFFFFF;
}
</style>
</head>
<body>
<div style="width: 100%; text-align:center">
    <img src="xmaswarning.jpg" />

</div>
</body>
</html>
```

## Planet Bid / Realistic

经过尝试，我们登陆了 planet bid 的管理员账号。

账号：admin

密码：letmein

我们在里面找到关键信息

| #    | user           | email              |
| ---- | -------------- | ------------------ |
| 31   | Revoked.Mayhem | `Caffe@hotbiz.com` |
| 36   | admin          | `hellomum@yawn.go` |

然后查看售卖信息

| Seller | Buyer | Title               | Amount |
| ------ | ----- | ------------------- | ------ |
| 31     | 11    | Dr Pepper 3ltr RARE | £1.32  |

同时看到 11 号信息

| #    | user    | email               |
| ---- | ------- | ------------------- |
| 11   | nemisis | `jfelliot@mail.com` |

事实上，我们关注一下网址

[https://defendtheweb.net/extras/playground/planetbid/planetbid/view.php?members&1=user&2=email](https://defendtheweb.net/extras/playground/planetbid/planetbid/view.php?members&1=user&2=email)

会发现这是一个数据库查询有关的漏洞。我们试着看看密码：

[https://defendtheweb.net/extras/playground/planetbid/planetbid/view.php?members&1=user&2=pass](https://defendtheweb.net/extras/playground/planetbid/planetbid/view.php?members&1=user&2=pass)

得到了几个人的密码

| #    | user           | pass                             | pass          |
| ---- | -------------- | -------------------------------- | ------------- |
| 11   | nemisis        | 742929dcb631403d7c1c1efad2ca2700 | chicken       |
| 31   | Revoked.Mayhem | 231b79b81be75c6fdaabb59754efc025 | westwoodworld |
| 36   | admin          | 2dd9d512e83adc93479d25115285937a | Scoopszii     |

现在登录 nemisis 的邮箱

账号：jfelliot

密码：chicken

接下来，我们在 safe transfer 中使用找回密码功能

账号：nemisis

邮箱：`jfelliot@mail.com`

邮箱收到邮件，密码为 i.am.awesome

登录账号，转走相应的金额即可。

## Access logs

这是经典漏洞，详见 [CWE - CWE-117: Improper Output Neutralization for Logs](https://cwe.mitre.org/data/definitions/117.html)

只需要在账号中输入了 `\n` 即可

## Sandra Murphy

首先观察到登录判断是 xml 实现的。xml 里有三项：账号、密码、真实姓名。我们现在有了最后一个，需要找到前两个。

这也是经典漏洞，参考 [CWE - CWE-91: XML Injection (aka Blind XPath Injection)](https://cwe.mitre.org/data/definitions/91.html)

具体执行参考 [XPATH Injection Software Attack | OWASP Foundation](https://owasp.org/www-community/attacks/XPATH_Injection)

用户名：`1' or '1'='1`

密码：`1' or realname/text()='Sandra Murphy`

## Alphabetize / Coding

这里我们开始要写爬虫了。

## Aliens / Stego

音频隐写，常规操作一通，在频谱看到了信息。

<img src="/assets/post/images/defendtheweb2.webp" alt="defendtheweb2" />

这显然是某种密码，经过查找，发现是 mayan numbers

密码为 69593078616075

这显然是 hex，转换成 ascii 即可

## Custom encoding / Coding

## Missile codes / Forensics

这是我们的第一道取证题。

我们使用 foremost 进行提取。

```shell
./foremost.exe ./forensics1.img 
```

提取出的文件中，有两个加密的压缩文件很可疑，我们使用 rar2john 对其进行破解。

```shell
./rar2john 00017414.rar > 00017414.hash
./john.exe ./00017414.hash --wordlist="rockyou.txt"
```

这边，我使用了 rockyou 这个密码本。

解压缩后得到了一个音频文件，根据其命名得知为 dtmf。在 [http://dialabc.com/sound/detect/](http://dialabc.com/sound/detect/) 我们在线破解音频。得到结果为

`AA6BA4A83C67DDC7`

提交后发现不对。

但题目要求我们找出第4个，所以我们得根据这一个找到别的。

我们首先利用 binwalk 提取文件

```shell
binwalk -e forensics1.img
```

得到了一个文件，我们查看其 string

```shell
strings -n 4 0.ext > 0.txt
```

搜索上面的字符串，我们看到了

```plaintext
4C63-02F0-2715-5B46
2D98-036A-CB59-23F3
E035-E034-ACC8-D09A
AA6B-A4A8-3F67-FFF7
CA50-44C7-0BCD-17BF
```

可以看到，中间有连字符。

所以结果为 `AA6B-A4A8-3C67-DDC7`

## Captcha 1 / CAPTCHA

## Cracking 1 / Cracking

ida 打开后能看到明显的答案

<img src="/assets/post/images/defendtheweb3.webp" alt="defendtheweb3" style="width:min(300px,100%);" />

## Captcha 2 / CAPTCHA

## SecureUs / Realistic
