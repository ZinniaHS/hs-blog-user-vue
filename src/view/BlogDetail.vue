<template>
  <div class="blog-detail-container">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- 博主信息区域 -->
      <el-affix :offset-top="0">
        <div class="author-info">
          <div class="author-avatar-name">
            <img class="avatar" src="https://via.placeholder.com/50" alt="博主头像">
            <h3 class="name">cuiqwei</h3>
          </div>
          <div class="stats">
            <div class="stat-item"><span class="number">23</span>原创</div>
            <div class="stat-item"><span class="number">3879</span>点赞</div>
            <div class="stat-item"><span class="number">2万+</span>收藏</div>
            <div class="stat-item"><span class="number">2084</span>粉丝</div>
          </div>
          <el-button class="follow-btn" type="primary">+ 关注</el-button>
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
          <span class="author-name">cuiqwei</span>
          <span class="publish-time">已于 2023-11-23 18:24:45 发布</span>
          <span class="views-count">阅读量10w+</span>
          <span class="likes-count">收藏 1.9w</span>
          <span class="comments-count">点赞数 3.2k</span>
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
              <img class="small-avatar" src="https://via.placeholder.com/30" alt="博主头像">
              <span class="author-name">cuiqwei</span>
            </div>
            <div class="interaction-buttons">
              <el-button type="primary" icon="el-icon-thumb" circle></el-button>
              <el-button icon="el-icon-message" circle></el-button>
              <el-button icon="el-icon-share" circle></el-button>
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

// 从路由中获得博客id
const BlogId = useRoute().query.id
// 图书详情
const blog = ref({
  title: '',
  subtitle: '',
})
// 初始化
onMounted(() => {
  console.log(BlogId)
  showBlogDetail(BlogId)
})

const showBlogDetail = async (id) => {
  request.get('/user/blog/'+id,{
  }).then((res) => {
    blog.value = res.data
    console.log(blog.value)
  })
}

</script>

<style scoped lang="scss">
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
      position: absolute;
      width: calc(100% - 20px * 2); // 减去左右padding
      bottom: 0;
      left: 20px;  // 对齐父容器padding-left
      right: 20px; // 对齐父容器padding-right
      padding: 10px 0; // 保持内部间距
      margin: -20 -20px; // 抵消父容器padding
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
        display: flex;

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