# Monaco AI Editor Monorepo

[![npm version](https://badge.fury.io/js/monaco-ai-editor.svg)](https://badge.fury.io/js/monaco-ai-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI-powered Monaco Editor component for Vue.js with intelligent code completion and extensible plugin system.

[中文文档](./README-zh_CN.md) | [English](./README.md)

## 📦 Packages

### [`monaco-ai-editor`](./packages/monaco-ai-editor)
The main NPM package - AI-powered Monaco Editor component for Vue.js

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

**Installation:**
```bash
npm install monaco-ai-editor monaco-editor vue
```

### [`@monacopilot/example`](./packages/example)
Example application showcasing all features and usage examples

- Interactive examples for all components
- Plugin system demonstrations
- AI configuration examples
- Real-time code editing with AI assistance

## 🚀 Quick Start

### Using the NPM Package

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

const code = ref(\`// Start coding with AI assistance!
console.log('Hello, Monaco AI Editor!')\`)
</script>
```

**Important:** Setup Monaco workers in your main.ts before mounting the app:

```typescript
// main.ts - Setup before app mount
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Full language support (recommended)
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  }
}

// Then mount your app
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

### Running the Example

```bash
# Install dependencies
pnpm install

# Start example application
pnpm dev

# Build library and demo
pnpm build
```

## 🛠️ Development

This is a monorepo managed with pnpm workspaces.

### Available Scripts

```bash
# Development
pnpm dev              # Start example application
pnpm dev:lib          # Start library in watch mode

# Building
pnpm build            # Build library and demo
pnpm build:lib        # Build library only
pnpm build:demo       # Build demo only

# Publishing
pnpm publish:lib      # Publish library to NPM
pnpm changeset        # Create changeset for versioning

# Utilities
pnpm type-check       # Type check all packages
pnpm lint             # Lint all packages
pnpm clean            # Clean all build artifacts
```

### Project Structure

```
monaco-ai-editor-monorepo/
├── packages/
│   ├── monaco-ai-editor/     # 📦 NPM Package
│   │   ├── src/              # Source code
│   │   ├── dist/             # Built library
│   │   ├── package.json      # Package configuration
│   │   ├── vite.config.ts    # Build configuration
│   │   └── README.md         # Package documentation
│   │
│   └── example/                 # 🎪 Example Application
│       ├── src/              # Example source code
│       ├── components/       # Example components
│       ├── package.json      # Example dependencies
│       └── vite.config.ts    # Example build config
│
├── package.json              # Monorepo configuration
├── pnpm-workspace.yaml       # Workspace configuration
└── tsconfig.json             # TypeScript configuration
```

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

## 📖 Documentation

- **[Library Documentation](./packages/monaco-ai-editor/README.md)** - Complete API reference and usage guide
- **[Plugin System](./PLUGIN_SYSTEM.md)** - How to create and use plugins
- **[Language Features](./LANGUAGE_FEATURES.md)** - Supported languages and features
- **[Examples](./packages/example/src/)** - Live examples and demos

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes and add tests
4. Commit with conventional commits: \`git commit -m 'feat: add amazing feature'\`
5. Push to the branch: \`git push origin feature/amazing-feature\`
6. Open a Pull Request

### Development Workflow

```bash
# Clone the repository
git clone <repository-url>
cd monaco-ai-editor-monorepo

# Install dependencies
pnpm install

# Start development
pnpm dev

# Make changes to packages/monaco-ai-editor/src/

# Test your changes in the demo
# The demo automatically uses the local library

# Build and test
pnpm build
pnpm type-check

# Create changeset for versioning
pnpm changeset

# Publish (maintainers only)
pnpm changeset:version
pnpm publish:lib
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to the amazing open-source projects that make this possible:

- **[Monacopilot](https://github.com/arshad-yaseen/monacopilot)** - The core AI completion engine that powers our intelligent code suggestions
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - The powerful code editor that powers VS Code
- **[Shiki](https://shiki.matsu.io/)** - Beautiful syntax highlighting
- **[Vue.js](https://vuejs.org/)** - The progressive JavaScript framework

## 🔗 Links

- **[NPM Package](https://www.npmjs.com/package/monaco-ai-editor)**
- **[Documentation](./packages/monaco-ai-editor/README.md)**
- **[Example Application](./packages/example)**
- **[Issues](https://github.com/Wadehl/monaco-ai-editor/issues)**
- **[Changelog](./packages/monaco-ai-editor/CHANGELOG.md)**