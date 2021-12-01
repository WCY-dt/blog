---
layout: post
title:  "【二进制分析】anatomy of a binary"
date:   2021-11-22 00:00:00 +0800
categories: 安全
tags: binary 安全
comments: 1
mathjax: true
copyrights: 原创
---

本文将带你了解二进制文件格式和生命周期。你将会了解到编译、符号表、反汇编的相关知识。

二进制文件是一种只含有 0 和 1 的数值文件。计算机利用二进制文件进行计算任务，我们把这种文件称为 binary code（二进制代码）。每个程序都应当包含一个或多个二进制代码（即机器指令）和数据（变量、常量等）。为了在给定的系统上追踪这个程序，我们需要把这些二进制代码和数据放进同一个文件中，这个文件通常被称为 binary executable files（二进制可执行文件），或者简称 binaries。

## The C Compilation Process

binaries 通过编译产生。图中展示了编译 C 代码的步骤。

<img src="https://i.loli.net/2021/11/22/JlcyrbC4jHmPt3Y.png" alt="image-20211015144726111" style="zoom:50%;" />

这个过程包含了四个步骤：preprocessing、compilation、assembly 和 linking。

### preprocessing

这一步中，C 语言中的宏会进行替换。下面是一个例子：

```c
#include <stdio.h>
#define FORMAT_STRING "%s"
#define MESSAGE "Hello, world!\n"
int main(int argc, char *argv[]) {
    printf(FORMAT_STRING, MESSAGE);
    return 0;
}
```

然后让 gcc 输出预处理过后的程序：

```shell
$ gcc -E -P compilation_example.c
```

你会看到哗哗哗冒出来一大堆东西，这里截取部分：

```c
typedef long unsigned int size_t;
typedef unsigned char __u_char;
typedef unsigned short int __u_short;
typedef unsigned int __u_int;
typedef unsigned long int __u_long;

extern int sys_nerr;
extern const char *const sys_errlist[];
extern int fileno (FILE *__stream) __attribute__ ((__nothrow__ , __leaf__)) ;
extern int fileno_unlocked (FILE *__stream) __attribute__ ((__nothrow__ , __leaf__)) ;
extern FILE *popen (const char *__command, const char *__modes) ;
Anatomy of a Binary 13
extern int pclose (FILE *__stream);
extern char *ctermid (char *__s) __attribute__ ((__nothrow__ , __leaf__));
extern void flockfile (FILE *__stream) __attribute__ ((__nothrow__ , __leaf__));
extern int ftrylockfile (FILE *__stream) __attribute__ ((__nothrow__ , __leaf__)) ;
extern void funlockfile (FILE *__stream) __attribute__ ((__nothrow__ , __leaf__));

int main(int argc, char *argv[]) {
    printf("%s", "Hello, world!\n");
    return 0;
}
```

可以看到，两个宏定义被替换了；同时，加入了默认的类型定义和常量等。

### compilation

这一步会生成汇编语言。继续编译上面的程序：

```shell
$ gcc -S -masm=intel compilation_example.c
$ cat compilation_example.s
```

得到（可能不同的系统略有差别）

```assembly
	.file	"compilation_example.c"
	.intel_syntax noprefix
	.section	.rodata
.LC0:
	.string		"Hello, world!"
	.text
	.globl	main
	.type	main, @function
main:
.LFB0:
	.cfi_startproc
	push	rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	mov		rbp, rsp
	.cfi_def_cfa_register 6
	sub		rsp, 16
	mov		DWORD PTR [rbp-4], edi
	mov		QWORD PTR [rbp-16], rsi
	mov		edi, OFFSET FLAT:.LC0
	call	puts
	mov		eax, 0
	leave
	.cfi_def_cfa 7, 8
	ret
	.cfi_endproc
.LFE0:
	.size	main, .-main
	.ident	"GCC: (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0"
	.section .note.GNU-stack,"",@progbits
```

这段汇编很好理解——当然理解汇编不是这里的重点。不过这只是很简单的程序，后面复杂的汇编有你好看！

### assembly

