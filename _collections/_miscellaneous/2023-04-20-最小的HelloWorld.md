---
layout: post
title:  "【奇技淫巧】最小的 Hello World"
date:   2023-04-20 00:00:00 +0800
categories: miscellaneous
tags: C
comments: 1
mathjax: true
copyrights: 原创
---

最近发现一个事情，我写的代码编译为 exe 后动辄 1MB 向上，而很多的小工具往往只有几 KB——甚至还带图形界面。如何优化编译后代码的大小？

# 基础优化

## 原始程序

我们直接写一段 Hello World 的 C 代码：

```c
#include <stdio.h>
int main()
{
    printf("Hello World!\n");
    return 0;
}
```

注意的是，我们需要的是可执行的 64 位 elf。直接写段 PHP 然后调用解释器肯定小得多，但这显然不是完整的可执行文件。

我们编译上面这段代码：

```shell
$ gcc -o hello_world hello_world.c
```

我们看一下大小：

```shell
$ wc -c hello_world
16048 hello_world
```

这个最最最简单的程序竟然高达 16048 字节！

## 编译优化

我们只打印一个字符串，显然不需要 `printf` 这么高级的东西。我们把 `printf` 改为 `puts`：

```c
#include <stdio.h>
int main()
{
    puts("Hello World!\n");
    return 0;
}
```

然后编译选项开启~~臭氧~~优化：

```shell
$ gcc -O3 -o hello_world hello_world.c
```

我们看一下大小：

```shell
$ wc -c hello_world
16048 hello_world
```

你猜怎么着？**编译器比我们聪明多了！**他不需要我们提醒，早就自动帮我们把 `printf` 优化成 `puts` 了！

## 去除符号表

最基本的想法就是去除掉程序里面的符号表。

我懒得写了，直接让 GPT 帮我们解释一下符号表是什么：

> A symbol table is a data structure used by a language translator such as a compiler or interpreter. It stores information about various entities such as variable names, function names, objects, classes, interfaces, etc. that appear in a program’s source code. The information stored in a symbol table is used by both the analysis and synthesis phases of a compiler.

我们查看一下程序的符号表：

```shell
$ nm hello_world
0000000000003dc8 d _DYNAMIC
0000000000003fb8 d _GLOBAL_OFFSET_TABLE_
0000000000002000 R _IO_stdin_used
                 w _ITM_deregisterTMCloneTable
                 w _ITM_registerTMCloneTable
000000000000215c r __FRAME_END__
0000000000002014 r __GNU_EH_FRAME_HDR
0000000000004010 D __TMC_END__
0000000000004010 B __bss_start
                 w __cxa_finalize@GLIBC_2.2.5
0000000000004000 D __data_start
0000000000001100 t __do_global_dtors_aux
0000000000003dc0 d __do_global_dtors_aux_fini_array_entry
0000000000004008 D __dso_handle
0000000000003db8 d __frame_dummy_init_array_entry
                 w __gmon_start__
0000000000003dc0 d __init_array_end
0000000000003db8 d __init_array_start
00000000000011e0 T __libc_csu_fini
0000000000001170 T __libc_csu_init
                 U __libc_start_main@GLIBC_2.2.5
0000000000004010 D _edata
0000000000004018 B _end
00000000000011e8 T _fini
0000000000001000 t _init
0000000000001060 T _start
0000000000004010 b completed.8060
0000000000004000 W data_start
0000000000001090 t deregister_tm_clones
0000000000001140 t frame_dummy
0000000000001149 T main
                 U puts@GLIBC_2.2.5
00000000000010c0 t register_tm_clones
```

我们需要的是可执行文件尽量小，所以符号表对我们来讲可有可无（逆向工程师缓缓打出一个问号）。我们有两种方法干掉符号表：

- 一种是使用 `strip`：

  ```shell
  $ strip hello_world
  ```

- 另一种是在编译的时候就直接去掉符号表：

  ```shell
  $ gcc -s -o hello_world hello_world.c
  ```

两种方法效果是一样的。现在文件的大小为：

