import { ref, reactive, computed, watch } from 'vue'
import { createConfig, type AIConfigOptions } from '../config'
import { transformCompletionRequest, transformCompletionResponse, getProviderHeaders, buildProviderUrl } from '../utils/index'

// AI configuration interface
export interface AIConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

// Configuration validation result
export interface ConfigValidation {
  isValid: boolean
  errors: string[]
}

// Complete AI configuration state
export interface AIConfigState {
  backend: AIConfig
  browser: AIConfig
  isBackendConnected: boolean
  currentMode: 'backend' | 'browser'
}

// Configuration validation function
export const validateConfig = (config: AIConfig): ConfigValidation => {
  const errors: string[] = []
  
  if (!config.provider) {
    errors.push('Provider is required')
  } else if (!['anthropic', 'openai', 'gemini'].includes(config.provider.toLowerCase())) {
    errors.push('Provider must be one of: anthropic, openai, gemini')
  }
  
  if (!config.baseUrl) {
    errors.push('Base URL is required')
  } else {
    try {
      new URL(config.baseUrl.replace('{MODEL_NAME}', 'test'))
    } catch {
      errors.push('Base URL must be a valid URL')
    }
  }
  
  if (!config.apiKey) {
    errors.push('API key is required')
  } else if (config.apiKey.length < 10) {
    errors.push('API key seems too short')
  }
  
  if (!config.model) {
    errors.push('Model name is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const STORAGE_KEY = 'monaco-ai-config'

// Default browser configuration
const getDefaultBrowserConfig = (config: AIConfigOptions): AIConfig => ({
  provider: config.BROWSER_AI.CURRENT_PROVIDER,
  baseUrl: config.BROWSER_AI[config.BROWSER_AI.CURRENT_PROVIDER.toUpperCase() as keyof typeof config.BROWSER_AI].BASE_URL,
  apiKey: config.BROWSER_AI[config.BROWSER_AI.CURRENT_PROVIDER.toUpperCase() as keyof typeof config.BROWSER_AI].API_KEY,
  model: config.BROWSER_AI[config.BROWSER_AI.CURRENT_PROVIDER.toUpperCase() as keyof typeof config.BROWSER_AI].MODEL,
})

// Load configuration from local storage
const loadConfigFromStorage = (config: AIConfigOptions): AIConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...getDefaultBrowserConfig(config), ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load local config:', error)
  }
  return getDefaultBrowserConfig(config)
}

// Save configuration to local storage
const saveConfigToStorage = (config: AIConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save config to local storage:', error)
  }
}

/**
 * AI dynamic configuration management composable
 */
