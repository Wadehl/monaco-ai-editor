// Example项目的配置管理
// 这里从.env文件读取配置，然后传递给monaco-ai-editor

export const EXAMPLE_CONFIG = {
  // 后端服务配置
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // UI控制
  SHOW_AI_CONFIG_BUTTON: import.meta.env.VITE_SHOW_AI_CONFIG_BUTTON !== 'false',
  
  // 请求模式: 'backend' | 'browser' | 'hybrid'
  REQUEST_MODE: (import.meta.env.VITE_REQUEST_MODE as 'backend' | 'browser' | 'hybrid') || 'hybrid',
  
  // 浏览器端AI配置（兜底方案）
  BROWSER_AI: {
    CURRENT_PROVIDER: import.meta.env.VITE_CURRENT_PROVIDER || 'anthropic',
    OPENAI: {
      BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || 'http://openai.37mobi.com/v1/chat/completions',
      API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
      MODEL: import.meta.env.VITE_OPENAI_MODEL || 'o4-mini',
    },
    ANTHROPIC: {
      BASE_URL: import.meta.env.VITE_ANTHROPIC_BASE_URL || 'http://anthropic.37mobi.com/v1/messages',
      API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      MODEL: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-7-sonnet@20250219',
    },
    GEMINI: {
      BASE_URL: import.meta.env.VITE_GEMINI_BASE_URL || 'http://gemini.37mobi.com/v1beta/models/{MODEL_NAME}:generateContent',
      API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
      MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite',
    }
  }
}

// 调试信息
console.log('🔧 Example项目配置:', {
  BACKEND_URL: EXAMPLE_CONFIG.BACKEND_URL,
  SHOW_AI_CONFIG_BUTTON: EXAMPLE_CONFIG.SHOW_AI_CONFIG_BUTTON,
  REQUEST_MODE: EXAMPLE_CONFIG.REQUEST_MODE,
  CURRENT_PROVIDER: EXAMPLE_CONFIG.BROWSER_AI.CURRENT_PROVIDER,
  ANTHROPIC_API_KEY: EXAMPLE_CONFIG.BROWSER_AI.ANTHROPIC.API_KEY ? '已配置' : '未配置',
  OPENAI_API_KEY: EXAMPLE_CONFIG.BROWSER_AI.OPENAI.API_KEY ? '已配置' : '未配置',
  GEMINI_API_KEY: EXAMPLE_CONFIG.BROWSER_AI.GEMINI.API_KEY ? '已配置' : '未配置',
})