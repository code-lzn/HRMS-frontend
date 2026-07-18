// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** clock POST /api/attendance/clock */
export async function clockUsingPost(
  body: API.ClockRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseClockResultVO_>('/api/attendance/clock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** queryRecords GET /api/attendance/records */
export async function queryRecordsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryRecordsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageAttendanceRecordVO_>(
    '/api/attendance/records',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getCalendar GET /api/attendance/records/calendar */
export async function getCalendarUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCalendarUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceCalendarVO_>(
    '/api/attendance/records/calendar',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** querySupplementCards GET /api/attendance/supplement-cards */
export async function querySupplementCardsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.querySupplementCardsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageSupplementCardListVO_>(
    '/api/attendance/supplement-cards',
    {
      method: 'GET',
      params: {
        // page has a default value: 1
        page: '1',
        // size has a default value: 20
        size: '20',

        ...params,
      },
      ...(options || {}),
    },
  );
}

/** submitSupplementCard POST /api/attendance/supplement-cards */
export async function submitSupplementCardUsingPost(
  body: API.SupplementCardSubmitDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseSupplementCardVO_>(
    '/api/attendance/supplement-cards',
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
