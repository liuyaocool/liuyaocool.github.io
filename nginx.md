# 特殊字符

```
http://www.fhdq.net/
← ↑ → ↓ ↖ ↙ ↗ ↘ ↔ ↕ ↯ ↰ ↱ ↲ ↳ ⏎
﹢﹣×÷±/=≌∽≦≧≒﹤﹥≈≡≠=≤≥<>≮≯∷∶∫∮∝∞∧∨∑∏∪∩∈∵∴⊥∥∠⌒⊙√∟⊿㏒㏑%‰⅟½⅓⅕⅙⅛⅔⅖⅚⅜¾⅗⅝⅞⅘≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩⊰⊱⋛⋚∫∬∭∮∯∰∱∲∳%℅‰‱øØπ

解压缩命令 tar -zxvf xxx.tar.gz

```

# 版本区别

## nginx.org 免费版

## nginx.com 商业版

## openresty.org

Lua 二次开发

## tengine.taobao.org

C++ 二次开发

## lua

# mac安装

```
brew install nginx
# 若出现 下载慢的情况，可以去mirrors.aliyun.com 配置阿里镜像

# 配置文件位置
cd /usr/local/etc/nginx

# 日志文件位置
cd /usr/local/var/log/nginx
```

# 安装

1. nginx.org 下载

   1. Linux 使用wget 下载

2. 解压源码：tar -zxvf nginx*

3. cd 目录：./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_stub_status_module

   1. --with-http_stub_status_module ：上报自身状态 如k8s管理nginx
   2. --with-http_ssl_module ：ssl模块 需要上一模块
   3. ./nginx -V 可查看安装的模块

4. 如果 报错，为缺少C库

   1. C compiler cc is not found

      apt-get install build-essential

   2. pcre

      centos： yum install -y pcre pcre-devel

      ubuntu： apt-get install libpcre3 libpcre3-dev -y

      macos： brew install pcre

      ```
      ./configure: error: the HTTP rewrite module requires the PCRE library.
      You can either disable the module by using --without-http_rewrite_module
      option, or install the PCRE library into the system, or build the PCRE library
      statically from the source with nginx by using --with-pcre=<path> option.
      ```

   3. openssl

      ununtu： sudo apt-get install openssl libssl-dev -y

      ？？macos： sbrew search openssl --查看搜索到的--> brew install openssl@3

      ```
      ./configure: error: SSL modules require the OpenSSL library.
      You can either do not enable the modules, or install the OpenSSL library
      into the system, or build the OpenSSL library statically from the source
      with nginx by using --with-openssl=<path> option.
      ```

   4. zlib

      centos： yum install -y zlib zlib-devel

      ubuntu： apt-get install zlib1g-dev -y

      ```
      ./configure: error: the HTTP gzip module requires the zlib library.
      ...
      ```

5. 执行 make

6. 执行 make install

7. 普通用户加权限：`chmod u+s ./nginx` 

8. 普通用户use 80: `doas setcap cap_net_bind_service=+eip xxx/sbin/nginx`

7. 启动：

   1. cd /usr/local/nginx
   2. cd sbin
   3. ./nginx
      1. -c    指定配置文件

8. 停止：nginx -s stop

9. 访问不通，关闭防火墙

   ```sh
   # 关闭防火墙
   systemctl stop firewalld.service
   # 禁止开机启动防火墙
   systemctl disable firewalld.service
   ```

10. 做成服务 nginx.service 

    1. ??? centos8找教程

11. 添加模块，如：3操作没有加两个--with

    1. 源码目录重新编译：./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_stub_status_module
    2. 执行make
    3. 备份  /user/local/nginx/sbin/nginx
    4. 找到objs目录，将nginx可执行文件覆盖 /user/local/nginx/sbin/nginx
    5. 模块添加完成

# 代理

## 正向代理 

用户 -> nginx -> 服务器

## 反向代理 

用户 <- nginx <- 服务器

# 域名

域：.com 

名：baidu

查看域名信息：whois.juming.com

# nginx.conf

**注： 每一行的结尾要用“;”，不然报错**

## web服务器

```
http {
    server{
        listen 80;
        server_name vvv.liuyao61.shop; # 域名，靠request headers 中的Host匹配

        location / {  # 定位资源:本地磁盘目录 -> URL对应关系
            root vvv; # 配置路径
            index index.html; # 配置主页
        }
        
         location =/xxx {  # 绝对匹配
            root vvv; # 配置路径
            index index.html; # 配置主页
        }
    }
    server{
        listen 80;
        server_name local.liuyao61.shop; 

        location / { 
            root local; 
            index index.html; 
        }
    }
}
```

## 反向代理

```
http {
    server{
        listen 80;
        server_name localhost; # 域名，靠request headers 中的Host匹配

        location / {
            proxy_pass http://localhost:8080;  # 反向代理代理
        }
    }
}
```



## 负载

