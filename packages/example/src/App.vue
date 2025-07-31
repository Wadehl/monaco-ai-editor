<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { MonacoAIEditor, pluginManager, SUPPORTED_LANGUAGES } from "monaco-ai-editor";
import CodeExample from "./components/CodeExample.vue";
import { EXAMPLE_CONFIG } from "./config";
import { demoCodeTemplates } from "./demo-templates";
import { pluginExampleCode } from "./plugin-examples";

// shadcn-vue components
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { 
  Combobox, 
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput, 
  ComboboxItem, 
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from "./components/ui/combobox";
import { Button } from "./components/ui/button";

// Icons from lucide-vue-next
import { Settings, Code, Palette, FileText, Search, Check, ChevronDown } from "lucide-vue-next";

// Initialize plugins
import "./plugins-setup";

// Feature badges data
const features = [
  { icon: "🎯", text: "Monaco Editor Integration" },
  { icon: "🤖", text: "AI Code Completion" },
  { icon: "🔄", text: "Multi-Runtime Support" },
  { icon: "🛡️", text: "Smart Fallback" },
  { icon: "📝", text: "v-model Support" },
  { icon: "🔌", text: "Plugin System" },
  { icon: "🌈", text: "External Plugins (Shiki)" },
];

// Demo state
const editorRef = ref();

// Language and theme selection
const selectedLanguage = ref(null);
const selectedTheme = ref("one-dark-pro");

// Create language options with file extensions
const createLanguageOptions = () => {
  const extensionMap: Record<string, string> = {
    'abap': '.abap',
    'apex': '.cls',
    'azcli': '.azcli',
    'bat': '.bat',
    'bicep': '.bicep',
    'cameligo': '.mligo',
    'clojure': '.clj',
    'coffee': '.coffee',
    'cpp': '.cpp',
    'csharp': '.cs',
    'csp': '.csp',
    'css': '.css',
    'cypher': '.cypher',
    'dart': '.dart',
    'dockerfile': 'Dockerfile',
    'ecl': '.ecl',
    'elixir': '.ex',
    'flow9': '.flow',
    'freemarker2': '.ftl',
    'fsharp': '.fs',
    'go': '.go',
    'graphql': '.graphql',
    'handlebars': '.hbs',
    'hcl': '.hcl',
    'html': '.html',
    'ini': '.ini',
    'java': '.java',
    'javascript': '.js',
    'json': '.json',
    'julia': '.jl',
    'kotlin': '.kt',
    'less': '.less',
    'lexon': '.lex',
    'liquid': '.liquid',
    'lua': '.lua',
    'm3': '.m3',
    'markdown': '.md',
    'mdx': '.mdx',
    'mips': '.mips',
    'msdax': '.dax',
    'mysql': '.sql',
    'objective-c': '.m',
    'pascal': '.pas',
    'pascaligo': '.ligo',
    'perl': '.pl',
    'pgsql': '.sql',
    'php': '.php',
    'pla': '.pla',
    'postiats': '.dats',
    'powerquery': '.pq',
    'powershell': '.ps1',
    'protobuf': '.proto',
    'pug': '.pug',
    'python': '.py',
    'qsharp': '.qs',
    'r': '.r',
    'razor': '.cshtml',
    'redis': '.redis',
    'redshift': '.sql',
    'restructuredtext': '.rst',
    'ruby': '.rb',
    'rust': '.rs',
    'sb': '.sb',
    'scala': '.scala',
    'scheme': '.scm',
    'scss': '.scss',
    'shell': '.sh',
    'solidity': '.sol',
    'sophia': '.aes',
    'sparql': '.sparql',
    'sql': '.sql',
    'st': '.st',
    'swift': '.swift',
    'systemverilog': '.sv',
    'tcl': '.tcl',
    'test': '.test',
    'twig': '.twig',
    'typescript': '.ts',
    'typespec': '.tsp',
    'vb': '.vb',
    'wgsl': '.wgsl',
    'xml': '.xml',
    'yaml': '.yml',
    'vue': '.vue'
  }

  const languageNames: Record<string, string> = {
    'abap': 'ABAP',
    'apex': 'Apex',
    'azcli': 'Azure CLI',
    'bat': 'Batch',
    'bicep': 'Bicep',
    'cameligo': 'CameLIGO',
    'clojure': 'Clojure',
    'coffee': 'CoffeeScript',
    'cpp': 'C++',
    'csharp': 'C#',
    'csp': 'CSP',
    'css': 'CSS',
    'cypher': 'Cypher',
    'dart': 'Dart',
    'dockerfile': 'Dockerfile',
    'ecl': 'ECL',
    'elixir': 'Elixir',
    'flow9': 'Flow9',
    'freemarker2': 'FreeMarker2',
    'fsharp': 'F#',
    'go': 'Go',
    'graphql': 'GraphQL',
    'handlebars': 'Handlebars',
    'hcl': 'HCL',
    'html': 'HTML',
    'ini': 'INI',
    'java': 'Java',
    'javascript': 'JavaScript',
    'json': 'JSON',
    'julia': 'Julia',
    'kotlin': 'Kotlin',
    'less': 'Less',
    'lexon': 'Lexon',
    'liquid': 'Liquid',
    'lua': 'Lua',
    'm3': 'Modula-3',
    'markdown': 'Markdown',
    'mdx': 'MDX',
    'mips': 'MIPS',
    'msdax': 'MS DAX',
    'mysql': 'MySQL',
    'objective-c': 'Objective-C',
    'pascal': 'Pascal',
    'pascaligo': 'PascaLIGO',
    'perl': 'Perl',
    'pgsql': 'PostgreSQL',
    'php': 'PHP',
    'pla': 'PLA',
    'postiats': 'ATS',
    'powerquery': 'Power Query',
    'powershell': 'PowerShell',
    'protobuf': 'Protocol Buffers',
    'pug': 'Pug',
    'python': 'Python',
    'qsharp': 'Q#',
    'r': 'R',
    'razor': 'Razor',
    'redis': 'Redis',
    'redshift': 'Redshift',
    'restructuredtext': 'reStructuredText',
    'ruby': 'Ruby',
    'rust': 'Rust',
    'sb': 'Small Basic',
    'scala': 'Scala',
    'scheme': 'Scheme',
    'scss': 'SCSS',
    'shell': 'Shell',
    'solidity': 'Solidity',
    'sophia': 'Sophia',
    'sparql': 'SPARQL',
    'sql': 'SQL',
    'st': 'Structured Text',
    'swift': 'Swift',
    'systemverilog': 'SystemVerilog',
    'tcl': 'Tcl',
    'test': 'Test',
    'twig': 'Twig',
    'typescript': 'TypeScript',
    'typespec': 'TypeSpec',
    'vb': 'Visual Basic',
    'wgsl': 'WGSL',
    'xml': 'XML',
    'yaml': 'YAML',
    'vue': 'Vue SFC'
  }

  // Add Vue to the supported languages list if not present
  const allLanguages = [...SUPPORTED_LANGUAGES, 'vue'].filter((lang, index, arr) => arr.indexOf(lang) === index)
  
  return allLanguages.map(lang => ({
    value: lang,
    label: languageNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1),
    ext: extensionMap[lang] || `.${lang}`,
  })).sort((a, b) => a.label.localeCompare(b.label))
}

