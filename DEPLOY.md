# 生产环境部署指南

## 架构说明

- **前端**: GitHub Pages (已部署)
- **后端**: 需要部署到服务器
- **数据库**: 生产环境使用 MySQL

---

## 一、后端部署到服务器

### 1. 准备服务器

需要：
- Linux 服务器 (Ubuntu 20.04+ 推荐)
- Node.js 16+
- MySQL 5.7+ 或 8.0+
- 域名（可选，推荐）

### 2. 上传代码

将整个 `server/` 目录上传到服务器，例如：
```bash
/var/www/yijing-api/
```

### 3. 配置环境变量

在服务器上创建 `/var/www/yijing-api/.env`：

```bash
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库类型
DB_TYPE=mysql

# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=yijing_user
DB_PASSWORD=your_secure_password_here
DB_NAME=yijing_oracle

# JWT密钥（请生成随机字符串）
JWT_SECRET=请替换为随机生成的32位以上字符串
JWT_EXPIRE=7d

# 短信服务配置（阿里云）
SMS_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=your_access_key
ALIYUN_ACCESS_KEY_SECRET=your_secret
ALIYUN_SMS_SIGN=易经卜卦
ALIYUN_SMS_TEMPLATE=SMS_xxxxxxxx

# 或使用腾讯云短信
# SMS_PROVIDER=tencent
# TENCENT_SECRET_ID=
# TENCENT_SECRET_KEY=
# TENCENT_SMS_APP_ID=
# TENCENT_SMS_SIGN=
# TENCENT_SMS_TEMPLATE_ID=

# 微信开放平台配置
WECHAT_APP_ID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_secret
WECHAT_REDIRECT_URI=https://your-domain.com/api/auth/wechat/callback

# 邮件服务配置
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_USER=your_email@qq.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=易经卜卦 <your_email@qq.com>

# 前端地址（CORS）
CLIENT_URL=https://flower-picker.github.io

# AI服务配置
OPENAI_API_KEY=your_openai_api_key
AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
```

### 4. 创建数据库

```bash
mysql -u root -p

CREATE DATABASE yijing_oracle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'yijing_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON yijing_oracle.* TO 'yijing_user'@'localhost';
FLUSH PRIVILEGES;

USE yijing_oracle;
SOURCE /var/www/yijing-api/database/schema.sql;

EXIT;
```

### 5. 安装依赖并启动

```bash
cd /var/www/yijing-api
npm install --production

# 使用 PM2 管理进程
npm install -g pm2
pm2 start app.js --name yijing-api
pm2 save
pm2 startup  # 开机自启

# 查看日志
pm2 logs yijing-api
```

### 6. 配置 Nginx 反向代理

创建 `/etc/nginx/sites-available/yijing-api`：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/yijing-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. 配置 HTTPS (使用 Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.your-domain.com
```

---

## 二、更新前端配置

### 方法1：通过环境变量（推荐）

在项目根目录创建 `.env.production`：

```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
```

### 方法2：直接修改配置

编辑 `src/config/api.js`，修改 API_BASE_URL：

```javascript
export const API_BASE_URL = 'https://api.your-domain.com/api';
```

### 重新构建和部署

```bash
npm run build
git add .
git commit -m "更新生产环境API地址"
git push
```

GitHub Actions 会自动重新部署。

---

## 三、快速部署方案（Railway）

如果暂时没有服务器，可以使用 Railway 免费部署：

### 1. 注册 Railway
访问 https://railway.app 注册账号

### 2. 创建项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择 `yijing-oracle` 仓库
- 设置根目录为 `server/`

### 3. 添加 MySQL 数据库
- 在项目中点击 "New"
- 选择 "Database" -> "MySQL"
- 复制数据库连接信息

### 4. 配置环境变量
在 Railway 项目设置中添加所有环境变量（参考上面的 .env 配置）

### 5. 导入数据库结构
使用 Railway CLI 或 MySQL 客户端连接数据库，导入 `database/schema.sql`

### 6. 部署
Railway 会自动构建和部署，完成后会提供一个公网访问地址。

---

## 四、测试部署

### 测试后端
```bash
curl https://api.your-domain.com/
# 应返回: {"message":"易经卜卦 API Server","version":"1.0.0","status":"running"}
```

### 测试前端
访问 https://flower-picker.github.io/yijing-oracle/
- 尝试注册账号
- 测试手机验证码
- 测试起卦和AI解卦

---

## 五、后续维护

### 更新代码
```bash
cd /var/www/yijing-api
git pull
npm install
pm2 restart yijing-api
```

### 查看日志
```bash
pm2 logs yijing-api
```

### 数据库备份
```bash
mysqldump -u yijing_user -p yijing_oracle > backup_$(date +%Y%m%d).sql
```

---

## 🆘 常见问题

**Q: 部署后手机验证码收不到？**
A: 检查短信服务配置，确保 `SMS_PROVIDER` 正确，AccessKey 有效。

**Q: 前端显示网络连接失败？**
A: 检查 CORS 配置，确保后端 `.env` 中的 `CLIENT_URL` 包含 GitHub Pages 地址。

**Q: 数据库连接失败？**
A: 检查 MySQL 是否启动，用户权限是否正确，防火墙是否开放 3306 端口。

**Q: AI 解卦不工作？**
A: 检查 `OPENAI_API_KEY` 是否配置，API 额度是否充足。

---

需要帮助？查看 SETUP.md 或提交 Issue。
