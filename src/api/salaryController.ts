// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

const BASE = '/api';

// ==================== 薪资账套 ====================

/** listAccounts GET /api/v1/salary-accounts */
export async function listAccountsUsingGet(
  params?: API.SalaryAccountQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryAccountVO_>(
    `${BASE}/salary-accounts`,
    {
      method: 'GET',
      params,
      ...(options || {}),
    },
  );
}

/** getAccount GET /api/v1/salary-accounts/{id} */
export async function getAccountUsingGet(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseSalaryAccountVO_>(
    `${BASE}/salary-accounts/${id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** createAccount POST /api/v1/salary-accounts */
export async function createAccountUsingPost(
  body: API.SalaryAccountAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>(`${BASE}/salary-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** updateAccount PUT /api/v1/salary-accounts/{id} */
export async function updateAccountUsingPut(
  id: string | number,
  body: API.SalaryAccountUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(`${BASE}/salary-accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** deleteAccount DELETE /api/v1/salary-accounts/{id} */
export async function deleteAccountUsingDelete(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(`${BASE}/salary-accounts/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

// ==================== 工资项目 ====================

/** listItems GET /api/v1/salary-accounts/{id}/items */
export async function listItemsUsingGet(
  accountId: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryItemVO_>(
    `${BASE}/salary-accounts/${accountId}/items`,
    { method: 'GET', ...(options || {}) },
  );
}

/** addItem POST /api/v1/salary-accounts/{id}/items */
export async function addItemUsingPost(
  accountId: string | number,
  body: API.SalaryItemAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>(
    `${BASE}/salary-accounts/${accountId}/items`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** updateItem PUT /api/v1/salary-accounts/items/{itemId} */
export async function updateItemUsingPut(
  itemId: string | number,
  body: API.SalaryItemUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-accounts/items/${itemId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** deleteItem DELETE /api/v1/salary-accounts/items/{itemId} */
export async function deleteItemUsingDelete(
  itemId: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-accounts/items/${itemId}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

/** sortItems PUT /api/v1/salary-accounts/{id}/items/sort */
export async function sortItemsUsingPut(
  accountId: string | number,
  body: API.SalaryItemSortRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-accounts/${accountId}/items/sort`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

// ==================== 员工薪资档案 ====================

/** getEmployeeSalary GET /api/v1/employee-salaries/{employeeId} */
export async function getEmployeeSalaryUsingGet(
  employeeId: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseEmployeeSalaryVO_>(
    `${BASE}/employee-salaries/${employeeId}`,
    { method: 'GET', ...(options || {}) },
  );
}

/** updateEmployeeSalary PUT /api/v1/employee-salaries/{employeeId} */
export async function updateEmployeeSalaryUsingPut(
  employeeId: string | number,
  body: API.EmployeeSalaryUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/employee-salaries/${employeeId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** getSalaryHistory GET /api/v1/employee-salaries/{employeeId}/history */
export async function getSalaryHistoryUsingGet(
  employeeId: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryChangeHistoryVO_>(
    `${BASE}/employee-salaries/${employeeId}/history`,
    { method: 'GET', ...(options || {}) },
  );
}

// ==================== 薪资核算批次 ====================

/** listBatches GET /api/v1/salary-batches */
export async function listBatchesUsingGet(
  params?: API.SalaryBatchQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageSalaryBatchVO_>(`${BASE}/salary-batches`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** createBatch POST /api/v1/salary-batches */
export async function createBatchUsingPost(
  body: API.SalaryBatchCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>(`${BASE}/salary-batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** getBatchDetail GET /api/v1/salary-batches/{id} */
export async function getBatchDetailUsingGet(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseSalaryBatchVO_>(
    `${BASE}/salary-batches/${id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** executeCalculate POST /api/v1/salary-batches/{id}/execute */
export async function executeCalculateUsingPost(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/${id}/execute`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** listDetails GET /api/v1/salary-batches/{id}/details */
export async function listDetailsUsingGet(
  batchId: string | number,
  params?: API.SalaryDetailQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageSalaryDetailVO_>(
    `${BASE}/salary-batches/${batchId}/details`,
    { method: 'GET', params, ...(options || {}) },
  );
}

/** adjustDetail PUT /api/v1/salary-batches/details/{detailId}/adjust */
export async function adjustDetailUsingPut(
  detailId: string | number,
  body: API.SalaryDetailAdjustRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/details/${detailId}/adjust`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** submitForApproval PUT /api/v1/salary-batches/{id}/submit */
export async function submitForApprovalUsingPut(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/${id}/submit`,
    {
      method: 'PUT',
      ...(options || {}),
    },
  );
}

/** approve PUT /api/v1/salary-batches/{id}/approve */
export async function approveUsingPut(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/${id}/approve`,
    {
      method: 'PUT',
      ...(options || {}),
    },
  );
}

/** reject PUT /api/v1/salary-batches/{id}/reject */
export async function rejectUsingPut(
  id: string | number,
  body: API.SalaryBatchRejectRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/${id}/reject`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** markAsPaid PUT /api/v1/salary-batches/{id}/paid */
export async function markAsPaidUsingPut(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(
    `${BASE}/salary-batches/${id}/paid`,
    {
      method: 'PUT',
      ...(options || {}),
    },
  );
}

// ==================== 工资条（员工自助） ====================

/** getMyPayslips GET /api/v1/payslips/my */
export async function getMyPayslipsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListPayslipVO_>(`${BASE}/payslips/my`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** getPayslipDetail GET /api/v1/payslips/{id} */
export async function getPayslipDetailUsingGet(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePayslipVO_>(`${BASE}/payslips/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** verifyPayslip POST /api/v1/payslips/{id}/verify */
export async function verifyPayslipUsingPost(
  id: string | number,
  body: API.PayslipVerifyRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(`${BASE}/payslips/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** sendVerifyCode POST /api/v1/payslips/{id}/send-code */
export async function sendPayslipVerifyCodeUsingPost(
  id: string | number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(`${BASE}/payslips/${id}/send-code`, {
    method: 'POST',
    ...(options || {}),
  });
}

// ==================== 薪资统计 ====================

/** getMonthlyTrend GET /api/v1/salary-statistics/monthly-trend */
export async function getMonthlyTrendUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMapStringObject_>(
    `${BASE}/salary-statistics/monthly-trend`,
    { method: 'GET', ...(options || {}) },
  );
}

/** getDepartmentDistribution GET /api/v1/salary-statistics/department-distribution */
export async function getDepartmentDistributionUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMapStringObject_>(
    `${BASE}/salary-statistics/department-distribution`,
    { method: 'GET', ...(options || {}) },
  );
}

/** getComposition GET /api/v1/salary-statistics/composition */
export async function getCompositionUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMapStringObject_>(
    `${BASE}/salary-statistics/composition`,
    { method: 'GET', ...(options || {}) },
  );
}

/** getVariationDistribution GET /api/v1/salary-statistics/variation-distribution */
export async function getVariationDistributionUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListMapStringObject_>(
    `${BASE}/salary-statistics/variation-distribution`,
    { method: 'GET', ...(options || {}) },
  );
}
