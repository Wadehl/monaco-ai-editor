// Language-specific demo code templates
export const demoCodeTemplates: Record<string, string> = {
  javascript: `// Monaco AI Editor Demo with Plugins
// Try typing JavaScript code with AI-powered completion!

// Simple function example
function greet(name) {
  return \`Hello, \${name}! Welcome to Monaco AI Editor\`;
}

console.log(greet('Developer'));

// Try some modern JavaScript features
const users = [
  { name: 'Alice', role: 'developer' },
  { name: 'Bob', role: 'designer' }
];

const developers = users.filter(user => user.role === 'developer');
console.log(developers);`,

  typescript: `// TypeScript Demo
interface User {
  id: number;
  name: string;
  email?: string;
}

// Example user
const user: User = {
  id: 1,
  name: 'Developer'
};

function createUser(name: string, email?: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email
  };
}

const newUser = createUser('AI Assistant');
console.log(newUser);`,

  vue: `<template>
  <div class="monaco-editor-demo">
    <header class="demo-header">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </header>
    
    <main class="demo-content">
      <!-- Code Editor Section -->
      <section class="editor-section">
        <h2>Monaco AI Editor Integration</h2>
        <MonacoAIEditor 
          v-model="code"
          :language="selectedLanguage"
          :theme="selectedTheme" 
          height="300px"
          :plugins="['shiki']"
          :plugin-options="pluginOptions"
          @ready="handleEditorReady"
        />
      </section>
      
      <!-- Control Panel -->
      <aside class="control-panel">
        <div class="control-group">
          <label for="language">Language:</label>
          <select v-model="selectedLanguage" id="language">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="vue">Vue SFC</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="theme">Theme:</label>
          <select v-model="selectedTheme" id="theme">
            <option value="dark-plus">Dark Plus</option>
            <option value="light-plus">Light Plus</option>
            <option value="one-dark-pro">One Dark Pro</option>
          </select>
        </div>
        
        <button @click="formatCode" class="format-btn">
          Format Code
        </button>
      </aside>
      
      <!-- Live Preview -->
      <section class="preview-section">
        <h3>Live Preview</h3>
        <div class="preview-content">
          <pre><code>{{ code }}</code></pre>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MonacoAIEditor, pluginManager } from 'monaco-ai-editor'
import { shikiPlugin } from './plugins/shiki-plugin'

// Register external Shiki plugin
pluginManager.register(shikiPlugin)

// Demo data
const title = ref('Monaco AI Editor Vue Demo')
const subtitle = ref('Experience AI-powered code completion in Vue.js')

// Editor state
const code = ref(\`console.log('Hello from Monaco AI Editor!');\`)
const selectedLanguage = ref('javascript')
const selectedTheme = ref('dark-plus')

// Plugin configuration
const pluginOptions = computed(() => ({
  shiki: {
    themes: ['dark-plus', 'light-plus', 'one-dark-pro'],
    langs: ['javascript', 'typescript', 'vue', 'html', 'css'],
    defaultTheme: selectedTheme.value
  }
}))

// Editor event handlers
const handleEditorReady = (editor: any) => {
  console.log('Monaco AI Editor ready:', editor)
  console.log('Available themes:', pluginOptions.value.shiki.themes)
}

const formatCode = () => {
  // Simulate code formatting
  console.log('Formatting code...')
}

// Watch for language changes and update demo code
watch(selectedLanguage, (newLang) => {
  const demoCode = {
    javascript: \`console.log('Hello from Monaco AI Editor!');\`,
    typescript: \`const message: string = 'Hello TypeScript!';\\nconsole.log(message);\`,
    vue: \`<template>\\n  <div>Hello Vue!</div>\\n</template>\`,
    html: \`<!DOCTYPE html>\\n<html>\\n<head>\\n  <title>Demo</title>\\n</head>\\n<body>\\n  <h1>Hello HTML!</h1>\\n</body>\\n</html>\`,
    css: \`.demo { color: blue; }\`
  }
  code.value = demoCode[newLang as keyof typeof demoCode] || ''
})
</script>

<style scoped>
.monaco-editor-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.demo-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  grid-template-areas: 
    "editor controls"
    "preview controls";
}

.editor-section {
  grid-area: editor;
}

.control-panel {
  grid-area: controls;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.control-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.format-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.format-btn:hover {
  background: #0056b3;
}

.preview-section {
  grid-area: preview;
  margin-top: 2rem;
}

.preview-content {
  background: #f1f3f4;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

@media (max-width: 768px) {
  .demo-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "editor"
      "controls"
      "preview";
  }
}
</style>`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monaco AI Editor HTML Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .demo-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .code-editor {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      overflow-x: auto;
    }
    
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    button:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🚀 Monaco AI Editor</h1>
      <p>Experience next-generation code editing with AI-powered completion</p>
    </header>
    
    <main>
      <section class="demo-grid">
        <article class="demo-card">
          <h3>🎯 Key Features</h3>
          <ul>
            <li>AI-powered code completion</li>
            <li>Multi-language support</li>
            <li>Plugin system architecture</li>
            <li>Real-time syntax highlighting</li>
            <li>Smart error detection</li>
          </ul>
        </article>
        
        <article class="demo-card">
          <h3>⚡ Quick Start</h3>
          <div class="code-editor">
&lt;MonacoAIEditor 
  v-model="code"
  language="javascript"
  theme="dark-plus"
  :plugins="['shiki']"
  @ready="onEditorReady"
/&gt;
          </div>
        </article>
        
        <article class="demo-card">
          <h3>🔌 Plugin Integration</h3>
          <p>Easily extend functionality with our powerful plugin system. Add syntax highlighting, code formatting, and custom language support.</p>
          <button onclick="alert('Explore our plugin documentation!')">
            Learn More
          </button>
        </article>
        
        <article class="demo-card">
          <h3>🌈 Theme Support</h3>
          <p>Choose from multiple built-in themes or create your own custom theme to match your application's design.</p>
          <select onchange="alert('Theme changed to: ' + this.value)">
            <option value="dark-plus">Dark Plus</option>
            <option value="light-plus">Light Plus</option>
            <option value="one-dark-pro">One Dark Pro</option>
            <option value="github-dark">GitHub Dark</option>
          </select>
        </article>
      </section>
    </main>
    
    <footer style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee;">
      <p>&copy; 2024 Monaco AI Editor. Built with ❤️ for developers.</p>
    </footer>
  </div>
  
  <script>
    // Demo JavaScript functionality
    console.log('Monaco AI Editor HTML Demo loaded!');
    
    // Simulate dynamic content loading
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing Monaco AI Editor demo...');
      
      // Add some interactive functionality
      const cards = document.querySelectorAll('.demo-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });
      });
    });
  </script>