// Available languages and themes
const availableLanguages = createLanguageOptions();

// Set default language
const defaultLanguage = availableLanguages.find(l => l.value === 'javascript') || availableLanguages[0]
selectedLanguage.value = defaultLanguage

const availableThemes = [
  { value: "dark-plus", label: "Dark Plus" },
  { value: "light-plus", label: "Light Plus" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-light", label: "GitHub Light" },
];

// Code content for v-model demo
const codeContent = ref("");

// 自动加载对应语言的Demo Code
const loadDemoCode = () => {
  const currentLang = selectedLanguage.value?.value || 'javascript';
  const template = demoCodeTemplates[currentLang];
  if (template) {
    codeContent.value = template;
  }
};

// 监听语言变化，自动同步Demo Code
watch(
  selectedLanguage,
  () => {
    loadDemoCode();
  },
  { immediate: true }
); // immediate: true 确保组件初始化时也会执行

// Editor ready handler
const handleEditorReady = (editor: any) => {
  console.log("Monaco AI Editor ready:", editor);
  console.log(
    "Available plugins:",
    pluginManager.getAll().map((p) => p.name)
  );
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Monaco AI Editor
        </h1>
        <p
          class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          A powerful Monaco Editor component with integrated AI code completion,
          supporting multiple AI providers and smart fallback mechanisms.
        </p>

        <!-- Feature badges -->
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <Badge
            v-for="feature in features"
            :key="feature.text"
            variant="secondary"
            class="px-3 py-1"
          >
            <span class="mr-1">{{ feature.icon }}</span>
            {{ feature.text }}
          </Badge>
        </div>
      </div>

      <!-- Playground Section -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-3">🎮 Playground</h2>
          <p class="text-lg text-muted-foreground">
            Try the editor right now! Change language, theme, and see AI
            completion in action.
          </p>
        </div>

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
                  <Combobox v-model="selectedLanguage" by="label">
                    <ComboboxAnchor as-child>
                      <ComboboxTrigger as-child>
                        <Button variant="outline" class="w-full justify-between">
                          {{ selectedLanguage?.label ? `${selectedLanguage.label} ${selectedLanguage.ext}` : 'Select programming language' }}

                          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </ComboboxTrigger>
                    </ComboboxAnchor>

                    <ComboboxList class="w-full">
                      <div class="sticky top-0 bg-popover z-10 border-b border-border relative w-full items-center">
                        <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 rounded-none h-10" placeholder="Search languages..." />
                        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                          <Search class="size-4 text-muted-foreground" />
                        </span>
                      </div>

                      <div class="max-h-[250px] overflow-y-auto">
                        <ComboboxEmpty class="py-6 text-center text-sm text-muted-foreground">
                          No language found.
                        </ComboboxEmpty>

                        <ComboboxGroup class="p-1">
                          <ComboboxItem
                            v-for="lang in availableLanguages"
                            :key="lang.value"
                            :value="lang"
                            class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          >
                            {{ lang.label }} <span class="text-muted-foreground">{{ lang.ext }}</span>

                            <ComboboxItemIndicator>
                              <Check class="ml-auto h-4 w-4" />
                            </ComboboxItemIndicator>
                          </ComboboxItem>
                        </ComboboxGroup>
                      </div>
                    </ComboboxList>
                  </Combobox>
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
                    <Badge variant="outline" class="font-mono">{{
                      codeContent.length
                    }}</Badge>
                  </div>

                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-1">
                      <Code class="w-3 h-3" />
                      Language
                    </span>
                    <Badge variant="outline">{{
                      selectedLanguage?.label || 'Not selected'
                    }}</Badge>
                  </div>

                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-1">
                      <Palette class="w-3 h-3" />
                      Theme
                    </span>
                    <Badge variant="outline">{{
                      availableThemes.find((t) => t.value === selectedTheme)
                        ?.label
                    }}</Badge>
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
                      themes: [
                        'dark-plus',
                        'one-dark-pro',
                        'github-dark',
                        'vs-dark',
                        'light-plus',
                        'github-light',
                        'vs-light',
                      ],
                      langs: [
                        'javascript',
                        'typescript',
                        'vue',
                        'html',
                        'css',
                        'json',
                        'markdown',
                        'python',
                        'java',
                        'cpp',
                      ],
                      defaultTheme: selectedTheme,
                    },
                  }"
                  :language="selectedLanguage?.value || 'javascript'"
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
      </div>

      <!-- Install Section -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-3">📦 Installation</h2>
          <p class="text-lg text-muted-foreground">
            Get started with Monaco AI Editor in your project
          </p>
        </div>
        
        <Card>
          <CardContent class="p-6">
            <Tabs default-value="npm" class="w-full">
              <TabsList class="grid w-full grid-cols-4">
                <TabsTrigger value="npm">npm</TabsTrigger>
                <TabsTrigger value="yarn">yarn</TabsTrigger>
                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
                <TabsTrigger value="bun">bun</TabsTrigger>
              </TabsList>
              
              <TabsContent value="npm" class="mt-6">
                <CodeExample 
                  title="Install with npm"
                  language="bash"
                  code="npm install monaco-ai-editor"
                />
              </TabsContent>
              
              <TabsContent value="yarn" class="mt-6">
                <CodeExample 
                  title="Install with yarn"
                  language="bash"
                  code="yarn add monaco-ai-editor"
                />
              </TabsContent>
              
              <TabsContent value="pnpm" class="mt-6">
                <CodeExample 
                  title="Install with pnpm"
                  language="bash"
                  code="pnpm add monaco-ai-editor"
                />
              </TabsContent>
              
              <TabsContent value="bun" class="mt-6">
                <CodeExample 
                  title="Install with bun"
                  language="bash"
                  code="bun add monaco-ai-editor"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <!-- QuickStart Section -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-3">🚀 Quick Start</h2>
          <p class="text-lg text-muted-foreground">
            Basic setup examples to get you started in minutes
          </p>
        </div>

        <div class="space-y-6">
          <CodeExample
            title="1. Basic Setup"
            language="vue"
            code='<template>
  <MonacoAIEditor 
    v-model="code"
    height="400px"
    language="javascript"
    theme="dark-plus"
    @ready="onReady"
  />
