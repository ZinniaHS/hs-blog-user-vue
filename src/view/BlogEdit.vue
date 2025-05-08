<!-- blogedit.vue 修复版 -->
<template>
  <el-card class="blog-editor">
    <template #header>
      <div class="header-tools">
        <el-button type="primary" @click="saveDraft">保存草稿</el-button>
        <el-button @click="previewVisible = true">预览效果</el-button>
      </div>
    </template>

    <div class="editor-preview-layout">
      <!-- 添加 key 强制重新渲染 -->
      <RichEditor v-model="content" key="editor" />
      <div class="preview-box" v-html="content"></div>
    </div>

    <el-dialog :visible.sync="previewVisible" title="博客预览" width="80%">
      <div class="dialog-preview" v-html="content"></div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import RichEditor from '@/components/RichEditor.vue'

const content = ref('<h2>新博客标题</h2><p>开始编写内容...</p>')
const previewVisible = ref(false)

const saveDraft = () => {
  console.log('保存内容:', content.value)
}
</script>

<style scoped>
.blog-editor {
  max-width: 1200px;
  margin: 20px auto;
}

.editor-preview-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.preview-box {
  border: 1px solid #eee;
  padding: 20px;
  min-height: 500px;
  background: #fff;
  border-radius: 4px;
  overflow-y: auto;
}

.dialog-preview {
  padding: 20px;
  min-height: 600px;
  background: #fff;
  overflow-y: auto;
}
</style>