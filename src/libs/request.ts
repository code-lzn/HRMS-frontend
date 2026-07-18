import axios, { type AxiosRequestConfig } from 'axios';

// 创建 Axios 实例
// 区分开发和生产环境
const DEV_BASE_URL = 'http://localhost:8123';
const PROD_BASE_URL = 'http://xx.xx.xx.xx';
const myAxios = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL,
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
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息接口，或者不是登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    } else if (data.code !== 0) {
      // 其他错误
      throw new Error(data.message ?? '服务器错误');
    }
    return data;
  },
  // 非 2xx 响应触发
  function (error) {
    // 处理请求错误
    return Promise.reject(error);
  },
);

// 类型安全的请求函数：interceptor 已解包 response.data，所以直接返回 T
async function request<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await myAxios.request<T>({ url, ...config });
  // 拦截器已解包 response.data，但 TypeScript 无法感知，此处用类型断言
  return response as unknown as T;
}

export default request;
