// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** list GET /api/probation */
export async function listUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageProbationListVO_>('/api/probation', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** create POST /api/probation */
export async function createUsingPost1(
  body: API.ProbationCreateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/probation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDetail GET /api/probation/${param0} */
export async function getDetailUsingGet2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGET2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseProbationDetailVO_>(
    `/api/probation/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateDraft PUT /api/probation/${param0} */
export async function updateDraftUsingPut1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDraftUsingPUT1Params,
  body: API.ProbationUpdateDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/probation/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deleteDraft DELETE /api/probation/${param0} */
export async function deleteDraftUsingDelete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteDraftUsingDELETE1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/probation/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** cancel POST /api/probation/${param0}/cancel */
export async function cancelUsingPost2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/probation/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** handleResult POST /api/probation/${param0}/handle-result */
export async function handleResultUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleResultUsingPOSTParams,
  body: API.ProbationHandleResultDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(
    `/api/probation/${param0}/handle-result`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** submitToApproval POST /api/probation/${param0}/submit */
export async function submitToApprovalUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitToApprovalUsingPOST1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/probation/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** getPendingEmployees GET /api/probation/pending-employees */
export async function getPendingEmployeesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPendingEmployeesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListPendingEmployeeVO_>(
    '/api/probation/pending-employees',
    {
      method: 'GET',
      params: {
        // days has a default value: 7
        days: '7',
        ...params,
      },
      ...(options || {}),
    },
  );
}
