// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getCalendar GET /api/work-calendars?year=&month= */
export async function getWorkCalendarUsingGet(
  params: { year: number; month: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseWorkCalendarVO_>('/api/work-calendars', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** batchUpdate PUT /api/work-calendars */
export async function batchUpdateWorkCalendarUsingPut(
  body: { days: { date: string; dayType: number; holidayName?: string }[] },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseVoid_>('/api/work-calendars', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** generateYear POST /api/work-calendars/generate/{year} */
export async function generateWorkCalendarYearUsingPost(
  params: { year: number },
  options?: { [key: string]: any },
) {
  const { year, ...queryParams } = params;
  return request<API.BaseResponseVoid_>(
    `/api/work-calendars/generate/${year}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** syncFromExternal POST /api/work-calendars/sync/{year} */
export async function syncWorkCalendarYearUsingPost(
  params: { year: number },
  options?: { [key: string]: any },
) {
  const { year, ...queryParams } = params;
  return request<API.BaseResponseInt_>(`/api/work-calendars/sync/${year}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
