// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getBalances GET /api/api/leave/balances */
export async function getBalancesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBalancesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfLeaveBalanceVO>('/api/api/leave/balances', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** queryRequests GET /api/api/leave/requests */
export async function queryRequestsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryRequestsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfPageOfLeaveRequestVO>(
    '/api/api/leave/requests',
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

/** submitLeaveRequest POST /api/api/leave/requests */
export async function submitLeaveRequestUsingPost(
  body: API.LeaveRequestSubmitDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfLeaveRequestVO>('/api/api/leave/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getRequestDetail GET /api/api/leave/requests/${param0} */
export async function getRequestDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRequestDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfLeaveRequestVO>(
    `/api/api/leave/requests/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
