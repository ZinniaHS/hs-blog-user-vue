<template>
  <div class="book-list">
    <el-row :gutter="10">
      <el-col
          v-for="(book, index) in books"
          :key="index"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="12"
      >
        <el-card class="book-card">
          <div class="book-content">
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">作者：{{ book.author }}</p>
              <p class="book-desc">{{ book.description }}</p>
              <div class="book-meta">
                <el-tag type="primary" size="small">热度：{{ book.heat }}</el-tag>
              </div>
            </div>

            <div class="book-cover">
              <img :src="book.cover" alt="书籍封面" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const books = ref([
  {
    id: 1,
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    description: '经典JS编程指南，涵盖ES6及现代Web开发',
    heat: 98,
    cover: 'https://picsum.photos/150/200?random=1'
  },
  {
    id: 2,
    title: 'Vue.js设计与实现',
    author: '霍春阳',
    description: '深入解析Vue3核心原理与实现',
    heat: 87,
    cover: 'https://picsum.photos/150/200?random=2'
  },
  // 可继续添加更多书籍...
]);
</script>

<style scoped>
.book-list {
  padding: 10px; /* 缩小50% */
}

.book-card {
  height: 100%;
  display: flex;
  flex-direction: row;
}

.book-content {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.book-cover {
  flex: 0 0 100px; /* 原200px调整为100px */
  padding: 5px; /* 缩小50% */
}

.book-cover img {
  width: 100%;
  height: auto;
  max-height: 150px; /* 原300px调整为150px */
  object-fit: cover;
  border-radius: 2px; /* 缩小50% */
}

.book-info {
  flex: 1;
  padding: 0 7px; /* 缩小50% */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  margin: 0 0 8px; /* 缩小50% */
  font-size: 9px; /* 原18px调整为9px */
  color: #333;
}

.book-author {
  color: #666;
  margin: 3px 0; /* 缩小50% */
  font-size: 12px; /* 原14px调整为12px */
}

.book-desc {
  flex: 1;
  color: #444;
  margin: 8px 0; /* 缩小50% */
  font-size: 12px; /* 新增字体大小 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 从3行调整为2行 */
  -webkit-box-orient: vertical;
}

.book-meta {
  margin-top: 10px; /* 缩小50% */
}

@media (max-width: 768px) {
  .book-card {
    flex-direction: column;
  }

  .book-cover {
    flex: 0 0 auto;
    margin-bottom: 8px; /* 缩小50% */
  }
}
</style>