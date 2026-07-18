// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getDepartmentStats GET /api/attendance/stats/department */
export async function getDepartmentStatsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDepartmentStatsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListDepartmentAttendanceStatsVO_>(
    '/api/attendance/stats/department',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getLateEarlyRanking GET /api/attendance/stats/late-early-ranking */
export async function getLateEarlyRankingUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLateEarlyRankingUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListAttendanceStatsVO_>(
    '/api/attendance/stats/late-early-ranking',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getLeaveTypeDistribution GET /api/attendance/stats/leave-distribution */
export async function getLeaveTypeDistributionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLeaveTypeDistributionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLeaveTypeDistributionVO_>(
    '/api/attendance/stats/leave-distribution',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getPersonalStats GET /api/attendance/stats/personal */
export async function getPersonalStatsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPersonalStatsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceStatsVO_>(
    '/api/attendance/stats/personal',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getAttendanceTrend GET /api/attendance/stats/trend */
export async function getAttendanceTrendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAttendanceTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceTrendVO_>(
    '/api/attendance/stats/trend',
    {
      method: 'GET',
      params: {
        // months has a default value: 6
        months: '6',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getPersonalTrend GET /api/attendance/stats/personal-trend */
export async function getPersonalTrendUsingGet(
  params?: { months?: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceTrendVO_>(
    '/api/attendance/stats/personal-trend',
    {
      method: 'GET',
      params: { months: '6', ...params },
      ...(options || {}),
    },
  );
}

/** getPersonalLeaveDistribution GET /api/attendance/stats/personal-leave-distribution */
export async function getPersonalLeaveDistributionUsingGet(
  params: { month: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLeaveTypeDistributionVO_>(
    '/api/attendance/stats/personal-leave-distribution',
    {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    },
  );
}
