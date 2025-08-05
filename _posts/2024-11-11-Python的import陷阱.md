---
layout: post
title:  "Python的import陷阱"
date:   2024-11-11 17:00:00 +0800
categories: 编程
tags: python
summary: "本文介绍了 Python 中 import 语句的工作原理，包括绝对路径和相对路径导入、包范围陷阱和 __init__.py 陷阱。通过理解这些概念，可以避免在导入模块时遇到的问题。"
series: Python 指北
series_index: 2
comments: true
mathjax: true
copyrights: 原创
---

在 Python 中，当我们使用 `import` 语句导入模块时，Python 解释器会按照一定的规则查找模块：

1. 首先检查 `sys.modules` 中是否已经缓存了该模块；
2. 如果没有缓存，则检查 built-in 模块；
3. 如果 built-in 模块中没有，就按照 `sys.path` 中的路径查找模块：
    1. 首先寻找当前脚本所在的目录；
    2. 然后寻找系统默认的路径，比如 Python 的安装目录、Python 的库目录等。

## 绝对路径和相对路径

先考虑最简单的情况，在根目录下有两个文件 `moduleA.py` 和 `moduleB.py`。`moduleA.py` 中有如下代码：

```python
def foo():
    print('moduleA foo()')
```

`moduleB.py` 中有如下代码：

```python
from moduleA import foo

def bar():
    foo()

if __name__ == '__main__':
    bar()
```

直接运行 `python moduleB.py`，可以正常输出 `moduleA foo()`。

上面的代码也可以写成：

```python
import moduleA

def bar():
    moduleA.foo()

if __name__ == '__main__':
    bar()
```

这样也可以正常输出 `moduleA foo()`。

现在，我们将 `moduleA.py` 和 `moduleB.py` 都放到 `packageA/subpackageA` 目录下，目录结构如下：

```plaintext
packageA/
    subpackageA/
        moduleA.py
        moduleB.py
```

在根目录下运行 `python packageA/subpackageA/moduleB.py`，依然可以正常输出 `moduleA foo()`。

现在，我们在根目录下新建一个 `main.py` 文件，内容如下：

```python
from packageA.subpackageA.moduleB import bar

if __name__ == '__main__':
    bar()
```

在根目录下运行 `python main.py`，会报错：

```plaintext
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    from packageA.subpackageA.moduleB import bar
  File "/path/to/packageA/subpackageA/moduleB.py", line 1, in <module>
    from moduleA import foo
ModuleNotFoundError: No module named 'moduleA'
```

这是因为 Python 在查找模块时，只会在 `main.py` 所在的目录下查找，而不会在父目录、子目录中查找。

解决方法有两种：

1. 绝对路径导入：

    将 `moduleB.py` 中的导入语句改为：

    ```python
    from packageA.subpackageA.moduleA import foo
    ```

    这样就可以正常输出 `moduleA foo()`。

    当然，此时如果我们在根目录下运行 `python packageA/subpackageA/moduleB.py`，会报错：

    ```plaintext
    Traceback (most recent call last):
      File "packageA/subpackageA/moduleB.py", line 1, in <module>
        from packageA.subpackageA.moduleA import foo
    ModuleNotFoundError: No module named 'packageA'
    ```

    因为此时的 `sys.path` 中目录为 `packageA/subpackageA`，这个目录下并没有 `packageA`。

2. 相对路径导入：

    将 `moduleB.py` 中的导入语句改为：

    ```python
    from .moduleA import foo
    ```

    这样就可以正常输出 `moduleA foo()`。

    这里的 `.` 表示 `moduleB.py` 所在目录，即 `subpackageA` 目录。

相对路径和命令行类似，也可以使用 `..` 表示父目录。我们现在新建一个 `packageA/subpackageB/moduleC.py` 文件，内容如下：

```python
from ..subpackageA.moduleA import foo

def baz():
    foo()
```

此时文件夹结构如下：

