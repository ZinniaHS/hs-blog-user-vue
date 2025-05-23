import axios from "axios"
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout:30000,//后台接口超时时间
    headers: {
        'Accept': 'application/json' // 明确声明接受 JSON
    }
})
//request 拦截器
//可以在请求发送前对请求做一些处理
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

//response 拦截器
//可以在接口响应后统一处理结果
request.interceptors.response.use(
    (response) => {
        let res = response.data;
        // 处理字符串转 JSON（如后端返回字符串形式的 JSON）
        if (typeof res === 'string') {
            try {
                res = JSON.parse(res);
            } catch (err) {
                console.error('解析响应数据失败:', err);
                return Promise.reject(new Error('数据解析异常'));
            }
        }
        return res;
    },
    (error) => {
        if (error.response?.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true
                // 这里应该实现token刷新逻辑，暂时直接跳转登录
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                localStorage.removeItem('username')
                localStorage.removeItem('avatarUrl')
                localStorage.removeItem('email')
                ElMessage.error('身份验证失效，请重新登录')
                const currentPath = router.currentRoute.value.fullPath
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
            }
            return Promise.reject(error)
        } else if (error.response?.status === 403) {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            localStorage.removeItem('avatarUrl')
            localStorage.removeItem('email')
            ElMessage.error('身份验证失效，请重新登录')
            router.push('/login')
        }
        else if (error.response?.status === 500) {
            ElMessage.error('系统异常');
        }
        return Promise.reject(error);
    }
);

export default request;