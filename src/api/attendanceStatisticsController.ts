// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getAttendanceRate GET /api/attendance/statistics/charts/attendance-rate */
export async function getAttendanceRateUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAttendanceRateUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceRateChartVO_>(
    '/api/attendance/statistics/charts/attendance-rate',
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

/** getLateEarlyRanking GET /api/attendance/statistics/charts/late-early-ranking */
export async function getLateEarlyRankingUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLateEarlyRankingUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListLeaveEarlyRankingVO_>(
    '/api/attendance/statistics/charts/late-early-ranking',
    {
      method: 'GET',
      params: {
        // topN has a default value: 10
        topN: '10',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getLeaveDistribution GET /api/attendance/statistics/charts/leave-distribution */
export async function getLeaveDistributionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLeaveDistributionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListLeaveDistributionVO_>(
    '/api/attendance/statistics/charts/leave-distribution',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
