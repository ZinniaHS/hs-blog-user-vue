<template>
  <div class="blog-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索博客..."
          suffix-icon="Search"
          style="width: 600px"
      />
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧内容选择 -->
      <el-col :span="4" class="sidebar-col">
        <el-affix :offset="120" class="sidebar-affix">
          <div class="sidebar-nav">
            <nav class="nav-container">
              <div class="nav-section">
                <el-menu vertical class="user-menu">
                  <el-menu-item index="9" @click="handleWriteBlog">
                    <el-icon><Notebook /></el-icon>
                    <span>写博客</span>
                  </el-menu-item>
                  <el-menu-item index="10">
                    <el-icon><Bell /></el-icon>
                    <span>我的订阅</span>
                  </el-menu-item>
                  <el-menu-item index="11">
                    <el-icon><Star /></el-icon>
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
              v-for="blog in displayedBlogs"
              :key="blog.id"
              class="blog-card"
          >
            <h3>{{ blog.title }}</h3>
            <!-- 新增副标题 -->
            <div class="blog-subtitle">{{ blog.subtitle }}</div>
            <div class="blog-meta">
              <span>发布时间：{{ formatDate(blog.publishTime) }}</span>
              <el-divider direction="vertical" />
              <span>浏览量：{{ blog.views }}</span>
              <el-divider direction="vertical" />
              <span>评论：{{ blog.comments }}</span>
            </div>
          </el-card>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ArrowDown, Notebook, Bell, Star, Search } from '@element-plus/icons-vue';
import router from "@/router/index.js";
import {ElMessage} from "element-plus";

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

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Mock数据
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

const searchKeyword = ref('');
const selectedType = ref('all');
const currentPage = ref(1);
const pageSize = ref(6);

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
</style>