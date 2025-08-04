<template>
  <div class="monaco-wrapper">
    <!-- Monaco Editor 容器 -->
    <div ref="container" class="monaco-editor-container" :class="{ 'fullscreen': isFullscreen }">
      <div class="editor-toolbar test-class">
        <button @click="toggle" class="toolbar-btn" :title="isFullscreen ? '退出全屏' : '全屏'">
          <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
        </button>
      </div>
      <div ref="editorContainer" class="editor-content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFullscreen } from '@vueuse/core'
import monaco from '../monaco-worker'
import { registerCompletion } from 'monacopilot'
import { useAIConfig } from 'monaco-ai-editor'

interface Props {
  initialValue?: string
  modelValue?: string
}

interface Emits {
  (e: 'ready', editor: monaco.editor.IStandaloneCodeEditor): void
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: `// Monaco Editor AI 补全演示
// Try writing JavaScript code with AI-powered completion!

// Simple function example
function greet(name) {
  return \`Hello, \${name}! Welcome to Monaco AI Editor\`;
}

console.log(greet('Developer'));

// Try some modern features
const users = [
  { name: 'Alice', role: 'developer' },
  { name: 'Bob', role: 'designer' }
];

const developers = users.filter(user => user.role === 'developer');
console.log(developers);`,
  modelValue: ''
})

const emit = defineEmits<Emits>()

// 使用 AI 配置管理
const { getCompletionFunction, checkBackendHealth, isBackendConnected } = useAIConfig()

const container = ref<HTMLElement>()
const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 使用 VueUse 的全屏功能
const { isFullscreen, enter, exit, toggle } = useFullscreen(container, {
  autoExit: true
})

// 监听全屏状态变化，重新布局编辑器
watch(isFullscreen, () => {
  if (editor) {
    setTimeout(() => {
      editor?.layout()
    }, 300)
  }
})

// 监听 modelValue 变化，更新编辑器内容
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== undefined && newValue !== editor.getValue()) {
      editor.setValue(newValue)
    }
  }
)



onMounted(async () => {
  if (editorContainer.value) {
    const initialValue = props.modelValue || props.initialValue
    
    editor = monaco.editor.create(editorContainer.value, {
      language: 'javascript',
      theme: 'vs-dark',
      value: initialValue,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      // 增强补全功能
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showWords: true
      }
    })

    // 配置 TypeScript 编译选项（确保自动补全生效）
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
    
    // 启用语言特性
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

    // 监听内容变化，发出 update:modelValue 事件
    editor.onDidChangeModelContent(() => {
      if (editor) {
        const value = editor.getValue()
        emit('update:modelValue', value)
      }
    })

    // 使用动态 AI 配置设置补全
    try {
      const completionFunction = getCompletionFunction()
      
      registerCompletion(monaco, editor, {
        language: 'javascript',
        trigger: 'onIdle', // 在空闲时触发
        maxContextLines: 100, // 最大上下文行数
        enableCaching: true, // 启用缓存
        allowFollowUpCompletions: true, // 允许后续补全
        requestHandler: async ({ body }) => {
          try {
            const completion = await completionFunction(body)
            
            // Validate response format
            if (completion && typeof completion.completion !== 'string') {
              console.warn('⚠️ Invalid completion format:', completion)
            }
            
            return completion
          } catch (error) {
            console.error('AI completion failed:', error)
            return { completion: null, error: error.message || 'Completion failed' }
          }
        },
      })
      
    } catch (error) {
      console.error('Failed to enable AI completion:', error)
    }

    // F11 全屏快捷键
    editor.addCommand(monaco.KeyCode.F11, () => {
      toggle()
    })

    // 通知父组件编辑器已准备好
    emit('ready', editor)
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  toggleFullscreen: toggle,
  enterFullscreen: enter,
  exitFullscreen: exit,
  isFullscreen,
  getEditor: () => editor,
})
</script>

<style scoped>
/* 整体布局 */
.monaco-wrapper {
  display: flex;
  width: 100%;
  min-height: 600px;
}

/* Monaco Editor 容器 */
.monaco-editor-container {
  position: relative;
  width: 100%;
  height: 600px;
  border: 2px solid #444;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
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

.editor-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 10;
}

.toolbar-btn {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #555;
  color: #fff;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: rgba(60, 60, 60, 0.9);
  border-color: #777;
}

.toolbar-btn svg {
  display: block;
}

.editor-content {
  width: 100%;
  height: 100%;
}

.fullscreen .editor-toolbar {
  top: 16px;
  right: 16px;
}

.fullscreen .toolbar-btn {
  padding: 8px 12px;
  font-size: 16px;
}

.fullscreen .toolbar-btn svg {
  width: 20px;
  height: 20px;
}
</style>