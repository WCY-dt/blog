---
layout: post
title:  "部署一个 Docker Registry"
date:   2024-12-15 22:00:00 +0800
categories: 分布式
tags: docker registry mirror
summary: "Docker Hub 被墙后，使用 Docker 成了一件麻烦事。我实在受不了，只好自行搭建了一个 Docker Registry 来作为镜像仓库。这个 Registry 支持了 Docker Hub 的镜像拉取、私有镜像存储、用户认证等功能。"
comments: true
copyrights: 原创
render_with_liquid: false
---

Docker Hub 被墙后，使用 Docker 成了一件麻烦事。我实在受不了，只好自行搭建了一个 Docker Registry 来作为镜像仓库。这个 Registry 支持了 Docker Hub 的镜像拉取、私有镜像存储、用户认证等功能。

先看效果：

![Docker Registry 最终效果](/assets/post/images/docker_registry1.webp)

可以看到，基本功能是没有问题的，只不过下载速度略慢。考虑到我的服务器远在大洋彼岸的 LA，这速度也算能够接受。

下面，我们来一步步部署这个 Docker Registry。

> 注意，文中所有的 `<DOMAIN NAME>` 都需要替换为您实际使用的域名。

## 基础配置

首先创建目录结构：

```shell
mkdir -p /opt/docker-registry/{config,ssl,auth,data,logs,scripts}
cd /opt/docker-registry
```

目录结构应当如下所示：

```plaintext
/opt/docker-registry/
├── config/
│   └── registry.yml
├── ssl/
│   ├── fullchain.pem
│   └── privkey.pem
├── auth/
│   └── htpasswd
├── data/
├── logs/
├── scripts/
│   ├── monitor.sh
│   ├── cleanup.sh
│   └── renew-cert.sh
├── docker-compose.yml
└── nginx.conf
```

然后安装 Docker 和 Docker Compose：

```shell
apt-get install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker $USER
systemctl start docker
systemctl enable docker
docker version
apt install -y docker-compose apache2-utils
docker-compose version
```

接下来创建用户认证文件。首先生成用户密码（请替换 `<username>` 为您想要的用户名）：

```shell
# 创建第一个用户
htpasswd -Bc /opt/docker-registry/auth/htpasswd <username>
# 系统会提示输入密码，输入后会自动加密存储

# 添加更多用户
htpasswd -B /opt/docker-registry/auth/htpasswd <username>
# 同样会提示输入该用户的密码
```

`/opt/docker-registry/config/registry.yml` 中存储 Docker Registry 的配置：

```yaml
version: 0.1
log:
  accesslog:
    disabled: false
  level: info
  formatter: text
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
  delete:
    enabled: true
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
    Access-Control-Allow-Origin: ['*']
    Access-Control-Allow-Methods: ['HEAD', 'GET', 'OPTIONS', 'DELETE']
    Access-Control-Allow-Headers: ['Authorization', 'Accept', 'Cache-Control']
  timeout:
    read: 300s
    write: 300s
    idle: 300s
auth:
  htpasswd:
    realm: basic-realm
    path: /auth/htpasswd
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
proxy:
  remoteurl: https://registry-1.docker.io
  ttl: 168h
```

`/opt/docker-registry/nginx.conf` 中存储 Nginx 的配置：

```conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 0;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;

    upstream docker-registry {
        server registry:5000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name <DOMAIN NAME>;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name <DOMAIN NAME>;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        add_header Strict-Transport-Security "max-age=63072000" always;

        location /v2/ {
            auth_basic "Docker Registry";
            auth_basic_user_file /etc/nginx/auth/htpasswd;
            
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Cache-Control,Content-Type' always;

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Cache-Control,Content-Type';
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            proxy_pass http://docker-registry;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_read_timeout 900;
            proxy_connect_timeout 300;
            proxy_send_timeout 300;
            
            proxy_buffering off;
            proxy_request_buffering off;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

`/opt/docker-registry/docker-compose.yml` 中存储 Docker Compose 的配置：

```yaml
version: '3.8'

