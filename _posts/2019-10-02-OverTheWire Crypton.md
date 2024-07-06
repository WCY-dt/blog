---
layout: post
title:  "Crypton"
date:   2019-10-02 00:00:00 +0800
categories: 安全
tags: game
series: OverTheWire
series_index: 2
comments: true
mathjax: true
copyrights: 原创 未完待续
---

[https://overthewire.org/wargames/krypton/krypton0.html](https://overthewire.org/wargames/krypton/krypton0.html)

## Level 0–>Level 1

> Welcome to Krypton! The first level is easy. The following string encodes the password using Base64:
>
> ```plaintext
> S1JZUFRPTklTR1JFQVQ=
> ```
>
> Use this password to log in to krypton.labs.overthewire.org with username krypton1 using SSH on port 2231. You can find the files for other levels in /krypton/

一眼 Base64，直接解密：

```shell
$ echo S1JZUFRPTklTR1JFQVQ= | base64 -d
KRYPTONISGREAT
```

然后连接下一关：

```shell
ssh -p 2231 krypton1@krypton.labs.overthewire.org
```

## Level 1->Level 2

> The password for level 2 is in the file ‘krypton2’. It is ‘encrypted’ using a simple rotation. It is also in non-standard ciphertext format. When using alpha characters for cipher text it is normal to group the letters into 5 letter clusters, regardless of word boundaries. This helps obfuscate any patterns. This file has kept the plain text word boundaries and carried them to the cipher text. Enjoy!

先看看

```shell
krypton1@bandit:~$ cd /krypton
krypton1@bandit:/krypton$ ls
krypton1  krypton2  krypton3  krypton4  krypton5  krypton6
krypton1@bandit:/krypton$ cd krypton1
krypton1@bandit:/krypton/krypton1$ ls
krypton2  README
krypton1@bandit:/krypton/krypton1$ cat README
Welcome to Krypton!

This game is intended to give hands on experience with cryptography
and cryptanalysis.  The levels progress from classic ciphers, to modern,
easy to harder.

Although there are excellent public tools, like cryptool,to perform
the simple analysis, we strongly encourage you to try and do these
without them for now.  We will use them in later excercises.

** Please try these levels without cryptool first **


The first level is easy.  The password for level 2 is in the file
'krypton2'.  It is 'encrypted' using a simple rotation called ROT13.
It is also in non-standard ciphertext format.  When using alpha characters for
cipher text it is normal to group the letters into 5 letter clusters,
regardless of word boundaries.  This helps obfuscate any patterns.

This file has kept the plain text word boundaries and carried them to
the cipher text.

Enjoy!
krypton1@bandit:/krypton/krypton1$ cat krypton2
YRIRY GJB CNFFJBEQ EBGGRA
```

简单转一下

```shell
krypton1@bandit:/krypton/krypton1$ cat krypton2 | tr "[a-zA-Z]" "[n-za-mN-ZA-M]"
LEVEL TWO PASSWORD ROTTEN
```

## Level 2->Level 3

> ROT13 is a simple substitution cipher.
>
> Substitution ciphers are a simple replacement algorithm. In this example of a substitution cipher, we will explore a ‘monoalphebetic’ cipher. Monoalphebetic means, literally, “one alphabet” and you will see why.
>
> This level contains an old form of cipher called a ‘Caesar Cipher’. A Caesar cipher shifts the alphabet by a set number. For example:
>
> ```plaintext
> plain:  a b c d e f g h i j k ...
> cipher: G H I J K L M N O P Q ...
> ```
>
> In this example, the letter ‘a’ in plaintext is replaced by a ‘G’ in the ciphertext so, for example, the plaintext ‘bad’ becomes ‘HGJ’ in ciphertext.
>
> The password for level 3 is in the file krypton3. It is in 5 letter group ciphertext. It is encrypted with a Caesar Cipher. Without any further information, this cipher text may be difficult to break. You do not have direct access to the key, however you do have access to a program that will encrypt anything you wish to give it using the key. If you think logically, this is completely easy.
>
> One shot can solve it!
>
> Have fun.
>
> Additional Information:
>
> The `encrypt` binary will look for the keyfile in your current working directory. Therefore, it might be best to create a working direcory in /tmp and in there a link to the keyfile. As the `encrypt` binary runs setuid `krypton3`, you also need to give `krypton3` access to your working directory.
>
> Here is an example:
>
> ```shell
> $ mktemp -d
> /tmp/tmp.Wf2OnCpCDQ
> $ cd /tmp/tmp.Wf2OnCpCDQ
> $ ln -s /krypton/krypton2/keyfile.dat
> $ ls
> keyfile.dat
> $ chmod 777 .
> $ /krypton/krypton2/encrypt /etc/issue
> $ ls
> ciphertext  keyfile.dat
> ```

首先按照题目提示建立链接：

```shell
krypton2@bandit:~$ cd /krypton/krypton2
krypton2@bandit:/krypton/krypton2$ ls
encrypt  keyfile.dat  krypton3  README
krypton2@bandit:/krypton/krypton2$ mktemp -d
/tmp/tmp.BBw9y442so
krypton2@bandit:/krypton/krypton2$ cd /tmp/tmp.BBw9y442so
krypton2@bandit:/tmp/tmp.BBw9y442so$ ln -s /krypton/krypton2/keyfile.dat
krypton2@bandit:/tmp/tmp.BBw9y442so$ chmod 777 .
```

然后我们尝试每个字母对应的密文

```shell
krypton2@bandit:/tmp/tmp.BBw9y442so$ touch char
krypton2@bandit:/tmp/tmp.BBw9y442so$ echo "ABCDEFGHIJKLMNOPQRSTUVWXYZ" > char
krypton2@bandit:/tmp/tmp.BBw9y442so$ /krypton/krypton2/encrypt char
krypton2@bandit:/tmp/tmp.BBw9y442so$ cat ciphertext
MNOPQRSTUVWXYZABCDEFGHIJKL
krypton2@bandit:/tmp/tmp.BBw9y442so$ cat /krypton/krypton2/krypton3
OMQEMDUEQMEK
```

最后求解

```shell
krypton2@bandit:/tmp/tmp.BBw9y442so$ echo 'OMQEMDUEQMEK' | tr '[A-Z]' '[MNOPQRSTUVWXYZABCDEFGHIJKL]'
CAESARISEASY
```

## Level 3->Level 4

> Well done. You’ve moved past an easy substitution cipher.
>
> The main weakness of a simple substitution cipher is repeated use of a simple key. In the previous exercise you were able to introduce arbitrary plaintext to expose the key. In this example, the cipher mechanism is not available to you, the attacker.
>
> However, you have been lucky. You have intercepted more than one message. The password to the next level is found in the file ‘krypton4’. You have also found 3 other files. (found1, found2, found3)
>
> You know the following important details:
>
> - The message plaintexts are in American English (***very important***) - They were produced from the same key (***even better!***)
>
> Enjoy.

查看

```shell
krypton3@bandit:~$ cd /krypton/krypton3
krypton3@bandit:/krypton/krypton3$ ls
found1  found2  found3  HINT1  HINT2  krypton4  README
krypton3@bandit:/krypton/krypton3$ cat HINT1
Some letters are more prevalent in English than others.
krypton3@bandit:/krypton/krypton3$ cat HINT2
"Frequency Analysis" is your friend.
krypton3@bandit:/krypton/krypton3$ cat krypton4
KSVVW BGSJD SVSIS VXBMN YQUUK BNWCU ANMJS
```

词频分析，统计过程省略。完事之后直接替换

```shell
krypton3@bandit:/krypton/krypton3$ cat krypton4 | tr '[A-Z]' '[BOIHGKNQVTWYURXZAJEMSLDFPC]'
WELLD ONETH ELEVE LFOUR PASSW ORDIS BRUTE
```

WELL DONE THE LEVEL FOUR PASSWORD IS BRUTE

## Level 4->Level 5

> Good job!
>
> You more than likely used some form of FA and some common sense to solve that one.
>
> So far we have worked with simple substitution ciphers. They have also been ‘monoalphabetic’, meaning using a fixed key, and giving a one to one mapping of plaintext (P) to ciphertext (C). Another type of substitution cipher is referred to as ‘polyalphabetic’, where one character of P may map to many, or all, possible ciphertext characters.
>
> An example of a polyalphabetic cipher is called a Vigenère Cipher. It works like this:
>
> If we use the key(K) ‘GOLD’, and P = PROCEED MEETING AS AGREED, then “add” P to K, we get C. When adding, if we exceed 25, then we roll to 0 (modulo 26).
>
> ```plaintext
> P P R O C E E D M E E T I N G A S A G R E E D\
> K G O L D G O L D G O L D G O L D G O L D G O\
> ```
>
> becomes:
>
> ```plaintext
> P 15 17 14 2 4 4 3 12 4 4 19 8 13 6 0 18 0 6 17 4 4 3\
> K 6 14 11 3 6 14 11 3 6 14 11 3 6 14 11 3 6 14 11 3 6 14\
> C 21 5 25 5 10 18 14 15 10 18 4 11 19 20 11 21 6 20 2 8 10 17\
> ```
>
> So, we get a ciphertext of:
>
> ```plaintext
> VFZFK SOPKS ELTUL VGUCH KR
> ```
>
> This level is a Vigenère Cipher. You have intercepted two longer, english language messages (American English). You also have a key piece of information. You know the key length!
>
> For this exercise, the key length is 6. The password to level five is in the usual place, encrypted with the 6 letter key.
>
> Have fun!
