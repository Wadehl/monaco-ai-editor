import { CompletionCopilot } from 'monacopilot';

// 加载环境变量
import { readFileSync } from 'fs';
import { join } from 'path';

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
    }
};
console.log(AI_CONFIG);

// 当前使用的AI服务（从环境变量读取）
type ProviderSupport = 'anthropic' | 'openai';
const currentProvider = (process.env.CURRENT_PROVIDER || 'anthropic') as ProviderSupport;

const copilot = new CompletionCopilot(undefined, {
    model: async prompt => {
        const config = AI_CONFIG[currentProvider];
        
        if (currentProvider === 'openai') {
            const response = await fetch(config.baseUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: config.model,
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
            });
            
            const data = await response.json();
            return {
                text: data.choices[0].message.content,
            };
        } else if (currentProvider === 'anthropic') {
            const response = await fetch(config.baseUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': config.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: 256,
                    messages: [
                        {
                            role: 'user',
                            content: `${prompt.context}\n\n${prompt.instruction}\n\n${prompt.fileContent}`,
                        },
                    ],
                }),
            });
            
            const data = await response.json();
            return {
                text: data.content[0].text,
            };
        }
        
        return { text: '' };
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
                console.log('收到补全请求:', body);
                
                const completion = await copilot.complete({ body });
                console.log('补全结果:', completion);
                
                return new Response(JSON.stringify(completion), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                });
            } catch (error) {
                console.error('补全错误:', error);
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
            return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
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