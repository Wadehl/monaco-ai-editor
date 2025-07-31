# Monaco AI Editor

[![npm version](https://badge.fury.io/js/monaco-ai-editor.svg)](https://badge.fury.io/js/monaco-ai-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI-powered Monaco Editor component for Vue.js with intelligent code completion and extensible plugin system.

[中文文档](./README-zh_CN.md) | [English](./README.md)

## ✨ Features

- 🤖 **AI Code Completion** - Support for OpenAI, Anthropic Claude, Google Gemini
- 🎯 **Monaco Editor Integration** - Full Monaco Editor with VS Code experience  
- 🔄 **Multi-Runtime Support** - Backend, browser, and hybrid AI request modes
- 🛡️ **Smart Fallback** - Automatic provider switching and error handling
- 📝 **v-model Support** - Reactive two-way data binding
- 🔌 **External Plugin System** - Lightweight core with external plugin support
- 🌈 **Auto Theme Detection** - Toolbar automatically adapts to Monaco themes
- 🎭 **Theme Support** - Multiple built-in themes with seamless integration
- 📱 **Responsive Design** - Mobile-friendly interface
- 🌍 **Configurable UI** - Customizable AI config button and request modes

## 📦 Installation

```bash
npm install monaco-ai-editor

# or
yarn add monaco-ai-editor

# or  
pnpm add monaco-ai-editor
```

## 🚀 Quick Start

### Basic Usage

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

const code = ref(`// Start coding with AI assistance!
console.log('Hello, Monaco AI Editor!')`)

const onEditorReady = (editor) => {
  console.log('Editor ready:', editor)
}
</script>
```

### With AI Configuration

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
  console.log('Editor ready:', editor)
}
</script>
```

### External Plugin System

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

// Register external plugin
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

## 📖 API Reference

### MonacoAIEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Editor content (v-model) |
| `initialValue` | `string` | `''` | Initial editor content |
| `language` | `string` | `'javascript'` | Programming language |
| `theme` | `string` | `'vs-dark'` | Editor theme |
| `height` | `string` | `'600px'` | Editor height |
| `plugins` | `string[]` | `[]` | Active plugins |
| `pluginOptions` | `object` | `{}` | Plugin configurations |
| `showAIConfigButton` | `boolean` | `true` | Show AI configuration button |
| `requestMode` | `'backend' \| 'browser' \| 'hybrid'` | `'hybrid'` | AI request mode |
| `aiConfig` | `AIConfigOptions` | `{}` | AI configuration options |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ready` | `editor` | Editor initialization complete |
| `update:modelValue` | `string` | Content change |

### Request Modes

- **`backend`** - Use only backend AI service
- **`browser`** - Use only browser-side AI APIs
- **`hybrid`** - Try backend first, fallback to browser

### Composables

#### useAIConfig()

```typescript
const {
  configState,          // Complete configuration state
  isBackendConnected,   // Backend connection status
  currentMode,          // Current active mode
  currentConfig,        // Currently used configuration
  browserConfig,        // Browser AI configuration
  backendConfig,        // Backend AI configuration
  checkBackendHealth,   // Check backend status
  testConfig,           // Test configuration function
  saveBrowserConfig,    // Save browser configuration
  getCompletionFunction // Get completion handler
} = useAIConfig(userConfig, requestMode)
```

## 🔌 Plugin System

### Architecture

Monaco AI Editor uses an external plugin system to keep the core package lightweight while providing extensibility.

#### Creating External Plugins

```typescript
// plugins/my-plugin.ts
import { MonacoPlugin } from 'monaco-ai-editor'

export const myPlugin: MonacoPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Custom plugin functionality',
  
  defaultOptions: {
    enabled: true,
    customSetting: 'default-value'
  },
  
  lifecycle: {
    async beforeCreate(context) {
      console.log('Plugin initializing...', context.options)
      // Setup before editor creation
    },
    
    async afterCreate(context) {
      const { editor, monaco } = context
      
      // Add custom commands, decorations, etc.
      editor.addCommand(monaco.KeyCode.F12, () => {
        console.log('Custom F12 command triggered!')
      })
      
      // Register custom language features
      monaco.languages.registerHoverProvider('javascript', {
        provideHover: (model, position) => {
          return {
            range: new monaco.Range(1, 1, 1, 1),
            contents: [{ value: 'Custom hover info!' }]
          }
        }
      })
    },
    
    async destroy() {
      console.log('Plugin cleanup')
      // Cleanup resources
    }
  }
}
```

#### Plugin Registration

```typescript
// main.ts
import { pluginManager } from 'monaco-ai-editor'
import { myPlugin } from './plugins/my-plugin'

// Register plugin
pluginManager.register(myPlugin)

// Use in component
const editorProps = {
  plugins: ['my-plugin'],
  pluginOptions: {
    'my-plugin': {
      customSetting: 'custom-value'
    }
  }
}
```

### Example: Shiki Plugin

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
  description: 'Shiki syntax highlighting plugin',
  
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
      console.log('Shiki plugin loaded successfully')
    }
  }
}
```

## 🎨 Automatic Theme Detection

The toolbar automatically detects and adapts to Monaco Editor themes:

- **Dark themes**: Uses white semi-transparent buttons
- **Light themes**: Uses black semi-transparent buttons  
- **Real-time adaptation**: Changes immediately when themes switch
- **Custom theme support**: Works with any Monaco theme

Supported built-in themes:
- `vs-dark` - VS Code Dark
- `dark-plus` - VS Code Dark+ 
- `light-plus` - VS Code Light+
- `one-dark-pro` - One Dark Pro
- `github-dark` - GitHub Dark
- `github-light` - GitHub Light

## 🔧 Configuration

### AI Configuration Options

```typescript
interface AIConfigOptions {
  // Backend service configuration
  BACKEND_URL: string
  
  // UI control
  SHOW_AI_CONFIG_BUTTON: boolean
  
  // Request mode: 'backend' | 'browser' | 'hybrid'
  REQUEST_MODE: 'backend' | 'browser' | 'hybrid'
  
  // Browser AI configuration (fallback solution)
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

### Factory Function

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

## 📚 Examples

Check out the `/packages/example` directory for comprehensive examples including:

- Basic editor setup
- AI configuration and testing
- External plugin usage (Shiki)
- Multiple programming languages
- Theme switching
- Auto-sync demo code
- Server integration

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build package  
pnpm build

# Build example
pnpm build:example

# Run tests
pnpm test
```

## 🙏 Acknowledgments

Special thanks to the amazing open-source projects that make this possible:

- **[Monacopilot](https://github.com/arshad-yaseen/monacopilot)** - The core AI completion engine that powers our intelligent code suggestions
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - The powerful code editor that powers VS Code
- **[Shiki](https://shiki.matsu.io/)** - Beautiful syntax highlighting
- **[Vue.js](https://vuejs.org/)** - The progressive JavaScript framework

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🔗 Links

- [Documentation](https://github.com/Wadehl/monaco-ai-editor#readme)
- [Examples](https://github.com/Wadehl/monaco-ai-editor/tree/main/packages/example)
- [Issues](https://github.com/Wadehl/monaco-ai-editor/issues)
- [Changelog](CHANGELOG.md)