---
layout: post
title:  "内存对齐的利用"
date:   2021-11-29 00:00:00 +0800
categories: toturial
tags: C 内存
comments: 1
mathjax: true
copyrights: 转载
recommend: true
---

我们有如下代码

```c
#include <stdio.h>
#include <stdlib.h>
struct{
    int a;
    char b;
    int c;
} t = {10, 'C', 20 };
int main()
{
    printf("length: %d\n", sizeof(t));
    printf("&a: %X\n&b: %X\n&c: %X\n", &t.a, &t.b, &t.c);
}
```

请回答编译运行后的结果是什么？

我们知道，1 个 `int` 占 4 个字节，1 个 `char` 占 1 个字节，这个结构体有 2 个 int 和 1 个 char，所以它应该占用 4 + 1 + 4 = 9 个字节。

果真如此吗？

真正的答案是这样的：

```
length: 12
&a: 403010
&b: 403014
&c: 403018
```

这个结构体占用了 12 个字节！

这是由于内存对齐。虽然成员 b 这个 char 类型的变量只占用1个字节，但它后面的 3 个字节作为内存填充浪费掉了。请看下图：

<img src="https://i.loli.net/2021/11/30/3TP2bpNOU9r4aI6.png" alt="image-20211129150644854" style="zoom:67%;" />

编译器之所以要内存对齐，是为了更加高效的存取成员 c，而代价就是浪费了 b 后面的 3 个字节的空间。

# 内存对齐

CPU 通过地址总线来访问内存，一次能处理几个字节的数据，地址总线就会读取几个字节的数据。32 位的 CPU 一次可以处理4个字节的数据，那么每次就从内存读取4个字节的数据。

以 32 位的CPU为例，实际寻址的步长为4个字节，也就是只对编号为 4 的倍数的内存寻址，例如 0、4、8、12、1000 等，而不会对编号为 1、3、11、1001 的内存寻址。如下图所示：

<img src="https://i.loli.net/2021/11/30/O1KS4AyN3cnbxsa.png" style="zoom:67%;" />

对于程序来说，一个变量最好位于一个寻址步长的范围内，这样一次就可以读取到变量的值；如果跨步长存储，就需要读取两次，然后再拼接数据，效率显然降低了。

将一个数据尽量放在一个步长之内，避免跨步长存储，这称为内存对齐。

除了结构体，全局变量也会进行内存对齐，请看下面的代码：

```c
#include <stdio.h>
#include <stdlib.h>
int m;
char c;
int n;
int main()
{
    printf("&m: %X\n&c: %X\n&n: %X\n", &m, &c, &n);
}
```

编译并运行：

```
&m: 407978
&c: 407974
&n: 407970
```

可见它们的地址都是4的整数倍，并相互挨着。

在编译器正常的模式下，只有全局变量才会对齐，而局部变量由于存储在栈上，通常不会去对齐。

# 减少内存使用

知道了内存对齐后，我们可以使用一些方法来减小内存使用。比如下面的程序：

```c
#include <stdio.h>
#include <stdlib.h>
struct{
    int a;
    char b;
    int c;
    char d;
} t1 = {10, 'C', 20, 'D'};
struct{
    int a;
    int c;
    char b;
    char d;
} t2 = {10, 20, 'C', 'D'};
int main(){
    printf("length1: %d\n", sizeof(t1));
    printf("&a1: %X\n&b1: %X\n&c1: %X\n&d1: %X\n", &t1.a, &t1.b, &t1.c, &t1.d);
    printf("length1: %d\n", sizeof(t2));
    printf("&a2: %X\n&c2: %X\n&b2: %X\n&d2: %X\n", &t2.a, &t2.c, &t2.b, &t2.d);
}
```

运行后结果为

```
length1: 16
&a1: 403010
&b1: 403014
&c1: 403018
&d1: 40301C
length1: 12
&a2: 403020
&c2: 403024
&b2: 403028
&d2: 403029
```

下面的结构体由于充分利用了内存，其大小减小了四分之一！

<img src="https://i.loli.net/2021/11/30/kAaiQUuBvcKo87N.png" alt="image-20211129151357085" style="zoom:67%;" />
