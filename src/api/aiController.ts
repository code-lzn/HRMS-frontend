/* eslint-disable */
import { request } from '@umijs/max';

// ==================== SSE 流式对话 ====================

/**
 * SSE 流式对话（返回原始 Response，由调用方读取 ReadableStream）
 * POST /api/ai/chat/stream
 */
export async function chatStreamUsingPost(
  body: API.AIChatStreamRequest,
  options?: { [key: string]: any },
): Promise<Response> {
  // 不走 request 封装，直接用 fetch 消费 SSE 流
  const url = '/api/ai/chat/stream';
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...(options || {}),
  });
}

// ==================== 会话管理 ====================

/** 获取会话列表 GET /api/ai/sessions */
export async function getSessionsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListAISessionVO_>('/api/ai/sessions', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新建会话 POST /api/ai/session/new */
export async function createSessionUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/ai/session/new', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取会话历史 GET /api/ai/history/{sessionId} */
export async function getHistoryUsingGet(
  params: { sessionId: string },
  options?: { [key: string]: any },
) {
  const { sessionId } = params;
  return request<API.BaseResponseListAIChatMessageVO_>(
    `/api/ai/history/${sessionId}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** 删除会话 DELETE /api/ai/session/{sessionId} */
export async function deleteSessionUsingDelete(
  params: { sessionId: string },
  options?: { [key: string]: any },
) {
  const { sessionId } = params;
  return request<API.BaseResponseBoolean_>(`/api/ai/session/${sessionId}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

// ==================== 反馈 ====================

/** 提交点赞/点踩 POST /api/ai/feedback */
export async function submitFeedbackUsingPost(
  body: API.AIFeedbackRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/ai/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}
