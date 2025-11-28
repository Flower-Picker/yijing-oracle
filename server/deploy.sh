#!/bin/bash

# 易经卜卦后端部署脚本

echo "======================================"
echo "易经卜卦后端部署脚本"
echo "======================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js，请先安装Node.js 16+"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未安装npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  未找到mysql命令，请确保MySQL已安装"
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo "⚠️  未找到.env文件"
    if [ -f .env.production ]; then
        echo "📝 复制.env.production为.env"
        cp .env.production .env
        echo "⚠️  请编辑.env文件，配置数据库和其他服务"
        exit 1
    else
        echo "❌ 缺少环境配置文件"
        exit 1
    fi
fi

echo "✅ 环境配置文件存在"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 安装PM2..."
    npm install -g pm2
fi

echo "✅ PM2已安装"

# 停止旧进程（如果存在）
pm2 stop yijing-api 2>/dev/null || true
pm2 delete yijing-api 2>/dev/null || true

# 启动应用
echo ""
echo "🚀 启动应用..."
pm2 start app.js --name yijing-api

if [ $? -eq 0 ]; then
    echo "✅ 应用启动成功"

    # 保存PM2配置
    pm2 save

    # 设置开机自启
    pm2 startup

    echo ""
    echo "======================================"
    echo "✅ 部署完成！"
    echo "======================================"
    echo ""
    echo "📍 查看日志: pm2 logs yijing-api"
    echo "📍 查看状态: pm2 status"
    echo "📍 重启应用: pm2 restart yijing-api"
    echo "📍 停止应用: pm2 stop yijing-api"
    echo ""
    echo "🌐 后端服务运行在: http://localhost:3000"
    echo ""
    echo "⚠️  下一步："
    echo "1. 配置Nginx反向代理"
    echo "2. 配置SSL证书（Let's Encrypt）"
    echo "3. 更新前端API地址"
    echo ""
else
    echo "❌ 应用启动失败，请查看日志"
    pm2 logs yijing-api --lines 50
    exit 1
fi
