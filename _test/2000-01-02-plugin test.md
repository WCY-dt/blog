---
layout:     post
title:      "Plugin Test"
date:       2000-01-02 00:00:00 +0800
categories: frontend
tags:       vue react angular svelte
summary:    "This article introduces the plugins provided by the Tangerine theme, including code enhancement, table enhancement, GitHub integration, image captions, image grids, iframes, and result display."
series:     test
series_index: 2
---

## `code_enhance` Plugin

Code blocks support copy and fullscreen functionality

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("First 10 terms of Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
```

## `table_enhance` Plugin

Tables support fullscreen functionality

| Language | Type | Difficulty | Popularity |
|----------|------|------------|------------|
| Python | Interpreted | Easy | ⭐⭐⭐⭐⭐ |
| JavaScript | Interpreted | Medium | ⭐⭐⭐⭐⭐ |
| Java | Compiled | Medium | ⭐⭐⭐⭐ |
| C++ | Compiled | Hard | ⭐⭐⭐ |
| Go | Compiled | Medium | ⭐⭐⭐ |
| Rust | Compiled | Hard | ⭐⭐ |

## `cite` Plugin

```liquid
{% raw %}{% cite url title="Title" favicon="favicon_url" %}{% endraw %}
Citation content
{% raw %}{% endcite %}{% endraw %}
```

### Available Parameters

- `url`: The URL of the cited source (required)
- `title="Title"`: The title to display for the citation (optional, defaults to the webpage title)
- `favicon="favicon_url"`: The URL of the favicon to display (optional, defaults to the favicon of the cited webpage)

### Usage Example

{% cite https://en.wikipedia.org/wiki/Coat_Corporation title="Wikipedia" favicon="https://en.wikipedia.org/static/favicon/wikipedia.ico" %}
The central figure of Inmu videos is ***Yaju Senpai (Japanese: 野獣先輩 "beast senpai")***, an actor appearing in the original porn, who is parodied the most. His true name is never revealed and an attempt to identify him in 2016 was cancelled due to moral concerns.
{% endcite %}

## `github_link` Plugin

```liquid
{% raw %}{% github_link url %}{% endraw %} // Generate a link with repository or user name as text
{% raw %}{% github_link url name="Custom Name" %}{% endraw %} // Generate a link with custom name as text
```

### User Link Examples

Linus Torvalds {% github_link https://github.com/torvalds %} is the creator of the Linux kernel.

Microsoft {% github_link https://github.com/microsoft %} is a well-known technology company.

### Repository Link Examples

The most popular code editor: {% github_link https://github.com/microsoft/vscode %}

Excellent frontend framework: {% github_link https://github.com/facebook/react %}

Modern build tool: {% github_link https://github.com/vitejs/vite %}

### Custom Name Examples

This is my personal project: {% github_link https://github.com/wcy-dt/blog name="My Blog" %}

Recommended learning resource: {% github_link https://github.com/github/docs name="GitHub Official Documentation" %}

## `github_code_btn` Plugin

```liquid
{% raw %}{% github_code_btn url %}{% endraw %} // Basic usage, display complete file content
{% raw %}{% github_code_btn url lines="L10-L20" %}{% endraw %} // Display specified line range
{% raw %}{% github_code_btn url path="relative/path" %}{% endraw %} // Display specified file content
{% raw %}{% github_code_btn url path="relative/path" lines="L10-L20" %}{% endraw %} // Display specified line range of specified file
```

### Basic Code Button Examples

{% github_code_btn https://github.com/microsoft/vscode/blob/main/src/main.js %}

{% github_code_btn https://github.com/microsoft/vscode/blob/main/src/common/map.ts#L20 %}

{% github_code_btn https://github.com/torvalds/linux/blob/master/kernel/sched/core.c#L1000-L1050 %}

### Custom Parameter Examples

{% github_code_btn https://github.com/facebook/react/blob/main/packages/react/src/React.js path="React.js" lines="L1-L30" %}

{% github_code_btn https://github.com/nodejs/node/blob/main/lib/fs.js path="lib/fs.js" %}

## `github_issue` Plugin

```liquid
{% raw %}{% github_issue url %}{% endraw %} // Basic usage, display complete issue content
{% raw %}{% github_issue url username="Custom Username" %}{% endraw %} // Display issue content with specified username
```

### Basic Issue Examples

{% github_issue https://github.com/microsoft/vscode/issues/12345 username="vscode-user" %}
This feature request proposes an interesting idea: Can we display Git commit information directly in the editor? I believe this would greatly help developers' workflows.

The current implementation requires switching to terminal or using Git extensions, but if we could see recent commit information directly next to the code, it would make code reviews much more efficient.
{% endgithub_issue %}

## `image_caption` Plugin

```liquid
{% raw %}{% image_caption image_url %}{% endraw %} // Without caption
{% raw %}{% image_caption image_url | caption %}{% endraw %} // With caption
{% raw %}{% image_caption image_url | caption | class %}{% endraw %} // With caption and custom style class
```

### Basic Syntax

{% image_caption https://placehold.co/400x300 %}

{% image_caption https://placehold.co/400x300 | This is default style (center aligned) %}

{% image_caption https://placehold.co/400x300 | This is left aligned | image-caption--left %}

{% image_caption https://placehold.co/400x300 | This is right aligned | image-caption--right %}

{% image_caption https://placehold.co/400x300 | This is full width | image-caption--full %}

### Available CSS Classes

- `image-caption`: Default style (center aligned)
- `image-caption--left`: Left aligned
- `image-caption--right`: Right aligned
- `image-caption--full`: Full width display

## `image_grid` Plugin

```liquid
{% raw %}{% image_grid rows=2 cols=3 %}{% endraw %}
{% raw %}image_url_1 | caption_1{% endraw %}
{% raw %}image_url_2 | caption_2{% endraw %}
{% raw %}image_url_3{% endraw %}
{% raw %}{% endimage_grid %}{% endraw %}
```

### Available Parameters

- `rows`: Number of rows (optional, for documentation purposes)
- `cols`: Number of columns (required, default is 1)
- `class`: Custom CSS class (optional)

### Usage Examples

#### 2x2 Grid

{% image_grid cols=2 %}
https://placehold.co/400x300/e74c3c/ffffff | Red image example
https://placehold.co/400x300/3498db/ffffff | Blue image example
https://placehold.co/400x300/2ecc71/ffffff | Green image example
https://placehold.co/400x300/f39c12/ffffff | Orange image example
{% endimage_grid %}

#### 3-Column Grid (No Caption)

{% image_grid cols=3 %}
https://placehold.co/400x200/9b59b6/ffffff
https://placehold.co/300x200/1abc9c/ffffff
https://placehold.co/200x200/34495e/ffffff
https://placehold.co/400x200/e67e22/ffffff
https://placehold.co/300x200/16a085/ffffff
https://placehold.co/200x200/c0392b/ffffff
{% endimage_grid %}

#### Mixed Usage (Partial Captions)

{% image_grid cols=2 %}
https://placehold.co/400x300/2c3e50/ffffff | Image with description
https://placehold.co/400x300/8e44ad/ffffff
https://placehold.co/400x300/27ae60/ffffff
https://placehold.co/400x300/d35400/ffffff | Another image with description
{% endimage_grid %}

## `iframe` Plugin

```liquid
{% raw %}{% iframe iframe_name %}{% endraw %}
{% raw %}{% iframe iframe_name height=500px %}{% endraw %}
{% raw %}{% iframe iframe_name hide_header=true %}{% endraw %}
{% raw %}{% iframe iframe_name is_embedded=true %}{% endraw %}
```

The plugin automatically reads HTML files from the `assets/post/iframes/iframe_name/` directory and displays them as iframes.

### Available Parameters

- `height`: Custom iframe height (default auto)
- `hide_header`: Hide header title bar (default false)
- `is_embedded`: Embedded mode without border and shadow (default false)

### Usage Examples

#### Default Style (Show Header)

{% iframe test %}

#### Custom Height

{% iframe test height=400px %}

#### Hide Header

{% iframe test hide_header=true %}

#### Embedded Mode

{% iframe test is_embedded=true %}

## `result` Plugin

```liquid
{% raw %}{% result title="Page Title" %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML Code -->
{% raw %}‌﻿‌‍```{% endraw %}

{% raw %}```css{% endraw %}
/* CSS Code */
{% raw %}‌‌‌‌‌﻿‌‍```{% endraw %}

{% raw %}```javascript{% endraw %}
// JavaScript Code
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" height=500px %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML 代码 -->
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" height=500px split=40 %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML 代码 -->
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" height=500px split=40 layout=vertical %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML 代码 -->
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" %}{% endraw %}
{% raw %}```python{% endraw %}
# Python Code
{% raw %}‌﻿‌‍```{% endraw %}

{% raw %}```plaintext{% endraw %}
Execution Result
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" %}{% endraw %}
{% raw %}```python{% endraw %}
# Python Code
{% raw %}‌﻿‌‍```{% endraw %}

{% raw %}```image{% endraw %}
Link1
Link2
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" hide=code %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML Code -->
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}

{% raw %}{% result title="Page Title" hide=preview %}{% endraw %}
{% raw %}```html{% endraw %}
<!-- HTML Code -->
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endresult %}{% endraw %}
```

### Available Parameters

- `title="Title"` - Set preview title
- `height=600px` - Set container height
- `split=40` - Set left/top code area ratio (default 50%)
- `layout=vertical` - Set layout direction (`horizontal` for left-right layout, `vertical` for top-bottom layout, default `horizontal`)
- `hide=code` - Default hide code area (options: `code` or `preview`)

### Usage Examples

#### Basic Usage

{% result title="Counter Application" %}
```html
<div class="animation-demo">
  <div class="box-container">
    <div class="box box1">Box</div>
  </div>
  <button id="animateBtn">Animate!</button>
</div>
```

```css
.animation-demo {
  padding: 10px;
  text-align: center;
}

.box-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.box {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  transition: all 0.5s ease;
}

.box {
  background: #d74514;
}

.box.animate {
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px) rotate(360deg); }
}
```

```javascript
document.getElementById('animateBtn').addEventListener('click', function() {
  const boxes = document.querySelectorAll('.box');
  
  boxes.forEach((box, index) => {
    setTimeout(() => {
      box.classList.add('animate');
      setTimeout(() => {
        box.classList.remove('animate');
      }, 1000);
    }, index * 200);
  });
});
```
{% endresult %}

#### HTML Only

{% result title="Simple HTML" %}
```html
<div style="text-align: center; padding: 40px; font-family: Arial;">
  <h1 style="color: #d74514;">Pure HTML</h1>
  <p>This example only has HTML, no CSS or JavaScript!</p>
</div>
```
{% endresult %}

#### With Split Ratio

{% result title="CSS Animation" split=60 %}
```html
<div class="animation-demo">
  <div class="box-container">
    <div class="box box1">Box</div>
  </div>
  <button id="animateBtn">Animate!</button>
</div>
```

```css
.animation-demo {
  padding: 10px;
  text-align: center;
}

.box-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.box {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  transition: all 0.5s ease;
}

.box {
  background: #d74514;
}

.box.animate {
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px) rotate(360deg); }
}
```

```javascript
document.getElementById('animateBtn').addEventListener('click', function() {
  const boxes = document.querySelectorAll('.box');
  
  boxes.forEach((box, index) => {
    setTimeout(() => {
      box.classList.add('animate');
      setTimeout(() => {
        box.classList.remove('animate');
      }, 1000);
    }, index * 200);
  });
});
```
{% endresult %}

#### Vertical Layout

{% result title="Vertical Layout Demo" height=800px layout=vertical %}
```html
<div class="animation-demo">
  <div class="box-container">
    <div class="box box1">Box</div>
  </div>
  <button id="animateBtn">Animate!</button>
</div>
```

```css
.animation-demo {
  padding: 10px;
  text-align: center;
}

.box-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.box {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  transition: all 0.5s ease;
}

.box {
  background: #d74514;
}

.box.animate {
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px) rotate(360deg); }
}
```

```javascript
document.getElementById('animateBtn').addEventListener('click', function() {
  const boxes = document.querySelectorAll('.box');
  
  boxes.forEach((box, index) => {
    setTimeout(() => {
      box.classList.add('animate');
      setTimeout(() => {
        box.classList.remove('animate');
      }, 1000);
    }, index * 200);
  });
});
```
{% endresult %}

#### Code Output Mode

When the last code block is of `plaintext` type, it automatically switches to code output mode: previous code blocks are displayed as source code, and the last `plaintext` block is displayed as execution results.

{% result title="Python Fibonacci Sequence" height=500px %}
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("First 10 terms of Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
```

```plaintext
First 10 terms of Fibonacci sequence:
fib(0) = 0
fib(1) = 1
fib(2) = 1
fib(3) = 2
fib(4) = 3
fib(5) = 5
fib(6) = 8
fib(7) = 13
fib(8) = 21
fib(9) = 34
```
{% endresult %}

#### Default Hide Parts

{% result title="Show Results Only" height=400px hide=code %}
```python
# Calculate sum from 1 to 100
total = sum(range(1, 101))
print(f"Sum from 1 to 100 is: {total}")
```

```plaintext
Sum from 1 to 100 is: 5050
```
{% endresult %}

{% result title="Show Code Only" height=400px hide=preview %}
```html
<div class="greeting">
  <h1>Hello, World!</h1>
  <p>This is a simple HTML example</p>
</div>
```

```css
.greeting {
  text-align: center;
  padding: 2rem;
  background: #191970;
  color: white;
  border-radius: 10px;
}

.greeting h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
}
```
{% endresult %}

#### Image Preview Mode

{% result title="Data Visualization Comparison" %}
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2*np.pi, 100)

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))

ax1.plot(x, np.sin(x), 'r-', linewidth=2)
ax1.set_title('sin(x)')
ax1.grid(True)

ax2.plot(x, np.cos(x), 'g-', linewidth=2)
ax2.set_title('cos(x)')
ax2.grid(True)

ax3.plot(x, np.tan(x), 'b-', linewidth=2)
ax3.set_title('tan(x)')
ax3.set_ylim(-5, 5)
ax3.grid(True)

ax4.plot(x, np.sin(x), 'r-', label='sin(x)')
ax4.plot(x, np.cos(x), 'g-', label='cos(x)')
ax4.set_title('sin(x) & cos(x)')
ax4.legend()
ax4.grid(True)

plt.tight_layout()
plt.savefig('trig_functions.png', dpi=300, bbox_inches='tight')
plt.show()
```

```image
https://placehold.co/400x300
https://placehold.co/400x300
https://placehold.co/400x300
https://placehold.co/400x300
```
{% endresult %}

## `code_runner` Plugin

The `code_runner` plugin provides an interactive code editor and runner directly in the page.

```liquid
{% raw %}{% code_runner_empty %}{% endraw %}
{% raw %}{% code_runner height=400px %}{% endraw %}
{% raw %}{% code_runner height=400px %}{% endraw %}
{% raw %}```js{% endraw %}
// some code
{% raw %}‌﻿‌‍```{% endraw %}
{% raw %}{% endcode_runner %}{% endraw %}
```

> Python & JavaScript will run directly in the browser. Other languages will be sent to [wandbox](https://wandbox.org/) for execution.
>
> ***Supported languages***
>
> - C
> - C++
> - Go
> - Haskell
> - Java
> - JavaScript
> - Lua
> - Perl
> - Python
> - Ruby
> - Rust

### Available Parameters

- `height=400px` - Set the height of the code runner (default 300px)

### Usage Example

#### Empty Code Runner

{% code_runner_empty %}

#### Code Runner with Pre-filled Code

{% code_runner %}
```js
console.log("Hello, World!");
for (let i = 0; i < 5; i++) {
  console.log(`Count: ${i}`);
}
```
{% endcode_runner %}

#### Code Runner with Custom Height

{% code_runner height=400px %}
```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```
{% endcode_runner %}

## `file_structure` Plugin

```liquid
{% raw %}{% file_structure %}{% endraw %}
- root/
  - folder1
    - file1.txt
    - [FILE]file2.txt
  - folder2
    - subfolder1/
      - [FOLDER]subsubfolder1
      - file3.txt
  - file4.txt
{% raw %}{% endfile_structure %}{% endraw %}
{% raw %}{% file_structure title="Custom File Structure" %}{% endraw %}
- root/
  - folder1
    - file1.txt
    - [FILE]file2.txt
  - folder2
    - subfolder1/
      - [FOLDER]subsubfolder1
      - file3.txt
  - file4.txt
{% raw %}{% endfile_structure %}{% endraw %}
```

- If sub structure of a name is provided, it will be treated as a folder
- If the name starts with `[FOLDER]`, it will be treated as a folder
- If the name starts with `[FILE]`, it will be treated as a file
- If the name ends with a `/`, it will be treated as a folder

### Available Parameters

- `title="File Structure"` - Set the title of the file structure display (default "File Structure")

### Usage Example

{% file_structure %}
- project_root/
  - src/
    - main.py
    - utils.py
    - ...
  - tests/
    - [FOLDER]unit_tests
    - test_main.py
  - README.md
{% endfile_structure %}

{% file_structure title="My Project Structure" %}
- my_project/
  - app/
    - init.go
  - config/
    - dev/
      - config.go
    - prod/
      - config.go
  - go.mod
{% endfile_structure %}
