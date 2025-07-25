<template>
  <div ref="container" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import monaco from '../monaco-worker'
import { registerCompletion, CompletionCopilot } from 'monacopilot'
import { CONFIG } from '../config.js'

const container = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 创建浏览器端兜底的copilot实例
const createBrowserCopilot = () => {
  const config = CONFIG.BROWSER_AI
  const currentProvider = config.CURRENT_PROVIDER
  
  // 根据配置选择API密钥和配置
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
      timeout: 3000, // 3秒超时
    })
    return response.ok
  } catch (error) {
    console.warn('后端服务不可用，将使用浏览器端备用方案')
    return false
  }
}

onMounted(async () => {
  if (container.value) {
    editor = monaco.editor.create(container.value, {
      language: 'javascript',
      theme: 'vs-dark',
      value: `// Welcome to Monaco Editor with Monacopilot!
// Try typing some JavaScript code here and see the AI completion in action

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on'
    })

    // 检查后端是否可用
    const isBackendAvailable = await checkBackendHealth()
    
    if (isBackendAvailable) {
      // 使用后端服务
      console.log('使用后端AI服务')
      registerCompletion(monaco, editor, {
        language: 'javascript',
        endpoint: `${CONFIG.BACKEND_URL}/completion`,
      })
    } else {
      // 使用浏览器端兜底方案
      console.log('使用浏览器端AI服务')
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
        console.warn('未配置浏览器端AI服务，请检查环境变量配置')
      }
    }
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 600px;
  border: 2px solid #444;
  border-radius: 8px;
  overflow: hidden;
}
</style>