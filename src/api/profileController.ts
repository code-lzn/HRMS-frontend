// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getMyProfile GET /api/employee/profile/getMyProfile */
export async function getMyProfileUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMyProfileUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMyProfileVO_>(
    '/api/employee/profile/getMyProfile',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getChangeLogs GET /api/employee/profile/log/list */
export async function getChangeLogsUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChangeLogsUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEmployeeChangeLogVO_>(
    '/api/employee/profile/log/list',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** updateMyDetail PUT /api/employee/profile/updateMyDetail */
export async function updateMyDetailUsingPut(
  body: API.MyDetailUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMapStringObject_>(
    '/api/employee/profile/updateMyDetail',
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
