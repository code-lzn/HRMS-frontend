// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** update PUT /api/onboarding/${param0} */
export async function updateUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUsingPUTParams,
  body: API.OnboardingAddRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/onboarding/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** delete DELETE /api/onboarding/${param0} */
export async function deleteUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/onboarding/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** submitDraft POST /api/onboarding/${param0}/submit */
export async function submitDraftUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitDraftUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/onboarding/${param0}/submit`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** abandon POST /api/onboarding/abandon */
export async function abandonUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.abandonUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/onboarding/abandon', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** confirm POST /api/onboarding/confirm */
export async function confirmUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.confirmUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/onboarding/confirm', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** detail GET /api/onboarding/detail */
export async function detailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.detailUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOnboardingVO_>('/api/onboarding/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** saveDraft POST /api/onboarding/draft */
export async function saveDraftUsingPost(
  body: API.OnboardingAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringObject_>('/api/onboarding/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** employeeConfirm POST /api/onboarding/employee-confirm */
export async function employeeConfirmUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.employeeConfirmUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/onboarding/employee-confirm', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** list GET /api/onboarding/list */
export async function listUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageOnboardingVO_>('/api/onboarding/list', {
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

/** getMutationLogs GET /api/onboarding/mutation-logs */
export async function getMutationLogsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMutationLogVO_>(
    '/api/onboarding/mutation-logs',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** submit POST /api/onboarding/submit */
export async function submitUsingPost(
  body: API.OnboardingAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringObject_>('/api/onboarding/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getTransferableUsers GET /api/onboarding/transferable-users */
export async function getTransferableUsersUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListUserVO_>(
    '/api/onboarding/transferable-users',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
