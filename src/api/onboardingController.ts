// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** list GET /api/onboarding */
export async function listUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageOnboardingListVO_>('/api/onboarding', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** create POST /api/onboarding */
export async function createUsingPost(
  body: API.OnboardingCreateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getDetail GET /api/onboarding/${param0} */
export async function getDetailUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGET1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOnboardingDetailVO_>(
    `/api/onboarding/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateDraft PUT /api/onboarding/${param0} */
export async function updateDraftUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateDraftUsingPUTParams,
  body: API.OnboardingUpdateDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/onboarding/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deleteDraft DELETE /api/onboarding/${param0} */
export async function deleteDraftUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteDraftUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/onboarding/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** abandon POST /api/onboarding/${param0}/abandon */
export async function abandonUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.abandonUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/onboarding/${param0}/abandon`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** cancel POST /api/onboarding/${param0}/cancel */
export async function cancelUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/onboarding/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** confirmJoin POST /api/onboarding/${param0}/confirm-join */
export async function confirmJoinUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.confirmJoinUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(
    `/api/onboarding/${param0}/confirm-join`,
    {
      method: 'POST',
      params: {
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** submitToApproval POST /api/onboarding/${param0}/submit */
export async function submitToApprovalUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitToApprovalUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseObject_>(`/api/onboarding/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** checkPhone GET /api/onboarding/check-phone */
export async function checkPhoneUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkPhoneUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringObject_>(
    '/api/onboarding/check-phone',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** previewEmployeeNo POST /api/onboarding/generate-employee-no */
export async function previewEmployeeNoUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.previewEmployeeNoUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringString_>(
    '/api/onboarding/generate-employee-no',
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