这一步终于要生成机器语言了！assembly 的输入是一组汇编，输出则为一组 object files，或者称为 modules。每个源文件对应一个汇编文件，每个汇编文件又会产生一个 object file。

继续编译上面的程序：

```shell
$ gcc -c compilation_example.c
$ file compilation_example.o
compilation_example.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
```

注意到提示中的 `ELF 64-bit LSB relocatable`。这表明，生成的二进制文件是 64 位 elf 格式，同时以小端格式存储。relocatable 表明这个文件不必须放置在内存中的特定位置。这么做的目的是，我们每个源文件就对应一个 object file，我们需要在下一步把它们结合成可执行文件：这就必然需要在内存中移动。

当看到 relocatable 标志时，我们通常就可以断定：我们看到的是 object file 而不是可执行文件。

object file 将在本文后面具体分析。

### linking

正如上面所说，这一步会把刚刚生成的 object file 结合成一个可执行二进制文件。在现代操作系统中，通常还会伴随着 LTO（link-time optimization）。这一步通常由 linker 或者 link editor 执行。

object files 是 relocatable 的，它会有很多文件组成，同时还会调用自己、调用其它文件、引用库函数等。这些引用和互相调用的函数等还不知道它需要调用的函数在内存的哪个位置，因此会打上 relocation symbols 的标签。在 linking 过程中，我们把有这种标签的称为符号链接——动态链接和静态链接是 C 必会的内容，我认为不需要再在这儿复习一遍。

下面继续编译刚刚的程序：

```shell
$ gcc compilation_example.c
$ file a.out
a.out: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=efe23ea731bce9de65619cadd58b14ecd8c015c7, not stripped
$ ./a.out
Hello, world!
```

观察 `file a.out` 的输出。第一段 `ELF 64-bit LSB executable` 与上面的不同就是不再 relocable，而是 executable——这一点之前已经讲过。第二段中有 `dynamically linked`，表明它使用了一些没有合并在可执行文件中的东西——这也就是静态链接和动态链接的问题。最后一段 `/lib64/ld-linux-x86-64.so.2` 则是动态链接的目标。

你一定注意到输出中有个 `stripped`，这是什么意思呢？

## symbols and stripped binaries

高级语言的函数和变量都被赋予了有意义的名字。当编译程序时，编译器会产生 symbols 来记录变量与名字的对应关系。这通常被用来进行 linking 过程以及 debug。

能把内存位置和名称联系起来，这样的东西对于二进制分析是异常重要的。

### Viewing Symbolic Information

继续对之前的文件动手脚：

```shell
$ readelf --syms a.out
Symbol table '.dynsym' contains 4 entries:
  Num: Value Size Type Bind Vis Ndx Name
    0: 0000000000000000 0 NOTYPE LOCAL DEFAULT UND
    1: 0000000000000000 0 FUNC GLOBAL DEFAULT UND puts@GLIBC_2.2.5 (2)
    2: 0000000000000000 0 FUNC GLOBAL DEFAULT UND __libc_start_main@GLIBC_2.2.5 (2)
    3: 0000000000000000 0 NOTYPE WEAK DEFAULT UND __gmon_start__
Symbol table '.symtab' contains 67 entries:
  Num: Value Size Type Bind Vis Ndx Name
    ...
    56: 0000000000601030 0 OBJECT GLOBAL HIDDEN 25 __dso_handle
    57: 00000000004005d0 4 OBJECT GLOBAL DEFAULT 16 _IO_stdin_used
    58: 0000000000400550 101 FUNC GLOBAL DEFAULT 14 __libc_csu_init
    59: 0000000000601040 0 NOTYPE GLOBAL DEFAULT 26 _end
    60: 0000000000400430 42 FUNC GLOBAL DEFAULT 14 _start
    61: 0000000000601038 0 NOTYPE GLOBAL DEFAULT 26 __bss_start
    62: 0000000000400526 32 FUNC GLOBAL DEFAULT 14 main
    63: 0000000000000000 0 NOTYPE WEAK DEFAULT UND _Jv_RegisterClasses
    64: 0000000000601038 0 OBJECT GLOBAL HIDDEN 25 __TMC_END__
    65: 0000000000000000 0 NOTYPE WEAK DEFAULT UND _ITM_registerTMCloneTable
    66: 00000000004003c8 0 FUNC GLOBAL DEFAULT 11 _init
```

