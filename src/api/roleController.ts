// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** addRole POST /api/role/add */
export async function addRoleUsingPost(
  body: API.RoleAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/role/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** assignRole POST /api/role/assign */
export async function assignRoleUsingPost(
  body: API.RoleAssignRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/role/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteRole POST /api/role/delete */
export async function deleteRoleUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRoleUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/role/delete', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getRoleById GET /api/role/get */
export async function getRoleByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRoleByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseRoleVO_>('/api/role/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listAllRoles GET /api/role/list/all */
export async function listAllRolesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListRoleVO_>('/api/role/list/all', {
    method: 'GET',
    ...(options || {}),
  });
}

/** listEnabledRoles GET /api/role/list/enabled */
export async function listEnabledRolesUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListRoleVO_>('/api/role/list/enabled', {
    method: 'GET',
    ...(options || {}),
  });
}

/** listRoleByPage POST /api/role/list/page */
export async function listRoleByPageUsingPost(
  body: API.RoleQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageRoleVO_>('/api/role/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateRole POST /api/role/update */
export async function updateRoleUsingPost(
  body: API.RoleUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/role/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
