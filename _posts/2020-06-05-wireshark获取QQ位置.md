---
layout: post
title:  "wireshark实战——获取qq位置"
date:   2020-06-05 00:00:00 +0800
categories: security
tags: wireshark ip
comments: 1
mathjax: true
---

虽然网上已经有了很多获取IP的qq插件，但是其原理大致都是相同的，但是插件的安全性往往较差。本文介绍如何利用[wireshark](https://www.wireshark.org/download.html)获取好友IP

<!-- more -->

![](https://img.shields.io/badge/reproduced-REEBUF-blue) ![](https://img.shields.io/badge/license-GPL 3.0-orange) ![](https://img.shields.io/badge/article quality-B-yellow)

一、打开wireshark选择本机网卡，由于本机使用的是无线网卡，所以选择第三个

![](https://image.3001.net/images/20170621/14980140026740.png!small)

二、双击点击后将会看到大量的流量数据包传送

![](https://image.3001.net/images/20170621/14980140148798.png!small)

三、按<kbd>Ctrl</kbd>+<kbd>F</kbd>键进行搜索

- 选择搜索`字符串`

- 选择搜索`分组详情`

- 填写搜索数据`020048`

![](https://image.3001.net/images/20170621/14980136675989.png!small)

四、设置好搜索参数之后，找到要查询的好友，发送QQ电话（部分QQ版本无需对方接受QQ电话，也可以获取到IP，PC端和移动端均可获取，只要对方QQ在线收到QQ电话邀请即可）

发送QQ电话请求，对方没有接受

五、在发起请求之后，回到wireshark界面，多次点击 “查找” 来追踪数据，当发现查找能自动定位到连接数据的时候就可以关闭电话邀请，并且停止wireshark的监听，避免差生过多的数据，下面请看查找后自动定位到的数据，192.168.***.***是我本机内网IP，右边的222.139.***.*** 就是对方的IP地址了

![](https://image.3001.net/images/20170621/14980138251109.png!small)

获取到IP地址后，进行定位（定位的效果视情况而定，如果是wifi，企业网络，固定IP网络，那么效果非常好，但是如果是移动网络等效果不佳）

六、进入IP在线定位的网站[openGPS.cn](http://www.opengps.cn/)进入页面后，选择高精度IP定位

![](https://image.3001.net/images/20170621/14980138652228.png!small)

输入我们需要定位的IP地址，以及下面的验证码查询定位

![](https://image.3001.net/images/20170621/14980138797138.png!small)

或者，我们可以先在[ipuu.net](https://www.ipuu.net/search/ip/)获取经纬度，然后在[map.yanue.net/](http://map.yanue.net/)获取精确地址

> 还可以通过 QQ视频，QQ远程协助，的方式来获取IP但所搜索的信息特征有所不同