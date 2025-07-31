import type { PluginManager, MonacoPlugin, PluginContext } from './types'

/**
 * Plugin Manager implementation
 */
export class MonacoPluginManager implements PluginManager {
  private plugins = new Map<string, MonacoPlugin>()
  private installedPlugins = new Map<string, MonacoPlugin>()
  private pluginContexts = new Map<string, PluginContext>()

  /**
   * Register a plugin
   */
  register(plugin: MonacoPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`)
      return
    }

    // Validate dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not registered`)
        }
      }
    }

    this.plugins.set(plugin.name, plugin)
    console.log(`Plugin "${plugin.name}" registered`)
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    // Check if other plugins depend on this one
    for (const [pluginName, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(name)) {
        throw new Error(`Cannot unregister "${name}" because "${pluginName}" depends on it`)
      }
    }

    this.plugins.delete(name)
    this.installedPlugins.delete(name)
    this.pluginContexts.delete(name)
    console.log(`Plugin "${name}" unregistered`)
  }

  /**
   * Get registered plugin
   */
  get(name: string): MonacoPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all registered plugins
   */
  getAll(): MonacoPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * Install plugins on editor
   */
  async install(context: PluginContext, pluginNames?: string[]): Promise<void> {
    const namesToInstall = pluginNames || Array.from(this.plugins.keys())
    
    // Resolve dependencies and sort by dependency order
    const sortedNames = this.resolveDependencies(namesToInstall)
    
    for (const name of sortedNames) {
      const plugin = this.plugins.get(name)
      if (!plugin) {
        console.warn(`Plugin "${name}" not found`)
        continue
      }

      try {
        // Create plugin context with options
        const pluginContext: PluginContext = {
          ...context,
          options: { ...plugin.defaultOptions, ...context.options }
        }

        // Call beforeCreate hook
        if (plugin.lifecycle.beforeCreate) {
          await plugin.lifecycle.beforeCreate(pluginContext)
        }

        // Call afterCreate hook
        if (plugin.lifecycle.afterCreate) {
          await plugin.lifecycle.afterCreate(pluginContext)
        }

        this.installedPlugins.set(name, plugin)
        this.pluginContexts.set(name, pluginContext)
        console.log(`Plugin "${name}" installed`)
      } catch (error) {
        console.error(`Failed to install plugin "${name}":`, error)
        throw error
      }
    }
  }

  /**
   * Uninstall plugins
   */
  async uninstall(): Promise<void> {
    // Uninstall in reverse order
    const names = Array.from(this.installedPlugins.keys()).reverse()
    
    for (const name of names) {
      const plugin = this.installedPlugins.get(name)
      if (plugin) {
        try {
          if (plugin.lifecycle.destroy) {
            await plugin.lifecycle.destroy()
          }
          this.installedPlugins.delete(name)
          this.pluginContexts.delete(name)
          console.log(`Plugin "${name}" uninstalled`)
        } catch (error) {
          console.error(`Failed to uninstall plugin "${name}":`, error)
        }
      }
    }
  }

  /**
   * Resolve dependencies and return plugins in correct installation order
   */
  private resolveDependencies(names: string[]): string[] {
    const resolved: string[] = []
    const visiting = new Set<string>()
    const visited = new Set<string>()

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`)
      }
      if (visited.has(name)) {
        return
      }

      visiting.add(name)

      const plugin = this.plugins.get(name)
      if (plugin?.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Dependency "${dep}" for plugin "${name}" is not registered`)
          }
          visit(dep)
        }
      }

      visiting.delete(name)
      visited.add(name)
      resolved.push(name)
    }

    for (const name of names) {
      if (this.plugins.has(name)) {
        visit(name)
      } else {
        console.warn(`Plugin "${name}" not found`)
      }
    }

    return resolved
  }

  /**
   * Get installed plugin names
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.installedPlugins.keys())
  }

  /**
   * Check if plugin is installed
   */
  isInstalled(name: string): boolean {
    return this.installedPlugins.has(name)
  }
}

// Global plugin manager instance
export const pluginManager = new MonacoPluginManager()