export function useAIConfig(
  userConfig?: Partial<AIConfigOptions>, 
  requestMode?: 'backend' | 'browser' | 'hybrid'
) {
  // Create actual configuration
  const CONFIG = createConfig(userConfig)
  
  // State management
  const isBackendConnected = ref(false)
  const isCheckingBackend = ref(false)
  
  // Configuration state
  const configState = reactive<AIConfigState>({
    backend: getDefaultBrowserConfig(CONFIG),
    browser: loadConfigFromStorage(CONFIG),
    isBackendConnected: false,
    currentMode: requestMode === 'browser' ? 'browser' : 'hybrid'
  })

  // Currently used configuration
  const currentConfig = computed(() => {
    return configState.isBackendConnected ? configState.backend : configState.browser
  })

  // Check backend connection status
  const checkBackendHealth = async (): Promise<boolean> => {
    if (isCheckingBackend.value) return false
    
    isCheckingBackend.value = true
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // If backend returns configuration info, update backend config
        if (data.config) {
          const backendProvider = data.provider || 'gemini'
          const backendConfig = data.config[backendProvider]
          if (backendConfig) {
            configState.backend = {
              provider: backendProvider,
              baseUrl: backendConfig.baseUrl || backendConfig.BASE_URL,
              apiKey: backendConfig.apiKey ? '***' : '', // Don't show real key
              model: backendConfig.model || backendConfig.MODEL
            }
          }
        }
        
        configState.isBackendConnected = true
        configState.currentMode = 'backend'
        return true
      }
    } catch (error) {
      console.warn('Backend health check failed:', error)
    } finally {
      isCheckingBackend.value = false
    }
    
    configState.isBackendConnected = false
    configState.currentMode = 'browser'
    return false
  }

  // Test configuration connection
  const testConfig = async (config: AIConfig): Promise<boolean> => {
    try {
      const testPrompt = {
        context: 'This is a test',
        instruction: 'Please reply "Test successful"',
        fileContent: ''
      }

      const headers = getProviderHeaders(config.provider, config.apiKey)
      const url = buildProviderUrl(config.baseUrl, config.model)
      const body = transformCompletionRequest(config.provider, config.model, testPrompt)

      // Use AbortController to implement timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = transformCompletionResponse(config.provider, data)
        return true
      } else {
        console.error('Config test failed:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('Config test error:', error)
      return false
    }
  }

  // Save browser configuration
  const saveBrowserConfig = (config: AIConfig) => {
    const validation = validateConfig(config)
    if (!validation.isValid) {
      console.warn('Invalid config provided:', validation.errors)
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`)
    }
    
    configState.browser = { ...config }
    saveConfigToStorage(config)
  }

  // Transform monacopilot body to our prompt format
  const transformBodyToPrompt = (body: any) => {
    const metadata = body.completionMetadata
    if (!metadata) {
      console.error('Missing completionMetadata:', body)
      // If no completionMetadata, try to use body content directly
      return {
        context: '',
        instruction: 'Please generate code completion suggestions based on context. Return only the code completion part, no explanations or other text.',
        fileContent: body.prompt || body.content || JSON.stringify(body)
      }
    }

    // Build context information
    const contextParts = []
    if (metadata.filename) {
      contextParts.push(`Current file: ${metadata.filename}`)
    }
    if (metadata.language) {
      contextParts.push(`Programming language: ${metadata.language}`)
    }
    if (metadata.technologies && metadata.technologies.length > 0) {
      contextParts.push(`Technologies used: ${metadata.technologies.join(', ')}`)
    }
    if (metadata.relatedFiles && metadata.relatedFiles.length > 0) {
      contextParts.push(`Related files: ${metadata.relatedFiles.map(f => f.path).join(', ')}`)
    }

    // Build file content (before cursor + after cursor)
    const fileContent = `${metadata.textBeforeCursor || ''}${metadata.textAfterCursor || ''}`

    return {
      context: contextParts.join('\n'),
      instruction: 'Please generate code completion suggestions based on context and cursor position. Return only the code completion part, no explanations or other text.',
      fileContent: fileContent
    }
  }

  // Get current effective AI completion function
  const getCompletionFunction = () => {
    return async (body: any) => {
      
      const config = currentConfig.value
      
      // Convert body to prompt format
      const prompt = transformBodyToPrompt(body)
      
      // Decide request strategy based on configured request mode
      const effectiveRequestMode = requestMode || CONFIG.REQUEST_MODE
      
      // If pure browser mode, use browser directly
      if (effectiveRequestMode === 'browser') {
        return await handleBrowserRequest(prompt)
      }
      
      // If backend or hybrid mode, try using backend API
      if ((effectiveRequestMode === 'backend' || effectiveRequestMode === 'hybrid') && 
          configState.isBackendConnected) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/completion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // Backend receives original body
          })

          if (response.ok) {
            const data = await response.json()
            
            // Ensure backend return format meets monacopilot expectations
            if (data && typeof data.text === 'string') {
              return { completion: data.text }
            } else if (data && typeof data.completion === 'string') {
              return data // If backend already returns correct format
            } else {
              console.warn('Backend returned incorrect format, falling back to browser:', data)
              if (effectiveRequestMode === 'hybrid') {
                return await handleBrowserRequest(prompt)
              }
            }
          } else {
            console.warn('Backend completion failed')
            if (effectiveRequestMode === 'hybrid') {
              return await handleBrowserRequest(prompt)
            }
          }
        } catch (error) {
          console.warn('Backend request failed:', error)
          if (effectiveRequestMode === 'hybrid') {
            return await handleBrowserRequest(prompt)
          }
        }
      }
      
      // If pure backend mode but backend unavailable, return error
      if (effectiveRequestMode === 'backend') {
        return { completion: null, error: 'Backend not available and browser mode disabled' }
      }
      
      // Default fallback to browser (hybrid mode)
      return await handleBrowserRequest(prompt)
    }
  }

  // Browser request handler function
  const handleBrowserRequest = async (prompt: any) => {
    const browserConfig = configState.browser
    if (!browserConfig.apiKey) {
      throw new Error('Browser API key not configured')
    }

    try {
      const headers = getProviderHeaders(browserConfig.provider, browserConfig.apiKey)
      const url = buildProviderUrl(browserConfig.baseUrl, browserConfig.model)
      const requestBody = transformCompletionRequest(browserConfig.provider, browserConfig.model, prompt)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: requestBody,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ ${browserConfig.provider} API Error:`, errorText)
        throw new Error(`${browserConfig.provider} API request failed: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      const text = transformCompletionResponse(browserConfig.provider, responseData)

      if (!text) {
        console.warn(`${browserConfig.provider} returned empty content, response structure:`, responseData)
        return { completion: null }
      }

      return { completion: text }
    } catch (error) {
      console.error('Browser completion error:', error)
      return { completion: null, error: error.message || 'Completion request failed' }
    }
  }

  // Watch configuration changes
  watch(() => configState.browser, (newConfig) => {
    saveConfigToStorage(newConfig)
  }, { deep: true })

  // Check backend status on initialization
  checkBackendHealth()

  return {
    // States
    configState,
    isBackendConnected: computed(() => configState.isBackendConnected),
    currentMode: computed(() => configState.currentMode),
    currentConfig,
    isCheckingBackend,

    // Methods
    checkBackendHealth,
    testConfig,
    saveBrowserConfig,
    getCompletionFunction,
    validateConfig,

    // Configuration data
    browserConfig: computed(() => configState.browser),
    backendConfig: computed(() => configState.backend),
  }
}