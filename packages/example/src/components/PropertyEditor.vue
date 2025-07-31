<template>
  <div class="property-value-editor">
    <input 
      v-if="type === 'string'" 
      :value="value" 
      @input="handleUpdate($event.target.value)"
      type="text"
      class="value-input"
    />
    <input 
      v-else-if="type === 'number'" 
      :value="value" 
      @input="handleUpdate(Number($event.target.value))"
      type="number"
      class="value-input"
    />
    <select 
      v-else-if="type === 'boolean'" 
      :value="value" 
      @change="handleUpdate($event.target.value === 'true')"
      class="value-input"
    >
      <option :value="true">true</option>
      <option :value="false">false</option>
    </select>
    <textarea 
      v-else-if="type === 'array' || type === 'object'" 
      :value="JSON.stringify(value, null, 2)" 
      @input="handleComplexValue($event.target.value)"
      class="value-textarea"
      rows="3"
    />
    <input 
      v-else 
      :value="String(value)" 
      @input="handleUpdate($event.target.value)"
      type="text"
      class="value-input"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: any
  type: string
}

interface Emits {
  (e: 'update', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleUpdate = (newValue: any) => {
  emit('update', newValue)
}

const handleComplexValue = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString)
    emit('update', parsed)
  } catch (e) {
    // 如果JSON无效，不更新
    console.warn('Invalid JSON:', e)
  }
}
</script>

<style scoped>
.property-value-editor {
  width: 100%;
}

.value-input, .value-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  font-family: 'Monaco', 'Menlo', monospace;
}

.value-input:focus, .value-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.value-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>