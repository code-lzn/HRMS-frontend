// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getApprovalProgress GET /api/attendance/makeup/${param0}/progress */
export async function getApprovalProgressUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApprovalProgressUsingGET1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseMakeupPunchProgressVO_>(
    `/api/attendance/makeup/${param0}/progress`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** apply POST /api/attendance/makeup/apply */
export async function applyUsingPost1(
  body: API.MakeupPunchApplyRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMakeupPunchVO_>(
    '/api/attendance/makeup/apply',
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

/** approve POST /api/attendance/makeup/approve */
export async function approveUsingPost2(
  body: API.ApprovalRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMakeupPunchVO_>(
    '/api/attendance/makeup/approve',
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

/** cancel POST /api/attendance/makeup/cancel/${param0} */
export async function cancelUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/makeup/cancel/${param0}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getMyMakeupPunches GET /api/attendance/makeup/my */
export async function getMyMakeupPunchesUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMakeupPunchVO_>(
    '/api/attendance/makeup/my',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