</template>

<script setup>
import { ref } from &apos;vue&apos;
import { MonacoAIEditor } from &apos;monaco-ai-editor&apos;

const code = ref(&apos;console.log("Hello World")&apos;)
const onReady = (editor) => {
  console.log(&apos;Editor ready:&apos;, editor)
}
</script>'
          />

          <CodeExample
            title="2. Worker Configuration (Required)"
            language="typescript"
            code="// main.ts - Setup before app mount
import { createWorkerConfig } from 'monaco-ai-editor'

// Minimal setup (~1.9MB) - Basic syntax highlighting
self.MonacoEnvironment = createWorkerConfig.minimal()

// OR Selective workers (~3-5MB) - Recommended
self.MonacoEnvironment = createWorkerConfig.selective([
  'typescript', 'json', 'css', 'html'
])

// Then mount your app
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')"
          />
        </div>
      </div>

      <!-- Usage Examples -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-3">
            📚 Usage Examples
          </h2>
          <p class="text-lg text-muted-foreground">
            Detailed examples and advanced features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="text-xl">Component Examples</CardTitle>
            <p class="text-muted-foreground">
              Learn how to integrate and use Monaco AI Editor in your projects
            </p>
          </CardHeader>
          <CardContent class="space-y-6">
            <CodeExample
              title="1. Basic Usage"
              language="vue"
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
              title="Available Exports"
              language="typescript"
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
              title="Monaco Worker Configuration"
              language="typescript"
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
          </CardContent>
        </Card>
      </div>

      <!-- Advanced Features Section -->
      <div class="mb-16">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-3">
            ⚡ Advanced Features
          </h2>
          <p class="text-lg text-muted-foreground">
            Explore the plugin system and advanced configurations
          </p>
        </div>

        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Plugin System</CardTitle>
              <p class="text-muted-foreground">
                Extend functionality with external plugins like Shiki syntax
                highlighting
              </p>
            </CardHeader>
            <CardContent>
              <CodeExample
                title="Shiki Syntax Highlighting"
                language="vue"
                :code="pluginExampleCode"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Plugin Development</CardTitle>
              <p class="text-muted-foreground">
                Create your own plugins to extend the editor's capabilities
              </p>
            </CardHeader>
            <CardContent>
              <CodeExample
                title="Creating Custom Plugins"
                language="typescript"
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
  </div>
</template>
