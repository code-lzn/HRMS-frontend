// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** queryAttendanceGroups GET /api/api/attendance/groups */
export async function queryAttendanceGroupsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryAttendanceGroupsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfPageOfAttendanceGroupListVO>(
    '/api/api/attendance/groups',
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

/** createAttendanceGroup POST /api/api/attendance/groups */
export async function createAttendanceGroupUsingPost(
  body: API.AttendanceGroupCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfAttendanceGroupVO>(
    '/api/api/attendance/groups',
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

/** updateAttendanceGroup PUT /api/api/attendance/groups/${param0} */
export async function updateAttendanceGroupUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateAttendanceGroupUsingPUTParams,
  body: API.AttendanceGroupUpdateRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfAttendanceGroupVO>(
    `/api/api/attendance/groups/${param0}`,
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

/** deleteAttendanceGroup DELETE /api/api/attendance/groups/${param0} */
export async function deleteAttendanceGroupUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAttendanceGroupUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfVoid>(
    `/api/api/attendance/groups/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
