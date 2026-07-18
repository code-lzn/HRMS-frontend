// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getDepartmentList GET /api/api/departments */
export async function getDepartmentListUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDepartmentListUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageDepartmentVO_>('/api/api/departments', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createDepartment POST /api/api/departments */
export async function createDepartmentUsingPost(
  body: API.DepartmentCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseDepartment_>('/api/api/departments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDepartmentDetail GET /api/api/departments/${param0} */
export async function getDepartmentDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDepartmentDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseDepartmentVO_>(
    `/api/api/departments/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateDepartment PUT /api/api/departments/${param0} */
export async function updateDepartmentUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDepartmentUsingPUTParams,
  body: API.DepartmentUpdateRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseDepartment_>(
    `/api/api/departments/${param0}`,
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

/** deleteDepartment DELETE /api/api/departments/${param0} */
export async function deleteDepartmentUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteDepartmentUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/api/departments/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** getDepartmentTree GET /api/api/departments/tree */
export async function getDepartmentTreeUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListDepartmentTreeNode_>(
    '/api/api/departments/tree',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
