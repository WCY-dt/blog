---
layout: post
title:  "Snort和Scapy"
date:   2022-04-01 00:00:00 +0800
categories: 安全
tags: snort scapy python
comments: 1
mathjax: true
copyrights: 原创
---

本文将简单描述如何使用 scapy 来测试 snort 规则。

## 安装

snort 和 scapy 都可以直接 `sudo apt install`，不再赘述。

## snort 配置

snort 默认安装在 `/etc/snort` 下。目录结构如下：

```plaintext
/etc/snort
  ├─ attribute_table.dtd
  ├─ file_magic.conf
  ├─ unicode.map
  ├─ classification.config
  ├─ gen-msg.map
  ├─ snort.conf
  ├─ community-sid-msg.map
  ├─ reference.config
  ├─ snort.debian.conf
  ├─ threshold.conf
  └─ rules
       ├─ attack-responses.rules
       ├─ // many rules
       └─ x11.rules
```

目录中有大量的配置文件，每个文件都有详细的注释，感兴趣的可以仔细阅读并个性化配置。我们目前只需要用到 `snort.conf`。文件夹 `/rules` 里面存储的是默认的规则，我们暂时用不到它们。

现在，为了方便使用，我们在 `/etc/snort` 下新建一个文件夹 `/test`，并在 `/test` 中新建一个名为 `test.rules` 的文件。我们将会利用这个文件进行简单的测试。

修改 `test.rules` 内容为：

```rules
alert tcp any any -> any 8080 (flags: A; msg: "TEST ALERT"; content: "I am IDS Homework I"; nocase; offset: 100; depth: 100; sid: 1000001; rev: 1;)
```

规则具体的含义我们会在后文讲解。

现在，打开 `snort.conf`，在 `STEP #1` 中可以看到如下语句

```conf
var RULE_PATH /etc/snort/rules
var SO_RULE_PATH /etc/snort/so_rules
var PREPROC_RULE_PATH /etc/snort/preproc_rules
```

我们添加一条

```conf
var TEST_RULE_PATH /etc/snort/test
```

将我们刚刚建立的文件夹加入路径。

现在翻到 `STEP #7`，这各部分引用了各种规则，我们使用 `#` 将它们全部注释掉。然后，加入我们自己刚刚新建的规则：

```conf
include $TEST_RULE_PATH/test.rules
```

保存后，snort 已经可以正常使用我们刚刚新建的规则了。

现在，我们来启动 snort。首先查看自己的网卡名称：

```shell
ifconfig
```

然后启动 snort：

```shell
sudo snort -A console -i ens33 -u snort -g snort -c /etc/snort/snort.conf
```

`-A console` 表明将所有的输出直接输出到控制台，方便我们测试时查看。`-i ens33` 表明我们使用的 interface，这里的 `ens33` 需要替换为你刚刚看到的网卡名称。

此时，snort 已经在正常嗅探了。

<img src="/assets/post/images/snort1.png" alt="snort1" style="zoom:50%;" />

## rules 编写

通常来说，每行一条 rules。rules 由以下几个部分组成：

```plaintext
rules
  ├─ Header
  │    ├─ RuleType
  │    └─ Five Tuple
  │          ├─ Protocol
  │          ├─ sip
  │          ├─ dip
  │          ├─ sport
  │          └─ dport
  └─ Options
        ├─ General
        │    ├─ Msg
        │    ├─ Reference
        │    ├─ gid / sid / rev
        │    ├─ Classtype
        │    ├─ priority
        │    └─ metadata
        ├─ Non-Payload
        │    ├─ dsize
        │    ├─ ttl
        │    ├─ tos
        │    └─ ……
        ├─ Payload
        │    ├─ depth / offset / within / distance
        │    ├─ decode: http / uri / sip
        │    └─ ……
        ├─ Post-Detection
        ├─ flow: to_client / to_server / established
        └─ flowbits: set / unset / isset / noalert
```

在 `RuleType` 中，对于 IDS，有 `alert`、`log`、`pass` 三种；对于 IPS，有 `drop`、`reject`、`sdrop` 三种。

我们举一个例子：

```rules
alert tcp 192.168.200.5 any -> $HOME_NET 8080 (msg:"ET TROJAN IRC Potential bot
update/download via ftp command"; flowbits:isset,is_proto_irc;
flow:established,to_client; content:"ftp|3a|//"; nocase; fast_pattern:only;
pcre:"/\.(upda|getfile|dl\dx|dl|download|execute)\w*\s+ftp\x3a\x2f\x2f/i";
reference:url,doc.emergingthreats.net/2011162; classtype:trojan-activity; sid:2011162;
rev:5; metadata:created_at 2010_07_30, updated_at 2019_10_07;)
```

在上面的 rule 中，

