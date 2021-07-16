---
layout: post
title:  "C++ Templates 读书笔记 <img src='https://img.shields.io/badge/-原创-019733?style=flat'> <img src='https://img.shields.io/badge/-未完待续-blue?style=flat'>"
date:   2021-05-09 00:00:00 +0800
categories: book
tags: 笔记
comments: 1
mathjax: true
---



<center><img src="http://www.tmplbook.com/coversmall.jpg" style="zoom: 67%;" /></center>



笔记基于本书，持续更新。

# 基础

## 函数模板

函数模板和重载有那么一点相似。先看一个例子：

```cpp
template<typename T>
T max (T a, T b)
{
	// 如果 b < a 则输出 a ，否则输出 b
	return b < a ? a : b;
}
```

观察以上代码，可以看到模板的格式为

```cpp
template< 逗号分隔的参数列表 >
```

其中，`typename` 可以用 `class` 替代，但并不推荐这样做。同时注意，`void` 可以作为参数，而`struct` 不能作为参数。

从 C++17 开始，模板类型不一定要求可复制。

函数模板在编译时，不是编译为一个整体，而是在用到模板的地方编译为不同的代码。这一点非常重要。

### 模板声明推导

如果在上面的例子中，传入函数的 `a` 和 `b` 类型不同，例如 `a` 是 `int`，`b` 是 `double`，通常有下面三种处理方法：

1. 对参数进行类型转换

  ```cpp
  max(static_cast<double>(4), 7.2);
  ```

2. 为 `T` 指定类型，而不是让编译器进行类型推导

  ```cpp
  max<double>(4, 7.2);
  ```

3. 把 `T` 改为 `T1`，`T2`，分别对应不同的类型，请看下面的介绍

### 多模板参数

对于前面讲的第三种方法，我们可以这么写

```cpp
template<typename T1, typename T2, typename RT>
RT max (T1 a, T2 b);
::max<double>(4, 7.2) // RT 类型需要被推导
```

从 C++14  开始，可以使用 `auto` 进行推导

```cpp
template<typename T1, typename T2>
auto max (T1 a, T2 b)
```

在 C++11 中，也可以这样

```cpp
template<typename T1, typename T2>
auto max (T1 a, T2 b) -> decltype(true?a:b)
```

如果返回值是引用类型，则应写成

```cpp
#include <type_traits>
template<typename T1, typename T2>
auto max (T1 a, T2 b) -> typename std::decay<decltype(true?a:b)>::type
```

当然，更加通用的形式是

```cpp
template<typename T1, typename T2>
std::common_type_t<T1,T2> max (T1 a, T2 b)//从 T1 和 T2 中选择
```

### 默认模板声明

有时候我们希望在不直接声明返回值类型的情况下，给返回值类型赋一个初始值，可以使用如下方法：

```cpp
template<typename T1, typename T2, typename RT = std::common_type_t<T1,T2>>
RT max (T1 a, T2 b)
```

或者也可以

```cpp
template<typename RT = long, typename T1, typename T2>
RT max (T1 a, T2 b)
max(i, l); // returns long
max<int>(4, 42); // returns int as explicitly requested
```

### 注意事项

在使用模板函数时，我们通常推荐

- 按值传递而不是按引用传递
- 不使用 `inline`
- 不使用 `constexpr`

## 类模板

先看一个例子

```cpp
#include <vector>
#include <cassert>

template<typename T>
class Stack {
private:
    std::vector<T> elems; // 元素

public:
	void push(T const& elem); // push
	void pop(); // pop
	T const& top() const; // 返回栈顶元素
	bool empty() const { // 栈判空
		return elems.empty();
	}
};

template<typename T>
void Stack<T>::push (T const& elem)
{
	elems.push_back(elem);
}

template<typename T>
void Stack<T>::pop ()
{
	assert(!elems.empty());
	elems.pop_back();
}

template<typename T>
T const& Stack<T>::top () const
{
	assert(!elems.empty());
	return elems.back();
}
```

### 类模板声明

类模板应当这样声明：

```cpp
template<typename T>
class 类名称 {
	...
};
```

同样的，`typename` 可以替换为 `class`

在类的外部定义成员函数时，应当加上 `<T>`，例如

```cpp
template<typename T>
bool operator== (Stack<T> const& lhs, Stack<T> const& rhs);
```

但在类的内部可以不加

```cpp
Stack (Stack const&);
Stack& operator= (Stack const&);
```

通常，推荐不加。

### 模板类使用

上面的模板类可以作如下使用

```cpp
#include "stack1.hpp"
#include <iostream>
#include <string>

int main()
{
	Stack<int> 		   intStack; // int 栈
	Stack<std::string> stringStack; // string 栈
	
    // 操作 int 栈
	intStack.push(7);
	std::cout << intStack.top() << '\n';

    // 操作 string 栈
	stringStack.push("hello");
	std::cout << stringStack.top() << '\n';
	stringStack.pop();
}
```

只有当成员函数被调用时，该函数才会被实例化。