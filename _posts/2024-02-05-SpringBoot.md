---
layout:     post
title:      "Spring Boot"
date:       2024-02-05 00:00:00 +0800
categories: 编程
tags:       java spring
summary:    "这是 Spring 系列的第五篇，介绍了 Spring Boot，并结合源码详细讲解了 Spring Boot 的实现原理。"
series:     深入 Spring 源码
series_index: 5
---

Spring 是一个开源的轻量级 JavaEE 框架。它的核心是控制反转（IoC）和面向切面编程（AOP）。Spring 的 IoC 容器负责管理 JavaBean 的生命周期，而 AOP 容器负责管理切面。Spring 还提供了一系列的模块，如 Spring MVC、Spring JDBC、Spring Security 等。

## Spring Boot

### 为什么需要 Spring Boot

从前面的内容可以看出，Spring 配置繁琐，需要配置 XML 文件、Java 文件，需要配置很多东西。Spring Boot 就是为了解决这些问题而生的。

Spring Boot 是 Spring 的一个子项目，它简化了 Spring 应用的开发，它可以自动配置、内嵌服务器、无需 XML 配置文件。

### Spring Boot 使用

Spring Boot 可以直接使用 Spring Initializr 来生成项目，生成时，选择 Spring Boot 版本、项目名称、项目类型、依赖等。

Spring Boot 项目的目录结构：

```plaintext
src/
  main/
    java/
      com/example/
        controller/
          BookController.java
        model/
          Book.java
        service/
          BookService.java
        Application.java
    resources/
      application.yml
      static/
        style.css
      templates/
        book.html
```

### Spring Boot 配置

Spring Boot 使用 `application.properties` 或者 `application.yml` 来配置项目。

下面是一些常用的配置：

```yaml
server:
  port: 8080 # 服务器端口
  servlet:
    context-path: /bookstore # 项目路径
logging:
  level:
    root: info # 日志级别
  file:
    name: app.log # 日志文件名
spring:
  datasource: # 数据源配置
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/book
    username: root
    password: password
  jpa: # JPA 配置
    hibernate:
      ddl-auto: update # 自动建表
    show-sql: true # 显示 SQL
  profiles:
    active: dev # 激活的配置文件
```

### Spring Boot 启动类

Spring Boot 项目的启动类：

```java
@SpringBootApplication
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```

`@SpringBootApplication` 注解是 Spring Boot 的核心注解，它包含了 `@Configuration`、`@EnableAutoConfiguration`、`@ComponentScan` 注解。

### Spring Boot 控制器

Spring Boot 控制器：

```java
@RestController
public class BookController {
  @Autowired
  private BookService bookService;

  @GetMapping("/book/{id}")
  public Book get(@PathVariable("id") int id) {
    return bookService.getBookById(id);
  }

  @PostMapping("/book")
  public void add(@RequestBody Book book) {
    bookService.addBook(book);
  }
}
```

这和 Spring MVC 的控制器类是一样的。

### Spring Boot 服务层

Spring Boot 服务层：

```java
@Service
public class BookService {
  @Autowired
  private BookDao bookDao;

  public Book getBookById(int id) {
    return bookDao.getBookById(id);
  }

  public void addBook(Book book) {
    bookDao.addBook(book);
  }
}
```

这就是基本的 Spring 的写法。

### Spring Boot 数据库

Spring Boot 数据库配置：

```java
@Configuration
public class DataSourceConfig {
  @Bean
  @ConfigurationProperties(prefix = "spring.datasource")
  public DataSource dataSource() {
    return DataSourceBuilder.create().build();
  }
}
```

Spring Boot 数据库访问：

```java
@Repository
public class BookDao {
  @Autowired
  private JdbcTemplate jdbcTemplate;

  public Book getBookById(int id) {
    String sql = "SELECT * FROM book WHERE id = ?";
    return jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Book.class), id);
  }

  public void addBook(Book book) {
    String sql = "INSERT INTO book VALUES(?, ?)";
    jdbcTemplate.update(sql, book.getTitle(), book.getAuthor());
  }
}
```

