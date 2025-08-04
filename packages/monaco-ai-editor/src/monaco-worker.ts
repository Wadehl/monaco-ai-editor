import * as monaco from 'monaco-editor'

// Monaco Editor worker setup utilities
// These functions help users configure Monaco workers in their applications
// Users must set up MonacoEnvironment before using MonacoAIEditor

// Helper function to setup basic Monaco environment with user-provided worker configuration
export const setupMonacoEnvironment = (workerConfig?: () => Worker) => {
  if (!self.MonacoEnvironment) {
    self.MonacoEnvironment = {
      getWorker: workerConfig || (() => {
        throw new Error('Monaco workers not configured. Please set up MonacoEnvironment before using MonacoAIEditor.')
      })
    }
  }
}

// Documentation and examples for users to configure their own workers
export const WORKER_SETUP_EXAMPLES = {
  // Example 1: Basic setup with editor worker only
  basic: `
// In your main.ts, before creating the app:
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker()
  }
}
  `,

  // Example 2: Full language support
  full: `
// In your main.ts, before creating the app:
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  }
}
  `,

  // Example 3: Dynamic imports (recommended for better code splitting)
  dynamic: `
// In your main.ts, before creating the app:
self.MonacoEnvironment = {
  getWorker: async (_, label) => {
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
}
  `
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