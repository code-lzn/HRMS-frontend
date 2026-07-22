import request from '@/libs/request';
import type { ResignationAddRequest, ResignationVO, PageVO } from '../types/resignation';

const BASE = '/api/resignation';

/**
 * 查询离职申请列表
 * @param params - 查询参数
 * @param params.keyword - 关键词（姓名）
 * @param params.statuses - 状态筛选列表
 * @param params.page - 页码
 * @param params.size - 每页大小
 * @returns 分页数据
 */
export function listResignation(params: {
  keyword?: string;
  statuses?: string[];
  page: number;
  size: number;
}) {
  return request.get<{ code: number; data: PageVO<ResignationVO>; message: string }>(
    `${BASE}/list`, { params }
  );
}

/**
 * 获取离职申请详情
 * @param id - 离职申请ID
 * @returns 离职申请详情
 */
export function getResignationDetail(id: number) {
  return request.get<{ code: number; data: ResignationVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

/**
 * 保存离职申请草稿
 * @param data - 离职申请数据
 * @returns 保存结果
 */
export function saveDraft(data: ResignationAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

/**
 * 提交离职申请（立即进入审批流程）
 * @param data - 离职申请数据
 * @returns 提交结果
 */
export function submitResignation(data: ResignationAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

/**
 * 提交已保存的草稿进行审批
 * @param id - 离职申请ID
 * @returns 提交结果
 */
export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

/**
 * 更新离职申请（仅草稿状态可编辑）
 * @param id - 离职申请ID
 * @param data - 更新数据
 * @returns 更新结果
 */
export function updateResignation(id: number, data: ResignationAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

/**
 * 删除离职申请
 * @param id - 离职申请ID
 * @returns 删除结果
 */
export function deleteResignation(id: number) {
  return request.delete(`${BASE}/${id}`);
}

/**
 * 获取离职统计数据（各状态数量）
 * @returns 统计数据
 */
export function getResignationStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
