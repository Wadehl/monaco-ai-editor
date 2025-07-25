#!/bin/bash

# 检查是否存在 .env.frontend 文件
if [ -f ".env.frontend" ]; then
    echo "📋 将前端环境变量添加到 .env 文件..."
    
    # 将 .env.frontend 的内容追加到 .env 文件
    cat .env.frontend >> .env
    
    echo "✅ 前端环境变量已添加到 .env 文件"
    echo "🔧 请重启开发服务器: pnpm run dev"
else
    echo "❌ .env.frontend 文件不存在"
fi