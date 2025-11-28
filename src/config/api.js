import axios from 'axios';

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yijing_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response;

      if (status === 401) {
        // 未授权，清除token
        localStorage.removeItem('yijing_token');
        localStorage.removeItem('yijing_user');
        window.location.href = '/';
      }

      return Promise.reject(data.message || '请求失败');
    } else if (error.request) {
      // 请求发送失败
      return Promise.reject('网络连接失败');
    } else {
      return Promise.reject(error.message || '未知错误');
    }
  }
);

export default apiClient;
