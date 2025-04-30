<template>
  <div class="auth-container">
    <el-form :model="form" :rules="rules" ref="loginForm" class="auth-form">
      <h2 class="auth-title">用户登录</h2>

      <!-- 邮箱验证 -->
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="el-icon-message">
        </el-input>
        <div v-if="emailError" class="error-msg">{{ emailError }}</div>
      </el-form-item>

      <!-- 密码验证 -->
      <el-form-item prop="password" label="密码">
        <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
        >
        </el-input>
        <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>
      </el-form-item>

      <el-form-item>
        <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
            :disabled="!formValid"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>

      <div class="auth-tips">
        <p>还没有账号？ <el-link @click="$router.push('/register')">立即注册</el-link></p>
        <p>忘记密码？ <el-link @click="showResetDialog = true">重置密码</el-link></p>
      </div>

      <!-- 忘记密码弹窗 -->
      <el-dialog v-model="showResetDialog" title="重置密码">
        <reset-password-form @success="handleResetSuccess"/>
      </el-dialog>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import router from '@/router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 表单数据
const form = reactive({
  email: '',
  password: ''
})

// 验证状态
const emailError = ref('')
const passwordError = ref('')
const loading = ref(false)
const showResetDialog = ref(false)

// 表单验证规则
const rules = reactive({
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur', 'change']
    },
    {
      validator: async (rule, value) => {
        if (!value) return
        try {
          const res = await request.post('/user/verifyEmail', { email: value })
          if (!res.data.success) {
            emailError.value = '邮箱未注册'
          }
        } catch (err) {
          emailError.value = err.response?.data?.msg || '邮箱验证失败'
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

// 表单有效性计算属性
const formValid = computed(() => {
  return !emailError.value && !passwordError.value &&
      form.email.trim() !== '' && form.password.trim() !== ''
})

// 登录处理
const handleLogin = async () => {
  try {
    // 表单验证
    await loginForm.value.validate()

    loading.value = true
    const res = await request.post('/user/login', {
      email: form.email,
      password: form.password
    })

    // 存储用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('email', form.email)

    ElMessage.success('登录成功')
    router.push(router.currentRoute.value.query.redirect || '/user/home')
  } catch (error) {
    const msg = error.response?.data?.msg || '登录失败'
    if (error.response?.status === 401) {
      ElMessage.error('邮箱或密码错误')
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
}

.error-msg {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.auth-tips {
  margin-top: 20px;
  text-align: center;
  color: #909399;
}

.auth-tips p {
  margin: 8px 0;
}
</style>