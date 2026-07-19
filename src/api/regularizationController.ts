// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** update PUT /api/regularization/${param0} */
export async function updateUsingPut1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUsingPUT1Params,
  body: API.RegularizationAddRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/regularization/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** delete DELETE /api/regularization/${param0} */
export async function deleteUsingDelete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETE1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/regularization/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** submitDraft POST /api/regularization/${param0}/submit */
export async function submitDraftUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitDraftUsingPOST1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(
    `/api/regularization/${param0}/submit`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** detail GET /api/regularization/detail */
export async function detailUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.detailUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseRegularizationVO_>(
    '/api/regularization/detail',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** saveDraft POST /api/regularization/draft */
export async function saveDraftUsingPost1(
  body: API.RegularizationAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrRegularization_>(
    '/api/regularization/draft',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** list GET /api/regularization/list */
export async function listUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageRegularizationVO_>(
    '/api/regularization/list',
    {
      method: 'GET',
      params: {
        // page has a default value: 1
        page: '1',
        // size has a default value: 10
        size: '10',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** stats GET /api/regularization/stats */
export async function statsUsingGet1(options?: { [key: string]: any }) {
  return request<API.BaseResponseMapStringLong_>('/api/regularization/stats', {
    method: 'GET',
    ...(options || {}),
  });
}

/** submit POST /api/regularization/submit */
export async function submitUsingPost1(
  body: API.RegularizationAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHrRegularization_>(
    '/api/regularization/submit',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}
