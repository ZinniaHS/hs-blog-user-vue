<template>
  <div class="container">

    <div class="shelf-title">
      <h1>我的书架</h1>
    </div>

    <!--  搜索栏  -->
    <div class="search-container">
      <el-input
          v-model="searchKeyword"
          placeholder="请输入搜索内容"
          clearable
          @clear="load"
          @change="searchChange"
          @keyup.enter="pageQuery">
        <template #append>
          <el-button :icon="Search" @click="pageQuery" />
        </template>
      </el-input>
    </div>

    <!-- 骨架屏 -->
    <div class="skeleton-container" v-if="loading">
      <el-row :gutter="[16, 16]">
        <el-col
            v-for="index in skeletonCount"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
        >
          <div class="skeleton-card">
            <div class="skeleton-content">
              <div class="skeleton-cover">
                <el-skeleton-item variant="image" class="skeleton-image" />
              </div>
              <div class="skeleton-info">
                <el-skeleton-item variant="text" class="skeleton-title" />
                <el-skeleton-item variant="text" class="skeleton-author" />
                <div class="skeleton-desc">
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                </div>
                <el-skeleton-item variant="button" class="skeleton-tag" />
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="no-data-tip" v-else-if="books.total === 0 && searchKeyword!==''">
      没有搜索到符合条件的书籍
    </div>

    <div class="no-data-tip" v-else-if="books.total === 0">
      暂时没有收藏的图书
    </div>

    <!--  图书列表  -->
    <div class="book-list" v-else>
      <el-row :gutter="[16, 16]">
        <el-col
            v-for="(book, index) in books.record"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
        >
          <el-card class="book-card" @click="goToBookDetail(book)">
            <div class="book-content">
              <!--  封面   -->
              <div class="book-cover">
                <img :src="book.coverUrl" alt="书籍封面" />
              </div>
              <!--  图书信息   -->
              <div class="book-info">
                <h1 class="book-title">{{ book.title }}</h1>
                <p class="book-author">作者：{{ book.author }}</p>
                <p class="book-desc" >{{ book.description }}</p>
                <div class="book-meta">
                  <el-tag type="primary" size="small">热度：{{ book.downloadCount }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="!loading && books.total > 0">
      <el-pagination
          v-model:current-page="bookPageQueryDTO.pageNum"
          v-model:page-size="bookPageQueryDTO.pageSize"
          :page-sizes="[8, 12]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="books.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
    </div>

  </div>
</template>

<script setup>
import {reactive, ref, computed, onMounted, watch } from 'vue'
import request from '@/utils/request'
import {Search} from "@element-plus/icons-vue";
import router from "@/router/index.js";

// 加载状态
const loading = ref(true);
// 骨架屏显示数量
const skeletonCount = ref(8); // 改为8，保证在各种屏幕尺寸下都能显示足够多的骨架屏

// 点击图书后去图书详情页
const goToBookDetail = (book) =>{
  router.push({
    path: '../user/bookDetail',
    query: {
      id: book.id,
    }
  })
}

// 搜索框中输入的内容
const searchKeyword = ref('')
// 点击搜索框后搜索数据
const pageQuery = ()=>{
  bookPageQueryDTO.keyWord = searchKeyword.value
  load()
}

// 图书的总记录数与数据
const books = reactive({
  total: 0,
  record: [],
})

// 模拟数据
const mockBooks = () => {
  const categories = [
    { id: 1, name: '计算机科学' },
    { id: 2, name: '编程语言' },
    { id: 3, name: '软件工程' },
    { id: 4, name: '数据结构' },
    { id: 5, name: '算法' },
    { id: 6, name: '前端开发' },
    { id: 7, name: '后端开发' },
    { id: 8, name: '移动开发' }
  ]

  const subCategories = {
    1: [
      { id: 101, name: '计算机理论' },
      { id: 102, name: '人工智能' },
      { id: 103, name: '机器学习' },
      { id: 104, name: '深度学习' }
    ],
    6: [
      { id: 601, name: 'HTML/CSS' },
      { id: 602, name: 'JavaScript' },
      { id: 603, name: 'Vue.js' },
      { id: 604, name: 'React' },
      { id: 605, name: 'Angular' }
    ],
    7: [
      { id: 701, name: 'Java' },
      { id: 702, name: 'Python' },
      { id: 703, name: 'Go' },
      { id: 704, name: 'C#' }
    ]
  }

  // 生成30本模拟书籍
  const mockData = [];
  for (let i = 1; i <= 30; i++) {
    // 随机选择一个主分类
    const mainCategoryIndex = Math.floor(Math.random() * categories.length);
    const mainCategory = categories[mainCategoryIndex];

    // 40%概率有子分类
    let subCategoryId = 0;
    let subCategoryName = '全部';
    if (Math.random() < 0.4 && subCategories[mainCategory.id]) {
      const subCategoryIndex = Math.floor(Math.random() * subCategories[mainCategory.id].length);
      const subCategory = subCategories[mainCategory.id][subCategoryIndex];
      subCategoryId = subCategory.id;
      subCategoryName = subCategory.name;
    }

    // 生成随机描述
    const descriptions = [
      '这是一本详细介绍前端开发的入门到精通的书籍，适合初学者和有一定基础的读者。',
      '全面介绍了最新的JavaScript框架和工具，帮助开发者提高效率和代码质量。',
      '深入探讨了计算机科学的基本理论和核心概念，适合计算机专业学生和从业人员。',
      '通过实际案例讲解了人工智能的应用场景和实现方法，配有大量代码示例。',
      '详细阐述了软件工程的各个阶段和最佳实践，帮助开发者构建高质量的软件系统。',
      '本书涵盖了数据结构的基础知识和高级应用，配有大量的算法分析和优化技巧。',
      '从基础到高级，全面讲解了Python语言的特性和应用场景，适合零基础学习。',
      '深入分析了Vue.js框架的核心原理和最佳实践，帮助开发者构建高性能的前端应用。',
      '结合实际项目案例，详细介绍了Docker容器的构建、部署和管理方法。',
      '全面讲解了机器学习的算法和模型，以及在实际问题中的应用方法。'
    ];

    const randomDescIndex = Math.floor(Math.random() * descriptions.length);

    mockData.push({
      id: i,
      title: `${mainCategory.name}${subCategoryName ? '-' + subCategoryName : ''}系列图书-${i}`,
      author: `作者${Math.floor(Math.random() * 100)}`,
      description: descriptions[randomDescIndex],
      coverUrl: `https://picsum.photos/300/400?random=${i + 100}`,
      downloadCount: Math.floor(Math.random() * 10000)
    });
  }

  return mockData;
}

// 分页查询实体
const bookPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 12, // 默认每页显示12本，每行4本，一页3行
  keyWord: '',
})