</body>
</html>`,

  css: `/* Monaco AI Editor Styles */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --bg-dark: #1e1e1e;
  --bg-light: #ffffff;
  --text-dark: #ffffff;
  --text-light: #333333;
}

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text-dark);
  background: var(--bg-dark);
}

/* Component Styles */
.monaco-editor-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.monaco-editor-container:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* Monaco Editor Integration */
.monaco-ai-editor {
  position: relative;
  /* border: 1px solid var(--primary-color); */
  border-radius: 8px;
  overflow: hidden;
}

.monaco-ai-editor .toolbar {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monaco-ai-editor .editor-content {
  min-height: 300px;
}

/* Theme Support */
.theme-dark {
  --bg-primary: #1e1e1e;
  --text-primary: #d4d4d4;
  --border-color: #333;
}

.theme-light {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  --border-color: #e1e5e9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .monaco-editor-container {
    border-radius: 0;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .monaco-ai-editor .toolbar {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Animation Classes */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Plugin System Styles */
.plugin-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.plugin-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.plugin-status.active {
  background: #d4edda;
  color: #155724;
}

.plugin-status.inactive {
  background: #f8d7da;
  color: #721c24;
}`,

  json: `{
  "name": "monaco-ai-editor-demo",
  "version": "1.0.0",
  "description": "AI-powered Monaco Editor with plugin system",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "@vueuse/core": "^13.5.0",
    "monaco-editor": "^0.52.2",
    "monacopilot": "^1.2.7",
    "shiki": "^3.8.1",
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@shikijs/monaco": "^3.8.1",
    "@vitejs/plugin-vue": "^6.0.0",
    "@vue/tsconfig": "^0.7.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "vue-tsc": "^2.2.12"
  },
  "keywords": [
    "monaco-editor",
    "ai",
    "code-completion",
    "vue",
    "typescript",
    "plugin-system",
    "syntax-highlighting"
  ],
  "author": "Monaco AI Editor Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/monacoai/monaco-ai-editor"
  },
  "bugs": {
    "url": "https://github.com/monacoai/monaco-ai-editor/issues"
  },
  "homepage": "https://github.com/monacoai/monaco-ai-editor#readme",
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    },
    "./dist/style.css": "./dist/style.css"
  }
}`,

  markdown: `# Monaco AI Editor