services:
  registry:
    image: registry:2.8
    container_name: docker-registry
    restart: unless-stopped
    ports:
      - "127.0.0.1:5000:5000"
    volumes:
      - ./config/registry.yml:/etc/docker/registry/config.yml:ro
      - ./auth:/auth:ro
      - ./data:/var/lib/registry
      - ./logs:/var/log
    environment:
      - REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY=/var/lib/registry
      - REGISTRY_LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/v2/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - registry-network

  nginx:
    image: nginx:1.25-alpine
    container_name: registry-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./auth:/etc/nginx/auth:ro
      - ./logs:/var/log/nginx
    depends_on:
      - registry
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - registry-network

volumes:
  registry-data:
    driver: local

networks:
  registry-network:
    driver: bridge
```

接下来，安装 Certbot 以获取 SSL 证书：

```shell
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot
certbot certonly --standalone -d <DOMAIN NAME>
cp /etc/letsencrypt/live/<DOMAIN NAME>/fullchain.pem /opt/docker-registry/ssl/
cp /etc/letsencrypt/live/<DOMAIN NAME>/privkey.pem /opt/docker-registry/ssl/
chmod 644 /opt/docker-registry/ssl/fullchain.pem
chmod 600 /opt/docker-registry/ssl/privkey.pem
```

启动 Docker Registry 和 Nginx：

```shell
cd /opt/docker-registry
docker-compose up -d
```

## 定时任务

为了自动续期证书，我们可以创建一个脚本 `/opt/docker-registry/scripts/renew-cert.sh`：

```shell
#!/bin/bash
DOMAIN="<DOMAIN NAME>"
DOCKER_DIR="/opt/docker-registry"
LOG_FILE="$DOCKER_DIR/logs/cert-renewal.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] 开始证书续期检查..." >> $LOG_FILE

# 续期证书
certbot renew --quiet

# 检查是否有新证书
if [ /etc/letsencrypt/live/$DOMAIN/fullchain.pem -nt $DOCKER_DIR/ssl/fullchain.pem ]; then
    echo "[$DATE] 发现新证书，正在更新..." >> $LOG_FILE
    
    # 复制新证书
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $DOCKER_DIR/ssl/
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $DOCKER_DIR/ssl/
    
    # 重启nginx容器
    cd $DOCKER_DIR
    docker-compose restart nginx
    
    echo "[$DATE] 证书更新完成，nginx已重启" >> $LOG_FILE
else
    echo "[$DATE] 证书无需更新" >> $LOG_FILE
fi
```

再搞一个用来监控的脚本 `/opt/docker-registry/scripts/monitor.sh`：

```shell
#!/bin/bash
DOCKER_DIR="/opt/docker-registry"
LOG_FILE="$DOCKER_DIR/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
DOMAIN="<DOMAIN NAME>"

# 检查容器状态
check_containers() {
    echo "[$DATE] 检查容器状态..." >> $LOG_FILE
    
    # 检查Registry容器
    if ! docker ps --filter "name=docker-registry" --filter "status=running" | grep -q docker-registry; then
        echo "[$DATE] ERROR: Registry容器未运行，正在重启..." >> $LOG_FILE
        cd $DOCKER_DIR
        docker-compose restart registry
    else
        echo "[$DATE] Registry容器运行正常" >> $LOG_FILE
    fi
    
    # 检查Nginx容器
    if ! docker ps --filter "name=registry-nginx" --filter "status=running" | grep -q registry-nginx; then
        echo "[$DATE] ERROR: Nginx容器未运行，正在重启..." >> $LOG_FILE
        cd $DOCKER_DIR
        docker-compose restart nginx
    else
        echo "[$DATE] Nginx容器运行正常" >> $LOG_FILE
    fi
}

