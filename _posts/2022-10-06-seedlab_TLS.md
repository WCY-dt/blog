---
layout: post
title:  "TLS"
date:   2022-10-06 00:00:00 +0800
categories: 实验
tags: seedlab tls
comments: 1
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - TLS Lab](https://seedsecuritylabs.org/Labs_20.04/Crypto/Crypto_TLS/) 的实验记录。

## 实验原理

现在越来越多的数据传输是通过互联网完成的。然而，当数据通过这种不受保护的公共网络传输时，它们可以被其他人读取甚至篡改。密码算法有很多种，即使是同一种算法，也有很多参数可以使用。为了实现互操作性，即允许不同的应用程序相互通信，这些应用程序需要遵循一个共同的标准。 TLS，Transport Layer Security，就是这样一个标准。如今，大多数 Web 服务器都使用 HTTPS，它建立在 TLS 之上。
本实验的目的是了解 TLS 的工作原理以及如何在编程中使用 TLS。我们实现一对TLS客户端和服务器程序，并在此基础上进行一系列实验，从而了解TLS协议底层的安全原理。我们还将实施一个简单的 HTTPS 代理程序，以了解如果某些受信任的 CA 遭到破坏时的安全影响。实验室涵盖以下主题：
• 公钥基础设施 (PKI)
• 传输层安全 (TLS)
• TLS 编程
• HTTPS 代理
• 扩展的 X.509 证书
• 中间人攻击

## Task 1: TLS Client

### Task 1.a: TLS handshake

编写代码 `handshake.py`：

```python
#!/usr/bin/env python3

import socket
import ssl
import sys
import pprint

hostname = sys.argv[1]
port = 443
cadir = '/etc/ssl/certs'
#cadir = './client-certs'

# Set up the TLS context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)  # For Ubuntu 20.04 VM
# context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)      # For Ubuntu 16.04 VM

context.load_verify_locations(capath=cadir)
context.verify_mode = ssl.CERT_REQUIRED
context.check_hostname = True

# Create TCP connection
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((hostname, port))
input("After making TCP connection. Press any key to continue ...")

# Add the TLS
ssock = context.wrap_socket(sock, server_hostname=hostname,
                            do_handshake_on_connect=False)
ssock.do_handshake()   # Start the handshake
print("=== Cipher used: {}".format(ssock.cipher()))
print("=== Server hostname: {}".format(ssock.server_hostname))
print("=== Server certificate:")
pprint.pprint(ssock.getpeercert())
pprint.pprint(context.get_ca_certs())
input("After TLS handshake. Press any key to continue ...")

# Close the TLS Connection
ssock.shutdown(socket.SHUT_RDWR)
ssock.close()
```

这段代码的主要作用是先进行 TCP 握手，然后进行 TLS 连接，并输出相关信息。

我们使用它访问一下东南大学主页：

```shell
$ handshake.py www.seu.edu.cn
After making TCP connection. Press any key to continue ...
=== Cipher used: ('AES256-SHA', 'SSLv3', 256)
=== Server hostname: www.seu.edu.cn
=== Server certificate:
{'OCSP': ('http://ocsp.digicert.cn',),
 'caIssuers': ('http://cacerts.digicert.cn/GeoTrustRSACNCAG2.crt',),
 'crlDistributionPoints': ('http://crl.digicert.cn/GeoTrustRSACNCAG2.crl',),
 'issuer': ((('countryName', 'US'),),
            (('organizationName', 'DigiCert Inc'),),
            (('commonName', 'GeoTrust RSA CN CA G2'),)),
 'notAfter': 'Jul 10 23:59:59 2023 GMT',
 'notBefore': 'Jun  9 00:00:00 2022 GMT',
 'serialNumber': '08102829656C723ABA92C1FA58F0E960',
 'subject': ((('countryName', 'CN'),),
             (('stateOrProvinceName', '江苏省'),),
             (('localityName', '南京市'),),
             (('organizationName', '东南大学'),),
             (('commonName', '*.seu.edu.cn'),)),
 'subjectAltName': (('DNS', '*.seu.edu.cn'), ('DNS', 'seu.edu.cn')),
 'version': 3}
[{'issuer': ((('countryName', 'US'),),
             (('organizationName', 'DigiCert Inc'),),
             (('organizationalUnitName', 'www.digicert.com'),),
             (('commonName', 'DigiCert Global Root CA'),)),
  'notAfter': 'Nov 10 00:00:00 2031 GMT',
  'notBefore': 'Nov 10 00:00:00 2006 GMT',
  'serialNumber': '083BE056904246B1A1756AC95991C74A',
  'subject': ((('countryName', 'US'),),
              (('organizationName', 'DigiCert Inc'),),
              (('organizationalUnitName', 'www.digicert.com'),),
              (('commonName', 'DigiCert Global Root CA'),)),
  'version': 3}]
After TLS handshake. Press any key to continue ...
```

> What is the cipher used between the client and the server?

```plaintext
=== Cipher used: ('AES256-SHA', 'SSLv3', 256)
```

> Please print out the server certificate in the program.

```plaintext
{'OCSP': ('http://ocsp.digicert.cn',),
 'caIssuers': ('http://cacerts.digicert.cn/GeoTrustRSACNCAG2.crt',),
 'crlDistributionPoints': ('http://crl.digicert.cn/GeoTrustRSACNCAG2.crl',),
 'issuer': ((('countryName', 'US'),),
            (('organizationName', 'DigiCert Inc'),),
            (('commonName', 'GeoTrust RSA CN CA G2'),)),
 'notAfter': 'Jul 10 23:59:59 2023 GMT',
 'notBefore': 'Jun  9 00:00:00 2022 GMT',
 'serialNumber': '08102829656C723ABA92C1FA58F0E960',
 'subject': ((('countryName', 'CN'),),
             (('stateOrProvinceName', '江苏省'),),
             (('localityName', '南京市'),),
             (('organizationName', '东南大学'),),
             (('commonName', '*.seu.edu.cn'),)),
 'subjectAltName': (('DNS', '*.seu.edu.cn'), ('DNS', 'seu.edu.cn')),
 'version': 3}
```

> Explain the purpose of /etc/ssl/certs.

```shell
$ ls /etc/ssl/certs
......
 ACCVRAIZ1.pem
 AC_RAIZ_FNMT-RCM.pem
 Actalis_Authentication_Root_CA.pem
 AffirmTrust_Commercial.pem
 AffirmTrust_Networking.pem
 AffirmTrust_Premium.pem
 AffirmTrust_Premium_ECC.pem
 Amazon_Root_CA_1.pem
 Amazon_Root_CA_2.pem
 Amazon_Root_CA_3.pem
 Amazon_Root_CA_4.pem
 Atos_TrustedRoot_2011.pem
......
```

该文件夹中存储了验证证书所需的根 CA。

> Use Wireshark to capture the network traffics during the execution of the program, and explain your observation. In particular, explain which step triggers the TCP handshake, and which step triggers the TLS handshake. Explain the relationship between the TLS handshake and the TCP handshake.

Wireshark 截图如下：

![tls1](/assets/post/images/tls1.png)

编号 3-5 的部分为 TCP 的三次握手。编号 6-13 的部分为 TLS 握手。客户端首先发送 Client Hello 信息，服务器回复 Server Hello。客户端验证后，发送密钥交换及更改密码规范消息，服务器回复更改密码规范消息。至此，TLS 握手完成，进行后续结束工作。

### Task 1.b: CA’s Certificate

修改原程序中的：

```python
cadir = './client-certs'
```

然后再次运行：

```shell
$ handshake.py www.seu.edu.cn
After making TCP connection. Press any key to continue ...
Traceback (most recent call last):
  File "./handshake.py", line 29, in <module>
    ssock.do_handshake()   # Start the handshake
  File "/usr/lib/python3.8/ssl.py", line 1309, in do_handshake
    self._sslobj.do_handshake()
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1123)
```

可以看到，证书验证失败。这是因为没有找到对应的 CA 证书。

我们在之前有看到：

```plaintext
[{'issuer': ((('countryName', 'US'),),
             (('organizationName', 'DigiCert Inc'),),
             (('organizationalUnitName', 'www.digicert.com'),),
             (('commonName', 'DigiCert Global Root CA'),)),
```

这里，表明了安全访问东南大学主页所需要的 CA 证书。所以我们需要找到这个证书并放进 `client-certs` 文件夹中：

```shell
$ ll /etc/ssl/certs | grep DigiCert_Global_Root_CA
lrwxrwxrwx 1 root root     27 Nov 26  2020 3513523f.0 -> DigiCert_Global_Root_CA.pem
lrwxrwxrwx 1 root root     62 Nov 26  2020 DigiCert_Global_Root_CA.pem -> /usr/share/ca-certificates/mozilla/DigiCert_Global_Root_CA.crt
$ cp /usr/share/ca-certificates/mozilla/DigiCert_Global_Root_CA.crt client-certs/DigiCert_Global_Root_CA.crt
```

我们同时需要修正证书的哈希并建立软链接：

```shell
$ cd client-certs
$ openssl x509 -in DigiCert_Global_Root_CA.crt -noout -subject_hash
3513523f
$ ln -s DigiCert_Global_Root_CA.crt 3513523f.0
$ ll
total 8
lrwxrwxrwx 1 root root   27 Aug 11 07:50 3513523f.0 -> DigiCert_Global_Root_CA.crt
-rw-r--r-- 1 root root 1338 Aug 11 07:44 DigiCert_Global_Root_CA.crt
```

然后我们连接上了 [www.seu.edu.cn](www.seu.edu.cn)：

```shell
handshake.py www.seu.edu.cn
```

得到的结果与前文相同，此处不再重复粘贴。

我们尝试另一个使用不同证书的网站 [codeforces.com](codeforces.com)：

```shell
$ handshake.py codeforces.com
After making TCP connection. Press any key to continue ...
=== Cipher used: ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
=== Server hostname: codeforces.com
=== Server certificate:
{'OCSP': ('http://r3.o.lencr.org',),
 'caIssuers': ('http://r3.i.lencr.org/',),
 'issuer': ((('countryName', 'US'),),
            (('organizationName', "Let's Encrypt"),),
            (('commonName', 'R3'),)),
 'notAfter': 'Oct  5 08:10:08 2022 GMT',
 'notBefore': 'Jul  7 08:10:09 2022 GMT',
 'serialNumber': '04EE0F98910E33F9564658EF79DA9C2BA703',
 'subject': ((('commonName', 'codeforces.com'),),),
 'subjectAltName': (('DNS', '*.codeforces.com'), ('DNS', 'codeforces.com')),
 'version': 3}
[{'issuer': ((('countryName', 'US'),),
             (('organizationName', 'Internet Security Research Group'),),
             (('commonName', 'ISRG Root X1'),)),
  'notAfter': 'Jun  4 11:04:38 2035 GMT',
  'notBefore': 'Jun  4 11:04:38 2015 GMT',
  'serialNumber': '8210CFB0D240E3594463E0BB63828B00',
  'subject': ((('countryName', 'US'),),
              (('organizationName', 'Internet Security Research Group'),),
              (('commonName', 'ISRG Root X1'),)),
  'version': 3}]
After TLS handshake. Press any key to continue ...
```

同样的，我们找到它的 CA 证书并做处理：

```shell
$ ll /etc/ssl/certs | grep ISRG_Root_X1           
lrwxrwxrwx 1 root root     16 Nov 26  2020 4042bcee.0 -> ISRG_Root_X1.pem
lrwxrwxrwx 1 root root     51 Nov 26  2020 ISRG_Root_X1.pem -> /usr/share/ca-certificates/mozilla/ISRG_Root_X1.crt
$ cp /usr/share/ca-certificates/mozilla/ISRG_Root_X1.crt client-certs/ISRG_Root_X1.crt
$ cd client-certs
$ openssl x509 -in ISRG_Root_X1.crt -noout -subject_hash
4042bcee
$ ln -s ISRG_Root_X1.crt 4042bcee.0
$ cd ..
$ handshake.py codeforces.com
```

得到的结果与前文相同，此处不再重复粘贴。

### Task 1.c: Experiment with the hostname check

查看东南大学主页 ip：

```shell
$ dig www.seu.edu.cn

; <<>> DiG 9.16.1-Ubuntu <<>> www.seu.edu.cn
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 56811
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;www.seu.edu.cn.    IN  A

;; ANSWER SECTION:
www.seu.edu.cn.    3600  IN  CNAME  widc142.seu.edu.cn.
widc142.seu.edu.cn.    3599  IN  A  58.192.118.142

;; Query time: 4 msec
;; SERVER: 127.0.0.53#53(127.0.0.53)
;; WHEN: Thu Aug 11 16:07:38 CST 2022
;; MSG SIZE  rcvd: 81
```

修改 hosts：

```shell
sudo vi /etc/hosts
```

依据之前看到的 ip，在 hosts 中添加：

```hosts
58.192.118.142 www.nju.edu.cn
```

修改程序，选择是否进行主机名称验证。当 `context.check_hostname = True` 时，有：

```shell
$ handshake.py www.nju.edu.cn
After making TCP connection. Press any key to continue ...
Traceback (most recent call last):
  File "./handshake.py", line 29, in <module>
    ssock.do_handshake()   # Start the handshake
  File "/usr/lib/python3.8/ssl.py", line 1309, in do_handshake
    self._sslobj.do_handshake()
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: Hostname mismatch, certificate is not valid for 'www.nju.edu.cn'. (_ssl.c:1123)
```

此时，证书验证失败，因为域名不一致。

而当 `context.check_hostname = False` 时，有：

```shell
$ handshake.py www.nju.edu.cn
After making TCP connection. Press any key to continue ...
=== Cipher used: ('AES256-SHA', 'SSLv3', 256)
=== Server hostname: www.nju.edu.cn
=== Server certificate:
{'OCSP': ('http://ocsp.digicert.cn',),
 'caIssuers': ('http://cacerts.digicert.cn/GeoTrustRSACNCAG2.crt',),
 'crlDistributionPoints': ('http://crl.digicert.cn/GeoTrustRSACNCAG2.crl',),
 'issuer': ((('countryName', 'US'),),
            (('organizationName', 'DigiCert Inc'),),
            (('commonName', 'GeoTrust RSA CN CA G2'),)),
 'notAfter': 'Jul 10 23:59:59 2023 GMT',
 'notBefore': 'Jun  9 00:00:00 2022 GMT',
 'serialNumber': '08102829656C723ABA92C1FA58F0E960',
 'subject': ((('countryName', 'CN'),),
             (('stateOrProvinceName', '江苏省'),),
             (('localityName', '南京市'),),
             (('organizationName', '东南大学'),),
             (('commonName', '*.seu.edu.cn'),)),
 'subjectAltName': (('DNS', '*.seu.edu.cn'), ('DNS', 'seu.edu.cn')),
 'version': 3}
[{'issuer': ((('countryName', 'US'),),
             (('organizationName', 'DigiCert Inc'),),
             (('organizationalUnitName', 'www.digicert.com'),),
             (('commonName', 'DigiCert Global Root CA'),)),
  'notAfter': 'Nov 10 00:00:00 2031 GMT',
  'notBefore': 'Nov 10 00:00:00 2006 GMT',
  'serialNumber': '083BE056904246B1A1756AC95991C74A',
  'subject': ((('countryName', 'US'),),
              (('organizationName', 'DigiCert Inc'),),
              (('organizationalUnitName', 'www.digicert.com'),),
              (('commonName', 'DigiCert Global Root CA'),)),
  'version': 3}]
After TLS handshake. Press any key to continue ...
```

这里就直接验证通过了。由此可见域名检查的重要性。

### Task 1.d: Sending and getting Data

向上面的程序添加如下代码：

```python
# Send HTTP Request to Server
request = b"GET / HTTP/1.0\r\nHost: " + \
          hostname.encode('utf-8') + b"\r\n\r\n"
ssock.sendall(request)

# Read HTTP Response from Server
response = ssock.recv(2048)
while response:
    pprint.pprint(response.split(b"\r\n"))
    response = ssock.recv(2048)
```

> Please add the data sending/receiving code to your client program, and report your observation.

执行：

```shell
$ handshake.py www.seu.edu.cn
......
After TLS handshake. Press any key to continue ...
[b'HTTP/1.1 200 OK',
 b'Server: nginx/1.16.0',
 b'Date: Thu, 11 Aug 2022 08:41:06 GMT',
 b'Content-Type: text/html; charset=utf-8',
 b'Connection: close',
 b'X-Frame-Options: SAMEORIGIN',
 b'Frame-Options: SAMEORIGIN',
 b'Accept-Ranges: bytes',
 b'Vary: Accept-Encoding',
 b'Set-Cookie: NSC_xfcqmvt-02-iuuqt=ffffffff0948650745525d5f4f58455e445a4a42366'
 b'0;expires=Thu, 11-Aug-2022 09:01:08 GMT;path=/;secure;httponly',
 b'',
 b'<!DOCTYPE html>',
 b'<html>',
 ......
```

可以看到，成功获取了东南大学主页的页面源码。

> Please modify the HTTP request, so you can fetch an image file of your choice from an HTTPS server

我们尝试获取东南大学主页的校徽图片 [https://www.seu.edu.cn/_upload/tpl/09/bc/2492/template2492/images/logo.png](https://www.seu.edu.cn/_upload/tpl/09/bc/2492/template2492/images/logo.png)。

将 request 语句改为

```python
request = b"GET /_upload/tpl/09/bc/2492/template2492/images/logo.png HTTP/1.0\r\nHost: " + hostname.encode('utf-8') + b"\r\n\r\n"
```

运行效果如下

```shell
$ handshake.py www.seu.edu.cn
......
b'\x89PNG',
b'\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x11\x00\x00\x00X\x08\x06'
b'\x00\x00\x00\xd2\xb4\xc3\x9e\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReady'
b'q\xc9e<\x00\x00\x03!iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begi'
b'n="\xef\xbb\xbf" id="W5M0MpCehiHzreSzNTczkc9d"?> <x:xmpmeta xmlns:x="adob'
b'e:ns:meta/" x:xmptk="Adobe XMP Core 5.5-c014 79.151481, 2013/03/13-12:09:15 '
b'       "> <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"> '
b'<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns'
b':xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stRef="http://ns.adobe.com/xa'
b'p/1.0/sType/ResourceRef#" xmp:CreatorTool="Adobe Photoshop CC (Windows)" xmp'
b'MM:InstanceID="xmp.iid:67B7F0CEECC111EA929DA69D6D87DD17" xmpMM:DocumentID="x'
b'mp.did:67B7F0CFECC111EA929DA69D6D87DD17"> <xmpMM:DerivedFrom stRef:instanceI'
b'D="xmp.iid:67B7F0CCECC111EA929DA69D6D87DD17" stRef:documentID="xmp.did:67B7F'
b'0CDECC111EA929DA69D6D87DD17"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?'
b'xpacket end="r"?>\x9d\xc3\x8e\'\x00\x00/@IDATx\xda\xec\x9d\x07\xb4\x14'
b'\xc5\xd2\xc7\x9bx\xb9H\x14P\xb2\x80D%\x07\x05\x14PQ\x9f\x19\x10\xb3\x82\x8a'
b'\x19\x0c\x18\x9e\x8a\xa0(>\x10#\n&T\x0c(\xfa\xcc\x01\xb3"(\xa8\x88\x08'
......
```

可以看出，我们成功爬取到了图片。

## Task 2: TLS Server

准备好 PKI 实验中得到的 `server.crt` 和 `server.key`，放入 server-certs 文件夹中。

将 `ca.crt` 放入 `client-certs` 文件夹中，并建立软链接：

```shell
$ openssl x509 -in ca.crt -noout -subject_hash
dbb9c584
$ ln -s ca.crt dbb9c584.0
```

### Task 2.a. Implement a simple TLS server

修改 `handshake.py`；

```python
#!/usr/bin/env python3

import socket
import ssl
import sys
import pprint

hostname = sys.argv[1]
port = 4433
#cadir = '/etc/ssl/certs'
cadir = './client-certs'

# Set up the TLS context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)  # For Ubuntu 20.04 VM
# context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)      # For Ubuntu 16.04 VM

context.load_verify_locations(capath=cadir)
context.verify_mode = ssl.CERT_REQUIRED
context.check_hostname = True

# Create TCP connection
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((hostname, port))
input("After making TCP connection. Press any key to continue ...")

# Add the TLS
ssock = context.wrap_socket(sock, server_hostname=hostname,
                            do_handshake_on_connect=False)
ssock.do_handshake()   # Start the handshake
print("=== Cipher used: {}".format(ssock.cipher()))
print("=== Server hostname: {}".format(ssock.server_hostname))
print("=== Server certificate:")
pprint.pprint(ssock.getpeercert())
pprint.pprint(context.get_ca_certs())
input("After TLS handshake. Press any key to continue ...")

# Close the TLS Connection
ssock.shutdown(socket.SHUT_RDWR)
ssock.close()
```

编写 `server.py`：

```python
#!/usr/bin/env python3

import socket
import ssl
import pprint

html = """
HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n
<!DOCTYPE html><html><body><h1>This is Bank32.com!</h1></body></html>
"""

SERVER_CERT = './server-certs/server.crt'
SERVER_PRIVATE = './server-certs/server.key'


context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)  # For Ubuntu 20.04 VM
# context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)      # For Ubuntu 16.04 VM
context.load_cert_chain(SERVER_CERT, SERVER_PRIVATE)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
sock.bind(('0.0.0.0', 4433))
sock.listen(5)

while True:
    newsock, fromaddr = sock.accept()
    try:
        ssock = context.wrap_socket(newsock, server_side=True)
        print("TLS connection established")
        data = ssock.recv(1024)              # Read data over TLS
        pprint.pprint("Request: {}".format(data))
        ssock.sendall(html.encode('utf-8'))  # Send data over TLS

        ssock.shutdown(socket.SHUT_RDWR)     # Close the TLS connection
        ssock.close()

    except Exception:
        print("TLS connection fails")
        continue
```

将 `www.chenyang2022.com` 加入到 client 容器的 hosts 中：

```shell
echo "10.9.0.43 www.chenyang2022.com" >> /etc/hosts
```

在 server 上运行：

```shell
server.py
```

在 client 上运行：

```shell
handshake.py www.chenyang2022.com
```

server 上得到：

```shell
Enter PEM pass phrase:
TLS connection established
"Request: b''"
TLS connection fails
```

client 上得到：

```shell
After making TCP connection. Press any key to continue ...
=== Cipher used: ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
=== Server hostname: www.chenyang2022.com
=== Server certificate:
{'issuer': ((('commonName', 'www.modelCA.com'),),
            (('organizationName', 'Model CA LTD.'),),
            (('countryName', 'US'),)),
 'notAfter': 'Aug  6 02:42:42 2032 GMT',
 'notBefore': 'Aug  9 02:42:42 2022 GMT',
 'serialNumber': '1001',
 'subject': ((('countryName', 'US'),),
             (('organizationName', 'Chenyang2022 Inc.'),),
             (('commonName', 'www.chenyang2022.com'),)),
 'subjectAltName': (('DNS', 'www.chenyang2022.com'),
                    ('DNS', 'www.chenyang2022A.com'),
                    ('DNS', 'www.chenyang2022B.com')),
 'version': 3}
[{'issuer': ((('commonName', 'www.modelCA.com'),),
             (('organizationName', 'Model CA LTD.'),),
             (('countryName', 'US'),)),
  'notAfter': 'Aug  6 02:40:07 2032 GMT',
  'notBefore': 'Aug  9 02:40:07 2022 GMT',
  'serialNumber': '2D814C6206ECC85CA0824B1FB708705CB060E83E',
  'subject': ((('commonName', 'www.modelCA.com'),),
              (('organizationName', 'Model CA LTD.'),),
              (('countryName', 'US'),)),
  'version': 3}]
After TLS handshake. Press any key to continue ...
```

可以看到，这里正常建立了连接。

而当 `handshake.py` 中改为 `cadir = '/etc/ssl/certs'` 后，结果为：

```shell
$ handshake.py www.chenyang2022.com
After making TCP connection. Press any key to continue ...
Traceback (most recent call last):
  File "./handshake.py", line 29, in <module>
    ssock.do_handshake()   # Start the handshake
  File "/usr/lib/python3.8/ssl.py", line 1309, in do_handshake
    self._sslobj.do_handshake()
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1123)
```

可以看到，正常建立了 TCP 连接，但无法建立 LTS。

### Task 2.b. Testing the server program using browsers

由于我们在 PKI 实验中，已经在浏览器里添加了证书信任，故本次无需重复添加。

我们直接访问 [https://www.chenyang2022.com:4433/](https://www.chenyang2022.com:4433/)，可以看到这是受信任的页面：

![tls2](../assets/post/images/tls2.png)

### Task 2.c. Certificate with multiple names

编写 `server_openssl.cnf`

```cnf
[ req ]
prompt = no
distinguished_name = req_distinguished_name
req_extensions = req_ext

[ req_distinguished_name ]
C = US
ST = New York
L = Syracuse
O = Model CA LTD.
CN = www.chenyang2022.com

[ req_ext ]
subjectAltName = @alt_names

[alt_names]
DNS.1 = www.chenyang2022.com
DNS.2 = www.chenyang2020.com
DNS.3 = *.chenyang2022.com
```

这里，由于一些玄学的原因，我们不得不重新生成了 CA 并进行了相关操作，使得其 C、ST、L、O 均与上面的配置文件相同且不得为空。

```shell
openssl req -newkey rsa:2048 -config ./server_openssl.cnf -batch -sha256 -keyout server.key -out server.csr
```

使用 CA 认证：

```shell
openssl ca -md sha256 -days 3650 -config ./myopenssl.cnf -batch -in server.csr -out server.crt -cert ca.crt -keyfile ca.key
```

我们尝试定义的几个域名，得到：

```shell
$ server.py
Enter PEM pass phrase:
TLS connection established
"Request: b'GET / HTTP/1.0\\r\\nHost: www.chenyang2022.com\\r\\n\\r\\n'"
TLS connection established
"Request: b'GET / HTTP/1.0\\r\\nHost: www.chenyang2020.com\\r\\n\\r\\n'"
TLS connection established
"Request: b'GET / HTTP/1.0\\r\\nHost: love.chenyang2022.com\\r\\n\\r\\n'"
```

```shell
$ handshake.py www.chenyang2022.com
......
$ handshake.py www.chenyang2020.com
......
$ handshake.py love.chenyang2022.com
After making TCP connection. Press any key to continue ...
=== Cipher used: ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
=== Server hostname: love.chenyang2022.com
=== Server certificate:
{'issuer': ((('commonName', 'www.modelCA.com'),),
            (('organizationName', 'Model CA LTD.'),),
            (('countryName', 'US'),),
            (('stateOrProvinceName', 'New York'),),
            (('localityName', 'Syracuse'),)),
 'notAfter': 'Aug  8 16:59:10 2032 GMT',
 'notBefore': 'Aug 11 16:59:10 2022 GMT',
 'serialNumber': '2000',
 'subject': ((('countryName', 'US'),),
             (('stateOrProvinceName', 'New York'),),
             (('organizationName', 'Model CA LTD.'),),
             (('commonName', 'www.chenyang2022.com'),)),
 'subjectAltName': (('DNS', 'www.chenyang2022.com'),
                    ('DNS', 'www.chenyang2020.com'),
                    ('DNS', '*.chenyang2022.com')),
 'version': 3}
[{'issuer': ((('commonName', 'www.modelCA.com'),),
             (('organizationName', 'Model CA LTD.'),),
             (('countryName', 'US'),),
             (('stateOrProvinceName', 'New York'),),
             (('localityName', 'Syracuse'),)),
  'notAfter': 'Aug  8 16:58:30 2032 GMT',
  'notBefore': 'Aug 11 16:58:30 2022 GMT',
  'serialNumber': '21678FD8BB56C6287E92E511DB8AC615C25B11E0',
  'subject': ((('commonName', 'www.modelCA.com'),),
              (('organizationName', 'Model CA LTD.'),),
              (('countryName', 'US'),),
              (('stateOrProvinceName', 'New York'),),
              (('localityName', 'Syracuse'),)),
  'version': 3}]
After TLS handshake. Press any key to continue ...
[b'\nHTTP/1.1 200 OK',
 b'Content-Type: text/html',
 b'',
 b'\n<!DOCTYPE html><html><body><h1>This is Bank32.com!</h1></body></html>\n']
```

可以看出，所有域名都成功了。

## Task 3: A Simple HTTPS Proxy

编写 `proxy.py`：

```python
#!/usr/bin/env python3  
import threading  
import ssl  
import socket  
  
cadir = "/etc/ssl/certs"  
  
def process_request(ssock_for_browser):  
    hostname = "codeforces.com"  
    # Make a connection to the real server  
    sock_for_server = socket.create_connection((hostname, 443))  
    # Set up the TLS context  
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)  
    context.load_verify_locations(capath=cadir)  
    context.verify_mode = ssl.CERT_REQUIRED  
    context.check_hostname = True  
    print("sock_for_server")  
    ssock_for_server = context.wrap_socket(sock_for_server, server_hostname=hostname, do_handshake_on_connect=False)  
    ssock_for_server.do_handshake()  
      
    request = ssock_for_browser.recv(2048)  
    if request:  
        # Forward request to server  
        ssock_for_server.sendall(request)  
  
    # Get response from server, and forward it to browser  
    response = ssock_for_server.recv(2048)  
    while response:  
        ssock_for_browser.sendall(response) # Forward to browser  
        response = ssock_for_server.recv(2048)  
      
    ssock_for_browser.shutdown(socket.SHUT_RDWR)  
    ssock_for_browser.close()  
     
SERVER_CERT = "./cf.crt"  
SERVER_PRIVATE = "./cf.key"  
context_srv = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)  
context_srv.load_cert_chain(SERVER_CERT, SERVER_PRIVATE)  
sock_listen = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)  
sock_listen.bind(("0.0.0.0", 443))  
sock_listen.listen(5)  
  
while True:  
    sock_for_browser, fromaddr = sock_listen.accept()  
    print(fromaddr)  
    ssock_for_browser = context_srv.wrap_socket(sock_for_browser, server_side=True)  
    x = threading.Thread(target=process_request, args=(ssock_for_browser,))  
    x.start() 
```

然后和上一节生成 `server.crt` 和 `server.key` 一样，生成 `cf.crt` 和 `cf.key`：

```shell
$ openssl req -newkey rsa:2048 -config ./cf_openssl.cnf -batch -sha256 -keyout cf.key -out cf.csr
Generating a RSA private key
...............................+++++
................+++++
writing new private key to 'cf.key'
Enter PEM pass phrase:
Verifying - Enter PEM pass phrase:
-----
$ openssl ca -md sha256 -days 3650 -config ./myopenssl.cnf -batch -in cf.csr -out cf.crt -cert ca.crt -keyfile ca.key
Using configuration from ./myopenssl.cnf
Enter pass phrase for ca.key:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 8193 (0x2001)
        Validity
            Not Before: Aug 11 17:19:52 2022 GMT
            Not After : Aug  8 17:19:52 2032 GMT
        Subject:
            countryName               = US
            stateOrProvinceName       = New York
            organizationName          = Model CA LTD.
            commonName                = codeforces.com
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Comment: 
                OpenSSL Generated Certificate
            X509v3 Subject Key Identifier: 
                27:DA:67:05:10:E9:FC:1A:46:C6:68:B4:D3:F3:AE:4E:1E:BE:EC:65
            X509v3 Authority Key Identifier: 
                keyid:28:63:81:40:6C:07:25:0D:B7:CC:16:F4:57:FF:94:08:1B:D0:C1:19

            X509v3 Subject Alternative Name: 
                DNS:codeforces.com, DNS:codeforces.com/*
Certificate is to be certified until Aug  8 17:19:52 2032 GMT (3650 days)

Write out database with 1 new entries
Data Base Updated
```

在 `/etc/hosts` 中添加：

```hosts
10.9.0.143 codeforces.com
```

修改 `/etc/resolv.cnf` 的 `nameserver` 为 `8.8.8.8`。

然后启动：

```shell
proxy.py
```

访问 [codeforces.com](codeforces.com) 可以看到：

![tls3](/assets/post/images/tls3.png)

```shell
$ proxy.py
Enter PEM pass phrase:
('10.9.0.1', 52072)
sock_for_server
('10.9.0.1', 52080)
sock_for_server
('10.9.0.1', 52084)
('10.9.0.1', 52086)
('10.9.0.1', 52092)
('10.9.0.1', 52094)
sock_for_server
sock_for_server
sock_for_server
sock_for_server
```

表明成功添加了 proxy。

接下来我们进行登录操作并抓包：

![tls4](/assets/post/images/tls4.png)

我们使用 wireshark 连接 proxy，并抓取到相关报文：

![tls5](/assets/post/images/tls5.png)

报文具体的内容涉及个人隐私不放图了。经过简单过滤查找，我们发现 codeforces 的用户名和密码都是明文传输给服务器的，连哈希都没有做。

## 实验总结

本实验的遇到困难的地方在 task 2.c，要求证书与 CA 的 C、ST 等完全相同才能正常工作，否则会报错。经过查阅发现，这是签发策略导致的。策略通常有三种

- 匹配：要求申请填写的信息跟CA设置信息必须一致
- 支持：必须填写这项申请信息
- 可选：可有可无

而在本实验中使用的是匹配，所以必须和 CA 一模一样。
