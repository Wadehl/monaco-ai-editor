<script setup lang="ts">
import { ref, watch } from 'vue'
import { MonacoAIEditor, pluginManager } from 'monaco-ai-editor'
import CodeExample from './components/CodeExample.vue'
import { EXAMPLE_CONFIG } from './config'
import { demoCodeTemplates } from './demo-templates'
import { pluginExampleCode } from './plugin-examples'

// shadcn-vue components
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Label } from './components/ui/label'
import { Separator } from './components/ui/separator'

// Icons from lucide-vue-next
import { Settings, Code, Palette, FileText } from 'lucide-vue-next'

// Initialize plugins
import './plugins-setup'

// Feature badges data
const features = [
  { icon: '🎯', text: 'Monaco Editor Integration' },
  { icon: '🤖', text: 'AI Code Completion' },
  { icon: '🔄', text: 'Multi-Runtime Support' },
  { icon: '🛡️', text: 'Smart Fallback' },
  { icon: '📝', text: 'v-model Support' },
  { icon: '🔌', text: 'Plugin System' },
  { icon: '🌈', text: 'External Plugins (Shiki)' }
]

// Demo state
const editorRef = ref()

// Language and theme selection
const selectedLanguage = ref('javascript')
const selectedTheme = ref('one-dark-pro')

// Available languages and themes
const availableLanguages = [
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'vue', label: 'Vue SFC', ext: '.vue' },
  { value: 'html', label: 'HTML', ext: '.html' },
  { value: 'css', label: 'CSS', ext: '.css' },
  { value: 'json', label: 'JSON', ext: '.json' },
  { value: 'markdown', label: 'Markdown', ext: '.md' },
  { value: 'python', label: 'Python', ext: '.py' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'cpp', label: 'C++', ext: '.cpp' }
]