# 检查磁盘空间
check_disk_space() {
    USAGE=$(df $DOCKER_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "[$DATE] 磁盘使用率: ${USAGE}%" >> $LOG_FILE
    
    if [ $USAGE -gt 80 ]; then
        echo "[$DATE] WARNING: 磁盘空间不足，开始清理..." >> $LOG_FILE
        # 执行垃圾收集
        docker exec docker-registry registry garbage-collect /etc/docker/registry/config.yml >> $LOG_FILE 2>&1
        echo "[$DATE] 清理完成" >> $LOG_FILE
    fi
}

# 检查服务响应
check_service_response() {
    # 检查HTTP响应
    if curl -s -k -o /dev/null -w "%{http_code}" https://$DOMAIN/health | grep -q "200"; then
        echo "[$DATE] HTTPS服务响应正常" >> $LOG_FILE
    else
        echo "[$DATE] ERROR: HTTPS服务无响应，重启服务..." >> $LOG_FILE
        cd $DOCKER_DIR
        docker-compose restart
    fi
    
    # 检查Docker Registry API
    if curl -s -k -o /dev/null -w "%{http_code}" https://$DOMAIN/v2/ | grep -q "200"; then
        echo "[$DATE] Registry API响应正常" >> $LOG_FILE
    else
        echo "[$DATE] ERROR: Registry API无响应" >> $LOG_FILE
    fi
}

# 检查内存使用
check_memory_usage() {
    # Registry容器内存使用
    REGISTRY_MEM=$(docker stats docker-registry --no-stream --format "{{.MemPerc}}" | sed 's/%//')
    echo "[$DATE] Registry内存使用: ${REGISTRY_MEM}%" >> $LOG_FILE
    
    # Nginx容器内存使用
    NGINX_MEM=$(docker stats registry-nginx --no-stream --format "{{.MemPerc}}" | sed 's/%//')
    echo "[$DATE] Nginx内存使用: ${NGINX_MEM}%" >> $LOG_FILE
    
    # 如果内存使用过高，记录警告
    if (( $(echo "$REGISTRY_MEM > 80" | bc -l) )); then
        echo "[$DATE] WARNING: Registry内存使用过高" >> $LOG_FILE
    fi
}

# 执行所有检查
main() {
    echo "[$DATE] ========== 监控开始 ==========" >> $LOG_FILE
    check_containers
    check_disk_space
    check_service_response
    check_memory_usage
    echo "[$DATE] ========== 监控结束 ==========" >> $LOG_FILE
    echo "" >> $LOG_FILE
}

main
```

为了防止磁盘空间不足，我们可以创建一个清理脚本 `/opt/docker-registry/scripts/cleanup.sh`：

```shell
#!/bin/bash
DOCKER_DIR="/opt/docker-registry"
LOG_FILE="$DOCKER_DIR/logs/cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] ========== 开始清理 ==========" >> $LOG_FILE

# 清理Registry存储
echo "[$DATE] 清理Registry存储..." >> $LOG_FILE
docker exec docker-registry registry garbage-collect /etc/docker/registry/config.yml >> $LOG_FILE 2>&1

# 清理Docker系统
echo "[$DATE] 清理Docker系统..." >> $LOG_FILE
docker system prune -f >> $LOG_FILE 2>&1

# 清理日志文件（保留最近7天）
echo "[$DATE] 清理旧日志文件..." >> $LOG_FILE
find $DOCKER_DIR/logs -name "*.log" -mtime +7 -delete

# 清理Nginx日志
echo "[$DATE] 清理Nginx日志..." >> $LOG_FILE
docker exec registry-nginx sh -c "echo '' > /var/log/nginx/access.log"
docker exec registry-nginx sh -c "echo '' > /var/log/nginx/error.log"

# 显示清理后的磁盘使用情况
USAGE_AFTER=$(df $DOCKER_DIR | tail -1 | awk '{print $5}')
echo "[$DATE] 清理完成，当前磁盘使用率: $USAGE_AFTER" >> $LOG_FILE
echo "[$DATE] ========== 清理结束 ==========" >> $LOG_FILE
echo "" >> $LOG_FILE
```

再启动定时任务：

```shell
chmod +x /opt/docker-registry/scripts/*.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/docker-registry/scripts/monitor.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * 0 /opt/docker-registry/scripts/cleanup.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 1 /opt/docker-registry/scripts/renew-cert.sh") | crontab -
```

## 其它配置

最后，搭建防火墙以保护 Docker Registry：

```shell
apt install -y ufw
# 设置默认策略
ufw default deny incoming
ufw default allow outgoing
# 允许SSH
ufw allow ssh
ufw allow 22/tcp
# 允许HTTP和HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
# 允许Registry端口（仅本地）
ufw allow from 127.0.0.1 to any port 5000
ufw --force enable
ufw status verbose
```

创建系统优化配置文件 `/etc/sysctl.d/99-docker-registry.conf`：

```conf
# 网络优化
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_congestion_control = bbr

# 文件系统优化
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288

# 虚拟内存优化
vm.swappiness = 10
vm.vfs_cache_pressure = 50
```

然后应用这些优化：

```shell
sysctl -p /etc/sysctl.d/99-docker-registry.conf
```

Docker 也需要一些优化配置，可以创建 `/etc/docker/daemon.json` 文件：

```json
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "127.0.0.1:9323",
  "log-level": "warn"
}
```

## 使用

在部署完成后，您可以通过以下命令来验证 Docker Registry 是否正常运行：

```shell
docker-compose ps
curl -k -u <USERNAME>:<PASSWORD> https://<DOMAIN NAME>/health
curl -k -u <USERNAME>:<PASSWORD> https://<DOMAIN NAME>/v2/
```

要想在本地拉取镜像，可以配置 Docker 的 daemon.json 文件，添加 registry-mirrors 选项：

```json
{
  "registry-mirrors": [
    "https://<DOMAIN NAME>"
  ],
  "insecure-registries": [],
  "max-concurrent-downloads": 6,
  "max-concurrent-uploads": 5,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

不过，你需要先登陆到您的私有 Registry：

```shell
docker login <DOMAIN NAME>
# 输入您在 htpasswd 文件中创建的用户名和密码
```

你可以使用该私有 Registry 来执行以下操作：

- ***拉取 Docker Hub 上的镜像***：

  ```shell
  docker pull <IMAGE NAME>:<TAG>
  ```

- ***标记和推送镜像***

  ```shell
  docker tag <IMAGE NAME>:<TAG> <DOMAIN NAME>/<IMAGE NAME>:<TAG>
  docker push <DOMAIN NAME>/<IMAGE NAME>:<TAG>
  ```

- ***拉取私有镜像***

  ```shell
  docker pull <DOMAIN NAME>/<IMAGE NAME>:<TAG>
  ```

- ***查看仓库中的镜像***

  ```shell
  curl -u <USERNAME>:<PASSWORD> https://<DOMAIN NAME>/v2/_catalog
  curl -u <USERNAME>:<PASSWORD> https://<DOMAIN NAME>/v2/<IMAGE NAME>/tags/list
  ```

- ***删除镜像***

  ```shell
  curl -I -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
    -u <USERNAME>:<PASSWORD> \
    https://<DOMAIN NAME>/v2/<IMAGE NAME>/manifests/latest

  # 使用 digest 删除镜像
  curl -X DELETE -u <USERNAME>:<PASSWORD> \
    https://<DOMAIN NAME>/v2/<IMAGE NAME>/manifests/<digest>
  ```

还可以随时添加或删除用户：

```shell
# 添加新用户
htpasswd -B /opt/docker-registry/auth/htpasswd <USERNAME>
# 删除用户
htpasswd -D /opt/docker-registry/auth/htpasswd <USERNAME>
# 更改用户密码
htpasswd -B /opt/docker-registry/auth/htpasswd <USERNAME>
# 查看所有用户
cat /opt/docker-registry/auth/htpasswd
```

修改用户后，需要重启 nginx 容器以生效：

```shell
cd /opt/docker-registry
docker-compose restart nginx
```

至此，我们再也不用担心 Docker Hub 被墙的问题了。
