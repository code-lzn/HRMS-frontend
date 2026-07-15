// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getPositionList GET /api/api/v1/positions */
export async function getPositionListUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPositionListUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePositionVO_>('/api/api/v1/positions', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createPosition POST /api/api/v1/positions */
export async function createPositionUsingPost(
  body: API.PositionCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePosition_>('/api/api/v1/positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getPositionDetail GET /api/api/v1/positions/${param0} */
export async function getPositionDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPositionDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponsePositionVO_>(
    `/api/api/v1/positions/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updatePosition PUT /api/api/v1/positions/${param0} */
export async function updatePositionUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updatePositionUsingPUTParams,
  body: API.PositionUpdateRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponsePosition_>(`/api/api/v1/positions/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deletePosition DELETE /api/api/v1/positions/${param0} */
export async function deletePositionUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePositionUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(`/api/api/v1/positions/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** getSequences GET /api/api/v1/positions/sequences */
export async function getSequencesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/api/v1/positions/sequences',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
