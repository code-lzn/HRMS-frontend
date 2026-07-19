// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getCalendar GET /api/attendance/calendar */
export async function getCalendarUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCalendarUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceCalendarVO_>(
    '/api/attendance/calendar',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** ensureTodayRecords POST /api/attendance/ensure-today */
export async function ensureTodayRecordsUsingPost(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseMapStringObject_>(
    '/api/attendance/ensure-today',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** evaluateEndOfDay POST /api/attendance/evaluate/${param0} */
export async function evaluateEndOfDayUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.evaluateEndOfDayUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { date: param0, ...queryParams } = params;
  return request<API.BaseResponseMapStringObject_>(
    `/api/attendance/evaluate/${param0}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** generateDailyRecords POST /api/attendance/generate/${param0} */
export async function generateDailyRecordsUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateDailyRecordsUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { date: param0, ...queryParams } = params;
  return request<API.BaseResponseMapStringObject_>(
    `/api/attendance/generate/${param0}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** punch POST /api/attendance/punch */
export async function punchUsingPost(
  body: API.PunchRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceVO_>('/api/attendance/punch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getMonthRecords GET /api/attendance/records */
export async function getMonthRecordsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMonthRecordsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListAttendanceVO_>('/api/attendance/records', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** syncAnomalyApprovals POST /api/attendance/sync-anomaly-approvals */
export async function syncAnomalyApprovalsUsingPost(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseMapStringObject_>(
    '/api/attendance/sync-anomaly-approvals',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** getTodayStatus GET /api/attendance/today */
export async function getTodayStatusUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseAttendanceVO_>('/api/attendance/today', {
    method: 'GET',
    ...(options || {}),
  });
}
