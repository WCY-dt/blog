---
layout:     post
title:      "Plugin Test"
date:       2000-01-02 00:00:00 +0800
categories: frontend
tags:       vue react angular svelte
summary:    "This article introduces the plugins provided by the Tangerine theme, including code enhancement, table enhancement, GitHub integration, image captions, image grids, iframes, and result display."
series:     test
series_index: 2
mathjax:    true
mermaid:    true
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
{% raw %}{% iframe iframe_name height=500px hide_header=true %}{% endraw %}
```

The plugin automatically reads HTML files from the `assets/post/iframes/iframe_name/` directory and displays them as iframes.

### Available Parameters

- `height`: Custom iframe height (default 400px)
- `hide_header`: Hide header title bar (default false)

### Usage Examples

#### Default Style (Show Header)

{% iframe test %}

#### Custom Height

{% iframe test height=800px %}

#### Hide Header

{% iframe test hide_header=true %}

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
<div class="counter-app">
  <h2>Counter Application</h2>
  <div class="counter-display">
    <span id="counter">0</span>
  </div>
  <div class="counter-controls">
    <button id="decrementBtn" class="btn btn-red">-</button>
    <button id="resetBtn" class="btn btn-gray">Reset</button>
    <button id="incrementBtn" class="btn btn-green">+</button>
  </div>
</div>
```

```css
.counter-app {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.counter-display {
  text-align: center;
  margin-bottom: 10px;
}

#counter {
  font-size: 72px;
  font-weight: bold;
  color: #191970;
  display: inline-block;
  min-width: 120px;
}

.counter-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  border: none;
  padding: 15px 25px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-red {
  background: #e74c3c;
}

.btn-green {
  background: #2ecc71;
}

.btn-gray {
  background: #95a5a6;
}
```

```javascript
let count = 0;
const counterElement = document.getElementById('counter');

document.getElementById('incrementBtn').addEventListener('click', () => {
  count++;
  counterElement.textContent = count;
  animateCounter();
});

document.getElementById('decrementBtn').addEventListener('click', () => {
  count--;
  counterElement.textContent = count;
  animateCounter();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  count = 0;
  counterElement.textContent = count;
  animateCounter();
});

function animateCounter() {
  counterElement.style.transform = 'scale(1.2)';
  setTimeout(() => {
    counterElement.style.transform = 'scale(1)';
  }, 200);
}

counterElement.style.transition = 'transform 0.2s';
```
{% endresult %}

#### HTML Only

{% result title="Simple HTML" %}
```html
<div style="text-align: center; padding: 40px; font-family: Arial;">
  <h1 style="color: #191970;">Pure HTML</h1>
  <p>This example only has HTML, no CSS or JavaScript!</p>
  <p>✨ Simple and clean ✨</p>
</div>
```
{% endresult %}

#### With Split Ratio

{% result title="CSS Animation" split=60 %}
```html
<div class="animation-demo">
  <h2>CSS Animation Demo</h2>
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

h2 {
  color: #333;
  margin-bottom: 30px;
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

.box { background: #e74c3c; }

.box.animate {
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px) rotate(360deg); }
}

#animateBtn {
  background: #191970;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s;
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
<div class="vertical-demo">
  <h2>Vertical Layout Example</h2>
  <p>This result uses a vertical (top-bottom) layout!</p>
  <div class="color-grid">
    <div class="color-box" style="background: #e74c3c;" data-color="Red">Red</div>
    <div class="color-box" style="background: #3498db;" data-color="Blue">Blue</div>
    <div class="color-box" style="background: #2ecc71;" data-color="Green">Green</div>
    <div class="color-box" style="background: #f39c12;" data-color="Orange">Orange</div>
  </div>
  <p id="selected-color">Click a color box!</p>
</div>
```

```css
.vertical-demo {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h2 {
  color: #191970;
  margin-bottom: 10px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 400px;
  margin: 20px auto;
}

.color-box {
  padding: 10px;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.color-box:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

#selected-color {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #191970;
}
```

```javascript
document.querySelectorAll('.color-box').forEach(box => {
  box.addEventListener('click', function() {
    const color = this.getAttribute('data-color');
    const selectedElement = document.getElementById('selected-color');
    selectedElement.textContent = `You selected: ${color}!`;
    selectedElement.style.color = this.style.background;
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
