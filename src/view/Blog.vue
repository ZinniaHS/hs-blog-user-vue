<template>
  <div class="blog-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索博客..."
          style="width: 600px"
          clearable
          @keyup.enter="pageQuery">
        <template #append>
          <el-button :icon="Search" @click="pageQuery" />
        </template>
      </el-input>

    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧内容选择 -->
      <el-col :span="4" class="sidebar-col">
        <el-affix :offset="120" class="sidebar-affix">
          <div class="sidebar-nav">
            <nav class="nav-container">
              <div class="nav-section">
                <el-menu
                    vertical
                    class="user-menu"
                    v-model="selectedIndex"
                @select="handleMenuSelect"
                >
                <el-menu-item index="9" @click="handleWriteBlog">
                  <el-icon><Notebook /></el-icon>
                  <span>写博客</span>
                </el-menu-item>
                <el-menu-item index="10">
                  <!-- 动态图标 -->
                  <el-icon>
                    <component :is="selectedIndex === '10' ? BellFilled : Bell" />
                  </el-icon>
                  <span>我的关注</span>
                </el-menu-item>
                <el-menu-item index="11">
                  <!-- 动态图标 -->
                  <el-icon>
                    <component :is="selectedIndex === '11' ? StarFilled : Star" />
                  </el-icon>
                  <span>我的收藏</span>
                </el-menu-item>
                </el-menu>
              </div>
            </nav>
          </div>
        </el-affix>
      </el-col>

      <!-- 中间内容区 -->
      <el-col :span="16" class="content-col">
        <div class="content-area">
          <el-card
              v-for="blog in blogs.record"
              :key="blog.id"
              class="blog-card"
          >
            <!-- 标题 和 用户头像名称 -->
            <div class="blog-header">
              <h3 @click="toBlogDetail(blog)">{{ blog.title }}</h3>
              <div class="user-info" @click="toUserDetail(blog)">
                <img :src="blog.userAvatar" class="user-avatar">
                <span class="username">{{ blog.username }}</span>
              </div>
            </div>
            <!--  副标题和分类标签  -->
            <div class="blog-subtitle-container">
              <div class="blog-subtitle">{{ blog.subTitle }}</div>
              <el-tag type="primary" effect="dark">{{ blog.categoryName }}</el-tag>
            </div>
            <div class="blog-meta">
              <span><el-icon><View /></el-icon>  {{ blog.viewCount }}</span>
              <el-divider direction="vertical" />
              <span><el-icon><Pointer /></el-icon>  {{ blog.likeCount }}</span>
              <el-divider direction="vertical" />
              <span><el-icon><Star /></el-icon>  {{ blog.starCount }}</span>
              <span class="ml-auto">发布时间：{{ formatDate(blog.createTime) }}</span>
            </div>
          </el-card>
          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
                v-model:current-page="blogPageQueryDTO.pageNum"
                v-model:page-size="blogPageQueryDTO.pageSize"
                :page-sizes="[6, 10, 20]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="blogs.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"/>
          </div>
        </div>
      </el-col>

      <!-- 右侧排行榜 -->
      <el-col :span="4" class="ranking-col">
        <div class="ranking-panel">
          <h3>浏览排行榜</h3>
          <el-card
              v-for="blog in topBlogs"
              :key="blog.id"
              class="ranking-card"
          >
            <div class="ranking-number">{{ blog.rank }}</div>
            <h4>{{ blog.title }}</h4>
            <div class="views-count">{{ blog.views }} 次浏览</div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount, reactive, watch} from 'vue';
import {ArrowDown, Notebook, Bell, Star, Search, BellFilled, StarFilled} from '@element-plus/icons-vue';
import request from '@/utils/request'
import router from "@/router/index.js";
import {ElMessage} from "element-plus";

