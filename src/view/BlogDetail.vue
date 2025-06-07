<template>
  <div class="blog-detail-container">
    <div v-if="loading" class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-userinfo">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>

      <div class="skeleton-main">
        <div class="skeleton-title large"></div>
        <div class="skeleton-meta"></div>

        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>

        <div class="skeleton-footer">
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>

      <div class="skeleton-sidebar">
        <div class="skeleton-title small"></div>
        <div class="skeleton-list"></div>
      </div>
    </div>

    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- 博主信息区域 -->
      <el-affix :offset-top="0">
        <div class="author-info">
          <div class="author-avatar-name" @click="toUserDetail">
            <img class="avatar" :src="userInfo.avatarUrl" alt="博主头像">
            <h3 class="name">{{userInfo.username}}</h3>
          </div>
          <div class="stats">
            <el-tooltip placement="bottom">
              <template #content>博主的原创总博客数</template>
              <div class="stat-item"><span class="number">{{userInfo.totalBlogs}}</span>原创</div>
            </el-tooltip>
            <el-tooltip placement="bottom">
              <template #content>博主在所有博客收获的总点赞数</template>
              <div class="stat-item"><span class="number">{{userInfo.totalLikes}}</span>获赞</div>
            </el-tooltip>
            <!--            <div class="stat-item"><span class="number">{{userInfo.totalStars}}</span>收藏</div>-->
            <el-tooltip placement="bottom">
              <template #content>关注博主的人数统计</template>
              <div class="stat-item"><span class="number">{{userInfo.totalFollowers}}</span>粉丝</div>
            </el-tooltip>
            <el-tooltip placement="bottom">
              <template #content>博主所有博客的阅读量总计</template>
              <div class="stat-item"><span class="number">{{userInfo.totalViews}}</span>总浏览数</div>
            </el-tooltip>
          </div>
          <el-button v-if="!isMyPage && !userStatus?.followed" class="follow-btn" type="primary" @click="subscribeBlogger">+ 关注</el-button>
          <el-button v-else-if="userStatus?.followed" @click="unsubscribeBlogger">已关注</el-button>
          <el-button v-else class="toMyDetail-btn" @click="toUserDetail" >进入我的主页</el-button>
        </div>
      </el-affix>

      <!-- 热门文章排行榜 -->
      <el-affix :offset-top="180">
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
                  <span class="view-count">{{ article.viewCount }}</span>
                  <el-icon><CaretTop /></el-icon>
                  <span class="view-count">{{ article.likeCount }}</span>
                </div>
              </div>
            </el-card>
            <div v-if="topArticles.length === 0" class="no-articles">
              博主暂时没有文章
            </div>
          </div>
        </div>
      </el-affix>
    </div>

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <!-- 文章标题区域 -->
      <div class="article-header">
        <h1 class="main-title">{{blog.title}}</h1>
        <div class="sub-title">
          <span class="tag">原创</span>
          <span class="author-name">{{blog.username}}</span>
          <span class="publish-time">已于 {{blog.createTime}} 发布</span>
          <span class="views-count"><el-icon><View /></el-icon> 阅读量{{blog.viewCount}}</span>
          <span class="comments-count"><el-icon><Pointer /></el-icon> 点赞数{{blog.likeCount}}</span>
          <span class="likes-count"><el-icon><Star /></el-icon> 收藏数{{blog.starCount}}</span>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="markdown-content">
          <h2>{{blog.subTitle}}</h2>
          <p v-html="blog.content"></p>
        </div>

        <!-- 底部博主信息条 -->
        <el-affix :offset-bottom="0">
          <div class="bottom-author-info">
            <div class="author-info">
              <img class="small-avatar" :src="blog.userAvatar" alt="博主头像">
              <span class="author-name">{{blog.username}}</span>
            </div>
            <div class="interaction-buttons">
              <el-tooltip placement="top">
                <template #content>为博客点赞/取消点赞</template>
                <el-button circle type="primary" v-if="userStatus?.liked" @click="decrementLikeCount"><el-icon><CaretTop /></el-icon></el-button>
                <el-button circle v-else @click="incrementLikeCount"><el-icon><CaretTop /></el-icon></el-button>
              </el-tooltip>
              <el-tooltip placement="top">
                <template #content>收藏/取消收藏博客</template>
                <el-button circle type="primary" v-if="userStatus?.starred" @click="decrementStarCount"><el-icon><Star /></el-icon></el-button>
                <el-button circle v-else @click="incrementStarCount"><el-icon><Star /></el-icon></el-button>
              </el-tooltip>
            </div>
          </div>
        </el-affix>
      </div>
    </div>
  </div>
