<template>
  <div class="profile-edit">
    <el-card class="profile-card">
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

<!--        &lt;!&ndash; 密码 &ndash;&gt;-->
<!--        <el-form-item label="密码" prop="password">-->
<!--          <el-input-->
<!--              v-model="userDetailDTO.password"-->
<!--              type="password"-->
<!--              placeholder="请输入密码（不修改请留空）"-->
<!--          />-->
<!--        </el-form-item>-->

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
import {ref, onMounted, reactive, computed} from 'vue';
import {useRoute} from "vue-router";
import { ElMessage } from 'element-plus';
import router from "@/router/index.js";
import request from "@/utils/request.js";

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
// 初始化
onMounted(async () => {
  await getUserDetail()
})

// 获取用户信息
const getUserDetail = (()=>{
  request.get('/user/getUserDetail', {
    params:{
      id: userId
    }
  }).then((res) => {
    console.log(res)
    userDetailDTO.value = res.data;
  });
})
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

</style>