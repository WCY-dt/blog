---
layout: post
title:  "【安全】PKI和OpenSSL"
date:   2023-07-19 00:00:00 +0800
categories: 安全
tags: 安全
comments: 1
mathjax: true
copyrights: 原创
---

本文讨论了 PKI 和 OpenSSL 的相关内容。别急，这个也还没写完……

# PKI

## 中间人攻击

假设Alice和Bob需要通信，那么他们必然需要交换密钥：

- Alice将自己的公钥发送给Bob
- Bob使用Alice的公钥去加密一个会话密钥 $K$，并将加密后的会话密钥密钥发回给Alice
- 这个加密后的会话密钥只有Alice可以用她的私钥解开

尽管这个过程可以防止攻击者直接窃取到会话密钥，但依然无法防止中间人攻击（MITM Attack）。假设Mallory是一个大黑阔：

- Alice的公钥发送出去后，被Mallory截获
- Mallory使用扣留了Alice的公钥，并把自己的公钥发给了Bob
- Bob以为发来的公钥是Alice的，于是用这个公钥加密了会话密钥并发回去
- Mallory继续解惑Bob发回的内容，使用自己的私钥解密出了会话密钥
- Mallory使用刚刚得到的Alice的公钥加密会话密钥，并发给Alice
- Alice用自己的私钥解密得到会话密钥

于是，Mallory通过这个过程获得了会话密钥。这个过程也被称为中间人攻击。

数字签名可以防止中间人攻击。比如，公安局是可信的，所以Alice和Bob可以这样交换会话密钥：

- Alice亲自去一趟公安局，公安局使用完善的手段验明来者正是Alice
- 公安局准备一份包括Alice名字、公钥及其它一些信息的文件，并使用公安局的私钥给这份文件签名
- Alice发送自己的公钥给Bob，同时还发了一份公安局签名过的文件
- 改不了公安局签名文件的Mallory，只能眼睁睁看它溜走
- Bob亲自去公安局获取公安局的公钥
- Bob用公安局的公钥解密签名文件，确认对方就是Alice，于是生成会话密钥并发回

在网络上，实现这个过程的方案被称为公钥基础设施（PKI），其包含两个部分：

- 认证机构（CA），也就是上文的公安局。其一半由一些可信的公司充当
- 数字证书，该证书需要由CA签名后才有效

## 公钥证书

通常，公钥证书的形式是由X.509标准制定的。我们使用OpenSSL获取东南大学网站的证书：

```shell
openssl s_client -showcerts -connect www.seu.edu.cn:443 </dev/null
```

上面的命令中，`openssl s_client` 表示开启一个客户端，`-showcerts` 选项则表示打印出所有接收到的证书。运行结果很长，不粘贴了。其中形如

```
-----BEGIN CERTIFICATE-----
MIIG8TCCBVmgAwIBAgIRALh982dHm8KpFIkWi8LAflIwDQYJKoZIhvcNAQEMBQAw
省略
oHZAPXY=
-----END CERTIFICATE-----
```

的内容就是证书的主体了。这一段是BASE64编码过的。我们可以先将其保存到一个文件（`seu.pem`）中，然后解码为二进制数据：

```shell
openssl x509 -in seu.pem -outform der > seu.der
```

解码后的内容依然需要使用查看二进制的工具查看。

我们也可以直接转换为可读的形式：

```shell
openssl x509 -in seu.pem -text -noout
```

得到结果如下：

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            b8:7d:f3:67:47:9b:c2:a9:14:89:16:8b:c2:c0:7e:52
        Signature Algorithm: sha384WithRSAEncryption
        Issuer: C = CN, O = "TrustAsia Technologies, Inc.", CN = TrustAsia RSA OV TLS CA G3
        Validity
            Not Before: Jun 13 00:00:00 2023 GMT
            Not After : Jul 12 23:59:59 2024 GMT
        Subject: C = CN, ST = \E6\B1\9F\E8\8B\8F\E7\9C\81, O = \E4\B8\9C\E5\8D\97\E5\A4\A7\E5\AD\A6, CN = *.seu.edu.cn
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:bc:9d:8d:e9:59:d7:3c:03:6c:51:ee:ff:c9:8c:
                    省略
                    9d:37
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            省略
    Signature Algorithm: sha384WithRSAEncryption
    Signature Value:
        96:32:81:ab:71:da:fc:de:df:c0:8a:3f:e6:4b:2e:66:0f:b7:
        省略
        c9:a0:76:40:3d:76
