<template>
  <div class="auth-container">
    <el-form :model="form" :rules="rules" ref="loginForm" class="auth-form">
      <h2 class="auth-title">用户登录</h2>
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名">
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await loginForm.value.validate()
    loading.value = true
    const res = await request.post('/auth/login', form.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', form.value.username)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/user/home'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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