这里大部分内容我们暂时看不懂，但注意到第 62 条有个 main。这一行说明 main 函数存储在 `0x400526`，大小为 32B，类型为 FUNC。

上面的输出中有很多符号，而 linking 过程只需要最基本的符号，剩余的都是为 debug 用的。debug 用的符号通常会有源文件每一行对应的二进制文件位置、函数的参数、栈结构等。对于 ELF binaries 来说，它的符号是以 DWARF 格式生成的，而 PE 则是 PDB（Microsoft Portable Debugging）格式。DWARF 通常放在 binary 里面，而 PDB 则通常是一个单独的文件。

我们之前讲到，能把内存位置和名称联系起来，这样的东西对于二进制分析是异常重要的。然而，通常的程序——比如 gcc 默认生成的，都会减小文件大小，精简符号表，也就是我们之前提过的 stripped。

### Stripping a Binary

stripped 到底会精简到什么程度？我们继续折磨刚刚的文件：

```shell
$ strip --strip-all a.out
$ file a.out
a.out: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=d0e23ea731bce9de65619cadd58b14ecd8c015c7, stripped
$ readelf --syms a.out
Symbol table '.dynsym' contains 4 entries:
  Num: Value Size Type Bind Vis Ndx Name
    0: 0000000000000000 0 NOTYPE LOCAL DEFAULT UND
    1: 0000000000000000 0 FUNC GLOBAL DEFAULT UND puts@GLIBC_2.2.5 (2)
    2: 0000000000000000 0 FUNC GLOBAL DEFAULT UND __libc_start_main@GLIBC_2.2.5 (2)
    3: 0000000000000000 0 NOTYPE WEAK DEFAULT UND __gmon_start__
```

这下子，只剩了寥寥几个符号了。这几个符号是给动态链接用的，它们不能删除。而其他的符号——包括 main，可有可无，全被干掉了。

## Disassembling a Binary

接下来，我们会了解 object file 里面有什么；然后观察反汇编得到的文件比正常的文件多了什么，从而明白 linking 过程发生了什么。

### Looking Inside an Object File

对文件部分反汇编：

```shell
$ objdump -sj .rodata compilation_example.o
compilation_example.o:		file format elf64-x86-64
Contents of section .rodata:
 0000 48656c6c 6f2c2077 6f726c64 2100		Hello, world!.
$ objdump -M intel -d compilation_example.o
compilation_example.o:		file format elf64-x86-64
Disassembly of section .text:
0000000000000000 <main>:
   0: 55 				push rbp
   1: 48 89 e5 			mov rbp,rsp
   4: 48 83 ec 10 		sub rsp,0x10
   8: 89 7d fc 			mov DWORD PTR [rbp-0x4],edi
   b: 48 89 75 f0 		mov QWORD PTR [rbp-0x10],rsi
   f: bf 00 00 00 00 	mov edi,0x0
  14: e8 00 00 00 00 	call 19 <main+0x19>
  19: b8 00 00 00 00 	mov eax,0x0
  1e: c9 				leave
  1f: c3 				ret
```

上面调用了两次 objdump。第一次展示了 read-only data 部分，这部分存储了所有的常量，具体的格式会在之后的文章中讲。第二个反汇编了 Intel syntax 中的 object file。它只包含了 main 函数。

注意到 f 行的地址为 0，以及第 14 行地址为 19——它们似乎没什么意义！这是因为，在 linking 之前，并不知道基地址是多少，因此暂时产生了一个错误的值。我们来验证这一想法：

```shell
$ readelf --relocs compilation_example.o
Relocation section '.rela.text' at offset 0x210 contains 2 entries:
	Offset			Info			Type			Sym. Value	Sym. Name + Addend
000000000010	00050000000a	R_X86_64_32		0000000000000000	.rodata + 0
000000000015	000a00000002	R_X86_64_PC32	0000000000000000	puts - 4
...
```