```

其中

- `Serial Number` 是证书的序列号。每个证书都有一个独特的序列号
- `Signature Algorithm` 为签名的加密方式，例如东南大学的证书使用了SHA384和RSA
- `Issuer` 表明证书是谁签发的，这里是 TrustAsia Technologies, Inc.
- `Validity` 规定了证书的有效时间
- `Subject` 表明证书拥有者的信息，也就是之前提到“Alice的名字”。这也是证书的主要目的
- `Subject Public Key Info` 为公钥。这里由于为RSA加密，故列出来模和指数
- `X509v3 extensions` 为证书的一些扩展信息

## CA

根据我们前文的讨论，CA主要由两个作用：

- 验证 `Subject`。CA需要检查申请者是否真的是提交的 `Subject`。例如，我想给自己的域名 `ch3nyang.top` 搞个证书，那我会向CA提交相关信息。CA验证提交的信息，如果确认我就是 `ch3nyang.top` 的拥有者，就会给我发证书。

  验证的手段很多，包括whois查询、联系注册机构（RA）、甚至联络政府部门。

- 签发数字证书。一旦验证了身份，就可以下发证书。任何人只要持有CA的公钥，就可以验证证书真伪。

我们使用OpenSSL模拟整个认证的过程：

### 成为CA

- 部署CA

  我们创建一个 `myCA`

  ```shell
  mkdir myCA
  cd myCA
  mkdir certs newcerts conf
  touch serial index.txt
  echo 1000 > serial
  ```

- 为 `myCA` 生成公私钥对和证书

  ```shell 
  openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -keyout myCA_key.pem -out myCA_cert.pem
  ```

  OpenSSL会要求你输入CA的一些基本信息。

  > 当然，也可以直接使用配置文件。比如，我们创建 `conf/generateCA.conf`：
  >
  > ```conf
  > [ req ]
  > default_keyfile = myCA_key.pem
  > default_md = md5
  > prompt = no
  > distinguished_name = ca_distinguished_name
  > x509_extensions = ca_extensions
  > 
  > [ ca_distinguished_name ]
  > organizationName = ch3nyang
  > commonName = cyCA
  > emailAddress = ch3nyang@ch3nyang.top
  > 
  > [ ca_extensions ]
  > basicConstraints = CA:true
  > ```
  >
  > 其中，`ca_distinguished_name` 部分可以填入想填写的信息。
  >
  > 然后指定配置文件生成：
  >
  > ```shell
  > openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -out myCA_cert.pem -config conf/generateCA.cnf
  > ```
  
  很容易看出，`myCA_key.pem` 就是CA的私钥，`myCA_cert.pem` 就是CA的公钥。同样的，可以查看证书的公钥：
  
  ```shell
  openssl x509 -in myCA_cert.pem -text -noout
  ```

### 从CA获取证书

假设一个银行想从我们刚刚创建的CA处获取证书。

- 生成公私钥对

  首先为银行生成公私钥：

  ```shell
  openssl genrsa -aes128 -out certs/bank_key.pem 2048
  ```

  `bank_key.pem` 会由用户设置的密码保护（如果不需要，可以把 `-aes128` 去掉）。用下面的指令查看其内容：

  ```shell
  openssl rsa -noout -text -in certs/bank_key.pem
  ```

  输出为：

  ```
  Private-Key: (2048 bit, 2 primes)
  modulus:
      00:c2:75:f4:01:48:a6:c6:ef:e7:bb:b7:97:00:4b:
      省略
      1b:03
  publicExponent: 65537 (0x10001)
  privateExponent:
      29:08:23:82:eb:d6:09:0f:11:0a:1a:7c:79:bb:02:
      省略
      89
  prime1:
      00:e7:d3:11:7a:66:ab:59:0d:78:a8:e4:3c:c2:af:
      省略
      aa:2e:d3:82:43:f0:69:3e:cb
  prime2:
      00:d6:bd:66:38:47:08:67:a7:93:e7:ed:d8:93:94:
      省略
      65:b1:1d:f1:03:b4:f0:15:a9
  exponent1:
      53:7a:fe:60:45:78:8e:a8:fb:3a:56:76:4a:e5:57:
      省略
      7b:c1:4e:b7:88:6b:5d:e1
  exponent2:
      43:27:81:e3:11:9b:b8:46:b8:c3:6c:27:31:a7:e9:
      省略
      50:4c:6b:c5:db:fc:c4:d9
  coefficient:
      1b:ce:87:95:bf:58:a2:9b:a5:fd:96:97:38:ea:76:
      省略
      62:68:bc:2b:32:50:de:59
  ```

  其中包含了公钥、私钥、模数的两个质因子和一些用于优化计算的参数。

- 生成证书签名请求

  使用下面的命令生成证书请求：

  ```shell
  openssl req -new -key certs/bank_key.pem -out certs/bank.csr -sha256
  ```

  需要注意的是，`Common Name` 处需要填写网址，例如 `ch3nyang.bank/`。

  > **踩坑**
  >
  > Common Name 处需要填写网址，其中可以使用通配符。

  查看 `bank.csr`：

  ```shell
  openssl req -in certs/bank.csr -text -noout
  ```

  输出为

  ```
  Certificate Request:
      Data:
          Version: 1 (0x0)
          Subject: C = CN, O = Ch3nyang Bank, CN = ch3nyang.bank/, emailAddress = bank@ch3nyang.top
          Subject Public Key Info:
              Public Key Algorithm: rsaEncryption
                  Public-Key: (2048 bit)
                  Modulus:
                      00:c2:75:f4:01:48:a6:c6:ef:e7:bb:b7:97:00:4b:
                      省略
                      1b:03
                  Exponent: 65537 (0x10001)
          Attributes:
              (none)
              Requested Extensions:
      Signature Algorithm: sha256WithRSAEncryption
      Signature Value:
          3c:3c:bc:11:30:7d:d5:ad:b2:4b:c6:a7:6a:a3:c7:93:b8:84:
          省略
          e4:33:b8:a8
  ```

  可以看出，该文件也包含了银行自己用自己的私钥进行的签名。这是为了让CA确认这个公钥确实来自银行。

  生成完毕后，银行会将这个文件发给CA。

- CA验证与签名

  CA签名默认使用的配置文件是 `/usr/lib/ssl/openssl.cnf`，该配置会默认寻找 `./demoCA` 文件夹中的内容，因此我们这里需要自定义配置文件：

  ```shell
  code conf/myCA.cnf
  ```

  内容为：

  ```
  [ ca ]
  default_ca      = myCA
  
  [ myCA ]
  dir            	= /myCA
  database       	= $dir/index.txt
  new_certs_dir  	= $dir/newcerts
  
  certificate    	= $dir/myCA_cert.pem
  serial         	= $dir/serial
  private_key    	= $dir/myCA_key.pem
  RANDFILE       	= $dir/.rand
  
  default_days    = 365
  default_crl_days= 30
  default_md      = sha256
  unique_subject  = no
  policy          = policy_any
  
  [ policy_any ]
  countryName             = optional
  stateOrProvinceName     = optional
  localityName            = optional
  organizationName        = optional
  organizationalUnitName  = optional
  commonName              = optional
  emailAddress            = supplied
  ```

  这里指定了相关文件的位置。

  > **踩坑**
  >
  > `dir` 处必须要填写完整路径，而不是项目的相对路径。
  
  CA根据收到的内容验证完毕后，会签发证书：
  
  ```shell
  openssl ca -in certs/bank.csr -out certs/bank_cert.pem -md sha256 -config conf/myCA.cnf
  ```

### 部署证书

- 未添加CA公钥的情形

  首先，将银行的公私钥合并：

  ```shell
  cp certs/bank_key.pem certs/bank_all.pem
  cat certs/bank_cert.pem >> certs/bank_all.pem
  ```

  然后启动服务：

  ```shell
  openssl s_server -cert certs/bank_all.pem -accept 4433 -www
  ```

  为了使用网址访问，我们将 `ch3nyang.bank` 加入到 `/etc/hosts` 中去。

  我们在新的shell中尝试连接：

  ```shell
  openssl s_client -connect ch3nyang.bank:4433
  ```

  得到结果

  ```
  CONNECTED(00000003)
  depth=0 C = CN, O = Ch3nyang Bank, CN = ch3nyang.bank/, emailAddress = bank@ch3nyang.top
  verify error:num=20:unable to get local issuer certificate
  verify return:1
  depth=0 C = CN, O = Ch3nyang Bank, CN = ch3nyang.bank/, emailAddress = bank@ch3nyang.top
  verify error:num=21:unable to verify the first certificate
  省略
  ```

  这是由于我们自己创建的CA并没有被添加进去，因此 `myCA` 签发的证书也不被认可。

  如果使用浏览器访问会得到同样的结果。

- 添加CA公钥的情形

  访问时带上CA：

  ```shell
  openssl s_client -connect ch3nyang.bank:4433 -CAfile myCA_cert.pem
  ```

  得到结果

  ```
  CONNECTED(00000003)
  depth=1 O = ch3nyang, CN = cyCA, emailAddress = ch3nyang@ch3nyang.top
  verify return:1
  depth=0 C = CN, O = Ch3nyang Bank, CN = ch3nyang.bank/, emailAddress = bank@ch3nyang.top
  verify return:1
  省略
  ```

  可以看到成功访问。

  对于浏览器访问，需要手动把 `myCA` 添加到信任证书里。

## 根和中间CA

顾名思义，根CA就是所有CA的老祖宗，它为下游的中间CA签发证书，并一级一级地传递下去。

为了验证根CA，需要获得根CA的公钥。但这个公钥既不能发送给用户（会产生中间人攻击），也不能让其它CA做担保（那它就不是根CA了）。因此，根本没法验证公钥是否真的属于根CA。因此，根CA的公钥通常直接预装在操作系统、浏览器等中，利用这些软件为根CA做担保。

### 信任链

我们依然查看东南大学的证书：

```shell
openssl s_client -showcerts -connect www.seu.edu.cn:443 </dev/null
```

得到结果

```
省略
Certificate chain
 0 s:C = CN, ST = \E6\B1\9F\E8\8B\8F\E7\9C\81, O = \E4\B8\9C\E5\8D\97\E5\A4\A7\E5\AD\A6, CN = *.seu.edu.cn
   i:C = CN, O = "TrustAsia Technologies, Inc.", CN = TrustAsia RSA OV TLS CA G3
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA384
   v:NotBefore: Jun 13 00:00:00 2023 GMT; NotAfter: Jul 12 23:59:59 2024 GMT
