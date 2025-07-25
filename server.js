import { CompletionCopilot } from 'monacopilot';
import http from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import { URL } from 'url';

// 加载环境变量
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

// 当前使用的AI服务（从环境变量读取）
const currentProvider = (process.env.CURRENT_PROVIDER || 'anthropic');

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

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // 添加CORS支持
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // 设置CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (url.pathname === '/completion' && req.method === 'POST') {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const parsedBody = JSON.parse(body);
                    console.log('收到补全请求:', parsedBody);
                    
                    const completion = await copilot.complete({ body: parsedBody });
                    console.log('补全结果:', completion);
                    
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.end(JSON.stringify(completion));
                } catch (error) {
                    console.error('补全错误:', error);
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        } catch (error) {
            console.error('请求处理错误:', error);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }
    
    // 健康检查端点
    if (url.pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            runtime: 'Node.js'
        }));
        return;
    }
    
    res.writeHead(404);
    res.end('Not Found');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`🚀 Node.js补全服务器启动在端口 ${port}`);
    console.log(`📡 补全端点: http://localhost:${port}/completion`);
    console.log(`💚 健康检查: http://localhost:${port}/health`);
    console.log(`⚡ 运行时: Node.js ${process.version}`);
});