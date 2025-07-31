<script setup lang="ts">
import { ref } from 'vue'

const externalCode = defineModel<string>({ default: '' })

const setDefaultCode = () => {
  externalCode.value = `// v-model 测试代码
function testVModel() {
  console.log("v-model 双向绑定正常工作！");
  return "success";
}

testVModel();`
}

const clearCode = () => {
  externalCode.value = ''
}
</script>

<template>
  <div class="hello-world">
    <h2>v-model 测试</h2>
    <div class="test-controls">
      <label>外部控制编辑器内容：</label>
      <textarea 
        v-model="externalCode" 
        placeholder="在这里输入代码，编辑器会同步更新"
        rows="3"
        style="width: 100%; margin: 10px 0;"
      />
      <button @click="setDefaultCode" class="test-btn">设置默认代码</button>
      <button @click="clearCode" class="test-btn">清空代码</button>
    </div>
    
    <div class="test-info">
      <p><strong>编辑器内容长度：</strong> {{ externalCode.length }} 字符</p>
      <p><strong>实时同步：</strong> 在编辑器中输入内容，上方文本框会自动更新</p>
    </div>
  </div>
</template>

<style scoped>
.hello-world {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.test-controls {
  margin: 15px 0;
}

.test-controls label {
  font-weight: 600;
  color: #333;
}

.test-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px 5px 5px 0;
  font-size: 14px;
}

.test-btn:hover {
  background: #0056b3;
}

.test-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

.test-info p {
  margin: 5px 0;
  color: #666;
}
</style>