-----BEGIN CERTIFICATE-----
省略
-----END CERTIFICATE-----
 1 s:C = CN, O = "TrustAsia Technologies, Inc.", CN = TrustAsia RSA OV TLS CA G3
   i:C = US, ST = New Jersey, L = Jersey City, O = The USERTRUST Network, CN = USERTrust RSA Certification Authority
   a:PKEY: rsaEncryption, 3072 (bit); sigalg: RSA-SHA384
   v:NotBefore: Apr 20 00:00:00 2022 GMT; NotAfter: Apr 19 23:59:59 2032 GMT
-----BEGIN CERTIFICATE-----
省略
-----END CERTIFICATE-----
 2 s:C = US, ST = New Jersey, L = Jersey City, O = The USERTRUST Network, CN = USERTrust RSA Certification Authority
   i:C = GB, ST = Greater Manchester, L = Salford, O = Comodo CA Limited, CN = AAA Certificate Services
   a:PKEY: rsaEncryption, 4096 (bit); sigalg: RSA-SHA384
   v:NotBefore: Mar 12 00:00:00 2019 GMT; NotAfter: Dec 31 23:59:59 2028 GMT
-----BEGIN CERTIFICATE-----
省略
-----END CERTIFICATE-----
省略
```

可以看到，东南大学的证书由TrustAsia签发，而TrustAsia的证书由USERTrust签发，USERTrust的证书由AAA Certificate Services签发。这当中，签发AAA Certificate Services的证书的CA为根CA，其余均为中间CA。

在访问东南大学网站时，浏览器会首先检查AAA Certificate Services的根CA是否在浏览器信任列表中。如果在，就用它验证USERTrust的证书，再用USERTrust验证TrustAsia的证书，最后用TrustAsia验证东南大学的证书。如此构成一条信任链。

我们从浏览器中获取AAA的根证书保存为 `AAA.pem`，然后将上述几个中间证书分别保存为 `usertrust.pem`、`trustasia.pem`、`seu.pem`，然后将 `usertrust.pem 和 trustasia.pem` 合成 `inter.pem`。验证信任链：

```shell
openssl verify -verbose -partial_chain -CAfile AAA.pem -untrusted inter.pem seu.pem
seu.pem: OK
```

其中，`-CAfile` 提供了自签名的根CA证书。

> **踩坑**
>
> 当有多个中间CA时，需要把它们的证书合成一个文件，且靠近根CA的放在前面。

### 制作中间CA

制作中间CA与之前的签名基本相同，只需要在签名时加上 `-extensions v3_ca` 即可。

# TLS

传输层安全协议（TLS）就是标准化后的SSL。

> 这块高兴起来再写。。。

## 安装指定版本 OpenSSL

先在官网下载 OpenSSL 的 tgz 包，完了解压进去。

设置安装路径，这个路径可以根据个人喜好：

```shell
sudo ./config  --prefix=/usr/local/openssl
```

直接编译安装

```shell
sudo make
sudo make install
```

这时 `/usr/local/openssl` 目录内部就会有3个重要的目录

`<include>`:头文件位置

`<lib>`:静态库和动态库的位置

`<bin>`:可执行文件的位置

修改一下环境变量：

```shell
sudo nano /etc/profile
```

添加

```bash
# 在PATH中，找到程序可执行文件的路径。
export PATH=$PATH:/usr/local/openssl/bin
# gcc 编译器找到头文件（xx.h）的路径，写C++程序一般都不会用到gcc,所以这个可以忽略不写
export C_INCLUDE_PATH=$C_INCLUDE_PATH:/usr/local/openssl/include  
# g++ 编译器找到头文件（xx.h/hpp）的路径
export CPLUS_INCLUDE_PATH=$CPLUS_INCLUDE_PATH:/usr/local/openssl/include
# 找到静态库（xx.a）的路径
export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/openssl/lib  
# 找到动态链接库（xx.so）的路径
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/openssl/lib
```

重启即可

```shell
source /etc/profile
```

注意此时在任意路径使用openssl指令运行的是卸载后残留的旧版可执行程序，不过其调用的库文件却是你刚刚安装的的版本；只有在你使用绝对路径指定刚刚安装路径下 `/usr/local/openssl/bin` 的 openssl 可执行程序，才是真正使用你刚刚安装的版本；你可把 `/usr/local/openssl/bin` 下的两个文件，覆盖到 `/bin` 目录下，那么你就可以在任意路径直接使用 openssl 运行你安装的版本，不过有一定风险，系统自带是因为系统需要使用它做一些事情，你直接覆盖由于版本问题可能会有风险。

## SSL 通信程序

按照前文所述，为 server 和 client 签发证书。然后编写相互通信的程序：

ssl_server.c

```c
/*
执行命令：gcc code/ssl_server.c -o code/ssl_server -lssl -lcrypto && code/ssl_server 7838 1 server/server.crt server/server.key myCA_cert.crt
*/

