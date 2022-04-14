---
layout: post
title:  "【C++11】lambda"
date:   2021-04-05 00:00:00 +0800
categories: toturial
tags: C++
comments: 1
mathjax: true
copyrights: 原创
---

C++11/14/17 学习的第三篇：lambda 表达式。

lambda 表达式变化的实在是太厉害，本文以最常用的 C++11 为标准，涉及到 C++14/17 的地方会特殊注明。

# lambda 表达式

lambda 表达式是一种匿名函数。下面是一个完整的 lambda 表达式的形态：

```cpp
[捕获列表] (参数列表) 可变规则 -> 返回类型 { 函数体 }
```

- 参数列表和普通函数的参数列表一致。

  下面是一个例子：

  ```cpp
  auto f = [] (int a, int b){
      return a + b;
  };
  	
  auto c = f(1, 2); // c = 3
  ```

- 可变规则处通常会填入 `mutable`，将原来默认的常量 lambda 函数修改为非常量。在这种情况下，lambda 必须要有参数列表。

  下面是一个例子：

  ```cpp
  auto f = [] (int a) mutable {
      return ++a;
  };
  	
  auto b = f(1); // b = 2
  ```

- lambda 会自动推导返回类型，一般情况下不用加。但如果函数体内有多个 `return` 语句，lambda 自动推导的结果为 `void`，此时需要手动指定返回值类型。

  下面是一个例子：

  ```cpp
  auto f = [] (int a) -> bool {
      if (a >= 0) return true;
      else return false;
  };
  	
  auto b = f(1); // b = true
  ```
  
- 函数体和普通函数没有区别。它可以访问：
  - 参数
  - 本地声明的变量
  - 类的数据成员
  - 任何具有静态存储持续时间的变量
  - 封闭范围内捕获的变量
  
  关于捕获的变量，请参见下文。

# 捕获

捕获列表有如下几种形式：

- `[]` 表示什么也不捕获。

  下面是一个例子：

  ```cpp
  auto f = ([]{ 
      std::cout << "HelloWorld!" << std::endl; 
  });
  
  f(); // 输出 HelloWorld!
  ```

- `[a]` 表示按值传递捕获变量 `a`。

  下面是一个例子：

  ```cpp
  int a = 1;
  
  auto f = ([a]{ 
      return a; 
  });
  
  auto b = f(); // b = 1
  ```

- `[&a]` 表示引用传递捕获变量 `a`。

  下面是一个例子：

  ```cpp
  int a = 1;
  
  auto f = ([&a]{ 
      a = 2;
      return a;
  });
  
  auto b = f(); // b = 2
  ```

- `[=]` 表示按值传递捕获父作用域所有变量。

  下面是一个例子：

  ```cpp
  int a = 1;
  int b = 2;
  
  auto f = ([=]{ 
      return a + b; 
  });
  
  auto c = f(); // c = 3
  ```

- `[&]` 表示引用传递捕获父作用域所有变量及 `this` 指针。

  下面是一个例子：

  ```cpp
  int a = 1;
  int b = 2;
  
  auto f = ([&]{ 
      a = 3;
      b = 4;
      return a + b; 
  });
  
  auto c = f(); // c = 7
  ```

- `[this]` 表示按值传递捕获 `this` 指针。

  下面是一个例子：
  
  ```cpp
  class c
  {
      void a() { return 1; }
  public:
      void b() {
          auto f = [this]{ 
              return this->a(); 
          };
          return f();
      }
  };
  ```

lambda 表达式可以同时执行多种捕获：

- `[=,&a,&b]` 表示引用传递捕获 `a` 和 `b`，按值传递捕获剩余内容。

- `[&,a,b,this]` 表示按值传递捕获 `a`、`b` 和 `this`，引用传递捕获剩余内容。

需要注意的是，lambda 不允许重复传递，比如 `[=,a]` 重复传递了 `a`，就会产生编译错误。

