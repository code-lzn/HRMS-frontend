// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** addEmployee POST /api/employee/add */
export async function addEmployeeUsingPost(
  body: API.EmployeeAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringObject_>('/api/employee/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getChangeLogs GET /api/employee/change-logs */
export async function getChangeLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChangeLogsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeChangeLogVO_>(
    '/api/employee/change-logs',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** deleteEmployee POST /api/employee/delete */
export async function deleteEmployeeUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/employee/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDetail GET /api/employee/detail */
export async function getDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseEmployeeDetailVO_>('/api/employee/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listEmployees GET /api/employee/list */
export async function listEmployeesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listEmployeesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeVO_>('/api/employee/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** searchEmployees GET /api/employee/list */
export async function searchEmployeesUsingGet(
  params: { keyword: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeVO_>('/api/employee/list', {
    method: 'GET',
    params: {
      ...params,
      page: 1,
      size: 20,
    },
    ...(options || {}),
  });
}

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
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateEmployee PUT /api/employee/update */
export async function updateEmployeeUsingPut(
  body: API.EmployeeUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/employee/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
