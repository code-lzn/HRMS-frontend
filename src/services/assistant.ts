/**
 * HRMS 智能助手 API
 *
 * 后端: FastAPI (D:\代码\hrms助手\server.py)
 * 代理: .umirc.ts 中配置 /api/chat → http://localhost:8000
 */

export interface ChatRequest {
  message: string;
  thread_id?: string;
}

export interface RouteInfo {
  path: string;
  name: string;
  description: string;
  icon: string;
  exist: boolean;
  fallback_path?: string;
  fallback_name?: string;
  fallback_reason?: string;
  related_routes?: Array<{
    path: string;
    name: string;
    reason: string;
  }>;
}

export interface ChatResponse {
  response: string;
  route: RouteInfo | null;
  intent: {
    category: string;
    action: string;
    confidence: number;
  };
  error: string | null;
}

const API_BASE = '/api/chat';

/**
 * 发送对话消息
 */
export async function sendMessage(
  message: string,
  threadId: string = 'default',
): Promise<ChatResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      thread_id: threadId,
    } as ChatRequest),
  });

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * 从回复文本中解析路由信息
 *
 * 后端在回复末尾嵌入 <!--ROUTE:{"type":"route_push","route":{...}}-->
 * 前端解析后渲染为路由跳转卡片，并从文本中移除该注释
 */
export function parseRouteFromResponse(response: string): {
  cleanText: string;
  route: RouteInfo | null;
} {
  const routeRegex = /<!--ROUTE:(\{.*?\})-->/;
  const match = response.match(routeRegex);

  if (!match) {
    return { cleanText: response, route: null };
  }

  try {
    const routeData = JSON.parse(match[1]);
    const cleanText = response.replace(routeRegex, '').trim();
    return {
      cleanText,
      route: routeData.route || null,
    };
  } catch {
    return { cleanText: response, route: null };
  }
}
