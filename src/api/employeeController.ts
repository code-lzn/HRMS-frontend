// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

// ========== Profile 相关 ==========

/** getMyProfile GET /api/employee/profile */
export async function getMyProfileUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseEmpProfileVO_>('/api/employee/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** updateMyProfile POST /api/employee/profileUpdate */
export async function updateMyProfileUsingPost(
  body: API.EmpProfileUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/employee/profileUpdate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

// ========== 兼容旧版调用（审批中心等页面使用） ==========

/** 查询员工列表（简单参数版，兼容审批中心等旧调用） */
export async function getEmployeeList(
  params: { current?: number; pageSize?: number; name?: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeListVO_>('/api/employees', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// ========== 员工 CRUD（自动生成） ==========

/** getEmployeeList GET /api/employees */
export async function getEmployeeListUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeListUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeListVO_>('/api/employees', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createEmployee POST /api/employees */
export async function createEmployeeUsingPost(
  body: API.EmployeeCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseEmployeeCreateVO_>('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getEmployeeDetail GET /api/employees/${param0} */
export async function getEmployeeDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseEmployeeDetailVO_>(
    `/api/employees/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateEmployee PUT /api/employees/${param0} */
export async function updateEmployeeUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateEmployeeUsingPUTParams,
  body: Record<string, any>,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseEmployeeUpdateVO_>(
    `/api/employees/${param0}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** getFieldPermissions GET /api/employees/field-permissions */
export async function getFieldPermissionsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseFieldPermissionsVO_>(
    '/api/employees/field-permissions',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getStatuses GET /api/employees/statuses */
export async function getStatusesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/employees/statuses',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
