<template>
  <div class="user-profile-container">
    <!-- 博主信息区 -->
    <div class="user-header">
      <div class="user-info-container">
        <div class="user-avatar-section">
          <el-avatar :size="80" :src="userInfo.avatarUrl"></el-avatar>
        </div>
        <div class="user-details-section">
          <div class="user-name-section">
            <h2>{{ userInfo.username }}</h2>
            <div class="follow-action">
              <el-button v-if="!isMyPage" size="small" plain round>已关注</el-button>
              <el-button v-else size="small" plain round @click="toUserDetail">编辑资料</el-button>
<!--              <el-button type="text" icon="More" class="more-actions"></el-button>-->
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.totalBlogs }}</div>
              <div class="stat-label">原创</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.totalLikes }}</div>
              <div class="stat-label">获赞</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.totalFollowers }}</div>
              <div class="stat-label">粉丝</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.totalViews }}</div>
              <div class="stat-label">总访问量</div>
            </div>
            <div class="stat-divider"></div>

            <div class="stat-item">
              <div class="stat-value">统计中</div>
              <div class="stat-label">排名</div>
            </div>
          </div>

          <div class="user-bio">
            <div>个人简介：{{ userInfo.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方内容区 -->
    <div class="user-content">
      <!--   侧边热门文章区   -->
      <div class="sidebar">
        <div class="hot-articles">
          <h4 class="section-title">热门文章</h4>
          <div class="no-articles">
            博主暂时没有文章
          </div>
        </div>
      </div>
      <!--   主内容区   -->
      <div class="main-content">
        <div class="tabs-wrapper">
          <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="文章" name="articles"></el-tab-pane>
            <el-tab-pane label="关注" name="interactions"></el-tab-pane>
            <el-tab-pane label="收藏" name="favorites"></el-tab-pane>
            <el-tab-pane label="我的草稿" name="drafts" v-if="isMyPage === true"></el-tab-pane>
          </el-tabs>
          <!-- 筛选条件：按发布时间 -->
          <div class="filter-options">
            <div class="filter-option active">
              <span>按最后发布时间</span>
              <el-icon><SortDown /></el-icon>
            </div>
            <!-- 筛选条件：按访问量 -->
            <div class="filter-option">
              <span>按访问量</span>
              <el-icon><SortDown /></el-icon>
            </div>
          </div>

          <!-- 文章区 -->
          <template v-if="activeTab === 'articles'">
            <!-- 判断没有文章时提示 -->
            <div v-if="articles.total === 0 && activeTab === 'articles'" class="no-articles">
              博主暂时没有文章
            </div>
            <!-- 有博客时显示博客与分页条 -->
            <div v-if="articles.record.length">
              <div class="articles-list">
                <div v-for="(article, index) in articles.record" :key="index" class="article-item">
                  <div class="article-title" @click="toBlogDetail(article)">{{ article.title }}</div>
                  <div class="article-desc">{{ article.subTitle }}</div>
                  <div class="article-meta">
                    <el-tag size="small" type="success" effect="plain">原创</el-tag>
                    <span class="publish-info">博客创建于 {{ article.createTime }}</span>
                    <span class="article-stats">
                  <span>{{ article.viewCount }} 阅读</span>
                  <span>{{ article.likeCount }} 点赞</span>
                  <span>{{ article.starCount }} 收藏</span>
                      <!--<span>{{ article.comments }} 评论</span>-->
                </span>
                  </div>
                </div>
              </div>
              <!-- 分页组件绑定草稿分页参数 -->
              <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="articlePageQueryDTO.pageNum"
                    v-model:page-size="articlePageQueryDTO.pageSize"
                    :page-sizes="[3, 6, 10, 20]"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="articles.total"
                    @size-change="handleArticleSizeChange"
                    @current-change="handleArticleCurrentChange"/>
              </div>
            </div>
          </template>

          <!-- 草稿区 -->
          <template v-if="activeTab === 'drafts' && isMyPage === true">
            <div v-if="draftBlogs.total === 0 && activeTab === 'drafts'" class="no-articles">
              没有草稿 <div class="toBlogEdit"><el-button type="primary" @click="toBlogEdit">去写博客</el-button></div>
            </div>
            <!-- 用户提供的草稿内容 -->
            <div v-if="draftBlogs.record.length">
              <div v-for="(draft, index) in draftBlogs"  :key="index" class="article-item">
                <div class="article-title" @click="toBlogEdit(draft)">{{ draft.title }}</div>
                <div class="article-desc">{{ draft.subTitle }}</div>
                <div class="article-meta">
                  <span class="publish-info">博客创建于 {{ draft.createTime }}</span>
                  <span class="article-stats">
                </span>
                </div>
              </div>
              <!-- 分页组件绑定草稿分页参数 -->
              <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="draftPageQueryDTO.pageNum"
                    v-model:page-size="draftPageQueryDTO.pageSize"
                    :page-sizes="[6, 10, 20]"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="draftBlogs.total"
                    @size-change="handleDraftSizeChange"
                    @current-change="handleDraftCurrentChange"/>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {
  Star, Medal, Trophy, ArrowDown, GoodsFilled,
  ChatDotRound, Share, TrendCharts, Connection,
  SortDown, More
} from '@element-plus/icons-vue';
import {useRoute} from "vue-router";
import {ElNotification} from "element-plus";
import router from "@/router/index.js";
import request from "@/utils/request.js";

// 从路由中获得此页面的博主id（还需要验证是否为本人页）
const currentId = ref(useRoute().query.id)
// 进入此页用户的id
const trueId = ref()
// 当前选中的标签页
const activeTab = ref('articles');
// 判断当前是否为自己的页面
const isMyPage = ref();
// 文章区分页查询DTO
const articlePageQueryDTO = ref({
  pageNum: 1,
  pageSize: 3,
  keyWords: '',
  // 创建时间排序
  createTimeOrder: '',
  // 浏览量排序
  viewCountOrder: '',
});
// 文章区分页查询DTO
const draftPageQueryDTO = ref({
  pageNum: 1,
  pageSize: 3,
  keyWords: '',
  // 创建时间排序
  createTimeOrder: '',
  // 浏览量排序
  viewCountOrder: '',
});
// 博主信息
const userInfo = ref({});
// 所有已发布的博客article
const articles = reactive({
  total: 0,
  record: [],
});
// 新增草稿数据
const draftBlogs = reactive({
  total: 0,
  record: [],
});
// 选择每页显示多少条记录时，触发分页查询
const handleArticleSizeChange = () =>{
  getArticles(trueId.value)
}
// 跳转其他页面的时候触发分页查询
const handleArticleCurrentChange = () =>{
  getArticles(trueId.value)
}
// 选择每页显示多少条记录时，触发分页查询
const handleDraftSizeChange = () =>{
  getDrafts(trueId.value)
}
// 跳转其他页面的时候触发分页查询
const handleDraftCurrentChange = () =>{
  getDrafts(trueId.value)
}
// 初始化
onMounted(async () => {
  console.log('currentId: '+currentId.value)
  // 首先判断是否为自己的页面
  await verifyIfIsMyself(currentId.value);
  // console.log(trueId.value)
  console.log(isMyPage.value)
  // 查询文章，已经发布的博客称为 article文章
  getArticles(trueId.value)
  // 草稿博客
  getDrafts(trueId.value);
})
// 判断是不是自己的页面，因为某些组件是自己页面才渲染的
const verifyIfIsMyself  = async (currentId) =>{
  try {
    await request.get(`/user/getUserInfoById?id=${currentId}`, {}).then((res) => {
      console.log(res)
      userInfo.value = res.data;
      isMyPage.value = res.data.myPage;
      trueId.value = res.data.id;
      return trueId.value; // 返回trueId值
    });
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
}
// 获取文章区内容
const getArticles = async (trueId) => {
  request.get('/user/blog/queryAllBlogsByUserId',{
    params:{
      userId: trueId,
      type: 'article',
      pageNum: articlePageQueryDTO.value.pageNum,
      pageSize: articlePageQueryDTO.value.pageSize,
      keyWords: articlePageQueryDTO.value.keyWords,
      // 创建时间排序
      createTimeOrder: '',
      // 浏览量排序
      viewCountOrder: ''
    }
  }).then((res) => {
    console.log(res)
    articles.record = res.data.records
    articles.total = res.data.total
  })
}
// 获取草稿数据的方法
const getDrafts = (trueId) => {
  request.get('/user/blog/queryAllBlogsByUserId',{
    params:{
      userId: trueId,
      type: 'draft',
      pageNum: draftPageQueryDTO.value.pageNum,
      pageSize: draftPageQueryDTO.value.pageSize,
      keyWords: draftPageQueryDTO.value.keyWords,
      // 创建时间排序
      createTimeOrder: '',
      // 浏览量排序
      viewCountOrder: ''
    }
  }).then((res) => {
    // console.log(res);
    draftBlogs.record = res.data.records
    draftBlogs.total = res.data.total
  })
};
// 进入博客详情页
const toBlogDetail = (blog) =>{
  router.push({
    name: 'blogDetail',
    query: {
      id: blog.id,
    }
  })
}
// 进入博客编辑页
const toBlogEdit = (blog) =>{
  router.push({
    name: 'blogEdit',
    query: {
      id: blog.id,
    }
  })
}
// 进入用户资料编辑页
const toUserDetail = () =>{
  router.push({
    name: 'userDetail',
    query: {
      id: trueId.value,
    }
  })
}
</script>

<style scoped>

.toBlogEdit{
  margin-top: 10px;
}

.section-title{
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.no-articles {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

.user-profile-container {
  font-family: Arial, sans-serif;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
}

.user-header {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.user-info-container {
  display: flex;
  align-items: flex-start;
}

.user-avatar-section {
  margin-right: 20px;
}

.user-details-section {
  flex: 1;
}

.user-name-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-name-section h2 {
  margin: 0;
  margin-right: 15px;
  font-size: 22px;
}

.user-badges {
  display: flex;
  gap: 8px;
  margin-right: auto;
}

.badge-icon {
  padding: 0 8px;
}

.follow-action {
  display: flex;
  align-items: center;
  gap: 10px;
}

.more-actions {
  font-size: 18px;
}

.user-stats {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-right: 20px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: #e0e0e0;
  margin-right: 20px;
}

.user-bio {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.view-more {
  color: #409eff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.user-content {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 15px;
}

.sidebar-header {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.achievement-icon {
  width: 30px;
  display: flex;
  justify-content: center;
}

.view-more-btn {
  display: flex;
  justify-content: center;
  color: #409eff;
  cursor: pointer;
  margin-top: 10px;
}

.main-content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 15px;
}

.filter-options {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 20px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 5px 10px;
}

.filter-option.active {
  color: #409eff;
}

.rss-link {
  margin-left: auto;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.article-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  cursor: pointer;
}

.article-title:hover {
  color: #409eff;
}

.article-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.publish-info {
  margin-right: 15px;
}

.article-stats {
  display: flex;
  gap: 15px;
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  padding: 0 20px;
}
</style>