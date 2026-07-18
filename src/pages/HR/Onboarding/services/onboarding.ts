import request from '@/libs/request';
import type { OnboardingAddRequest, OnboardingVO, PageVO } from '../types/onboarding';

const BASE = '/api/onboarding';

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

export function getOnboardingDetail(id: number) {
  return request.get<{ code: number; data: OnboardingVO; message: string }>(
    `${BASE}/detail`, { params: { id } }
  );
}

export function saveDraft(data: OnboardingAddRequest) {
  return request.post(`${BASE}/draft`, data);
}

export function submitOnboarding(data: OnboardingAddRequest) {
  return request.post(`${BASE}/submit`, data);
}

export function submitDraft(id: number) {
  return request.post(`${BASE}/${id}/submit`);
}

export function updateOnboarding(id: number, data: OnboardingAddRequest) {
  return request.put(`${BASE}/${id}`, data);
}

export function deleteOnboarding(id: number) {
  return request.delete(`${BASE}/${id}`);
}

export function confirmOnboarding(id: number, actualEntryDate: string) {
  return request.post(`${BASE}/confirm`, null, {
    params: { id, actualEntryDate },
  });
}

export function abandonOnboarding(id: number) {
  return request.post(`${BASE}/abandon`, null, { params: { id } });
}

export function revokeOnboarding(id: number) {
  return request.post(`${BASE}/${id}/revoke`);
}

export function updateHireDate(id: number, hireDate: string) {
  return request.put(`${BASE}/${id}/hire-date`, null, { params: { hireDate } });
}

export function resubmitOnboarding(id: number) {
  return request.post(`${BASE}/${id}/resubmit`);
}

export function getOnboardingStats() {
  return request.get<{ code: number; data: Record<string, number>; message: string }>(`${BASE}/stats`);
}
