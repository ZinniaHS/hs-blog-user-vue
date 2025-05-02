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
const registerForm = ref(null);
let countdownTimer = null;

// 验证规则
const rules = reactive({
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { validator: checkEmail, trigger: ['blur', 'change'] }
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
function checkEmail(rule, value) {
  return new Promise(async (resolve, reject) => {
    if (!value) return resolve()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return reject('邮箱格式不正确')
    }
  })
}
// 密码强度检查
function checkPasswordStrength(rule, value) {
  return new Promise((resolve, reject) => {
    if (!value) return resolve()
    const strength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value)
    passwordStrength.value = strength ? 3 :
        /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value) ? 2 : 1
    if (strength) {
      resolve()
    } else {
      reject('建议使用大小写字母+数字的组合（至少6位）')
    }
  })
}
// 确认密码验证
function checkConfirmPassword(rule, value) {
  return new Promise((resolve, reject) => {
    if (!value || value === form.password) {
      resolve()
    } else {
      reject('两次输入的密码不一致')
    }
  })
}
// 发送验证码
const handleSendCaptcha = async () =>   {
  try {
    // 先验证邮箱是否被注册
    const res1 = await request.post('/user/verifyEmail', null, {
      params: { email: form.email }
    });
    console.log(res1)
    if (res1.code === 0){
      ElMessage.error(res1.msg)
      return false
    }
    // 发送验证码
    ElMessage.info("尝试发送验证码，请稍候...")
    const valid = await registerForm.value.validateField('email')
    console.log(valid)
    isSending.value = true
    countdown.value = 60
    startCountdown()
    const res = await request.post('/user/sendCaptcha', null, {
      params: { email: form.email }
    })
    if (res.code === 1) {
      ElMessage.success(res.data)
    } else
      captchaError.value = res.msg
  } catch (error) {
    captchaError.value = typeof error === 'string' ? error : (error.response?.data?.msg || '邮箱验证未通过')
  }
}
// 验证码倒计时
function startCountdown() {
  isSending.value = true
  countdown.value = 60
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      isSending.value = false
      countdown.value = 0
    }
  }, 1000)
}
// 提交注册
const handleRegister = async () => {
  loading.value = true
  try {
    await registerForm.value.validate()
    const res = await request.post('/user/register', {
      ...form,
      password: form.password
    })
    console.log(res)
    if(res.code === 1) {
      ElMessage.success(res.data)
      router.push('/login')

    }else{
      ElMessage.error(res.msg)
    }
  } catch (error) {
    let msg = '注册失败'
    if (error?.response?.data?.msg) {
      msg = error.response.data.msg
    } else if (typeof error === 'string') {
      msg = error
    }
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
// 表单有效性计算
const isFormValid = computed(() => {
  if (!registerForm.value) return false;
  return registerForm.value.fields.every(
      field => field.validateState === 'success'
  );
});

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