import { pluginManager } from 'monaco-ai-editor'
import { shikiPlugin } from './plugins'

// Register external plugins
pluginManager.register(shikiPlugin)

console.log('External plugins registered:', pluginManager.getAll().map(p => p.name))