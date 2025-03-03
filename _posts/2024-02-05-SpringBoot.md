---
layout: post
title:  "Spring Boot"
date:   2024-02-05 00:00:00 +0800
categories: 编程
tags: java spring
series: 深入 Spring 源码
series_index: 5
comments: true
copyrights: 原创
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

## MyBatis

### 为什么需要 MyBatis

在实际开发中，我们经常会遇到这样的情况：需要操作数据库，但是 JDBC 太底层，Spring JDBC 太繁琐。MyBatis 就是为了解决这些问题而生的。

MyBatis 是一个持久层框架，它将 SQL 语句和 Java 对象映射起来，使得操作数据库更加方便。

### MyBatis 使用

MyBatis 使用 XML 文件或者注解来配置 SQL 语句。我们这里只介绍注解配置方法。

首先，我们需要在配置文件中配置数据源：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/book
    username: root
    password: password
```

然后，我们需要配置 MyBatis：

```java
@Configuration
@MapperScan("com.example.mapper")
public class MyBatisConfig {
  @Bean
  public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
    SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
    factoryBean.setDataSource(dataSource);
    return factoryBean.getObject();
  }
}
```

然后，我们需要定义一个映射器接口：

```java
@Mapper
public interface BookMapper {
  @Select("SELECT * FROM book WHERE id = #{id}")
  Book getBookById(int id);

  @Insert("INSERT INTO book VALUES(#{id}, #{title}, #{author})")
  void addBook(Book book);
}
```

这个接口中定义了两个方法，一个用于查询，一个用于插入。它们分别使用了 `@Select` 和 `@Insert` 注解。类似的，我们还可以使用 `@Update`、`@Delete` 注解。注解中的 SQL 语句使用 `#{}` 或者 `${}` 来引用参数。值得注意的是，`#{}` 使用的是占位符，通过预编译的方式来防止 SQL 注入，而 `${}` 直接拼接参数，容易导致 SQL 注入。

然后，我们就可以使用映射器接口来操作数据库：

```java
@Service
public class BookService {
  @Autowired
  private BookMapper bookMapper;

  public Book getBookById(int id) {
    return bookMapper.getBookById(id);
  }

  public void addBook(Book book) {
    bookMapper.addBook(book);
  }
}
```

这样，我们就实现了一个简单的 MyBatis。

### MyBatis 高级用法

MyBatis 还有很多高级用法，例如：

- **动态 SQL**

  ```java
  @SelectProvider(type = BookSqlProvider.class, method = "getBook")
  Book getBook(int id, String title);
  ```

  ```java
  public class BookSqlProvider {
    public String getBook(int id, String title) {
      return new SQL() {% raw %}{{{% endraw %}
        SELECT("*");
        FROM("book");
        if (id != 0) {
          WHERE("id = #{id}");
        }
        if (title != null) {
          WHERE("title = #{title}");
        }
      {% raw %}}}{% endraw %}.toString();
    }
  }
  ```

  它可以支持 `if`、`choose`、`when`、`otherwise`、`trim`、`where`、`set`、`foreach` 等标签。

- **批量操作**

  ```java
  @InsertProvider(type = BookSqlProvider.class, method = "addBooks")
  void addBooks(List<Book> books);
  ```

  ```java
  public class BookSqlProvider {
    public String addBooks(Map<String, List<Book>> map) {
      List<Book> books = map.get("books");
      StringBuilder sql = new StringBuilder();
      sql.append("INSERT INTO book VALUES ");
      for (Book book : books) {
        sql.append("(").append(book.getId()).append(", '").append(book.getTitle()).append("', '").append(book.getAuthor()).append("'), ");
      }
      sql.delete(sql.length() - 2, sql.length());
      return sql.toString();
    }
  }
  ```

- **缓存**

  ```java
  @CacheNamespace
  public interface BookMapper {
    @Select("SELECT * FROM book WHERE id = #{id}")
    @Options(useCache = true)
    Book getBookById(int id);
  }
  ```

  它可以支持 `@CacheNamespace`、`@Options` 注解。

  当我们添加了 `@CacheNamespace` 注解后，MyBatis 会自动缓存查询结果，当我们再次查询相同的数据时，MyBatis 会直接从缓存中获取数据，而不会再次查询数据库。

### MyBatis Plus

