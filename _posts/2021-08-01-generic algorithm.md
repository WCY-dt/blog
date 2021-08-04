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

与此同时，`find` 也可以查找普通数组：

```cpp
auto result = find(begin(arr), end(arr), val);
```

可以从上面的两个例子看出来，`find` 与容器类型无关。

然而，需要注意的是，泛型算法与运算操作有关。例如上面的 `find` 需要比较两个元素是否相等，如果某个容器里面的元素不能进行比较，那么它就不能使用 `find`。

<u>泛型算法永远不会执行容器的操作。</u>

# 定制操作

## 函数传递

上面的 `find` 传入的是一个值，也有算法可以传入一个函数。

通常，`sort` 的用法为：

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



# 标准库泛型算法

## 只读算法

上面的 `find` 就是只读的，另一个例子是用来求和的 `accumulate` 函数：

```cpp
auto sum = accumulate(vec.cbegin(), vec.end(), 0);
```

最后一个参数是和的初值，它也指定了返回值的类型。

因此，如果要对 string 做加法，可以用

```cpp
string sum = accumulate(vec.cbegin(), vec.end(), string(""));
```

而由于 `const char*`  上没有加法，所以下面的语句是错误的

```cpp
// 错误
string sum = accumulate(vec.cbegin(), vec.end(), "");
```

常用的只读算法还有 `equal`，判断两个容器是否相等：

```cpp
equal(roster1.cbegin(), roster1.cend(), roster2.cbegin())
```

这里的 roster1 和 roster2 可以是不同的类型，但第二个序列应当不比第一个短。

## 写容器元素算法

例如 `fill` ，用一个元素填充容器：

```cpp
fill(vec.cbegin(), vec.end() + vec.size()/2, 10)
```

上面的语句向前一半写入了 10。应当保证容器的范围比要写入的范围大。

再如 `copy` ，将一个容器拷贝进另一个容器：

```cpp
auto ret = copy(begin(a1), end(a1), a2);
```

以及 `replace`，将某个元素替换为别的元素：

```cpp
replace(vec.begin(), vec.end(), 0, 42);
```

或者 `replace_copy`，边拷贝边替换：

```cpp
replace_copy(ilst.cbegin(), ilst.cend(), back_insert(ivec), 0, 42);
```

## 重排容器元素算法

我们经常使用的排序函数 `sort` 就是泛型。

```cpp
sort(vec.begin(), vec.end())
```

去重的 `unique`：

```cpp
unique(vec.begin(), vec.end())
```

`unique` 返回的指针指向最后一个不重复的元素。

用来删除元素的 `erase` 也是经典的泛型：

```cpp
erase(unique(vec.begin(), vec.end()), vec.end())
```

上面的语句是把去重后空出来的地方给删除，防止发生错误。