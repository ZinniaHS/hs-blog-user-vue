<!-- blogedit.vue -->
<template>
  <el-card class="blog-editor">
    <template #header>
      <div class="header-tools">
        <el-button @click="router.back()">返回</el-button>
        <el-button @click="togglePreview">
          {{ isPreviewMode ? '关闭预览' : '预览效果' }}
        </el-button>
        <el-button
            type="primary"
            @click="postBlog('draft')"
            :disabled="!formValid"
        >
          保存修改
        </el-button>
        <el-button
            type="primary"
            @click="postBlog('publish')"
            :disabled="!formValid"
        >
          发布博客
        </el-button>
        <el-button
            type="danger"
            @click="deleteBlog"
        >
          <span v-if="BlogDTO.id">删除</span>
          <span v-else>弃用草稿</span>
        </el-button>
        <el-button
            type="info"
            @click="resetForm"
        >
          <span>重置表单</span>
        </el-button>
      </div>
      <div>
        <el-form
            :model="BlogDTO"
            :rules="rules"
            ref="formRef"
            label-width="120px"
        >
          <el-form-item label="主标题" prop="title">
            <el-input v-model="BlogDTO.title" />
            <div v-if="errors.title" class="error-text">{{ errors.title }}</div>
          </el-form-item>

          <el-form-item label="副标题" prop="subTitle">
            <el-input v-model="BlogDTO.subTitle" />
          </el-form-item>

          <p>指定专栏</p>
          <el-form-item label="投稿分类" prop="categoryId">
            <el-select
                v-model="BlogDTO.categoryId"
                placeholder="请选择想要发布到的专栏"
                style="width: 200px"
                @change="handleCategoryChange"
                :key="categoryKey"
            >
              <el-option
                  v-for="item in category"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
              />
            </el-select>
            <div v-if="errors.categoryId" class="error-text">{{ errors.categoryId }}</div>
          </el-form-item>
        </el-form>
      </div>
    </template>

    <div class="editor-preview-layout" :class="{ 'preview-mode': isPreviewMode }">
      <!-- 编辑区域始终存在 -->
      <div class="editor-area" :class="{ 'full-width': !isPreviewMode }">
        <RichEditor v-model="BlogDTO.content" />
      </div>

      <!-- 预览区域仅在预览模式下显示 -->
      <div v-if="isPreviewMode" class="preview-area">
        <div class="preview-box" v-html="BlogDTO.content"></div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import RichEditor from '@/components/RichEditor.vue'
import router from "@/router/index.js";
import {useRoute} from "vue-router";
import request from "@/utils/request.js";
import Blog from "@/view/Blog.vue";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";

// 从路由中获得博客id
const BlogId = useRoute().query.id

const categoryKey = ref(0);
// 表单引用
const formRef = ref(null)
// 错误信息
const errors = reactive({
  title: '',
  categoryId: ''
})
// 校验规则
const rules = reactive({
  title: [
    { required: true, message: '请输入主标题', trigger: 'blur' },
    { min: 5, message: '标题不能少于5个字符', trigger: ['blur', 'input'] }
  ],
  categoryId: [
    { required: true, message: '请选择投稿分类', trigger: 'change' }
  ]
})
// 计算属性判断表单是否有效
const formValid = computed(() => {
  return !Object.values(errors).some(error => error)
})
// 验证表单数据是否完整
// type区分是草稿还是发布
// 修改或保存
const postBlog = (type) => {
  formRef.value.validate().then(valid => {
    if (valid) {
      // 判断是发布还是保存草稿
      let status = 1;
      if(type === 'draft')
        status = 0
      console.log(BlogDTO.value)
      // console.log(BlogDTO.value.categoryId)
      request.put('/user/blog', {
        id: BlogDTO.value.id,
        title: BlogDTO.value.title,
        subTitle: BlogDTO.value.subTitle,
        content: BlogDTO.value.content,
        categoryId: BlogDTO.value.categoryId,
        status: status
      })
      .then(res => {
        if(res.code === 0)
          ElMessage.error(res.msg)
        else{
          if(type === 'draft'){
            // 点击的是草稿按钮
            ElMessage.success("已保存草稿")
            ElNotification.success({
              title: 'Success',
              message: '已保存草稿，可以在右上角个人中心页面中，找到我的草稿继续完善！',
              offset: 100,
            })
          }
          else
            // 点击的是发布按钮
            ElMessage.success("发布成功")
          router.back()
        }
      })
      .catch(err => {
        ElMessage.error(err)
      })
    }
  }).catch(err => {
    ElMessage.error("请完善博客信息！")
  })
}
// 当前选中的分类
const selectedCategory = ref({})
// 博客实体数据
const BlogDTO = ref({
  id: null,
  title: '',
  subTitle: '',
  content: '<h2>请在此处输入...</h2>',
  categoryId: null,
  status: 0
});
// 博客分类
const category = ref({})
// 获取博客分类
const getBlogCategory = () =>{
  request.get('/user/blogCategory/all')
      .then(res => {
        category.value = res.data
        categoryKey.value += 1;
      })
}
// 博客正文
// const content = ref('<h2>请在此处输入...</h2>')
// 是否为预览模式
const isPreviewMode = ref(false)
// 打开实时预览
const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value
}
// 初始化
onMounted(async ()=>{
  console.log(BlogId)
  // 获取博客分类
  getBlogCategory()
  // 如果是重新编辑博客或草稿，则回显博客信息
  if(BlogId)
    await showBlogDetail(BlogId)
})
// 回显博客信息
const showBlogDetail = async (id) => {
  try {
    await request.get('/user/blog/'+id,{
    }).then((res) => {
      BlogDTO.value = res.data
      console.log(res.data)
    })
  }catch(err) {
    console.log(err)
  }
}
// 删除草稿/博客
const deleteBlog = () =>{
  console.log(BlogId)
  if(BlogId===undefined){
    resetForm()
    router.back()
    ElMessage.info("已放弃草稿")
  }
  else{
    ElMessageBox.confirm(
        '确定要删除吗？',
        'Warning',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
      request.delete('/user/blog/'+BlogId,{
      }).then(res => {
        ElMessage.success("已删除")
        router.back()
      })
    })
  }
}
// 重置页面
const resetForm = () => {
  BlogDTO.value.title = ''
  BlogDTO.value.subTitle = ''
  BlogDTO.value.content = '<h2>请在此处输入...</h2>'
  BlogDTO.value.categoryId = null
  BlogDTO.value.status = 0
}
</script>

<style scoped>

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}
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