// 分页查询
const load = () =>{

  console.log(searchKeyword.value)

  loading.value = true

  request.get('/user/getCollectBooks',{
    params: {
      pageNum: bookPageQueryDTO.pageNum,
      pageSize: bookPageQueryDTO.pageSize,
      keyWord: searchKeyword.value,
    }
  }).then((res) => {
    books.total = res.data.total
    books.record = res.data.records
    console.log(books)
    loading.value = false
  }).catch((err) => {
    console.log(err)
    loading.value = false
  })

  loading.value = false;
}

// 选择每页显示多少条记录时，触发分页查询
const handleSizeChange = () =>{
  load()
}

// 跳转其他页面的时候触发分页查询
const handleCurrentChange = () =>{
  load()
}

// 当搜索框清空时，自动分页查询全部
watch(searchKeyword, (newValue) => {
  if (newValue === '') {
    load() // 关键词为空时触发加载
  }
})

// 加载页面时调用分页查询并查询所有类型
onMounted(() => {
  // 再加载图书数据
  load()
})

</script>

<style scoped>

.shelf-title {
  text-align: center;
  margin: 20px 0 30px;
}

.shelf-title h1 {
  font-size: 28px;
  color: #303133;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.no-data-tip {
  text-align: center;
  color: #909399;
  font-size: 24px;
  padding: 40px 0;
  font-weight: 500;
  margin-top: 50px;
}

