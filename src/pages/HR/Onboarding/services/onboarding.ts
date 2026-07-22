import request from '@/libs/request';
import type { OnboardingAddRequest, OnboardingVO, PageVO } from '../types/onboarding';

const BASE = '/api/onboarding';

/**
 * 查询入职申请列表
 * @param params - 查询参数
 * @param params.keyword - 关键词（姓名）
 * @param params.statuses - 状态筛选列表
 * @param params.page - 页码
 * @param params.size - 每页大小
 * @returns 分页数据
 */
export function listOnboarding(params: {
  keyword?: string;
  statuses?: string[];
  page: number;
  size: number;
}) {
  const queryParts: string[] = [];
  if (params.keyword) {
    queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
  }
  if (params.statuses && params.statuses.length > 0) {
    params.statuses.forEach(s => {
      queryParts.push(`statuses=${encodeURIComponent(s)}`);
    });
  }
  queryParts.push(`page=${params.page}`);
  queryParts.push(`size=${params.size}`);
  
  const url = `${BASE}/list?${queryParts.join('&')}`;
  return request.get<{ code: number; data: PageVO<OnboardingVO>; message: string }>(url);
}

/**
 * 获取入职申请详情
 * @param id - 入职申请ID
 * @returns 入职申请详情
 */
export function getOnboardingDetail(id: number) {
  return request.get<{ code: number; data: OnboardingVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

/**
 * 保存入职申请草稿
 * @param data - 入职申请数据
 * @returns 保存结果（含ID）
 */
export function saveDraft(data: OnboardingAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

/**
 * 提交入职申请（立即进入审批流程）
 * @param data - 入职申请数据
 * @returns 提交结果（含ID和审批记录ID）
 */
export function submitOnboarding(data: OnboardingAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

/**
 * 提交已保存的草稿进行审批
 * @param id - 入职申请ID
 * @returns 提交结果
 */
export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

/**
 * 更新入职申请（仅草稿状态可编辑）
 * @param id - 入职申请ID
 * @param data - 更新数据
 * @returns 更新结果
 */
export function updateOnboarding(id: number, data: OnboardingAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

/**
 * 删除入职申请
 * @param id - 入职申请ID
 * @returns 删除结果
 */
export function deleteOnboarding(id: number) {
  return request.delete(`${BASE}/${id}`);
}

/**
 * HR确认入职（设置实际入职日期）
 * @param id - 入职申请ID
 * @param actualEntryDate - 实际入职日期（yyyy-MM-dd）
 * @returns 确认结果
 */
export function confirmOnboarding(id: number, actualEntryDate: string) {
  return request.post(`${BASE}/confirm`, null, {
    params: { id, actualEntryDate },
  });
}

/**
 * HR放弃入职申请（审批通过后）
 * @param id - 入职申请ID
 * @returns 放弃结果
 */
export function abandonOnboarding(id: number) {
  return request.post(`${BASE}/abandon`, null, { params: { id } });
}

/**
 * 撤回入职申请（审批中，仅限第一步）
 * @param id - 入职申请ID
 * @returns 撤回结果
 */
export function revokeOnboarding(id: number) {
  return request.post(`${BASE}/${id}/revoke`);
}

/**
 * 修改预定入职日期（审批通过后）
 * @param id - 入职申请ID
 * @param hireDate - 新入职日期（yyyy-MM-dd）
 * @returns 修改结果
 */
export function updateHireDate(id: number, hireDate: string) {
  return request.put(`${BASE}/${id}/hire-date`, null, { params: { hireDate } });
}

/**
 * 重新发起入职审批（被拒绝后）
 * @param id - 入职申请ID
 * @returns 重新发起结果
 */
export function resubmitOnboarding(id: number) {
  return request.post(`${BASE}/${id}/resubmit`);
}

/**
 * 获取入职统计数据（各状态数量）
 * @returns 统计数据
 */
export function getOnboardingStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