#include <arpa/inet.h>
#include <errno.h>
#include <netinet/in.h>
#include <openssl/err.h>
#include <openssl/ssl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#define OK 0
#define ERR 1

#define MAXBUF 1024

/**
 * @brief SSL证书验证回调函数，打印X.509证书信息。
 *
 * @param ssl SSL连接对象
 * @return 成功返回OK（0），失败返回ERR（1）
 */
int ShowCerts(SSL* ssl) {
    X509* cert;
    char* line;

    cert = SSL_get_peer_certificate(ssl);  // 获取证书并返回X509操作句柄
    if (SSL_get_verify_result(ssl) == X509_V_OK) {
        printf("收到client X509证书\n");
    } else {
        printf("未收到client X509证书\n");
        return ERR;
    }
    if (cert != NULL) {
        printf("client数字证书信息:\n");
        line = X509_NAME_oneline(X509_get_subject_name(cert), 0, 0);
        printf("证书: %s\n", line);
        free(line);
        line = X509_NAME_oneline(X509_get_issuer_name(cert), 0, 0);
        printf("颁发者: %s\n\n", line);
        free(line);
        X509_free(cert);
        printf("对client证书验证通过!!!\n");
    } else {
        printf("无证书信息,对client证书验证失败!!!\n");
        return ERR;
    }
    return OK;
}

