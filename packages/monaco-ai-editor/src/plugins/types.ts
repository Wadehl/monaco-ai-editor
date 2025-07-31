import type monaco from 'monaco-editor'

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  /** Called before editor is created */
  beforeCreate?: (options: PluginContext) => void | Promise<void>
  
  /** Called after editor is created */
  afterCreate?: (options: PluginContext) => void | Promise<void>
  
  /** Called when plugin is being destroyed */
  destroy?: () => void | Promise<void>
}

/**
 * Plugin context passed to lifecycle hooks
 */
export interface PluginContext {
  /** Monaco editor instance */
  editor: monaco.editor.IStandaloneCodeEditor
  
  /** Monaco module */
  monaco: typeof monaco
  
  /** Container element */
  container: HTMLElement
  
  /** Editor configuration */
  config: {
    language: string
    theme: string
    value: string
  }
  
  /** Plugin options */
  options?: Record<string, any>
}

/**
 * Plugin definition interface
 */
export interface MonacoPlugin {
  /** Plugin name */
  name: string
  
  /** Plugin version */
  version?: string
  
  /** Plugin description */
  description?: string
  
  /** Plugin dependencies (other plugin names) */
  dependencies?: string[]
  
  /** Lifecycle hooks */
  lifecycle: PluginLifecycle
  
  /** Default options */
  defaultOptions?: Record<string, any>
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  /** Register a plugin */
  register(plugin: MonacoPlugin): void
  
  /** Unregister a plugin */
  unregister(name: string): void
  
  /** Get registered plugin */
  get(name: string): MonacoPlugin | undefined
  
  /** Get all registered plugins */
  getAll(): MonacoPlugin[]
  
  /** Check if plugin is registered */
  has(name: string): boolean
  
  /** Install plugins on editor */
  install(context: PluginContext, pluginNames?: string[]): Promise<void>
  
  /** Uninstall plugins */
  uninstall(): Promise<void>
}