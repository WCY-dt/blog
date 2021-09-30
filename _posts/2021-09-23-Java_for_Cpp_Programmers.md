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

Java 可以理解为 `C++--`，即以 C 为基础的扩展，但又比 C++ 少了一些东西。

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

## 继承和抽象

Java 只支持单继承。继承的关键字为 `extends`。可以使用 `super` 指向自己的超类（父类）。如果重写了超类的某个方法，通常加上注释 `Override`。这个注释是给编译器参考的，对程序本身没有影响。下面是一个具体的例子。

```java
class Account {
    protected double balance;
    public Account(double balance) { // 构造函数
        this.balance = balance;
    }
    public void withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
        }
    }
}

public class CheckingAccount extends Account {
    public CheckingAccount(double balance) {
        super(balance); // 使用超类的构造函数
    }
    @Override	// 注释
    public void withdraw(double amount) {
        balance -= amount;
    }
}
```

抽象关键字为 `abstract`，用法与 C++ 基本相同。

`interface` 是 `public abstract` 的方法。它的作用是实现多继承的效果。如果一个类被定义为 interface，那么别的类可以使用 `implements` 关键字继承这个类。例如

```java
public interface depart { // 接口1
    public abstract void depart();
}

public interface arrive { // 接口2
    public abstract void arrive();
}

public class plane implements depart,arrive {
    @Override
    public void depart() {
        System.out.println("起飞");
    }
    @Override
    public void arrive() {
        System.out.println("降落");
    }
}
```

## 匿名类

如果一个类需要同时定义与实现，并且只使用一次，则可以用匿名类。

```java
interface HelloWorld {
    public void greet();
}

public static void sayHello() { 
    // 非匿名类
    class EnglishGreeting implements HelloWorld {
        public void greet() {
            System.out.println("Hello world!");
        }
    }
    HelloWorld englishGreeting = new EnglishGreeting();
    englishGreeting.greet();
    // 匿名类
    HelloWorld spanishGreeting = new HelloWorld() {
        public void greet() {
            System.out.println("Hola, mundo!");
        }
    };
    spanishGreeting.greet();
} 
```

# 输入输出

读入可以直接使用 argv 读入，也可以从命令行读入。

```java
Console c = System.console();
String login = c.readLine("Enter your login: ");
```

输出只能是字符串。非字符串会自动使用 `tostring()` 方法转换成字符串。输出有两个方法，`print()` 为普通输出，`println()` 输出后会加一个换行。

```java
public class Root {
    public static void main(String[] args) {
        i = 5;
        r = Math.sqrt(i);
        System.out.println("The square root of " + i + " is " + r + ".");
        // output: The square root of 5 is 2.23606797749979.
    }
}
```

当然这种输出更接近 python。还有一种格式化的输出，更加类似于 C++

```java
public class Root {
    public static void main(String[] args) {
        int i = 5;
        double r = Math.sqrt(i);
        System.out.format("The square root of %d is %f.%n", i, r);
    }
}
```

# Collections

Collections 类似于 C++ 的 STL，使用前需要

```java
import java.util.*
```

下面是一个使用实例

```java
public class FindDups {
    public static void main(String[] args) {
        Set<String> s = new HashSet<String>();
        for (String a : args) {
            s.add(a);
        }
        System.out.println(s.size() + " distinct words: " + s);
    }
}
```

上面的 Set 和 HashSet 有类似于继承的关系。常用的有：

- `Set<T>` ：`HashSet`，`TreeSet`，`LinkedHashSet`
  - 常用方法：`size`，`isEmpty`，`add`，`remove`，`contains`，`addAll`，`removeAll`
- `List<T>` ：`LinkedList`，`ArrayList`
  - 常用方法：`size`，`isEmpty`，`add`，`remove`，`get`，`set`
- `Map<K, V>`：`HashMap`，`TreeMap`，`LinkedHashMap`
  - 常用方法：`size`，`isEmpty`，`put`，`putIfAbsent`，`get`，`getOrDefault`，`remove(K)`，`remove(K, V)`，`replace(K, newV)`，`replace(K, oldV, newV)`
- `Queue<T>`：`PriorityQueue`
  - 常用方法：`size`，`add`，`peek`，`poll`

在传参时，我们只知道使用了 `Set` 或者 `List` 等，却不知道这些数据结构里的数据是什么类型。因此我们需要使用 wildcards，即一个问号。通常有如下三种用法：

```java
public void method(List<?> list); // 用于同时取出和放入元素
public void method(List<? extends Number> list) // 用于取出元素
public void method(List<? super Number> list) // 用于放入元素
```

# 参考资料

1. [https://docs.oracle.com/en/java/javase/17/docs/api/index.html](https://docs.oracle.com/en/java/javase/17/docs/api/index.html)
2. [https://www.seas.upenn.edu/~cis1xx/resources/JavaForCppProgrammers/j-javac-cpp-ltr.pdf](https://www.seas.upenn.edu/~cis1xx/resources/JavaForCppProgrammers/j-javac-cpp-ltr.pdf)
3. [https://docs.oracle.com/javase/tutorial/collections/](https://docs.oracle.com/javase/tutorial/collections/)
4. [http://niwatori.io/2019/11/18/java-for-cpp-programmers/](http://niwatori.io/2019/11/18/java-for-cpp-programmers/)

