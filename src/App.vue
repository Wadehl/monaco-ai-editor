<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './components/MonacoEditor.vue'
import PageDataEditor from './components/PageDataEditor.vue'
import { useTypeDefinitions } from './composables/useData'

const editorRef = ref()
const showPageDataEditor = ref(false)

// 使用数据管理组合函数
const { pageData, compData, typeDefinitions } = useTypeDefinitions()

// 编辑器准备完成的回调
const handleEditorReady = (editor: any) => {
  console.log('🎉 Monaco编辑器已准备就绪', editor)
}

// PageData编辑器的事件处理
const addNewProperty = (key: string, value: any) => {
  pageData[key] = value
  console.log(`✅ 添加属性: ${key} = ${JSON.stringify(value)}`)
}

const updateProperty = (key: string, newValue: any) => {
  pageData[key] = newValue
  console.log(`🔄 更新属性: ${key} = ${JSON.stringify(newValue)}`)
}

const deleteProperty = (key: string) => {
  delete pageData[key]
  console.log(`🗑️ 删除属性: ${key}`)
}

// 手动刷新类型定义（测试用）
const refreshTypeDefinitions = () => {
  if (editorRef.value) {
    editorRef.value.updateTypeDefinitions(typeDefinitions.value)
  }
}
</script>
<template>
  <div class="app">
    <header class="app-header">
      <h1>Monaco Editor + AI 智能补全演示</h1>
      <div class="controls">
        <button @click="showPageDataEditor = true" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          编辑 PageData
        </button>
        <button @click="refreshTypeDefinitions" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          刷新类型
        </button>
      </div>
    </header>

    <MonacoEditor 
      ref="editorRef"
      :type-definitions="typeDefinitions"
      @ready="handleEditorReady"
    />

    <!-- PageData 编辑器 Modal -->
    <PageDataEditor
      v-model:open="showPageDataEditor"
      :page-data="pageData"
      @update-property="updateProperty"
      @add-property="addNewProperty"
      @delete-property="deleteProperty"
    />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.control-btn svg {
  flex-shrink: 0;
}

.feature-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.controls {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.controls h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.control-btn small {
  opacity: 0.8;
  font-size: 0.7rem;
}

.control-btn svg {
  flex-shrink: 0;
}

.instructions, .priority-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.instructions {
  border-left: 4px solid #28a745;
}

.priority-info {
  border-left: 4px solid #ffc107;
}

.instructions h4, .priority-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.instructions h4 {
  color: #28a745;
}

.priority-info h4 {
  color: #e68900;
}

.instructions ul, .priority-info ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li, .priority-info li {
  margin-bottom: 8px;
  color: #6c757d;
}

.instructions code, .priority-info code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  color: #d73a49;
}

.app-footer {
  margin-top: 20px;
  text-align: center;
  padding: 15px;
  background: #e9ecef;
  border-radius: 6px;
}

.app-footer p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.app-footer code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  color: #d73a49;
}

@media (max-width: 768px) {
  .app {
    padding: 15px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .feature-badges {
    justify-content: center;
  }
  
  .control-buttons {
    justify-content: center;
  }
}
</style>
