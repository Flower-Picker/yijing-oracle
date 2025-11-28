# 🚀 快速部署指南

## 前提条件

你的服务器需要：
- ✅ Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- ✅ Node.js 16+ 和 npm
- ✅ MySQL 5.7+ 或 8.0+
- ✅ 一个域名（可选，但推荐）

---

## 📦 第一步：上传代码到服务器

### 方法1：使用Git（推荐）

```bash
# 在服务器上执行
cd /var/www
git clone https://github.com/Flower-Picker/yijing-oracle.git
cd yijing-oracle/server
```

### 方法2：手动上传

将整个 `server/` 目录上传到服务器，例如：
```
/var/www/yijing-api/
```

---

## 🗄️ 第二步：配置MySQL数据库

### 1. 登录MySQL
```bash
mysql -u root -p
```

### 2. 创建数据库和用户
```sql
-- 创建数据库
CREATE DATABASE yijing_oracle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'yijing_user'@'localhost' IDENTIFIED BY '你的安全密码';

-- 授权
GRANT ALL PRIVILEGES ON yijing_oracle.* TO 'yijing_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 3. 导入表结构
```bash
mysql -u yijing_user -p yijing_oracle < database/schema.sql
```

**注意**: 如果你上传的是 `server/` 目录，schema.sql在上一级的database目录，需要调整路径：
```bash
mysql -u yijing_user -p yijing_oracle < ../database/schema.sql
```

---

## ⚙️ 第三步：配置环境变量

### 1. 复制配置文件
```bash
cd /var/www/yijing-api  # 或你的实际路径
cp .env.production .env
```

### 2. 编辑配置文件
```bash
nano .env  # 或使用 vim
```

### 3. 必须修改的配置项

```bash
# 数据库密码（与第二步创建的密码一致）
DB_PASSWORD=你在第二步设置的密码

# JWT密钥（生成随机字符串）
JWT_SECRET=请改为随机32位以上字符串

# 你的域名
WECHAT_REDIRECT_URI=https://你的域名.com/api/auth/wechat/callback
```

### 4. 可选配置（根据需要）

```bash
# 短信服务（如果有阿里云账号）
ALIYUN_ACCESS_KEY_ID=你的key
ALIYUN_ACCESS_KEY_SECRET=你的secret
ALIYUN_SMS_SIGN=你的签名
ALIYUN_SMS_TEMPLATE=你的模板CODE

# 微信登录（如果有微信开放平台账号）
WECHAT_APP_ID=你的AppID
WECHAT_APP_SECRET=你的AppSecret

# AI服务（如果有OpenAI API Key）
OPENAI_API_KEY=你的key
```

**没有这些服务？**
- 短信验证码：保持 `SMS_PROVIDER=mock`，验证码会输出到日志
- 微信登录：暂时不配置，用邮箱/手机号登录
- AI解卦：暂时不配置，先用基础解卦功能

---

## 🚀 第四步：运行部署脚本

```bash
cd /var/www/yijing-api  # 或你的实际路径
./deploy.sh
```

脚本会自动：
- ✅ 检查环境
- ✅ 安装依赖
- ✅ 安装PM2
- ✅ 启动应用
- ✅ 配置开机自启

### 查看运行状态
```bash
pm2 status
pm2 logs yijing-api
```

---

## 🌐 第五步：配置Nginx反向代理

### 1. 安装Nginx（如果未安装）
```bash
# Ubuntu/Debian
apt update && apt install nginx

# CentOS
yum install nginx
```

### 2. 创建Nginx配置
```bash
nano /etc/nginx/sites-available/yijing-api
```

### 3. 粘贴以下配置

```nginx
server {
    listen 80;
    server_name api.你的域名.com;  # 改为你的实际域名

    # 如果没有域名，可以用IP
    # server_name 你的服务器IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 启用配置
```bash
# 创建软链接
ln -s /etc/nginx/sites-available/yijing-api /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 5. 测试访问
```bash
curl http://你的域名或IP
# 应返回: {"message":"易经卜卦 API Server","version":"1.0.0","status":"running"}
```

---

## 🔒 第六步：配置HTTPS（可选但推荐）

### 使用Let's Encrypt免费证书

```bash
# 安装certbot
apt install certbot python3-certbot-nginx

# 自动配置HTTPS
certbot --nginx -d api.你的域名.com

# 自动续期
certbot renew --dry-run
```

---

## 🎨 第七步：更新前端API地址

### 1. 在本地（Claude Code环境）创建配置

创建文件 `.env.production`：
```bash
VITE_API_BASE_URL=https://api.你的域名.com/api
```

### 2. 重新构建并推送
```bash
git add .env.production
git commit -m "配置生产环境API地址"
git push
```

GitHub Actions会自动重新部署前端。

---

## ✅ 第八步：测试完整功能

等待2-3分钟GitHub Pages部署完成后，访问：
**https://flower-picker.github.io/yijing-oracle/**

测试：
1. ✅ 页面正常打开
2. ✅ 点击"登录"，不再显示"网络连接失败"
3. ✅ 注册新账号
4. ✅ 手机验证码功能
5. ✅ 起卦功能
6. ✅ AI解卦功能

---

## 🐛 常见问题

### Q1: 部署脚本权限错误
```bash
chmod +x deploy.sh
./deploy.sh
```

### Q2: MySQL连接失败
- 检查MySQL是否启动: `systemctl status mysql`
- 检查用户密码是否正确
- 检查数据库名称是否正确

### Q3: 端口被占用
```bash
# 查看端口占用
lsof -i:3000

# 修改端口（编辑.env）
PORT=3001
```

### Q4: Nginx 403/502错误
```bash
# 检查后端是否运行
pm2 status

# 查看Nginx日志
tail -f /var/log/nginx/error.log

# 检查防火墙
ufw allow 80
ufw allow 443
```

### Q5: 前端仍显示"网络连接失败"
- 等待GitHub Pages重新部署（2-3分钟）
- 清除浏览器缓存
- 检查 `.env.production` 中的API地址是否正确
- 检查后端CORS配置（.env中的CLIENT_URL）

---

## 📞 需要帮助？

遇到问题？告诉我：
1. 哪一步出错了？
2. 看到什么错误信息？
3. 运行 `pm2 logs yijing-api --lines 50` 的输出

我会帮你解决！
