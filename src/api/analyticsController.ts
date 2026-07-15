// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getConversionRate GET /api/analytics/conversion-rate */
export async function getConversionRateUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getConversionRateUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListConversionRateVO_>(
    '/api/analytics/conversion-rate',
    {
      method: 'GET',
      params: {
        // range has a default value: 7days
        range: '7days',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getGrowthTrend GET /api/analytics/growth-trend */
export async function getGrowthTrendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getGrowthTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListGrowthTrendVO_>(
    '/api/analytics/growth-trend',
    {
      method: 'GET',
      params: {
        // range has a default value: 7days
        range: '7days',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getSourceDistribution GET /api/analytics/source-distribution */
export async function getSourceDistributionUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSourceDistributionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSourceDistributionVO_>(
    '/api/analytics/source-distribution',
    {
      method: 'GET',
      params: {
        // range has a default value: 7days
        range: '7days',
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getSummary GET /api/analytics/summary */
export async function getSummaryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSummaryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAnalyticsSummaryVO_>(
    '/api/analytics/summary',
    {
      method: 'GET',
      params: {
        // range has a default value: 7days
        range: '7days',
        ...params,
      },
      ...(options || {}),
    },
  );
}
