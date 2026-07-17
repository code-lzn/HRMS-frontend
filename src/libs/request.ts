import axios, { AxiosRequestConfig } from 'axios';

const PROD_BASE_URL = 'http://xx.xx.xx.xx';
const myAxios = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : undefined,
  timeout: 60000,
  withCredentials: true,
});

myAxios.interceptors.request.use(
  function (config) { return config; },
  function (error) { return Promise.reject(error); },
);

myAxios.interceptors.response.use(
  function (response) {
    const { data } = response;
    if (data.code === 40100) {
      if (!response.request.responseURL.includes('user/get/login') && !window.location.pathname.includes('/user/login')) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    } else if (data.code !== 0) {
      throw new Error(data.message ?? '服务器错误');
    }
    return data; // 解包 AxiosResponse，直接返回 body
  },
  function (error) { return Promise.reject(error); },
);

/**
 * 类型安全的请求函数。
 * 拦截器已解包 AxiosResponse → body，此包装让 TS 类型正确匹配。
 */
function request<T = any>(config: AxiosRequestConfig): Promise<T>;
function request<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
function request<T = any>(urlOrConfig: string | AxiosRequestConfig, config?: AxiosRequestConfig): Promise<T> {
  if (typeof urlOrConfig === 'string') {
    return myAxios({ url: urlOrConfig, ...config }) as any;
  }
  return myAxios(urlOrConfig) as any;
}

export default request;
