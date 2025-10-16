---
layout: post
title:  "Spring MVC"
date:   2024-02-04 00:00:00 +0800
categories: 编程
tags: java spring
summary: "这是 Spring 系列的第四篇，介绍了 Spring MVC，并结合源码详细讲解了 Spring MVC 的实现原理。"
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

- ***`@RequestMapping` 注解***

  用于处理请求，可以用在类上或者方法上。它有以下几种属性：

  - ***`value`***：请求 URL，可以是一个字符串或者字符串数组
  - ***`method`***：请求方法，可以是一个 `RequestMethod` 枚举值或者枚举值数组
  - ***`params`***：请求参数，可以是一个字符串数组
  - ***`headers`***：请求头，可以是一个字符串数组
  - ***`consumes`***：请求内容类型，可以是一个字符串数组
  - ***`produces`***：响应内容类型，可以是一个字符串数组

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

- ***`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping` 注解***

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

- ***`@PathVariable` 注解***

  用于获取 URL 中的参数，例如：

  ```java
  @GetMapping("/book/{id}")
  public String get(@PathVariable("id") int id, Model model) {
    Book book = bookService.getBookById(id);
    model.addAttribute("book", book);
    return "book";
  }
  ```

- ***`@RequestParam`、`@RequestHeader`、`@RequestBody` 注解***

  用于获取请求参数、请求头、请求体，例如：

  ```java
  @GetMapping("/book")
  public String get(@RequestParam("id") int id, Model model) {
    Book book = bookService.getBookById(id);
    model.addAttribute("book", book);
    return "book";
  }
  ```

- ***`@ModelAttribute` 注解***

  用于将请求参数绑定到模型对象，例如：

  ```java
  @PostMapping("/book")
  public String add(@ModelAttribute Book book) {
    bookService.addBook(book);
    return "redirect:/book/list";
  }
  ```

- ***`@SessionAttributes` 注解***

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

- ***`@ResponseBody` 注解***

  用于返回 JSON 数据，例如：

  ```java
  @GetMapping("/book")
  @ResponseBody
  public Book get(@RequestParam("id") int id) {
    return bookService.getBookById(id);
  }
  ```

## Spring MVC 源码解读

我们先来看几个用来处理请求的注解。例如 `@RequestMapping` 注解。

### `@RequestMapping`

`@RequestMapping` 注解的作用是将请求映射到处理方法上。它有很多属性，例如 `value`、`method`、`params`、`headers`、`consumes`、`produces` 等。

<details>
<summary>点击展开 @RequestMapping 源码解读</summary>
<div markdown="1">

```java
@Target({ElementType.TYPE, ElementType.METHOD}) // 注解可以用在类 / 接口 / 枚举 / 方法上
@Retention(RetentionPolicy.RUNTIME) // 注解在运行时有效
@Documented
@Mapping // 继承自 @Mapping 注解
@Reflective(ControllerMappingReflectiveProcessor.class)  // 反射处理器，指定了在反射时使用的处理逻辑
public @interface RequestMapping {
    // 请求映射的名称
    String name() default "";
    
    // 请求映射的路径
    // 例如 /hello
    @AliasFor("path")
    String[] value() default {};
    @AliasFor("value")
    String[] path() default {};
    
    // 请求方法
    // 例如 GET、POST、PUT、DELETE
    RequestMethod[] method() default {};
    
    // 请求参数
    // 例如 id=1
    String[] params() default {};
    
    // 请求头
    // 例如 Cookie=JSESSIONID
    String[] headers() default {};
    
    // 处理请求的媒体类型和响应返回的媒体类型
    // 例如 application/json
    String[] consumes() default {};
    String[] produces() default {};
}
```

