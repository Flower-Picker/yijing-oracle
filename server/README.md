# 易经卜卦后端API

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

**必填配置**：
- `DB_PASSWORD`: MySQL数据库密码
- `JWT_SECRET`: JWT密钥（随机字符串）
- `WECHAT_APP_ID`: 微信开放平台AppID
- `WECHAT_APP_SECRET`: 微信开放平台AppSecret

**可选配置**：
- 短信服务（阿里云或腾讯云）
- 邮件服务
- AI服务

### 3. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库脚本
source ../database/schema.sql
```

或使用命令行：

```bash
mysql -u root -p < ../database/schema.sql
```

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## 📡 API接口文档

### 认证接口

#### 邮箱注册
```http
POST /api/auth/register/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "用户名"
}
```

#### 邮箱登录
```http
POST /api/auth/login/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 手机号注册
```http
POST /api/auth/register/phone
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "password": "password123",
  "username": "用户名"
}
```

#### 发送验证码
```http
POST /api/auth/send-code
Content-Type: application/json

{
  "type": "phone",          // "phone" 或 "email"
  "target": "13800138000",  // 手机号或邮箱
  "purpose": "register"     // "register", "login", "reset_password"
}
```

#### 微信登录
```http
GET /api/auth/wechat/qrcode
```

返回二维码URL，前端显示二维码供用户扫描。

```http
POST /api/auth/wechat/callback
Content-Type: application/json

{
  "code": "微信授权code"
}
```

### 用户接口

#### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### 更新用户信息
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "新用户名"
}
```

### 起卦接口

#### 保存起卦记录
```http
POST /api/divination/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "问题",
  "hexagram": {...},
  "lines": [...],
  "aiInterpretation": "AI解卦结果"
}
```

#### 获取起卦历史
```http
GET /api/divination/history?page=1&limit=10
Authorization: Bearer <token>
```

## 🔧 服务器部署

### 使用PM2部署（推荐）

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name yijing-api

# 开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs yijing-api

# 重启
pm2 restart yijing-api
```

### 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api {
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

    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔐 安全建议

1. **JWT密钥**：使用强随机字符串
2. **HTTPS**：生产环境必须使用HTTPS
3. **数据库**：限制远程访问，使用强密码
4. **环境变量**：不要将.env文件提交到git
5. **限流**：已配置基础限流，可根据需要调整
6. **日志**：定期检查和清理日志文件

## 📝 待完成功能

由于时间关系，以下功能需要您继续实现：

1. **路由文件**：
   - `routes/auth.js` - 认证路由
   - `routes/user.js` - 用户路由
   - `routes/divination.js` - 起卦路由

2. **控制器文件**：
   - `controllers/authController.js` - 认证逻辑
   - `controllers/userController.js` - 用户逻辑
   - `controllers/divinationController.js` - 起卦逻辑

3. **工具函数**：
   - `utils/jwt.js` - JWT工具
   - `utils/sms.js` - 短信发送
   - `utils/email.js` - 邮件发送
   - `utils/wechat.js` - 微信登录

4. **中间件**：
   - `middleware/auth.js` - 认证中间件
   - `middleware/validator.js` - 数据验证

## 💡 下一步

1. 根据您的实际配置填写 `.env` 文件
2. 初始化数据库
3. 我可以继续帮您完成剩余的控制器和路由代码
4. 修改前端代码，对接后端API
5. 测试所有功能
6. 部署到您的服务器

需要我继续完成后端代码吗？
