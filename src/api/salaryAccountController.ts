// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** listAccounts GET /api/salary-accounts */
export async function listAccountsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listAccountsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListSalaryAccountVO_>('/api/salary-accounts', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** createAccount POST /api/salary-accounts */
export async function createAccountUsingPost(
  body: API.SalaryAccountAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/salary-accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getAccount GET /api/salary-accounts/${param0} */
export async function getAccountUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAccountUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseSalaryAccountVO_>(
    `/api/salary-accounts/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateAccount PUT /api/salary-accounts/${param0} */
export async function updateAccountUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateAccountUsingPUTParams,
  body: API.SalaryAccountUpdateRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/salary-accounts/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** deleteAccount DELETE /api/salary-accounts/${param0} */
export async function deleteAccountUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAccountUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/salary-accounts/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** listItems GET /api/salary-accounts/${param0}/items */
export async function listItemsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listItemsUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseListSalaryItemVO_>(
    `/api/salary-accounts/${param0}/items`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** addItem POST /api/salary-accounts/${param0}/items */
export async function addItemUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addItemUsingPOSTParams,
  body: API.SalaryItemAddRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseLong_>(
    `/api/salary-accounts/${param0}/items`,
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

/** sortItems PUT /api/salary-accounts/${param0}/items/sort */
export async function sortItemsUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.sortItemsUsingPUTParams,
  body: API.SalaryItemSortRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/salary-accounts/${param0}/items/sort`,
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

/** updateItem PUT /api/salary-accounts/items/${param0} */
export async function updateItemUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateItemUsingPUTParams,
  body: API.SalaryItemUpdateRequest,
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/salary-accounts/items/${param0}`,
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

/** deleteItem DELETE /api/salary-accounts/items/${param0} */
export async function deleteItemUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteItemUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/salary-accounts/items/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
