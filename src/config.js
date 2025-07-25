// 前端环境配置
export const CONFIG = {
  // 后端服务配置
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // 浏览器端AI配置（兜底方案）
  BROWSER_AI: {
    // 当前使用的提供商
    CURRENT_PROVIDER: import.meta.env.VITE_CURRENT_PROVIDER || 'anthropic',
    
    // OpenAI配置
    OPENAI: {
      BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || 'http://openai.37mobi.com/v1/chat/completions',
      API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
      MODEL: import.meta.env.VITE_OPENAI_MODEL || 'o4-mini',
    },
    
    // Anthropic配置
    ANTHROPIC: {
      BASE_URL: import.meta.env.VITE_ANTHROPIC_BASE_URL || 'http://anthropic.37mobi.com/v1/messages',
      API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      MODEL: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-7-sonnet@20250219',
    }
  }
};

// 调试信息
console.log('🔧 前端环境配置:', {
  BACKEND_URL: CONFIG.BACKEND_URL,
  CURRENT_PROVIDER: CONFIG.BROWSER_AI.CURRENT_PROVIDER,
  ANTHROPIC_API_KEY: CONFIG.BROWSER_AI.ANTHROPIC.API_KEY ? '已配置' : '未配置',
  OPENAI_API_KEY: CONFIG.BROWSER_AI.OPENAI.API_KEY ? '已配置' : '未配置',
  
  // 显示原始环境变量
  RAW_ENV: {
    VITE_CURRENT_PROVIDER: import.meta.env.VITE_CURRENT_PROVIDER,
    VITE_ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY ? '已设置' : '未设置',
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? '已设置' : '未设置',
  }
});