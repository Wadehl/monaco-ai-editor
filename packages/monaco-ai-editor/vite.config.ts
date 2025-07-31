import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MonacoAIEditor',
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled into your library
      external: [
        'vue',
        'monaco-editor',
        '@vueuse/core',
        // Externalize Monaco worker imports to avoid bundling
        /^monaco-editor\/esm\/vs\/.*\.worker(\?worker)?$/
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          vue: 'Vue',
          'monaco-editor': 'monaco',
          '@vueuse/core': 'VueUse'
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true
  },
  optimizeDeps: {
    include: [
      'monacopilot'
    ],
    exclude: [
      // Exclude worker files from optimization
      'monaco-editor/esm/vs/editor/editor.worker',
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/css/css.worker',
      'monaco-editor/esm/vs/language/html/html.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker'
    ]
  }
})