// 搜索框中输入的内容
const searchKeyword = ref('')
// 当前左侧选择区选中的项目
const selectedIndex = ref('')
const selectedType = ref('all');
const currentPage = ref(1);
const pageSize = ref(6);
// 当前展示的博客
const blogs = reactive({
  total: 0,
  record: [],
})
// 选中左侧功能区项目后触发
const handleMenuSelect = (index) => {
  selectedIndex.value = index
}
// 进入博客详情页
const toBlogDetail = (blog) =>{
  router.push({
    name: 'blogDetail',
    query: {
      id: blog.id,
    }
  })
}
// 进入用户详情页
const toUserDetail = (blog) =>{
  router.push({
    name: 'userProfile',
    query: {
      id: blog.userId,
    }})
}
// 分页查询
const load = () =>{
  console.log('keyword:   '+searchKeyword.value)
  request.get('/user/blog/page',{
    params: {
      pageNum: blogPageQueryDTO.pageNum,
      pageSize: blogPageQueryDTO.pageSize,
      keyWord: searchKeyword.value,
    }
  }).then((res) => {
    blogs.total = res.data.total
    blogs.record = res.data.records
    console.log(blogs)
  }).catch((err) => {
    console.log(err)
  })
}
// 点击搜索框后搜索数据
const pageQuery = ()=>{
  blogPageQueryDTO.keyWord = searchKeyword.value
  load()
}
// 选择每页显示多少条记录时，触发分页查询
const handleSizeChange = () =>{
  load()
}
// 跳转其他页面的时候触发分页查询
const handleCurrentChange = () =>{
  load()
}
// 博客分页查询实体
const blogPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 10,
  keyWord: '',
})
// 当搜索框清空时，自动分页查询全部
watch(searchKeyword, (newValue) => {
  if (newValue === '') {
    load() // 关键词为空时触发加载
  }
})
// 写博客功能需要登录
const handleWriteBlog = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // 未登录时显示提示并跳转到登录页
    ElMessage.info("请先登录！");

    // 获取干净的当前路径，避免重定向叠加
    const currentPath = router.currentRoute.value.path;

    router.push({
      path: '/login',
      query: {
        redirect: currentPath
      }
    });
  } else {
    // 已登录时正常跳转
    router.push({ name: 'blogEdit' });
  }
};
// 功能区特殊样式
const featureIconStyle = {
  purple: 'background-color: #8a5bf8; color: white; padding: 4px; border-radius: 50%;',
};
const showTypeList = ref(false);
const toggleTypeList = () => {
  showTypeList.value = !showTypeList.value;
};
// 点击外部关闭列表
const handleClickOutside = (event) => {
  if (!event.target.closest('.filter-panel')) {
    showTypeList.value = false;
  }
};
// 初始化
onMounted(() => {
  load()
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
// 模拟数据
const allBlogs = ref([
  {
    id: 1,
    title: 'Vue3入门指南',
    subtitle: 'Composition API与响应式系统的深度解析', // 新增副标题
    type: '技术',
    publishTime: '2024-03-15',
    views: 1520,
    comments: 45,
  },
  { id: 2, title: 'Element Plus实战', type: '技术', publishTime: '2024-03-14', views: 980, comments: 32 },
  { id: 3, title: '前端性能优化', type: '技术', publishTime: '2024-03-12', views: 2100, comments: 67 },
  { id: 4, title: '旅行游记', type: '生活', publishTime: '2024-03-10', views: 890, comments: 23 },
  { id: 5, title: '读书笔记', type: '生活', publishTime: '2024-03-08', views: 1200, comments: 56 },
  { id: 6, title: 'CSS技巧分享', type: '技术', publishTime: '2024-03-05', views: 1750, comments: 88 },
]);
// 获取所有类型
const types = computed(() => {
  // 获取所有唯一类型
  const uniqueTypes = [...new Set(allBlogs.value.map((blog) => blog.type))];
  return [
    { value: 'all', label: '全部类型' },
    ...uniqueTypes.map((type) => ({
      value: type,
      label: type,
    })),
  ];
});
// 过滤博客
const filteredBlogs = computed(() => {
  let result = allBlogs.value;
  if (selectedType.value !== 'all') {
    result = result.filter((blog) => blog.type === selectedType.value);
  }
  if (searchKeyword.value) {
    result = result.filter((blog) =>
        blog.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }
  return result;
});
// 显示博客（分页处理）
const displayedBlogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBlogs.value.slice(start, end);
});
// 排行榜数据
const topBlogs = computed(() => {
  return [...filteredBlogs.value]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((blog, index) => ({ ...blog, rank: index + 1 }));
});
// 方法
const selectType = (type) => {
  selectedType.value = type;
};
const handlePageChange = (page) => {
  currentPage.value = page;
};
const handleDropdownVisibleChange = (visible) => {
  if (!visible) selectedType.value = 'all';
};
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
/* 头像悬停效果 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s ease;
}
.user-info:hover .user-avatar {
  transform: scale(1.1) rotate(-2deg);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
/* 用户名悬停效果 */
.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  font-size: 0.9em;
  color: #606266;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.user-info:hover .username {
  color: #409eff;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}
/* 联动效果增强 */
.user-info:hover {
  color: #409eff;
}

.blog-card h3 {
  transition: all 0.3s ease;
  cursor: pointer;
}
.blog-card h3:hover {
  color: #409eff; /* Element Plus 的主题色 */
  transform: scale(1.05);
}
.ml-auto {
  margin-left: auto;
}
.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  font-size: 0.9em;
  color: #606266;
}

