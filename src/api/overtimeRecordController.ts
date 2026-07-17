// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** queryRecords GET /api/api/overtime-records */
export async function queryRecordsUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryRecordsUsingGET1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfPageOfOvertimeRecordListVO>(
    '/api/api/overtime-records',
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

/** createOvertimeRecord POST /api/api/overtime-records */
export async function createOvertimeRecordUsingPost(
  body: API.OvertimeRecordCreateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseOfOvertimeRecordVO>(
    '/api/api/overtime-records',
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

/** updateOvertimeRecord PUT /api/api/overtime-records/${param0} */
export async function updateOvertimeRecordUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateOvertimeRecordUsingPUTParams,
  body: API.OvertimeRecordUpdateDTO,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfOvertimeRecordVO>(
    `/api/api/overtime-records/${param0}`,
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

/** deleteOvertimeRecord DELETE /api/api/overtime-records/${param0} */
export async function deleteOvertimeRecordUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteOvertimeRecordUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseOfVoid>(
    `/api/api/overtime-records/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
