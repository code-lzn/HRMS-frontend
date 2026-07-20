// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getMonthlyTrend GET /api/salary-statistics/monthly-trend */
export async function getMonthlyTrendUsingGet(
  params?: { months?: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryMonthlyTrendVO_>(
    '/api/salary-statistics/monthly-trend',
    {
      method: 'GET',
      params: { months: '6', ...(params || {}) },
      ...(options || {}),
    },
  );
}

/** getDeptDistribution GET /api/salary-statistics/dept-distribution */
export async function getDeptDistributionUsingGet(
  params: { batchId: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryDeptDistributionVO_>(
    '/api/salary-statistics/dept-distribution',
    {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    },
  );
}

/** getComposition GET /api/salary-statistics/composition */
export async function getCompositionUsingGet(
  params: { batchId: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryCompositionVO_>(
    '/api/salary-statistics/composition',
    {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    },
  );
}

/** getSocialSecurity GET /api/salary-statistics/social-security */
export async function getSocialSecurityUsingGet(
  params: { batchId: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalarySocialSecurityVO_>(
    '/api/salary-statistics/social-security',
    {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    },
  );
}

/** getChangeDistribution GET /api/salary-statistics/change-distribution */
export async function getChangeDistributionUsingGet(
  params: { batchId: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryChangeDistributionVO_>(
    '/api/salary-statistics/change-distribution',
    {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    },
  );
}
