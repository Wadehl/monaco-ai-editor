# Monaco Editor AI 代码补全 Demo

一个集成了 Monaco Editor 和 AI 代码补全功能的演示项目，支持多种运行模式和 AI 提供商。

## ✨ 功能特性

- 🎯 **Monaco Editor 集成** - 完整的代码编辑器体验
- 🤖 **AI 代码补全** - 支持 OpenAI 和 Anthropic Claude
- 🔄 **多运行时支持** - Bun / Node.js / 浏览器端
- 🛡️ **智能降级** - 后端不可用时自动切换到浏览器端
- ⚡ **热重载** - 开发时自动重启
- 🔧 **环境配置** - 灵活的环境变量配置

## 🚀 三种执行方式

### 1. 🌐 浏览器端模式（Browser-Only）

**适用场景：** 
- 纯前端开发
- 不想搭建后端服务
- 快速原型开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，确保配置了 VITE_ 前缀的环境变量

# 启动前端（自动检测并使用浏览器端AI）
pnpm run dev
```

**特点：**
- ✅ 无需后端服务器
- ✅ 直接在浏览器中调用 AI API
- ✅ 启动最快
- ⚠️ API 密钥暴露在前端（仅用于开发测试）

---

### 2. 🟢 Node.js 后端模式

**适用场景：**
- 生产环境部署
- API 密钥安全性要求高
- 传统 Node.js 技术栈

```bash
# 切换到 Node.js 18
nvm use 18

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置后端和前端环境变量

# 启动前端 + Node.js 后端
pnpm run dev:node
```

**特点：**
- ✅ API 密钥在后端安全存储
- ✅ 标准 Node.js HTTP 服务器
- ✅ 支持传统部署方式
- ✅ 热重载支持（nodemon + tsx）

**单独启动后端：**
```bash
pnpm run server:node
```

---

### 3. ⚡ Bun 后端模式（推荐）

**适用场景：**
- 现代开发环境
- 追求极致性能
- 简化的开发体验

```bash
# 安装依赖
bun install
# 或者
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动前端 + Bun 后端
pnpm run dev:bun
```

**特点：**
- ⚡ 启动速度极快
- 🔥 内置热重载
- 📦 TypeScript 原生支持
- 🚀 现代 JavaScript 运行时

**单独启动后端：**
```bash
pnpm run server
# 或
bun run server.ts
```

## 📁 项目结构

```
monacopilot/
├── src/
│   ├── components/
│   │   └── MonacoEditor.vue     # Monaco 编辑器组件
│   ├── config.js                # 前端配置文件
│   ├── monaco-worker.ts         # Monaco Worker 配置
│   └── App.vue                  # 主应用组件
├── server.ts                    # Bun 后端服务器
├── server.js                    # Node.js 后端服务器
├── .env.example                 # 环境变量示例
├── .nvmrc                       # Node.js 版本配置
└── package.json                 # 项目配置
```

## ⚙️ 环境变量配置

### 后端环境变量
```bash
# AI 服务配置
CURRENT_PROVIDER=anthropic

# OpenAI 配置
OPENAI_BASE_URL=http://your-openai-endpoint.com/v1/chat/completions
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Anthropic 配置
ANTHROPIC_BASE_URL=http://your-anthropic-endpoint.com/v1/messages
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# 服务器配置
PORT=3001
```

### 前端环境变量（浏览器端兜底）
```bash
# 后端服务地址
VITE_BACKEND_URL=http://localhost:3001
VITE_CURRENT_PROVIDER=anthropic

# 前端 AI 配置（与后端保持一致）
VITE_ANTHROPIC_BASE_URL=http://your-anthropic-endpoint.com/v1/messages
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## 📝 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | 纯前端开发（浏览器端AI） |
| `pnpm run dev:node` | 前端 + Node.js 后端 |
| `pnpm run dev:bun` | 前端 + Bun 后端 |
| `pnpm run server` | 仅启动 Bun 后端 |
| `pnpm run server:node` | 仅启动 Node.js 后端 |
| `pnpm run build` | 构建项目（Bun） |
| `pnpm run build:node` | 构建项目（Node.js） |

## 🔧 智能降级机制

项目具有智能的降级机制：

1. **后端优先**：启动时检测后端健康状态
2. **自动切换**：后端不可用时自动使用浏览器端 AI
3. **无缝体验**：用户无感知的服务切换
4. **调试友好**：控制台显示当前使用的模式

## 🛠️ 开发建议

### 快速开始
```bash
# 1. 克隆项目
git clone https://github.com/Wadehl/monacopilot-demo.git
cd monacopilot-demo

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置你的 API 密钥

# 4. 启动开发（选择其中一种方式）
pnpm run dev        # 浏览器端模式
pnpm run dev:bun    # Bun 后端模式  
pnpm run dev:node   # Node.js 后端模式
```

### 部署建议
- **开发环境**：使用 Bun 模式，开发体验最佳
- **生产环境**：使用 Node.js 模式，稳定性更好
- **演示环境**：使用浏览器端模式，部署最简单

## 🔒 安全说明

- 生产环境请使用后端模式，避免 API 密钥暴露
- 浏览器端模式仅适用于开发和演示
- 建议使用环境变量管理敏感信息

## 📄 许可证

MIT License

---

**技术栈：** Vue 3 + TypeScript + Vite + Monaco Editor + Monacopilot