![Monaco AI Editor](https://img.shields.io/badge/Monaco-AI%20Editor-blue.svg)
![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## 🚀 Overview

Monaco AI Editor is a powerful code editor component built on top of Monaco Editor with integrated AI-powered code completion. It provides intelligent coding assistance and supports multiple programming languages with extensible plugin architecture.

## ✨ Key Features

- **🤖 AI-Powered Completion**: Intelligent code suggestions using advanced language models
- **🎯 Multi-Language Support**: JavaScript, TypeScript, Vue, HTML, CSS, Python, Java, C++, and more
- **🔌 Plugin System**: Extensible architecture for custom functionality
- **🌈 Theme Support**: Multiple built-in themes with custom theme creation
- **⚡ Real-time Highlighting**: VS Code-level syntax highlighting via Shiki
- **🛡️ Smart Fallback**: Automatic fallback between backend and browser modes
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices

## 📦 Installation

\`\`\`bash
# Using npm
npm install monaco-ai-editor

# Using yarn
yarn add monaco-ai-editor

# Using pnpm
pnpm add monaco-ai-editor
\`\`\`

## 🎯 Quick Start

\`\`\`vue
<template>
  <MonacoAIEditor 
    v-model="code"
    language="javascript"
    theme="dark-plus"
    height="400px"
    :plugins="['shiki']"
    @ready="onEditorReady"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor } from 'monaco-ai-editor'

const code = ref('console.log("Hello World!")')

const onEditorReady = (editor) => {
  console.log('Editor ready:', editor)
}
</script>
\`\`\`

## ⚙️ Configuration

### AI Providers

Configure AI completion with multiple providers:

\`\`\`javascript
const aiConfig = {
  BACKEND_URL: 'http://localhost:3001',
  REQUEST_MODE: 'hybrid', // 'backend' | 'browser' | 'hybrid'
  BROWSER_AI: {
    CURRENT_PROVIDER: 'anthropic',
    ANTHROPIC: {
      BASE_URL: 'https://api.anthropic.com/v1/messages',
      API_KEY: 'your-api-key',
      MODEL: 'claude-3-sonnet-20240229'
    },
    OPENAI: {
      BASE_URL: 'https://api.openai.com/v1/chat/completions',
      API_KEY: 'your-api-key', 
      MODEL: 'gpt-4'
    }
  }
}
\`\`\`

### Plugin Configuration

\`\`\`javascript
const pluginOptions = {
  shiki: {
    themes: ['dark-plus', 'light-plus', 'one-dark-pro'],
    langs: ['javascript', 'typescript', 'vue', 'html', 'css'],
    defaultTheme: 'dark-plus'
  }
}
\`\`\`

## 🔌 Creating Custom Plugins

\`\`\`javascript
import { MonacoPlugin, pluginManager } from 'monaco-ai-editor'

const myCustomPlugin: MonacoPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'Custom functionality plugin',
  
  defaultOptions: {
    customSetting: 'default-value'
  },
  
  lifecycle: {
    async beforeCreate(context) {
      // Setup before editor creation
      console.log('Plugin initializing...', context.options)
    },
    
    async afterCreate(context) {
      const { editor, monaco } = context
      
      // Add custom commands, decorations, etc.
      editor.addCommand(monaco.KeyCode.F12, () => {
        console.log('Custom F12 command triggered!')
      })
    }
  }
}

// Register the plugin
pluginManager.register(myCustomPlugin)
\`\`\`

## 📊 Performance

- **⚡ Fast Loading**: Optimized bundle size with code splitting
- **🔄 Smart Caching**: Intelligent caching for faster subsequent loads  
- **📦 Tree Shaking**: Only bundle what you use
- **🚀 Web Workers**: Background processing for syntax highlighting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Powered by [Shiki](https://shiki.matsu.io/) for syntax highlighting
- AI completion via [Monacopilot](https://github.com/arshad-yaseen/monacopilot)

---

*Made with ❤️ by the Monaco AI Editor team*`,

  python: `# Monaco AI Editor Python Demo
import json
from typing import Dict, List, Optional

class CodeEditor:
    """Monaco AI Editor with Python integration."""
    
    def __init__(self, language: str = "python", theme: str = "dark-plus"):
        self.language = language
        self.theme = theme
        self.plugins: List[str] = []
        self.content = ""
    
    def add_plugin(self, plugin_name: str) -> None:
        """Add a plugin to the editor."""
        if plugin_name not in self.plugins:
            self.plugins.append(plugin_name)
            print(f"Plugin '{plugin_name}' added successfully!")
    
    def set_content(self, content: str) -> None:
        """Set editor content."""
        self.content = content
        print(f"Content updated: {len(content)} characters")
    
    def get_config(self) -> Dict[str, any]:
        """Get editor configuration."""
        return {
            "language": self.language,
            "theme": self.theme,
            "plugins": self.plugins,
            "content_length": len(self.content)
        }
    
    def format_code(self) -> str:
        """Format the current code content."""
        # Simulate code formatting
        lines = self.content.split('\\n')
        formatted_lines = []
        
        for line in lines:
            stripped = line.strip()
            if stripped:
                formatted_lines.append(f"    {stripped}")
            else:
                formatted_lines.append("")
        
        return '\\n'.join(formatted_lines)

# Example usage
if __name__ == "__main__":
    editor = CodeEditor("python", "one-dark-pro")
    editor.add_plugin("shiki")
    editor.add_plugin("ai-completion")
    
    sample_code = """
def hello_world():
    print("Hello from Monaco AI Editor!")
    return True
    
hello_world()
"""
    
    editor.set_content(sample_code)
    config = editor.get_config()
    
    print("Editor Configuration:")
    print(json.dumps(config, indent=2))`,

  java: `// Monaco AI Editor Java Demo
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Monaco AI Editor integration example in Java
 */
public class MonacoAIEditor {
    private String language;
    private String theme;
    private List<String> plugins;
    private String content;
    
    public MonacoAIEditor(String language, String theme) {
        this.language = language;
        this.theme = theme;
        this.plugins = new ArrayList<>();
        this.content = "";
    }
    
    /**
     * Add a plugin to the editor
     */
    public void addPlugin(String pluginName) {
        if (!plugins.contains(pluginName)) {
            plugins.add(pluginName);
            System.out.println("Plugin '" + pluginName + "' added successfully!");
        }
    }
    
    /**
     * Set editor content
     */
    public void setContent(String content) {
        this.content = content;
        System.out.println("Content updated: " + content.length() + " characters");
    }
    
    /**
     * Get editor configuration
     */
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("language", language);
        config.put("theme", theme);
        config.put("plugins", plugins);
        config.put("contentLength", content.length());
        return config;
    }
    
    public static void main(String[] args) {
        MonacoAIEditor editor = new MonacoAIEditor("java", "dark-plus");
        editor.addPlugin("shiki");
        editor.addPlugin("ai-completion");
        
        String sampleCode = """
            public class HelloWorld {
                public static void main(String[] args) {
                    System.out.println("Hello from Monaco AI Editor!");
                }
            }
            """;
        
        editor.setContent(sampleCode);
        
        System.out.println("Editor Configuration:");
        editor.getConfig().forEach((key, value) -> 
            System.out.println(key + ": " + value)
        );
    }
}`,

  cpp: `// Monaco AI Editor C++ Demo
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <memory>

/**
 * Monaco AI Editor C++ Integration
 */
class MonacoAIEditor {
private:
    std::string language;
    std::string theme;
    std::vector<std::string> plugins;
    std::string content;

public:
    MonacoAIEditor(const std::string& lang, const std::string& th) 
        : language(lang), theme(th) {}
    
    /**
     * Add a plugin to the editor
     */
    void addPlugin(const std::string& pluginName) {
        auto it = std::find(plugins.begin(), plugins.end(), pluginName);
        if (it == plugins.end()) {
            plugins.push_back(pluginName);
            std::cout << "Plugin '" << pluginName << "' added successfully!" << std::endl;
        }
    }
    
    /**
     * Set editor content
     */
    void setContent(const std::string& newContent) {
        content = newContent;
        std::cout << "Content updated: " << content.length() << " characters" << std::endl;
    }
    
    /**
     * Get editor configuration
     */
    std::map<std::string, std::string> getConfig() const {
        std::map<std::string, std::string> config;
        config["language"] = language;
        config["theme"] = theme;
        config["pluginCount"] = std::to_string(plugins.size());
        config["contentLength"] = std::to_string(content.length());
        return config;
    }
};

int main() {
    MonacoAIEditor editor("cpp", "one-dark-pro");
    
    editor.addPlugin("shiki");
    editor.addPlugin("ai-completion");
    
    std::string sampleCode = R"(
#include <iostream>
int main() {
    std::cout << "Hello from Monaco AI Editor!" << std::endl;
    return 0;
}
)";
    
    editor.setContent(sampleCode);
    
    std::cout << "\\nEditor Configuration:" << std::endl;
    auto config = editor.getConfig();
    for (const auto& [key, value] : config) {
        std::cout << key << ": " << value << std::endl;
    }
    
    return 0;
}`
};