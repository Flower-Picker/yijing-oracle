# 易经卜卦 - I Ching Divination App

一个现代化的易经卜卦应用，采用传统六爻铜钱法起卦，结合AI智能解读。

## ✨ 功能特性

### 🎯 核心功能
- **六爻铜钱法起卦** - 采用传统三枚铜钱投掷六次的方法
- **64卦完整数据** - 包含所有64卦的卦辞、象辞和解释
- **变卦系统** - 自动识别老阴老阳，显示变卦
- **AI智能解卦** - 运用AI技术提供深度解读（付费功能）

### 👥 用户系统
- **游客模式** - 可以起卦和查看基本卦辞
- **注册用户** - 赠送3次AI解卦机会
- **VIP用户** - 享受无限次AI解卦

### 🎨 界面设计
- **神秘深色主题** - 深色背景配合金色点缀
- **流畅动画效果** - 投掷过程动态展示
- **响应式设计** - 完美适配移动端和桌面端

## 🚀 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **状态管理**: Context API
- **样式**: CSS3 + CSS Variables
- **部署**: GitHub Pages

## 📦 安装和运行

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Flower-Picker/yijing-oracle.git

# 进入项目目录
cd yijing-oracle

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

构建完成后，静态文件将在 `dist` 目录中。

## 🌐 部署到GitHub Pages

本项目已配置自动部署到GitHub Pages。

### 部署步骤

1. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码**
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions 将自动构建和部署

3. **访问应用**
   - 部署完成后访问: `https://flower-picker.github.io/yijing-oracle/`

## 🎮 使用说明

### 起卦流程

1. **输入问题**（可选）
   - 在输入框中输入您想要占卜的问题
   - 也可以不输入问题，直接起卦

2. **开始起卦**
   - 点击"开始起卦"按钮
   - 系统将自动投掷六次，生成六爻

3. **查看卦象**
   - 查看本卦和变卦（如有）
   - 阅读卦辞、象辞和基本解释

4. **AI解卦**（需登录）
   - 注册/登录账户
   - 点击"获取AI解卦"
   - AI将提供详细的解读和建议

### 用户升级

- **注册用户**: 免费获得3次AI解卦
- **VIP用户**: 升级VIP享受无限次AI解卦

## 🔧 配置说明

### AI API配置（可选）

如果要使用真实的AI API，需要配置环境变量：

创建 `.env` 文件：

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
```

**注意**: 当前版本使用模拟的AI响应，无需配置真实API即可体验完整功能。

## 📝 项目结构

```
yijing-oracle/
├── src/
│   ├── components/        # React组件
│   │   ├── Header.jsx
│   │   ├── AuthModal.jsx
│   │   ├── DivinationPanel.jsx
│   │   ├── HexagramDisplay.jsx
│   │   └── AIInterpretation.jsx
│   ├── contexts/         # Context状态管理
│   │   └── AuthContext.jsx
│   ├── data/            # 数据文件
│   │   └── hexagrams.js # 64卦数据
│   ├── services/        # 服务层
│   │   └── aiInterpretation.js
│   ├── utils/           # 工具函数
│   │   └── divination.js
│   ├── App.jsx          # 主应用组件
│   └── main.jsx         # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions部署配置
├── public/              # 静态资源
├── package.json
└── vite.config.js      # Vite配置
```

## 🎯 功能路线图

- [x] 六爻铜钱法起卦
- [x] 64卦完整数据
- [x] 变卦系统
- [x] 用户登录系统
- [x] AI解卦（模拟版）
- [ ] 真实AI API集成
- [ ] 卦象历史记录
- [ ] 社交分享功能
- [ ] 多语言支持
- [ ] 深色/浅色主题切换

## 📄 许可证

MIT License

## 🙏 致谢

- 易经经典文本
- React社区
- 所有贡献者

## ⚠️ 免责声明

本应用仅供娱乐和文化学习参考，不构成任何决策建议。请理性对待卜卦结果，重大决策应综合多方面因素谨慎考虑。
