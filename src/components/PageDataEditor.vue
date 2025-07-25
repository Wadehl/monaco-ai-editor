<template>
  <a-modal
    v-model:open="visible"
    title="PageData 编辑器"
    width="600px"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="page-data-editor">
      <!-- 添加新属性 -->
      <div class="add-property-section">
        <h4>添加新属性</h4>
        <a-row :gutter="8">
          <a-col :span="10">
            <a-input
              v-model:value="newPropertyKey"
              placeholder="属性名 (例如: newField)"
              @pressEnter="addNewProperty"
            />
          </a-col>
          <a-col :span="6">
            <a-select v-model:value="newPropertyType" style="width: 100%">
              <a-select-option value="string">字符串</a-select-option>
              <a-select-option value="number">数字</a-select-option>
              <a-select-option value="boolean">布尔值</a-select-option>
              <a-select-option value="array">数组</a-select-option>
              <a-select-option value="object">对象</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-button 
              type="primary" 
              :disabled="!newPropertyKey.trim()"
              @click="addNewProperty"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              添加
            </a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 现有属性列表 -->
      <div class="properties-list">
        <h4>现有属性</h4>
        <a-list :data-source="propertiesList" item-layout="vertical">
          <template #renderItem="{ item }">
            <a-list-item>
              <template #actions>
                <a-button 
                  v-if="!isSystemProperty(item.key)"
                  type="text" 
                  danger 
                  size="small"
                  @click="deleteProperty(item.key)"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </template>
              <a-list-item-meta>
                <template #title>
                  <a-space>
                    <span class="property-key">{{ item.key }}</span>
                    <a-tag :color="getTypeColor(item.type)">{{ item.type }}</a-tag>
                  </a-space>
                </template>
              </a-list-item-meta>
              <div class="property-editor">
                <PropertyEditor 
                  :value="item.value" 
                  :type="item.type"
                  @update="(newValue) => updateProperty(item.key, newValue)"
                />
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Modal, Button, Input, Select, List, Tag, Row, Col, Space } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import PropertyEditor from './PropertyEditor.vue'

// 注册 Ant Design 组件
const AModal = Modal
const AButton = Button
const AInput = Input
const ASelect = Select
const ASelectOption = Select.Option
const AList = List
const AListItem = List.Item
const AListItemMeta = List.Item.Meta
const ATag = Tag
const ARow = Row
const ACol = Col
const ASpace = Space

interface Props {
  open: boolean
  pageData: Record<string, any>
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'update-property', key: string, value: any): void
  (e: 'add-property', key: string, value: any): void
  (e: 'delete-property', key: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// 新属性状态
const newPropertyKey = ref('')
const newPropertyType = ref('string')

// 计算属性列表
const propertiesList = computed(() => {
  return Object.entries(props.pageData).map(([key, value]) => ({
    key,
    value,
    type: getValueType(value)
  }))
})

// 获取值的类型
const getValueType = (value: any): string => {
  if (Array.isArray(value)) return 'array'
  if (value === null) return 'null'
  return typeof value
}

// 获取类型对应的颜色
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'string': 'blue',
    'number': 'green',
    'boolean': 'purple',
    'array': 'orange',
    'object': 'red',
    'null': 'gray'
  }
  return colorMap[type] || 'default'
}

// 是否为系统属性（不允许删除）
const isSystemProperty = (key: string): boolean => {
  return ['title', 'description', 'author', 'version'].includes(key)
}

// 添加新属性
const addNewProperty = () => {
  const key = newPropertyKey.value.trim()
  if (!key) return
  
  let defaultValue: any
  switch (newPropertyType.value) {
    case 'string':
      defaultValue = ''
      break
    case 'number':
      defaultValue = 0
      break
    case 'boolean':
      defaultValue = false
      break
    case 'array':
      defaultValue = []
      break
    case 'object':
      defaultValue = {}
      break
    default:
      defaultValue = ''
  }
  
  emit('add-property', key, defaultValue)
  newPropertyKey.value = ''
  console.log(`✅ 添加属性: ${key} = ${JSON.stringify(defaultValue)}`)
}

// 更新属性值
const updateProperty = (key: string, newValue: any) => {
  emit('update-property', key, newValue)
  console.log(`🔄 更新属性: ${key} = ${JSON.stringify(newValue)}`)
}

// 删除属性
const deleteProperty = (key: string) => {
  if (isSystemProperty(key)) return
  emit('delete-property', key)
  console.log(`🗑️ 删除属性: ${key}`)
}

// 关闭模态框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.page-data-editor {
  max-height: 500px;
  overflow-y: auto;
}

.add-property-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.add-property-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.properties-list h4 {
  margin-bottom: 12px;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.property-key {
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.property-editor {
  margin-top: 8px;
}

:deep(.ant-list-item) {
  padding: 12px 0;
}

:deep(.ant-list-item-meta-title) {
  margin-bottom: 4px;
}
</style>