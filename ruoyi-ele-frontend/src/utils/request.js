/**
 * axios实例
 */
import axios from 'axios';
import { unref } from 'vue';
import { ElMessageBox } from 'element-plus/es';
import { API_BASE_URL, LAYOUT_PATH } from '@/config/setting';
import router from '@/router';
import { getToken } from './token-util';
import { logout } from './common';

// 创建 axios 实例
const service = axios.create({
  baseURL: API_BASE_URL
});

/**
 * 递归转换 `camelCase` ⇄ `snake_case`
 * @param {Object} obj 需要转换的对象
 * @param {Boolean} toSnake 是否转换为 `snake_case`
 */
function transformKeys(obj, toSnake = true) {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, toSnake));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const transformedKey = toSnake
        ? key.replace(/([A-Z])/g, '_$1').toLowerCase() // `camelCase` → `snake_case`
        : key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()); // `snake_case` → `camelCase`

      acc[transformedKey] = transformKeys(obj[key], toSnake);
      return acc;
    }, {});
  }
  return obj;
}

/**
 * 请求拦截器：自动转换 `camelCase` → `snake_case`
 */
service.interceptors.request.use(
  (config) => {
    // 添加 token 到 header
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = token;
    }

    // 直接转换 `params` 和 `data`，不区分 `GET` / `POST` / `PUT` / `DELETE`
    if (config.params) {
      config.params = transformKeys(config.params, true);
    }
    if (config.data) {
      config.data = transformKeys(config.data, true);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器：自动转换 `snake_case` → `camelCase`
 */
service.interceptors.response.use(
  (response) => {
    // 登录过期处理
    if (response.data?.code === 401) {
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
      return Promise.reject(new Error(response.data.msg));
    }

    // 直接转换后端返回的数据
    if (response.data) {
      response.data = transformKeys(response.data, false);
    }

    return response;
  },
  (error) => Promise.reject(error)
);

export default service;