其它的 `@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`、`@PatchMapping` 注解都是 `@RequestMapping` 注解的缩写。例如 `@GetMapping` 注解：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(method = RequestMethod.GET)
public @interface GetMapping {
    /* ... */
}
```

</div>
</details>

### DispatcherServlet

那么，类或方法上的 `@RequestMapping` 注解是如何生效的呢？

<details>
<summary>点击展开 DispatcherServlet 源码解读</summary>
<div markdown="1">

我们可以从 `DispatcherServlet` 的 `onRefresh` 方法入手：

```java
@Override
protected void onRefresh(ApplicationContext context) {
    initStrategies(context);
}
```

它覆写了 `AbstractApplicationContext` 中空着没实现的 `onRefresh()` 方法。

> 回顾一下之前讲过的 `refresh()` 方法：
>
> ```java
> public void refresh() throws BeansException, IllegalStateException {
>     /* ... */
>     // 初始化 i18n（需要名为 messageSource 的 Bean）
>     initMessageSource();
>     //初始化事件多播器，用于发布事件到监听器
>     initApplicationEventMulticaster();
>
>     // 模板方法，供子类初始化特殊的 Bean
>     onRefresh();
>     // 注册 ApplicationListener Bean 到事件多播器，并发布早期事件
>     registerListeners();
>
>     // 完成 BeanFactory 的初始化
>     // 初始化所有非延迟单例 Bean、触发 BeanPostProcessor、解决循环依赖等（下文会详细介绍）
>     finishBeanFactoryInitialization(beanFactory);
>
>     // 发布容器刷新完成事件，启动生命周期处理器
>     finishRefresh();
>     /* ... */
> }
> ```
>
> 可以看到，`onRefresh()` 方法是在 `refresh()` 方法中调用的，其调用时机在实例化所有 Bean 之前。

`onRefresh()` 方法中调用了 `initStrategies()` 方法：

```java
protected void initStrategies(ApplicationContext context) {
    initMultipartResolver(context);
    initLocaleResolver(context);
    initThemeResolver(context);
    initHandlerMappings(context);
    initHandlerAdapters(context);
    initHandlerExceptionResolvers(context);
    initRequestToViewNameTranslator(context);
    initViewResolvers(context);
    initFlashMapManager(context);
}
```

它做了大量的初始化工作。

<details>
<summary>点击展开初始化方法</summary>
<div markdown="1">

- `initMultipartResolver`

  初始化​文件上传处理器，用于解析 multipart/form-data 类型的请求（如文件上传）。例如：

  ```java
  @Bean
  public MultipartResolver multipartResolver() {
      return new StandardServletMultipartResolver();
  }
  ```

- `initLocaleResolver`

  初始化国际化处理器，用于解析请求中的语言和地区信息。

  默认情况下，它基于请求头中的 `Accept-Language` 字段来解析语言和地区信息。也可以使用 Cookie 或者 Session 来存储语言和地区信息。例如：

  ```java
  @Bean
  public LocaleResolver localeResolver() {
      CookieLocaleResolver resolver = new CookieLocaleResolver();
      resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
      return resolver;
  }
  ```

- `initThemeResolver`

  初始化主题处理器，用于解析请求中的主题信息，用于动态切换页面样式等。例如：

  ```java
  @Bean
  public ThemeResolver themeResolver() {
      CookieThemeResolver resolver = new CookieThemeResolver();
      resolver.setDefaultThemeName("default");
      return resolver;
  }
  ```

- `initHandlerMappings`

  初始化处理器映射器，用于将请求 URL 映射到处理器上。Spring MVC 提供了多种处理器映射器，例如：

  - `RequestMappingHandlerMapping`：用于处理 `@RequestMapping` 注解

    ```java
    @RequestMapping("/hello")
    public String hello() {
        return "hello";
    }
    ```

  - `SimpleUrlHandlerMapping`：根据 Bean 名称映射 URL

    ```java
    @Bean(name = "/hello")
    public HelloController helloController() {
        return new HelloController();
    }
    ```

  - `BeanNameUrlHandlerMapping`：通过 XML 配置显式映射 URL

    ```xml
    <bean id="/hello" class="com.example.controller.HelloController" />
    ```

- `initHandlerAdapters`

  初始化处理器适配器，用于将请求和响应对象传递给处理器。Spring MVC 提供了多种处理器适配器，例如：

  - `RequestMappingHandlerAdapter`：用于处理 `@RequestMapping` 注解
  - `SimpleControllerHandlerAdapter`：用于处理实现了 `Controller` 接口的类
  - `HttpRequestHandlerAdapter`：用于处理实现了 `HttpRequestHandler` 接口的类

- `initHandlerExceptionResolvers`

  初始化异常处理器，用于处理控制器方法抛出的异常。Spring MVC 提供了多种异常处理器，例如：

  - `ExceptionHandlerExceptionResolver`：用于处理 `@ExceptionHandler` 注解
  - `ResponseStatusExceptionResolver`：用于处理 `@ResponseStatus` 注解
  - `DefaultHandlerExceptionResolver`：用于处理 Spring MVC 内置的异常（如 404、500 等）

- `initRequestToViewNameTranslator`

  初始化请求到视图名称转换器，用于将请求 URL 转换为视图名称。默认情况下，它使用 `DefaultRequestToViewNameTranslator` 类来实现。它会将例如 `/users/list.html` 的请求 URL 转换为 `users/list` 的视图名称。

- `initViewResolvers`

  初始化视图解析器，用于将视图名称解析为视图对象。Spring MVC 提供了多种视图解析器，例如：

  - `InternalResourceViewResolver`：用于解析 JSP 视图
  - `ThymeleafViewResolver`：用于解析 Thymeleaf 视图
  - `JsonViewResolver`：用于解析 JSON 视图

  例如：

  ```java
  @Bean
  public ViewResolver viewResolver() {
      InternalResourceViewResolver resolver = new InternalResourceViewResolver();
      resolver.setPrefix("/WEB-INF/views/");
      resolver.setSuffix(".jsp");
      return resolver;
  }
  ```

- `initFlashMapManager`

  初始化 FlashMap 管理器，用于在重定向时传递临时数据。FlashMap 是一种特殊的 Map，它可以在重定向后保留数据。默认情况下，它使用 `SessionFlashMapManager` 类来实现。它会将 FlashMap 存储在 Session 中，并在重定向后删除。

  ```java
  @PostMapping("/save")
  public String saveData(RedirectAttributes attributes) {
      attributes.addFlashAttribute("message", "保存成功！");
      return "redirect:/result";
  }
  ```

</div>
</details>

不管是什么样的请求，最终都会调用 `DispatcherServlet` 的 `doDispatch` 方法来处理：

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    // 可能被后续处理修改（如 Multipart 解析）的请求对象
    HttpServletRequest processedRequest = request;
    // 存储匹配到的处理器执行链
    HandlerExecutionChain mappedHandler = null;
    // 标记请求是否为 Multipart（如文件上传）
    boolean multipartRequestParsed = false;
    // 管理异步请求处理
    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

    try {
        ModelAndView mv = null;
        Exception dispatchException = null;

        try {
            // 处理 Multipart 请求
            processedRequest = checkMultipart(request);
            multipartRequestParsed = (processedRequest != request);

            // 遍历所有 HandlerMapping 实现，根据请求 URL 匹配对应的 HandlerExecutionChain
            mappedHandler = getHandler(processedRequest);
            if (mappedHandler == null) {
                noHandlerFound(processedRequest, response);
                return;
            }

            // 根据处理器类型（如 @Controller 方法、HttpRequestHandler）选择合适的 HandlerAdapter
            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

            // 处理 HTTP 缓存，如果请求方法为 GET 或 HEAD，检查是否需要返回 304 Not Modified
            String method = request.getMethod();
            boolean isGet = HttpMethod.GET.matches(method);
            if (isGet || HttpMethod.HEAD.matches(method)) {
                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
                    return;
                }
            }

            // 按顺序执行所有拦截器的 preHandle 方法
            if (!mappedHandler.applyPreHandle(processedRequest, response)) {
                return;
            }

            // 通过 HandlerAdapter 反射调用控制器方法，处理参数绑定、返回值解析，生成 ModelAndView 对象
            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

            // 处理异步请求
            if (asyncManager.isConcurrentHandlingStarted()) {
                return;
            }

            // 若 ModelAndView 未设置视图名，使用请求路径生成默认视图名
            applyDefaultViewName(processedRequest, mv);

            // 逆序执行拦截器的 postHandle 方法，允许修改 ModelAndView
            mappedHandler.applyPostHandle(processedRequest, response, mv);
        }
        catch (Exception ex) {
            dispatchException = ex;
        }
        catch (Throwable err) {
            dispatchException = new ServletException("Handler dispatch failed: " + err, err);
        }
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
    }
    catch (Exception ex) {
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
    }
    catch (Throwable err) {
        triggerAfterCompletion(processedRequest, response, mappedHandler,
            new ServletException("Handler processing failed: " + err, err));
    }
    finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
            if (mappedHandler != null) {
                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
            }
            asyncManager.setMultipartRequestParsed(multipartRequestParsed);
        }
        else {
            if (multipartRequestParsed || asyncManager.isMultipartRequestParsed()) {
                // 删除 Multipart 请求的临时文件
                cleanupMultipart(processedRequest);
            }
        }
    }
}
```

这个方法接收请求后做了以下几件事情：

1. 请求解析
2. 处理器匹配
3. 拦截器前置处理
4. 方法调用
5. 视图渲染
6. 拦截器后置处理
7. 异常处理

</div>
</details>

综上，`DispatcherServlet` 的 `doDispatch` 方法是 Spring MVC 的核心，它负责处理请求、调用处理器、渲染视图等。
