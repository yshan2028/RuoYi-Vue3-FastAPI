/**
 * axios实例
 */
import axios from 'axios';
import { unref } from 'vue';
import { ElMessageBox } from 'element-plus/es';
import { API_BASE_URL, LAYOUT_PATH } from '@/config/setting';
import router from '@/router';
import { getToken, setToken } from './token-util';
import { logout, toURLSearch } from './common';
import _ from 'lodash'; // 引入 lodash（更稳定的 `camelCase` / `snakeCase` 处理）

/** 创建axios实例 */
const service = axios.create({
  baseURL: API_BASE_URL
});

/**
 * 递归转换 `camelCase` ⇄ `snake_case`
 * @param {Object} obj 需要转换的对象
 * @param {Function} convertFn 转换函数（_.camelCase / _.snakeCase）
 */
function transformKeys(obj, convertFn) {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' ? transformKeys(item, convertFn) : item
    );
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[convertFn(key)] =
        value === null || value === undefined ? value : transformKeys(value, convertFn);
      return acc;
    }, {});
  }
  return obj;
}

/**
 * 添加请求拦截器
 */
service.interceptors.request.use(
  (config) => {
    // 添加token到header
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }

    // **避免转换特殊数据类型**
    if (
      config.data &&
      !(config.data instanceof FormData) &&
      !(config.data instanceof URLSearchParams) &&
      !config.url.includes('/graphql') // 排除 GraphQL API
    ) {
      config.data = transformKeys(config.data, _.snakeCase);
    }
    if (config.params) {
      config.params = transformKeys(config.params, _.snakeCase);
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
    // 登录过期处理
    if (res.data?.code === 401) {
      const { path, fullPath } = unref(router.currentRoute);
      if (path === LAYOUT_PATH) {
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

    // 续期token
    const newToken = res.headers['authorization'];
    if (newToken) {
      setToken(newToken);
    }

    // **只转换 JSON 数据，避免影响文件下载**
    if (
      res.data &&
      res.headers['content-type']?.includes('application/json')
    ) {
      res.data = transformKeys(res.data, _.camelCase);
    }

    return res;
  },
  (error) => {
    console.error(error);
    return Promise.reject(new Error('网络错误'));
  }
);

export default service;
