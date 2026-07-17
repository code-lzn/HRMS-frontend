// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getPayslipDetail GET /api/payslips/${param0} */
export async function getPayslipDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPayslipDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponsePayslipVO_>(`/api/payslips/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** verifyPayslip POST /api/payslips/${param0}/verify */
export async function verifyPayslipUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.verifyPayslipUsingPOSTParams,
  body: API.PayslipVerifyRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/payslips/${param0}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** getMyPayslips GET /api/payslips/my */
export async function getMyPayslipsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListPayslipVO_>('/api/payslips/my', {
    method: 'GET',
    ...(options || {}),
  });
}
