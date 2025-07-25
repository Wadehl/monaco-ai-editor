<template>
  <div ref="container" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import monaco from '../monaco-worker'
import { registerCompletion } from 'monacopilot'

const container = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (container.value) {
    editor = monaco.editor.create(container.value, {
      language: 'javascript',
      theme: 'vs-dark',
      value: `// Welcome to Monaco Editor with Monacopilot!
// Try typing some JavaScript code here and see the AI completion in action

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on'
    })

    registerCompletion(monaco, editor, {
      language: 'javascript',
      endpoint: 'http://localhost:3001/completion',
    })
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 600px;
  border: 2px solid #444;
  border-radius: 8px;
  overflow: hidden;
}
</style>