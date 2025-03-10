// src/utils/request.js
import axios from 'axios';
import { unref } from 'vue';
import { ElMessageBox } from 'element-plus/es';
import { API_BASE_URL, LAYOUT_PATH } from '@/config/setting';
import router from '@/router';
import { getToken } from './token-util';
import { logout, toURLSearch } from './common';
import { toSnakeCase, toCamelCase } from './caseConverter';

/** 创建axios实例 */
const service = axios.create({
  baseURL: API_BASE_URL
});

/**
 * 添加请求拦截器
 */
service.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = toSnakeCase(config.data);
    }
    if (config.params) {
      config.params = toSnakeCase(config.params);
    }
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }
    if (config.method === 'get' && config.params) {
      config.url = toURLSearch(config.params, config.url);
      config.params = {};
    }
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(new Error('网络错误'));
  }
);

/**
 * 添加响应拦截器
 */
service.interceptors.response.use(
  (res) => {
    if (res.data) {
      res.data = toCamelCase(res.data);
    }
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
