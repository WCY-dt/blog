---
layout:     post
title:      "PKI"
date:       2022-10-04 00:00:00 +0800
categories: 实验
tags:       seedlab pki
summary:    "本文为 SEED Labs 2.0 - PKI Lab 的实验记录，介绍了公钥基础设施 (PKI) 的工作原理、如何保护 Web 以及如何击败中间人攻击。"
series:     SEEDLabs
series_index: 10
---

本文为 [SEED Labs 2.0 - PKI Lab](https://seedsecuritylabs.org/Labs_20.04/Crypto/Crypto_PKI/) 的实验记录。

## 实验原理

如今，公钥密码学已经成为了安全通信的基础。但是当通信的一方将其公钥发送给另一方时，它会受到中间人攻击。问题在于无法验证公钥的所有权——即给定公钥及其声称的所有者信息。我们如何确保公钥确实由声称的所有者拥有？公钥基础设施 (PKI) 是解决此问题的实用方案。本实验的学习目标是了解 PKI 的工作原理、PKI 如何用于保护 Web 以及 PKI 如何击败中间人攻击。此外，我们能够了解公钥基础设施中的信任根，以及如果根信任被破坏会出现什么问题。本实验涵盖以下主题：
• 公钥加密、公钥基础设施 (PKI)
• 证书颁发机构 (CA)、X.509 证书和根 CA
• Apache、HTTP 和 HTTPS
• 中间人攻击

## Task 1: Becoming a Certificate Authority

首先修改 hosts：

```shell
sudo vi /etc/hosts
```

添加：

```plaintext
10.9.0.80 www.chenyang2022.com
```

然后，我们创建一个 CA：

```shell
mkdir demoCA
cd demoCA
mkdir certs crl newcerts
touch index.txt serial
echo 1000 > serial
cd ..
cp /usr/lib/ssl/openssl.cnf myCA_openssl.cnf
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -keyout ca.key -out ca.crt -subj "/CN=www.modelCA.com/O=Model CA LTD./C=US" -passout pass:dees
```

可以看一看刚刚操作的效果：

```shell
$ openssl x509 -in ca.crt -text -noout
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            65:9c:18:a0:b1:d1:3d:03:b4:40:d0:88:7d:41:eb:e2:03:28:8a:43
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = www.modelCA.com, O = Model CA LTD., C = US
        Validity
            Not Before: Aug  9 02:24:41 2022 GMT
            Not After : Aug  6 02:24:41 2032 GMT
        Subject: CN = www.modelCA.com, O = Model CA LTD., C = US
......
$ openssl rsa -in ca.key -text -noout
Enter pass phrase for ca.key:
RSA Private-Key: (4096 bit, 2 primes)
modulus:
......
```

此处输出内容较多，省略了一部分没有粘贴。

将 `myCA_openssl.cnf` 文件中的

```ini
# unique_subject    = no
# copy_extensions   = copy
```

取消注释，使得能够签发多个域名。

> What part of the certificate indicates this is a CA’s certificate?

```properties
CA:TRUE
```

> What part of the certificate indicates this is a self-signed certificate?

```properties
Issuer: CN = www.modelCA.com, O = Model CA LTD., C = US
Subject: CN = www.modelCA.com, O = Model CA LTD., C = US
```

Subject 和 Issuer 相同，说明这是自签名 CA。

> In the RSA algorithm, we have a public exponent $e$, a private exponent $d$, a modulus $n$, and two secret numbers $p$ and $q$, such that $n = pq$. Please identify the values for these elements in your certificate and key files.

在 CA 的私钥文件中，$n$ 为

```properties
modulus:
    00:c1:89:79:8c:3b:28:db:ab:a4:f0:d1:0b:83:e2:
    b1:10:06:df:a9:2d:e8:4b:30:17:2e:d2:84:1b:79:
    c5:90:0d:3a:e0:d2:c1:26:19:7f:a4:42:22:d4:d1:
    7e:f1:66:f6:13:ba:85:52:03:a7:6f:b4:7d:3b:84:
    48:b2:e6:87:03:65:79:ec:e0:07:b2:be:de:52:55:
    21:cd:a7:7f:c3:4f:bd:e6:2d:8c:f1:4f:bf:51:07:
    d5:c2:72:5a:93:97:94:de:df:bb:fe:e4:be:4a:90:
    fe:c5:52:8f:56:5c:33:0b:2e:6b:57:f3:52:ba:b6:
    96:37:5a:2d:ca:72:0a:09:b1:d5:11:31:7b:f6:80:
    67:aa:85:37:ac:9a:33:42:42:11:64:a6:cc:1a:54:
    8a:2b:da:94:b9:15:f8:3d:db:77:25:76:9f:09:89:
    30:6d:8f:24:1c:1b:cd:b1:85:4e:a1:60:f6:c3:7b:
    4c:06:20:62:f6:72:6c:56:a7:58:82:2d:79:96:e7:
    fb:eb:ff:f7:7c:07:f1:2b:36:72:5f:9a:0e:8b:bd:
    b9:9e:b7:93:22:96:e8:e6:44:ed:fe:da:44:01:d3:
    c3:05:27:ed:47:31:fb:7e:74:0b:10:c6:8e:09:c8:
    59:08:8c:43:cb:47:eb:b7:d4:5a:00:8c:f8:f3:af:
    71:98:d0:c5:ee:ef:b6:97:b7:58:59:3a:72:4a:8e:
    06:d4:dc:18:a8:62:52:d4:57:69:4c:cb:d2:e4:f2:
    a4:23:52:a7:78:cf:06:32:d0:c0:5b:79:35:27:f6:
    3e:b4:30:1f:43:f9:ed:95:12:ea:59:88:f4:79:cb:
    70:da:c1:c7:1b:2a:99:5f:26:a3:b8:17:d9:53:2a:
    44:40:49:18:e9:eb:76:48:b5:12:6f:6e:99:f3:a6:
    2a:d3:53:a7:f8:57:57:17:1b:38:af:1f:c9:c9:76:
    c2:f4:a0:b0:cd:06:c8:4d:a0:9e:98:82:9d:16:86:
    de:07:08:0f:a2:35:3b:21:f5:43:00:a4:ab:ec:a8:
    62:db:b7:95:b2:30:c0:08:7d:3d:d6:75:bc:d0:de:
    70:0a:3f:26:66:07:54:f4:a9:17:e4:cc:e2:ef:ee:
    1f:e4:af:b1:7a:3b:bb:ab:06:f3:ec:39:72:03:03:
    67:04:22:e2:ab:b8:be:f5:f5:43:df:e9:b2:d3:57:
    16:9f:1b:29:66:cd:e7:b2:ba:3a:e0:f5:a7:a5:ab:
    79:be:f8:47:40:9a:7c:8b:09:4b:80:b9:0d:4f:46:
    9f:4e:f1:a7:65:ea:7c:14:ee:2b:00:6f:a3:54:ef:
    ea:3f:92:20:2a:b4:d2:8a:b6:79:31:28:17:40:21:
    d6:b5:cb
```

$p$ 和 $q$ 分别为

```properties
prime1:
    00:e0:c1:03:60:63:87:56:b1:89:e3:62:91:57:ac:
    5f:57:c1:02:f1:af:c9:05:99:26:c9:2a:bb:30:c9:
    a3:b2:ba:bc:2f:79:fd:4c:3f:3c:e6:04:07:20:53:
    3a:c9:83:ac:ca:73:1f:85:84:83:b4:62:0b:e6:c9:
    ab:c1:87:ee:0a:9d:b6:d0:67:33:b2:7b:d9:78:0b:
    78:78:bb:67:7f:30:1c:7b:93:cf:3d:49:dc:25:8a:
    f2:6c:6f:1e:06:eb:e6:d2:b2:52:97:18:aa:46:65:
    20:3a:ab:0d:84:a9:52:61:36:e1:99:f6:a8:14:26:
    60:81:7d:aa:b7:4d:9d:18:73:c3:b6:f3:be:a4:66:
    06:08:46:66:89:80:44:47:e6:7d:d4:e8:26:de:1d:
    cf:d4:7b:3f:ca:db:d9:4c:92:aa:9b:34:47:79:08:
    20:37:c5:18:b5:78:b6:70:aa:8d:32:69:b4:f8:35:
    f5:7c:bb:d2:e3:73:bb:dd:6a:33:81:af:c6:d2:ae:
    66:b0:f0:78:db:29:90:d3:28:89:9a:12:9c:8c:7a:
    b8:9e:0a:ac:f0:42:37:e2:fe:0c:03:a6:24:5b:7c:
    00:1c:2c:34:66:21:aa:93:1e:a6:c3:b4:42:02:60:
    47:bb:ee:15:cc:80:c0:19:85:44:87:ec:c1:0c:14:
    d6:ff
prime2:
    00:dc:71:73:8d:77:e3:81:bf:80:e0:b4:4c:a6:30:
    62:7e:76:b5:aa:0d:b3:08:8e:8e:0e:09:af:cd:96:
    58:89:81:52:50:6d:17:58:0b:09:59:fb:b6:18:fe:
    9d:67:95:b3:09:b9:af:f2:f4:f2:2c:d9:db:76:c1:
    9a:88:3f:40:1a:ae:be:59:33:29:4f:cc:63:23:5c:
    4c:cf:db:3a:7e:cb:68:aa:16:a2:b7:ce:39:08:79:
    c1:9c:e8:4c:45:3e:0a:a4:73:6b:6d:93:bf:78:b9:
    ad:08:8e:54:d5:fd:2b:39:e6:1c:ae:1e:e6:0d:ce:
    d6:b7:3c:d7:25:59:11:b4:02:db:ca:13:5f:5e:db:
    26:b3:2b:2f:71:7b:5e:45:f0:6a:82:5e:df:c9:dc:
    80:b1:c8:9a:50:59:d1:b6:7d:46:0f:89:dc:e1:5b:
    1f:41:d4:20:ec:30:b7:4d:8d:7f:93:9e:cc:1f:9e:
    ee:23:51:0b:ec:f0:57:f7:be:eb:90:5d:46:d4:e0:
    44:5f:41:de:ed:3b:f7:29:b4:c8:64:a0:d1:ed:ee:
    fc:99:1e:9f:80:0c:6a:64:c3:37:07:b6:12:d0:1d:
    97:97:91:ff:95:50:d5:c3:b2:fd:74:e7:05:b4:5e:
    fc:12:be:6e:7c:8c:1e:7f:48:ad:66:d7:63:ca:a4:
    cd:35
```

$e$ 和 $d$ 分别为

```properties
publicExponent: 65537 (0x10001)
privateExponent:
    00:b3:da:f6:42:03:98:6c:cc:8e:73:dd:51:3e:37:
    25:25:27:be:22:92:af:15:70:93:9a:c7:b8:4d:70:
    54:d1:11:fa:6d:84:6e:4a:e1:d7:64:e6:b1:47:e5:
    88:7a:fe:9c:20:a9:6d:cc:51:e9:00:3e:53:43:44:
    23:eb:5d:a0:8a:df:7a:f7:4f:1a:d8:59:d8:71:da:
    fb:97:0a:da:08:bf:ca:52:66:72:5c:af:27:b4:3d:
    fb:c0:c0:54:bc:64:59:cc:e5:4e:e8:09:db:6d:a0:
    61:a3:2e:9e:56:3b:48:94:53:87:1e:2c:d9:ec:fa:
    51:8f:0f:17:0e:d3:fb:d0:16:9b:53:67:11:34:7b:
    0f:db:c0:01:85:3d:a7:f5:23:40:d6:b0:cb:6c:8c:
    b3:fb:1d:1e:a9:02:69:b7:d2:84:5f:24:65:97:8f:
    0e:9a:42:33:e4:8b:52:14:6f:36:2b:72:d8:df:c1:
    6d:5d:24:2b:d3:ab:72:52:f5:21:a3:98:6f:2e:76:
    57:ff:71:d8:a4:43:1d:34:73:5c:c6:cb:7c:49:10:
    ff:b7:28:12:6c:4a:a2:15:9c:69:30:35:d6:8d:7c:
    25:f8:5c:aa:7d:47:4d:d8:ae:2e:ba:60:4b:0f:7c:
    48:81:51:18:8f:89:3e:dd:8f:52:34:c0:cd:7a:68:
    c8:bf:05:4a:3e:74:3b:22:ef:e3:35:5f:78:86:e3:
    52:b6:6a:f8:26:db:fd:5e:16:76:06:a9:25:bd:5f:
    eb:16:08:17:ba:ab:dc:d7:45:aa:56:fe:db:4d:5e:
    55:1f:fd:57:94:36:21:77:81:96:f7:79:9e:65:36:
    0b:ec:75:b8:38:a4:7c:5d:d6:f1:22:dc:60:00:fe:
    b2:96:fc:5a:16:4d:f3:90:59:6c:e2:7a:50:de:55:
    f9:d7:8a:50:62:30:b0:bc:12:46:28:1a:72:a9:c9:
    17:9c:1d:98:24:61:e2:ea:56:b3:a2:88:51:fb:c7:
    0b:34:54:11:60:05:f1:af:33:72:fb:b3:0c:2d:9d:
    f8:37:8d:ca:61:0c:f6:7f:64:83:db:36:23:70:d0:
    3b:87:64:f1:e3:e6:83:0d:06:66:cd:d2:0d:2f:c3:
    13:c4:d5:08:a4:c0:89:c2:ba:1d:1e:03:3b:41:a9:
    92:1a:f4:7b:8b:f9:42:bc:71:e9:6a:dc:fd:09:41:
    9e:ae:84:a2:24:2b:92:53:f5:b7:44:6c:eb:77:7e:
    f8:d0:97:cf:26:61:2c:58:e9:c3:76:9e:3b:bd:93:
    1f:34:b3:2c:4b:63:41:1b:fd:aa:e5:af:9e:a3:eb:
    44:ae:c3:6c:6e:74:29:37:52:3b:1a:7e:43:65:51:
    e0:a9:c1
```

而在公钥文件中，只有 $n$ 和 $e$。

## Task 2: Generating a Certificate Request for Your Web Server

我们首先按照要求，为自己的域名生成证书：

```shell
openssl req -newkey rsa:2048 -sha256 -keyout server.key -out server.csr -subj "/CN=www.chenyang2022.com/O=Chenyang2022 Inc./C=US" -passout pass:dees
```

我们也可以再加一些域名：

```shell
openssl req -newkey rsa:2048 -sha256 -keyout server.key -out server.csr -subj "/CN=www.chenyang2022.com/O=Chenyang2022 Inc./C=US" -passout pass:dees -addext "subjectAltName = DNS:www.chenyang2022.com, DNS:www.chenyang2022A.com, DNS:www.chenyang2022B.com"
```

我们查看一下效果：

```shell
$ openssl req -in server.csr -text -noout
Certificate Request:
    Data:
        Version: 1 (0x0)
        Subject: CN = www.chenyang2022.com, O = Chenyang2022 Inc., C = US
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
......
                Exponent: 65537 (0x10001)
        Attributes:
        Requested Extensions:
            X509v3 Subject Alternative Name: 
                DNS:www.chenyang2022.com, DNS:www.chenyang2022A.com, DNS:www.chenyang2022B.com
    Signature Algorithm: sha256WithRSAEncryption
......
$ openssl rsa -in server.key -text -noout
Enter pass phrase for server.key:
RSA Private-Key: (2048 bit, 2 primes)
modulus:
......
```

## Task 3: Generating a Certificate for your server

我们使用 `ca` 为自己的证书签名：

```shell
$ openssl ca -config myCA_openssl.cnf -policy policy_anything -md sha256 -days 3650 -in server.csr -out server.crt -batch -cert ca.crt -keyfile ca.key
Using configuration from myCA_openssl.cnf
Enter pass phrase for ca.key:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 4097 (0x1001)
        Validity
            Not Before: Aug  9 02:42:42 2022 GMT
            Not After : Aug  6 02:42:42 2032 GMT
        Subject:
            countryName               = US
            organizationName          = Chenyang2022 Inc.
            commonName                = www.chenyang2022.com
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Comment: 
                OpenSSL Generated Certificate
            X509v3 Subject Key Identifier: 
                12:15:56:DD:FA:DF:6D:95:49:08:00:6E:65:C5:8F:AA:06:62:3C:FA
            X509v3 Authority Key Identifier: 
                keyid:B9:61:E4:E1:23:EB:80:A0:BF:6B:A7:B2:57:CC:47:D8:D3:11:E5:73

            X509v3 Subject Alternative Name: 
                DNS:www.chenyang2022.com, DNS:www.chenyang2022A.com, DNS:www.chenyang2022B.com
Certificate is to be certified until Aug  6 02:42:42 2032 GMT (3650 days)

Write out database with 1 new entries
Data Base Updated
```

我们查看一下效果：

```shell
$ openssl x509 -in server.crt -text -noout
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 4097 (0x1001)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = www.modelCA.com, O = Model CA LTD., C = US
        Validity
            Not Before: Aug  9 02:42:42 2022 GMT
            Not After : Aug  6 02:42:42 2032 GMT
        Subject: C = US, O = Chenyang2022 Inc., CN = www.chenyang2022.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
......
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Comment: 
                OpenSSL Generated Certificate
            X509v3 Subject Key Identifier: 
                12:15:56:DD:FA:DF:6D:95:49:08:00:6E:65:C5:8F:AA:06:62:3C:FA
            X509v3 Authority Key Identifier: 
                keyid:B9:61:E4:E1:23:EB:80:A0:BF:6B:A7:B2:57:CC:47:D8:D3:11:E5:73

            X509v3 Subject Alternative Name: 
                DNS:www.chenyang2022.com, DNS:www.chenyang2022A.com, DNS:www.chenyang2022B.com
    Signature Algorithm: sha256WithRSAEncryption
......
```

## Task 4: Deploying Certificate in an Apache-Based HTTPS Website

首先前往 docker 文件夹，在 `image_www` 中创建 `chenyang2022_apache_ssl.conf`，内容如下：

```conf
<VirtualHost *:443>
    DocumentRoot /var/www/chenyang2022
    ServerName www.chenyang2022.com
    ServerAlias www.chenyang2022A.com
    ServerAlias www.chenyang2022B.com
    DirectoryIndex index.html
    SSLEngine On
    SSLCertificateFile /certs/server.crt
    SSLCertificateKeyFile /certs/server.key
</VirtualHost>
```

将 `server.crt` 和 `server.key` 复制进 `certs` 中，并修改 `Dockerfile` 为：

```dockerfile
FROM handsonsecurity/seed-server:apache-php

ARG WWWDIR=/var/www/chenyang2022

COPY ./index.html ./index_red.html $WWWDIR/
COPY ./chenyang2022_apache_ssl.conf /etc/apache2/sites-available
COPY ./certs/server.crt ./certs/server.key  /certs/

RUN  chmod 400 /certs/server.key \
     && chmod 644 $WWWDIR/index.html \
     && chmod 644 $WWWDIR/index_red.html \
     && a2enmod ssl \
     && a2ensite chenyang2022_apache_ssl   

CMD  tail -f /dev/null
```

启动 docker：

```shell
dcbuild
dcup
```

然后新建 terminal，进入 shell：

```shell
$ dockps
d26128523dc7  www-10.9.0.80
$ docksh d
root@d26128523dc7:/# service apache2 start
 * Starting Apache httpd web server apache2                                     Enter passphrase for SSL/TLS keys for www.chenyang2022.com:443 (RSA):
 *
```

访问 [https://www.chenyang2022.com](https://www.chenyang2022.com) 可以看到：

![证书未受信任](/assets/post/images/pki1.webp)

将 `ca.cert` 放入 `volumes` 文件夹，打开 [about:preferences#privacy](about:preferences#privacy)，在 `Authorities` 标签下将 `ca.cert` 导入，选择 `Trust this CA to identify web sites` 并确认。

再次访问 [https://www.chenyang2022.com](https://www.chenyang2022.com) 可以看到：

![证书受信任](/assets/post/images/pki2.webp)

我们刚刚导入的 CA 证书使得我们自己的服务器受信任了。

## Task 5: Launching a Man-In-The-Middle Attack

我们试着劫持东南大学主页。修改 hosts：

```shell
sudo vi /etc/hosts
```

添加：

```plaintext
10.9.0.80 www.seu.edu.cn
```

访问 [https://www.seu.edu.cn](https://www.seu.edu.cn)，可以看到

![证书未受信任](/assets/post/images/pki3.webp)

我们访问到了自己搭建的服务器，但是证书不被信任。

## Task 6: Launching a Man-In-The-Middle Attack with a Compromised CA

相似的，我们给东南大学主页生成假的证书：

```shell
openssl req -newkey rsa:2048 -sha256 -keyout university.key -out university.csr -subj "/CN=www.seu.edu.cn/O=Southeast University/C=US" -passout pass:dees
openssl ca -config myCA_openssl.cnf -policy policy_anything -md sha256 -days 3650 -in university.csr -out university.crt -batch -cert ca.crt -keyfile ca.key
```

前往 docker 文件夹，在 `image_www` 中创建 `seu_apache_ssl.conf`，内容如下：

```conf
<VirtualHost *:443>
    DocumentRoot /var/www/chenyang2022
    ServerName www.seu.edu.cn
    DirectoryIndex index.html
    SSLEngine On
    SSLCertificateFile /certs/university.crt
    SSLCertificateKeyFile /certs/university.key
</VirtualHost>
```

将 `university.crt` 和 `university.key` 复制进 `certs` 中，并修改 `Dockerfile` 为：

```dockerfile
FROM handsonsecurity/seed-server:apache-php

ARG WWWDIR=/var/www/chenyang2022

COPY ./index.html ./index_red.html $WWWDIR/
COPY ./chenyang2022_apache_ssl.conf /etc/apache2/sites-available
COPY ./seu_apache_ssl.conf /etc/apache2/sites-available
COPY ./certs/server.crt ./certs/server.key  /certs/
COPY ./certs/university.crt ./certs/university.key  /certs/

RUN  chmod 400 /certs/server.key \
     && chmod 400 /certs/university.key \
     && chmod 644 $WWWDIR/index.html \
     && chmod 644 $WWWDIR/index_red.html \
     && a2enmod ssl \
     && a2ensite chenyang2022_apache_ssl \
     && a2ensite seu_apache_ssl   

CMD  tail -f /dev/null
```

启动 docker：

```shell
dcbuild
dcup
```

然后新建 terminal，进入 shell：

```shell
$ dockps
a74ea8a4321e  www-10.9.0.80
$ docksh a
root@a74ea8a4321e:/# service apache2 start
 * Starting Apache httpd web server apache2                                     Enter passphrase for SSL/TLS keys for www.seu.edu.cn:443 (RSA):
 *
```

再次访问 [https://www.seu.edu.cn](https://www.seu.edu.cn)，可以看到：

![证书受信任](/assets/post/images/pki4.webp)

东南大学主页被定向到了我们自己的服务器，并且证书没有被浏览器怀疑。也就是说，我们成功对东南大学主页实现了中间人攻击。

## 实验总结

本次实验操作难度较低，依葫芦画瓢即可。

通过本实验，我们了解了 PKI 的工作原理、PKI 如何用于保护 Web 以及 PKI 如何击败中间人攻击。此外，我们了解了公钥基础设施中的信任根，以及如果根信任被破坏会出现什么问题。