.blog-subtitle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.blog-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 80px); /* 为标签预留空间 */
}

/* 整体容器 */
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 搜索栏样式 */
.search-bar {
  margin-bottom: 20px;
  text-align: center;
}

/* 主内容区布局与间隔 */
.main-content {
  display: flex;
  gap: 36px; /* 增大间隔 */
  margin: 0;
}

.sidebar-col,
.ranking-col {
  flex: 0 0 auto;
}

/* 列宽度 */
.sidebar-col {
  width: 240px !important;
  flex: 0 0 240px;
}

.content-col {
  flex: 1;
  min-width: 0;
}

.ranking-col {
  width: 300px !important;
  flex: 0 0 300px;
}

/* 侧边栏样式 */
.sidebar-affix {
  width: 100%;
}

.sidebar-nav {
  width: 100%;
  background: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.nav-container {
  padding: 20px 0;
  width: 100%;
}
.nav-section {
  margin-bottom: 24px;
}
.el-menu-item i {
  font-size: 18px;
}
.user-menu .el-menu-item {
  padding-left: 20px;
}

/* 内容区 */
.content-area {
  padding: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 0;
  }
  .sidebar-col,
  .content-col,
  .ranking-col {
    width: 100% !important;
    flex: 1 1 auto;
    margin-bottom: 20px;
    padding: 0 !important;
  }
  .content-area {
    padding: 10px 0;
  }
  .sidebar-nav {
    width: 100% !important;
  }
  .nav-section {
    margin-bottom: 16px;
  }
}

/* 博客卡片样式 */
.blog-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}
.blog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Element Plus卡片深度覆盖 */
:deep(.blog-card .el-card__header) {
  border-radius: 16px 16px 0 0 !important;
  padding: 16px;
}
:deep(.blog-card .el-card__body) {
  border-radius: 0 0 16px 16px !important;
  padding: 16px;
}

/* 卡片标题与副标题 */
.blog-card h3 {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}
.blog-subtitle {
  font-size: 0.95em;
  color: #606266;
  font-weight: 400;
  border-left: 3px solid #409eff;
  padding-left: 8px;
  margin: 8px 0 10px 0;
  line-height: 1.4;
}

/* 博客元信息 */
.blog-meta {
  font-size: 0.9em;
  color: #888;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 排行榜 */
.ranking-panel {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}
.ranking-card {
  margin-bottom: 12px;
  position: relative;
}
.ranking-number {
  position: absolute;
  left: 10px;
  top: 10px;
  font-weight: bold;
  color: #909399;
}
.views-count {
  color: #606266;
  font-size: 0.9em;
  margin-top: 8px;
}

/* 按钮激活 */
.type-btn.active .arrow-icon {
  transform: rotate(180deg);
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}
</style>