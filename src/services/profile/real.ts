/**
 * 真实 API 调用层 — 包装 @/api/profileController 的生成函数，
 * 提取 response.data 并适配为 mock 同款函数签名。
 * 切换到真实后端时，只需改 src/services/profile/index.ts 的 import 源。
 */
import request from '@/libs/request';
import {
  getProfileUsingGet,
  updateProfileUsingPut,
  getAttendanceCalendarUsingGet,
  clockUsingPost1,
  getMyLeavesUsingGet,
  cancelLeaveUsingPost,
  getMyPayslipsUsingGet,
  getPayslipDetailUsingGet,
  sendPayslipVerifyCodeUsingPost,
  getSalaryTrendUsingGet,
  changePasswordUsingPut,
  changePhoneUsingPut,
  getLoginLogsUsingGet,
  getPendingCountUsingGet1,
} from '@/api/profileController';
import type {
  ProfileVO,
  ProfileUpdateDTO,
  AttendanceCalendarVO,
  ClockResultVO,
  LeaveRecord,
  PayslipListItem,
  PayslipDetailVO,
  SalaryTrendVO,
  LoginLogVO,
  PendingCountVO,
} from './typings';

// ========== 我的档案 ==========
export async function getProfile(): Promise<ProfileVO> {
  const res = await getProfileUsingGet();
  return res?.data as any;
}

export async function updateProfile(data: ProfileUpdateDTO): Promise<void> {
  await updateProfileUsingPut(data as any);
}

// ========== 我的考勤 ==========
export async function getAttendanceCalendar(yearMonth: string): Promise<AttendanceCalendarVO> {
  const res = await getAttendanceCalendarUsingGet({ yearMonth });
  return res?.data as any;
}

export async function clock(type: 'IN' | 'OUT'): Promise<ClockResultVO> {
  const res = await clockUsingPost1({ clockType: type === 'IN' ? 1 : 2 } as any);
  return res?.data as any;
}

export async function getMySupplementCards(page = 1, size = 10): Promise<any> {
  const res: any = await request('/api/profile/supplement-cards', {
    method: 'GET',
    params: { page, size },
  });
  return res?.data || { records: [] };
}

// ========== 我的请假 ==========
export async function getLeaves(params?: {
  status?: number;
  page?: number;
  size?: number;
}): Promise<{ total: number; records: LeaveRecord[] }> {
  const res = await getMyLeavesUsingGet(params as any);
  return res?.data as any;
}

export async function cancelLeave(id: number): Promise<void> {
  await cancelLeaveUsingPost({ id } as any);
}

// ========== 我的薪资 ==========
export async function getSalaryList(): Promise<PayslipListItem[]> {
  const res = await getMyPayslipsUsingGet();
  return res?.data as any;
}

export async function sendSalaryVerifyCode(id: number): Promise<void> {
  await sendPayslipVerifyCodeUsingPost({ id } as any);
}

export async function getSalaryDetail(id: number, verifyCode?: string): Promise<PayslipDetailVO> {
  const res = await getPayslipDetailUsingGet({ id, verifyCode } as any);
  return res?.data as any;
}

export async function getSalaryTrend(): Promise<SalaryTrendVO> {
  const res = await getSalaryTrendUsingGet();
  return res?.data as any;
}

// ========== 账号安全 ==========
export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await changePasswordUsingPut(data as any);
}

export async function changePhone(data: { newPhone: string; verifyCode: string }): Promise<void> {
  await changePhoneUsingPut(data as any);
}

export async function getLoginLogs(): Promise<LoginLogVO[]> {
  const res = await getLoginLogsUsingGet();
  return res?.data as any;
}

// ========== 待办红点 ==========
export async function getPendingCount(): Promise<PendingCountVO> {
  const res = await getPendingCountUsingGet1();
  return res?.data as any;
}
