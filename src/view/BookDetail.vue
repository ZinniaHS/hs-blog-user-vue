<template>
  <div class="book-detail-container">
    <!-- 骨架屏 -->
    <div v-if="loading">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="skeleton-cover-container">
            <el-skeleton-item variant="image" class="skeleton-cover" />
          </div>
        </el-col>
        <el-col :span="18">
          <div class="skeleton-detail-container">
            <el-skeleton-item variant="text" class="skeleton-title" style="width: 60%" />
            <div class="skeleton-descriptions">
              <div v-for="i in 5" :key="i" class="skeleton-item">
                <el-skeleton-item variant="text" style="width: 20%" />
                <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px" />
              </div>
            </div>
            <div class="skeleton-buttons">
              <el-skeleton-item variant="button" class="skeleton-button" />
              <el-skeleton-item variant="button" class="skeleton-button" />
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="skeleton-summary">
        <el-skeleton-item variant="text" class="skeleton-summary-title" />
        <el-skeleton-item variant="text" style="margin-top: 8px; width: 100%" />
        <el-skeleton-item variant="text" style="margin-top: 8px; width: 95%" />
        <el-skeleton-item variant="text" style="margin-top: 8px; width: 90%" />
        <el-skeleton-item variant="text" style="margin-top: 8px; width: 85%" />
        <el-skeleton-item variant="text" style="margin-top: 8px; width: 80%" />
      </div>
    </div>

    <!-- 图书详情 -->
    <template v-else>
      <el-row :gutter="20">
        <!-- 封面区域修改 -->
        <el-col :span="6">
          <div class="cover-wrapper">
            <div class="cover-container">
              <el-image
                  :src="book.coverUrl"
                  fit="fill"
                  class="book-cover"
                  :preview-src-list="[book.coverUrl]"
              />
            </div>
          </div>
        </el-col>

        <!-- 详情区域 -->
        <el-col :span="18">
          <el-descriptions
              :title="book.title"
              bordered
              column="1"
              :column-gap="50"
              class="custom-descriptions"
          >
            <el-descriptions-item label="作者">
              {{ book.author }}
            </el-descriptions-item>
            <el-descriptions-item label="出版社">
              {{ book.publisher }}
            </el-descriptions-item>
            <el-descriptions-item label="出版时间">
              {{ book.publishDate }}
            </el-descriptions-item>
            <el-descriptions-item label="ISBN">
              {{ book.isbn }}
            </el-descriptions-item>
            <el-descriptions-item label="热度">
              {{ book.downloadCount }}
            </el-descriptions-item>
          </el-descriptions>
          <!--  按钮  -->
          <div class="action-buttons">
            <a :href="book.filePath" :download="book.title">
              <el-button type="primary" size="small">下载</el-button>
            </a>
            <el-button
                size="small"
                @click="addToBookshelf"
            >
              加入我的书架
            </el-button>
          </div>
        </el-col>
      </el-row>

      <!--  下侧图书介绍  -->
      <div class="content-section">
        <div class="book-summary">
          <h3 class="section-title">作品简介</h3>
          <div class="summary-content">
            {{ book.description }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import { ElMessage } from 'element-plus'

// 加载状态
const loading = ref(true)
// 判断当前登录状态，需要登录才能加入书架
const isLoggedIn = computed(() => !!localStorage.getItem('token'))
// 加入书架逻辑
const addToBookshelf = () => {
  if (!isLoggedIn.value) {
    ElMessage({
      message: '请先登录！',
    })
    router.push({
      path: '../login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
  } else {
    // 已登录状态下的业务逻辑
    console.log('加入书架操作')
  }
}
const BookId = useRoute().query.id
// 图书详情
const book = ref({})
// 查询图书详情
const showDetail = (id) => {
  loading.value = true
  request.get('/user/book/'+id,{
  }).then((res) => {
    book.value = res.data
    console.log(book)
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}
// 进入页面查询图书详情
onMounted(() => {
  showDetail(BookId)
})
const formatWordCount = (count) => {
  return `${(count / 10000).toFixed(1)}万字`
}
</script>

<style scoped>

/* 深度选择器修改 - 确保能正确影响Element Plus组件 */
.custom-descriptions :deep(.el-descriptions__label) {
  font-size: 18px !important; /* 使用!important提高优先级 */
  font-weight: bold;
}

.custom-descriptions :deep(.el-descriptions__content) {
  font-size: 18px !important;
  color: #333;
}

/* 修改作品简介的字体大小 */
.summary-content {
  line-height: 1.8;
  color: #555;
  font-size: 18px !important; /* 调整作品简介字体大小 */
}

/* 标题字体大小 */
.custom-descriptions :deep(.el-descriptions__title) {
  font-size: 24px !important;
  font-weight: bold;
  margin-bottom: 20px !important; /* 增加标题与内容的间距 */
}

.cover-wrapper {
  width: 100%;
}

/* 使用长宽比 1.5:1 的容器 */
.cover-container {
  width: 100%;
  position: relative;
  padding-top: 150%; /* 长宽比为1.5:1，即高度是宽度的1.5倍 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.book-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill; /* 填充整个容器 */
}

.skeleton-cover-container {
  width: 100%;
  position: relative;
  padding-top: 150%; /* 保持与封面相同的长宽比 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.skeleton-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.skeleton-detail-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.skeleton-title {
  height: 32px;
  margin-bottom: 20px;
}

.skeleton-descriptions {
  margin-top: 15px;
}

.skeleton-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.skeleton-button {
  width: 120px;
  height: 40px;
}

.skeleton-summary {
  margin-top: 40px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.skeleton-summary-title {
  height: 28px;
  margin-bottom: 20px;
}

/* 原有样式 */
.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.action-buttons .el-button {
  width: 120px;
}

.book-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.author-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.el-descriptions {
  background-color: #fff;
}

.content-section {
  margin-top: 30px;
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 20px; /* 添加作品简介标题字体大小 */
}
</style>