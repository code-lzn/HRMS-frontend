import axios, { AxiosRequestConfig } from 'axios';
import {
  flattenDepartments,
  getMockEmployeeDetail,
  mockDepartments,
  mockEmployees,
  mockPositions,
  paginate,
} from './mockData';

const PROD_BASE_URL = 'http://xx.xx.xx.xx';
const myAxios = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : undefined,
  timeout: 60000,
  withCredentials: true,
});

// ============ 模拟后端 Mock 处理（无后端时使用） ============
/**
 * 根据 URL + method 返回本地 mock 数据
 * 返回 null 表示该请求不被 mock 拦截，需要走真实后端
 */
function getMockResponse(
  method: string,
  url: string,
  params: any,
  body: any,
): any | null {
  const path = url.split('?')[0];

  // ---------- 部门相关 ----------
  if (path === '/api/api/v1/departments/tree' && method === 'GET') {
    return { code: 0, message: 'ok', data: mockDepartments };
  }
  // 部门分页列表
  if (path === '/api/api/v1/departments' && method === 'GET') {
    const all = flattenDepartments();
    return {
      code: 0,
      message: 'ok',
      data: paginate(all, params.current, params.pageSize || params.size),
    };
  }
  // 部门详情
  const deptDetailMatch = path.match(/^\/api\/api\/v1\/departments\/(\d+)$/);
  if (deptDetailMatch && method === 'GET') {
    const id = Number(deptDetailMatch[1]);
    const all = flattenDepartments();
    const dept = all.find((d) => d.id === id);
    if (dept) return { code: 0, message: 'ok', data: dept };
    return { code: 404, message: '部门不存在', data: null };
  }
  // 部门创建/更新/删除
  if (path === '/api/api/v1/departments' && method === 'POST') {
    return {
      code: 0,
      message: '创建成功',
      data: {
        id: Date.now(),
        ...(body || {}),
        children: [],
        createTime: new Date().toISOString(),
      },
    };
  }
  if (deptDetailMatch && method === 'PUT') {
    return {
      code: 0,
      message: '更新成功',
      data: {
        id: Number(deptDetailMatch[1]),
        ...(body || {}),
        updateTime: new Date().toISOString(),
      },
    };
  }
  if (deptDetailMatch && method === 'DELETE') {
    return { code: 0, message: '删除成功', data: null };
  }

  // ---------- 职位相关 ----------
  if (path === '/api/api/v1/positions' && method === 'GET') {
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
  if (path === '/api/api/v1/positions' && method === 'POST') {
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
  if (path === '/api/api/v1/positions/sequences' && method === 'GET') {
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

  // ---------- 员工相关 ----------
  if (path === '/api/api/v1/employees' && method === 'GET') {
    const current = Number(params.current) || 1;
    const size = Number(params.pageSize || params.size) || 10;
    const keyword = (params.keyword || '').toString().toLowerCase();
    const status = params.status;
    const departmentId = params.departmentId;
    let list = [...mockEmployees];
    if (keyword) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(keyword) ||
          (e.phone || '').includes(keyword) ||
          (e.employeeNo || '').toLowerCase().includes(keyword),
      );
    }
    if (status !== undefined && status !== null && status !== '') {
      list = list.filter((e) => String(e.status) === String(status));
    }
    if (departmentId) {
      list = list.filter((e) => e.departmentId === Number(departmentId));
    }
    return { code: 0, message: 'ok', data: paginate(list, current, size) };
  }
  if (path === '/api/api/v1/employees' && method === 'POST') {
    return {
      code: 0,
      message: '创建成功',
      data: { id: Date.now(), ...(body || {}) },
    };
  }
  const empDetailMatch = path.match(/^\/api\/api\/v1\/employees\/(\d+)$/);
  if (empDetailMatch && method === 'GET') {
    const id = Number(empDetailMatch[1]);
    return { code: 0, message: 'ok', data: getMockEmployeeDetail(id) };
  }
  if (empDetailMatch && method === 'PUT') {
    return {
      code: 0,
      message: '更新成功',
      data: { id: Number(empDetailMatch[1]), ...(body || {}) },
    };
  }
  if (path === '/api/api/v1/employees/field-permissions' && method === 'GET') {
    return {
      code: 0,
      message: 'ok',
      data: {
        visibleFields: ['phone', 'idCard', 'email', 'salary'],
        hiddenFields: [],
      },
    };
  }
  if (path === '/api/api/v1/employees/statuses' && method === 'GET') {
    return {
      code: 0,
      message: 'ok',
      data: [
        { value: 1, label: '正式' },
        { value: 2, label: '试用' },
        { value: 3, label: '离职' },
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
      throw new Error(data?.message ?? '服务器错误');
    }
    return data;
  },
  // 非 2xx 或 mock 接管：尝试用 mock 数据响应
  function (error) {
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
        // 通过 Promise 成功 resolve，模拟 axios 正常响应
        return Promise.resolve(mockData);
      }
    }
    return Promise.reject(error);
  },
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
