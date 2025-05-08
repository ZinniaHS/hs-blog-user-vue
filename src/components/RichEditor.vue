<!-- RichEditor.vue -->
<template>
  <div class="editor-container">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
    <Editor
        style="height: 500px; overflow-y: auto;"
        v-model="editorContent"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'

import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '<p>hello</p>'
  }
})
const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef(null)
const editorContent = ref(props.modelValue)
const mode = 'default'

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }

const handleCreated = (editor) => {
  editorRef.value = editor
  if (editor && props.modelValue) {
    editor.txt.html(props.modelValue)
  }
}

const handleChange = (html) => {
  editorContent.value = html
  emit('update:modelValue', html)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal !== editorContent.value && editorRef.value) {
    editorRef.value.txt.html(newVal)
  }
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})
</script>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>