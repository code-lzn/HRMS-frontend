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
const REQUEST_TIMEOUT_MS = 30000; // 30 秒超时

/**
 * 发送对话消息（带超时和重试）
 */
export async function sendMessage(
  message: string,
  threadId: string = 'default',
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        thread_id: threadId,
      } as ChatRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(
        `请求失败 (${res.status}): ${errorText || res.statusText}`,
      );
    }

    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接后重试');
    }

    // 网络错误
    if (err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
      throw new Error('网络连接失败，请检查助手服务是否正常运行');
    }

    throw err;
  }
}

/**
 * 从回复文本中解析路由信息
 *
 * 支持两种格式：
 * 1. 后端在回复末尾嵌入 <!--ROUTE:{"type":"route_push","route":{...}}-->
 * 2. 后端直接在 ChatResponse.route 字段返回路由
 *
 * 前端解析后渲染为路由跳转卡片，并从文本中移除该注释
 */
export function parseRouteFromResponse(response: string): {
  cleanText: string;
  route: RouteInfo | null;
} {
  // 支持多种可能的 ROUTE 注释格式
  const routeRegex = /<!--ROUTE:\s*(\{.*?\})\s*-->/s;
  const match = response.match(routeRegex);

  if (!match) {
    return { cleanText: response, route: null };
  }

  try {
    const routeData = JSON.parse(match[1]);
    const cleanText = response.replace(routeRegex, '').trim();

    // 支持两种嵌套格式：{"route": {...}} 或直接 {...}
    const route = routeData.route || routeData;

    // 验证必要字段
    if (!route || !route.name) {
      return { cleanText, route: null };
    }

    return { cleanText, route: route as RouteInfo };
  } catch {
    // JSON 解析失败时，仅清理注释，不返回路由
    const cleanText = response.replace(routeRegex, '').trim();
    return { cleanText, route: null };
  }
}
