// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getMetrics GET /api/dashboard/metrics */
export async function getMetricsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseDashboardMetricsVO_>(
    '/api/dashboard/metrics',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getModuleUsage GET /api/dashboard/module-usage */
export async function getModuleUsageUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListModuleUsageVO_>(
    '/api/dashboard/module-usage',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getRecentLogs GET /api/dashboard/recent-logs */
export async function getRecentLogsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListRecentLogVO_>(
    '/api/dashboard/recent-logs',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getVisitTrend GET /api/dashboard/visit-trend */
export async function getVisitTrendUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListVisitTrendVO_>(
    '/api/dashboard/visit-trend',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
