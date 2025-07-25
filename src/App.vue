<script setup lang="ts">
import MonacoEditor from './components/MonacoEditor.vue'
</script>

<template>
  <div class="app">
    <h1>Monaco + AI补全 Demo</h1>
    <MonacoEditor />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}
</style>
