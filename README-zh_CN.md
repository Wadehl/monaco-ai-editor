# Monaco AI Editor Monorepo

[![npm version](https://badge.fury.io/js/monaco-ai-editor.svg)](https://badge.fury.io/js/monaco-ai-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 Vue.js 的智能 Monaco Editor 组件，具备 AI 代码补全功能和可扩展插件系统。

[English](./README.md) | [中文文档](./README-zh_CN.md)

## 📦 包

### [`monaco-ai-editor`](./packages/monaco-ai-editor)
主要的 NPM 包 - 基于 Vue.js 的智能 Monaco Editor 组件

- 🤖 **AI 代码补全** - 支持 OpenAI、Anthropic Claude、Google Gemini
- 🎯 **Monaco Editor 集成** - 完整的 Monaco Editor，提供 VS Code 体验
- 🔄 **多运行时支持** - 后端、浏览器和混合 AI 请求模式
- 🛡️ **智能降级** - 自动提供商切换和错误处理
- 📝 **v-model 支持** - 响应式双向数据绑定
- 🔌 **外部插件系统** - 轻量级核心，支持外部插件
- 🌈 **自动主题检测** - 工具栏自动适配 Monaco 主题
- 🎭 **主题支持** - 多个内置主题，无缝集成
- 📱 **响应式设计** - 移动端友好界面
- 🌍 **可配置 UI** - 可自定义 AI 配置按钮和请求模式

**安装：**
```bash
npm install monaco-ai-editor monaco-editor vue
```

### [`@monacopilot/example`](./packages/example)
展示所有功能和使用示例的示例应用程序

- 所有组件的交互式示例
- 插件系统演示
- AI 配置示例
- 使用 AI 辅助的实时代码编辑

## 🚀 快速开始

### 使用 NPM 包

```vue
<template>
  <MonacoAIEditor 
    v-model="code"
    language="javascript"
    theme="one-dark-pro"
    height="400px"
    :plugins="['shiki']"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor } from 'monaco-ai-editor'

const code = ref(`// 开始使用 AI 辅助编码！
console.log('Hello, Monaco AI Editor!')`)
</script>
```

### 运行示例

```bash
# 安装依赖
pnpm install

# 启动示例应用程序
pnpm dev

# 构建库和演示
pnpm build
```

## 🛠️ 开发

这是一个使用 pnpm workspaces 管理的 monorepo。

### 可用脚本

```bash
# 开发
pnpm dev              # 启动示例应用程序
pnpm dev:lib          # 以监听模式启动库

# 构建
pnpm build            # 构建库和演示
pnpm build:lib        # 仅构建库
pnpm build:demo       # 仅构建演示

# 发布
pnpm publish:lib      # 将库发布到 NPM
pnpm changeset        # 为版本管理创建变更集

# 工具
pnpm type-check       # 类型检查所有包
pnpm lint             # 检查所有包
pnpm clean            # 清理所有构建产物
```

### 项目结构

```
monaco-ai-editor-monorepo/
├── packages/
│   ├── monaco-ai-editor/     # 📦 NPM 包
│   │   ├── src/              # 源代码
│   │   ├── dist/             # 构建库
│   │   ├── package.json      # 包配置
│   │   ├── vite.config.ts    # 构建配置
│   │   └── README.md         # 包文档
│   │
│   └── example/                 # 🎪 示例应用程序
│       ├── src/              # 示例源代码
│       ├── components/       # 示例组件
│       ├── package.json      # 示例依赖
│       └── vite.config.ts    # 示例构建配置
│
├── package.json              # Monorepo 配置
├── pnpm-workspace.yaml       # 工作区配置
└── tsconfig.json             # TypeScript 配置
```

## ✨ 特性

- 🤖 **AI 代码补全** - 支持 OpenAI、Anthropic Claude、Google Gemini
- 🎯 **Monaco Editor 集成** - 完整的 Monaco Editor，提供 VS Code 体验
- 🔄 **多运行时支持** - 后端、浏览器和混合 AI 请求模式
- 🛡️ **智能降级** - 自动提供商切换和错误处理
- 📝 **v-model 支持** - 响应式双向数据绑定
- 🔌 **外部插件系统** - 轻量级核心，支持外部插件
- 🌈 **自动主题检测** - 工具栏自动适配 Monaco 主题
- 🎭 **主题支持** - 多个内置主题，无缝集成
- 📱 **响应式设计** - 移动端友好界面
- 🌍 **可配置 UI** - 可自定义 AI 配置按钮和请求模式

## 📖 文档

- **[库文档](./packages/monaco-ai-editor/README.md)** - 完整的 API 参考和使用指南
- **[插件系统](./PLUGIN_SYSTEM.md)** - 如何创建和使用插件
- **[语言功能](./LANGUAGE_FEATURES.md)** - 支持的语言和功能
- **[示例](./packages/example/src/)** - 实时示例和演示

## 🤝 贡献

欢迎贡献！请按照以下步骤操作：

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 进行更改并添加测试
4. 使用约定式提交：`git commit -m 'feat: add amazing feature'`
5. 推送到分支：`git push origin feature/amazing-feature`
6. 打开 Pull Request

### 开发工作流

```bash
# 克隆仓库
git clone <repository-url>
cd monaco-ai-editor-monorepo

# 安装依赖
pnpm install

# 开始开发
pnpm dev

# 对 packages/monaco-ai-editor/src/ 进行更改

# 在演示中测试您的更改
# 演示会自动使用本地库

# 构建和测试
pnpm build
pnpm type-check

# 为版本管理创建变更集
pnpm changeset

# 发布（仅维护者）
pnpm changeset:version
pnpm publish:lib
```

## 📄 许可证

MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

特别感谢以下令人惊叹的开源项目：

- **[Monacopilot](https://github.com/arshad-yaseen/monacopilot)** - 为我们的智能代码建议提供动力的核心 AI 补全引擎
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - 支持 VS Code 的强大代码编辑器
- **[Shiki](https://shiki.matsu.io/)** - 美观的语法高亮
- **[Vue.js](https://vuejs.org/)** - 渐进式 JavaScript 框架

## 🔗 链接

- **[NPM 包](https://www.npmjs.com/package/monaco-ai-editor)**
- **[文档](./packages/monaco-ai-editor/README.md)**
- **[示例应用程序](./packages/example)**
- **[问题反馈](https://github.com/Wadehl/monaco-ai-editor/issues)**
- **[更新日志](./packages/monaco-ai-editor/CHANGELOG.md)**