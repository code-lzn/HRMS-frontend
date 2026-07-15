// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** listAccounts GET /api/salary-manage/accounts */
export async function listAccountsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSalaryAccountVO_>(
    '/api/salary-manage/accounts',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** createAccount POST /api/salary-manage/accounts */
export async function createAccountUsingPost(
  body: API.SalaryAccountRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/salary-manage/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getAccountDetail GET /api/salary-manage/accounts/${param0} */
export async function getAccountDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAccountDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSalaryAccountVO_>(
    `/api/salary-manage/accounts/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateAccount PUT /api/salary-manage/accounts/${param0} */
export async function updateAccountUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateAccountUsingPUTParams,
  body: API.SalaryAccountRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}`,
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

/** deleteAccount DELETE /api/salary-manage/accounts/${param0} */
export async function deleteAccountUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAccountUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** copyAccount POST /api/salary-manage/accounts/${param0}/copy */
export async function copyAccountUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.copyAccountUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseLong_>(
    `/api/salary-manage/accounts/${param0}/copy`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** addItem POST /api/salary-manage/accounts/${param0}/items */
export async function addItemUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addItemUsingPOSTParams,
  body: API.SalaryItemRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}/items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** sortItems PUT /api/salary-manage/accounts/${param0}/items/sort */
export async function sortItemsUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.sortItemsUsingPUTParams,
  body: API.SalaryItemSortRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}/items/sort`,
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

/** listBatches GET /api/salary-manage/batches */
export async function listBatchesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSalaryBatchVO_>(
    '/api/salary-manage/batches',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** createBatch POST /api/salary-manage/batches */
export async function createBatchUsingPost(
  body: API.SalaryBatchCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseSalaryBatchVO_>('/api/salary-manage/batches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getBatchDetail GET /api/salary-manage/batches/${param0} */
export async function getBatchDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBatchDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSalaryBatchVO_>(
    `/api/salary-manage/batches/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** adjustDetail PUT /api/salary-manage/batches/${param0}/adjust */
export async function adjustDetailUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adjustDetailUsingPUTParams,
  body: API.SalaryBatchAdjustRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/adjust`,
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

/** getAnomalies GET /api/salary-manage/batches/${param0}/anomalies */
export async function getAnomaliesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAnomaliesUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseListSalaryDetailVO_>(
    `/api/salary-manage/batches/${param0}/anomalies`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** approveBatch POST /api/salary-manage/batches/${param0}/approve */
export async function approveBatchUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.approveBatchUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/approve`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** calculateBatch POST /api/salary-manage/batches/${param0}/calculate */
export async function calculateBatchUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.calculateBatchUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/calculate`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** markPaid POST /api/salary-manage/batches/${param0}/mark-paid */
export async function markPaidUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.markPaidUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/mark-paid`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** previewBatch GET /api/salary-manage/batches/${param0}/preview */
export async function previewBatchUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.previewBatchUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSalaryBatchPreviewVO_>(
    `/api/salary-manage/batches/${param0}/preview`,
    {
      method: 'GET',
      params: {
        // current has a default value: 1
        current: '1',
        // size has a default value: 20
        size: '20',
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** rejectBatch POST /api/salary-manage/batches/${param0}/reject */
export async function rejectBatchUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.rejectBatchUsingPOSTParams,
  body: API.SalaryBatchRejectRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/reject`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** submitForApproval POST /api/salary-manage/batches/${param0}/submit */
export async function submitForApprovalUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitForApprovalUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/submit`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getEmployeeSalary GET /api/salary-manage/employee-salaries/${param0} */
export async function getEmployeeSalaryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeSalaryUsingGETParams,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseEmployeeSalaryVO_>(
    `/api/salary-manage/employee-salaries/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateEmployeeSalary PUT /api/salary-manage/employee-salaries/${param0} */
export async function updateEmployeeSalaryUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateEmployeeSalaryUsingPUTParams,
  body: API.EmployeeSalaryUpdateRequest,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/employee-salaries/${param0}`,
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

/** getEmployeeSalaryHistory GET /api/salary-manage/employee-salaries/${param0}/history */
export async function getEmployeeSalaryHistoryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeSalaryHistoryUsingGETParams,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseListSalaryChangeLogVO_>(
    `/api/salary-manage/employee-salaries/${param0}/history`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateItem PUT /api/salary-manage/items/${param0} */
export async function updateItemUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateItemUsingPUTParams,
  body: API.SalaryItemRequest,
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/items/${param0}`,
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

/** deleteItem DELETE /api/salary-manage/items/${param0} */
export async function deleteItemUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteItemUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/items/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