const availableThemes = [
  { value: 'dark-plus', label: 'Dark Plus' },
  { value: 'light-plus', label: 'Light Plus' },
  { value: 'one-dark-pro', label: 'One Dark Pro' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' }
]

// Code content for v-model demo
const codeContent = ref('')

// 自动加载对应语言的Demo Code
const loadDemoCode = () => {
  const template = demoCodeTemplates[selectedLanguage.value]
  if (template) {
    codeContent.value = template
  }
}

// 监听语言变化，自动同步Demo Code
watch(selectedLanguage, () => {
  loadDemoCode()
}, { immediate: true }) // immediate: true 确保组件初始化时也会执行

// Editor ready handler
const handleEditorReady = (editor: any) => {
  console.log('Monaco AI Editor ready:', editor)
  console.log('Available plugins:', pluginManager.getAll().map(p => p.name))
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Monaco AI Editor
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A powerful Monaco Editor component with integrated AI code completion, 
          supporting multiple AI providers and smart fallback mechanisms.
        </p>
        
        <!-- Feature badges -->
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <Badge v-for="feature in features" :key="feature.text" variant="secondary" class="px-3 py-1">
            <span class="mr-1">{{ feature.icon }}</span>
            {{ feature.text }}
          </Badge>
        </div>
      </div>

      <!-- Main content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Controls Panel -->
        <div class="lg:col-span-1">
          <Card class="sticky top-6">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Settings class="w-5 h-5" />
                Editor Settings
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Language Selection -->
              <div class="space-y-2">
                <Label class="flex items-center gap-2">
                  <Code class="w-4 h-4" />
                  Programming Language
                </Label>
                <Select v-model="selectedLanguage">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="lang in availableLanguages" 
                      :key="lang.value" 
                      :value="lang.value"
                    >
                      {{ lang.label }} {{ lang.ext }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Theme Selection -->
              <div class="space-y-2">
                <Label class="flex items-center gap-2">
                  <Palette class="w-4 h-4" />
                  Editor Theme
                </Label>
                <Select v-model="selectedTheme">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="theme in availableThemes" 
                      :key="theme.value" 
                      :value="theme.value"
                    >
                      {{ theme.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <!-- Status Info -->
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground flex items-center gap-1">
                    <FileText class="w-3 h-3" />
                    Characters
                  </span>
                  <Badge variant="outline" class="font-mono">{{ codeContent.length }}</Badge>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground flex items-center gap-1">
                    <Code class="w-3 h-3" />
                    Language
                  </span>
                  <Badge variant="outline">{{ availableLanguages.find(l => l.value === selectedLanguage)?.label }}</Badge>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground flex items-center gap-1">
                    <Palette class="w-3 h-3" />
                    Theme
                  </span>
                  <Badge variant="outline">{{ availableThemes.find(t => t.value === selectedTheme)?.label }}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Editor Panel -->
        <div class="lg:col-span-3">
          <Card class="overflow-hidden">
            <CardHeader class="pb-3">
              <CardTitle class="flex items-center gap-2">
                <Code class="w-5 h-5" />
                Code Editor
              </CardTitle>
              <p class="text-sm text-muted-foreground">
                Type code with AI-powered completion and syntax highlighting
              </p>
            </CardHeader>
            <CardContent class="p-0">
              <MonacoAIEditor 
                ref="editorRef"
                v-model="codeContent"
                :plugins="['shiki']"
                :plugin-options="{
                  shiki: {
                    themes: ['dark-plus', 'one-dark-pro', 'github-dark', 'vs-dark', 'light-plus', 'github-light', 'vs-light'],
                    langs: ['javascript', 'typescript', 'vue', 'html', 'css', 'json', 'markdown', 'python', 'java', 'cpp'],
                    defaultTheme: selectedTheme
                  }
                }"
                :language="selectedLanguage"
                :theme="selectedTheme"
                height="600px"
                :show-a-i-config-button="EXAMPLE_CONFIG.SHOW_AI_CONFIG_BUTTON"
                :request-mode="EXAMPLE_CONFIG.REQUEST_MODE"
                :ai-config="EXAMPLE_CONFIG"
                @ready="handleEditorReady"
                class="rounded-lg overflow-hidden border"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Usage Examples -->
      <div class="mt-16">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">Usage Examples</CardTitle>
            <p class="text-muted-foreground">
              Learn how to integrate and use Monaco AI Editor in your projects
            </p>
          </CardHeader>
          <CardContent class="space-y-6">
            <CodeExample 
              title="1. Basic Usage"
              language="vue"
              height="280px"
              code="<template>
  <MonacoAIEditor 
    v-model=&quot;code&quot;
    height=&quot;400px&quot;
    @ready=&quot;onReady&quot;
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor } from './monaco-ai-editor'

const code = ref('console.log(&quot;Hello World&quot;)')
const onReady = (editor) => {
  console.log('Editor ready:', editor)
}
</script>"
            />

            <CodeExample 
              title="2. Available Exports"
              language="typescript"
              height="400px"
              code="import {
  // Components
  MonacoAIEditor,
  AIConfigPanel,
  
  // Hooks
  useAIConfig,
  
  // Utils
  transformCompletionRequest,
  transformCompletionResponse,
  getProviderHeaders,
  buildProviderUrl,
  
  // Config & Types
  CONFIG,
  type AIConfig
} from './monaco-ai-editor'"
            />

            <CodeExample 
              title="3. Monaco Worker Configuration"
              language="typescript"
              height="450px"
              code="// Setup in main.ts (before app mount)
import { createWorkerConfig, SUPPORTED_LANGUAGES } from 'monaco-ai-editor'

// Option 1: Minimal setup (~1.9MB)
// Basic syntax highlighting for all 80+ languages
self.MonacoEnvironment = createWorkerConfig.minimal()

// Option 2: Selective workers (~3-5MB) - Recommended
// Enable specific language workers for IntelliSense
self.MonacoEnvironment = createWorkerConfig.selective([
  'typescript', // TypeScript/JavaScript IntelliSense
  'json',       // JSON validation and completion
  'css',        // CSS/SCSS/LESS support
  'html'        // HTML/Handlebars/Razor support
])

// Option 3: All workers (~8-10MB)
// Full language support with IntelliSense for all worker-supported languages
self.MonacoEnvironment = createWorkerConfig.all()

// All supported languages (80+ languages available)
console.log('Supported languages:', SUPPORTED_LANGUAGES)
// ['abap', 'apex', 'cpp', 'csharp', 'go', 'java', 'python', 'rust', ...]

// Component usage (no worker config needed in component)
&lt;template&gt;
  &lt;MonacoAIEditor 
    v-model=&quot;code&quot;
    language=&quot;python&quot;
    @ready=&quot;onReady&quot;
  /&gt;
&lt;/template&gt;"
            />

            <CodeExample 
              title="4. External Plugin System - Shiki Syntax Highlighting"
              language="vue"
              height="400px"
              :code="pluginExampleCode"
            />

            <CodeExample 
              title="5. Creating Custom Plugins"
              language="typescript"
              height="500px"
              code="import { MonacoPlugin, pluginManager } from './monaco-ai-editor'

// Define a custom plugin
const myCustomPlugin: MonacoPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'A custom plugin for specialized functionality',
  
  defaultOptions: {
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

// Register and use the plugin
pluginManager.register(myCustomPlugin)

// Use in component
const editorProps = {
  plugins: ['my-custom-plugin'],
  pluginOptions: {
    'my-custom-plugin': {
      customSetting: 'custom-value'
    }
  }
}"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>