import request from '@/libs/request';
import type { TransferAddRequest, TransferVO, PageVO } from '../types/transfer';

const BASE = '/api/transfer';

export function listTransfer(params: {
  keyword?: string;
  statuses?: string[];
  page: number;
  size: number;
}) {
  return request.get<{ code: number; data: PageVO<TransferVO>; message: string }>(
    `${BASE}/list`, { params }
  );
}

export function getTransferDetail(id: number) {
  return request.get<{ code: number; data: TransferVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

export function saveDraft(data: TransferAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

export function submitTransfer(data: TransferAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

export function updateTransfer(id: number, data: TransferAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

export function deleteTransfer(id: number) {
  return request.delete(`${BASE}/${id}`);
}

export function getTransferStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
