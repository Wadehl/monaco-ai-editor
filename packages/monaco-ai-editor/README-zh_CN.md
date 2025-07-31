# Monaco AI Editor

[![npm version](https://badge.fury.io/js/monaco-ai-editor.svg)](https://badge.fury.io/js/monaco-ai-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 Vue.js 的智能 Monaco Editor 组件，具备 AI 代码补全功能和可扩展插件系统。

[English](./README.md) | [中文文档](./README-zh_CN.md)

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

## 📦 安装

```bash
npm install monaco-ai-editor

# 或者
yarn add monaco-ai-editor

# 或者
pnpm add monaco-ai-editor
```

## 🚀 快速开始

### 基本用法

```vue
<template>
  <MonacoAIEditor 
    v-model="code"
    language="javascript"
    theme="one-dark-pro"
    height="400px"
    @ready="onEditorReady"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor } from 'monaco-ai-editor'

const code = ref(`// 开始使用 AI 辅助编码！
console.log('Hello, Monaco AI Editor!')`)

const onEditorReady = (editor) => {
  console.log('编辑器就绪:', editor)
}
</script>
```

### 配置 AI 功能

```vue
<template>
  <MonacoAIEditor 
    v-model="code"
    language="typescript"
    :show-a-i-config-button="true"
    :request-mode="'hybrid'"
    :ai-config="aiConfig"
    @ready="handleEditorReady"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor } from 'monaco-ai-editor'

const code = ref('')

const aiConfig = {
  BACKEND_URL: 'http://localhost:3001',
  SHOW_AI_CONFIG_BUTTON: true,
  REQUEST_MODE: 'hybrid',
  BROWSER_AI: {
    CURRENT_PROVIDER: 'anthropic',
    ANTHROPIC: {
      BASE_URL: 'https://api.anthropic.com/v1/messages',
      API_KEY: 'your-api-key',
      MODEL: 'claude-3-sonnet-20240229'
    }
  }
}

const handleEditorReady = (editor) => {
  console.log('编辑器就绪:', editor)
}
</script>
```

### 外部插件系统

```vue
<template>
  <MonacoAIEditor 
    v-model="code"
    :plugins="['shiki']"
    :plugin-options="pluginOptions"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor, pluginManager } from 'monaco-ai-editor'
import { shikiPlugin } from './plugins/shiki-plugin'

// 注册外部插件
pluginManager.register(shikiPlugin)

const code = ref('console.log("Hello World")')

const pluginOptions = {
  shiki: {
    themes: ['dark-plus', 'light-plus', 'one-dark-pro'],
    langs: ['javascript', 'typescript', 'vue', 'html', 'css'],
    defaultTheme: 'dark-plus'
  }
}
</script>
```

## 📖 API 参考

### MonacoAIEditor 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|----------------|
| `modelValue` | `string` | `''` | 编辑器内容 (v-model) |
| `initialValue` | `string` | `''` | 初始编辑器内容 |
| `language` | `string` | `'javascript'` | 编程语言 |
| `theme` | `string` | `'vs-dark'` | 编辑器主题 |
| `height` | `string` | `'600px'` | 编辑器高度 |
| `plugins` | `string[]` | `[]` | 活跃插件 |
| `pluginOptions` | `object` | `{}` | 插件配置 |
| `showAIConfigButton` | `boolean` | `true` | 显示 AI 配置按钮 |
| `requestMode` | `'backend' \| 'browser' \| 'hybrid'` | `'hybrid'` | AI 请求模式 |
| `aiConfig` | `AIConfigOptions` | `{}` | AI 配置选项 |

### 事件

| 事件 | 参数 | 描述 |
|-------|---------|-------------|
| `ready` | `editor` | 编辑器初始化完成 |
| `update:modelValue` | `string` | 内容变更 |

### 请求模式

- **`backend`** - 仅使用后端 AI 服务
- **`browser`** - 仅使用浏览器端 AI API
- **`hybrid`** - 优先尝试后端，失败时降级到浏览器

### 组合式函数

#### useAIConfig()

```typescript
const {
  configState,          // 完整配置状态
  isBackendConnected,   // 后端连接状态
  currentMode,          // 当前活跃模式
  currentConfig,        // 当前使用的配置
  browserConfig,        // 浏览器 AI 配置
  backendConfig,        // 后端 AI 配置
  checkBackendHealth,   // 检查后端状态
  testConfig,           // 测试配置函数
  saveBrowserConfig,    // 保存浏览器配置
  getCompletionFunction // 获取补全处理器
} = useAIConfig(userConfig, requestMode)
```

## 🔌 插件系统

### 架构

Monaco AI Editor 使用外部插件系统来保持核心包的轻量化，同时提供可扩展性。

#### 创建外部插件

```typescript
// plugins/my-plugin.ts
import { MonacoPlugin } from 'monaco-ai-editor'

export const myPlugin: MonacoPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: '自定义插件功能',
  
  defaultOptions: {
    enabled: true,
    customSetting: 'default-value'
  },
  
  lifecycle: {
    async beforeCreate(context) {
      console.log('插件初始化中...', context.options)
      // 编辑器创建前的设置
    },
    
    async afterCreate(context) {
      const { editor, monaco } = context
      
      // 添加自定义命令、装饰等
      editor.addCommand(monaco.KeyCode.F12, () => {
        console.log('自定义 F12 命令触发！')
      })
      
      // 注册自定义语言功能
      monaco.languages.registerHoverProvider('javascript', {
        provideHover: (model, position) => {
          return {
            range: new monaco.Range(1, 1, 1, 1),
            contents: [{ value: '自定义悬停信息！' }]
          }
        }
      })
    },
    
    async destroy() {
      console.log('插件清理')
      // 清理资源
    }
  }
}
```

#### 插件注册

```typescript
// main.ts
import { pluginManager } from 'monaco-ai-editor'
import { myPlugin } from './plugins/my-plugin'

// 注册插件
pluginManager.register(myPlugin)

// 在组件中使用
const editorProps = {
  plugins: ['my-plugin'],
  pluginOptions: {
    'my-plugin': {
      customSetting: 'custom-value'
    }
  }
}
```

### 示例：Shiki 插件

```typescript
// plugins/shiki-plugin.ts
import { MonacoPlugin } from 'monaco-ai-editor'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'

export interface ShikiPluginOptions {
  themes?: string[]
  langs?: string[]
  defaultTheme?: string
}

export const shikiPlugin: MonacoPlugin<ShikiPluginOptions> = {
  name: 'shiki',
  version: '1.0.0',
  description: 'Shiki 语法高亮插件',
  
  defaultOptions: {
    themes: ['dark-plus'],
    langs: ['javascript'],
    defaultTheme: 'dark-plus'
  },
  
  lifecycle: {
    async afterCreate(context) {
      const { monaco, options } = context
      
      const highlighter = await createHighlighter({
        themes: options.themes,
        langs: options.langs
      })
      
      shikiToMonaco(highlighter, monaco)
      console.log('Shiki 插件加载成功')
    }
  }
}
```

## 🎨 自动主题检测

工具栏自动检测并适配 Monaco Editor 主题：

- **深色主题**：使用白色半透明按钮
- **浅色主题**：使用黑色半透明按钮
- **实时适配**：主题切换时立即改变
- **自定义主题支持**：适用于任何 Monaco 主题

支持的内置主题：
- `vs-dark` - VS Code 深色
- `dark-plus` - VS Code Dark+
- `light-plus` - VS Code Light+
- `one-dark-pro` - One Dark Pro
- `github-dark` - GitHub 深色
- `github-light` - GitHub 浅色

## 🔧 配置

### AI 配置选项

```typescript
interface AIConfigOptions {
  // 后端服务配置
  BACKEND_URL: string
  
  // UI 控制
  SHOW_AI_CONFIG_BUTTON: boolean
  
  // 请求模式：'backend' | 'browser' | 'hybrid'
  REQUEST_MODE: 'backend' | 'browser' | 'hybrid'
  
  // 浏览器 AI 配置（降级方案）
  BROWSER_AI: {
    CURRENT_PROVIDER: string
    OPENAI: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
    ANTHROPIC: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
    GEMINI: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
  }
}
```

### 工厂函数

```typescript
import { createConfig } from 'monaco-ai-editor'

const config = createConfig({
  BACKEND_URL: 'http://localhost:3001',
  REQUEST_MODE: 'hybrid',
  BROWSER_AI: {
    CURRENT_PROVIDER: 'anthropic',
    ANTHROPIC: {
      API_KEY: 'your-api-key'
    }
  }
})
```

## 📚 示例

查看 `/packages/example` 目录获取全面的示例，包括：

- 基本编辑器设置
- AI 配置和测试
- 外部插件使用（Shiki）
- 多编程语言
- 主题切换
- 自动同步示例代码
- 服务器集成

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建包
pnpm build

# 构建示例
pnpm build:example

# 运行测试
pnpm test
```

## 🙏 致谢

特别感谢以下令人惊叹的开源项目：

- **[Monacopilot](https://github.com/arshad-yaseen/monacopilot)** - 为我们的智能代码建议提供动力的核心 AI 补全引擎
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - 支持 VS Code 的强大代码编辑器
- **[Shiki](https://shiki.matsu.io/)** - 美观的语法高亮
- **[Vue.js](https://vuejs.org/)** - 渐进式 JavaScript 框架

## 📄 许可证

MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎贡献！请阅读我们的[贡献指南](CONTRIBUTING.md)了解详情。

## 🔗 链接

- [文档](https://github.com/Wadehl/monaco-ai-editor#readme)
- [示例](https://github.com/Wadehl/monaco-ai-editor/tree/main/packages/example)
- [问题反馈](https://github.com/Wadehl/monaco-ai-editor/issues)
- [更新日志](CHANGELOG.md)