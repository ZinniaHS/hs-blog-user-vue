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
    <el-menu-item index="0" @click="router.push('../user/home')">
      <img
          style="width: 100px"
          src=""
          alt="Element logo"
      />
    </el-menu-item>
    <el-menu-item index="1" @click="router.push('../user/blog')">博客区</el-menu-item>
    <el-menu-item index="2" @click="router.push('../user/book')">图书馆</el-menu-item>
    <div class="flex-grow" />
    <el-sub-menu index="3">
      <template #title>欢迎您</template>
      <el-menu-item index="3-1">个人中心</el-menu-item>
      <el-menu-item index="3-2">退出登录</el-menu-item>
    </el-sub-menu>
  </el-menu>
  <!-- 中间内容区 -->
  <div>
    <router-view/>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import router from '@/router';

const activeIndex = computed(() =>
    router.currentRoute.value.meta.menuIndex || '0'
)
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
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


</style>
