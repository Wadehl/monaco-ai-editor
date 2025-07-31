import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: './', // 使用相对路径以支持 Live Server 等静态文件服务器
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'monaco-ai-editor': resolve(__dirname, '../monaco-ai-editor/src')
    }
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/language/typescript/ts.worker', 
      'monaco-editor/esm/vs/editor/editor.worker',
      'shiki',
      '@shikijs/monaco'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
          shiki: ['shiki', '@shikijs/monaco']
        }
      }
    }
  }
})