<template>
  <div class="auth-container">
    <el-form :model="form" :rules="rules" ref="registerForm" class="auth-form">
      <h2 class="auth-title">用户注册</h2>

      <!-- 邮箱验证部分 -->
      <el-form-item prop="email">
        <el-input
            v-model="form.email"
            placeholder="请输入注册邮箱"
            @blur="handleEmailBlur"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
        <div class="auth-tips" v-if="emailStatus === 'error'">
          <el-alert
              title="该邮箱已被注册"
              type="error"
              :closable="false"
              show-icon
          />
        </div>
      </el-form-item>

      <!-- 验证码部分 -->
      <el-form-item prop="captcha">
        <div class="captcha-container">
          <el-input
              v-model="form.captcha"
              placeholder="验证码"
              style="width: 60%"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <el-button
              :disabled="isSending"
              @click="sendCaptcha"
              style="width: 40%; margin-left: 10px"
          >
            {{ isSending ? `${countdown}s后重发` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <!-- 密码部分 -->
      <el-form-item prop="password">
        <el-input
            v-model="form.password"
            type="password"
            placeholder="设置登录密码"
            show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认登录密码"
            show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
        >
          立即注册
        </el-button>
      </el-form-item>

      <div class="auth-tips">
        <p>已有账号？ <el-link @click="$router.push('/login')">立即登录</el-link></p>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 表单数据
const form = reactive({
  email: '',
  captcha: '',
  password: '',
  confirmPassword: ''
})

// 验证规则
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur', 'change']
    },
    {
      validator: (_, v) => {
        // 自定义邮箱唯一性校验
        return new Promise((resolve, reject) => {
          if (v === 'test@example.com') {
            reject('该邮箱已被注册')
          } else {
            resolve()
          }
        })
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (_, v) => v === form.password, message: '两次输入不一致', trigger: 'blur' }
  ]
})

// 状态管理
const loading = ref(false)
const isSending = ref(false)
const countdown = ref(0)
const emailStatus = ref('') // success/error

// 发送验证码
const sendCaptcha = async () => {
  console.log(emailStatus.value)
  try {
    // await rules.email[0].validator(null, form.email) // 手动触发邮箱验证
    if (emailStatus.value === 'error') return

    isSending.value = true
    countdown.value = 60

    // 模拟发送验证码
    const mockCode = Math.floor(100000 + Math.random() * 900000)
    console.log('验证码已发送（测试用）:', mockCode)

    // 启动倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isSending.value = false
      }
    }, 1000)

    // 实际项目中这里应该调用真实接口
    ElMessage.success('验证码已发送至您的邮箱')

  } catch (error) {
    console.error('验证码发送失败:', error)
  }
}

// 邮箱验证处理
const handleEmailBlur = async () => {
  try {
    // 使用Element Plus的验证方法
    await new Promise((resolve, reject) => {
      const validate = async () => {
        try {
          await rules.email[2].validator(null, form.email)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      validate()
    })
    emailStatus.value = 'success'
  } catch (error) {
    emailStatus.value = 'error'
    ElMessage.error(error)
  }
}

// 提交注册
const handleRegister = async () => {
  try {
    await registerForm.value.validate()
    loading.value = true

    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 800))

    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    if (error.response?.data?.code === 'EMAIL_EXISTS') {
      emailStatus.value = 'error'
    } else {
      ElMessage.error(error.response?.data?.msg || '注册失败')
    }
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

.captcha-container {
  display: flex;
  gap: 10px;
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

/* 新增样式 */
.el-input {
  width: 100%;
}

.captcha-container .el-input {
  width: 60%;
}
</style>