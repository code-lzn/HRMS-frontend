import request from '@/libs/request';
import type { RegularizationAddRequest, RegularizationVO, PageVO } from '../types/regularization';

const BASE = '/api/regularization';

export function listRegularization(params: {
  keyword?: string;
  statuses?: string[];
  page: number;
  size: number;
}) {
  return request.get<{ code: number; data: PageVO<RegularizationVO>; message: string }>(
    `${BASE}/list`, { params }
  );
}

export function getRegularizationDetail(id: number) {
  return request.get<{ code: number; data: RegularizationVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

export function saveDraft(data: RegularizationAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

export function submitRegularization(data: RegularizationAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

export function updateRegularization(id: number, data: RegularizationAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

export function deleteRegularization(id: number) {
  return request.delete(`${BASE}/${id}`);
}

export function getRegularizationStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
