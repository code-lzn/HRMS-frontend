// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getProfile GET /api/profile */
export async function getProfileUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseProfileVO_>('/api/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** updateProfile PUT /api/profile */
export async function updateProfileUsingPut(
  body: API.ProfileUpdateDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getAttendanceCalendar GET /api/profile/attendance */
export async function getAttendanceCalendarUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAttendanceCalendarUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAttendanceCalendarVO_>(
    '/api/profile/attendance',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** clock POST /api/profile/attendance/clock */
export async function clockUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.clockUsingPOST1Params,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseClockResultVO_>(
    '/api/profile/attendance/clock',
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** getMyLeaves GET /api/profile/leaves */
export async function getMyLeavesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMyLeavesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageLeaveRequestVO_>('/api/profile/leaves', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** cancelLeave POST /api/profile/leaves/${param0}/cancel */
export async function cancelLeaveUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelLeaveUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/profile/leaves/${param0}/cancel`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getLoginLogs GET /api/profile/login-logs */
export async function getLoginLogsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListLoginLogVO_>('/api/profile/login-logs', {
    method: 'GET',
    ...(options || {}),
  });
}

/** changePassword PUT /api/profile/password */
export async function changePasswordUsingPut(
  body: API.PasswordChangeDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/profile/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getPendingCount GET /api/profile/pending-count */
export async function getPendingCountUsingGet1(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponsePendingCountVO_>(
    '/api/profile/pending-count',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** changePhone PUT /api/profile/phone */
export async function changePhoneUsingPut(
  body: API.PhoneChangeDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/profile/phone', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** sendPhoneVerifyCode POST /api/profile/phone/send-code */
export async function sendPhoneVerifyCodeUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.sendPhoneVerifyCodeUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/profile/phone/send-code', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** submitPhoneUnbind POST /api/profile/phone/unbind */
export async function submitPhoneUnbindUsingPost(
  body: API.PhoneUnbindDTO,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/profile/phone/unbind', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getMyPayslips GET /api/profile/salaries */
export async function getMyPayslipsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListPayslipListVO_>('/api/profile/salaries', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getPayslipDetail GET /api/profile/salaries/${param0} */
export async function getPayslipDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPayslipDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponsePayslipVO_>(
    `/api/profile/salaries/${param0}`,
    {
      method: 'GET',
      params: {
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** sendPayslipVerifyCode POST /api/profile/salaries/${param0}/verify */
export async function sendPayslipVerifyCodeUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.sendPayslipVerifyCodeUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(
    `/api/profile/salaries/${param0}/verify`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** getSalaryTrend GET /api/profile/salary-trend */
export async function getSalaryTrendUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseSalaryTrendVO_>('/api/profile/salary-trend', {
    method: 'GET',
    ...(options || {}),
  });
}
