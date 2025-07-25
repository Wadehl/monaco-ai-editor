import { reactive, computed } from 'vue'

// 模拟的数据源
export const pageData = reactive({
  title: 'Monaco Editor Demo',
  description: '这是一个智能代码编辑器',
  author: 'Claude',
  version: '1.0.0',
  config: {
    theme: 'dark',
    language: 'javascript',
    autoSave: true
  },
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]
})

export const compData = reactive({
  components: ['Button', 'Input', 'Modal', 'Table'],
  props: {
    visible: true,
    loading: false,
    disabled: false,
    size: 'medium'
  },
  methods: {
    onClick: 'function',
    onSubmit: 'function',
    onCancel: 'function'
  },
  slots: ['default', 'header', 'footer']
})

// 生成TypeScript类型定义的工具函数
export function useTypeDefinitions() {
  
  // 获取值的TypeScript类型字符串
  const getTypeString = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]'
      
      // 分析数组元素类型
      const firstElement = value[0]
      if (typeof firstElement === 'object' && firstElement !== null) {
        // 对象数组，生成内联接口
        const objType = generateInlineObjectType(firstElement)
        return `Array<${objType}>`
      } else {
        // 基础类型数组
        const elementType = typeof firstElement
        return `${elementType}[]`
      }
    }
    
    if (typeof value === 'object' && value !== null) {
      // 嵌套对象，生成内联类型
      return generateInlineObjectType(value)
    }
    
    return typeof value
  }
  
  // 生成内联对象类型
  const generateInlineObjectType = (obj: any): string => {
    let typeStr = '{\n'
    for (const [key, value] of Object.entries(obj)) {
      const type = getTypeString(value)
      typeStr += `    ${key}: ${type};\n`
    }
    typeStr += '  }'
    return typeStr
  }
  
  // 递归生成对象的TypeScript接口定义
  const generateInterface = (obj: any, interfaceName: string): string => {
    let interfaceStr = `interface ${interfaceName} {\n`
    
    for (const [key, value] of Object.entries(obj)) {
      const type = getTypeString(value)
      interfaceStr += `  ${key}: ${type};\n`
    }
    
    interfaceStr += '}'
    return interfaceStr
  }
  
  // 生成完整的类型定义
  const generateTypeDefinitions = (pageDataObj: any, compDataObj: any) => {
    const pageDataInterface = generateInterface(pageDataObj, 'PageData')
    const compDataInterface = generateInterface(compDataObj, 'CompData')
    
    return `
// 动态生成的页面数据类型定义
${pageDataInterface}

// 动态生成的组件数据类型定义  
${compDataInterface}

// 全局变量声明
declare const pageData: PageData;
declare const compData: CompData;
`
  }
  
  // 计算当前的类型定义
  const typeDefinitions = computed(() => {
    return generateTypeDefinitions(pageData, compData)
  })
  
  return {
    pageData,
    compData,
    typeDefinitions,
    generateTypeDefinitions
  }
}