import request from '@/libs/request';
import type { RegularizationAddRequest, RegularizationVO, PageVO } from '../types/regularization';

const BASE = '/api/regularization';

/**
 * 查询转正申请列表
 * @param params - 查询参数
 * @param params.keyword - 关键词（姓名）
 * @param params.statuses - 状态筛选列表
 * @param params.page - 页码
 * @param params.size - 每页大小
 * @returns 分页数据
 */
export function listRegularization(params: {
  keyword?: string;
  statuses?: string[];
  page: number;
  size: number;
}) {
  const parts: string[] = [];
  if (params.keyword) parts.push(`keyword=${encodeURIComponent(params.keyword)}`);
  if (params.statuses && params.statuses.length > 0) {
    params.statuses.forEach(s => parts.push(`statuses=${encodeURIComponent(s)}`));
  }
  parts.push(`page=${params.page}`);
  parts.push(`size=${params.size}`);
  return request.get<{ code: number; data: PageVO<RegularizationVO>; message: string }>(
    `${BASE}/list?${parts.join('&')}`
  );
}

/**
 * 获取转正申请详情
 * @param id - 转正申请ID
 * @returns 转正申请详情
 */
export function getRegularizationDetail(id: number) {
  return request.get<{ code: number; data: RegularizationVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

/**
 * 保存转正申请草稿
 * @param data - 转正申请数据
 * @returns 保存结果
 */
export function saveDraft(data: RegularizationAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

/**
 * 提交转正申请（立即进入审批流程）
 * @param data - 转正申请数据
 * @returns 提交结果
 */
export function submitRegularization(data: RegularizationAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

/**
 * 提交已保存的草稿进行审批
 * @param id - 转正申请ID
 * @returns 提交结果
 */
export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

/**
 * 更新转正申请（仅草稿状态可编辑）
 * @param id - 转正申请ID
 * @param data - 更新数据
 * @returns 更新结果
 */
export function updateRegularization(id: number, data: RegularizationAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

/**
 * 删除转正申请
 * @param id - 转正申请ID
 * @returns 删除结果
 */
export function deleteRegularization(id: number) {
  return request.delete(`${BASE}/${id}`);
}

/**
 * 撤回审批中的转正申请
 * @param id - 转正申请ID
 * @returns 撤回结果
 */
export function revokeRegularization(id: number) {
  return request.post(`${BASE}/${id}/revoke`);
}

/**
 * 放弃已批准的转正申请
 * @param id - 转正申请ID
 * @returns 放弃结果
 */
export function abandonRegularization(id: number) {
  return request.post(`${BASE}/${id}/abandon`);
}

/**
 * 确认转正（立即生效）
 * @param id - 转正申请ID
 * @returns 确认结果
 */
export function confirmRegularization(id: number) {
  return request.post(`${BASE}/${id}/confirm`);
}

/**
 * 修改转正日期（已批准待转正状态下）
 * @param id - 转正申请ID
 * @param regularizationDate - 新转正日期（yyyy-MM-dd）
 * @returns 修改结果
 */
export function updateRegularizationDate(id: number, regularizationDate: string) {
  return request.put(`${BASE}/${id}/regularization-date`, null, { params: { regularizationDate } });
}

/**
 * 重新发起已拒绝的转正申请
 * @param id - 转正申请ID
 * @returns 重新发起结果
 */
export function resubmitRegularization(id: number) {
  return request.post(`${BASE}/${id}/resubmit`);
}

/**
 * 获取转正统计数据（各状态数量）
 * @returns 统计数据
 */
export function getRegularizationStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
