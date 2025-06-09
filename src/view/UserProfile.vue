<template>
  <div class="user-profile-container">
    <!-- 博主信息区 - 骨架屏 -->
    <div v-if="loadingUserInfo" class="skeleton-user-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-user-details">
        <div class="skeleton-name"></div>
        <div class="skeleton-stats">
          <div v-for="i in 5" :key="i" class="skeleton-stat-item">
            <div class="skeleton-stat-value"></div>
            <div class="skeleton-stat-label"></div>
          </div>
        </div>
        <div class="skeleton-bio"></div>
      </div>
    </div>

    <!-- 博主信息区 - 实际内容 -->
    <div v-else class="user-header">
      <div class="user-info-container">
        <div class="user-avatar-section">
          <el-avatar :size="80" :src="userInfo.avatarUrl"></el-avatar>
        </div>
        <div class="user-details-section">
          <div class="user-name-section">
            <h2>{{ userInfo.username }}</h2>
            <div class="follow-action">
              <el-button v-if="!isMyPage&&followStatus" size="small" plain round @click="unsubscribeBlogger">已关注</el-button>
              <el-button v-if="!isMyPage&&!followStatus" size="small" type="primary" round @click="subscribeBlogger">关注</el-button>
              <el-button v-if="isMyPage&&loginStatus" size="small" plain round @click="toUserDetail">编辑资料</el-button>
            </div>
          </div>
          <div class="user-stats">
            <el-tooltip placement="bottom">
              <template #content>博主的原创总博客数</template>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.totalBlogs }}</div>
                <div class="stat-label">原创</div>
              </div>
            </el-tooltip>
            <div class="stat-divider"></div>
            <el-tooltip placement="bottom">
              <template #content>博主在所有博客收获的总点赞数</template>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.totalLikes }}</div>
                <div class="stat-label">获赞</div>
              </div>
            </el-tooltip>
            <div class="stat-divider"></div>
            <el-tooltip placement="bottom">
              <template #content>关注博主的人数统计</template>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.totalFollowers }}</div>
                <div class="stat-label">粉丝</div>
              </div>
            </el-tooltip>
            <div class="stat-divider"></div>
            <el-tooltip placement="bottom">
              <template #content>博主所有博客的阅读量总计</template>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.totalViews }}</div>
                <div class="stat-label">总访问量</div>
              </div>
            </el-tooltip>
            <div class="stat-divider"></div>
            <el-tooltip placement="bottom">
              <template #content>排名还在统计中...</template>
              <div class="stat-item">
                <div class="stat-value">统计中</div>
                <div class="stat-label">排名</div>
              </div>
            </el-tooltip>
          </div>

          <div class="user-bio">
            <div>个人简介：{{ userInfo.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方内容区 -->
    <div class="user-content">
      <!-- 侧边热门文章区 - 骨架屏 -->
      <div v-if="loadingTopArticles" class="skeleton-sidebar">
        <div class="skeleton-section-title"></div>
        <div class="skeleton-hot-articles">
          <div v-for="i in 3" :key="i" class="skeleton-hot-article">
            <div class="skeleton-rank"></div>
            <div class="skeleton-article-content">
              <div class="skeleton-article-title"></div>
              <div class="skeleton-article-meta"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边热门文章区 - 实际内容 -->
      <div v-else class="sidebar">
        <div class="hot-articles">
          <h4 class="section-title">热门文章</h4>
          <div class="articles-container">
            <el-card
                v-for="(article, index) in topArticles"
                :key="index"
                class="hot-article-card"
                shadow="hover"
            >
              <div class="rank-badge">{{ index + 1 }}</div>
              <div class="article-content">
                <div class="article-title" @click="toBlogDetail(article)">
                  {{ article.title }}
                </div>
                <div class="article-stats">
                  <el-icon><View /></el-icon>
                  <span class="view-count">浏览量 {{ article.viewCount }}</span>
                </div>
              </div>
            </el-card>
            <div v-if="topArticles.length === 0" class="no-articles">
              博主暂时没有文章
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <div class="tabs-wrapper">
          <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="文章" name="articles"></el-tab-pane>
            <el-tab-pane label="关注" name="interactions"></el-tab-pane>
            <el-tab-pane label="收藏" name="favorites"></el-tab-pane>
            <el-tab-pane label="我的草稿" name="drafts" v-if="isMyPage === true"></el-tab-pane>
          </el-tabs>

          <!-- 主内容区骨架屏 -->
          <div v-if="loadingMainContent" class="skeleton-main-content">
            <div class="skeleton-main-tabs"></div>

            <div v-if="activeTab === 'articles' || activeTab === 'drafts'" class="skeleton-filter-options">
              <div class="skeleton-filter-option"></div>
              <div class="skeleton-filter-option"></div>
            </div>

            <div class="skeleton-article-list">
              <div v-for="i in 3" :key="i" class="skeleton-article-item">
                <div class="skeleton-article-title"></div>
                <div class="skeleton-article-desc"></div>
                <div class="skeleton-article-meta">
                  <div class="skeleton-tag"></div>
                  <div class="skeleton-publish-info"></div>
                  <div class="skeleton-stats"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 主内容区实际内容 -->
          <div v-else>
            <!-- 筛选条件 -->
            <div class="filter-options" v-if="activeTab === 'articles' || activeTab === 'drafts' ">
              <!-- 按发布时间 -->
              <div
                  class="filter-option"
                  :class="{ active: sortBy === 'createTime' }"
                  @click="handleSort('createTime')"
              >
                <span>按最后发布时间</span>
                <el-icon><SortDown /></el-icon>
              </div>
              <!-- 按访问量 -->
              <div
                  class="filter-option"
                  :class="{ active: sortBy === 'viewCount' }"
                  @click="handleSort('viewCount')"
              >
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
                      <el-tag size="small" type="primary" effect="plain">原创</el-tag>
                      <span class="publish-info">博客创建于 {{ article.createTime }}</span>
                      <span class="article-stats">
                      <span>{{ article.viewCount }} 阅读</span>
                      <span>{{ article.likeCount }} 点赞</span>
                      <span>{{ article.starCount }} 收藏</span>
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

            <!-- 我的关注区 -->
            <template v-if="activeTab === 'interactions'">
              <div class="followees-container">
                <el-row :gutter="20">
                  <el-col
                      v-for="Blogger in SubscribeBloggerList"
                      :key="Blogger.id"
                      :xs="24"
                      :sm="12"
                      class="followee-col"
                  >
                    <el-card class="followee-card" shadow="hover">
                      <div class="followee-content">
                        <div class="avatar-section">
                          <el-avatar
                              :size="40"
                              :src="Blogger.avatarUrl"
                              round
                              class="user-avatar"
                              @click="toUserProfile(Blogger.id)"
                          ></el-avatar>
                        </div>

                        <div class="info-section">
                          <div class="followee-name" @click="toUserProfile(Blogger.id)">{{ Blogger.username }}</div>
                          <div class="followee-desc">{{ Blogger.description }}</div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>

                <div v-if="SubscribeBloggerList.length === 0" class="no-followees">
                  暂无关注的人
                </div>
              </div>
            </template>

            <!-- 我的收藏区 -->
            <template v-if="activeTab === 'favorites'">
              <!-- 判断没有收藏文章时提示 -->
              <div v-if="starBlogs.total === 0 && activeTab === 'favorites'" class="no-articles">
                博主暂时没有收藏的文章
              </div>
              <!-- 有收藏时显示收藏文章与分页条 -->
              <div v-if="starBlogs.record.length">
                <div class="articles-list">
                  <div v-for="(blog, index) in starBlogs.record" :key="index" class="article-item">
                    <div class="article-header">
                      <div class="title-section">
                        <div class="article-title" @click="toBlogDetail(blog)">{{ blog.title }}</div>
                      </div>
                      <div class="user-section" @click="toUserProfile(blog.userId)">
                        <el-avatar :size="24" :src="blog.userAvatar" class="user-avatar-starBlog"></el-avatar>
                        <span class="username">{{ blog.username }}</span>
                      </div>
                    </div>
                    <div class="article-desc">{{ blog.subTitle }}</div>
                    <div class="article-meta">
                      <el-tag size="small" type="primary" effect="plain">原创</el-tag>
                      <span class="publish-info">博客创建于 {{ blog.createTime }}</span>
                      <span class="article-stats">
                      <span>{{ blog.viewCount }} 阅读</span>
                      <span>{{ blog.likeCount }} 点赞</span>
                      <span>{{ blog.starCount }} 收藏</span>
                      </span>
                    </div>
                  </div>
                </div>
                <!-- 分页组件绑定草稿分页参数 -->
                <div class="pagination-wrapper">
                  <el-pagination
                      v-model:current-page="starBlogsPageQueryDTO.pageNum"
                      v-model:page-size="starBlogsPageQueryDTO.pageSize"
                      :page-sizes="[3, 6, 10, 20]"
                      background
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="starBlogs.total"
                      @size-change="handleStarBlogSizeChange"
                      @current-change="handleStarBlogCurrentChange"/>
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
                <div v-for="(draft, index) in draftBlogs.record"  :key="index" class="article-item">
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

  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {
  View, SortDown, More
} from '@element-plus/icons-vue';
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";
import request from "@/utils/request.js";

const loginStatus = localStorage.getItem('token') != null

const followStatus = ref(false);

// 加载状态
const loadingUserInfo = ref(true);
const loadingTopArticles = ref(true);
const loadingMainContent = ref(true);

// 从路由中获得此页面的博主id（还需要验证是否为本人页）
const currentId = ref(useRoute().query.id)
// 进入此页用户的id
const trueId = ref()
// 当前选中的标签页
const activeTab = ref('articles');
// 判断当前是否为自己的页面
const isMyPage = ref();
// 按时间或访问量排序
const sortBy = ref('createTime');
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
// 收藏博客分页查询DTO
const starBlogsPageQueryDTO =ref({
  pageNum: 1,
  pageSize: 3,
  keyWords: '',
  // 创建时间排序
  createTimeOrder: '',
  // 浏览量排序
  viewCountOrder: '',
})
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
// 已收藏的文章
const starBlogs = reactive({
  total: 0,
  record: [],
})
// 新增草稿数据
const draftBlogs = reactive({
  total: 0,
  record: [],
});
// 热门文章
const topArticles = ref([])
// 关注的博主列表
const SubscribeBloggerList = ref([])
// 选择每页显示多少条记录时，触发分页查询
const handleArticleSizeChange = () =>{
  getArticles(trueId.value)
}
// 跳转其他页面的时候触发分页查询
const handleArticleCurrentChange = () =>{
  getArticles(trueId.value)
}
// 选择每页显示多少条记录时，触发分页查询
const handleStarBlogSizeChange = () =>{
  getStarBlogs(trueId.value)
}
// 跳转其他页面的时候触发分页查询
const handleStarBlogCurrentChange = () =>{
  getStarBlogs(trueId.value)
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
  // 首先判断是否为自己的页面
  await verifyIfIsMyself(currentId.value);
  // 初始化加载博主信息
  try {
    await request.get(`/user/getUserInfoById?id=${currentId.value}`, {}).then((res) => {
      console.log(res.data)
      userInfo.value = res.data;
      trueId.value = res.data.id;
      loadingUserInfo.value = false; // 数据加载完成
    });
  } catch (error) {
    console.error("获取用户信息失败", error);
    loadingUserInfo.value = false; // 即使出错也隐藏骨架屏
  }

  // 加载热门文章
  getTopFiveBlogForOne();

  // 加载主内容区数据
  loadMainContentData();

  // 获取关注状态
  getFollowStatus()
})
// 获取关注博主状态
const getFollowStatus = () =>{
  request.get('/user/getSubscribeStatus/'+currentId.value).then((res) => {
    followStatus.value = res.data;
  })
}
// 关注博主
const subscribeBlogger = () =>{
  if(!loginStatus)
    router.replace('/login').then(()=>{
      location.reload()
    });
  let bloggerId = trueId.value;
  request.post('/user/subscribeBlogger/'+bloggerId, {})
      .then((res) => {
        ElMessage.success('关注成功')
        getFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 取消关注博主
const unsubscribeBlogger = () =>{
  let bloggerId = trueId.value;
  request.post('/user/unsubscribeBlogger/'+bloggerId, {})
      .then((res) => {
        ElMessage.success('取消关注成功')
        getFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 加载主内容区数据
const loadMainContentData = async () => {
  try {
    // 查询文章
    await getArticles(trueId.value);
    // 查询收藏的博客
    await getStarBlogs(trueId.value);
    // 草稿博客
    await getDrafts(trueId.value);
    // 获取关注的博主列表
    await getSubscribedBlogger();

    loadingMainContent.value = false; // 数据加载完成
  } catch (error) {
    console.error("加载主内容失败", error);
    loadingMainContent.value = false; // 即使出错也隐藏骨架屏
  }
}
// 判断是不是自己的页面，因为某些组件是自己页面才渲染的
const verifyIfIsMyself  = async (currentId) =>{
  if(localStorage.getItem('userId') === currentId)
    isMyPage.value = true
  else
    isMyPage.value = false
}
// 点击按创建时间，访问量排序
const handleSort = (sortType) => {
  sortBy.value = sortType;
  if(activeTab.value === 'articles')
    getArticles(trueId.value)
  else
    getDrafts(trueId.value)
};
// 获取文章区内容
const getArticles = async (trueId) => {
  // 判断当前以哪种方式筛选数据
  let sortRule = {
    createTimeOrder: '',
    viewCountOrder: '',
  }
  if(sortBy.value === 'createTime')
    sortRule.createTimeOrder = 'DESC'
  else
    sortRule.viewCountOrder = 'DESC'

  try {
    const res = await request.get('/user/blog/queryAllBlogsByUserId', {
      params:{
        userId: trueId,
        type: 'article',
        pageNum: articlePageQueryDTO.value.pageNum,
        pageSize: articlePageQueryDTO.value.pageSize,
        keyWords: articlePageQueryDTO.value.keyWords,
        // 创建时间排序
        createTimeOrder: sortRule.createTimeOrder,
        // 浏览量排序
        viewCountOrder: sortRule.viewCountOrder
      }
    });
    articles.record = res.data.records
    articles.total = res.data.total
  } catch (error) {
    console.error("获取文章失败", error);
  }
}
// 获取收藏的博客
const getStarBlogs = async (trueId) => {
  try {
    const res = await request.get('/user/blog/getStarBlogs', {
      params:{
        userId: trueId,
        pageNum: starBlogsPageQueryDTO.value.pageNum,
        pageSize: starBlogsPageQueryDTO.value.pageSize,
        keyWords: starBlogsPageQueryDTO.value.keyWords,
        // 创建时间排序
        createTimeOrder: '',
        // 浏览量排序
        viewCountOrder: ''
      }
    });
    starBlogs.record = res.data.records
    starBlogs.total = res.data.total
  } catch (error) {
    console.error("获取收藏博客失败", error);
  }
}
// 获取草稿数据的方法
const getDrafts = async (trueId) => {
  // 判断当前以哪种方式筛选数据
  let sortRule = {
    createTimeOrder: '',
    viewCountOrder: '',
  }
  if(sortBy.value === 'createTime')
    sortRule.createTimeOrder = 'DESC'
  else
    sortRule.viewCountOrder = 'DESC'

  try {
    const res = await request.get('/user/blog/queryAllBlogsByUserId', {
      params:{
        userId: trueId,
        type: 'draft',
        pageNum: draftPageQueryDTO.value.pageNum,
        pageSize: draftPageQueryDTO.value.pageSize,
        keyWords: draftPageQueryDTO.value.keyWords,
        // 创建时间排序
        createTimeOrder: sortRule.createTimeOrder,
        // 浏览量排序
        viewCountOrder: sortRule.viewCountOrder
      }
    });
    draftBlogs.record = res.data.records
    draftBlogs.total = res.data.total
  } catch (error) {
    console.error("获取草稿失败", error);
  }
};
// 获取浏览量前5的热门文章
const getTopFiveBlogForOne = async () => {
  try {
    loadingTopArticles.value = true;
    const res = await request.get('/user/blog/getTopFiveBlogForOne/'+currentId.value);
    // 只取前三浏览量记录
    topArticles.value = res.data.slice(0, 3);
    loadingTopArticles.value = false; // 数据加载完成
  } catch (err) {
    console.error("获取热门文章失败", err);
    loadingTopArticles.value = false; // 即使出错也隐藏骨架屏
  }
}
// 获取关注的博主列表
const getSubscribedBlogger = async () => {
  try {
    const res = await request.get('/user/getSubscribedBlogger/'+currentId.value);
    SubscribeBloggerList.value = res.data;
  } catch (err) {
    console.error("获取关注博主失败", err);
  }
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
  router.replace({
    name: 'userDetail',
    query: {
      id: trueId.value,
    }
  }).then(() => {
    location.reload(); // 强制刷新页面
  });
}
// 进入用户档案详情页
const toUserProfile = (id) =>{
  router.replace({
    name: 'userProfile',
    query: {
      id: id,
    }
  }).then(() => {
    location.reload(); // 强制刷新页面
  });
}
</script>

<style scoped>
/* 原有样式保持不变 */
.user-avatar-starBlog {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s ease;
}

.user-section:hover .user-avatar-starBlog {
  transform: scale(1.1) rotate(-2deg);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.title-section {
  flex: 1;
}

.article-title {
  margin-bottom: 0;
  margin-right: 15px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-section:hover .username {
  color: #409eff;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* 联动效果增强 */
.user-section:hover {
  color: #409eff;
}

.followee-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease; /* 添加过渡动画 */
  cursor: pointer; /* 添加指针光标 */
}

.followee-name:hover {
  color: #409eff; /* 与文章标题hover颜色一致 */
}

.followee-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
}

.info-section {
  flex: 1;
}

.followee-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.followee-desc {
  color: #666;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 头像悬停效果 */
.user-avatar:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .followee-content {
    flex-direction: column;
    align-items: center;
  }

  .info-section {
    text-align: center;
    margin-top: 8px;
  }

  .followee-name {
    white-space: normal;
  }
}

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
  margin-top: 6px;
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

.articles-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-article-card {
  width: 100%;
  border-radius: 8px;
}

.rank-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-bottom: 12px;
}

.article-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-title:hover {
  color: #409eff;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.view-count {
  color: #409eff;
  font-weight: 500;
}

.no-articles {
  text-align: center;
  padding: 16px 0;
  color: #999;
  font-size: 14px;
}

/* 骨架屏样式 */
.skeleton-user-header {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f2f2f2;
  margin-right: 20px;
}

.skeleton-user-details {
  flex: 1;
}

.skeleton-name {
  width: 30%;
  height: 28px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 20px;
}

.skeleton-stats {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.skeleton-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-right: 20px;
}

.skeleton-stat-value {
  width: 50px;
  height: 18px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 5px;
}

.skeleton-stat-label {
  width: 60px;
  height: 14px;
  background-color: #f2f2f2;
  border-radius: 4px;
}

.skeleton-bio {
  width: 100%;
  height: 16px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-bio:last-child {
  width: 80%;
}

.skeleton-section-title {
  width: 120px;
  height: 20px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton-hot-articles {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skeleton-hot-article {
  display: flex;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f2f2f2;
  margin-right: 12px;
}

.skeleton-article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-article-title {
  height: 18px;
  background-color: #f2f2f2;
  border-radius: 4px;
}

.skeleton-article-meta {
  height: 14px;
  width: 70%;
  background-color: #f2f2f2;
  border-radius: 4px;
}

.skeleton-main-content {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skeleton-main-tabs {
  height: 40px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton-filter-options {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.skeleton-filter-option {
  width: 120px;
  height: 30px;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-right: 20px;
}

.skeleton-article-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.skeleton-article-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-article-title {
  height: 24px;
  width: 70%;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-article-desc {
  height: 16px;
  width: 90%;
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skeleton-tag {
  width: 60px;
  height: 24px;
  background-color: #f2f2f2;
  border-radius: 12px;
}

.skeleton-publish-info {
  height: 16px;
  width: 150px;
  background-color: #f2f2f2;
  border-radius: 4px;
}

.skeleton-stats {
  height: 16px;
  width: 200px;
  background-color: #f2f2f2;
  border-radius: 4px;
}

/* 骨架屏动画 */
.skeleton-user-header > div,
.skeleton-section-title,
.skeleton-hot-article > div,
.skeleton-main-tabs,
.skeleton-filter-option,
.skeleton-article-title,
.skeleton-article-desc,
.skeleton-article-meta > div {
  background-image: linear-gradient(
      90deg,
      #f2f2f2 25%,
      #e0e0e0 50%,
      #f2f2f2 75%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s linear infinite;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .skeleton-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>