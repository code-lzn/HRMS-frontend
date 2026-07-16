// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** batchDeleteAttendance DELETE /api/hr/attendance/batch-delete */
export async function batchDeleteAttendanceUsingDelete(
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/hr/attendance/batch-delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** createAttendance POST /api/hr/attendance/create */
export async function createAttendanceUsingPost(
  body: API.HRAttendanceDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHRAttendanceVO_>('/api/hr/attendance/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteAttendance DELETE /api/hr/attendance/delete/${param0} */
export async function deleteAttendanceUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAttendanceUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/hr/attendance/delete/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getDetail GET /api/hr/attendance/detail/${param0} */
export async function getDetailUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailUsingGET1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseHRAttendanceVO_>(
    `/api/hr/attendance/detail/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** queryAttendance GET /api/hr/attendance/list */
export async function queryAttendanceUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryAttendanceUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageResultHRAttendanceVO_>(
    '/api/hr/attendance/list',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** updateAttendance POST /api/hr/attendance/update */
export async function updateAttendanceUsingPost(
  body: API.HRAttendanceDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHRAttendanceVO_>('/api/hr/attendance/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
