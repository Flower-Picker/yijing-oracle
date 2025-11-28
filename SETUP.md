# 易经卜卦系统 - 启动指南

## 系统架构

- **前端**: React 18 + Vite (端口: 5173)
- **后端**: Node.js + Express (端口: 3000)
- **数据库**: MySQL 5.7+

---

## 一、后端启动步骤

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置数据库

#### 2.1 创建MySQL数据库

```sql
CREATE DATABASE yijing_oracle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.2 导入数据库表结构

```bash
mysql -u your_username -p yijing_oracle < ../database/schema.sql
```

或者直接在MySQL中执行：

```bash
mysql -u your_username -p
use yijing_oracle;
source /path/to/database/schema.sql;
```

### 3. 配置环境变量

在 `server/` 目录下创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=yijing_oracle

# JWT配置
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 前端地址（用于CORS）
FRONTEND_URL=http://localhost:5173

# 微信开放平台配置（可选，暂时不用可以留空）
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_REDIRECT_URI=http://localhost:3000/api/auth/wechat/callback

# 短信服务配置（可选，开发环境使用mock模式）
SMS_PROVIDER=mock
# 如果使用阿里云SMS
# SMS_PROVIDER=aliyun
# ALIYUN_ACCESS_KEY_ID=your_key
# ALIYUN_ACCESS_KEY_SECRET=your_secret
# ALIYUN_SMS_SIGN=your_sign_name
# ALIYUN_SMS_TEMPLATE=SMS_123456

# 邮件服务配置（可选，暂时不用可以留空）
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=易经卜卦 <noreply@example.com>
```

**重要**：
- `JWT_SECRET` 请修改为一个随机字符串
- 数据库账号密码改为你的实际配置
- 开发环境可以使用 `SMS_PROVIDER=mock`，短信验证码会输出到控制台

### 4. 启动后端服务器

```bash
npm start
```

成功启动后会看到：

```
✅ 数据库连接成功
🚀 服务器运行在 http://localhost:3000
```

---

## 二、前端启动步骤

### 1. 安装依赖

在项目根目录（不是server目录）：

```bash
npm install
```

### 2. 配置API地址（可选）

如果后端运行在其他地址，在根目录创建 `.env` 文件：

```bash
# API服务器地址
VITE_API_BASE_URL=http://localhost:3000/api
```

默认已经配置为 `http://localhost:3000/api`，如果后端在本地3000端口运行，不需要修改。

### 3. 启动前端开发服务器

```bash
npm run dev
```

成功后会看到：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. 访问应用

打开浏览器访问：**http://localhost:5173/**

---

## 三、功能测试

### 1. 邮箱注册/登录

1. 点击右上角「登录」按钮
2. 选择「邮箱」选项卡
3. 切换到「注册」模式
4. 输入邮箱和密码（至少6位）
5. 点击「注册」

**注意**：开发环境下，邮件功能可能未配置，可以直接使用密码登录。

### 2. 手机号注册/登录

1. 点击右上角「登录」按钮
2. 选择「手机号」选项卡
3. 输入11位手机号
4. 点击「发送验证码」

**开发环境**：验证码会输出到后端控制台，查看server终端即可看到验证码。

例如：
```
📱 发送验证码 (mock模式)
   目标: 13800138000
   验证码: 123456
   用途: register
```

5. 输入验证码和密码完成注册

### 3. 起卦测试

1. 登录后，在首页输入问题
2. 点击「开始起卦」
3. 依次投掷6次（自动完成）
4. 查看卦象解释

### 4. AI解卦测试

**注册用户**：每个新注册用户有3次免费AI解卦次数

1. 完成起卦后，点击「获取AI解卦」
2. 系统会消耗1次AI配额
3. 查看AI解释结果

**VIP用户**：无限次AI解卦

1. 用完免费次数后，会提示升级VIP
2. 点击「立即升级VIP」（目前是mock功能，直接升级为VIP）

---

## 四、常见问题

### Q1: 后端启动失败 - 数据库连接错误

**错误信息**：`❌ 数据库连接失败`

**解决方案**：
1. 检查MySQL是否已启动
2. 检查 `server/.env` 中的数据库配置是否正确
3. 检查数据库 `yijing_oracle` 是否已创建

### Q2: 前端API请求失败 - 网络错误

**错误信息**：`网络连接失败`

**解决方案**：
1. 确保后端服务器已启动（http://localhost:3000）
2. 检查前端 `.env` 中的 `VITE_API_BASE_URL` 配置
3. 检查浏览器控制台是否有CORS错误

### Q3: 手机验证码收不到

**开发环境**：
- 使用 `SMS_PROVIDER=mock` 模式
- 验证码会输出到后端终端，直接查看即可
- 格式：`📱 发送验证码 (mock模式) 验证码: 123456`

**生产环境**：
- 需要配置真实的短信服务（阿里云或腾讯云）
- 修改 `.env` 中的 SMS 相关配置

### Q4: JWT token过期

**错误**：401 Unauthorized，自动跳转到首页

**原因**：Token默认7天过期

**解决**：重新登录即可

---

## 五、生产环境部署

### 前端部署（GitHub Pages）

前端已配置自动部署，当你推送代码到GitHub时会自动构建和部署。

手动构建：

```bash
npm run build
```

构建产物在 `dist/` 目录，可部署到任何静态托管服务。

### 后端部署

1. 上传代码到服务器
2. 配置生产环境 `.env`
3. 安装依赖：`npm install --production`
4. 使用PM2启动：
   ```bash
   npm install -g pm2
   pm2 start server/app.js --name yijing-api
   pm2 save
   pm2 startup
   ```

5. 配置Nginx反向代理（推荐）

---

## 六、开发模式快速启动

**终端1 - 启动后端**：
```bash
cd server
npm start
```

**终端2 - 启动前端**：
```bash
npm run dev
```

然后访问 http://localhost:5173

---

## 技术支持

如有问题，请检查：
1. Node.js版本 >= 16
2. MySQL版本 >= 5.7
3. 端口3000和5173未被占用
4. 防火墙允许这些端口

祝你使用愉快！🎉
