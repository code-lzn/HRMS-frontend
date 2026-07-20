// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getChangeDistribution GET /api/salary-statistics/change-distribution */
export async function getChangeDistributionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChangeDistributionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryChangeDistributionVO_>(
    '/api/salary-statistics/change-distribution',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getComposition GET /api/salary-statistics/composition */
export async function getCompositionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCompositionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryCompositionVO_>(
    '/api/salary-statistics/composition',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getDeptDistribution GET /api/salary-statistics/dept-distribution */
export async function getDeptDistributionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDeptDistributionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryDeptDistributionVO_>(
    '/api/salary-statistics/dept-distribution',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getMonthlyTrend GET /api/salary-statistics/monthly-trend */
export async function getMonthlyTrendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMonthlyTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryMonthlyTrendVO_>(
    '/api/salary-statistics/monthly-trend',
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

/** getSocialSecurityComparison GET /api/salary-statistics/social-security */
export async function getSocialSecurityComparisonUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSocialSecurityComparisonUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalarySocialSecurityVO_>(
    '/api/salary-statistics/social-security',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