MyBatis Plus 是 MyBatis 的增强工具，它提供了很多增强功能，例如：

- **代码生成器**

  MyBatis Plus 提供了代码生成器，可以根据数据库表生成实体类、映射器接口、XML 文件。

  ```java
  public class CodeGenerator {
    public static void main(String[] args) {
      AutoGenerator generator = new AutoGenerator();
      generator.setGlobalConfig(new GlobalConfig().setOutputDir(System.getProperty("user.dir") + "/src/main/java"));
      generator.setDataSource(new DataSourceConfig().setUrl("jdbc:mysql://localhost:3306/book").setUsername("root").setPassword("password"));
      generator.setPackageInfo(new PackageConfig().setParent("com.example").setModuleName("book"));
      generator.setStrategy(new StrategyConfig().setInclude("book"));
      generator.execute();
    }
  }
  ```

  运行这个代码，就可以生成实体类、映射器接口、XML 文件。

- **分页插件**

  MyBatis Plus 提供了分页插件，可以方便地进行分页查询。

  ```java
  @GetMapping("/book")
  public Page<Book> list(@RequestParam("page") int page, @RequestParam("size") int size) {
    return bookService.listBooks(page, size);
  }
  ```

  ```java
  @Service
  public class BookService {
    @Autowired
    private BookMapper bookMapper;

    public Page<Book> listBooks(int page, int size) {
      return bookMapper.selectPage(new Page<>(page, size), null);
    }
  }
  ```

  这里，我们使用了 `Page` 类来表示分页查询结果。MyBatis Plus 会自动查询总数，并返回分页查询结果。

- **逻辑删除**

  MyBatis Plus 提供了逻辑删除功能，可以方便地进行逻辑删除。

  ```java
  @TableLogic
  private Integer deleted;
  ```

  ```java
  @Delete("DELETE FROM book WHERE id = #{id}")
  void deleteBookById(int id);
  ```

  ```java
  @Update("UPDATE book SET deleted = 1 WHERE id = #{id}")
  void deleteBookById(int id);
  ```

  这里，我们使用了 `@TableLogic` 注解来表示逻辑删除字段。MyBatis Plus 会自动将逻辑删除字段加入到查询条件中。

- **多租户**

  MyBatis Plus 提供了多租户功能，可以方便地进行多租户查询。

  ```java
  @MultiTenant
  private String tenantId;
  ```

  ```java
  @Select("SELECT * FROM book WHERE tenant_id = #{tenantId}")
  List<Book> listBooks(String tenantId);
  ```

  ```java
  @InterceptorIgnore(tenantLine = "true")
  @Select("SELECT * FROM book")
  List<Book> listBooks();
  ```

  这里，我们使用了 `@MultiTenant` 注解来表示多租户字段。MyBatis Plus 会自动将多租户字段加入到查询条件中。

## Spring Security

### 为什么需要 Spring Security

在实际开发中，我们经常会遇到这样的情况：需要对用户进行认证、授权。如果没有框架，我们需要自己处理这些事情，这样会导致代码冗余、耦合度高、不利于维护。Spring Security 就是为了解决这些问题而生的。

Spring Security 是一个安全框架，它提供了认证、授权、攻击防护等功能，使得应用程序更加安全。

### Spring Security 使用

Spring Security 使用 Java 配置来配置项目：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
  @Autowired
  private UserService userService;

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userService).passwordEncoder(new BCryptPasswordEncoder());
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
      .antMatchers("/login").permitAll()
      .anyRequest().authenticated()
      .and()
      .formLogin().loginPage("/login").defaultSuccessUrl("/").permitAll()
      .and()
      .logout().permitAll();
  }
}
```

这个配置类继承了 `WebSecurityConfigurerAdapter` 类，它重写了 `configure` 方法，用于配置认证和授权。

`configure(AuthenticationManagerBuilder auth)` 方法用于配置认证，我们可以使用 `auth.userDetailsService()` 方法来配置用户认证服务，使用 `auth.inMemoryAuthentication()` 方法来配置内存用户认证服务。

`configure(HttpSecurity http)` 方法用于配置授权，我们可以使用 `http.authorizeRequests()` 方法来配置请求授权，使用 `http.formLogin()` 方法来配置表单登录，使用 `http.logout()` 方法来配置退出登录。
