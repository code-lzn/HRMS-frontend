// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getMyProfile GET /api/employee/profile */
export async function getMyProfileUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseEmpProfileVO_>('/api/employee/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** searchEmployees GET /api/employee/search */
export async function searchEmployeesUsingGet(
  params: { keyword?: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListEmployeeSimpleVO_>('/api/employee/search', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** updateMyProfile POST /api/employee/profileUpdate */
export async function updateMyProfileUsingPost(
  body: API.EmpProfileUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/employee/profileUpdate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