### Spring Boot 静态资源

Spring Boot 静态资源：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
  }
}
```

这样，我们就实现了一个简单的 Spring Boot 项目。

## Spring Boot 源码解读

### `@SpringBootApplication`

<details>
<summary>点击查看 @SpringBootApplication 源码解读</summary>
<div markdown="1">

直接看 `@SpringBootApplication` 注解的源码：

```java
@Target(ElementType.TYPE) // 只能用于类、接口、枚举
@Retention(RetentionPolicy.RUNTIME) // 注解在运行时保留
@Documented
@Inherited // 子类可以继承父类的注解
@SpringBootConfiguration // Spring Boot 配置类
@EnableAutoConfiguration // 启用自动配置
@ComponentScan(excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class)
}) // 组件扫描
public @interface SpringBootApplication {
  // 排除部分自动配置类的方法
  @AliasFor(annotation = EnableAutoConfiguration.class)
  Class<?>[] exclude() default {};
  @AliasFor(annotation = EnableAutoConfiguration.class)
  String[] excludeName() default {};

  // 设置 basePackage
  @AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
  String[] scanBasePackages() default {};
  @AliasFor(annotation = ComponentScan.class, attribute = "basePackageClasses")
  Class<?>[] scanBasePackageClasses() default {};

  // 设置 Bean 的命名规则
  @AliasFor(annotation = ComponentScan.class, attribute = "nameGenerator")
  Class<? extends BeanNameGenerator> nameGenerator() default BeanNameGenerator.class;

