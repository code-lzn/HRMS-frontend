import axios, { AxiosRequestConfig } from 'axios';
import { mockPositions, paginate } from './mockData';

// 后端基础地址
const BASE_URL = 'http://localhost:8123';

const myAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s 超时，便于快速发现错误
  withCredentials: true,
});

// ============ 模拟后端 Mock 处理（无后端时使用） ============
/**
 * 根据 URL + method 返回本地 mock 数据
 * 返回 null 表示该请求不被 mock 拦截，需要走真实后端
 *
 * 仅职位相关保留 mock 作为演示数据；其他接口全部对接真实后端
 */
function getMockResponse(
  method: string,
  url: string,
  params: any,
  body: any,
): any | null {
  const path = url.split('?')[0];

  // ---------- 职位相关（仅职位保留 mock） ----------
  if (path === '/api/positions' && method === 'GET') {
    const current = Number(params.current) || 1;
    const size = Number(params.pageSize || params.size) || 10;
    const keyword = (params.keyword || '').toString().toLowerCase();
    const deptId = params.departmentId;
    let list = [...mockPositions];
    if (keyword) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword),
      );
    }
    if (deptId) {
      list = list.filter((p) => p.departmentId === Number(deptId));
    }
    return { code: 0, message: 'ok', data: paginate(list, current, size) };
  }
  if (path === '/api/positions' && method === 'POST') {
    return {
      code: 0,
      message: '创建成功',
      data: { id: Date.now(), ...(body || {}) },
    };
  }
  const posDetailMatch = path.match(/^\/api\/api\/v1\/positions\/(\d+)$/);
  if (posDetailMatch && method === 'GET') {
    const id = Number(posDetailMatch[1]);
    const pos = mockPositions.find((p) => p.id === id);
    if (pos) return { code: 0, message: 'ok', data: pos };
    return { code: 404, message: '职位不存在', data: null };
  }
  if (posDetailMatch && method === 'PUT') {
    return {
      code: 0,
      message: '更新成功',
      data: { id: Number(posDetailMatch[1]), ...(body || {}) },
    };
  }
  if (posDetailMatch && method === 'DELETE') {
    return { code: 0, message: '删除成功', data: null };
  }
  if (path === '/api/positions/sequences' && method === 'GET') {
    return {
      code: 0,
      message: 'ok',
      data: [
        { label: '管理序列', value: '管理序列' },
        { label: '专业序列', value: '专业序列' },
        { label: '操作序列', value: '操作序列' },
      ],
    };
  }

  return null;
}

// 请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

myAxios.interceptors.response.use(
  function (response) {
    const { data } = response;
    // 未登录
    if (data?.code === 40100) {
      if (
        !response.request?.responseURL?.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    } else if (data?.code !== 0) {
      const err: any = new Error(data?.message ?? '服务器错误');
      err.code = data?.code;
      err.data = data?.data;
      throw err;
    }
    return data;
  },
  // 非 2xx 或 mock 接管
  function (error) {
    // 如果后端返回了响应（哪怕是 4xx/5xx 的业务错误），不要用 mock 数据覆盖
    if (error.response) {
      const { data } = error.response;
      const err: any = new Error(data?.message ?? '服务器错误');
      err.code = data?.code;
      err.data = data?.data;
      return Promise.reject(err);
    }
    // 后端不可达（网络错误/连接拒绝），才用 mock 兜底
    const config = error?.config;
    if (config) {
      const method = (config.method || 'get').toUpperCase();
      const url = config.url || '';
      const params = config.params;
      let body: any = config.data;
      try {
        if (typeof body === 'string') body = JSON.parse(body);
      } catch {}
      const mockData = getMockResponse(method, url, params, body);
      if (mockData) {
        return Promise.resolve(mockData);
      }
    }
    // 详细错误日志，帮助排查后端/CORS/网络问题
    console.error('[request error]', {
      url: error?.config?.url,
      method: error?.config?.method,
      code: error?.code,
      message: error?.message,
      response: error?.response?.status,
      responseData: error?.response?.data,
    });
    return Promise.reject(error);
  },
);

/**
 * 类型安全的请求函数。
 * 拦截器已解包 AxiosResponse → body，此包装让 TS 类型正确匹配。
 */
function request<T = any>(config: AxiosRequestConfig): Promise<T>;
function request<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
function request<T = any>(
  urlOrConfig: string | AxiosRequestConfig,
  config?: AxiosRequestConfig,
): Promise<T> {
  if (typeof urlOrConfig === 'string') {
    return myAxios({ url: urlOrConfig, ...config }) as any;
  }
  return myAxios(urlOrConfig) as any;
}

export default request;
