---
layout: post
title:  "【Java】写给C++程序员的Java入门"
date:   2021-09-23 00:00:00 +0800
categories: toturial
tags: java
comments: 1
mathjax: true
copyrights: 原创
recommend: true
---

Java 可以理解为 `C++--`，即比 C 多了不少东西，同时比 C++ 少了一些东西。

# 运行第一个 Java 程序

Java 和 C++ 的语法是非常相似的。因此你一定能大致看懂下面这个求阶乘的 Java 程序：

```java
public class Factorial {
    public static void main(String[] args) {
        if (args.length != 0) {
            int num = Integer.parseInt(args[0]);
            System.out.println(factorial(num));
        }
    }
    
    private static int factorial(int fact) {
        int result = fact;
        if (fact == 0) {
            return 1;
        }
        while (fact != 1) {
            result *= --fact;
        }
        return result;
    }
}
```

将以上代码保存为 `Factorial.java`。

> 注意：文件名一定要与程序中最外层的那个类名一致！

如果你有一个很好用的 ide（如 eclipse 和 IDEA），那么点击运行就好了。如果很不幸，你习惯于使用 vim 或者 vscode 这类文本工具编程，那你需要 SDK 的帮助。假设你已经成功下载并安装了 Java SDK。打开命令行，首先生成名为 `Factorial.class` 的可执行文件：

```shell
javac Factorial.java
```

和 C++ 相似，如果你上面的程序有错误，那么会在这一步产生报错。你需要改掉这些错误才能继续编译运行。

`javac` 是 java 编译器的指令，可以使用 `javac -help` 查看更多指令。

在编译成功后，运行并输入 5：

```shell
java Factorial 5
```

即可得到结果 120。在某些情况下，运行时会产生 runtime error，不过 Java 中的 RE 要比 C++ 更容易 debug，因为 Java 是在 JVM 中运行的，能够产生更加具体的报错。

# Java 简介

Java 和 C++ 最大的差别是什么？我们从以下几个方面来理解：

## 如何运行

- C++ 需要编译生成基于平台（如 Windows，Linux）的可执行文件。

  Java 同样需要编译，但编译生成的是 bytecode，一种二进制文件。这种文件只能在 JVM（Java Virtual Machine）上运行。JVM 在不同的平台上有所差别，而 bytecode 在不同的平台上是相同的。

## 类型差异

- C++ 的 `char` 只支持 8 位的 ASCII，而 Java 则是 16 位的 Unicode。例如

  ```java
  char letterV = '\u0056'; // 字母 V
  char digit0 = '\u0030'; // 数字 0
  ```

- Java 的整数类型（`long`,`int`,`short`,`byte`）全部有符号，不存在 unsigned 这种东西。

- Java 的 `boolean` 类型和 C++ 的 bool 相似，但它只接受 `true` 和 `false`，而不能赋值数字。例如

  ```java
  boolean on = true; // boolean on = 1;是错的
  boolean off = false; // boolean off = 0;是错的
  ```

- Java 的加号（`+`）可以连接字符串，非字符串会转换为字符串。例如

  ```java
  "To be, " + "or not to be." // "To be, or not to be."
  1 + "2" + 1 // "121"
  ```

  > Java 不允许重载符号。

- Java 的数组按照如下形式定义

  ```java
  int[] scores = new int[100];
  char[] grades = {'A', 'B', 'C'};
  int[][] array = { {1, 2}, {3, 4} };
  ```

  数组可以通过浅拷贝相互赋值。可以使用 `.length` 获取数组长度。

- Java 的 `String` 类型不可更改。基本应用如下所示

  ```java
  class StringTest {
      public static void main(String[] args) {
          String str1 = "Hi there";
          String str2 = new String("Hi there");
          System.out.println(str1 == str2);
          System.out.println(str1.equals(str2));
          System.out.println(str1.toUpperCase());
          System.out.println(str1.toLowerCase());
          System.out.println(str1.substring(1,4));
          System.out.println(str1.trim());
          System.out.println(str1.startsWith("Hi"));
          System.out.println(str1.endsWith("there"));
          System.out.println(str1.replace('i', 'o'));
      }
  }
  ```

## 其余差异

- C++ 中的函数在 Java 中一律称为方法（method）。

- Java 的 main 方法必须写成

  ```java
  public static void main(String[] args)
  ```

  其中，args 可以换成你想要的名字，public 和 static 可以互换位置。

- Java 没有指针，但它的引用与指针类似。Java 引用不能像 C++ 一样做加减运算。

- Java 没有全局变量。所有变量都是类的成员。但可以使用 `static` 实现全局变量的功能。

- Java 没有预处理器。

- Java 没有 typedef、union、struct、enum。

- Java 的方法调用可以写在定义前面。

- Java 有着完善的内存管理机制。

- Java 使用 `final` 表示 const。

# Java 类



# 参考资料

1. [https://www.seas.upenn.edu/~cis1xx/resources/JavaForCppProgrammers/j-javac-cpp-ltr.pdf](https://www.seas.upenn.edu/~cis1xx/resources/JavaForCppProgrammers/j-javac-cpp-ltr.pdf)
2. [http://niwatori.io/2019/11/18/java-for-cpp-programmers/](http://niwatori.io/2019/11/18/java-for-cpp-programmers/)

