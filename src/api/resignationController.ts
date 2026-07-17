// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** list GET /api/api/resignations */
export async function listUsingGet2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET2Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfPageOfResignationListVO>(
    '/api/api/resignations',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** create POST /api/api/resignations */
export async function createUsingPost2(
  body: API.ResignationCreateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOflong>('/api/api/resignations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDetail GET /api/api/resignations/${param0} */
export async function getDetailUsingGet3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGET3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfResignationDetailVO>(
    `/api/api/resignations/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateDraft PUT /api/api/resignations/${param0} */
export async function updateDraftUsingPut2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDraftUsingPUT2Params,
  body: API.ResignationUpdateDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfobject>(`/api/api/resignations/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deleteDraft DELETE /api/api/resignations/${param0} */
export async function deleteDraftUsingDelete2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteDraftUsingDELETE2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfobject>(`/api/api/resignations/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** cancel POST /api/api/resignations/${param0}/cancel */
export async function cancelUsingPost3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfobject>(
    `/api/api/resignations/${param0}/cancel`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** submitToApproval POST /api/api/resignations/${param0}/submit */
export async function submitToApprovalUsingPost2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitToApprovalUsingPOST2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfobject>(
    `/api/api/resignations/${param0}/submit`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
