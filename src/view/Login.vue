<template>
  <div class="auth-container">
    <!--  直接返回主页  -->
    <el-tooltip content="返回hs-blog" placement="bottom" effect="light">
      <div
          class="auth-header"
          @click="$router.push('/')"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
      >
        <el-icon :size="20" color="#409EFF"><ArrowLeft /></el-icon>
        <span class="header-text">hs-blog</span>
      </div>
    </el-tooltip>

    <el-form :model="form" :rules="rules" ref="loginForm" class="auth-form">
      <h2 class="auth-title">用户登录</h2>
      <el-form-item prop="email">
        <el-input v-model="form.email" placeholder="用户名">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码">
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">登录</el-button>
      </el-form-item>
      <div class="auth-tips">
        <p>还没有账号？ <el-link @click="$router.push('/register')">立即注册</el-link></p>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {useRouter, useRoute} from 'vue-router'
import router from '@/router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const routerInstance = useRouter()
const route = useRoute()
// 获取来源路径
const redirectPath = computed(() =>
    decodeURIComponent(route.query.redirect || '/')
)

const showTooltip = ref(false)
const loginForm = ref(null)
const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const rules = {
  email: [{ required: true, message: '请输入注册邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await loginForm.value.validate()
    loading.value = true
    const res = await request.post('/user/login', form.value)
    console.log(res)
    if(res.code === 1) {
      localStorage.setItem('token', res.data)
      localStorage.setItem('email', form.value.email)
      ElMessage.success('登录成功')
      router.push(redirectPath.value)
    }else
      ElMessage.error(res.msg)
  } catch (error) {
    console.log(error)
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

.auth-container {
  position: relative; /* 为绝对定位提供参照 */
  min-height: 100vh;
}

.auth-header {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
}

.auth-header:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
}

.header-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.auth-form {
  width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.auth-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.auth-tips {
  margin-top: 20px;
  text-align: center;
  color: #909399;
}

.auth-tips p {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
</style>