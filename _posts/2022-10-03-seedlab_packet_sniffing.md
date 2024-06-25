---
layout: post
title:  "Packet Sniffing and Spoofing"
date:   2022-10-03 00:00:00 +0800
categories: 实验
tags: seedlab network
comments: true
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - Packet Sniffing and Spoofing Lab](https://seedsecuritylabs.org/Labs_20.04/Networking/Sniffing_Spoofing/) 的实验记录。

## 实验原理

数据包嗅探和欺骗是网络安全中的两个重要概念；它们是网络通信中的两大威胁。能够理解这两种威胁对于理解网络中的安全措施至关重要。有许多数据包嗅探和欺骗工具，例如 Wireshark、Tcpdump、Netwox、Scapy 等。其中一些工具被安全专家以及攻击者广泛使用。本实验的目标有两个：学习使用这些工具并了解这些工具背后的技术。我们将编写简单的嗅探器和欺骗程序，并深入了解这些程序的技术方面。本实验涵盖以下主题：

- 嗅探和欺骗的工作原理
- 使用 pcap 库和 Scapy 进行数据包嗅探
- 使用原始套接字和 Scapy 进行数据包欺骗
- 使用 Scapy 处理数据包

## Lab Task Set 1: Using Scapy to Sniff and Spoof Packets

### Task 1.1: Sniffing Packets

启动 docker：

```shell
dcbuild
dcup
```

首先查看网卡端口：

```shell
$ ifconfig
br-9fee8832d7a6: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.9.0.1  netmask 255.255.255.0  broadcast 10.9.0.255
        inet6 fe80::42:46ff:fe9f:a2ce  prefixlen 64  scopeid 0x20<link>
        ether 02:42:46:9f:a2:ce  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 38  bytes 5759 (5.7 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
......
```

我们省略去了一些内容，因为我们只需要关注网桥的名称。

编写 `sniffer.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

def print_pkt(pkt):
    pkt.show()
    
pkt = sniff(iface='br-9fee8832d7a6', filter='icmp', prn=print_pkt)
```

其中，`br-9fee8832d7a6` 就是上面获取到的名称。

#### Task 1.1A

在 attacker 中赋予程序执行权限并运行：

```shell
# chmod a+x sniffer.py
# sniffer.py
```

然后在宿主机中运行：

```shell
$ sniffer.py
Traceback (most recent call last):
  File "./sniffer.py", line 7, in <module>
    pkt = sniff(iface='br-9fee8832d7a6', filter='icmp', prn=print_pkt)
  File "/usr/local/lib/python3.8/dist-packages/scapy/sendrecv.py", line 1036, in sniff
    sniffer._run(*args, **kwargs)
  File "/usr/local/lib/python3.8/dist-packages/scapy/sendrecv.py", line 906, in _run
    sniff_sockets[L2socket(type=ETH_P_ALL, iface=iface,
  File "/usr/local/lib/python3.8/dist-packages/scapy/arch/linux.py", line 398, in __init__
    self.ins = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(type))  # noqa: E501
  File "/usr/lib/python3.8/socket.py", line 231, in __init__
    _socket.socket.__init__(self, family, type, proto, fileno)
PermissionError: [Errno 1] Operation not permitted
```

这是由于宿主机没有访问网桥的权限。

#### Task 1.1B

> Capture only the ICMP packet

我们在 host 上 ping 东南大学主页：

```shell
# ping www.seu.edu.cn -c 1
PING widc142.seu.edu.cn (58.192.118.142) 56(84) bytes of data.
64 bytes from 58.192.118.142 (58.192.118.142): icmp_seq=1 ttl=247 time=55.0 ms

--- widc142.seu.edu.cn ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 54.967/54.967/54.967/0.000 ms
```

在 attacker 上可以看到：

```shell
# sniffer.py
###[ Ethernet ]### 
  dst       = 02:42:46:9f:a2:ce
  src       = 02:42:0a:09:00:05
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x0
     len       = 84
     id        = 31909
     flags     = DF
     frag      = 0
     ttl       = 64
     proto     = icmp
     chksum    = 0x2a8
     src       = 10.9.0.5
     dst       = 58.192.118.142
     \options   \
###[ ICMP ]### 
        type      = echo-request
        code      = 0
        chksum    = 0x2ffd
        id        = 0x13
        seq       = 0x1
###[ Raw ]### 
           load      = 'a\xeb\xf9b\x00\x00\x00\x00\xaa\xcd\x03\x00\x00\x00\x00\x00\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./01234567'

###[ Ethernet ]### 
  dst       = 02:42:0a:09:00:05
  src       = 02:42:46:9f:a2:ce
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x0
     len       = 84
     id        = 1038
     flags     = 
     frag      = 0
     ttl       = 247
     proto     = icmp
     chksum    = 0x43f
     src       = 58.192.118.142
     dst       = 10.9.0.5
     \options   \
###[ ICMP ]### 
        type      = echo-reply
        code      = 0
        chksum    = 0x37fd
        id        = 0x13
        seq       = 0x1
###[ Raw ]### 
           load      = 'a\xeb\xf9b\x00\x00\x00\x00\xaa\xcd\x03\x00\x00\x00\x00\x00\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./01234567'
```

> Capture any TCP packet that comes from a particular IP and with a destination port number 23.

修改程序：

```python
#!/usr/bin/env python3
from scapy.all import *

def print_pkt(pkt):
    pkt.show()
    
pkt = sniff(iface='br-9fee8832d7a6', filter='src host 10.9.0.5 and tcp dst port 23', prn=print_pkt)
```

由于 23 端口为 telnet，故我们在 host 上 telnet attacker 一下：

```shell
# telnet 10.9.0.1
Trying 10.9.0.1...
Connected to 10.9.0.1.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
```

attacker 上看到：

```shell
# sniffer.py
###[ Ethernet ]### 
  dst       = 02:42:46:9f:a2:ce
  src       = 02:42:0a:09:00:05
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x10
     len       = 60
     id        = 60767
     flags     = DF
     frag      = 0
     ttl       = 64
     proto     = tcp
     chksum    = 0x3935
     src       = 10.9.0.5
     dst       = 10.9.0.1
     \options   \
###[ TCP ]### 
        sport     = 36788
        dport     = telnet
        seq       = 1558341395
        ack       = 0
        dataofs   = 10
        reserved  = 0
        flags     = S
        window    = 64240
        chksum    = 0x1446
        urgptr    = 0
        options   = [('MSS', 1460), ('SAckOK', b''), ('Timestamp', (998148733, 0)), ('NOP', None), ('WScale', 7)]
......
```

> Capture packets comes from or to go to a particular subnet. You can pick any subnet, such as `128.230.0.0/16`; you should not pick the subnet that your VM is attached to.

修改程序：

```python
#!/usr/bin/env python3
from scapy.all import *

def print_pkt(pkt):
    pkt.show()
    
pkt = sniff(iface='br-9fee8832d7a6', filter='net 128.230.0.0/16', prn=print_pkt)
```

在 host 上 ping 一下：

```shell
# ping 128.230.0.1 -c 1
PING 128.230.0.1 (128.230.0.1) 56(84) bytes of data.
64 bytes from 128.230.0.1: icmp_seq=1 ttl=44 time=396 ms

--- 128.230.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 396.333/396.333/396.333/0.000 ms
```

attacker 上看到：

```shell
# sniffer.py
###[ Ethernet ]### 
  dst       = 02:42:46:9f:a2:ce
  src       = 02:42:0a:09:00:05
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x0
     len       = 84
     id        = 3604
     flags     = DF
     frag      = 0
     ttl       = 64
     proto     = icmp
     chksum    = 0xa1a0
     src       = 10.9.0.5
     dst       = 128.230.0.1
     \options   \
###[ ICMP ]### 
        type      = echo-request
        code      = 0
        chksum    = 0x71f7
        id        = 0x22
        seq       = 0x1
###[ Raw ]### 
           load      = '~\xed\xf9b\x00\x00\x00\x00B\xc2\x0c\x00\x00\x00\x00\x00\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./01234567'

###[ Ethernet ]### 
  dst       = 02:42:0a:09:00:05
  src       = 02:42:46:9f:a2:ce
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x2
     len       = 84
     id        = 1065
     flags     = 
     frag      = 0
     ttl       = 44
     proto     = icmp
     chksum    = 0xff89
     src       = 128.230.0.1
     dst       = 10.9.0.5
     \options   \
###[ ICMP ]### 
        type      = echo-reply
        code      = 0
        chksum    = 0x79f7
        id        = 0x22
        seq       = 0x1
###[ Raw ]### 
           load      = '~\xed\xf9b\x00\x00\x00\x00B\xc2\x0c\x00\x00\x00\x00\x00\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./01234567'
```

### Task 1.2: Spoofing ICMP Packets

编写 `spoofer.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

a = IP()
a.src = '10.10.0.1'
a.dst = '10.10.0.2'
b = ICMP()
p = a/b

send(p)
```

然后复制进 host：

```shell
docker cp spoofer.py 1a6d18536d74:/codes/spoofer.py
```

这里，`1a6d18536d74` 为 host docker 的 ID。

同时，sniffer.py 改回：

```python
#!/usr/bin/env python3
from scapy.all import *

def print_pkt(pkt):
    pkt.show()
    
pkt = sniff(iface='br-9fee8832d7a6', filter='icmp', prn=print_pkt)
```

我们运行程序：

```shell
# chmod a+x spoofer.py
# spoofer.py
.
Sent 1 packets.
```

attacker 主机接收到：

```shell
# sniffer.py
###[ Ethernet ]### 
  dst       = 02:42:46:9f:a2:ce
  src       = 02:42:0a:09:00:05
  type      = IPv4
###[ IP ]### 
     version   = 4
     ihl       = 5
     tos       = 0x0
     len       = 28
     id        = 1
     flags     = 
     frag      = 0
     ttl       = 64
     proto     = icmp
     chksum    = 0x66ca
     src       = 10.10.0.1
     dst       = 10.10.0.2
     \options   \
###[ ICMP ]### 
        type      = echo-request
        code      = 0
        chksum    = 0xf7ff
        id        = 0x0
        seq       = 0x0
```

### Task 1.3: Traceroute

编写 `tracerouter.py`：

```python
#!/usr/bin/env python3
from scapy.all import *
import sys

argumentList = sys.argv

MAX_TTL = 255
dstHostname = argumentList[1]
dstIP = socket.gethostbyname(dstHostname)

continuousLost = 0
MAX_LOST = 6

print("dst IP: " + dstIP)

a = IP()
a.dst = dstIP
a.ttl = 1

b = ICMP()

while ip.ttl <= MAX_TTL:
    # Send Packet
    reply = sr1(a/b, verbose=0, timeout=3)
    print(str(a.ttl),end="\t")
    
    if (reply == None):
        print("===PACKET LOST===")
        continuousLost += 1
        if (continuousLost >= MAX_LOST):
            print("Unable to reach " + dstIP + "! Stop.")
            break
    else:
        print(reply.src)
        continuousLost = 0
        if (reply.src == dstIP):
            break
            
    a.ttl += 1
```

我们在 host 上运行：

```shell
# tracer.py 1.2.3.4
dst IP: 1.2.3.4
1  10.9.0.1
2  10.0.2.1
3  10.208.64.1
4  10.80.128.141
5  10.80.128.149
6  10.80.3.10
7  153.3.60.1
8  122.96.66.73
9  ===PACKET LOST===
10 ===PACKET LOST===
11 ===PACKET LOST===
12 ===PACKET LOST===
13 ===PACKET LOST===
14 ===PACKET LOST===
Unable to reach 1.2.3.4! Stop.
# tracer.py 8.8.8.8
dst IP: 8.8.8.8
1  10.9.0.1
2  10.0.2.1
3  10.208.64.1
4  10.80.128.141
5  10.80.128.149
6  10.80.3.10
7  153.3.60.1
8  221.6.2.137
9  221.6.9.129
10 219.158.8.114
11 219.158.98.94
12 219.158.16.242
13 72.14.213.114
14 108.170.241.97
15 108.170.233.19
16 8.8.8.8
```

可以看出，我们能够实现 traceroute 的功能。`8.8.8.8` 在 16 跳后到达。而 `1.2.3.4` 是不存在的地址，经过 8 跳后到达 `122.96.66.73`，此后就收不到回复了。

### Task 1.4: Sniffing and-then Spoofing

编写 `sniff_spoof.py`：

```python
#!/usr/bin/env python3  
from scapy.all import *  

def spoof_pkt(pkt):
    if ICMP in pkt and pkt[ICMP].type == 8:
        
        ip = IP(src=pkt[IP].dst, dst=pkt[IP].src, ihl=pkt[IP].ihl)
        icmp = ICMP(type=0, id=pkt[ICMP].id, seq=pkt[ICMP].seq)
        data = pkt[Raw].load
        newpkt = ip/icmp/data 
        
        send(newpkt, verbose=0)  

pkt = sniff(iface='br-9fee8832d7a6', filter='icmp', prn=spoof_pkt)
```

将该程序在 attacker 上运行。

在 host 上 ping 不同的 ip：

```shell
# ping 1.2.3.4 -c 1
PING 1.2.3.4 (1.2.3.4) 56(84) bytes of data.
64 bytes from 1.2.3.4: icmp_seq=1 ttl=64 time=102 ms

--- 1.2.3.4 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 101.621/101.621/101.621/0.000 ms
# ping 10.9.0.99 -c 1
PING 10.9.0.99 (10.9.0.99) 56(84) bytes of data.
From 10.9.0.5 icmp_seq=1 Destination Host Unreachable

--- 10.9.0.99 ping statistics ---
1 packets transmitted, 0 received, +1 errors, 100% packet loss, time 0ms
# ping 8.8.8.8 -c 2
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=64 time=23.7 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=111 time=220 ms (DUP!)
64 bytes from 8.8.8.8: icmp_seq=2 ttl=64 time=28.4 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, +1 duplicates, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 23.712/90.615/219.692/91.291 ms
```

我们可以查看 ip route 来解释这一现象：

```shell
# ip route get 1.2.3.4
1.2.3.4 via 10.9.0.1 dev eth0 src 10.9.0.5 uid 0 
    cache 
# ip route get 10.9.0.99
10.9.0.99 dev eth0 src 10.9.0.5 uid 0 
    cache 
# ip route get 8.8.8.8  
8.8.8.8 via 10.9.0.1 dev eth0 src 10.9.0.5 uid 0 
    cache
```

可以看到，`10.9.0.99` 是子网内部的，不经过网关，然而没有找到该地址，故无法 ping 通。另外两个都是公网 ip，其中 1.2.3.4 不存在，只会收到攻击者的回复。

而 `8.8.8.8` 实际存在，其服务器会发送回复，而攻击者主机也会发送回复。这两个回复重复了，所以会有 `UDP` 标志。

## 实验总结

本实验较为简单，依葫芦画瓢即可。通过实验，我们了解了嗅探和欺骗的工作原理，学会了使用 pcap 库和 Scapy 进行数据包嗅探、使用原始套接字和 Scapy 进行数据包欺骗及使用 Scapy 处理数据包。
