<template>
  <el-menu
      class="custom-nav"
      :default-active="activeIndex"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
      background-color="#fff"
      text-color="#333"
  >
    <el-menu-item index="0" @click="router.push('/user/home')">
      <img
          style="width: 40px"
          src="../statics/images/brand.jpg"
          alt="hs-blog"
      />
    </el-menu-item>
    <el-menu-item index="1" @click="router.push('/user/blog')">博客区</el-menu-item>
    <el-menu-item index="2" @click="router.push('/user/book')">图书馆</el-menu-item>
    <div class="flex-grow" />

    <!-- 登录状态导航 -->
    <template v-if="isLoggedIn">
      <el-sub-menu index="3">
          <template #title>
            <span class="welcome-text">欢迎您，{{ username }}</span>
            <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="用户头像"
                class="user-avatar"
            >
          </template>
        <el-menu-item index="3-1" @click="toProfile">个人中心</el-menu-item>
        <el-menu-item index="3-2" @click="handleLogout">退出登录</el-menu-item>
      </el-sub-menu>
    </template>

    <!-- 未登录状态导航 -->
    <template v-else>
      <el-menu-item index="4" @click="router.push('/login')">登录</el-menu-item>
      <el-menu-item index="5" @click="router.push('/register')">注册</el-menu-item>
    </template>
  </el-menu>
  <!-- 中间内容区 -->
  <div>
    <router-view/>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import router from '@/router';
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import {ElMessage} from "element-plus";

// 登录状态判断
const isLoggedIn = computed(() => localStorage.getItem('token') !== null)
const username = computed(() => localStorage.getItem('username') || '访客')
const avatarUrl = computed(() => localStorage.getItem('avatarUrl'))
// 退出登录逻辑
const handleLogout =  () => {
  try {
    // 调用后端退出接口（假设接口路径为 /api/auth/logout）
    request.post('/user/logout', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('avatarUrl')
      localStorage.removeItem('email')
      if(res.code === 1)
        ElMessage.success(res.data)
      else
        ElMessage.error(res.msg)
    })
    router.push('/login')
  }catch (error) {
    console.error('退出失败:', error)
    // 异常情况下仍清理本地状态
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('avatarUrl')
    localStorage.removeItem('email')
    router.push('/login')
  }

}
// 激活当前选中的栏目
const activeIndex = computed(() =>
    router.currentRoute.value.meta.menuIndex || '0'
)
const handleSelect = (key: string) => {
  const pathMap = {
    '0': '/user/home',
    '1': '/user/blog',
    '2': '/user/book',
    '3-1': '/user/profile',
    '4': '/login',
    '5': '/register'
  }
  router.push(pathMap[key] || '/user/home')
}
// 去个人详情页
const toProfile = () =>{
  router.push({
    name: 'userProfile',
    query: {
      id: localStorage.getItem('userId')
    }
  })
}
</script>

<style scoped>
.user-avatar {
  width: 40px;
  border-radius: 50%;
  margin-left: 10px;
  object-fit: fill;
}

.welcome-text {
  font-weight: 500;
}

/* 调整原有样式以适配新元素 */
.el-sub-menu .el-menu-item {
  padding-left: 30px; /* 增加左侧间距 */
}

.flex-grow {
  flex-grow: 1;
}

.custom-nav {
  border-radius: 12px; /* 圆角大小 */
  overflow: hidden; /* 隐藏超出圆角的内容 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  margin: 10px; /* 可选：添加外边距 */
}

/* 调整菜单项样式 */
.custom-nav .el-menu-item {
  padding: 0 20px; /* 调整菜单项间距 */
}

/* 调整下拉菜单样式 */
.custom-nav .el-sub-menu .el-menu {
  border-radius: 0 0 12px 12px; /* 匹配父级圆角 */
  border: none; /* 移除默认边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加下拉阴影 */
}

/* 调整logo图片大小（可选） */
.custom-nav img {
  height: 40px;
  vertical-align: middle;
}

.flex-grow {
  flex-grow: 1;
}

.custom-nav {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

/* 菜单项悬停效果 */
.custom-nav .el-menu-item:hover {
  background-color: #f5f7fa !important;
}

/* 用户菜单样式 */
.custom-nav .el-sub-menu {
  top: 60px !important;
}

/* 登录注册按钮样式 */
.el-menu-item:not(.is-active) {
  color: #409eff !important;
  transition: all 0.3s;
}

.el-menu-item:not(.is-active):hover {
  color: #fff !important;
  background-color: #409eff !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-menu {
    flex-wrap: wrap;
  }

  .flex-grow {
    display: none;
  }

  .el-menu-item {
    width: 100% !important;
    text-align: center;
  }
}

</style>
