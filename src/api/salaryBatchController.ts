// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** listBatches GET /api/salary-batches */
export async function listBatchesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listBatchesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfPageOfSalaryBatchVO>('/api/salary-batches', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createBatch POST /api/salary-batches */
export async function createBatchUsingPost(
  body: API.SalaryBatchCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOflong>('/api/salary-batches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getBatchDetail GET /api/salary-batches/${param0} */
export async function getBatchDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBatchDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfSalaryBatchVO>(
    `/api/salary-batches/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** listDetails GET /api/salary-batches/${param0}/details */
export async function listDetailsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listDetailsUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfPageOfSalaryDetailVO>(
    `/api/salary-batches/${param0}/details`,
    {
      method: 'GET',
      params: {
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** executeCalculate POST /api/salary-batches/${param0}/execute */
export async function executeCalculateUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.executeCalculateUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfboolean>(
    `/api/salary-batches/${param0}/execute`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** markAsPaid PUT /api/salary-batches/${param0}/paid */
export async function markAsPaidUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.markAsPaidUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfboolean>(
    `/api/salary-batches/${param0}/paid`,
    {
      method: 'PUT',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** submitForApproval PUT /api/salary-batches/${param0}/submit */
export async function submitForApprovalUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitForApprovalUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfboolean>(
    `/api/salary-batches/${param0}/submit`,
    {
      method: 'PUT',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** adjustDetail PUT /api/salary-batches/details/${param0}/adjust */
export async function adjustDetailUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adjustDetailUsingPUTParams,
  body: API.SalaryDetailAdjustRequest,
  options?: { [key: string]: any },
) {
  const { detailId: param0, ...queryParams } = params;
  return request<API.BaseResponseOfboolean>(
    `/api/salary-batches/details/${param0}/adjust`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}