```shell
$ wc -c hello_world
14472 hello_world
```

# 进阶优化

## 汇编语言

C 代码显然还是太重型了。一切优化的尽头是汇编，所以我们使用汇编重写程序：

```assembly
; hello_world.asm
  BITS 64                 ; change to 64-bit mode
  GLOBAL main
  SECTION .data
    hello db "Hello World!", 10 ; 10 is the ASCII code for newline
  SECTION .text
  main:
    ; write "Hello World!" to stdout
    mov eax, 1            ; system call for write
    mov edi, 1            ; file descriptor for stdout
    mov rsi, hello        ; pointer to string to write
    mov edx, 13           ; length of string to write
    syscall               ; invoke the system call
    ; exit with status code 0
    mov eax, 60      ; system call number for exit
    xor edi, edi     ; exit status code (0)
    syscall          ; invoke the system call
```

我们还顺手优化掉了原来庞大的标准库，改为系统调用。

我们编译程序：

```shell
$ nasm -f elf64 hello_world.asm
$ gcc -m64 -s -o hello_world hello_world.o
```

现在看看大小：

```shell
$ wc -c hello_world
14256 hello_world
```

很好，又小了一些。

## 去除 start files

你是否想过，为什么编译器能够自动认识我们的 `main` 函数，并且以此作为程序入口？

这是因为它会自动链接到 `crt` 库。我们的目标是不用这个库，定义自己的函数入口：

```assembly
; hello_world.asm
  BITS 64                 ; change to 64-bit mode
  GLOBAL nomainhere
  SECTION .data
    hello db "Hello World!", 10 ; 10 is the ASCII code for newline
  SECTION .text
  nomainhere:
    ; write "Hello World!" to stdout
    mov eax, 1            ; system call for write
    mov edi, 1            ; file descriptor for stdout
    mov rsi, hello        ; pointer to string to write
    mov edx, 13           ; length of string to write
    syscall               ; invoke the system call
    ; exit with status code 0
    mov eax, 231      ; system call number for _exit
    xor edi, edi     ; exit status code (0)
    syscall          ; invoke the system call
```

值得注意的是，我们这里退出程序的时候使用的是 `_exit` 而不是 `exit`。

编译时指定无 start files：

```shell
$ nasm -f elf64 hello_world.asm
$ gcc -m64 -nostartfiles -s -o hello_world hello_world.o
```

现在看看大小：

```shell
$ wc -c hello_world
13176 hello_world
```

很好，又小了一些。

## 手动设置链接

我们看看现在的可执行 elf 中有什么：

```shell
$ readelf -S -W ./hello_world
There are 12 section headers, starting at offset 0x3078:

Section Headers:
  [Nr] Name              Type            Address          Off    Size   ES Flg Lk Inf Al
  [ 0]                   NULL            0000000000000000 000000 000000 00      0   0  0
  [ 1] .interp           PROGBITS        0000000000000238 000238 00001c 00   A  0   0  1
  [ 2] .note.gnu.build-id NOTE            0000000000000254 000254 000024 00   A  0   0  4
  [ 3] .gnu.hash         GNU_HASH        0000000000000278 000278 00001c 00   A  4   0  8
  [ 4] .dynsym           DYNSYM          0000000000000298 000298 000018 18   A  5   1  8
  [ 5] .dynstr           STRTAB          00000000000002b0 0002b0 000001 00   A  0   0  1
  [ 6] .rela.dyn         RELA            00000000000002b8 0002b8 000018 18   A  4   0  8
  [ 7] .text             PROGBITS        0000000000001000 001000 000024 00  AX  0   0 16
  [ 8] .eh_frame         PROGBITS        0000000000002000 002000 000000 00   A  0   0  8
  [ 9] .dynamic          DYNAMIC         0000000000002ee0 002ee0 000120 10  WA  5   0  8
  [10] .data             PROGBITS        0000000000003000 003000 00000d 00  WA  0   0  4
  [11] .shstrtab         STRTAB          0000000000000000 00300d 000069 00      0   0  1
```

