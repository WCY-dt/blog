---
layout: post
title:  "Spring MVC"
date:   2024-02-04 00:00:00 +0800
categories: 编程
tags: java spring
series: 深入 Spring 源码
series_index: 4
comments: true
copyrights: 原创
---

Spring 是一个开源的轻量级 JavaEE 框架。它的核心是控制反转（IoC）和面向切面编程（AOP）。Spring 的 IoC 容器负责管理 JavaBean 的生命周期，而 AOP 容器负责管理切面。Spring 还提供了一系列的模块，如 Spring MVC、Spring JDBC、Spring Security 等。

## Spring MVC

### 为什么需要 Spring MVC

在实际开发中，我们经常会遇到这样的情况：用户请求一个 URL，服务器返回一个 HTML 页面。

这个过程中，我们需要处理用户请求、调用业务逻辑、返回 HTML 页面。如果没有框架，我们需要自己处理这些事情，这样会导致代码冗余、耦合度高、不利于维护。

Spring MVC 就是为了解决这些问题而生的。它将请求处理、业务逻辑、视图渲染分离开来，使得代码更加简洁、清晰。

MVC 是一种设计模式，它将应用程序分为三个部分：模型（Model）、视图（View）、控制器（Controller）。模型负责处理业务逻辑，视图负责渲染页面，控制器负责处理用户请求。

### Spring MVC 使用

我们这里只介绍纯 Java 配置方法。Spring MVC 有着不一样的目录结构：

```plaintext
src/
  main/
    java/
      com/example/config/
        WebAppInitializer.java  # Servlet 容器初始化
        RootConfig.java         # 根容器配置（服务层、数据源等）
        WebConfig.java          # Web层配置（控制器、视图解析器等）
    webapp/
      WEB-INF/
        views/
          hello.jsp             # 视图文件
      index.jsp                 # 首页
```

首先编写 `WebAppInitializer` 类：

```java
public class WebAppInitializer implements WebApplicationInitializer {
  @Override
  public void onStartup(ServletContext servletContext) {
    // 1. 创建根容器
    AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
    rootContext.register(RootConfig.class);

    // 2. 注册 ContextLoaderListener
    servletContext.addListener(new ContextLoaderListener(rootContext));

    // 3. 创建 Web 容器
    AnnotationConfigWebApplicationContext webContext = new AnnotationConfigWebApplicationContext();
    webContext.register(WebConfig.class);

    // 4. 配置 DispatcherServlet
    DispatcherServlet servlet = new DispatcherServlet(webContext);
    ServletRegistration.Dynamic registration = servletContext.addServlet("appServlet", servlet);
    registration.setLoadOnStartup(1);
    registration.addMapping("/");
  }
}
```

然后编写 Web 层配置类 `WebConfig`：

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.example.controller")
public class WebConfig implements WebMvcConfigurer {

  // 视图解析器
  @Bean
  public ViewResolver viewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    resolver.setExposeContextBeansAsAttributes(true);
    return resolver;
  }

  // 静态资源处理
  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    configurer.enable();
  }
}
```

最后实现控制器类 `HelloController`：

```java
@Controller
public class HelloController {
  @RequestMapping("/hello")
  public String hello(Model model) {
    model.addAttribute("message", "Hello Spring MVC!");
    return "hello"; // 对应 /WEB-INF/views/hello.jsp
  }
}
```

`hello.jsp` 文件：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Hello</title>
</head>
<body>
    <h1>${message}</h1>
</body>
</html>
```

这样，我们就实现了一个简单的 Spring MVC。

### 请求处理

`@Controller` 注解用于标识控制器类，这会告诉 Spring 这是一个控制器类。

Spring MVC 使用 `@RequestMapping` 注解来处理请求。它有以下几种用法：

- **`@RequestMapping` 注解**

  用于处理请求，可以用在类上或者方法上。它有以下几种属性：

  - **`value`**：请求 URL，可以是一个字符串或者字符串数组
  - **`method`**：请求方法，可以是一个 `RequestMethod` 枚举值或者枚举值数组
  - **`params`**：请求参数，可以是一个字符串数组
  - **`headers`**：请求头，可以是一个字符串数组
  - **`consumes`**：请求内容类型，可以是一个字符串数组
  - **`produces`**：响应内容类型，可以是一个字符串数组

  例如：

  ```java
  @Controller
  @RequestMapping("/book")
  public class BookController {
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String list(Model model) {
      return "list";
    }

    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public String add(Book book) {
      return "redirect:/book/list";
    }
  }
  ```

- **`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping` 注解**

  用于处理 GET、POST、PUT、DELETE 请求。它们是 `@RequestMapping` 的缩写，例如：

  ```java
  @Controller
  @RequestMapping("/book")
  public class BookController {
    @GetMapping("/list")
    public String list(Model model) {
      return "list";
    }

    @PostMapping("/add")
    public String add(Book book) {
      return "redirect:/book/list";
    }
  }
  ```

- **`@PathVariable` 注解**

  用于获取 URL 中的参数，例如：

  ```java
  @GetMapping("/book/{id}")
  public String get(@PathVariable("id") int id, Model model) {
    Book book = bookService.getBookById(id);
    model.addAttribute("book", book);
    return "book";
  }
  ```

- **`@RequestParam`、`@RequestHeader`、`@RequestBody` 注解**

  用于获取请求参数、请求头、请求体，例如：

  ```java
  @GetMapping("/book")
  public String get(@RequestParam("id") int id, Model model) {
    Book book = bookService.getBookById(id);
    model.addAttribute("book", book);
    return "book";
  }
  ```

- **`@ModelAttribute` 注解**

  用于将请求参数绑定到模型对象，例如：

  ```java
  @PostMapping("/book")
  public String add(@ModelAttribute Book book) {
    bookService.addBook(book);
    return "redirect:/book/list";
  }
  ```

- **`@SessionAttributes` 注解**

  用于将模型对象存储到会话中，例如：

  ```java
  @Controller
  @RequestMapping("/book")
  @SessionAttributes("book")
  public class BookController {
    @GetMapping("/book")
    public String get(@RequestParam("id") int id, Model model) {
      Book book = bookService.getBookById(id);
      model.addAttribute("book", book);
      return "book";
    }

    @PostMapping("/book")
    public String add(@ModelAttribute Book book) {
      bookService.addBook(book);
      return "redirect:/book/list";
    }
  }
  ```

- **`@ResponseBody` 注解**

  用于返回 JSON 数据，例如：

  ```java
  @GetMapping("/book")
  @ResponseBody
  public Book get(@RequestParam("id") int id) {
    return bookService.getBookById(id);
  }
  ```
