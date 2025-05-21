<template>
  <div class="blog-detail-container">
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
            <div class="stat-item"><span class="number">{{userInfo.totalBlogs}}</span>原创</div>
            <div class="stat-item"><span class="number">{{userInfo.totalLikes}}</span>点赞</div>
<!--            <div class="stat-item"><span class="number">{{userInfo.totalStars}}</span>收藏</div>-->
            <div class="stat-item"><span class="number">{{userInfo.totalFollowers}}</span>粉丝</div>
            <div class="stat-item"><span class="number">{{userInfo.totalViews}}</span>总浏览数</div>
          </div>
          <el-button v-if="!isMyPage" class="follow-btn" type="primary">+ 关注</el-button>
          <el-button v-else class="toMyDetail-btn" @click="toUserDetail" >进入我的主页</el-button>
        </div>
      </el-affix>

      <!-- 热门文章排行榜 -->
      <el-affix :offset-top="180">
        <div class="hot-articles">
          <h4 class="section-title">热门文章</h4>
<!--          <ul v-if="hotArticles.length > 0">-->
<!--            <li class="article-item" v-for="(article, index) in hotArticles" :key="index">-->
<!--              <span class="rank">{{index + 1}}</span>-->
<!--              <router-link :to="'/blog/' + article.id" class="article-title">-->
<!--                {{article.title}}-->
<!--              </router-link>-->
<!--              <span class="views">{{article.views}}</span>-->
<!--            </li>-->
<!--          </ul>-->
          <div class="no-articles">
            博主暂时没有文章
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
              <el-button circle @click="incrementLikeCount"><el-icon><CaretTop /></el-icon></el-button>
              <el-button circle @click="incrementStarCount"><el-icon><Star /></el-icon></el-button>
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

// 从路由中获得博客id
const BlogId = Number(useRoute().query.id)
// 当前博主id
const userId = ref('')
// 判断是否为当前登录账号的页面
const isMyPage = ref(false)
// 这篇博客博主的信息
const userInfo = ref({})
// 博客详情
const blog = ref({
  title: '',
  subtitle: '',
})
// 初始化
onMounted( async() => {
  // 博客浏览量+1
  await incrementViewCount()
  // 展示博客详情
  await showBlogDetail(BlogId)

  getLikeAndStarStatus()
})
// 获取博客详情
const showBlogDetail = async (id) => {
  request.get('/user/blog/'+id,{
  }).then((res) => {
    blog.value = res.data
    userId.value = res.data.userId
    verifyIfIsMyself()
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
  })
  .catch((err) => {
    console.log(err)
  })
}
// 博客点赞量+1
const incrementStarCount = async () => {
  request.post('/user/blog/incrementStarCount/'+BlogId, {})
  .then((res) => {
    ElMessage.success('点赞成功')
  })
  .catch((err) => {
    console.log(err)
  })
}
// 获取点赞收藏状态
const getLikeAndStarStatus = async () =>{
  request.get('/user/blog/getStatusOfLikeAndStar/'+BlogId, {})
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
}
</script>

<style scoped lang="scss">
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
  height: calc(100vh - 60px);
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
</style>