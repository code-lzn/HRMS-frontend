// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** checkPermission GET /api/permission/check */
export async function checkPermissionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkPermissionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/permission/check', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getAllPermissionCodes GET /api/permission/codes */
export async function getAllPermissionCodesUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListString_>('/api/permission/codes', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getCurrentPermissions GET /api/permission/current */
export async function getCurrentPermissionsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseUserPermissionVO_>('/api/permission/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getDataScope GET /api/permission/data-scope */
export async function getDataScopeUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseInt_>('/api/permission/data-scope', {
    method: 'GET',
    ...(options || {}),
  });
}
