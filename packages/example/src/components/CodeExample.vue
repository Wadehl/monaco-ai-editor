<template>
  <div class="code-example">
    <div class="example-header">
      <h3>{{ title }}</h3>
      <button @click="copyCode" class="copy-btn" :class="{ 'copied': isCopied }">
        <svg v-if="!isCopied" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <div ref="editorContainer" class="code-editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import monaco from '../monaco-worker'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'

interface Props {
  title: string
  code: string
  language?: string
  height?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  height: 'auto',
  maxHeight: '600px'
})

const editorContainer = ref<HTMLElement>()
const isCopied = ref(false)
const dynamicHeight = ref('200px')
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let highlighterInitialized = false

// Calculate dynamic height based on content
const calculateHeight = () => {
  if (props.height !== 'auto') {
    dynamicHeight.value = props.height
    return
  }
  
  const lines = props.code.split('\n').length
  const lineHeight = 19 // Monaco's default line height at 14px font
  const padding = 20 // Some padding for comfort
  const calculatedHeight = Math.min(lines * lineHeight + padding, parseInt(props.maxHeight))
  dynamicHeight.value = `${Math.max(calculatedHeight, 100)}px` // Minimum 100px
}

// Initialize Shiki highlighter
const initializeShiki = async () => {
  if (highlighterInitialized) return
  
  try {
    // Create the highlighter with Vue and other language support
    const highlighter = await createHighlighter({
      themes: [
        'dark-plus',
        'light-plus',
        'github-dark',
        'github-light',
        'one-dark-pro'
      ],
      langs: [
        'javascript',
        'typescript',
        'vue',
        'html',
        'css',
        'json',
        'markdown'
      ],
    })

    // Register the language IDs first
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'vue')) {
      monaco.languages.register({ id: 'vue' })
    }
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'typescript')) {
      monaco.languages.register({ id: 'typescript' })
    }
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'javascript')) {
      monaco.languages.register({ id: 'javascript' })
    }

    // Register the themes and syntax highlighting
    shikiToMonaco(highlighter, monaco)
    
    highlighterInitialized = true
    console.log('Shiki highlighter initialized successfully')
  } catch (error) {
    console.warn('Failed to initialize Shiki highlighter:', error)
    // Fallback to basic Monaco highlighting
  }
}

// Copy code to clipboard
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = props.code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
}

// Watch for code changes
watch(() => props.code, (newCode) => {
  calculateHeight() // Recalculate height when code changes
  if (editor && newCode !== editor.getValue()) {
    editor.setValue(newCode)
  }
})

// Watch for height prop changes
watch(() => props.height, () => {
  calculateHeight()
})

onMounted(async () => {
  // Calculate initial height
  calculateHeight()
  
  // Initialize Shiki first
  await initializeShiki()

  if (editorContainer.value) {
    // Use dark-plus theme for better Vue syntax highlighting
    const theme = props.language === 'vue' ? 'one-dark-pro' : 'dark-plus'
    
    editor = monaco.editor.create(editorContainer.value, {
      value: props.code,
      language: props.language,
      theme: theme,
      readOnly: true, // Make editor read-only
      minimap: { enabled: false },
      lineNumbers: 'on',
      fontSize: 14,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: true,
      folding: true,
      renderLineHighlight: 'none',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      // Disable context menu
      contextmenu: false,
      // Disable selection on focus
      selectOnLineNumbers: false,
      // Hide selection on blur
      renderValidationDecorations: 'off'
    })

    // Disable drag and drop
    editor.onDidAttemptReadOnlyEdit(() => {
      // Do nothing - prevent any editing attempts
    })
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.code-example {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
  border: 1px solid #333;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2d2d30;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.example-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.copy-btn.copied {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.copy-btn svg {
  flex-shrink: 0;
}

.code-editor-container {
  height: v-bind(dynamicHeight);
  min-height: 100px;
}

/* Remove focus outline */
.code-editor-container :deep(.monaco-editor .inputarea.ime-input) {
  outline: none !important;
}

.code-editor-container :deep(.monaco-editor) {
  background: #1e1e1e !important;
}

.code-editor-container :deep(.monaco-editor .margin) {
  background: #1e1e1e !important;
}

.code-editor-container :deep(.monaco-editor .monaco-editor-background) {
  background: #1e1e1e !important;
}

/* Hide cursor in read-only mode */
.code-editor-container :deep(.monaco-editor .cursor) {
  display: none !important;
}

/* Remove selection highlighting */
.code-editor-container :deep(.monaco-editor .selected-text) {
  background: transparent !important;
}

.code-editor-container :deep(.monaco-editor .line-numbers) {
  color: #858585 !important;
  padding-right: 12px !important;
}

.code-editor-container :deep(.monaco-editor .margin) {
  background: #1e1e1e !important;
}

.code-editor-container :deep(.monaco-editor .margin-view-overlays) {
  width: auto !important;
}
</style>