```
http {
    upstream lb { # 负载
    	# weight 权重
    	server localhost:88 weight=1;
	    server localhost:99 weight=9;
    }
    
    server{
        listen 80;
        server_name localhost; # 域名，靠request headers 中的Host匹配

        location / {
            proxy_pass http://lb;  # 负载
        }
    }
}
```

## HTTPS

需要在编译时安装ssl模块 见安装

阿里云、腾讯云 申请ssl证书

```
server {
    listen       443 ssl;
    server_name  localhost;

    ssl_certificate      cert.pem;
    ssl_certificate_key  cert.key;

#    ssl_session_cache    shared:SSL:1m;
#    ssl_session_timeout  5m;

#    ssl_ciphers  HIGH:!aNULL:!MD5;
#    ssl_prefer_server_ciphers  on;

    location / {
    root   html;
    index  index.html index.htm;
    }
}
```

http 自动跳转https 需要在首页手动跳转

## 动静分离

```
location /css {
	root /usr/local/nginx/static;
}
location /js {
	root /usr/local/nginx/static;
}
```



```
location ~*/(css|js|images) {
	root /usr/local/nginx/static; # -> /usr/local/nginx/static/css 自动拼装
}
```

```
location /css {
	alias /usr/local/nginx/static/css; # -> 不自动拼装location
}
```

## URL重写

```
rewrite ^$ /
```



# openresty

lua 脚本 整合

openresty.org

## 安装

### yum

```
cd /etc/yum.repos.d
wget https://openresty.org/package/centos/openresty.repo
yum check-update
yum install -y openresty
systemctl start openresty.service  # 启动
systemctl status openresty.service  # 启动错误，则看日志
cd /usr/local/openresty
```

## 热部署 

仅lua脚本 方便调试

```
server {
	lua_code_cache off; // 每次重新读lua
	
	location /lua {
        default_type text/html;
        content_by_lua_file conf/001.lua; # 热部署 需要外部文件
    }
}

# 重启
```

## 执行lua脚本

与nginx 打交道 要用ngx.xxx

### nginx.conf 直接写

```
# 找到nginx.conf
location /lua {
	default_type text/html; # 浏览器会根据这个配置进行加载
	content_by_lua 'ngx.say("<b>hello world~</b>")';
}
# 注意浏览器缓存？？？

systemctl reload openresty.service
```

### ***.lua

```
# 001.lua
ngx.say("<b>hello world~</b>")
```

```
# nginx.conf
location /lua {
	default_type text/html;
	content_by_lua_file conf/001.lua; # 相对路径 为nginx跟目录
}
```

### include lua.conf

```
# lua.conf
content_by_lua_file conf/001.lua;
```

```
# nginx.conf
location /lua {
	default_type text/html;
	include lua.conf; # 相对路径为nginx conf
}
```

### lua_block

```
# nginx.conf
location /lua {
	default_type text/html;
	content_by_lua_block{
		ngx.say("<b>hello world~</b>")
		ngx.say("hello world~")
	};
}
```

### include lua.conf 2

```
# lua2.conf
location /lua {
	default_type text/html;
	content_by_lua_file conf/001.lua; # 相对路径 为nginx跟目录
}
```

```
# nginx.conf
server {
	include lua2.conf;
}
```

### 获得参数

```lua
-- 001.lua 取一个参数
ngx.say(ngx.var.arg_username)  
```

```lua
-- 002.lua 取所有参数 ?username=ly&age=18&age=16

-- local 本地 变量
local uri_args = ngx.req.get_uri_args() 
-- uri_args:table pairs:迭代每一行
for k,v in pairs(uri_args) do
	--[[ 
    	table 理解成 list or map
    	table 数据结构 实现伪面向对象
    ]]--
	if type(v) == "table" then
		-- v 是个集合 -> age:18, 16
		ngx.say(k, " : ", table.concat(v, ", "), "<br/>")
	else
		ngx.say(k, ": ", v, "<br/>")
	end 
end
```

```lua
-- 003.lua 取请求头

local headers = ngx.req.get_uri_headers() 
ngx.say("Host: ", headers["Host"], "<br/>")
ngx.say("user-agent: ", headers["user-agent"], "<br/>")
ngx.say("user-agent: ", headers.user_agent, "<br/>")
for k,v in pairs(headers) do
	if type(v) == "table" then
		ngx.say(k, " : ", table.concat(v, ", "), "<br/>")
	else
		ngx.say(k, ": ", v, "<br/>")
	end 
end
```





# ---------------OLD--------------

# location

    location / {            定位资源:本地磁盘目录 -> URL对应关系
        root html; # 配置路径
        index index.html; # 配置主页
        proxy_pass http(s)://baidu.com;  # 代理路径 ？？
    }

## 代理

通过快递员,快递员起代理作用

