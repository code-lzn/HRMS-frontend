// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** update PUT /api/transfer/${param0} */
export async function updateUsingPut3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUsingPUT3Params,
  body: API.TransferAddRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/transfer/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** delete DELETE /api/transfer/${param0} */
export async function deleteUsingDelete3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETE3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/transfer/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** submitDraft POST /api/transfer/${param0}/submit */
export async function submitDraftUsingPost3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitDraftUsingPOST3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/transfer/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** detail GET /api/transfer/detail */
export async function detailUsingGet3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.detailUsingGET3Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTransferVO_>('/api/transfer/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** saveDraft POST /api/transfer/draft */
export async function saveDraftUsingPost3(
  body: API.TransferAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrTransfer_>('/api/transfer/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** list GET /api/transfer/list */
export async function listUsingGet3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET3Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTransferVO_>('/api/transfer/list', {
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

/** stats GET /api/transfer/stats */
export async function statsUsingGet3(options?: { [key: string]: any }) {
  return request<API.BaseResponseMapStringLong_>('/api/transfer/stats', {
    method: 'GET',
    ...(options || {}),
  });
}

/** submit POST /api/transfer/submit */
export async function submitUsingPost3(
  body: API.TransferAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrTransfer_>('/api/transfer/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