```plaintext
main.py
packageA/
    subpackageA/
        moduleA.py
        moduleB.py
    subpackageB/
        moduleC.py
```

我们在 `main.py` 中导入 `moduleC.py`：

```python
from packageA.subpackageB.moduleC import baz

if __name__ == '__main__':
    baz()
```

在根目录下运行 `python main.py`，可以正常输出 `moduleA foo()`。

我们需要知道的是，Python 在执行 `import` 语句时，会将相对路径转换为绝对路径。因例如，我们在根目录下运行时，`moduleC.py` 中的导入语句会被转换为：

```python
from packageA.subpackageA.moduleA import foo
```

## 包范围陷阱

现在，我们在 `packageA` 目录下新建一个 `submain.py` 文件，内容如下：

```python
from subpackageB.moduleC import baz

if __name__ == '__main__':
    baz()
```

此时文件夹结构如下：

```plaintext
main.py
packageA/
    submain.py
    subpackageA/
        moduleA.py
        moduleB.py
    subpackageB/
        moduleC.py
```

运行 `python packageA/submain.py`，会报错：

```plaintext
Traceback (most recent call last):
  File "/path/to/packageA/submain.py", line 1, in <module>
    from subpackageB.moduleC import baz
  File "/path/to/packageA/subpackageB/moduleC.py", line 1, in <module>
    from ..subpackageA.moduleA import foo
ImportError: attempted relative import beyond top-level package
```

这是因为，相对路径只能在包内部使用，不能在包外部使用。这里在使用 `from subpackageB.moduleC import baz` 时，`subpackageB` 为顶级包，这使得 `moduleC.py` 无法访问到顶级包以外的 `subpackageA`。

不仅仅 `from ... import ...` 会报错，`import ... as ...` 也是一样的原理。

将 `moduleC.py` 中的导入语句改为绝对路径可以解决这个问题。

而之前在 `main.py` 中使用的是 `from packageA.subpackageB.moduleC import baz`，这里的 `packageA` 为顶级包，因此 `moduleC.py` 可以访问到顶级包下的子包 `subpackageA`。

这让我们理解了另一个问题。此时的 `moduleB.py` 为：

```python
    from .moduleA import foo

    def bar():
        foo()

    if __name__ == '__main__':
        bar()
```

假如我们直接在根目录下运行 `python packageA/subpackageA/moduleB.py`，会报错：

```plaintext
Traceback (most recent call last):
  File "packageA/subpackageA/moduleB.py", line 1, in <module>
    from .moduleA import foo
ImportError: attempted relative import with no known parent package
```

这是因为 `moduleB.py` 在这里作为单独的脚本文件运行，不属于任何包。因此，相对路径导入时无法找到顶级包，也就更无从找到顶级包下的子包或模块了。

## `__init__.py` 陷阱

最后，我们再来讨论一下 `__init__.py` 文件。在 Python 3.3 之后，`__init__.py` 文件不再是必须的。不管有没有 `__init__.py` 文件，一个文件夹都可以被当作包来导入。也就是说，你只要建立一个文件夹，那就是一个包；而任何 `.py` 文件都可以被当作模块来导入。

不过，`__init__.py` 文件还是有它的作用的。比如，当我们*第一次*导入一个包时，Python 会自动执行该包下的 `__init__.py` 文件。

例如，我们有如下文件夹结构：

```plaintext
main.py
packageA/
    __init__.py
```

`__init__.py` 文件中有如下代码：

```python
print('packageA __init__.py')
```

在 `main.py` 中导入 `packageA`：

```python
import packageA
```

运行 `python main.py`，会输出 `packageA __init__.py`。

但是，如果我们将 `main.py` 中的导入语句改为：

```python
import packageA
import packageA
import packageA
import packageA
```

运行 `python main.py`，依然只会输出一次 `packageA __init__.py`。这是由本文开头介绍的第一条规则决定的。