第一行告诉 linker 字符串的相对位置，第二行则为 puts 的相对位置。

注意 offset，它的值是偏移量+1，这是因为 puts 在 objdump 输出的 0x14，而重定位符号指针指向了后一个位置，也就是 0x15。

### Examining a Complete Binary Executable

通过以上内容，我们已经了解到了 object file 里面有什么，现在我们把整个文件都反汇编：

```shell
$ objdump -M intel -d a.out
a.out: 	  file format elf64-x86-64
Disassembly of section .init:
00000000004003c8 <_init>:
  4003c8: 48 83 ec 08 			sub   rsp,0x8
  4003cc: 48 8b 05 25 0c 20 00 	mov   rax,QWORD PTR [rip+0x200c25]
  4003d3: 48 85 c0 				test  rax,rax
  4003d6: 74 05 				je    4003dd <_init+0x15>
  4003d8: e8 43 00 00 00 		call  400420 <__libc_start_main@plt+0x10>
  4003dd: 48 83 c4 08 			add   rsp,0x8
  4003e1: c3 ret
Disassembly of section .plt:
00000000004003f0 <puts@plt-0x10>:
  4003f0: ff 35 12 0c 20 00 	push  QWORD PTR [rip+0x200c12]
  4003f6: ff 25 14 0c 20 00 	jmp   QWORD PTR [rip+0x200c14]
  4003fc: 0f 1f 40 00 			nop   DWORD PTR [rax+0x0]
0000000000400400 <puts@plt>:
  400400: ff 25 12 0c 20 00 	jmp   QWORD PTR [rip+0x200c12]
  400406: 68 00 00 00 00 		push  0x0
  40040b: e9 e0 ff ff ff 		jmp   4003f0 <_init+0x28>
...
Disassembly of section .text:
0000000000400430 <_start>:
  400430: 31 ed 				xor   ebp,ebp
  400432: 49 89 d1 				mov   r9,rdx
  400435: 5e 					pop   rsi
  400436: 48 89 e2 				mov   rdx,rsp
  400439: 48 83 e4 f0 			and   rsp,0xfffffffffffffff0
  40043d: 50 					push  rax
  40043e: 54 					push  rsp
  40043f: 49 c7 c0 c0 05 40 00 	mov   r8,0x4005c0
  400446: 48 c7 c1 50 05 40 00 	mov   rcx,0x400550
  40044d: 48 c7 c7 26 05 40 00 	mov   rdi,0x400526
  400454: e8 b7 ff ff ff 		call  400410 <__libc_start_main@plt>
  400459: f4 					hlt
  40045a: 66 0f 1f 44 00 00 	nop   WORD PTR [rax+rax*1+0x0]
0000000000400460 <deregister_tm_clones>:
...
0000000000400526 <main>:
  400526: 55 					push  rbp
  400527: 48 89 e5 				mov   rbp,rsp
  40052a: 48 83 ec 10 			sub   rsp,0x10
  40052e: 89 7d fc mov 			DWORD PTR [rbp-0x4],edi
  400531: 48 89 75 f0 mov 		QWORD PTR [rbp-0x10],rsi
  400535: bf d4 05 40 00 		mov   edi,0x4005d4
  40053a: e8 c1 fe ff ff 		call  400400 <puts@plt>
  40053f: b8 00 00 00 00 		mov   eax,0x0
  400544: c9 					leave
  400545: c3 					ret
  400546: 66 2e 0f 1f 84 00 00 	nop   WORD PTR cs:[rax+rax*1+0x0]
  40054d: 00 00 00
0000000000400550 <__libc_csu_init>:
...
Disassembly of section .fini:
00000000004005c4 <_fini>:
  4005c4: 48 83 ec 08 			sub	  rsp,0x8
  4005c8: 48 83 c4 08 			add   rsp,0x8
  4005cc: c3					ret
```

可以看到，代码非常长，这里面不仅仅有原来 object file 里面的内容（.text 部分），还有诸如程序初始化、动态库函数调用等。同时，在前一节中瞎填的地址也填正确了。

尽管看起来内容很多，但其实这段代码是非常容易解读的。但如果我们进让它 stripped 呢？