我们浪费了大量字节去初始化根本没有用到的东西，而我们需要的只有 `.text` 和 `.data`。

我们直接手动设置符号链接 `link.lds`：

```lds
ENTRY(nomainhere)
SECTIONS
{
  . = 0x8048000 + SIZEOF_HEADERS;
  tiny : { *(.text) *(.data) }
  /DISCARD/ : { *(*) }
}
```

然后链接：

```shell
$ nasm -f elf64 hello_world.asm
$ ld -T link.lds -o hello_world hello_world.o
$ strip hello_world
```

现在看看大小：

```shell
$ wc -c hello_world
440 hello_world
```

巨大的进步！

# 玄学优化

## 自定义 elf

我们之前都直接用 nasm 和 ld 生成的 elf。但众所周知，elf 为了其鲁棒性，有一堆不太需要的内容。我们直接自定义其格式：

```assembly
; hello_world.asm
  BITS 64
  org 0x400000

  ehdr:           ; Elf64_Ehdr
    db 0x7f, "ELF", 2, 1, 1, 0 ; e_ident
    times 8 db 0
    dw  2         ; e_type
    dw  0x3e      ; e_machine
    dd  1         ; e_version
    dq  _start    ; e_entry
    dq  phdr - $$ ; e_phoff
    dq  0         ; e_shoff
    dd  0         ; e_flags
    dw  ehdrsize  ; e_ehsize
    dw  phdrsize  ; e_phentsize
    dw  1         ; e_phnum
    dw  0         ; e_shentsize
    dw  0         ; e_shnum
    dw  0         ; e_shstrndx
  ehdrsize  equ  $ - ehdr

  phdr:           ; Elf64_Phdr
    dd  1         ; p_type
    dd  5         ; p_flags
    dq  0         ; p_offset
    dq  $$        ; p_vaddr
    dq  $$        ; p_paddr
    dq  filesize  ; p_filesz
    dq  filesize  ; p_memsz
    dq  0x1000    ; p_align
  phdrsize  equ  $ - phdr
  
  _start:
    ; write "Hello World!" to stdout
    mov eax, 1            ; system call for write
    mov edi, 1            ; file descriptor for stdout
    mov esi, hello        ; pointer to string to write
    mov edx, 13           ; length of string to write
    syscall               ; invoke the system call
    ; exit with status code 0
    mov eax, 231      ; system call number for _exit
    xor edi, edi     ; exit status code (0)
    syscall          ; invoke the system call

  hello: db "Hello World!", 10 ; 10 is the ASCII code for newline

  filesize  equ  $ - $$
```

注意，我们此处还将 `rsi` 改为更小的 `esi`。

直接生成 elf：

```shell
$ nasm -f bin hello_world.asm
```

现在看看大小：

```shell
$ wc -c hello_world
164 hello_world
```

更小了！

## 一点魔法

现在我们要施展魔法了。

elf 文件格式规定，除了文件头之外，别的部分可以出现在任何地方——甚至可以重叠！嘿嘿，那我们就可以把 `phdr` 往前移一移了：

```assembly
; hello_world.asm
  BITS 64
  org 0x400000

  ehdr:           ; Elf64_Ehdr
    db 0x7f, "ELF", 2, 1, 1, 0 ; e_ident
    times 8 db 0
    dw  2         ; e_type
    dw  0x3e      ; e_machine
    dd  1         ; e_version
    dq  _start    ; e_entry
    dq  phdr - $$ ; e_phoff
    dq  0         ; e_shoff
    dd  0         ; e_flags
    dw  ehdrsize  ; e_ehsize
    dw  phdrsize  ; e_phentsize
  phdr:           ; Elf64_Phdr
    dd  1         ; e_phnum      ; p_type
	              ; e_shentsize
    dd  5         ; e_shnum      ; p_flags
	              ; e_shstrndx
  ehdrsize  equ  $ - ehdr
    dq  0         ; p_offset
    dq  $$        ; p_vaddr
    dq  $$        ; p_paddr
    dq  filesize  ; p_filesz
    dq  filesize  ; p_memsz
    dq  0x1000    ; p_align
  phdrsize  equ  $ - phdr
  
  _start:
    ; write "Hello World!" to stdout
    mov eax, 1            ; system call for write
    mov edi, 1            ; file descriptor for stdout
    mov esi, hello        ; pointer to string to write
    mov edx, 13           ; length of string to write
    syscall               ; invoke the system call
    ; exit with status code 0
    mov eax, 231      ; system call number for _exit
    xor edi, edi     ; exit status code (0)
    syscall          ; invoke the system call

  hello: db "Hello World!", 10 ; 10 is the ASCII code for newline

  filesize  equ  $ - $$
```

