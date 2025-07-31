<template>
  <!-- Modal Overlay -->
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>AI 服务配置</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      
      <div class="ai-config-panel">
        <div class="config-header">
          <div class="mode-switch">
            <span 
              class="status-tag"
              :class="currentMode === 'backend' ? 'success' : 'info'"
            >
              {{ currentMode === 'backend' ? '后端模式' : '浏览器模式' }}
            </span>
            <button 
              class="btn btn-small" 
              @click="checkBackendHealth"
              :disabled="isCheckingBackend"
            >
              {{ isCheckingBackend ? '检查中...' : '刷新连接' }}
            </button>
          </div>
        </div>

        <!-- 后端配置显示 -->
        <div v-if="isBackendConnected" class="config-section">
          <h4>🟢 后端配置 (只读)</h4>
          <div class="config-form readonly">
            <div class="form-row">
              <label>提供商:</label>
              <input :value="backendConfig.provider" readonly class="form-input readonly" />
            </div>
            <div class="form-row">
              <label>模型:</label>
              <input :value="backendConfig.model" readonly class="form-input readonly" />
            </div>
            <div class="form-row">
              <label>API Key:</label>
              <input :value="backendConfig.apiKey" readonly type="password" class="form-input readonly" />
            </div>
          </div>
        </div>

        <!-- 浏览器端配置 -->
        <div class="config-section">
          <h4>🌐 浏览器端配置 (兜底方案)</h4>
          <div class="config-form">
            <!-- 提供商选择 -->
            <div class="form-row">
              <label>AI 提供商:</label>
              <select 
                v-model="browserForm.provider" 
                @change="handleProviderChange"
                class="form-select"
              >
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <!-- Base URL -->
            <div class="form-row">
              <label>API 端点:</label>
              <input 
                v-model="browserForm.baseUrl" 
                placeholder="请输入 API 端点 URL"
                class="form-input"
              />
            </div>

            <!-- API Key with visibility toggle -->
            <div class="form-row">
              <label>API Key:</label>
              <div class="api-key-input">
                <input 
                  v-model="browserForm.apiKey" 
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="请输入 API 密钥"
                  class="form-input"
                />
                <button 
                  type="button" 
                  class="visibility-toggle"
                  @click="toggleApiKeyVisibility"
                  :title="showApiKey ? '隐藏密钥' : '显示密钥'"
                >
                  <svg 
                    v-if="showApiKey" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <!-- Eye Off SVG -->
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L6.06 6.06 5 5l14 14-1.06 1.06-1.94-1.94zM7.76 9.83a4 4 0 0 0 0 4.34 4 4 0 0 0 4.34 0l-4.34-4.34zM9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-1.57-1.57a4 4 0 0 0-4.24-4.24L9.9 4.24z"/>
                  </svg>
                  <svg 
                    v-else 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <!-- Eye SVG -->
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Model with editable select -->
            <div class="form-row">
              <label>模型名称:</label>
              <div class="model-select-container">
                <select
                  v-model="browserForm.model"
                  class="form-select model-select"
                  @change="handleModelChange"
                >
                  <option 
                    v-for="model in getAvailableModels(browserForm.provider)"
                    :key="model.value"
                    :value="model.value"
                  >
                    {{ model.label }}
                  </option>
                  <option value="custom">🔧 自定义模型...</option>
                </select>
                
                <!-- 自定义模型输入框 -->
                <div v-if="showCustomModel" class="custom-model-input">
                  <input
                    v-model="customModelName"
                    type="text"
                    placeholder="输入自定义模型名称，按 Enter 确认"
                    class="form-input"
                    @keyup.enter="handleCustomModelEnter"
                    @blur="handleCustomModelBlur"
                    ref="customModelInput"
                  />
                  <div class="model-hint">
                    输入模型名称后按 Enter 确认，或点击其他区域取消
                  </div>
                </div>
                
                <div v-else class="model-hint">
                  支持下拉选择预设模型或自定义输入
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button 
                type="button"
                @click="testConfiguration"
                :disabled="isTesting"
                class="btn btn-secondary"
              >
                {{ isTesting ? '测试中...' : '测试连接' }}
              </button>
              <button 
                type="button"
                @click="saveConfiguration"
                :disabled="isSaving"
                class="btn btn-primary"
              >
                {{ isSaving ? '保存中...' : '保存配置' }}
              </button>
              <button 
                type="button"
                @click="resetToDefaults"
                class="btn btn-outline"
              >
                重置默认
              </button>
            </div>
          </div>
        </div>

        <!-- 配置状态显示 -->
        <div class="config-status">
          <div class="status-item">
            <span>当前模式:</span>
            <span class="status-value" :class="{ 'backend': currentMode === 'backend', 'browser': currentMode === 'browser' }">
              {{ currentMode === 'backend' ? '后端优先' : '浏览器端' }}
            </span>
          </div>
          <div class="status-item">
            <span>连接状态:</span>
            <span class="status-value" :class="{ 'connected': isBackendConnected, 'disconnected': !isBackendConnected }">
              {{ isBackendConnected ? '后端已连接' : '仅浏览器端' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'

// Props 定义
interface Props {
  open: boolean
  currentConfig?: AIConfig
  isBackendConnected?: boolean
}

// Emits 定义
interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save', config: AIConfig): void
  (e: 'test', config: AIConfig): Promise<boolean>
}

// AI 配置接口
interface AIConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  isBackendConnected: false
})

