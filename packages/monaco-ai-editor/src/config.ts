// AI configuration options interface
export interface AIConfigOptions {
  // Backend service configuration
  BACKEND_URL: string
  
  // UI control
  SHOW_AI_CONFIG_BUTTON: boolean
  
  // Request mode: 'backend' | 'browser' | 'hybrid'
  REQUEST_MODE: 'backend' | 'browser' | 'hybrid'
  
  // Browser AI configuration (fallback solution)
  BROWSER_AI: {
    CURRENT_PROVIDER: string
    OPENAI: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
    ANTHROPIC: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
    GEMINI: {
      BASE_URL: string
      API_KEY: string
      MODEL: string
    }
  }
}

// Default configuration
const DEFAULT_CONFIG: AIConfigOptions = {
  BACKEND_URL: 'http://localhost:3001',
  SHOW_AI_CONFIG_BUTTON: true,
  REQUEST_MODE: 'hybrid',
  BROWSER_AI: {
    CURRENT_PROVIDER: 'anthropic',
    OPENAI: {
      BASE_URL: 'https://api.openai.com/v1/chat/completions',
      API_KEY: '',
      MODEL: 'gpt-4o-mini',
    },
    ANTHROPIC: {
      BASE_URL: 'https://api.anthropic.com/v1/messages',
      API_KEY: '',
      MODEL: 'claude-3-haiku-20240307',
    },
    GEMINI: {
      BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent',
      API_KEY: '',
      MODEL: 'gemini-1.5-flash',
    }
  }
}

// Configuration factory function
export const createConfig = (userConfig?: Partial<AIConfigOptions>): AIConfigOptions => {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    BROWSER_AI: {
      ...DEFAULT_CONFIG.BROWSER_AI,
      ...userConfig?.BROWSER_AI,
      OPENAI: {
        ...DEFAULT_CONFIG.BROWSER_AI.OPENAI,
        ...userConfig?.BROWSER_AI?.OPENAI
      },
      ANTHROPIC: {
        ...DEFAULT_CONFIG.BROWSER_AI.ANTHROPIC,
        ...userConfig?.BROWSER_AI?.ANTHROPIC
      },
      GEMINI: {
        ...DEFAULT_CONFIG.BROWSER_AI.GEMINI,
        ...userConfig?.BROWSER_AI?.GEMINI
      }
    }
  }
}

// Export default configuration (backward compatibility)
export const CONFIG = DEFAULT_CONFIG