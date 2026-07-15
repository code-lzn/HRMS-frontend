// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

// ==================== 1. 薪资账套管理 ====================

/** listAccounts GET /salary-manage/accounts */
export async function listAccountsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSalaryAccountVO_>(
    '/api/salary-manage/accounts',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getAccountDetail GET /salary-manage/accounts/${param0} */
export async function getAccountDetailUsingGet(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseSalaryAccountVO_>(
    `/api/salary-manage/accounts/${param0}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** createAccount POST /salary-manage/accounts */
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

/** updateAccount PUT /salary-manage/accounts/${param0} */
export async function updateAccountUsingPut(
  params: { id: number },
  body: API.SalaryAccountRequest,
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** deleteAccount DELETE /salary-manage/accounts/${param0} */
export async function deleteAccountUsingDelete(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

/** copyAccount POST /salary-manage/accounts/${param0}/copy */
export async function copyAccountUsingPost(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseLong_>(
    `/api/salary-manage/accounts/${param0}/copy`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

// ==================== 2. 工资项目管理 ====================

/** addItem POST /salary-manage/accounts/${param0}/items */
export async function addItemUsingPost(
  params: { id: number },
  body: API.SalaryItemRequest,
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}/items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** updateItem PUT /salary-manage/items/${param0} */
export async function updateItemUsingPut(
  params: { itemId: number },
  body: API.SalaryItemRequest,
  options?: { [key: string]: any },
) {
  const { itemId: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/items/${param0}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** deleteItem DELETE /salary-manage/items/${param0} */
export async function deleteItemUsingDelete(
  params: { itemId: number },
  options?: { [key: string]: any },
) {
  const { itemId: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/items/${param0}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

/** sortItems PUT /salary-manage/accounts/${param0}/items/sort */
export async function sortItemsUsingPut(
  params: { id: number },
  body: API.SalaryItemSortRequest,
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/accounts/${param0}/items/sort`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

// ==================== 3. 员工薪资档案管理 ====================

/** getEmployeeSalary GET /salary-manage/employee-salaries/${param0} */
export async function getEmployeeSalaryUsingGet(
  params: { employeeId: number },
  options?: { [key: string]: any },
) {
  const { employeeId: param0 } = params;
  return request<API.BaseResponseEmployeeSalaryVO_>(
    `/api/salary-manage/employee-salaries/${param0}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** updateEmployeeSalary PUT /salary-manage/employee-salaries/${param0} */
export async function updateEmployeeSalaryUsingPut(
  params: { employeeId: number },
  body: API.EmployeeSalaryUpdateRequest,
  options?: { [key: string]: any },
) {
  const { employeeId: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/employee-salaries/${param0}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** getEmployeeSalaryHistory GET /salary-manage/employee-salaries/${param0}/history */
export async function getEmployeeSalaryHistoryUsingGet(
  params: { employeeId: number },
  options?: { [key: string]: any },
) {
  const { employeeId: param0 } = params;
  return request<API.BaseResponseListSalaryChangeLogVO_>(
    `/api/salary-manage/employee-salaries/${param0}/history`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

// ==================== 4. 月度薪资核算 ====================

/** createBatch POST /salary-manage/batches */
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

/** listBatches GET /salary-manage/batches */
export async function listBatchesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSalaryBatchVO_>(
    '/api/salary-manage/batches',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** getBatchDetail GET /salary-manage/batches/${param0} */
export async function getBatchDetailUsingGet(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseSalaryBatchVO_>(
    `/api/salary-manage/batches/${param0}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** calculateBatch POST /salary-manage/batches/${param0}/calculate */
export async function calculateBatchUsingPost(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/calculate`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** previewBatch GET /salary-manage/batches/${param0}/preview */
export async function previewBatchUsingGet(
  params: { id: number } & API.getBatchPreviewUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSalaryBatchPreviewVO_>(
    `/api/salary-manage/batches/${param0}/preview`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getAnomalies GET /salary-manage/batches/${param0}/anomalies */
export async function getAnomaliesUsingGet(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseListSalaryDetailVO_>(
    `/api/salary-manage/batches/${param0}/anomalies`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** adjustDetail PUT /salary-manage/batches/${param0}/adjust */
export async function adjustDetailUsingPut(
  params: { id: number },
  body: API.SalaryBatchAdjustRequest,
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/adjust`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** submitForApproval POST /salary-manage/batches/${param0}/submit */
export async function submitForApprovalUsingPost(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/submit`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

// ==================== 5. 审批操作 ====================

/** approveBatch POST /salary-manage/batches/${param0}/approve */
export async function approveBatchUsingPost(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/approve`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** rejectBatch POST /salary-manage/batches/${param0}/reject */
export async function rejectBatchUsingPost(
  params: { id: number },
  body: API.SalaryBatchRejectRequest,
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/reject`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** markPaid POST /salary-manage/batches/${param0}/mark-paid */
export async function markPaidUsingPost(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id: param0 } = params;
  return request<API.BaseResponseString_>(
    `/api/salary-manage/batches/${param0}/mark-paid`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}