### 反向代理

    location /baidu{
        proxy_pass http(s)://baidu.com
    }
    https 返回302,再进行跳转 http直接返回html
    服务器 <==> 反向代理服务器(nginx) <==> 互联网 <==> 客户端
    代理服务器: 负载高(I/O高),需要负载均衡
        服务器 <== 反向代理服务器 <==> 互联网 <==> 客户端
          ↓                                     ↑
          ->----------->----------->------------>

### 正向代理

服务器 <==> 互联网 <==> 正向代理服务器 <==> 客户端

## IP访问控制

    location{
        deny IP/IP段; # 192.168.1.11
        allow 192.168.1.12/13;192.168.2.22/33;...
    }

## 用户认证

    # ~模式匹配
    location ~(.*)\.avi${  # ~后跟 精确地址 或 正则表达式, 此处为任意avi文件
        auth_basic "closed site";
        auth_basic_user_file users; # users文件,httpd-tools工具(yum install httpd)生成
    }

## 虚拟目录

    location /aa {
        root aa   # 加载静态资源 跟路径 只能配一个
        index index.html
    }
    location /bb {
        alias bb # 配置虚拟目录, 第二个root 用alias配
        index index.html
    }
    location /cc {
        alias cc
        index index.html
    }

## 动静分离

    location ~.*\.(js|css|png|gif|jpg){
        root /var/project/file; # root配置了可以用alias
    }

# SSL

    Host文件\网关 DNS劫持
    443端口:传证书
    
    https:
        CA 解包后再次私钥加密 劫持者不能更改客户端浏览器的ca.公钥 所以劫持者不能改
        CA与浏览器关联

# TLS

```
ca - 浏览器
charles 抓包工具
```

# 集群: 负载均衡

    upstream tomcats{ # 轮询方式 一人一下 负载到两台机器上
    
        # weight(权重 此处1:10); max_conns=800(最大连接数) max_fails fail_timeout
        server 192.168.1.11:8080 weight=1;
        server 192.168.1.12:8080 weight=10;
    
        # uri_hash-需要第三方模块或自己写
        ip_hash; # 第一次访问 客户机取一个hash值
    
        # 健康检查模块 tengine
        check interval=3000 rise=2 fail=5 timeout=1000 type=http;
        check_http_send "HEAD / HTTP/1.0\r\n\r\n";
        check_http_expect_alive http_2xx http_3xx;
    }
    location / {
        proxy_pass http://tomcats; # 协议://占位 去tomcats替换 请求中转到后台
    }
    location ~.*\.(js|css|png|gif|jpg){
        root /var/project/file; # root配置了可以用alias
    }
    location /status { # 健康检查模块 tengine
        check_status;
    }

# session共享

    memcached (yum -y install memcache)
    tomcat context.xml memcached存储session
    车祸原因:服务器时间不一致 service ntpd status

# 开机启动

    chkconfig --list
    chkconfig --add nginx
    chkconfig --nginx on

# 示例

1. A

```
# 可以配置多个server
server {
    listen 80;
    server_name taobao.com;
    location / {
        root /var/html/taobao.com;
        autoindex on;
    }
}
```

2. 

```
http{
	server {
		listen 80;
		server_name taobao.com;
		
		upstream sdgh_loadbalance {
    	    server   cloud.21tb.com;
	    }
	    location / {
	    	proxy_pass   http://sdgh_loadbalance/;
             proxy_set_header host $host;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             client_max_body_size 2000m;
         }

         location /wx/ { # 开头匹配，/wxIndex会匹配上一个规则
             proxy_pass   http://127.0.0.1:8085/wx;
             proxy_set_header host $host;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             client_max_body_size 2000m;
         }
	}
}
```

3.

```
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # HTTPS server
    server {
        listen       443 ssl;
        server_name  liuyao61.shop;

        ssl_certificate      ../ssl/liuyao61.shop/server.crt;
        ssl_certificate_key  ../ssl/liuyao61.shop/server.key;

	location / {
		root	html;
		index	home.html;
	}
        location /wid/ {
            proxy_pass   http://127.0.0.1:8083/wid/;
        }

	location /family-back/ {
            proxy_pass   http://127.0.0.1:8082/;
        }

        location /web {
    	    alias  html;
            index  index.html index.htm;
        }
    }

    server {
        listen       80;
	server_name  liuyao.link;
        server_name  *.liuyao.link;

        location / {
                root    html;
                index   home.html;
        }

        location /wid/ {
            proxy_pass   http://127.0.0.1:8083/wid/;
        }
    }

    server {
        listen       80;
        server_name  family.liuyao.link;

        location / {
                root    html/family-front;
                index   index.html;
        }

        location /family-back/ {
            proxy_pass   http://127.0.0.1:8082/;
        }
    }

    server {
        listen       80;
		server_name  intranet.liuyao.link;
        server_name  *.intranet.liuyao.link;

        location / {
	    proxy_pass   http://127.0.0.1:8080/;
	    proxy_set_header Host $host;
        }
    }
}
```