.search-container {
  max-width: 800px; /* 限制搜索栏最大宽度 */
  margin: 0 auto; /* 居中显示 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filter-affix {
  background-color: #f5f7fa;
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.type-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-btn {
  padding: 10px 24px;
  border-radius: 4px 4px 0 0;
  background: #fff;
  color: #333;
  font-size: 16px;
  transition: all 0.3s;
  border-bottom: 1px solid #eee;
}

.active-btn {
  background: #409eff !important;
  color: #fff !important;
  border-bottom: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.type-btn:active {
  transform: scale(0.98);
}

.type-btn:hover {
  background: #f5f7fa;
}

.menu-bar {
  display: flex;
  gap: 18px;
  margin-top: 8px;
  background: #f7f8fa;
  padding: 10px 0;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}

.menu-item {
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 3px;
  background: #f7f8fa;
  color: #333;
  font-size:12px;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #eef2fb;
}

.menu-item.active {
  background: #409eff;
  color: #fff;
  font-weight: bold;
  margin-bottom: 0;
  box-shadow: 0 -2px 4px 0 rgba(64,158,255,0.2);
}

.second-menu-bar {
  flex-wrap: nowrap;
  overflow-x: auto;
  display: flex;
  gap: 8px;
  background: #f7f8fa;
  padding: 10px 0 10px 10px;
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}

.second-menu-item {
  flex-wrap: nowrap;
  overflow-x: auto;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 3px;
  background: #fff;
  color: #333;
  font-size: 12px;
  transition: background 0.2s;
}

.second-menu-item:hover {
  background: #f7f8fa;
}

.second-menu-item.active {
  background: #409eff;
  color: #fff;
  font-weight: bold;
}

.selected-box {
  margin: 10px 0;
  color: #666;
  font-size: 15px;
}

.el-col {
  padding: 8px !important;
}

.book-list {
  padding: 10px;
  gap: 16px;
}

.book-card {
  min-height: 100%;
  display: flex;
  flex-direction: row;
  margin: 10px !important;
  transition: all 0.3s;
  height: 100%;
}

.book-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.book-cover {
  flex: 0 0 120px;
  padding: 5px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.book-cover img {
  width: 100%;
  height: auto;
  max-height: 180px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.book-info {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.book-author {
  color: #666;
  margin: 3px 0;
  font-size: 14px;
}

.book-desc {
  flex: 1;
  color: #444;
  margin: 8px 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.book-meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.book-meta .el-tag {
  margin-right: 8px;
}

@media (max-width: 1200px) {
  .book-card {
    margin: 8px !important;
  }
}

@media (max-width: 992px) {
  .book-cover {
    flex: 0 0 100px;
  }

  .book-cover img {
    max-height: 150px;
  }

  .book-info {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .el-col {
    padding: 4px !important;
  }
  .book-card {
    margin: 4px !important;
  }
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.custom-tooltip{
  width: auto !important;
  max-width: 100px;
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 10px;
}

.skeleton-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.skeleton-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.skeleton-cover {
  flex: 0 0 120px;
  padding: 5px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.skeleton-image {
  width: 100px;
  height: 150px;
  border-radius: 4px;
}

.skeleton-info {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.skeleton-title {
  height: 24px;
  margin-bottom: 8px;
  width: 80%;
  border-radius: 4px;
}

.skeleton-author {
  height: 16px;
  margin: 3px 0;
  width: 60%;
  border-radius: 4px;
}

.skeleton-desc {
  flex: 1;
  margin: 8px 0;
}

.skeleton-desc .el-skeleton__item {
  height: 16px;
  margin-bottom: 4px;
  border-radius: 4px;
}

.skeleton-tag {
  width: 100px;
  height: 28px;
  margin-top: 10px;
  border-radius: 4px;
}

/* 添加过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>