- `alert` 表明如果侦测到相应的流量，则发出警报
- `tcp` 表明我们嗅探的是 tcp 报文
- `192.168.200.5 any` 表明报文源地址为 192.168.200.5 的任意端口
- `$HOME_NET 8080` 表明报文目的地址为本地网络的 8080 端口
- `msg:"ET TROJAN IRC Potential bot update/download via ftp command"` 表明如果检测到响应流量，则警报引号中的内容
- `flowbits:isset,is_proto_irc` 表明设置了 irc 协议
- `flow:established,to_client` 表明已经建立了去往 client 的通道
- `content:"ftp|3a|//"` 表明要匹配的报文内容
- `nocase` 表明不区分大小写
- `fast_pattern:only` 设置了快速匹配的模式
- `pcre:"/\.(upda|getfile|dl\dx|dl|download|execute)\w*\s+ftp\x3a\x2f\x2f/i"` 描述了匹配的正则表达式

现在，回过来看我们之前定义的规则：

```snort
alert tcp any any -> any 8080 (flags: A; msg: "TEST ALERT"; content: "I am IDS Homework I"; nocase; offset: 100; depth: 100; sid: 1000001; rev: 1;)
```

其含义为：侦测 tcp 报文，报文满足目的端口为 8080、是 ACK 报文，内容含有 `I am IDS Homework I`，不区分大小写，内容在第 100 至 200 byte 之间。如果侦测到，则警报 `TEST ALERT`。

## scapy 使用

```shell
sudo scapy
```

即可开始使用 scapy。

<img src="/assets/post/images/snort2.png" alt="snort2" style="zoom:50%;" />

我们试着新建一个 IP 包：

```python
>>> a=IP(dst="192.168.0.1")
>>> a
<IP  dst=192.168.0.1 |>
```

同样的，我们也可以建立 Ether、TCP、ICMP 等等。

包中可以设置各个参数，我们可以这样看有哪些参数：

```python
>>> ls(IP())
version    : BitField  (4 bits)                  = 4               (4)
ihl        : BitField  (4 bits)                  = None            (None)
tos        : XByteField                          = 0               (0)
len        : ShortField                          = None            (None)
id         : ShortField                          = 1               (1)
flags      : FlagsField  (3 bits)                = <Flag 0 ()>     (<Flag 0 ()>)
frag       : BitField  (13 bits)                 = 0               (0)
ttl        : ByteField                           = 64              (64)
proto      : ByteEnumField                       = 0               (0)
chksum     : XShortField                         = None            (None)
src        : SourceIPField                       = '127.0.0.1'     (None)
dst        : DestIPField                         = '127.0.0.1'     (None)
options    : PacketListField                     = []              ([])
```

我们可以使用 `\` 将两个包进行嵌套。例如：

```python
>>> Ether() / IP() / TCP()
<Ether  type=IPv4 |<IP  frag=0 proto=tcp |<TCP  |>>>
```

以上均只生成了一个包，下面我们试着生成多个包。例如，对某一范围内的所有 ip 生成包：

```python
>>> [p for p in IP(dst=Net('www.slashdot.org/30'))]
[<IP  dst=204.68.111.104 |>,
 <IP  dst=204.68.111.105 |>,
 <IP  dst=204.68.111.106 |>,
 <IP  dst=204.68.111.107 |>]
```

选取多个 ttl 发包：

```python
>>> [p for p in IP(ttl=[1,2,(7,9)])]
[<IP  ttl=1 |>,
 <IP  ttl=2 |>,
 <IP  ttl=7 |>,
 <IP  ttl=8 |>,
 <IP  ttl=9 |>]
```

建立好包后，我们需要发送包。我们以前文建立好的 `a` 包为例：

```python
>>> sendp(a,iface="ens33")
.
Sent 1 packets.
```

以上便是 scapy 的基础使用了。

如果我们需要测试前文编写的规则 `test.rules`，则可以

```python
>>> sendp(Ether()/IP(dst="192.168.220.129")/TCP(dport=8080, flags='A') / Raw(load="11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111I am IDS Homework I"))
.
Sent 1 packets.
```

此时，snort 处会显示

```plaintext
[**] [1:1000001:1] TEST ALERT [**] [Priority: 0] {TCP} 192.168.18.128:20 -> 192.168.220.129:8080
```

说明成功探测到了流量。

有时候，我们需要实现更加复杂的功能，则可以直接编写 python 程序。例如，上面的报文发送可以这么写：

```python
#!/usr/bin/python
#coding=utf-8
from scapy.all import *

def snortTest(dst, dport, load, iface, count):
    pkt = Ether() / IP(dst=dst) / TCP(dport=dport, seq=13131342, flags='A') / Raw(load=load)
    sendp(pkt, iface=iface, count=count)

dst = "192.168.220.129"
dport = 8080
load = ""
for i in range(110):
    load += "1"
load += "I am IDS Homework I"
iface = "ens33"
count = 1
snortTest(dst, dport, load, iface, count)
```

效果是一样的。
