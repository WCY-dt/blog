---
layout:     post
title:      "Highlight Test"
date:       2000-01-03 00:00:00 +0800
categories: frontend
tags:       vue react angular svelte
summary:    "A test for code highlighting in markdown files."
series:     test
series_index: 3
---

- If no language is specified, it should default to plaintext
- If a fake language is specified, it should still be highlighted as if the language exists
- If the language is plaintext or diff, it should be highlighted with grey backgrounds
- If the language is shell or any alias of shell (bash, sh, zsh, powershell), it should be highlighted with black backgrounds as in dark mode, and have more colorful syntax highlighting

***No Language Specified***

```
This is a code block without a specified language.
It should be treated as plain text.
It can contain any characters: !@#$%^&*()_+{}|:"<>? and numbers 1234567890.
```

***Fake Language***

```fakelang
This is a code block with a fake language specified.
It should also be treated as the language does exist.
function fakeFunction() {
    console.log("This is a fake language code block.");
}
```

***HTML + CSS + JavaScript***

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <!-- This is a comment -->
  <div class="container">
    <h1 id="main-title">Welcome</h1>
    <p class="description">This is a test page.</p>
    <button onclick="alert('Clicked!')">Click Me</button>
  </div>
  <script>
    document.getElementById('main-title').style.color = '#333';
  </script>
</body>
</html>
```

***SCSS***

```scss
$primary-color: #3498db;
$secondary-color: #2ecc71;
$font-stack: 'Helvetica Neue', sans-serif;
body {
  font-family: $font-stack;
  background-color: #ecf0f1;
  margin: 0;
  padding: 20px;

  .header {
    background-color: $primary-color;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;

    h1 {
      margin: 0;
      font-size: 2rem;
    }
  }

  .content {
    margin-top: 20px;

    p {
      font-size: 1rem;
      line-height: 1.5;
      color: #2c3e50;
    }

    a {
      color: $secondary-color;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
```

***JavaScript***

```javascript
// JavaScript example with ES6 features
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    throw error;
  }
};

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, my name is ${this.name}`;
  }
}

const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(x => x * x);
```

***TypeScript***

```typescript
// TypeScript example demonstrating types, interfaces, and classes
interface User {
  id: number;
  name: string;
  email: string;
}

class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, my name is ${this.name}`;
  }
}

const fetchData = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data: ${(error as Error).message}`);
    throw error;
  }
};

const numbers: number[] = [1, 2, 3, 4, 5];
const squares: number[] = numbers.map((x) => x * x);

console.log(squares);
```

***Python***

```python
# This is a comment
def fibonacci(n: int) -> int:
    """Calculate nth Fibonacci number"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n-1):
        a, b = b, a + b
    return b

class MathOperations:
    PI = 3.14159
    
    @staticmethod
    def square(x):
        return x ** 2

result = fibonacci(10)
print(f"10th Fibonacci number is {result}")
```

***C++***

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

template<typename T>
T findMax(const vector<T>& vec) {
    if (vec.empty()) {
        throw invalid_argument("Vector is empty");
    }
    return *max_element(vec.begin(), vec.end());
}

int main() {
    vector<int> numbers = {3, 1, 4, 1, 5, 9, 2, 6};
    
    try {
        int maxNum = findMax(numbers);
        cout << "Maximum number: " << maxNum << endl;
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
```

***Java***

```java
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        
        // Using Java Streams
        List<String> filteredNames = names.stream()
            .filter(name -> name.length() > 4)
            .map(String::toUpperCase)
            .collect(Collectors.toList());
            
        System.out.println("Filtered names: " + filteredNames);
    }
    
    /**
     * Calculates the factorial of a number
     * @param n non-negative integer
     * @return factorial of n
     */
    public static int factorial(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("n must be non-negative");
        }
        return n <= 1 ? 1 : n * factorial(n - 1);
    }
}
```

***Rust***

```rust
use std::fs::File;
use std::io::{self, Read};

// A simple function to read file contents
fn read_file(path: &str) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}

fn main() {
    match read_file("example.txt") {
        Ok(contents) => println!("File contents: {}", contents),
        Err(e) => eprintln!("Error reading file: {}", e),
    }
    
    let p1 = Point { x: 3.0, y: 4.0 };
    let p2 = Point { x: 6.0, y: 8.0 };
    println!("Distance: {}", p1.distance(&p2));
}
```

***Go***

```go
package main

