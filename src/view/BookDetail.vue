<template>
  <div class="book-detail-container">
    <el-row :gutter="20">
      <!-- 封面区域保持不变 -->
      <el-col :span="6">
        <div class="cover-container">
          <el-image
              :src="book.coverUrl"
              fit="cover"
              class="book-cover"
              :preview-src-list="[book.coverUrl]"
          />
        </div>
      </el-col>

      <!-- 详情区域修改部分 -->
      <el-col :span="18">
        <el-descriptions :title="book.title" bordered column="1">
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
<!--          <el-descriptions-item label="字数">-->
<!--            {{ formatWordCount(book.wordCount) }}-->
<!--          </el-descriptions-item>-->

        </el-descriptions>
        <!--  按钮  -->
        <div class="action-buttons">
          <el-button type="primary" size="small" @click="handleDownload">下载</el-button>
          <el-button size="small" @click="handleAddToShelf">加入我的书架</el-button>
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

  </div>
</template>

<script setup>
import {reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import router from "@/router/index.js";
import {useRoute} from "vue-router";
const BookId = useRoute().query.id
// 图书详情
const book = ref({})
// 查询图书详情
const showDetail = (id) => {
  request.get('/user/book/'+id,{
  }).then((res) => {
    book.value = res.data
    console.log(book)
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

.cover-container {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.book-cover {
  height: 100%;
  width: 100%;
}

.author-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.el-descriptions {
  background-color: #fff;
}


</style>