  // 控制配置类中 @Bean 方法是否通过代理调用
  @AliasFor(annotation = Configuration.class)
  boolean proxyBeanMethods() default true;
}
```

这里，我们就能看到 `@SpringBootApplication` 注解实际上就是给 `@SpringBootConfiguration`、`@EnableAutoConfiguration` 和 `@ComponentScan` 合体了。

> 根据这里我们可以发现，一个最完整的 `@SpringBootApplication` 注解的使用是这样的：
>
> ```java
> @SpringBootApplication(
>     exclude = {DataSourceAutoConfiguration.class},
>     excludeName = {"org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration"},
>     scanBasePackages = {"com.example"},
>     scanBasePackageClasses = {Application.class},
>     nameGenerator = MyBeanNameGenerator.class,
>     proxyBeanMethods = false
> )
> ```
>
> 当然，这个注解的使用是非常少见的，大部分时候我们只需要使用 `@SpringBootApplication` 注解就可以了。

接下来，我们挨个来看这几个注解：

- `@SpringBootConfiguration`

  ```java
  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @Documented
  @Configuration
  @Indexed
  public @interface SpringBootConfiguration {
    @AliasFor(annotation = Configuration.class)
    boolean proxyBeanMethods() default true;
  }
  ```

  可以看到，`@SpringBootConfiguration` 注解实际上就是 `@Configuration` 注解的一个子注解，它的作用是标记一个类是 Spring 的配置类。

- `@EnableAutoConfiguration`

  ```java
  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @Documented
  @Inherited
  @AutoConfigurationPackage
  @Import(AutoConfigurationImportSelector.class)
  public @interface EnableAutoConfiguration {

    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
  }
  ```

  `@EnableAutoConfiguration` 注解最重要的功能就是利用 `@Import` 注解导入 `AutoConfigurationImportSelector` 类，这个类的作用就是根据条件加载 Bean。

  对于 `AutoConfigurationImportSelector` 类，我们可以直接看它的 `selectImports` 方法：

  ```java
  @Override
  public String[] selectImports(AnnotationMetadata annotationMetadata) {
      // 判断是否启用自动装配
      if (!isEnabled(annotationMetadata)) {
          return NO_IMPORTS;
      }

      // 获取自动配置类的名称
      AutoConfigurationEntry autoConfigurationEntry = getAutoConfigurationEntry(annotationMetadata);
      // 返回配置类
      return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
  }
  ```

  这里跟踪进 `getAutoConfigurationEntry` 方法：

  ```java
  protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
      // 判断是否启用自动装配
      if (!isEnabled(annotationMetadata)) {
          return EMPTY_ENTRY;
      }

      // 解析 @EnableAutoConfiguration 或 @SpringBootApplication 注解的属性，提取 exclude 和 excludeName 参数
      AnnotationAttributes attributes = getAttributes(annotationMetadata);

      // 从 META-INF/spring.factories 文件中加载所有声明的自动配置类
      List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);

      // 确保配置类无重复
      configurations = removeDuplicates(configurations);

      // 收集所有需要排除的配置类
      Set<String> exclusions = getExclusions(annotationMetadata, attributes);

      // 检查排除的类是否有效
      checkExcludedClasses(configurations, exclusions);

      // 从候选配置列表中移除所有排除的类
      configurations.removeAll(exclusions);

      // 基于 @Conditional 注解的条件过滤配置类
      configurations = getConfigurationClassFilter().filter(configurations);

      // 发布 AutoConfigurationImportEvent 事件，通知监听器已处理的自动配置类
      fireAutoConfigurationImportEvents(configurations, exclusions);

      return new AutoConfigurationEntry(configurations, exclusions);
  }
  ```

  这里我们可以看到，`getAutoConfigurationEntry` 方法的主要作用就是获取所有的自动配置类，并且排除掉不需要的自动配置类。同时，按照不同的条件，执行 `@Conditional` 注解的条件过滤配置类。最后，返回一个 `AutoConfigurationEntry` 对象，这个对象包含了所有的自动配置类和排除的自动配置类。

- `@ComponentScan`

  这个注解我们在 IoC 的部分已经详细看过，这里就不再赘述了。

</div>
</details>

能够发现，`@SpringBootApplication` 注解的作用就是将 `@SpringBootConfiguration`、`@EnableAutoConfiguration` 和 `@ComponentScan` 注解结合在一起，简化了 Spring Boot 的配置。

在这个过程中，完成了自动配置类的加载和过滤、包扫描和 Bean 的注册等工作。

### 应用启动

<details>
<summary>点击查看应用启动源码解读</summary>
<div markdown="1">

在使用 `@SpringBootApplication` 注解定义类（例如 `MyApplication` 类）后，我们要想启动它，就必须执行 `SpringApplication.run(MyApplication.class, args)` 方法，这个方法的作用就是启动 Spring Boot 应用。

```java
public static ConfigurableApplicationContext run(Class<?> primarySource, String... args) {
    return run(new Class<?>[] { primarySource }, args);
}

