import request from '@/libs/request';
import type { TransferAddRequest, TransferVO, PageVO } from '../types/transfer';

const BASE = '/api/transfer';

/**
 * 查询调岗申请列表
 * @param params - 查询参数
 * @param params.keyword - 关键词（姓名）
 * @param params.statuses - 状态筛选列表
 * @param params.page - 页码
 * @param params.size - 每页大小
 * @returns 分页数据
 */
export function listTransfer(params: {
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
  return request.get<{ code: number; data: PageVO<TransferVO>; message: string }>(
    `${BASE}/list?${parts.join('&')}`
  );
}

/**
 * 获取调岗申请详情
 * @param id - 调岗申请ID
 * @returns 调岗申请详情
 */
export function getTransferDetail(id: number) {
  return request.get<{ code: number; data: TransferVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

/**
 * 保存调岗申请草稿
 * @param data - 调岗申请数据
 * @returns 保存结果
 */
export function saveDraft(data: TransferAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

/**
 * 提交调岗申请（立即进入审批流程）
 * @param data - 调岗申请数据
 * @returns 提交结果
 */
export function submitTransfer(data: TransferAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

/**
 * 提交已保存的草稿进行审批
 * @param id - 调岗申请ID
 * @returns 提交结果
 */
export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

/**
 * 更新调岗申请（仅草稿状态可编辑）
 * @param id - 调岗申请ID
 * @param data - 更新数据
 * @returns 更新结果
 */
export function updateTransfer(id: number, data: TransferAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

/**
 * 删除调岗申请
 * @param id - 调岗申请ID
 * @returns 删除结果
 */
export function deleteTransfer(id: number) {
  return request.delete(`${BASE}/${id}`);
}

/**
 * 获取调岗统计数据（各状态数量）
 * @returns 统计数据
 */
export function getTransferStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}

/** 撤回审批中的调岗申请 */
export function revokeTransfer(id: number) {
  return request.post(`${BASE}/${id}/revoke`);
}

/** 放弃已批准的调岗申请 */
export function abandonTransfer(id: number) {
  return request.post(`${BASE}/${id}/abandon`);
}

/** 确认调岗生效 */
export function confirmTransfer(id: number) {
  return request.post(`${BASE}/${id}/confirm`);
}

/** 修改调岗生效日期 */
export function updateTransferDate(id: number, date: string) {
  return request.put(`${BASE}/${id}/transfer-date`, null, { params: { date } });
}

/** 重新发起已拒绝的调岗申请 */
export function resubmitTransfer(id: number) {
  return request.post(`${BASE}/${id}/resubmit`);
}
