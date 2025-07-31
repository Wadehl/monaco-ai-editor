import { CompletionCopilot } from 'monacopilot';

// 加载环境变量
import { readFileSync } from 'fs';
import { join } from 'path';

// AI 服务工具函数
const transformCompletionRequest = (provider: string, model: string, prompt: any): string => {
  const content = `${prompt.context}\n\n${prompt.instruction}\n\n${prompt.fileContent}`;
  
  try {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return JSON.stringify({
          model: model,
          input: [
            {
              role: 'user',
              content: content
            }
          ],
          max_tokens: 256,
        });
      
      case 'openai':
        return JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content,
            }
          ],
          max_tokens: 256,
        });
      
      case 'gemini':
        return JSON.stringify({
          model: model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: content
                }
              ]
            }
          ]
        });
      
      default:
        console.warn(`⚠️ 未知的提供商: ${provider}, 使用默认请求格式`);
        return JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content,
            }
          ]
        });
    }
  } catch (error) {
    console.error(`❌ 转换 ${provider} 请求失败:`, error);
    return JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content,
        }
      ]
    });
  }
};

const transformCompletionResponse = (provider: string, responseData: any): string => {
  try {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return responseData.content?.[0]?.text || '';
      
      case 'openai':
        return responseData.output?.[0]?.content?.[0]?.text || responseData.choices?.[0]?.message?.content || '';
      
      case 'gemini':
        return responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      default:
        console.warn(`⚠️ 未知的提供商: ${provider}, 使用默认响应解析`);
        return responseData.text || responseData.content || '';
    }
  } catch (error) {
    console.error(`❌ 转换 ${provider} 响应失败:`, error);
    return '';
  }
};

const getProviderHeaders = (provider: string, apiKey: string): Record<string, string> => {
  const baseHeaders = {
    'Content-Type': 'application/json',
  };

  switch (provider.toLowerCase()) {
    case 'anthropic':
      return {
        ...baseHeaders,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };
    
    case 'openai':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`,
      };
    
    case 'gemini':
      return {
        ...baseHeaders,
        'x-goog-api-key': apiKey,
      };
    
    default:
      console.warn(`⚠️ 未知的提供商: ${provider}, 使用默认请求头`);
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`,
      };
  }
};

const buildProviderUrl = (baseUrl: string, modelName: string): string => {
  return baseUrl.replace('{MODEL_NAME}', modelName);
};

// 手动加载.env文件
try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    envVars.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
        }
    });
} catch (error) {
    console.warn('无法加载.env文件，使用默认配置');
}

// 从环境变量读取配置
const AI_CONFIG = {
    openai: {
        baseUrl: process.env.OPENAI_BASE_URL || 'http://openai.37mobi.com/v1/chat/completions',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'o4-mini',
    },
    anthropic: {
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'http://anthropic.37mobi.com/v1/messages',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet@20250219',
    },
    gemini: {
        baseUrl: process.env.GEMINI_BASE_URL || 'http://gemini.37mobi.com/v1beta/models/{MODEL_NAME}:generateContent',
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    }
};

console.log('🔧 AI 配置:', {
    currentProvider: process.env.CURRENT_PROVIDER,
    openai: { ...AI_CONFIG.openai, apiKey: AI_CONFIG.openai.apiKey ? '已配置' : '未配置' },
    anthropic: { ...AI_CONFIG.anthropic, apiKey: AI_CONFIG.anthropic.apiKey ? '已配置' : '未配置' },
    gemini: { ...AI_CONFIG.gemini, apiKey: AI_CONFIG.gemini.apiKey ? '已配置' : '未配置' }
});

// 当前使用的AI服务（从环境变量读取）
type ProviderSupport = 'anthropic' | 'openai' | 'gemini';
const currentProvider = (process.env.CURRENT_PROVIDER || 'anthropic') as ProviderSupport;

const copilot = new CompletionCopilot(undefined, {
    model: async prompt => {
        const config = AI_CONFIG[currentProvider];
        
        if (!config.apiKey) {
            throw new Error(`${currentProvider} API 密钥未配置`);
        }
        
        try {
            console.log(`🤖 使用 ${currentProvider} 进行代码补全...`);
            
            const headers = getProviderHeaders(currentProvider, config.apiKey);
            const url = buildProviderUrl(config.baseUrl, config.model);
            const body = transformCompletionRequest(currentProvider, config.model, prompt);
            
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body,
            });
            
            if (!response.ok) {
                throw new Error(`${currentProvider} API 请求失败: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            const text = transformCompletionResponse(currentProvider, responseData);
            
            if (!text) {
                console.warn(`⚠️ ${currentProvider} 返回空内容，响应结构:`, responseData);
            }
            
            return { text };
        } catch (error) {
            console.error(`❌ ${currentProvider} 补全错误:`, error);
            throw error;
        }
    },
});

const server = Bun.serve({
    port: process.env.PORT || 3001,

    async fetch(request) {
        const url = new URL(request.url);
        
        // 添加CORS支持
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        
        // 处理预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        if (url.pathname === '/completion' && request.method === 'POST') {
            try {
                const body = await request.json();
                console.log('📨 收到补全请求:', body);
                
                const completion = await copilot.complete({ body });
                console.log('✅ 补全结果:', completion);
                
                return new Response(JSON.stringify(completion), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            } catch (error) {
                console.error('💥 补全错误:', error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            }
        }
        
        // 健康检查端点
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                provider: currentProvider,
                config: {
                    [currentProvider]: {
                        ...AI_CONFIG[currentProvider],
                        apiKey: AI_CONFIG[currentProvider].apiKey ? '已配置' : '未配置'
                    }
                }
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }
        
        return new Response('Not Found', { 
            status: 404,
            headers: corsHeaders,
        });
    },
});

console.log(`🚀 补全服务器启动在端口 ${server.port}`);
console.log(`📡 补全端点: http://localhost:${server.port}/completion`);
console.log(`💚 健康检查: http://localhost:${server.port}/health`);
console.log(`🤖 当前 AI 提供商: ${currentProvider}`);