public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
    return new SpringApplication(primarySources).run(args);
}
```

终于能看最关键的 `run()` 方法了：

```java
public ConfigurableApplicationContext run(String... args) {
    Startup startup = Startup.create();

    // 注册关闭钩子，用于优雅地关闭应用
    if (this.properties.isRegisterShutdownHook()) {
        SpringApplication.shutdownHook.enableShutdownHookAddition();
    }

    // 初始化引导上下文，用于在 Spring 应用上下文完全初始化前的早期配置
    DefaultBootstrapContext bootstrapContext = createBootstrapContext();
    ConfigurableApplicationContext context = null;

    // 设置系统属性 java.awt.headless=true，确保应用在无图形界面环境下正常运行
    configureHeadlessProperty();

    // 通过SPI机制加载获取所有 SpringApplicationRunListener 实例
    SpringApplicationRunListeners listeners = getRunListeners(args);
    // 触发 starting 事件，通知监听器应用开始启动
    listeners.starting(bootstrapContext, this.mainApplicationClass);
    
    // 核心启动流程
    try {
        // 封装命令行参数，提供便捷的访问接口，例如 --key=value
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);

        // 加载配置（如 application.properties、环境变量、命令行参数）
        // 触发 environmentPrepared 事件，允许监听器修改环境配置
        ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);

        // 根据配置打印启动Banner
        Banner printedBanner = printBanner(environment);

        // 根据应用类型（Servlet / Reactive）创建具体的上下文实例
        context = createApplicationContext();
        // 设置启动过程追踪器 ApplicationStartup，用于性能监控
        context.setApplicationStartup(this.applicationStartup);

        // 将环境、参数、Banner 等信息绑定到上下文
        // 加载 @SpringBootApplication 标注的类，注册Bean定义
        // 触发 contextPrepared 和 contextLoaded 事件
        prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);

        // 加载 BeanDefinition 并执行 Bean 的生命周期流程
        // 启动内嵌服务器（如 Tomcat）
        refreshContext(context);

        // 执行自定义后置逻辑，这里默认是空实现
        afterRefresh(context, applicationArguments);

        startup.started();
        if (this.properties.isLogStartupInfo()) {
            new StartupInfoLogger(this.mainApplicationClass, environment).logStarted(getApplicationLog(), startup);
        }

        // 触发 started 事件，通知监听器应用已启动
        listeners.started(context, startup.timeTakenToStarted());

        // 执行所有 ApplicationRunner 和 CommandLineRunner 的 run 方法，用于启动后执行自定义逻辑
        callRunners(context, applicationArguments);
    }
    catch (Throwable ex) {
        throw handleRunFailure(context, ex, listeners);
    }
    try {
        // 触发 ready 事件，通知应用已完全就绪
        if (context.isRunning()) {
            listeners.ready(context, startup.ready());
        }
    }
    catch (Throwable ex) {
        throw handleRunFailure(context, ex, null);
    }
    return context;
}
```

整个流程我们其实差不多已经看出来了，我们看一看具体的执行细节：

- `prepareEnvironment`

  ```java
  private ConfigurableEnvironment prepareEnvironment(SpringApplicationRunListeners listeners,
      DefaultBootstrapContext bootstrapContext, ApplicationArguments applicationArguments) {
      // 根据应用类型（Web / 非 Web）创建对应的环境对象
      ConfigurableEnvironment environment = getOrCreateEnvironment();

      // 将命令行参数和环境变量整合到环境中
      configureEnvironment(environment, applicationArguments.getSourceArgs());

      // 将 @ConfigurationProperties 绑定的对象属性附加到环境
      ConfigurationPropertySources.attach(environment);

      // 通知监听器环境已准备就绪
      // 加载 application.yml / application.properties 等配置文件
      listeners.environmentPrepared(bootstrapContext, environment);

      // 确保默认配置优先级最低
      ApplicationInfoPropertySource.moveToEnd(environment);
      DefaultPropertiesPropertySource.moveToEnd(environment);

      Assert.state(!environment.containsProperty("spring.main.environment-prefix"),
          "Environment prefix cannot be set via properties.");

      // 将环境中的属性绑定到 SpringApplication 实例
      bindToSpringApplication(environment);

      // 确保环境类型与应用类型一致
      if (!this.isCustomEnvironment) {
          EnvironmentConverter environmentConverter = new EnvironmentConverter(getClassLoader());
          environment = environmentConverter.convertEnvironmentIfNecessary(environment, deduceEnvironmentClass());
      }
      ConfigurationPropertySources.attach(environment);
      return environment;
  }
  ```

  这个方法的主要作用就是加载配置文件，并绑定命令行参数和环境变量到环境中。

  > 举个例子，我们运行：
  >
  > ```shell
  > java -jar app.jar --spring.profiles.active=prod --server.port=8080
  > ```
  >
  > 这里会
  >
  > 1. `--spring.profiles.active=prod` 会激活 `application-prod.yml` 配置文件
  > 2. `@ConfigurationProperties` 注解会将 `server.port` 的值绑定到 `ServerProperties` 类中
  > 3. 然后会加载 `application-prod.yml` 中的配置
  > 4. 最后会将 `server.port` 属性覆盖掉 `application-prod.yml` 中的配置

- `prepareContext`

  ```java
  private void prepareContext(DefaultBootstrapContext bootstrapContext, ConfigurableApplicationContext context,
      ConfigurableEnvironment environment, SpringApplicationRunListeners listeners,
      ApplicationArguments applicationArguments, Banner printedBanner) {
      // 将已准备好的环境绑定到应用上下文
      context.setEnvironment(environment);

      // 设置资源加载器、配置类型转换服务、注册默认的 BeanNameGenerator
      postProcessApplicationContext(context);

      // AOT 编译
      addAotGeneratedInitializerIfNecessary(this.initializers);

      // 执行所有注册的 ApplicationContextInitializer 实现类
      applyInitializers(context);

      // 发布 ApplicationContextInitializedEvent 事件，通知监听器上下文已初步就绪
      listeners.contextPrepared(context);

      bootstrapContext.close(context);

      if (this.properties.isLogStartupInfo()) {
          logStartupInfo(context.getParent() == null);
          logStartupInfo(context);
          logStartupProfileInfo(context);
      }

      // 注册 springApplicationArguments，允许通过 @Autowired 注入命令行参数
      ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
      beanFactory.registerSingleton("springApplicationArguments", applicationArguments);

      if (printedBanner != null) {
          beanFactory.registerSingleton("springBootBanner", printedBanner);
      }

      // 允许循环引用​，允许 Bean 定义覆盖
      if (beanFactory instanceof AbstractAutowireCapableBeanFactory autowireCapableBeanFactory) {
          autowireCapableBeanFactory.setAllowCircularReferences(this.properties.isAllowCircularReferences());
          if (beanFactory instanceof DefaultListableBeanFactory listableBeanFactory) {
              listableBeanFactory.setAllowBeanDefinitionOverriding(this.properties.isAllowBeanDefinitionOverriding());
          }
      }

      // 处理懒加载
      if (this.properties.isLazyInitialization()) {
          context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor());
      }

      // 防止应用在空闲时被意外关闭
      if (this.properties.isKeepAlive()) {
          context.addApplicationListener(new KeepAlive());
      }

      // 确保 application.properties 等配置源的优先级正确
      context.addBeanFactoryPostProcessor(new PropertySourceOrderingBeanFactoryPostProcessor(context));

      // 加载标注 @SpringBootApplication 的类和其他配置源
      if (!AotDetector.useGeneratedArtifacts()) {
          Set<Object> sources = getAllSources();
          Assert.notEmpty(sources, "Sources must not be empty");
          load(context, sources.toArray(new Object[0]));
      }

      // 发布 ApplicationPreparedEvent 事件，通知监听器上下文已完全加载
      listeners.contextLoaded(context);
  }
  ```

  这个方法的主要作用就是将环境绑定到上下文，并执行所有的 `ApplicationContextInitializer` 实现类。

- `refreshContext`

  ```java
  private void refreshContext(ConfigurableApplicationContext context) {
      if (this.properties.isRegisterShutdownHook()) {
          shutdownHook.registerApplicationContext(context);
      }
      refresh(context);
  }
  ```

  这里的 `refresh` 方法就是 `AbstractApplicationContext` 中的 `refresh` 方法。我们在 IoC 部分也详细看过，不再赘述。

</div>
</details>

这里做的主要工作就是将默认配置、文件配置、命令行参数、环境变量等加载并应用，最后执行 `refresh()` 方法来刷新上下文，从而实例化并初始化所有的 Bean。

### Tomcat 加载

到这里，我们依然有点懵，Tomcat 是怎么启动的呢？其实就和 `refreshContext` 方法相关。

还记得我们之前讨论的 ApplicationContext 的继承关系吗？`AbstractApplicationContext` 是一个抽象类，它有一个子类 `GenericApplicationContext`。再往下继承还有 `GenericWebApplicationContext`，这个类就是 Spring Boot 中的 Web 应用上下文。再往下看还有 `ServletWebServerApplicationContext`，这个类就是 Spring Boot 中的 Servlet Web 应用上下文。这个类的作用就是创建一个内嵌的 Servlet 容器。

这个类覆写了 `AbstractApplicationContext` 中空着没实现的 `onRefresh()` 方法。

```java
@Override
protected void onRefresh() {
    super.onRefresh();
    try {
        createWebServer();
    }
    catch (Throwable ex) {
        throw new ApplicationContextException("Unable to start web server", ex);
    }
}
```

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

这个方法的作用就是创建一个内嵌的 Servlet 容器。

<details>
<summary>点击查看 Tomcat 加载源码解读</summary>
<div markdown="1">

我们来看其中的 `createWebServer()` 方法：

```java
private void createWebServer() {
    WebServer webServer = this.webServer;
    // 通过 Spring 容器获取自动配置的 ServletWebServerFactory 实例
    ServletContext servletContext = getServletContext();

    // 首次启动内嵌的 Web 服务器
    if (webServer == null && servletContext == null) {
        StartupStep createWebServer = getApplicationStartup().start("spring.boot.webserver.create");

        ServletWebServerFactory factory = getWebServerFactory();
        createWebServer.tag("factory", factory.getClass().toString());
        
        // 通过工厂创建 Web 服务器，并传入一个 ServletContextInitializer 用于初始化 Servlet 组件
        this.webServer = factory.getWebServer(getSelfInitializer());
        createWebServer.end();

        // 将 Web 服务器的生命周期与 Spring 容器的生命周期绑定
        getBeanFactory().registerSingleton("webServerGracefulShutdown",
            new WebServerGracefulShutdownLifecycle(this.webServer));
        getBeanFactory().registerSingleton("webServerStartStop",
            new WebServerStartStopLifecycle(this, this.webServer));
    }
    else if (servletContext != null) {
        try {
            // 当应用部署到外部 Servlet 容器时，直接初始化 Servlet 上下文
            getSelfInitializer().onStartup(servletContext);
        }
        catch (ServletException ex) {
            throw new ApplicationContextException("Cannot initialize servlet context", ex);
        }
    }
    initPropertySources();
}
```

这个方法的主要作用就是创建一个内嵌的 Web 服务器，并将其与 Spring 容器的生命周期绑定。

`getWebServer()` 方法有多种实现，最常用的就是 `TomcatServletWebServerFactory` 类中的：

```java
@Override
public WebServer getWebServer(ServletContextInitializer... initializers) {
    // MBean 用于 JMX 监控，若不需要监控 Tomcat 内部状态，可禁用以节省资源
    if (this.disableMBeanRegistry) {
        Registry.disableRegistry();
    }

    // 初始化 Tomcat 对象，这是 Apache Tomcat 内嵌服务器的入口
    Tomcat tomcat = new Tomcat();
    // 设置 Tomcat 的工作目录，用于存放临时文件、日志等
    File baseDir = (this.baseDirectory != null) ? this.baseDirectory : createTempDir("tomcat");
    tomcat.setBaseDir(baseDir.getAbsolutePath());

    // 为 Tomcat 的 Server 组件添加生命周期监听器
    for (LifecycleListener listener : this.serverLifecycleListeners) {
        tomcat.getServer().addLifecycleListener(listener);
    }

    // 配置主连接器
    Connector connector = new Connector(this.protocol);
    connector.setThrowOnFailure(true);
    tomcat.getService().addConnector(connector);
    customizeConnector(connector);
    tomcat.setConnector(connector);

    // 将连接器关联到 Tomcat 的共享线程池，优化请求处理效率
    registerConnectorExecutor(tomcat, connector);

    // 配置 Tomcat
    tomcat.getHost().setAutoDeploy(false);
    configureEngine(tomcat.getEngine());

    // 支持多个连接器，如同时监听 HTTP 和 HTTPS
    for (Connector additionalConnector : this.additionalTomcatConnectors) {
        tomcat.getService().addConnector(additionalConnector);
        registerConnectorExecutor(tomcat, additionalConnector);
    }

    // 配置 Tomcat 的 Context
    // 注册 ServletContextInitializer、设置上下文路径、​加载静态资源
    prepareContext(tomcat.getHost(), initializers);

    return getTomcatWebServer(tomcat);
}
```

这个方法的主要作用就是创建一个 Tomcat 对象，并配置 Tomcat 的连接器、线程池、上下文等，最后将其与 Spring 集成。

</div>
</details>
