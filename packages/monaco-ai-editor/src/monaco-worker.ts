import * as monaco from 'monaco-editor'

// Simplified Monaco Editor setup
// Workers should be configured externally by the user for maximum flexibility

// Helper function to setup basic Monaco environment
// Users can call this directly or provide their own worker setup
export const setupMonacoEnvironment = () => {
  // Minimal setup - only basic editor worker
  // Users should configure language workers externally based on their needs
  if (!self.MonacoEnvironment) {
    self.MonacoEnvironment = {
      getWorker: async () => {
        // Only provide the basic editor worker
        const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
        return new editorWorker()
      }
    }
  }
}

// Export helper functions for external worker setup
export const createWorkerConfig = {
  // Create a worker config with all language workers
  all: () => ({
    getWorker: async (_: any, label: string) => {
      switch (label) {
        case 'json':
          const { default: jsonWorker } = await import('monaco-editor/esm/vs/language/json/json.worker?worker')
          return new jsonWorker()
        
        case 'css':
        case 'scss':
        case 'less':
          const { default: cssWorker } = await import('monaco-editor/esm/vs/language/css/css.worker?worker')
          return new cssWorker()
        
        case 'html':
        case 'handlebars':
        case 'razor':
          const { default: htmlWorker } = await import('monaco-editor/esm/vs/language/html/html.worker?worker')
          return new htmlWorker()
        
        case 'typescript':
        case 'javascript':
          const { default: tsWorker } = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
          return new tsWorker()
        
        default:
          const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
          return new editorWorker()
      }
    }
  }),

  // Create a selective worker config
  selective: (workers: string[]) => ({
    getWorker: async (_: any, label: string) => {
      // Check if this worker type is enabled
      const workerMap: Record<string, string[]> = {
        json: ['json'],
        css: ['css', 'scss', 'less'],
        html: ['html', 'handlebars', 'razor'],
        typescript: ['typescript', 'javascript']
      }

      for (const [workerType, languages] of Object.entries(workerMap)) {
        if (languages.includes(label) && workers.includes(workerType)) {
          try {
            switch (workerType) {
              case 'json':
                const { default: jsonWorker } = await import('monaco-editor/esm/vs/language/json/json.worker?worker')
                return new jsonWorker()
              case 'css':
                const { default: cssWorker } = await import('monaco-editor/esm/vs/language/css/css.worker?worker')
                return new cssWorker()
              case 'html':
                const { default: htmlWorker } = await import('monaco-editor/esm/vs/language/html/html.worker?worker')
                return new htmlWorker()
              case 'typescript':
                const { default: tsWorker } = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
                return new tsWorker()
            }
          } catch (error) {
            console.warn(`Failed to load ${workerType} worker:`, error)
          }
        }
      }

      // Fallback to basic editor worker
      const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
      return new editorWorker()
    }
  }),

  // Create a minimal config (no language workers)
  minimal: () => ({
    getWorker: async () => {
      const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
      return new editorWorker()
    }
  })
}

// All supported Monaco basic languages (for reference)
export const SUPPORTED_LANGUAGES = [
  'abap', 'apex', 'azcli', 'bat', 'bicep', 'cameligo', 'clojure', 'coffee',
  'cpp', 'csharp', 'csp', 'css', 'cypher', 'dart', 'dockerfile', 'ecl', 'elixir',
  'flow9', 'freemarker2', 'fsharp', 'go', 'graphql', 'handlebars', 'hcl', 'html', 
  'ini', 'java', 'javascript', 'json', 'julia', 'kotlin', 'less', 'lexon', 'liquid', 
  'lua', 'm3', 'markdown', 'mdx', 'mips', 'msdax', 'mysql', 'objective-c', 'pascal', 
  'pascaligo', 'perl', 'pgsql', 'php', 'pla', 'postiats', 'powerquery', 'powershell', 
  'protobuf', 'pug', 'python', 'qsharp', 'r', 'razor', 'redis', 'redshift', 
  'restructuredtext', 'ruby', 'rust', 'sb', 'scala', 'scheme', 'scss', 'shell', 
  'solidity', 'sophia', 'sparql', 'sql', 'st', 'swift', 'systemverilog', 'tcl', 
  'test', 'twig', 'typescript', 'typespec', 'vb', 'wgsl', 'xml', 'yaml'
] as const

export default monaco