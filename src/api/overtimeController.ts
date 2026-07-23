// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getApprovalProgress GET /api/attendance/overtime/${param0}/progress */
export async function getApprovalProgressUsingGet2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApprovalProgressUsingGET2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOvertimeProgressVO_>(
    `/api/attendance/overtime/${param0}/progress`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** apply POST /api/attendance/overtime/apply */
export async function applyUsingPost2(
  body: API.OvertimeApplyRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOvertimeVO_>(
    '/api/attendance/overtime/apply',
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

/** cancel POST /api/attendance/overtime/cancel/${param0} */
export async function cancelUsingPost2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelUsingPOST2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/overtime/cancel/${param0}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** deleteOvertime DELETE /api/attendance/overtime/${param0} */
export async function deleteOvertimeUsingDelete(
  params: API.deleteOvertimeUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/overtime/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getMyOvertimes GET /api/attendance/overtime/my */
export async function getMyOvertimesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListOvertimeVO_>(
    '/api/attendance/overtime/my',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
