// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** apply POST /api/attendance/overtime/apply */
export async function applyOvertimeUsingPost(
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

/** getMyOvertimes GET /api/attendance/overtime/my */
export async function getMyOvertimesUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListOvertimeVO_>(
    '/api/attendance/overtime/my',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** cancel POST /api/attendance/overtime/cancel/${param0} */
export async function cancelOvertimeUsingPost(
  params: { id: number },
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
