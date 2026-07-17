// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getAllGroups GET /api/attendance/rule/groups */
export async function getAllGroupsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListAttendanceGroupVO_>(
    '/api/attendance/rule/groups',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** updateGroup PUT /api/attendance/rule/groups */
export async function updateGroupUsingPut(
  body: API.AttendanceGroupDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceGroupVO_>(
    '/api/attendance/rule/groups',
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

/** createGroup POST /api/attendance/rule/groups */
export async function createGroupUsingPost(
  body: API.AttendanceGroupDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceGroupVO_>(
    '/api/attendance/rule/groups',
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

/** getGroupDetail GET /api/attendance/rule/groups/${param0} */
export async function getGroupDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getGroupDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseAttendanceGroupVO_>(
    `/api/attendance/rule/groups/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** deleteGroup DELETE /api/attendance/rule/groups/${param0} */
export async function deleteGroupUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteGroupUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/rule/groups/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** assignEmployees POST /api/attendance/rule/groups/${param0}/employees */
export async function assignEmployeesUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.assignEmployeesUsingPOSTParams,
  body: number[],
  options?: { [key: string]: any },
) {
  const { groupId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/rule/groups/${param0}/employees`,
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

/** removeEmployees DELETE /api/attendance/rule/groups/${param0}/employees */
export async function removeEmployeesUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeEmployeesUsingDELETEParams,
  body: number[],
  options?: { [key: string]: any },
) {
  const { groupId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/rule/groups/${param0}/employees`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** getAllHolidays GET /api/attendance/rule/holidays */
export async function getAllHolidaysUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListHolidayConfigVO_>(
    '/api/attendance/rule/holidays',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** updateHoliday PUT /api/attendance/rule/holidays */
export async function updateHolidayUsingPut(
  body: API.HolidayConfig,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHolidayConfigVO_>(
    '/api/attendance/rule/holidays',
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

/** createHoliday POST /api/attendance/rule/holidays */
export async function createHolidayUsingPost(
  body: API.HolidayConfig,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseHolidayConfigVO_>(
    '/api/attendance/rule/holidays',
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

/** getHolidayDetail GET /api/attendance/rule/holidays/${param0} */
export async function getHolidayDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHolidayDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseHolidayConfigVO_>(
    `/api/attendance/rule/holidays/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** deleteHoliday DELETE /api/attendance/rule/holidays/${param0} */
export async function deleteHolidayUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteHolidayUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/attendance/rule/holidays/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getHolidaysByYear GET /api/attendance/rule/holidays/year/${param0} */
export async function getHolidaysByYearUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHolidaysByYearUsingGETParams,
  options?: { [key: string]: any },
) {
  const { year: param0, ...queryParams } = params;
  return request<API.BaseResponseListHolidayConfigVO_>(
    `/api/attendance/rule/holidays/year/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
