import axios from 'axios';
import { unref } from 'vue';
import { ElMessageBox } from 'element-plus/es';
import { API_BASE_URL, LAYOUT_PATH } from '@/config/setting';
import router from '@/router';
import { getToken } from './token-util';
import { logout, toURLSearch } from './common';
import { toSnakeCase, toCamelCase } from './caseConverter';

/** 创建 axios 实例 */
const service = axios.create({
  baseURL: API_BASE_URL
});

/**
 * 添加请求拦截器
 * 主要用于：
 * 1. 将请求参数转换为 `snake_case`，适配后端接口
 * 2. 在请求头中自动附加 Token
 * 3. 处理 GET 请求的 URL 参数
 */
service.interceptors.request.use(
  (config) => {
    // 转换请求体中的字段为 snake_case
    if (config.data) {
      console.log('🔹 请求体转换前 (toSnakeCase):', config.data);
      config.data = toSnakeCase(config.data);
      console.log('🔹 请求体转换后 (toSnakeCase):', config.data);
    }
    // 转换查询参数为 snake_case
    if (config.params) {
      console.log('🔹 查询参数转换前 (toSnakeCase):', config.params);
      config.params = toSnakeCase(config.params);
      console.log('🔹 查询参数转换后 (toSnakeCase):', config.params);
    }
    // 读取 Token 并设置到请求头
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }
    // 处理 GET 请求，确保参数拼接在 URL 上
    if (config.method === 'get' && config.params) {
      config.url = toURLSearch(config.params, config.url);
      config.params = {};
    }
    return config;
  },
  (error) => {
    console.error('❌ 请求错误:', error);
    return Promise.reject(new Error('网络错误'));
  }
);

/**
 * 添加响应拦截器
 * 主要用于：
 * 1. 将所有返回数据字段转换为 `camelCase`
 * 2. 处理 `401`（未授权）错误，自动触发登出
 * 3. 记录响应数据，便于调试
 */
service.interceptors.response.use(
  (res) => {
    if (res.data) {
      console.log('🔹 响应数据转换前 (toCamelCase):', res.data);
      res.data = toCamelCase(res.data);
    }
    console.log('🔹 响应数据转换后 (toCamelCase):', res.data);
    if (res.data?.code === 401) {
      const { path, fullPath } = unref(router.currentRoute);
      if (path == LAYOUT_PATH) {
        logout(true, void 0, router.push);
      } else if (path !== '/login') {
        ElMessageBox.close();
        ElMessageBox.alert('登录状态已过期, 请退出重新登录!', '系统提示', {
          confirmButtonText: '重新登录',
          callback: (action) => {
            if (action === 'confirm') {
              logout(false, fullPath);
            }
          },
          type: 'warning',
          draggable: true
        });
      }
      return Promise.reject(new Error(res.data.message));
    }
    return res;
  },
  (error) => {
    console.error(error);
    return Promise.reject(new Error('网络错误'));
  }
);

export default service;