```shell
$ objdump -M intel -d ./a.out.stripped
./a.out.stripped: 	file format elf64-x86-64
Disassembly of section .init:
00000000004003c8 <.init>:
  4003c8: 48 83 ec 08 			sub   rsp,0x8
  4003cc: 48 8b 05 25 0c 20 00 	mov   rax,QWORD PTR [rip+0x200c25]
  4003d3: 48 85 c0 				test  rax,rax
  4003d6: 74 05 				je    4003dd <puts@plt-0x23>
  4003d8: e8 43 00 00 00 		call  400420 <__libc_start_main@plt+0x10>
  4003dd: 48 83 c4 08 			add   rsp,0x8
  4003e1: c3 					ret
Disassembly of section .plt:
...
Disassembly of section .text:
0000000000400430 <.text>:
  400430: 31 ed 				xor   ebp,ebp
  400432: 49 89 d1 				mov   r9,rdx
  400435: 5e 					pop   rsi
  400436: 48 89 e2 				mov   rdx,rsp
  400439: 48 83 e4 f0 			and   rsp,0xfffffffffffffff0
  40043d: 50 					push  rax
  40043e: 54					push  rsp
  40043f: 49 c7 c0 c0 05 40 00 	mov   r8,0x4005c0
  400446: 48 c7 c1 50 05 40 00 	mov   rcx,0x400550
  40044d: 48 c7 c7 26 05 40 00 	mov   rdi,0x400526
  400454: e8 b7 ff ff ff 		call  400410 <__libc_start_main@plt>
  400459: f4 					hlt
  40045a: 66 0f 1f 44 00 00 	nop   WORD PTR [rax+rax*1+0x0]
  400460: b8 3f 10 60 00 		mov   eax,0x60103f
...
  400520: 5d 					pop   rbp
  400521: e9 7a ff ff ff 		jmp   4004a0 <__libc_start_main@plt+0x90>
  400526: 55 					push  rbp
  400527: 48 89 e5 				mov   rbp,rsp
  40052a: 48 83 ec 10 			sub   rsp,0x10
  40052e: 89 7d fc 				mov   DWORD PTR [rbp-0x4],edi
  400531: 48 89 75 f0 			mov   QWORD PTR [rbp-0x10],rsi
  400535: bf d4 05 40 00 		mov   edi,0x4005d4
  40053a: e8 c1 fe ff ff 		call  400400 <puts@plt>
  40053f: b8 00 00 00 00 		mov   eax,0x0
  400544: c9 					leave
  400545: c3 					ret
  400546: 66 2e 0f 1f 84 00 00	nop   WORD PTR cs:[rax+rax*1+0x0]
  40054d: 00 00 00
  400550: 41 57 				push  r15
  400552: 41 56 				push  r14
...
Disassembly of section .fini:
00000000004005c4 <.fini>:
  4005c4: 48 83 ec 08 			sub   rsp,0x8
  4005c8: 48 83 c4 08 			add   rsp,0x8
  4005cc: c3 					ret
```

之前有的东西还都在，不过被完全混在了一起！这下子完全没法阅读了！你看，即使这么简单的程序都是这样，更复杂的就不用说了。

## Loading and Executing a Binary

现在我们已经了解了如何产生 binary，以及 binary 里面长什么样。我们自然会想知道 binary 是怎么执行的。下图是 elf 格式文件加载进内存的典型结构。

<img src="https://i.loli.net/2021/11/22/mkUgx1AhMnl4vXE.png" alt="image-20211015184355636" style="zoom:50%;" />

如果要知道操作系统如何运行它，你应当区复习操作系统的知识。这里只提一下，程序通过解释器（interpreter）计算地址、执行指令等。在 linux 中，它是 ld-linux.so；在 windows 中，它是 ntdll.dll。

比如，我们可以查看 linux 中的这一部分：

```shell
$ readelf -p .interp a.out
String dump of section '.interp':
	[	0] /lib64/ld-linux-x86-64.so.2
```

通过以上内容，我们已经对 binary 文件有了最基本的认识。下一篇我们会介绍最常用的 binary 结构：ELF。