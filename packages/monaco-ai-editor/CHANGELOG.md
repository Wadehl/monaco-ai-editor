# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-07-31

### Added
- 🔧 Externalized Monaco worker configuration system for better flexibility
- 📦 New `createWorkerConfig` utility functions (`minimal`, `selective`, `all`)
- 🌐 Support for 80+ programming languages with Monaco Editor
- 📋 Comprehensive language list with file extensions (`SUPPORTED_LANGUAGES`)
- 🔄 Improved worker management with selective language support
- 📊 Better bundle size control through configurable worker loading

### Enhanced
- ⚡ **Example Application**: Complete UI overhaul with modern design
  - 🎮 Interactive Playground section moved to top
  - 📦 Tabbed installation interface (npm/yarn/pnpm/bun)
  - 🚀 Dedicated QuickStart section with essential examples
  - 📚 Reorganized Usage Examples with better categorization
  - ⚡ Advanced Features section for plugin system documentation
- 🔍 **Language Selector**: Searchable dropdown with all supported languages
  - 🔎 Real-time search functionality
  - 📝 Language names with file extensions display
  - ✅ Check indicator for selected language
  - 📏 Auto-height CodeExample components

### Improved
- 🏗️ **Worker Configuration**: More flexible and performant setup
  - Minimal setup (~1.9MB) for basic syntax highlighting
  - Selective workers (~3-5MB) for specific language features
  - All workers (~8-10MB) for complete language support
- 🎨 **UI/UX**: Enhanced user interface and experience
  - Better responsive design
  - Consistent styling with shadcn-vue components
  - Improved code example display with auto-sizing
- 📖 **Documentation**: Better organized and more comprehensive examples

### Technical
- 🔧 Refactored Monaco worker loading system
- 📦 Added support for selective bundle optimization
- 🛠️ Improved TypeScript definitions for worker configuration
- 🔌 Enhanced plugin system compatibility

## [1.0.1] - 2025-07-30

### Fixed
- 🐛 Monorepo structure and security improvements
- 📦 Package dependencies and build configuration
- 🔒 Enhanced security measures

## [1.0.0] - 2025-07-29

### Added
- 🎉 Initial release of Monaco AI Editor
- 🤖 AI code completion with multiple provider support (OpenAI, Claude, Gemini)
- 🎯 Monaco Editor integration with Vue.js
- 🔄 Multi-runtime support (server-side and browser-side)
- 🛡️ Smart fallback mechanisms
- 📝 v-model support for reactive data binding
- 🎨 Dynamic TypeScript type definition updates
- 🔌 Extensible plugin system architecture
- 🌈 Shiki syntax highlighting plugin
- 🎭 Multiple theme support (Dark Plus, Light Plus, One Dark Pro, GitHub themes)
- 📱 Responsive design with mobile support
- 🔧 Comprehensive TypeScript support
- 📖 Complete documentation and examples

### Features
- **MonacoAIEditor** - Main editor component with AI integration
- **AIConfigPanel** - Configuration panel for AI providers
- **useAIConfig** - Composable for AI configuration management
- **useTypeManager** - Composable for dynamic type management
- **Plugin System** - Extensible plugin architecture
- **Shiki Plugin** - Advanced syntax highlighting
- **Monaco Worker** - Web worker integration for better performance

### Developer Experience
- Full TypeScript support with comprehensive type definitions
- ESM and CJS builds for maximum compatibility
- Tree-shakeable exports
- Comprehensive test suite
- Development server with hot reload
- Example applications and documentation