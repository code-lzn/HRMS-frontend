// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** list GET /api/transfers */
export async function listUsingGet3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET3Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTransferListVO_>('/api/transfers', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** create POST /api/transfers */
export async function createUsingPost3(
  body: API.TransferCreateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDetail GET /api/transfers/${param0} */
export async function getDetailUsingGet4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGET4Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseTransferDetailVO_>(
    `/api/transfers/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateDraft PUT /api/transfers/${param0} */
export async function updateDraftUsingPut3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDraftUsingPUT3Params,
  body: API.TransferUpdateDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/transfers/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deleteDraft DELETE /api/transfers/${param0} */
export async function deleteDraftUsingDelete3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteDraftUsingDELETE3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/transfers/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** cancel POST /api/transfers/${param0}/cancel */
export async function cancelUsingPost4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST4Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/transfers/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** submitToApproval POST /api/transfers/${param0}/submit */
export async function submitToApprovalUsingPost3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitToApprovalUsingPOST3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/transfers/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** getHistory GET /api/transfers/history/${param0} */
export async function getHistoryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHistoryUsingGETParams,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageTransferHistoryVO_>(
    `/api/transfers/history/${param0}`,
    {
      method: 'GET',
      params: {
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}
