import axios from 'axios';

// 创建 Axios 实例
// 开发环境走 Umi 代理（解决 SameSite 跨域 Cookie 问题），生产环境直连后端
const PROD_BASE_URL = 'http://localhost:8123';
const myAxios = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : '/',
  timeout: 60000,
  withCredentials: true,
});

// 创建请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 请求执行前执行
    return config;
  },
  function (error) {
    // 处理请求错误
    return Promise.reject(error);
  },
);

// 创建响应拦截器
myAxios.interceptors.response.use(
  // 2xx 响应触发
  function (response) {
    // 处理响应数据
    const { data } = response;

    // blob 响应（如导出 Excel）直接返回，不做 JSON code 校验
    if (response.config?.responseType === 'blob' || data instanceof Blob) {
      return data;
    }

    // 未登录
    if (data.code === 40100) {
      // 不在登录页面则跳转到登录页
      if (!window.location.pathname.includes('/user/login')) {
        const redirect = window.location.pathname + window.location.search;
        window.location.href = `/user/login?redirect=${encodeURIComponent(redirect)}`;
      }
    } else if (data.code !== 0) {
      // 其他错误
      throw new Error(data.message ?? '服务器错误');
    }
    return data;
  },
  // 非 2xx 响应触发
  function (error) {
    // 处理响应错误
    return Promise.reject(error);
  },
);

export default myAxios;
