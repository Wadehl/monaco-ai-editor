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
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="m11.7816 4.03157c.0462-.04625.0462-.12084 0-.16709-.0462-.04625-.1208-.04625-.1670 0L7.5 7.94888 3.38388 3.86448c-.04625-.04625-.12084-.04625-.16709 0-.04625.04625-.04625.12084 0 .16709L7.05112 8.5 3.21679 12.3343c-.04625.0462-.04625.1208 0 .1671.04625.0462.12084.0462.16709 0L7.5 8.05112l4.1161 4.08428c.0462.0462.1208.0462.1671 0 .0462-.0463.0462-.1209 0-.1671L7.94888 8.5 11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
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
                  <svg v-if="showApiKey" width="16" height="16" viewBox="0 0 15 15" fill="none">
                    <path d="M13.3536 2.35355C13.5488 2.15829 13.5488 1.84171 13.3536 1.64645C13.1583 1.45118 12.8417 1.45118 12.6464 1.64645L10.6828 3.61012C9.70652 3.21671 8.63759 3 7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C0.902945 9.08812 2.02314 10.1861 3.36061 10.9323L1.64645 12.6464C1.45118 12.8417 1.45118 13.1583 1.64645 13.3536C1.84171 13.5488 2.15829 13.5488 2.35355 13.3536L4.31723 11.3899C5.29348 11.7833 6.36241 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C14.0971 5.91190 12.9769 4.81391 11.6394 4.06770L13.3536 2.35355ZM9.90428 4.38861C9.15332 4.1361 8.34759 4 7.5 4C4.80285 4 2.52952 5.37816 1.09622 7.50001C1.87284 8.6497 2.89609 9.58106 4.09974 10.1931L9.90428 4.38861ZM5.09572 10.6114L10.9003 4.80685C12.1039 5.41894 13.1272 6.35031 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11C6.65241 11 5.84668 10.8639 5.09572 10.6114Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
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
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
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
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.form-input,
.form-select {
  display: flex;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.form-input.readonly {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #64748b;
}

/* Input with Button */
.input-with-button {
  display: flex;
  position: relative;
}

.input-with-button .form-input {
  padding-right: 3rem;
}

.input-button {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.input-button:hover {
  color: #0f172a;
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
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.button-group {
  display: flex;
  gap: 0.5rem;
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
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.button:disabled {
  pointer-events: none;
  opacity: 0.5;
}

.button.primary {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.button.primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.button.secondary {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #e2e8f0;
}

.button.secondary:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.button.outline {
  background-color: #ffffff;
  color: #0f172a;
  border-color: #e2e8f0;
}

.button.outline:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0f172a;
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