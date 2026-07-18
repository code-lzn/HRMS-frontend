import request from '@/libs/request';
import type { ResignationAddRequest, ResignationVO, PageVO } from '../types/resignation';

const BASE = '/api/resignation';

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

export function getResignationDetail(id: number) {
  return request.get<{ code: number; data: ResignationVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

export function saveDraft(data: ResignationAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

export function submitResignation(data: ResignationAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

export function updateResignation(id: number, data: ResignationAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

export function deleteResignation(id: number) {
  return request.delete(`${BASE}/${id}`);
}

export function getResignationStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
