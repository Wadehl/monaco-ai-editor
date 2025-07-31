// Plugin example code for demonstrations
export const pluginExampleCode = `<template>
  <MonacoAIEditor 
    v-model="code"
    height="400px"
    :plugins="['shiki']"
    :plugin-options="{
      shiki: {
        themes: ['dark-plus', 'one-dark-pro', 'github-dark'],
        langs: ['javascript', 'typescript', 'vue', 'html', 'css'],
        defaultTheme: selectedTheme
      }
    }"
    @ready="onReady"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MonacoAIEditor, pluginManager } from 'monaco-ai-editor'
import { shikiPlugin } from './plugins/shiki-plugin'

// Register external Shiki plugin
pluginManager.register(shikiPlugin)

const code = ref('console.log("Hello World")')
const selectedTheme = ref('dark-plus')

const onReady = (editor) => {
  console.log('Editor ready with Shiki highlighting!')
}
</script>`;