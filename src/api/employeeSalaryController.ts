// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getEmployeeSalary GET /api/employee-salaries/${param0} */
export async function getEmployeeSalaryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeSalaryUsingGETParams,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseOfEmployeeSalaryVO>(
    `/api/employee-salaries/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** updateEmployeeSalary PUT /api/employee-salaries/${param0} */
export async function updateEmployeeSalaryUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateEmployeeSalaryUsingPUTParams,
  body: API.EmployeeSalaryUpdateRequest,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseOfboolean>(
    `/api/employee-salaries/${param0}`,
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

/** getSalaryHistory GET /api/employee-salaries/${param0}/history */
export async function getSalaryHistoryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSalaryHistoryUsingGETParams,
  options?: { [key: string]: any },
) {
  const { employeeId: param0, ...queryParams } = params;
  return request<API.BaseResponseOfListOfSalaryChangeHistoryVO>(
    `/api/employee-salaries/${param0}/history`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
