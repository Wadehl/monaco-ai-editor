<template>
  <div class="monaco-wrapper">
    <!-- Monaco Editor 容器 -->
    <div ref="container" class="monaco-editor-container" :class="{ 'fullscreen': isFullscreen }">
      <div class="editor-toolbar">
        <button @click="toggleFullscreen" class="toolbar-btn" :title="isFullscreen ? '退出全屏' : '全屏'">
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
import monaco from '../monaco-worker'
import { registerCompletion, CompletionCopilot } from 'monacopilot'
import { CONFIG } from '../config.js'

interface Props {
  typeDefinitions?: string
  initialValue?: string
}

interface Emits {
  (e: 'ready', editor: monaco.editor.IStandaloneCodeEditor): void
}

const props = withDefaults(defineProps<Props>(), {
  typeDefinitions: '',
  initialValue: `// Monaco Editor AI 补全演示
// 试试输入 pageData. 或 compData. 查看动态类型提示！

// 页面数据示例
console.log(pageData.title)
console.log(pageData.config.theme)

// 组件数据示例  
console.log(compData.components)
console.log(compData.props.visible)

// 试试动态添加属性
// pageData.newProperty = 'test' // 添加后类型定义会自动更新

// 试试写一个函数，AI会智能补全
function greet(name) {
  return \`Hello, \${name}! Welcome to \${pageData.title}\`;
}

console.log(greet('Developer'));`
})

const emit = defineEmits<Emits>()

const container = ref<HTMLElement>()
const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 全屏状态
const isFullscreen = ref(false)

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (editor) {
    setTimeout(() => {
      editor?.layout()
    }, 300)
  }
}

// 更新类型定义的方法
const updateTypeDefinitions = (typeDefinitions: string) => {
  if (!editor || !typeDefinitions) return
  
  try {
    // 移除旧的类型定义（如果存在）
    try {
      monaco.languages.typescript.javascriptDefaults.removeExtraLib('ts:dynamic-types.d.ts')
    } catch (e) {
      // 忽略移除失败的错误，可能是第一次添加
    }
    
    // 添加新的类型定义
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      typeDefinitions,
      'ts:dynamic-types.d.ts'
    )
    
    // 刷新TypeScript语言服务
    setTimeout(() => {
      if (editor) {
        const currentOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions()
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          ...currentOptions,
          allowNonTsExtensions: !currentOptions.allowNonTsExtensions
        })
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(currentOptions)
      }
    }, 100)
    
    console.log('🔄 更新了类型定义', typeDefinitions)
  } catch (error) {
    console.warn('更新类型定义失败:', error)
  }
}

// 监听props变化，更新类型定义
watch(() => props.typeDefinitions, (newTypeDefinitions) => {
  if (newTypeDefinitions) {
    updateTypeDefinitions(newTypeDefinitions)
  }
}, { immediate: true })

// 创建浏览器端兜底的copilot实例
const createBrowserCopilot = () => {
  const config = CONFIG.BROWSER_AI
  const currentProvider = config.CURRENT_PROVIDER
  
  if (currentProvider === 'anthropic' && config.ANTHROPIC.API_KEY) {
    return new CompletionCopilot(undefined, {
      model: async (prompt) => {
        const response = await fetch(config.ANTHROPIC.BASE_URL, {
          method: 'POST',
          headers: {
            'x-api-key': config.ANTHROPIC.API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.ANTHROPIC.MODEL,
            max_tokens: 256,
            messages: [
              {
                role: 'user',
                content: `${prompt.context}\n\n${prompt.instruction}\n\n${prompt.fileContent}`,
              },
            ],
          }),
        })
        
        const data = await response.json()
        return {
          text: data.content[0].text,
        }
      },
    })
  } else if (currentProvider === 'openai' && config.OPENAI.API_KEY) {
    return new CompletionCopilot(undefined, {
      model: async (prompt) => {
        const response = await fetch(config.OPENAI.BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.OPENAI.API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.OPENAI.MODEL,
            messages: [
              {role: 'system', content: prompt.context},
              {
                role: 'user',
                content: `${prompt.instruction}\n\n${prompt.fileContent}`,
              },
            ],
            temperature: 0.2,
            max_tokens: 256,
          }),
        })
        
        const data = await response.json()
        return {
          text: data.choices[0].message.content,
        }
      },
    })
  }
  
  return null
}

// 检查后端服务是否可用
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/health`, {
      method: 'GET',
      timeout: 3000,
    })
    return response.ok
  } catch (error) {
    console.warn('后端服务不可用，将使用浏览器端备用方案')
    return false
  }
}

onMounted(async () => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      language: 'javascript',
      theme: 'vs-dark',
      value: props.initialValue,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
    })

    // 初始化类型定义
    if (props.typeDefinitions) {
      updateTypeDefinitions(props.typeDefinitions)
    }

    // 检查后端是否可用，设置AI补全
    const isBackendAvailable = await checkBackendHealth()
    
    if (isBackendAvailable) {
      console.log('🚀 使用后端AI服务')
      registerCompletion(monaco, editor, {
        language: 'javascript',
        endpoint: `${CONFIG.BACKEND_URL}/completion`,
      })
    } else {
      console.log('🌐 使用浏览器端AI服务')
      const browserCopilot = createBrowserCopilot()
      
      if (browserCopilot) {
        registerCompletion(monaco, editor, {
          language: 'javascript',
          requestHandler: async ({ body }) => {
            console.log('浏览器端AI请求:', body)
            const completion = await browserCopilot.complete({ body })
            console.log('浏览器端AI响应:', completion)
            return completion
          },
        })
      } else {
        console.warn('⚠️ 未配置浏览器端AI服务，请检查环境变量配置')
      }
    }

    // F11 全屏快捷键
    editor.addCommand(monaco.KeyCode.F11, () => {
      toggleFullscreen()
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
  toggleFullscreen,
  isFullscreen,
  updateTypeDefinitions,
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