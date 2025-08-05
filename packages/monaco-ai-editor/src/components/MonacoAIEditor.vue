<template>
  <div class="monaco-ai-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar test-class" :style="toolbarStyles">
      <div class="toolbar-left">
        <!-- Status indicator removed -->
      </div>
      
      <div class="toolbar-right">
        <button 
          v-if="props.showAIConfigButton" 
          @click="showAIConfig = true" 
          class="ai-config-button" 
          title="AI Configuration"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L18 10H10V18L4 24L10 30V38H18L24 44L30 38H38V30L44 24L38 18V10H30L24 4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <div class="status-indicator" :class="{ 'configured': browserConfig.apiKey }">
            <svg v-if="browserConfig.apiKey" width="12" height="12" viewBox="0 0 15 15" fill="none">
              <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 15 15" fill="none">
              <path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608765L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 3.00002C7.4141 2.48716 7.82124 2.08002 8.33409 2.08002C8.84695 2.08002 9.25409 2.48716 9.25409 3.00002V8.50002C9.25409 9.01288 8.84695 9.42002 8.33409 9.42002C7.82124 9.42002 7.4141 9.01288 7.4141 8.50002V3.00002ZM8.33409 10.5C7.82124 10.5 7.4141 10.9072 7.4141 11.42C7.4141 11.9329 7.82124 12.34 8.33409 12.34C8.84695 12.34 9.25409 11.9329 9.25409 11.42C9.25409 10.9072 8.84695 10.5 8.33409 10.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
          </div>
        </button>
        
        <button @click="toggleFullscreen" class="toolbar-btn" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
          <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Monaco Editor Container -->
    <div ref="container" class="monaco-editor-container" :class="{ 'fullscreen': isFullscreen }" :style="containerStyles">
      <div ref="editorContainer" class="editor-content"></div>
    </div>

    <!-- AI Configuration Modal -->
    <AIConfigPanel
      v-model:open="showAIConfig"
      :current-config="browserConfig"
      :is-backend-connected="isBackendConnected"
      :on-test-config="handleAIConfigTest"
      @save="handleAIConfigSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import monaco, { setupMonacoEnvironment } from '../monaco-worker'
import { registerCompletion } from 'monacopilot'
import { useAIConfig } from '../composables/useAIConfig'
import { pluginManager } from '../plugins'
import AIConfigPanel from './AIConfigPanel.vue'

interface Props {
  initialValue?: string
  modelValue?: string
  height?: string
  language?: string
  theme?: string
  plugins?: string[]
  pluginOptions?: Record<string, any>
  // Configuration control props
  showAIConfigButton?: boolean
  requestMode?: 'backend' | 'browser' | 'hybrid'
  aiConfig?: Partial<import('../config').AIConfigOptions>
}

