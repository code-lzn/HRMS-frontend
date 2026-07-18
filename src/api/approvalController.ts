// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** 查询待办列表 GET /api/approvals/pending */
export async function getPendingList(
  params: { bizType?: string; current?: number; pageSize?: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePendingItemVO_>('/api/approvals/pending', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 获取待办数量 GET /api/approvals/pending-count */
export async function getPendingCount(options?: { [key: string]: any }) {
  return request<API.BaseResponsePendingCountVO_>(
    '/api/approvals/pending-count',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** 查询已办列表 GET /api/approvals/processed */
export async function getProcessedList(
  params: { bizType?: string; current?: number; pageSize?: number },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageProcessedItemVO_>(
    '/api/approvals/processed',
    {
      method: 'GET',
      params,
      ...(options || {}),
    },
  );
}

/** 获取审批详情 GET /api/approvals/{instanceId} */
export async function getApprovalDetail(
  instanceId: number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalInstanceVO_>(
    `/api/approvals/${instanceId}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** 审批通过 POST /api/approvals/{nodeId}/approve */
export async function approve(
  nodeId: number,
  body: { comment?: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalActionVO_>(
    `/api/approvals/${nodeId}/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** 审批拒绝 POST /api/approvals/{nodeId}/reject */
export async function rejectApproval(
  nodeId: number,
  body: { comment: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalActionVO_>(
    `/api/approvals/${nodeId}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** 审批转交 POST /api/approvals/{nodeId}/transfer */
export async function transferApproval(
  nodeId: number,
  body: { toApproverId: number; comment?: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalActionVO_>(
    `/api/approvals/${nodeId}/transfer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** 撤回申请 POST /api/approvals/{instanceId}/cancel */
export async function cancelApproval(
  instanceId: number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalActionVO_>(
    `/api/approvals/${instanceId}/cancel`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** 设置委托审批 POST /api/approvals/delegates */
export async function createDelegate(
  body: { delegateId: number; startTime: string; endTime: string },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApprovalDelegateVO_>(
    '/api/approvals/delegates',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      ...(options || {}),
    },
  );
}

/** 取消委托审批 DELETE /api/approvals/delegates/{id} */
export async function cancelDelegate(
  id: number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>(`/api/approvals/delegates/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 查询我的委托 GET /api/approvals/delegates/my */
export async function getMyDelegates(options?: { [key: string]: any }) {
  return request<API.BaseResponseMyDelegatesVO_>(
    '/api/approvals/delegates/my',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
