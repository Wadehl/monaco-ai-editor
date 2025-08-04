<template>
  <!-- Modal Overlay -->
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">AI Configuration</h2>
          <p class="modal-description">Configure your AI service providers and settings</p>
        </div>
        <button class="close-button" @click="handleClose" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <path d="M8 8L40 40" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 40L40 8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="modal-body">
        <!-- Status Header -->
        <div class="status-header">
          <div class="status-badge" :class="currentMode === 'backend' ? 'success' : 'warning'">
            <div class="status-indicator" :class="currentMode === 'backend' ? 'success' : 'warning'"></div>
            {{ currentMode === 'backend' ? 'Backend Mode' : 'Browser Mode' }}
          </div>
          <button 
            class="refresh-button" 
            @click="checkBackendHealth"
            :disabled="isCheckingBackend"
          >
            <svg 
              class="refresh-icon" 
              :class="{ 'spinning': isCheckingBackend }" 
              width="16" 
              height="16" 
              viewBox="0 0 15 15" 
              fill="none"
            >
              <path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43269 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43269 14.15 7.49998 14.15C10.4613 14.15 13.1618 11.9665 13.8093 9H12.7279C12.1415 11.2563 9.92395 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            <span>{{ isCheckingBackend ? 'Checking...' : 'Refresh' }}</span>
          </button>
        </div>

        <!-- Backend Config (Read-only) -->
        <div v-if="isBackendConnected" class="config-section">
          <div class="section-header">
            <h3 class="section-title">Backend Configuration</h3>
            <div class="section-badge readonly">Read-only</div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Provider</label>
              <input 
                :value="backendConfig.provider" 
                readonly 
                class="form-input readonly" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">Model</label>
              <input 
                :value="backendConfig.model" 
                readonly 
                class="form-input readonly" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">API Key</label>
              <input 
                :value="backendConfig.apiKey" 
                readonly 
                type="password" 
                class="form-input readonly" 
              />
            </div>
          </div>
        </div>

        <!-- Browser Config -->
        <div class="config-section">
          <div class="section-header">
            <h3 class="section-title">Browser Configuration</h3>
            <div class="section-badge fallback">Fallback</div>
          </div>
          
          <div class="form-grid">
            <!-- Provider Selection -->
            <div class="form-group">
              <label class="form-label">AI Provider</label>
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
            <div class="form-group">
              <label class="form-label">API Endpoint</label>
              <input 
                v-model="browserForm.baseUrl" 
                placeholder="Enter API endpoint URL"
                class="form-input"
              />
            </div>

            <!-- API Key -->
            <div class="form-group">
              <label class="form-label">API Key</label>
              <div class="input-with-button">
                <input 
                  v-model="browserForm.apiKey" 
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="Enter your API key"
                  class="form-input"
                />
                <button 
                  type="button" 
                  class="input-button"
                  @click="toggleApiKeyVisibility"
                  :title="showApiKey ? 'Hide key' : 'Show key'"
                >
                  <svg v-if="showApiKey" width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M6 16C6.63472 17.2193 7.59646 18.3504 8.82276 19.3554C12.261 22.1733 17.779 24 24 24C30.221 24 35.739 22.1733 39.1772 19.3554C40.4035 18.3504 41.3653 17.2193 42 16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M28.9775 24L31.048 31.7274" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M37.3535 21.3536L43.0103 27.0104" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.00004 27.0103L10.6569 21.3534" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.9278 31.7276L18.9983 24.0001" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M24 36C35.0457 36 44 24 44 24C44 24 35.0457 12 24 12C12.9543 12 4 24 4 24C4 24 12.9543 36 24 36Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
                    <path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Model Selection -->
            <div class="form-group">
              <label class="form-label">Model</label>
              <div class="model-input-container">
                <select
                  v-model="browserForm.model"
                  class="form-select"
                  @change="handleModelChange"
                >
                  <option 
                    v-for="model in getAvailableModels(browserForm.provider)"
                    :key="model.value"
                    :value="model.value"
                  >
                    {{ model.label }}
                  </option>
                  <!-- 显示当前自定义模型 -->
                  <option v-if="isCustomModel" :value="browserForm.model">
                    {{ browserForm.model }} (Custom)
                  </option>
                  <option value="custom">Custom Model...</option>
                </select>
                
                <!-- Custom Model Input -->
                <div v-if="showCustomModel" class="custom-model-container">
                  <input
                    v-model="customModelName"
                    type="text"
                    placeholder="Enter custom model name and press Enter"
                    class="form-input"
                    @keyup.enter="handleCustomModelEnter"
                    @blur="handleCustomModelBlur"
                    ref="customModelInput"
                  />
                  <p class="form-hint">Enter model name and press Enter to confirm, or click elsewhere to cancel</p>
                </div>
                
                <p v-else class="form-hint">Select a preset model or choose custom to enter your own</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button 
              type="button"
              @click="resetToDefaults"
              class="button secondary"
            >
              Reset to Defaults
            </button>
            <div class="button-group">
              <button 
                type="button"
                @click="testConfiguration"
                :disabled="isTesting"
                class="button outline"
              >
                <svg v-if="isTesting" class="button-icon spinning" width="16" height="16" viewBox="0 0 15 15" fill="none">
                  <path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43269 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43269 14.15 7.49998 14.15C10.4613 14.15 13.1618 11.9665 13.8093 9H12.7279C12.1415 11.2563 9.92395 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
                </svg>
                {{ isTesting ? 'Testing...' : 'Test Connection' }}
              </button>
              <button 
                type="button"
                @click="saveConfiguration"
                :disabled="isSaving"
                class="button primary"
              >
                <svg v-if="isSaving" class="button-icon spinning" width="16" height="16" viewBox="0 0 15 15" fill="none">
                  <path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43269 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43269 14.15 7.49998 14.15C10.4613 14.15 13.1618 11.9665 13.8093 9H12.7279C12.1415 11.2563 9.92395 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
                </svg>
                {{ isSaving ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Status Footer -->
        <div class="status-footer">
          <div class="status-item">
            <span class="status-label">Current Mode</span>
            <div class="status-value" :class="currentMode">
              {{ currentMode === 'backend' ? 'Backend Priority' : 'Browser Only' }}
            </div>
          </div>
          <div class="status-item">
            <span class="status-label">Connection Status</span>
            <div class="status-value" :class="{ 'connected': isBackendConnected, 'disconnected': !isBackendConnected }">
              {{ isBackendConnected ? 'Backend Connected' : 'Browser Only' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'

// Props definition
interface Props {
  open: boolean
  currentConfig?: AIConfig
  isBackendConnected?: boolean
  onTestConfig?: (config: AIConfig) => Promise<boolean>
}

// Emits definition
interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save', config: AIConfig): void
  (e: 'test', config: AIConfig): void
}

// AI configuration interface
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

// Simulate AI configuration state
const isCheckingBackend = ref(false)
const currentMode = computed(() => props.isBackendConnected ? 'backend' : 'browser')
const backendConfig = reactive({
  provider: 'gemini',
  model: 'gemini-2.5-flash-lite',
  apiKey: '***'
})

// Check backend health status
const checkBackendHealth = async () => {
  isCheckingBackend.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isCheckingBackend.value = false
  }
}

// Form state
const browserForm = reactive<AIConfig>({
  provider: 'gemini',
  baseUrl: '',
  apiKey: '',
  model: ''
})

// UI state
const showApiKey = ref(false)
const isSaving = ref(false)
const isTesting = ref(false)
const showCustomModel = ref(false)
const customModelName = ref('')
const customModelInput = ref<HTMLInputElement>()

// Predefined model lists
const modelOptions = {
  anthropic: [
    { label: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet' },
    { label: 'Claude Sonnet 4', value: 'claude-sonnet-4' },
    { label: 'Claude Opus 4', value: 'claude-opus-4' },
  ],
  openai: [
    { label: 'GPT-4.1', value: 'gpt-4.1' },
    { label: 'o3', value: 'o3' },
    { label: 'o4-mini', value: 'o4-mini' },
  ],
  gemini: [
    { label: 'Gemini 2 Flash', value: 'gemini-2-flash' },
    { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
    { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
  ]
}

// Default Base URLs
const defaultBaseUrls = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent'
}

// Get available models list
const getAvailableModels = (provider: string) => {
  return modelOptions[provider as keyof typeof modelOptions] || []
}

// Check if current model is a custom model
const isCustomModel = computed(() => {
  const models = getAvailableModels(browserForm.provider)
  return !models.find(m => m.value === browserForm.model) && browserForm.model !== 'custom'
})

// Toggle API Key visibility
const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

// Handle provider change
const handleProviderChange = () => {
  const provider = browserForm.provider
  browserForm.baseUrl = defaultBaseUrls[provider as keyof typeof defaultBaseUrls] || ''
  
  // Get models list for new provider
  const models = getAvailableModels(provider)
  
  // When provider switches, always reset to the first model of the new provider
  if (models.length > 0) {
    browserForm.model = models[0].value
  }
  
  // Hide custom model input
  showCustomModel.value = false
}

// Handle model change
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

// Handle custom model input
const handleCustomModelEnter = () => {
  if (customModelName.value.trim()) {
    browserForm.model = customModelName.value.trim()
    showCustomModel.value = false
    showMessage(`Custom model set: ${browserForm.model}`, 'success')
  }
}

const handleCustomModelBlur = () => {
  if (!customModelName.value.trim()) {
    // If user didn't input anything, revert to first preset model
    const models = getAvailableModels(browserForm.provider)
    if (models.length > 0) {
      browserForm.model = models[0].value
    }
    showCustomModel.value = false
  } else {
    // If user input content, set as custom model name
    browserForm.model = customModelName.value.trim()
    showCustomModel.value = false
  }
}

// Save configuration
const saveConfiguration = async () => {
  isSaving.value = true
  try {
    if (!browserForm.provider || !browserForm.baseUrl || !browserForm.apiKey) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    emit('save', { ...browserForm })
    showMessage('Configuration saved successfully', 'success')
  } catch (error) {
    console.error('Failed to save configuration:', error)
    showMessage('Failed to save configuration', 'error')
  } finally {
    isSaving.value = false
  }
}

// Test configuration
const testConfiguration = async () => {
  isTesting.value = true
  try {
    if (!browserForm.provider || !browserForm.baseUrl || !browserForm.apiKey) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    let success = false
    if (props.onTestConfig) {
      success = await props.onTestConfig({ ...browserForm })
    } else {
      emit('test', { ...browserForm })
      success = true
    }
    
    if (success) {
      showMessage('Configuration test successful', 'success')
    } else {
      showMessage('Configuration test failed', 'error')
    }
  } catch (error) {
    console.error('Configuration test failed:', error)
    showMessage('Configuration test error', 'error')
  } finally {
    isTesting.value = false
  }
}

// Reset to default configuration
const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset to default configuration? This will clear your custom settings.')) {
    browserForm.provider = 'gemini'
    handleProviderChange()
    browserForm.apiKey = ''
    showCustomModel.value = false
    
    showMessage('Reset to default configuration', 'success')
  }
}

// Close modal
const handleClose = () => {
  emit('update:open', false)
}

const handleOverlayClick = () => {
  emit('update:open', false)
}

// Simple message notification
const showMessage = (message: string, type: 'success' | 'error' | 'warning') => {
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'
  alert(`${emoji} ${message}`)
}

// Watch props configuration changes, sync to form
watch(() => props.currentConfig, (newConfig) => {
  if (newConfig) {
    Object.assign(browserForm, newConfig)
    
    // Check if loaded model is custom model
    const models = getAvailableModels(newConfig.provider)
    const isCustom = !models.find(m => m.value === newConfig.model) && newConfig.model !== 'custom'
    
    // If it's custom model, ensure custom input is not shown (since it's already set)
    if (isCustom) {
      showCustomModel.value = false
      customModelName.value = ''
    }
  }
}, { immediate: true, deep: true })

// Watch provider changes, reset model state
watch(() => browserForm.provider, (newProvider, oldProvider) => {
  // Only handle when provider actually changes
  if (newProvider !== oldProvider && oldProvider !== undefined) {
    // When provider changes, always reset to first model of new provider
    const models = getAvailableModels(newProvider)
    if (models.length > 0) {
      browserForm.model = models[0].value
    }
    
    // Hide custom model input
    showCustomModel.value = false
    customModelName.value = ''
  }
})

// Component initialization on mount
onMounted(() => {
  checkBackendHealth()
})
</script>

<style>
/* Scoped styles for monaco-ai-editor modal only */
/* Prefix all CSS variables to avoid global pollution */
.modal-overlay {
  /* Monaco AI Editor specific design system variables */
  --monaco-ai-background: 0 0% 100%;
  --monaco-ai-foreground: 222.2 84% 4.9%;
  --monaco-ai-card: 0 0% 100%;
  --monaco-ai-card-foreground: 222.2 84% 4.9%;
  --monaco-ai-popover: 0 0% 100%;
  --monaco-ai-popover-foreground: 222.2 84% 4.9%;
  --monaco-ai-primary: 221.2 83.2% 53.3%;
  --monaco-ai-primary-foreground: 210 40% 98%;
  --monaco-ai-secondary: 210 40% 96%;
  --monaco-ai-secondary-foreground: 222.2 84% 4.9%;
  --monaco-ai-muted: 210 40% 96%;
  --monaco-ai-muted-foreground: 215.4 16.3% 46.9%;
  --monaco-ai-accent: 210 40% 96%;
  --monaco-ai-accent-foreground: 222.2 84% 4.9%;
  --monaco-ai-destructive: 0 84.2% 60.2%;
  --monaco-ai-destructive-foreground: 210 40% 98%;
  --monaco-ai-border: 214.3 31.8% 91.4%;
  --monaco-ai-input: 214.3 31.8% 91.4%;
  --monaco-ai-ring: 221.2 83.2% 53.3%;
  --monaco-ai-radius: 0.5rem;
  
  /* Modal positioning and appearance */
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background-color: #ffffff;
  color: #0f172a;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .modal-content {
    width: 32rem;
    max-width: 32rem;
  }
}

@media (min-width: 768px) {
  .modal-content {
    width: 36rem;
    max-width: 36rem;
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  margin: 0;
  color: #0f172a;
}

.modal-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.close-button {
  background: none;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* Body */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Status Header */
.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.success {
  background-color: rgb(220 252 231);
  color: rgb(22 163 74);
}

.status-badge.warning {
  background-color: rgb(254 243 199);
  color: rgb(217 119 6);
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-indicator.success {
  background-color: rgb(34 197 94);
}

.status-indicator.warning {
  background-color: rgb(245 158 11);
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  transition: transform 0.2s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Config Section */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.section-badge {
  padding: 0.125rem 0.5rem;
  border-radius: calc(var(--monaco-ai-radius) - 2px);
  font-size: 0.75rem;
  font-weight: 500;
}

.section-badge.readonly {
  background-color: #f1f5f9;
  color: #64748b;
}

.section-badge.fallback {
  background-color: rgb(254 243 199);
  color: rgb(217 119 6);
}

/* Form Styles */
.form-grid {
  display: grid;
  gap: 1.25rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.125rem;
}

.form-input,
.form-select {
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.15s ease-in-out;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:hover:not(:focus):not(.readonly),
.form-select:hover:not(:focus) {
  border-color: #9ca3af;
}

.form-input.readonly {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5rem 1.5rem;
  padding-right: 2.5rem;
  appearance: none;
}

/* Input with Button */
.input-with-button {
  position: relative;
  display: flex;
  width: 100%;
}

.input-with-button .form-input {
  padding-right: 2.5rem;
  height: 2.5rem;
}

.input-button {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s ease;
  border-radius: 0 0.375rem 0.375rem 0;
}

.input-button:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Model Input */
.model-input-container {
  display: grid;
  gap: 0.5rem;
}

.custom-model-container {
  display: grid;
  gap: 0.5rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

/* Buttons */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  height: 2.25rem;
  transition: all 0.15s ease;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  outline: none;
  focus-visible: outline-2 outline-offset-2;
}

.button:disabled {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

.button.primary {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.button.primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.button.primary:focus-visible {
  outline-color: #2563eb;
}

.button.secondary {
  background-color: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.button.secondary:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.button.secondary:focus-visible {
  outline-color: #6b7280;
}

.button.outline {
  background-color: #ffffff;
  color: #374151;
  border-color: #d1d5db;
}

.button.outline:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.button.outline:focus-visible {
  outline-color: #6b7280;
}

.button-icon {
  width: 1rem;
  height: 1rem;
}

.button-icon.spinning {
  animation: spin 1s linear infinite;
}

/* Status Footer */
.status-footer {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(241, 245, 249, 0.5);
  border-radius: 0.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label {
  font-size: 0.875rem;
  color: #0f172a;
}

.status-value {
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-value.backend {
  background-color: rgb(219 234 254);
  color: rgb(59 130 246);
}

.status-value.browser {
  background-color: rgb(254 243 199);
  color: rgb(217 119 6);
}

.status-value.connected {
  background-color: rgb(220 252 231);
  color: rgb(22 163 74);
}

.status-value.disconnected {
  background-color: rgb(254 226 226);
  color: rgb(239 68 68);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .button-group {
    display: grid;
    gap: 0.5rem;
  }
}
</style>