interface Emits {
  (e: 'ready', editor: monaco.editor.IStandaloneCodeEditor): void
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: `// Monaco Editor AI Code Completion Demo
// Try writing JavaScript code with AI-powered completion!

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
  modelValue: '',
  height: '600px',
  language: 'javascript',
  theme: 'vs-dark',
  plugins: () => [],
  pluginOptions: () => ({}),
  // Default values for new props
  showAIConfigButton: true,
  requestMode: 'hybrid',
  aiConfig: () => ({})
})

const emit = defineEmits<Emits>()

// Refs
const container = ref<HTMLElement>()
const editorContainer = ref<HTMLElement>()
const showAIConfig = ref(false)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let currentCompletionDisposer: { dispose: () => void } | null = null

// Fullscreen functionality
const isFullscreen = ref(false)

const toggleFullscreen = async () => {
  if (!container.value) return
  
  try {
    if (!document.fullscreenElement) {
      await container.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.warn('Fullscreen operation failed:', error)
  }
}

// Listen for fullscreen changes
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Use AI configuration management
const { 
  browserConfig, 
  isBackendConnected, 
  testConfig, 
  saveBrowserConfig,
  getCompletionFunction
} = useAIConfig(props.aiConfig, props.requestMode)

// Compute styles for the container
const containerStyles = computed(() => ({
  height: props.height
}))

// Compute toolbar styles based on current theme
const toolbarStyles = ref({
  '--toolbar-bg': '#1e1e1e',
  '--toolbar-border': '#444',
  '--toolbar-fg': '#cccccc',
  '--toolbar-button-bg': 'rgba(255, 255, 255, 0.08)',
  '--toolbar-button-border': 'rgba(255, 255, 255, 0.15)',
  '--toolbar-button-hover-bg': 'rgba(255, 255, 255, 0.12)',
  '--toolbar-button-hover-border': 'rgba(255, 255, 255, 0.25)'
})

// Function to detect and adapt to Monaco theme colors
const updateToolbarTheme = () => {
  if (!editor || !editorContainer.value) return
  
  try {
    // Get computed styles from Monaco Editor
    const monacoEditor = editorContainer.value.querySelector('.monaco-editor')
    if (!monacoEditor) return
    
    const computedStyle = window.getComputedStyle(monacoEditor)
    const backgroundColor = computedStyle.backgroundColor
    const color = computedStyle.color
    
    // Parse RGB values
    const bgMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    
    if (bgMatch && colorMatch) {
      const [, bgR, bgG, bgB] = bgMatch.map(Number)
      const [, , ,] = colorMatch.map(Number)
      
      // Calculate brightness to determine if it's light or dark theme
      const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000
      const isLightTheme = bgBrightness > 128
      
      // Generate border color by slightly adjusting background
      const borderColor = isLightTheme 
        ? `rgb(${Math.max(0, bgR - 30)}, ${Math.max(0, bgG - 30)}, ${Math.max(0, bgB - 30)})`
        : `rgb(${Math.min(255, bgR + 40)}, ${Math.min(255, bgG + 40)}, ${Math.min(255, bgB + 40)})`
      
      // Generate button colors based on theme type
      const buttonBg = isLightTheme
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.08)'
      const buttonBorder = isLightTheme
        ? 'rgba(0, 0, 0, 0.15)'
        : 'rgba(255, 255, 255, 0.15)'
      const buttonHoverBg = isLightTheme
        ? 'rgba(0, 0, 0, 0.08)'
        : 'rgba(255, 255, 255, 0.12)'
      const buttonHoverBorder = isLightTheme
        ? 'rgba(0, 0, 0, 0.25)'
        : 'rgba(255, 255, 255, 0.25)'
      
      // Update toolbar styles
      toolbarStyles.value = {
        '--toolbar-bg': backgroundColor,
        '--toolbar-border': borderColor,
        '--toolbar-fg': color,
        '--toolbar-button-bg': buttonBg,
        '--toolbar-button-border': buttonBorder,
        '--toolbar-button-hover-bg': buttonHoverBg,
        '--toolbar-button-hover-border': buttonHoverBorder
      }
    }
  } catch (error) {
    console.warn('Failed to detect Monaco theme colors:', error)
  }
}

// Watch fullscreen state changes, re-layout editor
watch(isFullscreen, () => {
  if (editor) {
    setTimeout(() => {
      editor?.layout()
    }, 300)
  }
})

// Watch modelValue changes, update editor content
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== undefined && newValue !== editor.getValue()) {
      editor.setValue(newValue)
    }
  }
)

// Watch language changes, update editor language
watch(
  () => props.language,
  (newLanguage) => {
    if (editor && newLanguage) {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage)
        
        // Re-register AI completion for the new language
        setupAICompletion(newLanguage)
        
        // Update TypeScript configurations when switching to/from TypeScript/JavaScript
        if (newLanguage === 'typescript' || newLanguage === 'javascript') {
          const isTypeScript = newLanguage === 'typescript'
          
          // Configure TypeScript compiler options based on language
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            allowJs: isTypeScript,
            checkJs: !isTypeScript,
            strict: isTypeScript,
            noSemanticValidation: false,
            noSyntaxValidation: false
          })
          
          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            allowJs: true,
            checkJs: false,
            strict: false,
            noSemanticValidation: false,
            noSyntaxValidation: false
          })
          
        }
      }
    }
  }
)

// Watch theme changes, update editor theme and toolbar
watch(
  () => props.theme,
  (newTheme) => {
    if (editor && newTheme) {
      monaco.editor.setTheme(newTheme)
      // Wait for theme to be applied, then update toolbar
      setTimeout(() => {
        updateToolbarTheme()
      }, 100)
    }
  }
)



// AI configuration event handlers
const handleAIConfigSave = (config: any) => {
  saveBrowserConfig(config)
  showAIConfig.value = false
}

const handleAIConfigTest = async (config: any) => {
  return await testConfig(config)
}

// Setup AI completion function
const setupAICompletion = (language: string) => {
  // Dispose previous completion registration
  if (currentCompletionDisposer && typeof currentCompletionDisposer.dispose === 'function') {
    try {
      currentCompletionDisposer.dispose()
    } catch (error) {
      console.warn('Failed to dispose previous completion:', error)
    }
    currentCompletionDisposer = null
  }

  if (!editor) return

  try {
    const completionFunction = getCompletionFunction()
    
    const result = registerCompletion(monaco, editor, {
      language: language,
      trigger: 'onIdle',
      maxContextLines: 100,
      enableCaching: true,
      allowFollowUpCompletions: true,
      requestHandler: async ({ body }) => {
        try {
          const completion = await completionFunction(body)
          
          if (completion && typeof completion.completion !== 'string') {
            console.warn('Invalid completion format:', completion)
          }
          
          return completion
        } catch (error) {
          console.error('AI completion failed:', error)
          return { completion: null, error: (error as Error).message || 'Completion failed' }
        }
      }
    })
    
    // Store disposer if it's returned and has dispose method
    if (result && typeof (result as any).dispose === 'function') {
      currentCompletionDisposer = result as any
    } else if (result && typeof result === 'object') {
      // Some libraries might return different disposal patterns
      currentCompletionDisposer = result as any
    }
    
    console.log(`AI completion registered for language: ${language}`)
  } catch (error) {
    console.error('Failed to enable AI completion:', error)
  }
}

onMounted(async () => {
  // Add fullscreen event listener
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  if (editorContainer.value) {
    const initialValue = props.modelValue || props.initialValue
    
    // Setup basic Monaco environment (minimal setup)
    // Users can configure workers externally before importing this component
    setupMonacoEnvironment()
    
    // Install plugins before creating editor
    try {
      if (props.plugins && props.plugins.length > 0) {
        const pluginContext = {
          editor: null as any, // Will be set after editor creation
          monaco,
          container: editorContainer.value,
          config: {
            language: props.language,
            theme: props.theme,
            value: initialValue
          },
          options: props.pluginOptions
        }
        
        // Call beforeCreate hooks for all plugins
        await pluginManager.install(pluginContext, props.plugins)
      }
    } catch (error) {
      console.warn('Plugin installation failed:', error)
      // Continue with editor creation even if plugins fail
    }
    
    editor = monaco.editor.create(editorContainer.value, {
      language: props.language,
      theme: props.theme,
      value: initialValue,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on',
      // Explicitly set dimensions to ensure proper rendering
      dimension: {
        width: editorContainer.value.clientWidth || 800,
        height: parseInt(props.height?.replace('px', '') || '600') - 40 // Account for toolbar height
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      // Enhanced completion features
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showWords: true
      }
    })

    // Call afterCreate hooks for plugins
    try {
      if (props.plugins && props.plugins.length > 0) {
        const pluginContext = {
          editor,
          monaco,
          container: editorContainer.value,
          config: {
            language: props.language,
            theme: props.theme,
            value: initialValue
          },
          options: props.pluginOptions
        }
        
        // Update contexts and call afterCreate hooks
        for (const pluginName of props.plugins) {
          const plugin = pluginManager.get(pluginName)
          if (plugin?.lifecycle.afterCreate) {
            await plugin.lifecycle.afterCreate(pluginContext)
          }
        }
      }
    } catch (error) {
      console.warn('Plugin afterCreate failed:', error)
    }

    // Configure TypeScript compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      checkJs: false,
      strict: false,
      noSemanticValidation: false,
      noSyntaxValidation: false
    })
    
    // Enable language features
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

    // Listen to content changes, emit update:modelValue event
    editor.onDidChangeModelContent(() => {
      if (editor) {
        const value = editor.getValue()
        emit('update:modelValue', value)
      }
    })


    // Setup AI completion for initial language
    setupAICompletion(props.language)

    // F11 fullscreen shortcut
    editor.addCommand(monaco.KeyCode.F11, () => {
      toggleFullscreen()
    })

    // Notify parent component that editor is ready
    emit('ready', editor)
    
    // Update toolbar theme after editor is ready
    setTimeout(() => {
      updateToolbarTheme()
    }, 100)
    
    // Set up a MutationObserver to detect theme changes in Monaco Editor
    if (editorContainer.value) {
      const observer = new MutationObserver(() => {
        updateToolbarTheme()
      })
      
      observer.observe(editorContainer.value, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true
      })
      
      // Store observer for cleanup
      ;(editorContainer.value as any)._themeObserver = observer
    }
  }
})

onUnmounted(async () => {
  // Remove fullscreen event listener
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  
  // Cleanup AI completion registration
  if (currentCompletionDisposer && typeof currentCompletionDisposer.dispose === 'function') {
    try {
      currentCompletionDisposer.dispose()
    } catch (error) {
      console.warn('Failed to dispose completion on unmount:', error)
    }
    currentCompletionDisposer = null
  }
  
  // Cleanup theme observer
  if (editorContainer.value && (editorContainer.value as any)._themeObserver) {
    ;(editorContainer.value as any)._themeObserver.disconnect()
    delete (editorContainer.value as any)._themeObserver
  }
  
  // Uninstall plugins
  try {
    await pluginManager.uninstall()
  } catch (error) {
    console.warn('Plugin cleanup failed:', error)
  }
  
  if (editor) {
    editor.dispose()
  }
})

// Expose methods to parent component
defineExpose({
  toggleFullscreen,
  isFullscreen,
  getEditor: () => editor
})
</script>

<style>
/* Remove scoped to ensure styles are globally available */
.monaco-ai-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* border: 2px solid #444; */
  border-radius: 8px;
  overflow: visible;
  background: #1e1e1e;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--toolbar-bg, #1e1e1e);
  border-bottom: 1px solid var(--toolbar-border, #444);
  color: var(--toolbar-fg, #cccccc);
  padding: 8px 12px;
  gap: 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--toolbar-button-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--toolbar-button-border, rgba(255, 255, 255, 0.2));
  color: var(--toolbar-fg, #cccccc);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  min-height: 32px;
}

.toolbar-btn:hover {
  background: var(--toolbar-button-hover-bg, rgba(255, 255, 255, 0.15));
  border-color: var(--toolbar-button-hover-border, rgba(255, 255, 255, 0.3));
}

.toolbar-btn svg {
  flex-shrink: 0;
  color: var(--toolbar-fg, #cccccc);
}

.ai-config-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--toolbar-button-bg, rgba(255, 255, 255, 0.08));
  border: 1px solid var(--toolbar-button-border, rgba(255, 255, 255, 0.15));
  color: var(--toolbar-fg, #cccccc);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 32px;
  position: relative;
}

.ai-config-button:hover {
  background: var(--toolbar-button-hover-bg, rgba(255, 255, 255, 0.12));
  border-color: var(--toolbar-button-hover-border, rgba(255, 255, 255, 0.25));
}

.ai-config-button:focus {
  outline: 1px solid #007acc;
  outline-offset: 1px;
}

.ai-config-button svg {
  flex-shrink: 0;
  color: var(--toolbar-fg, #cccccc);
}

.button-text {
  color: var(--toolbar-fg, #cccccc);
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  margin-left: 4px;
}

.status-indicator.configured {
  background: rgba(34, 197, 94, 0.2);
}

.status-indicator svg {
  color: var(--toolbar-fg, #cccccc);
}

.status-indicator.configured svg {
  color: #22c55e;
}

.monaco-editor-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  overflow: hidden; /* Prevent scrollbars in container */
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.monaco-editor-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999;
  border-radius: 0;
  border: none;
}

.editor-content {
  width: 100%;
  height: 100%;
  min-height: inherit; /* Inherit minimum height from container */
}

/* Fix Monaco Editor line number spacing */
.editor-content :deep(.monaco-editor .margin) {
  background-color: inherit;
}

.editor-content :deep(.monaco-editor .margin .margin-view-overlays) {
  padding-left: 8px;
}

.editor-content :deep(.monaco-editor .line-numbers) {
  text-align: right;
  padding-right: 8px !important;
  min-width: 40px;
}

.editor-content :deep(.monaco-editor .view-lines) {
  padding-left: 8px;
}

/* Ensure proper Monaco Editor styling */
.editor-content :deep(.monaco-editor) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
}

/* Fullscreen adjustments */
.fullscreen .editor-toolbar {
  padding: 12px 16px;
  border-radius: 0;
}

.fullscreen .monaco-editor-container {
  border-radius: 0;
}

.fullscreen .editor-content :deep(.monaco-editor) {
  border-radius: 0;
}

.fullscreen .toolbar-btn,
.fullscreen .ai-config-button {
  padding: 8px 12px;
  font-size: 14px;
  min-height: 36px;
}

.fullscreen .toolbar-btn svg,
.fullscreen .ai-config-button svg {
  width: 18px;
  height: 18px;
}
</style>