你可能发现了一点问题：`e_shnum` 本应为 0，现在却被我们修改了，这不就错了吗？别急，看看 elf 的文档：

> e_shnum :
>
> This member holds the number of entries in the section header table. Thus the product of e_shentsize and e_shnum gives the section header table's size in bytes. If a file has no section header table, e_shnum holds the value zero.
>
> If the number of sections is greater than or equal to SHN_LORESERVE (0xff00), this member has the value zero and the actual number of section header table entries is contained in the sh_size field of the section header at index 0. (Otherwise, the sh_size member of the initial entry contains `0`.)

说得清清楚楚，随便改，没问题！事实上，不可以乱改的部分只有 `0x7f, "ELF"`、`e_type`、`e_machine`、`e_entry`、`e_phoff`、`e_phentsize`、`e_phnum`、`p_type`、`p_offset`、`p_vaddr`、`p_flags`。另外，`p_filesz` 和 `p_memsz` 也需要取到合理的值。

现在我们的程序大小为：

```shell
$ nasm -f bin hello_world.asm
$ wc -c hello_world
156 hello_world
```

又变小了一点点。

## 更多魔法

兜兜转转这么多，我们还忘了一件事情：那段实现功能的汇编代码也是可以优化的：

```assembly
; hello_world.asm
  BITS 64
  org 0x400000

  ehdr:           ; Elf64_Ehdr
    db 0x7f, "ELF", 2, 1, 1, 0 ; e_ident
    times 8 db 0
    dw  2         ; e_type
    dw  0x3e      ; e_machine
    dd  1         ; e_version
    dq  _start    ; e_entry
    dq  phdr - $$ ; e_phoff
    dq  0         ; e_shoff
    dd  0         ; e_flags
    dw  ehdrsize  ; e_ehsize
    dw  phdrsize  ; e_phentsize
  phdr:           ; Elf64_Phdr
    dd  1         ; e_phnum      ; p_type
	              ; e_shentsize
    dd  5         ; e_shnum      ; p_flags
	              ; e_shstrndx
  ehdrsize  equ  $ - ehdr
    dq  0         ; p_offset
    dq  $$        ; p_vaddr
    dq  $$        ; p_paddr
    dq  filesize  ; p_filesz
    dq  filesize  ; p_memsz
    dq  0x1000    ; p_align
  phdrsize  equ  $ - phdr
  
  _start:
    ; write "Hello World!" to stdout
	mov al, 1
    mov dl, 13
    mov esi, hello
    syscall
    mov al, 231
    syscall

  hello: db "Hello World!", 10 ; 10 is the ASCII code for newline

  filesize  equ  $ - $$
```

此时，文件大小变为：

```shell
$ nasm -f bin hello_world.asm
$ wc -c hello_world
140 hello_world
```

至此，我已经没有更多魔法可以施展了。

# 总结

本文参考了 http://www.muppetlabs.com/~breadbox/software/tiny/teensy.html 和 https://cjting.me/2020/12/10/tiny-x64-helloworld/。前者将一个什么也不干的 32 位 elf 优化到了 45 字节，后者将一个 64 位可以输出 “Hello World!” 的程序优化到了 170 字节，而我在此基础上进一步提升到了 140 字节。

由于我能力有限，64 位的程序只能优化到这里了；但对于 32 位的程序来讲，由于其 elf 文件的结构和长度，理论上还可以进一步压缩。但我懒得安装 32 位的 Linux 环境，所以到此为止。