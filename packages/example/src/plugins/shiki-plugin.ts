import type { MonacoPlugin, PluginContext } from 'monaco-ai-editor'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'

export interface ShikiPluginOptions {
  /** Themes to load */
  themes?: string[]
  
  /** Languages to load */
  langs?: string[]
  
  /** Default theme */
  defaultTheme?: string
  
  /** Whether to enable all built-in languages */
  enableAllLangs?: boolean
  
  /** Whether to enable all built-in themes */
  enableAllThemes?: boolean
}

/**
 * Shiki Syntax Highlighting Plugin for Example Project
 * Demonstrates how to create external plugins for monaco-ai-editor
 */
export const shikiPlugin: MonacoPlugin = {
  name: 'shiki',
  version: '1.0.0',
  description: 'VS Code-level syntax highlighting using Shiki (External Plugin Example)',
  
  defaultOptions: {
    themes: [
      'dark-plus',
      'light-plus', 
      'github-dark',
      'github-light',
      'one-dark-pro',
      'monokai',
      'solarized-dark',
      'solarized-light'
    ],
    langs: [
      'javascript',
      'typescript',
      'vue',
      'html',
      'css',
      'json',
      'markdown',
      'python',
      'java',
      'cpp',
      'rust',
      'go',
      'php',
      'ruby',
      'bash',
      'yaml',
      'xml',
      'sql'
    ],
    defaultTheme: 'dark-plus',
    enableAllLangs: false,
    enableAllThemes: false
  } as ShikiPluginOptions,

  lifecycle: {
    async beforeCreate(context: PluginContext) {
      const options = context.options as ShikiPluginOptions
      
      try {
        console.log('🎨 Initializing Shiki highlighter (External Plugin)...')
        
        // Create highlighter with specified options, using safer configuration
        const highlighter = await createHighlighter({
          themes: options.enableAllThemes ? 'all' : (options.themes || ['dark-plus', 'light-plus']),
          langs: options.enableAllLangs ? 'all' : (options.langs || ['javascript', 'typescript', 'vue']),
        })

        // Register missing language IDs in Monaco
        const monacoLangs = context.monaco.languages.getLanguages()
        const registeredLangIds = new Set(monacoLangs.map(lang => lang.id))
        
        const langsToRegister = options.langs || []
        for (const langId of langsToRegister) {
          if (!registeredLangIds.has(langId)) {
            context.monaco.languages.register({ id: langId })
            console.log(`📝 Registered language: ${langId}`)
          }
        }

        // Apply Shiki highlighting to Monaco
        shikiToMonaco(highlighter, context.monaco)
        
        console.log('✅ Shiki highlighter initialized successfully')
        
        // Store highlighter instance for potential future use
        ;(context as any).shikiHighlighter = highlighter
        
      } catch (error: any) {
        console.warn('⚠️ Failed to initialize Shiki highlighter:', error)
        console.warn('🔄 Falling back to Monaco built-in highlighting...')
        // Don't throw error, just continue without Shiki
        return
      }
    },

    async afterCreate(context: PluginContext) {
      const options = context.options as ShikiPluginOptions
      
      // Set default theme if specified
      if (options.defaultTheme && context.editor) {
        try {
          context.monaco.editor.setTheme(options.defaultTheme)
          console.log(`🎨 Applied Shiki theme: ${options.defaultTheme}`)
        } catch (error) {
          console.warn(`⚠️ Failed to apply Shiki theme ${options.defaultTheme}:`, error)
        }
      }
      
      // Log available themes for debugging
      console.log('🎯 Available Shiki themes:', options.themes)
    },

    async destroy() {
      console.log('🗑️ Shiki plugin destroyed')
      // Cleanup if needed - Shiki doesn't require explicit cleanup
    }
  }
}