int main(int argc, char** argv) {
    int sockfd, new_fd;
    socklen_t len;
    struct sockaddr_in my_addr, their_addr;
    unsigned int myport, lisnum;
    char send_buf[MAXBUF + 1];
    char recv_buf[MAXBUF + 1];
    SSL_CTX* ctx;

    /* 检查命令行参数是否正确 */
    if (argc != 6) {
        printf("usage: %s ser_port lis_num ser_crt ser_key ca_crt\n", argv[0]);
        return -1;
    }

    /* 解析命令行参数 */
    myport = (argv[1]) ? atoi(argv[1]) : 7838; // port端口号，默认 7838
    lisnum = (argv[2]) ? atoi(argv[2]) : 2; // 监听数量，默认 2

    /*********************第一步：OPENSSL初始化*********************/

    /* 初始化SSL库和加载SSL算法 */
    SSL_library_init();            // SSL 库初始化
    OpenSSL_add_all_algorithms();  // 载入所有 SSL 算法
    SSL_load_error_strings();      // 载入所有 SSL 错误消息

    /* 创建SSL上下文 */
    ctx = SSL_CTX_new(SSLv23_server_method());  // 以兼容方式产生一个 SSL_CTX
    if (ctx == NULL) {
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 设置SSL上下文验证模式和CA证书路径 */
    // SSL_VERIFY_PEER 要求对证书进行认证，没有证书也会放行
    // SSL_VERIFY_FAIL_IF_NO_PEER_CERT 要求客户端需要提供证书，但验证发现单独使用没有证书也会放行
    SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, NULL);
    if (SSL_CTX_load_verify_locations(ctx, argv[5], NULL) <= 0) {  // 设置信任根证书
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 加载服务器证书和私钥 */
    if (SSL_CTX_use_certificate_file(ctx, argv[3], SSL_FILETYPE_PEM) <= 0) { // 加载证书
        ERR_print_errors_fp(stdout);
        exit(1);
    }
    if (SSL_CTX_use_PrivateKey_file(ctx, argv[4], SSL_FILETYPE_PEM) <= 0) { // 加载私钥
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 验证私钥是否与证书匹配 */
    if (!SSL_CTX_check_private_key(ctx)) {
        ERR_print_errors_fp(stdout);
        exit(1);
    }
    
    /*******************第二步：普通socket建立连接*******************/

    /* 创建 socket */
    if ((sockfd = socket(PF_INET, SOCK_STREAM, 0)) == -1) {
        perror("socket");
        exit(1);
    } else {
        printf("socket created success!\n");
    }

    /* 绑定 socket 到指定端口 */
    bzero(&my_addr, sizeof(my_addr));
    my_addr.sin_family = PF_INET;
    my_addr.sin_port = htons(myport);
    my_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(sockfd, (struct sockaddr*)&my_addr, sizeof(struct sockaddr)) == -1) {
        perror("bind");
        exit(1);
    } else {
        printf("binded success!\n");
    }

    /* 监听 socket，等待客户端连接 */
    if (listen(sockfd, lisnum) == -1) {
        perror("listen");
        exit(1);
    } else {
        printf("begin listen,waitting for client connect...\n");
    }

    SSL* ssl;
    len = sizeof(struct sockaddr);

    /* 接受客户端连接，并建立 SSL 连接 */
    if ((new_fd = accept(sockfd, (struct sockaddr*)&their_addr, &len)) == -1) {
        perror("accept");
        exit(errno);
    } else
        printf("server: got connection from %s, port %d, socket %d\n",
               inet_ntoa(their_addr.sin_addr), ntohs(their_addr.sin_port),
               new_fd);

    /******第三步：将普通 socket 与 SSL 绑定，在 SSL 层建立连接******/

    /* 创建SSL对象，将其与新的连接关联 */
    ssl = SSL_new(ctx);       // 基于 ctx 产生一个新的 SSL
    SSL_set_fd(ssl, new_fd);  // 将连接用户的 socket 加入到 SSL

    /* SSL握手，建立加密通信 */
    if (SSL_accept(ssl) == -1) {
        perror("accept");
        printf("SSL 连接失败!\n");
        close(new_fd);
        goto end;
    }

    /****************第四步：验证client客户端的证书****************/

    /* 验证客户端的证书 */
    if (ShowCerts(ssl) == ERR)
        goto end;

    /****************第五步：https进行收发数据****************/

    /* 通过SSL连接与客户端进行通信 */
    while (1) {

        /* SSL_read接收客户端的消息 */
        printf("等待客户端发送过来的消息：\n");
        len = SSL_read(ssl, recv_buf, MAXBUF);
        if (len > 0) {
            printf("接收client消息成功:'%s'，共%d个字节的数据\n", recv_buf, len);
        } else {
            printf("消息接收失败！错误代码是%d，错误信息是'%s'\n", errno, strerror(errno));
            break;
        }
        memset(recv_buf, 0, sizeof(recv_buf));  // 清空接收缓存区

        /* SSL_write发消息给客户端 */
        printf("请输入要发送给客户端的内容：\n");
        scanf("%s", send_buf);
        if (!strncmp(send_buf, "+++", 3)) {
            break;  // 收到+++表示退出
        }
        len = SSL_write(ssl, send_buf, strlen(send_buf));
        if (len <= 0) {
            printf("消息'%s'发送失败！错误代码是%d，错误信息是'%s'\n", send_buf, errno, strerror(errno));
            break;
        } else {
            printf("消息'%s'发送成功，共发送了%d个字节！\n", send_buf, len);
        }
        memset(send_buf, 0, sizeof(send_buf));  // 清空接收缓存区
    }

    /****************第六步：关闭连接及资源清理****************/
end:
    /* 关闭 SSL 连接和 socket，释放 SSL 上下文 */
    SSL_shutdown(ssl);  // 关闭 SSL 连接
    SSL_free(ssl);      // 释放 SSL
    close(new_fd);      // 关闭 socket
    close(sockfd);      // 关闭监听的 socket
    SSL_CTX_free(ctx);  // 释放 CTX
    return 0;
}
```

ssl_client.c

```c
/*
执行命令：gcc code/ssl_client.c -o code/ssl_client -lssl -lcrypto && code/ssl_client 127.0.0.1 7838 client/client.crt client/client.key myCA_cert.crt
*/

#include <arpa/inet.h>
#include <errno.h>
#include <netinet/in.h>
#include <openssl/err.h>
#include <openssl/ssl.h>
#include <resolv.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

#define OK 0
#define ERR 1

#define MAXBUF 1024

/**
 * @brief SSL证书验证回调函数，打印X.509证书信息。
 *
 * @param ssl SSL连接对象
 * @return 成功返回OK（0），失败返回ERR（1）
 */
int ShowCerts(SSL* ssl) {
    X509* cert;
    char* line;

    cert = SSL_get_peer_certificate(ssl);  // 获取证书并返回X509操作句柄
    if (SSL_get_verify_result(ssl) == X509_V_OK) {
        printf("收到server X509证书\n");
    } else {
        printf("未收到server X509证书\n");
        return ERR;
    }
    if (cert != NULL) {
        printf("server数字证书信息:\n");
        line = X509_NAME_oneline(X509_get_subject_name(cert), 0, 0);
        printf("证书: %s\n", line);
        free(line);
        line = X509_NAME_oneline(X509_get_issuer_name(cert), 0, 0);
        printf("颁发者: %s\n\n", line);
        free(line);
        X509_free(cert);
        printf("对server证书验证通过!!!\n");
    } else {
        printf("无证书信息,对server证书验证失败!!!\n");
        return ERR;
    }
    return OK;
}

int main(int argc, char** argv) {
    int sockfd, len;
    struct sockaddr_in dest;
    char send_buffer[MAXBUF + 1];
    char recv_buffer[MAXBUF + 1];
    SSL_CTX* ctx;
    SSL* ssl;

    /* 检查命令行参数是否正确 */
    if (argc != 6) {
        printf("usage: %s ser_ip ser_port cli_crt cli_key ca_crt\n", argv[0]);
        return -1;
    }

    /*********************第一步：OPENSSL初始化*********************/
    /* 初始化SSL库和加载SSL算法 */
    SSL_library_init();            // SSL 库初始化
    OpenSSL_add_all_algorithms();  // 载入所有 SSL 算法
    SSL_load_error_strings();      // 载入所有 SSL 错误消息

    /* 创建SSL上下文 */
    ctx = SSL_CTX_new(SSLv23_client_method());  // 以兼容方式产生一个 SSL_CTX
    if (ctx == NULL) {
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 设置SSL上下文验证模式和CA证书路径 */
    // SSL_VERIFY_PEER 要求对证书进行认证，没有证书也会放行
    // SSL_VERIFY_FAIL_IF_NO_PEER_CERT 要求客户端需要提供证书，但验证发现单独使用没有证书也会放行
    SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, NULL);
    if (SSL_CTX_load_verify_locations(ctx, argv[5], NULL) <= 0) {  // 设置信任根证书
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 加载服务器证书和私钥 */
    if (SSL_CTX_use_certificate_file(ctx, argv[3], SSL_FILETYPE_PEM) <= 0) {  // 加载证书
        ERR_print_errors_fp(stdout);
        exit(1);
    }
    /* 载入用户私钥 */
    if (SSL_CTX_use_PrivateKey_file(ctx, argv[4], SSL_FILETYPE_PEM) <= 0) {  // 加载私钥
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /* 验证私钥是否与证书匹配 */
    if (!SSL_CTX_check_private_key(ctx)) {
        ERR_print_errors_fp(stdout);
        exit(1);
    }

    /*******************第二步：普通socket建立连接*******************/

    /* 创建 socket */
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Socket");
        exit(errno);
    } else {
        printf("socket created success!\n");
    }

    /* 绑定 socket 到指定端口 */
    bzero(&dest, sizeof(dest));
    dest.sin_family = AF_INET;
    dest.sin_port = htons(atoi(argv[2]));
    if (inet_aton(argv[1], (struct in_addr*)&dest.sin_addr.s_addr) == 0) {
        perror(argv[1]);
        exit(errno);
    }
    printf("address created success!\n");

    /* 连接服务器 */
    if (connect(sockfd, (struct sockaddr*)&dest, sizeof(dest)) != 0) {
        perror("Connect ");
        exit(errno);
    } else {
        printf("server connected  success!\n");
    }

    /******第三步：将普通 socket 与 SSL 绑定，在 SSL 层建立连接******/

    /* 创建SSL对象，将其与新的连接关联 */
    ssl = SSL_new(ctx);       // 基于 ctx 产生一个新的 SSL
    SSL_set_fd(ssl, sockfd);  // 将连接用户的 socket 加入到 SSL

    /* SSL握手，建立加密通信 */
    if (SSL_connect(ssl) == -1) {
        ERR_print_errors_fp(stderr);
        printf("SSL 连接失败!\n");
        goto end;
    } else {
        printf("Connected with %s encryption\n", SSL_get_cipher(ssl));
        /****************第四步：验证server服务端的证书****************/

        /* 验证服务端的证书 */
        if (ShowCerts(ssl) == ERR)
            goto end;
    }

    /****************第五步：https进行收发数据****************/

    /* 通过SSL连接与服务端进行通信 */
    while (1) {
        
        /* SSL_write发消息给服务端 */
        printf("请输入要发送给服务器的内容：\n");
        scanf("%s", send_buffer);
        if (!strncmp(send_buffer, "+++", 3))
            break;  // 收到+++表示退出

        len = SSL_write(ssl, send_buffer, strlen(send_buffer));
        if (len < 0)
            printf("消息'%s'发送失败！错误代码是%d，错误信息是'%s'\n", send_buffer, errno, strerror(errno));
        else
            printf("消息'%s'发送成功，共发送了%d个字节！\n", send_buffer, len);
        memset(send_buffer, 0, sizeof(send_buffer));  // 清空接收缓存区

        /* SSL_read接收服务端的消息 */
        len = SSL_read(ssl, recv_buffer, MAXBUF);
        if (len > 0)
            printf("接收消息成功:'%s'，共%d个字节的数据\n", recv_buffer, len);
        else {
            printf("消息接收失败！错误代码是%d，错误信息是'%s'\n", errno, strerror(errno));
            break;
        }
        memset(recv_buffer, 0, sizeof(recv_buffer));  // 清空接收缓存区
    }

    /****************第六步：关闭连接及资源清理****************/
end:
    /* 关闭 SSL 连接和 socket，释放 SSL 上下文 */
    SSL_shutdown(ssl);  // 关闭 SSL 连接
    SSL_free(ssl);      // 释放 SSL
    close(sockfd);      // 关闭监听的 socket
    SSL_CTX_free(ctx);  // 释放 CTX
    return 0;
}
```

运行即可。

# 参考资料

- 《Computer Security: A Hands-on Approach》Chapter 18 & 19
- https://stackoverflow.com/questions/16235526/openssl-verify-error-20-at-0-depth-lookupunable-to-get-local-issuer-certifica
- https://blog.csdn.net/wu10188/article/details/124970453?spm=1001.2014.3001.5506
- https://www.cnblogs.com/lsdb/p/9391979.html