import "fmt"

func main() {
    // Simple Go program to demonstrate syntax highlighting
    fmt.Println("Hello, World!")
    nums := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, num := range nums {
        sum += num
    }
    fmt.Printf("Sum: %d\n", sum)
}
```

***Swift***

```swift
import Foundation

// Swift program to demonstrate syntax highlighting
struct Person {
    var name: String
    var age: Int
    func greet() -> String {
        return "Hello, my name is \(name) and I am \(age) years old."
    }
}

let person = Person(name: "Alice", age: 30)
print(person.greet())
```

***Kotlin***

```kotlin
fun main() {
    // Kotlin program to demonstrate syntax highlighting
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    println("Doubled numbers: $doubled")
}
```

***PHP***

```php
<?php
// PHP example demonstrating syntax highlighting
function greet($name) {
    return "Hello, " . htmlspecialchars($name) . "!";
}
echo greet("World");
?>
```

***Perl***

```perl
# Perl example demonstrating syntax highlighting
use strict;
use warnings;

sub factorial {
    my ($n) = @_;
    return $n <= 1 ? 1 : $n * factorial($n - 1);
}

my $num = 5;
my $fact = factorial($num);
print "Factorial of $num is $fact\n";
```

***Ruby***

```ruby
# Ruby example demonstrating syntax highlighting
def fibonacci(n)
  return n if n <= 1
  a, b = 0, 1
  (n - 1).times do
    a, b = b, a + b
  end
  b
end
puts "10th Fibonacci number is #{fibonacci(10)}"
```

***R***

```r
# R example demonstrating syntax highlighting
fibonacci <- function(n) {
  if (n <= 1) {
    return(n)
  }
  a <- 0
  b <- 1
  for (i in 2:n) {
    temp <- a + b
    a <- b
    b <- temp
  }
  return(b)
}
result <- fibonacci(10)
cat("10th Fibonacci number is", result, "\n")
```

***C#***

```c#
// C# example demonstrating syntax highlighting
using System;

class Program
{
    static void Main()
    {
        int result = Fibonacci(10);
        Console.WriteLine($"10th Fibonacci number is {result}");
    }

