<template>
  <div class="profile-edit">
    <!-- 骨架屏 -->
    <el-card v-if="loading" class="skeleton-card">
      <template #header>
        <div class="skeleton-header"></div>
      </template>
      <div class="skeleton-content">
        <div class="skeleton-form">
          <div class="skeleton-form-item" v-for="i in 5" :key="i">
            <div class="skeleton-label"></div>
            <div class="skeleton-input"></div>
          </div>
          <div class="skeleton-form-item">
            <div class="skeleton-label"></div>
            <div class="skeleton-avatar">
              <div class="skeleton-avatar-placeholder"></div>
            </div>
          </div>
          <div class="skeleton-form-item">
            <div class="skeleton-label"></div>
            <div class="skeleton-textarea"></div>
          </div>
          <div class="skeleton-buttons">
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 实际内容 -->
    <el-card v-else class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料编辑</span>
        </div>
      </template>

      <el-form
          ref="profileFormRef"
          :model="userDetailDTO"
          :rules="profileRules"
          label-width="120px"
          size="large"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userDetailDTO.username" placeholder="请输入用户名" />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userDetailDTO.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userDetailDTO.phone" placeholder="请输入手机号" />
        </el-form-item>

        <!-- 头像 -->
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              accept="image/*"
          >
            <img v-if="userDetailDTO.avatarUrl" :src="userDetailDTO.avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 个人简介 -->
        <el-form-item label="个人简介" prop="description">
          <el-input
              v-model="userDetailDTO.description"
              type="textarea"
              :rows="3"
              placeholder="请输入个人简介"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveChange">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from "vue-router";
import { ElMessage } from 'element-plus';
import router from "@/router/index.js";
import request from "@/utils/request.js";

// 加载状态
const loading = ref(true);

// 上传头像请求连接
const uploadUrl = 'http://localhost:8080/common/upload'

// 用户id
const userId = useRoute().query.id
// 表单引用
const profileFormRef = ref();

// 表单数据
const userDetailDTO = ref({
  username: '',
  password: '',
  email: '',
  avatarUrl: '',
  description: '',
  phone: ''
});

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 提交表单
const saveChange = () => {
  profileFormRef.value?.validate((valid) => {
    if (valid) {
      request.put('/user', {
        id: userId,
        username: userDetailDTO.value.username,
        avatarUrl: userDetailDTO.value.avatarUrl,
        description: userDetailDTO.value.description,
        phone: userDetailDTO.value.phone,
      }).then((res) => {
        ElMessage.success('保存成功！');
      })
    } else {
      return false;
    }
  });
};

// 重置表单
const resetForm = () => {
  profileFormRef.value?.resetFields();
};

// 头像上传成功提示
const handleUploadSuccess = (response: any) => {
  console.log(response)
  userDetailDTO.value.avatarUrl = response.data;
  ElMessage.success('上传成功');
};
// 头像上传失败
const handleUploadError = (err: any) => {
  console.error('上传失败:', err);
  ElMessage.error('上传失败，请重试');
};

// 上传前认证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }

  return true;
};

// 添加上传请求头
const uploadHeaders = computed(() => {
  // 从本地存储获取 token，根据你的实际认证方式调整
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
});

// 初始化
onMounted(async () => {
  try {
    await getUserDetail();
  } catch (error) {
    console.error('加载用户数据失败:', error);
    ElMessage.error('加载用户数据失败');
  } finally {
    loading.value = false;
  }
});

// 获取用户信息
const getUserDetail = async () => {
  return new Promise((resolve, reject) => {
    request.get('/user/getUserDetail', {
      params: {
        id: userId
      }
    }).then((res) => {
      console.log(res);
      userDetailDTO.value = res.data;
      resolve(res);
    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  });
};
</script>

<style scoped>
.profile-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader-icon:hover {
  border-color: var(--el-color-primary);
}

/* 骨架屏样式 */
.skeleton-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.skeleton-header {
  height: 24px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  margin: 15px;
  border-radius: 4px;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.skeleton-form-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.skeleton-label {
  width: 120px;
  height: 24px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-input {
  flex: 1;
  height: 40px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-avatar {
  flex: 1;
  display: flex;
}

.skeleton-avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 50%;
}

.skeleton-textarea {
  flex: 1;
  height: 80px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 4px;
}

.skeleton-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-left: 140px;
  margin-top: 20px;
}

.skeleton-button {
  width: 120px;
  height: 40px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
  border-radius: 20px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}
</style>