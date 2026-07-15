// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getEmployeeList GET /api/api/v1/employees */
export async function getEmployeeListUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeListUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeListVO_>('/api/api/v1/employees', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createEmployee POST /api/api/v1/employees */
export async function createEmployeeUsingPost(
  body: API.EmployeeCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseEmployeeCreateVO_>('/api/api/v1/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getEmployeeDetail GET /api/api/v1/employees/${param0} */
export async function getEmployeeDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseEmployeeDetailVO_>(
    `/api/api/v1/employees/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateEmployee PUT /api/api/v1/employees/${param0} */
export async function updateEmployeeUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateEmployeeUsingPUTParams,
  body: Record<string, any>,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseEmployeeUpdateVO_>(
    `/api/api/v1/employees/${param0}`,
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

/** getFieldPermissions GET /api/api/v1/employees/field-permissions */
export async function getFieldPermissionsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseFieldPermissionsVO_>(
    '/api/api/v1/employees/field-permissions',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getStatuses GET /api/api/v1/employees/statuses */
export async function getStatusesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/api/v1/employees/statuses',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
