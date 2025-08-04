// Styles (import CSS automatically with the package)
import './style.css'

// Main component
export { default as MonacoAIEditor } from './components/MonacoAIEditor.vue'
export { default as AIConfigPanel } from './components/AIConfigPanel.vue'

// Composables/Hooks
export { useAIConfig } from './composables/useAIConfig'

// Plugins
export * from './plugins'

// Utils
export * from './utils/index'

// Config
export { CONFIG, createConfig } from './config'
export type { AIConfigOptions } from './config'

// Monaco Worker Utilities
export { 
  setupMonacoEnvironment,
  WORKER_SETUP_EXAMPLES,
  SUPPORTED_LANGUAGES
} from './monaco-worker'

// Types
export type { AIConfig, AIConfigState, ConfigValidation } from './composables/useAIConfig'
export { validateConfig } from './composables/useAIConfig'