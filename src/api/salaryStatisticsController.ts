// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** composition GET /api/salary-statistics/composition */
export async function compositionUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/salary-statistics/composition',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** departmentDistribution GET /api/salary-statistics/department-distribution */
export async function departmentDistributionUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/salary-statistics/department-distribution',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** monthlyTrend GET /api/salary-statistics/monthly-trend */
export async function monthlyTrendUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/salary-statistics/monthly-trend',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** variationDistribution GET /api/salary-statistics/variation-distribution */
export async function variationDistributionUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMapStringObject_>(
    '/api/salary-statistics/variation-distribution',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