const emit = defineEmits<Emits>()

// 模拟AI配置状态 (替代 useAIConfig)
const isCheckingBackend = ref(false)
const currentMode = computed(() => props.isBackendConnected ? 'backend' : 'browser')
const backendConfig = reactive({
  provider: 'gemini',
  model: 'gemini-2.5-flash-lite',
  apiKey: '***'
})

// 检查后端健康状态
const checkBackendHealth = async () => {
  isCheckingBackend.value = true
  try {
    // 模拟检查逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isCheckingBackend.value = false
  }
}

// 表单状态
const browserForm = reactive<AIConfig>({
  provider: 'gemini',
  baseUrl: '',
  apiKey: '',
  model: ''
})

// UI 状态
const showApiKey = ref(false)
const isSaving = ref(false)
const isTesting = ref(false)
const showCustomModel = ref(false)
const customModelName = ref('')
const customModelInput = ref<HTMLInputElement>()

// 预定义的模型列表
const modelOptions = {
  anthropic: [
    { label: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet@20250219' },
    { label: 'Claude Sonnet 4', value: 'claude-sonnet-4@20250514' },
    { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
    { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' }
  ],
  openai: [
    { label: 'GPT-4o Mini', value: 'o4-mini' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
  ],
  gemini: [
    { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
    { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    { label: 'Gemini Pro', value: 'gemini-pro' }
  ]
}

// 默认的 Base URL
const defaultBaseUrls = {
  anthropic: 'http://anthropic.37mobi.com/v1/messages',
  openai: 'http://openai.37mobi.com/v1/responses',
  gemini: 'http://gemini.37mobi.com/v1beta/models/{MODEL_NAME}:generateContent'
}

// 获取可用模型列表
const getAvailableModels = (provider: string) => {
  return modelOptions[provider as keyof typeof modelOptions] || []
}

// 切换 API Key 可见性
const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

// 处理提供商变化
const handleProviderChange = () => {
  const provider = browserForm.provider
  // 更新默认 Base URL
  browserForm.baseUrl = defaultBaseUrls[provider as keyof typeof defaultBaseUrls] || ''
  
  // 重置模型为该提供商的第一个选项
  const models = getAvailableModels(provider)
  if (models.length > 0) {
    browserForm.model = models[0].value
  }
  
  showCustomModel.value = false
}

// 处理模型变化
const handleModelChange = () => {
  if (browserForm.model === 'custom') {
    showCustomModel.value = true
    customModelName.value = ''
    nextTick(() => {
      customModelInput.value?.focus()
    })
  } else {
    showCustomModel.value = false
  }
}

// 处理自定义模型输入
const handleCustomModelEnter = () => {
  if (customModelName.value.trim()) {
    browserForm.model = customModelName.value.trim()
    showCustomModel.value = false
    showMessage(`已设置自定义模型: ${browserForm.model}`, 'success')
  }
}

const handleCustomModelBlur = () => {
  if (!customModelName.value.trim()) {
    // 恢复到第一个预设模型
    const models = getAvailableModels(browserForm.provider)
    if (models.length > 0) {
      browserForm.model = models[0].value
    }
    showCustomModel.value = false
  }
}

// 保存配置
const saveConfiguration = async () => {
  isSaving.value = true
  try {
    // 验证必填字段
    if (!browserForm.provider || !browserForm.baseUrl || !browserForm.apiKey) {
      showMessage('请填写所有必填字段', 'error')
      return
    }

    emit('save', { ...browserForm })
    showMessage('配置已保存', 'success')
  } catch (error) {
    console.error('保存配置失败:', error)
    showMessage('保存配置失败', 'error')
  } finally {
    isSaving.value = false
  }
}

// 测试配置
const testConfiguration = async () => {
  isTesting.value = true
  try {
    const success = await emit('test', { ...browserForm })
    if (success) {
      showMessage('配置测试成功，AI 服务可正常使用', 'success')
    } else {
      showMessage('配置测试失败，请检查配置信息', 'error')
    }
  } catch (error) {
    console.error('测试配置失败:', error)
    showMessage('测试配置时发生错误', 'error')
  } finally {
    isTesting.value = false
  }
}

// 重置为默认配置
const resetToDefaults = () => {
  if (confirm('确定要重置为默认配置吗？此操作将清除当前的自定义配置。')) {
    // 重置表单
    browserForm.provider = 'gemini'
    handleProviderChange()
    browserForm.apiKey = ''
    showCustomModel.value = false
    
    showMessage('已重置为默认配置', 'success')
  }
}

// 关闭模态框
const handleClose = () => {
  emit('update:open', false)
}

const handleOverlayClick = () => {
  emit('update:open', false)
}

// 简单的消息提示
const showMessage = (message: string, type: 'success' | 'error' | 'warning') => {
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'
  alert(`${emoji} ${message}`)
}

// 监听 props 配置变化，同步到表单
watch(() => props.currentConfig, (newConfig) => {
  if (newConfig) {
    Object.assign(browserForm, newConfig)
  }
}, { immediate: true, deep: true })

// 组件挂载时初始化
onMounted(() => {
  checkBackendHealth()
})
</script>

<style scoped>
/* Modal 样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.ai-config-panel {
  padding: 24px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.mode-switch {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 状态标签样式 */
.status-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.success {
  background: #e7f5e7;
  color: #67c23a;
}

.status-tag.info {
  background: #e7f7ff;
  color: #409eff;
}

/* 小按钮样式 */
.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 32px;
}

.config-section {
  margin-bottom: 25px;
}

.config-section h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
}

.config-form .form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.config-form .form-row label {
  min-width: 80px;
  font-weight: 500;
  color: #606266;
  line-height: 32px;
  text-align: right;
}

.form-input,
.form-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #409eff;
}

.form-input.readonly {
  background: #f5f7fa;
  color: #909399;
}

.api-key-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-input .form-input {
  flex: 1;
}

.visibility-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #909399;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visibility-toggle:hover {
  color: #409eff;
  background: #f5f7fa;
}

.model-select-container {
  flex: 1;
}

.model-select {
  width: 100%;
}

.custom-model-input {
  margin-top: 8px;
}

.model-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-secondary {
  background: #909399;
  border-color: #909399;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #a6a9ad;
  border-color: #a6a9ad;
}

.btn-outline {
  background: transparent;
  border-color: #dcdfe6;
  color: #606266;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.config-status {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item span {
  color: #606266;
  font-size: 14px;
}

.status-value {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-value.backend {
  background: #e7f7ff;
  color: #409eff;
}

.status-value.browser {
  background: #fff2e6;
  color: #e6a23c;
}

.status-value.connected {
  background: #e7f5e7;
  color: #67c23a;
}

.status-value.disconnected {
  background: #fef0f0;
  color: #f56c6c;
}

/* SVG 图标样式 */
.visibility-toggle svg {
  width: 20px;
  height: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .ai-config-panel {
    padding: 16px;
  }
  
  .config-form .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .config-form .form-row label {
    min-width: auto;
    text-align: left;
    line-height: 1.4;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>