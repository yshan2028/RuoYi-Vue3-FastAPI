import { removeToken } from '@/utils/token-util';

/**
 * 退出登录
 * @param route 是否使用路由跳转
 * @param from 登录后跳转的地址
 * @param push 路由跳转方法
 */
export function logout(route, from, push) {
  removeToken();
  if (route && push) {
    push({
      path: '/login',
      query: from ? { from: encodeURIComponent(from) } : void 0
    });
    return;
  }
  // 这样跳转避免再次登录重复注册动态路由, hash 路由模式使用 location.reload();
  const BASE_URL = import.meta.env.BASE_URL;
  const url = BASE_URL + 'login';
  location.replace(from ? `${url}?from=${encodeURIComponent(from)}` : url);
}

/**
 * 下载文件
 * @param data 二进制数据
 * @param name 文件名
 * @param type 文件类型
 */
export function download(data, name, type) {
  const blob = new Blob([data], { type: type || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 参数转url字符串
 * @param params 参数
 * @param url 需要拼接参数的地址
 */
export function toURLSearch(params, url) {
  if (typeof params !== 'object' || params == null) {
    return '';
  }
  const result = transformParams(params)
    .map((d) => `${encodeURIComponent(d[0])}=${encodeURIComponent(d[1])}`)
    .join('&');
  if (!url) {
    return result;
  }
  return (url.includes('?') ? `${url}&` : `${url}?`) + result;
}

/**
 * 参数转表单数据
 * @param params 参数
 */
export function toFormData(params) {
  const formData = new FormData();
  if (typeof params !== 'object' || params == null) {
    return formData;
  }
  transformParams(params).forEach((d) => {
    formData.append(d[0], d[1]);
  });
  return formData;
}

/**
 * get请求处理数组和对象类型参数
 * @param params 参数
 */
export function transformParams(params) {
  const result = [];
  if (params != null && typeof params === 'object') {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value != null && value !== '') {
        if (Array.isArray(value) && value.length && isBlobFile(value[0])) {
          value.forEach((file) => {
            result.push([key, file]);
          });
        } else if (typeof value === 'object' && !isBlobFile(value)) {
          getObjectParamsArray(value).forEach((item) => {
            result.push([`${key}${item[0]}`, item[1]]);
          });
        } else {
          result.push([key, value]);
        }
      }
    });
  }
  return result;
}

/**
 * 对象转参数数组
 * @param obj 对象
 */
export function getObjectParamsArray(obj) {
  const result = [];
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value != null && value !== '') {
      const name = `[${key}]`;
      if (typeof value === 'object' && !isBlobFile(value)) {
        getObjectParamsArray(value).forEach((item) => {
          result.push([`${name}${item[0]}`, item[1]]);
        });
      } else {
        result.push([name, value]);
      }
    }
  });
  return result;
}

/**
 * 判断是否是文件
 * @param obj 对象
 */
export function isBlobFile(obj) {
  return obj != null && (obj instanceof Blob || obj instanceof File);
}

/**
 * 检查下载文件的请求结果
 * @param res 请求结果
 */
export async function checkDownloadRes(res) {
  if (res.headers['content-type'].startsWith('application/json')) {
    const json = await res.data.text();
    return Promise.reject(
      new Error(JSON.parse(json).msg || '系统未知错误，请反馈给管理员')
    );
  }
  return true;
}

/**
 * 切换主题过渡动画
 * @param callback 执行的方法
 * @param el 过渡动画触发元素
 * @param isOut 是否是退出方向
 */
export function doWithTransition(callback, el, isOut) {
  if (!el || typeof document.startViewTransition !== 'function') {
    callback().then(() => {});
    return;
  }
  document.documentElement.classList.add('disabled-transition');
  el.classList.add('view-transition-trigger');
  el.style.setProperty('view-transition-name', 'view-transition-trigger');
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );
  document.startViewTransition(callback).ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ];
    const anim = document.documentElement.animate(
      { clipPath: isOut ? [...clipPath].reverse() : clipPath },
      {
        duration: 400,
        easing: 'ease-in',
        pseudoElement: isOut
          ? `::view-transition-old(root)`
          : `::view-transition-new(root)`
      }
    );
    anim.onfinish = () => {
      el.style.removeProperty('view-transition-name');
      el.classList.remove('view-transition-trigger');
      document.documentElement.classList.remove('disabled-transition');
    };
  });
}