</template>


<script setup>
import {reactive, ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import router from "@/router/index.js";
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";

const loading = ref(true);

// 从路由中获得博客id
const BlogId = Number(useRoute().query.id)
// 当前博主id
const userId = ref('')
// 判断是否为当前登录账号的页面
const isMyPage = ref(false)
// 热门文章
const topArticles = ref({})
// 这篇博客博主的信息
const userInfo = ref({})
// 博客详情
const blog = ref({
  title: '',
  subtitle: '',
})
// 点赞，关注，收藏状态
const userStatus = ref({
  followed: false,
  liked: false,
  starred: false
})
// 初始化
onMounted( async() => {
  try {
    // 博客浏览量+1
    await incrementViewCount()
    // 展示博客详情
    await showBlogDetail(BlogId)
  } catch (error) {
    console.error("加载博客详情失败:", error)
    ElMessage.error("加载博客详情失败")
  } finally {
    loading.value = false
  }
})
// 获取博客详情
const showBlogDetail = async (id) => {
  request.get('/user/blog/'+id,{
  }).then((res) => {
    blog.value = res.data
    userId.value = res.data.userId
    // 验证是否为自己的页面
    verifyIfIsMyself()
    // 获取点赞和收藏状态
    getLikeStarAndFollowStatus()
    // 获取热门文章
    getTopFiveBlogForOne()
  })
}
// 判断是不是自己的页面，因为某些组件是自己页面才渲染的
const verifyIfIsMyself  = async () =>{
  try {
    await request.get('/user/getUserInfoById?id='+userId.value, {}).then((res) => {
      userInfo.value = res.data;
      isMyPage.value = res.data.myPage;
      console.log(userInfo.value)
    });
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
}
// 博客浏览量+1
const incrementViewCount = async () => {
  request.post('/user/blog/incrementViewCount/'+BlogId, {})
      .then((res) => {})
      .catch((err) => {
        console.log(err)
      })
}
// 进入用户详情页
const toUserDetail = () =>{
  router.push({
    name: 'userProfile',
    query: {
      id: userId.value,
    }})
}
// 博客点赞量+1
const incrementLikeCount = async () => {
  request.post('/user/blog/incrementLikeCount/'+BlogId, {})
      .then((res) => {
        ElMessage.success('点赞成功')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 博客取消点赞
const decrementLikeCount = async () => {
  request.post('/user/blog/decrementLikeCount/'+BlogId, {})
      .then((res) => {
        ElMessage.success('已取消点赞')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 博客收藏量+1
const incrementStarCount = async () => {
  request.post('/user/blog/incrementStarCount/'+BlogId, {})
      .then((res) => {
        ElMessage.success('收藏成功')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 取消博客收藏
const decrementStarCount = async () => {
  request.post('/user/blog/decrementStarCount/'+BlogId, {})
      .then((res) => {
        ElMessage.success('已取消收藏')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 关注博主
const subscribeBlogger = () =>{
  let bloggerId = userId.value;
  request.post('/user/subscribeBlogger/'+bloggerId, {})
      .then((res) => {
        ElMessage.success('关注成功')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 取消关注博主
const unsubscribeBlogger = () =>{
  let bloggerId = userId.value;
  request.post('/user/unsubscribeBlogger/'+bloggerId, {})
      .then((res) => {
        ElMessage.success('取消关注成功')
        getLikeStarAndFollowStatus()
      })
      .catch((err) => {
        console.log(err)
      })
}
// 获取点赞收藏状态
const getLikeStarAndFollowStatus = async () =>{
  request.get('/user/blog/getLikeStarAndFollowStatus', {
    params: {
      blogId: BlogId,
      bloggerId: userId.value,
    }
  })
      .then((res) => {
        userStatus.value = res.data
        console.log(res)
        console.log(userStatus.value)
      })
      .catch((err) => {
        console.log(err)
      })
}
// 获取浏览量前5的热门文章
const getTopFiveBlogForOne = async () => {
  await request.get('/user/blog/getTopFiveBlogForOne/'+userId.value, {})
      .then((res) => {
        console.log(res)
        // 只取前三浏览量记录
        topArticles.value = res.data.slice(0, 3)
      })
      .catch((err) => {
        console.log(err)
      })
}
</script>

<style scoped lang="scss">
.skeleton-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

.skeleton-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
}

.skeleton-userinfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-title.large {
  height: 36px;
}

.skeleton-title.small {
  height: 20px;
  width: 120px;
}

.skeleton-meta {
  height: 18px;
  width: 80%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-main {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.skeleton-content {
  margin: 20px 0;
}

.skeleton-line {
  height: 18px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-line:nth-child(1) { width: 98%; }
.skeleton-line:nth-child(2) { width: 95%; }
.skeleton-line:nth-child(3) { width: 97%; }
.skeleton-line:nth-child(4) { width: 90%; }
.skeleton-line:nth-child(5) { width: 85%; }
.skeleton-line:nth-child(6) { width: 92%; }
.skeleton-line:nth-child(7) { width: 96%; }
.skeleton-line:nth-child(8) { width: 93%; }
.skeleton-line:nth-child(9) { width: 98%; }
.skeleton-line:nth-child(10) { width: 87%; }

.skeleton-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.skeleton-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
}

.skeleton-sidebar {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.skeleton-list {
  height: 200px;
  margin-top: 15px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}


.author-avatar-name {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  transition: all 0.3s ease; // 添加平滑过渡效果

  &:hover {
    cursor: pointer; // 悬停时显示手型光标
    color: #409eff; // 悬停时文字颜色变化
    transform: scale(1.05); // 悬停时轻微放大
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .name {
    font-size: 18px;
    color: #333;
    font-weight: bold;
  }
}
.blog-detail-container {
  display: flex;
  //height: calc(100vh - 60px);
  background-color: #f5f5f5;

  .sidebar {
    width: 240px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    margin: 10px;

    .author-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;

      .author-avatar-name {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .name {
          font-size: 18px;
          color: #333;
          font-weight: bold;
        }
      }

      .stats {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin: 15px 0;
        color: #666;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .number {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
        }
      }

      .follow-btn {
        width: 180px;
        margin-top: 15px;
        background-color: #409eff;
        color: white;
      }

      .toMyDetail-btn{
        width: 180px;
        margin-top: 15px;
      }
    }

    .hot-articles {
      margin-top: 20px;

      .section-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
        border-left: 3px solid #409eff;
        padding-left: 10px;
      }

      ul {
        list-style: none;
        padding: 0;

        .article-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;

          .rank {
            width: 20px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            background-color: #409eff;
            color: white;
            border-radius: 50%;
            margin-right: 10px;
            font-size: 12px;
          }

          .article-title {
            flex: 1;
            color: #333;
            text-decoration: none;
            font-size: 14px;
          }

          .views {
            color: #999;
            font-size: 12px;
          }
        }
      }

      .no-articles {
        text-align: center;
        padding: 20px 0;
        color: #999;
        font-size: 14px;
      }
    }
  }

  .main-content {
    position: relative;
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    margin: 10px;
    padding: 20px;
    overflow-y: auto;

    &::before {
      content: "";
      display: block;
      height: 0;
      margin-top: -20px; // 抵消padding-top
    }

    .article-header {
      margin-bottom: 30px;

      .main-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }

      .sub-title {
        display: flex;
        flex-wrap: wrap;
        font-size: 14px;
        color: #999;
        border-bottom: 1px solid #eee;


        .tag {
          background-color: #f5f5f5;
          padding: 2px 8px;
          border-radius: 4px;
          margin-right: 10px;
        }

        .author-name {
          color: #666;
          margin-right: 15px;
        }

        .publish-time, .views-count, .likes-count, .comments-count {
          margin-right: 15px;
        }
      }
    }

    .article-content {
      .markdown-content {
        line-height: 1.8;
        color: #333;
        font-size: 16px;


        h2 {
          color: #333;
          border-left: 3px solid #409eff;
          padding-left: 10px;
          margin: 20px 0;
          font-weight: bold;
        }

        p {
          margin: 10px 0;
        }
      }
    }

    .bottom-author-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      width: calc(100% - 20px * 2);
      bottom: 0;
      left: 20px;
      right: 20px;
      padding: 10px 0;
      margin: -20 -20px;
      padding-left: 20px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      border-radius: 8px 8px 0 0;
      overflow-x: hidden;

      .author-info {
        display: flex;
        align-items: center;

        .small-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .author-name {
          font-size: 14px;
          color: #333;
        }
      }

      .interaction-buttons {
        padding-right: 20px;
        display: flex;
        justify-content: flex-end; // 关键修改

        button {
          margin-left: 10px;
          font-size: 18px;
          padding: 6px;
        }
      }
    }
  }
}

.hot-articles {
  width: 100%;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
}

.section-title{
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  border-left: 3px solid #409eff;
  padding-left: 10px;
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
</style>