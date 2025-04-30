<template>
  <div class="auth-container">
    <el-form :model="form" :rules="rules" ref="registerForm" class="auth-form">
      <h2 class="auth-title">用户注册</h2>

      <!-- 邮箱 -->
      <el-form-item prop="email">
        <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            @blur="handleEmailBlur"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
        <div v-if="emailStatus === 'validating'" class="validating">验证中...</div>
        <div v-if="emailError" class="error-msg">{{ emailError }}</div>
      </el-form-item>

      <!-- 验证码 -->
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
              @click="handleSendCaptcha"
              style="width: 40%; margin-left: 10px"
          >
            {{ isSending ? `${countdown}s后重发` : '获取验证码' }}
          </el-button>
        </div>
        <div v-if="captchaError" class="error-msg">{{ captchaError }}</div>
      </el-form-item>

      <!-- 密码 -->
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

      <!-- 确认密码 -->
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
            :disabled="!formValid"
        >
          {{ loading ? '注册中...' : '立即注册' }}
        </el-button>
      </el-form-item>

      <div class="auth-tips">
        <p>已有账号？ <el-link @click="$router.push('/login')">立即登录</el-link></p>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import router from '@/router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import {Message, Key} from "@element-plus/icons-vue";

// 表单数据
const form = reactive({
  email: '',
  captcha: '',
  password: '',
  confirmPassword: ''
})

// 状态管理
const loading = ref(false)
const isSending = ref(false)
const countdown = ref(0)
const emailStatus = ref('') // validating/success/error
const emailError = ref('')
const captchaError = ref('')
const passwordStrength = ref(0)

// 验证规则
const rules = reactive({
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { validator: checkEmail, trigger: 'blur' }  // 改用自定义验证器
  ],
  captcha: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { validator: checkPasswordStrength, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: checkConfirmPassword, trigger: 'blur' }
  ]
})

// 自定义邮箱验证函数
async function checkEmail(rule, value) {
  if (!value) return
  // 格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return '邮箱格式不正确'
  }
  // 异步验证邮箱是否存在
  try {
    const res = await request.post('/user/verifyEmail', { email: value })
    console.log(res)
    if (res.code===0) {
      ElMessage.error(res.data)
      return '邮箱已被注册'
    }
  } catch (error) {
    return '邮箱验证失败'
  }
  return true
}

// 密码强度检查
function checkPasswordStrength(rule, value) {
  // 正则表达式必须用 / 包裹
  const strength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value)

  // 密码强度判断逻辑
  passwordStrength.value = strength ? 3 :
      // 检查是否满足基本要求（至少6位，包含小写字母和数字）
      /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value) ? 2 : 1

  if (strength) {
    return true
  }
  return '建议使用大小写字母+数字的组合（至少6位）'
}

// 确认密码验证
function checkConfirmPassword(rule, value) {
  if (value !== form.password) {
    return '两次输入的密码不一致'
  }
  return true
}

// 发送验证码
const handleSendCaptcha = async () => {
  try {
    // 手动触发邮箱验证
    console.log(form.email)
    const validateResult = await checkEmail({}, form.email)
    if (validateResult !== true) {
      captchaError.value = validateResult
      return
    }

    isSending.value = true
    countdown.value = 60

    const res = await request.post('/user/sendCaptcha', null,{
      params:{
        email: form.email
      }
    })
    console.log(res)
    if (res.data.code === 200) {
      ElMessage.success('验证码已发送')
      startCountdown()
    }
  } catch (error) {
    captchaError.value = error.response?.data?.msg || '验证码发送失败'
  } finally {
    isSending.value = false
  }
}

// 验证码倒计时
function startCountdown() {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 提交注册
const handleRegister = async () => {
  try {
    await registerForm.value.validate()

    loading.value = true
    const res = await request.post('/user/register', {
      ...form,
      password: form.password // 确保密码字段正确
    })

    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    const msg = error.response?.data?.msg || '注册失败'
    if (error.response?.status === 400) {
      if (error.response.data.field === 'email') {
        emailError.value = '邮箱已被注册'
      } else {
        captchaError.value = msg
      }
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 完全继承Login.vue的样式 */
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

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}

.el-button {
  width: 100%;
  font-weight: 500;
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

/* 密码强度条调整 */
.password-strength {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.password-strength span {
  width: 30px;
  height: 4px;
  background: #eee;
  margin-right: 4px;
  transition: all 0.3s;
}

.password-strength span.active {
  background: #409eff;
  height: 2px;
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  gap: 10px;
}

/* 加载状态 */
.el-button.is-disabled {
  opacity: 0.8;
}
</style>