    static int Fibonacci(int n)
    {
        if (n <= 1)
            return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++)
        {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}
```

***MATLAB***

```matlab
% MATLAB example demonstrating syntax highlighting
function result = fibonacci(n)
    if n <= 1 
        result = n;
        return;
    end
    a = 0;
    b = 1;
    for i = 2:n
        temp = a + b;
        a = b;
        b = temp;
    end
    result = b;
end
disp(['10th Fibonacci number is ', num2str(fibonacci(10))]);
```

***Haskell***

```haskell
-- Haskell example demonstrating syntax highlighting
fibonacci :: Int -> Int
fibonacci n
    | n <= 1    = n
    | otherwise = fibs !! n
    where fibs = 0 : 1 : zipWith (+) fibs (tail fibs)
main :: IO ()
main = do
    let result = fibonacci 10
    putStrLn $ "10th Fibonacci number is " ++ show result
```

***GLSL***

```glsl
#version 330 core
layout(location = 0) in vec3 aPos;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

***SQL***

```sql
-- Sample SQL queries
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO users (username, email)
VALUES ('johndoe', 'john@example.com'),
       ('janedoe', 'jane@example.com');

SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.is_active = TRUE
GROUP BY u.id
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC;
```

***GraphQL***

```graphql
# Sample GraphQL query and mutation
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
      content
    }
  }
}
mutation CreateUser($name: String!, $email: String!) {
  createUser(input: {name: $name, email: $email}) {
    user {
      id
      name
      email
    }
  }
}
```

***Bash***

```bash
#!/bin/bash

# This is a simple backup script
BACKUP_DIR="/var/backups"
LOG_FILE="/var/log/backup.log"
DATE=$(date +%Y%m%d)

function create_backup() {
    local source_dir=$1
    local dest_file="$BACKUP_DIR/$(basename $source_dir)-$DATE.tar.gz"
    
    if [ ! -d "$source_dir" ]; then
        echo "Error: Source directory $source_dir does not exist" >> "$LOG_FILE"
        return 1
    fi
    
    tar -czf "$dest_file" "$source_dir" 2>> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Backup created: $dest_file" >> "$LOG_FILE"
        return 0
    else
        echo "Backup failed for $source_dir" >> "$LOG_FILE"
        return 1
    fi
}

create_backup "/etc"
create_backup "/home/user/documents"
```

***Shell***

```shell
$ echo "Hello, World!"
Hello, World!
$ ls -l /home/user
total 4096
drwxr-xr-x 2 user user 4096 Jan  1 12:00 documents
drwxr-xr-x 5 user user 4096 Jan  1 12:00 pictures
$ pwd
/home/user
```

***PowerShell***

```powershell
# PowerShell example demonstrating syntax highlighting
function Get-Fibonacci {
    param ([int]$n
    )
    if ($n -le 1) {
        return $n
    }
    $a = 0
    $b = 1
    for ($i = 2; $i -le $n; $i++) {
        $temp = $a + $b
        $a = $b
        $b = $temp
    }
    return $b
}

$result = Get-Fibonacci -n 10
Write-Output "10th Fibonacci number is $result"
```

***Makefile***

```makefile
# Makefile example demonstrating syntax highlighting
CC = gcc
CFLAGS = -Wall -Wextra -O2
LDFLAGS = -lmyapp -lmath
SRC = main.c utils.c
OBJ = $(SRC:.c=.o)
TARGET = myapp
all: $(TARGET)
$(TARGET): $(OBJ)
	$(CC) -o $@ $^ $(LDFLAGS)
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
clean:
	rm -f $(OBJ) $(TARGET)
.PHONY: all clean
```

***Dockerfile***

```Dockerfile
# Dockerfile example demonstrating syntax highlighting
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . . .
CMD ["python", "app.py"]
```

***YAML***

```yaml
# YAML example demonstrating syntax highlighting
person:
  name: John Doe
  age: 30
  email:
    - john.doe@example.com
    - john.doe@workplace.com
  address:
    street: 123 Main St
    city: Anytown
    state: CA
    zip: 12345
  married: false
  children: []
  pets: null
```

***JSON***

```json
{
  "name": "John Doe",
  "age": 30,
  "email": [
    "john.doe@example.com",
    "john.doe@workplace.com"
  ],
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "married": false,
  "children": [],
  "pets": null
}
```

***TOML***

```toml
[person]
name = "John Doe"
age = 30
email = ["john.doe@example.com", "john.doe@workplace.com"]
[person.address]
street = "123 Main St"
city = "Anytown"
state = "CA"
zip = "12345"
married = false
children = []
pets = null
```

***Properties***

```properties
# Properties file example demonstrating syntax highlighting
app.name=HighlightTest
app.version=1.0.0
app.description=A test application for code highlighting
database.url=jdbc:mysql://localhost:3306/testdb
database.username=root
database.password=secret
```

***ini***

```ini
; INI file example demonstrating syntax highlighting
[person]
name=John Doe
age=30
email=john.doe@example.com
[address]
street=123 Main St
city=Anytown
state=CA
zip=12345
married=false
children=
pets=
```

***NASM***

```nasm
section .data
    msg db 'Hello, World!', 0Ah
    len equ $ - msg
section .text
    global _start
_start:
    ; write our string to stdout
    mov eax, 4          ; syscall: sys_write
    mov ebx, 1          ; file descriptor: stdout
    mov ecx, msg        ; pointer to message
    mov edx, len        ; message length
    int 0x80            ; call kernel
    ; exit
    mov eax, 1          ; syscall: sys_exit
    xor ebx, ebx        ; exit code 0
    int 0x80            ; call kernel
```

***diff***

```diff
--- Original
+++ Modified
@@ -1,5 +1,5 @@
-Line one of the file.
-Line two of the file.
-Line three of the file.
+Line one of the modified file.
+Line two has been changed.
+Line three of the file.
 Line four remains the same.
-Line five of the file.
+Line five has been updated.
```

***Plaintext***

```plaintext
This is a plain text code block.
It can contain any text, including special characters like !@#$%^&*()_+{}|:"<>? and numbers 1234567890.
It does not have any syntax highlighting.
It is useful for displaying logs, configuration files, or any other text data.
```
