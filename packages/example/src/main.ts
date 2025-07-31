import { createApp } from 'vue'
import './styles/globals.css'
import App from './App.vue'

// Setup Monaco workers before creating the app
import { createWorkerConfig } from 'monaco-ai-editor'

// Configure Monaco workers based on your project needs
// Option 1: Selective workers (recommended for most projects)
self.MonacoEnvironment = createWorkerConfig.selective(['typescript', 'json', 'css', 'html'])

// Option 2: All workers (larger bundle but full language support)
// self.MonacoEnvironment = createWorkerConfig.all()

// Option 3: Minimal (smallest bundle, basic syntax highlighting only)
// self.MonacoEnvironment = createWorkerConfig.minimal()

createApp(App).mount('#app')
