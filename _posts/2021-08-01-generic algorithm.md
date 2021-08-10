---
layout: post
title:  "【C++】泛型"
date:   2021-08-01 00:00:00 +0800
categories: toturial
tags: C++ 泛型
comments: 1
mathjax: true
copyrights: 原创
---

本文主要介绍C++泛型。

# 什么是泛型算法

泛型二字，“范”是广泛，“型”在这里指的是容器类型。如果各种容器类型——不管是数组、vector、string、还是别的任何东西——都可以使用同一个算法，那么这个算法就是泛型算法。例如标准库中的 `find` 函数就采用了泛型算法。如果我们要在 vector 中查找一个元素，应当这么写：

```cpp
auto result = find(vec.cbegin(), vec.cend(), val);
```

这里，`find` 的前两个参数表示查找范围，最后一个表示要查找的内容。`find` 先访问第一个元素，比较该元素与查找的值，。如果相等，就返回位置，如果不等，就继续查找下一个位置。

`find` 还可以查找普通数组：

```cpp
auto result = find(begin(arr), end(arr), val);
```

可以从上面的两个例子看出来，`find` 与容器类型无关。

然而，需要注意的是，泛型算法与运算操作有关。例如上面的 `find` 需要比较两个元素是否相等，如果某个容器里面的元素不能进行比较，那么它就不能使用 `find`。

<u>泛型算法永远不会执行容器的操作。</u>

# 定制操作

## 函数传递

上面的 `find` 传入的是一个值，也有算法可以传入一个函数。

比如，通常，`sort` 的用法为：

```cpp
sort(vec.begin(), vec.end())
```

这里比较的时候用的是小于号。

如果我们要将字符串按照长短排序，则可以传入一个函数：

```cpp
bool cmp(const string &str1, const string &str2)
{
    return str1.size() < str2.size();
}
elimDups(vec); // 按字典序重排并去重
stable_sort(vec.begin(), vec.end(), cmp);
```

## lambda

lambda 被用来向算法传递可调用对象。其格式为

```cpp
[捕获列表](参数列表) -> 返回类型 { 函数体 }
```

参数列表和返回类型是可选的。对于返回类型，如果没有指定，那么在函数体内 return 有多个时，编译器会自动推导为 void，产生错误。最简单的 lambda 如下所示：

```cpp
auto foo = [] { return 0; }
```

我们可以像正常函数一样调用 lambda：

```cpp
cout << foo() << endl;
```

捕获列表用来捕获当前域内的局部非 static 变量。比如，我们写一个在一组 vector 中找出所有大小 >=sz 的：

```cpp
void bigger(vector<string> &words, vector<string>::size_type sz){
    auto wc = find_if(words.begin(), words.end(),
                      [sz](const string &a) { return a.size() >= sz; });
}
```

我们刚刚捕获的是一个简单的数值，但如果需要捕获一共指针或者迭代器，那么就需要引用捕获。引用捕获在需要捕获的对象前加 `&`。比如我们的函数捕获 ostream 并输出：

```cpp
void output(vector<string> &words, ostream &os = cout, char c = ' '){
   for_each(words.begin(), words.end(),
                      [&os, c](const string &s) { os << s << c });
}
```

我们也可以使用隐式捕获，编译器会自动推断列表。其中，`=` 表示值捕获，`&` 表示引用捕获。例如上面的程序可以改写为：

```cpp
void output(vector<string> &words, ostream &os = cout, char c = ' '){
   for_each(words.begin(), words.end(),
                      [&, =](const string &s) { os << s << c });
}
```

对于值捕获，如果需要修改该变量，需要加上 `mutable` 关键字：

```cpp
auto foo = [n]() mutable { return ++n; }
```

而对于引用捕获，只要不是 const 即可修改。

## 参数绑定

lambda 相比于函数的好处是，可以调用局部变量。而如果一定要使用函数，可以考虑参数绑定。`bind` 函数提供了这样的功能，其格式为：

```cpp
auto 新可调用对象 = bind(可调用对象, 参数列表)
```

比如我们有 check_size 函数：

```cpp
bool check_size(const string &s, string::size_type sz){
    return s.size() >= sz;
}
```

我们希望把它用在上面提到的 find_if 函数中，则可以：

```cpp
auto wc = find_if(words.begin(), words.end(),
                  bind(check_size, _1, sz));
```

上面我们用到了 `_1`，这是个占位符。它需要 using 声明：

```cpp
using std::placeholders::_1;
```

如果要用到多个，则可以直接：

```cpp
using namespace std::placeholders;
```

