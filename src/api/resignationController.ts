// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** update PUT /api/resignation/${param0} */
export async function updateUsingPut2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUsingPUT2Params,
  body: API.ResignationAddRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/resignation/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** delete DELETE /api/resignation/${param0} */
export async function deleteUsingDelete2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETE2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/resignation/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** submitDraft POST /api/resignation/${param0}/submit */
export async function submitDraftUsingPost2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitDraftUsingPOST2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/resignation/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** detail GET /api/resignation/detail */
export async function detailUsingGet2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.detailUsingGET2Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseResignationVO_>('/api/resignation/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** saveDraft POST /api/resignation/draft */
export async function saveDraftUsingPost2(
  body: API.ResignationAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrResignation_>('/api/resignation/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** list GET /api/resignation/list */
export async function listUsingGet2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET2Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageResignationVO_>('/api/resignation/list', {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // size has a default value: 10
      size: '10',
      ...params,
    },
    ...(options || {}),
  });
}

/** submit POST /api/resignation/submit */
export async function submitUsingPost2(
  body: API.ResignationAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrResignation_>('/api/resignation/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
