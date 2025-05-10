<!-- blogedit.vue -->
<template>
  <el-card class="blog-editor">
    <template #header>
      <div class="header-tools">
        <el-button @click="router.back()">返回</el-button>
        <el-button @click="togglePreview">
          {{ isPreviewMode ? '关闭预览' : '预览效果' }}
        </el-button>
        <el-button type="primary" @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="postNewBlog">发布博客</el-button>
      </div>
      <div>
        <el-form>
          <el-form-item label="主标题" prop="title" >
            <el-input v-model="BlogDTO.title" />
          </el-form-item>
          <el-form-item label="副标题" prop="sub-title">
            <el-input v-model="BlogDTO.subTitle" />
          </el-form-item>
          <p>指定投稿区</p>
          <el-select
              v-model="selectedCategory"
              placeholder="请选择想要发布到的区"
              style="width: 200px"
          >
            <el-option
                v-for="item in category"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form>
      </div>
<!--      <div class="title">-->
<!--        <span class="title-text">主标题</span>-->
<!--        <el-input v-model="BlogDTO.title" placeholder="Please input" />-->
<!--      </div>-->
<!--      <div class="sub-title">-->
<!--        <span class="title-text">副标题</span>-->
<!--        <el-input v-model="BlogDTO.subTitle" placeholder="Please input" />-->
<!--      </div>-->
    </template>

    <div class="editor-preview-layout" :class="{ 'preview-mode': isPreviewMode }">
      <!-- 编辑区域始终存在 -->
      <div class="editor-area" :class="{ 'full-width': !isPreviewMode }">
        <RichEditor v-model="content" />
      </div>

      <!-- 预览区域仅在预览模式下显示 -->
      <div v-if="isPreviewMode" class="preview-area">
        <div class="preview-box" v-html="content"></div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RichEditor from '@/components/RichEditor.vue'
import router from "@/router/index.js";
import request from "@/utils/request.js";
// 当前选中的分类
const selectedCategory = ref({})
// 博客实体数据
const BlogDTO = ref({})
// 博客分类
const category = ref({})
// 博客正文
const content = ref('<h2>新博客标题</h2><p>开始编写内容...</p>')
const isPreviewMode = ref(false)
// 点击保存草稿
const saveDraft = () => {
  BlogDTO.status = 0
  BlogDTO.value.content = content.value
  console.log('保存内容:', BlogDTO.value)
  console.log(selectedCategory.value)
}
// 点击发布新博客
const postNewBlog = () => {
  console.log('保存内容:', content.value)
}
// 打开实时预览
const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value
}

onMounted(()=>{
  request.get('/user/blogCategory/all')
  .then(res => {
    category.value = res.data
    console.log(category.value)
  })
})
</script>

<style scoped>

.header-tools{
  margin-bottom: 20px;
}

.title{
  margin-bottom: 10px;
}

.title-text{

}

.blog-editor {
  max-width: 1200px;
  margin: 20px auto;
}

.editor-preview-layout {
  display: flex;
  gap: 20px;

}

.editor-area {
  flex: 1;
  transition: width 0.3s ease;
  max-height: 500px; /* 新增高度限制 */
}

.preview-area {
  flex: 1;
  max-height: 500px; /* 新增高度限制 */
  overflow-y: auto;
}

.full-width {
  width: 100%;
}

.preview-mode .editor-area,
.preview-mode .preview-area {
  width: 50%;
  flex-basis: 50%;
}

.preview-box {
  border: 1px solid #eee;
  padding: 20px;
  min-height: 500px;
  max-height: 500px; /* 新增最大高度 */
  overflow-y: auto;  /* 确保滚动条生效 */
  background: #fff;
  border-radius: 4px;
}
</style>