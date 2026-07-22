/**
 * useAIChatStream
 *
 * 纯 React State 驱动的 AI 流式对话 Hook。
 * 核心设计：
 *  - 所有消息（含正在流式的）全部存在 messages state 中，无 DOM 直写
 *  - 乐观更新：用户发送消息后立即插入 AI 占位消息
 *  - 流式 chunk 通过 React setState 更新，保证响应式
 *  - 支持中止/重连/异常恢复
 */
import { chatStreamUsingPost } from '@/api/aiController';
import { useCallback, useRef, useState } from 'react';

// ==================== 类型 ====================

/** 扩展消息类型，加入流式相关标志 */
export interface StreamMessage extends API.AIChatMessageVO {
  /** 是否正在流式输出中 */
  _streaming?: boolean;
  /** 是否发生了异常 */
  _error?: boolean;
}

/** SSE 事件类型 */
interface SSEEvent {
  type: 'thinking' | 'intent' | 'content' | 'route' | 'done' | 'error';
  content?: string;
  intent?: string;
  path?: string;
  label?: string;
  action?: string;
}

// ==================== 流式响应解析器 ====================

/**
 * 解析流式响应 Buffer，支持三种格式：
 * 1. 标准 SSE：`data: {"type":"content","content":"你好"}\n\n`
 * 2. 紧凑 SSE：`data:{"type":"content","content":"你好"}\n\n`  (无冒号后空格)
 * 3. 纯 JSON Lines：`{"type":"content","content":"你好"}\n`   (无 data: 前缀)
 */
function parseStreamBuffer(buffer: string): {
  events: SSEEvent[];
  rest: string;
} {
  const events: SSEEvent[] = [];
  const lastNL = buffer.lastIndexOf('\n');
  if (lastNL === -1) return { events, rest: buffer };

  const complete = buffer.slice(0, lastNL + 1);
  const rest = buffer.slice(lastNL + 1);

  for (const line of complete.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let jsonStr: string | null = null;

    // 格式 1 & 2: data: 前缀（有空格或无空格）
    if (trimmed.startsWith('data:')) {
      jsonStr = trimmed.slice(5); // 去掉 "data:"
      if (jsonStr.startsWith(' ')) jsonStr = jsonStr.slice(1); // 去掉可选空格
    } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      // 格式 3: 纯 JSON Lines（无 data: 前缀）
      jsonStr = trimmed;
    }

    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        // 支持单事件对象和事件数组
        if (Array.isArray(parsed)) {
          events.push(...parsed);
        } else {
          events.push(parsed);
        }
      } catch {
        /* ignore malformed JSON */
      }
    }
  }

  return { events, rest };
}

// ==================== 打字机效果 ====================

/**
 * 将完整内容逐步揭示，模拟流式输出。
 * 以约 15 步完成，每步间隔 60ms，总时长 ≈ 900ms。
 * 无论内容多长，都保持这个节奏，视觉上均匀流畅。
 */
function revealWithTyping(
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<StreamMessage[]>>,
): Promise<void> {
  return new Promise((resolve) => {
    if (!content) {
      resolve();
      return;
    }

    // 根据内容长度计算每步前进的字符数（确保 15 步左右完成）
    const totalSteps = 15;
    const charsPerStep = Math.max(1, Math.ceil(content.length / totalSteps));

    let pos = 0;

    const step = () => {
      const nextPos = Math.min(pos + charsPerStep, content.length);
      const isComplete = nextPos >= content.length;

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.type === 'assistant') {
          copy[copy.length - 1] = {
            ...last,
            content: content.slice(0, nextPos),
            _streaming: !isComplete,
          };
        }
        return copy;
      });

      pos = nextPos;

      if (isComplete) {
        resolve();
      } else {
        setTimeout(step, 60);
      }
    };

    step();
  });
}

// ==================== Hook ====================

export function useAIChatStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [sending, setSending] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);

  /** 追加用户消息并创建 AI 占位消息（乐观更新） */
  const sendMessage = useCallback(
    async (text: string, activeSessionId: string | null) => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current) return;

      sendingRef.current = true;
      setSending(true);

      // 1. 乐观更新：立即追加用户消息 + AI 占位消息
      const userMsg: StreamMessage = { type: 'user', content: trimmed };
      const placeholderMsg: StreamMessage = {
        type: 'assistant',
        content: '',
        _streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, placeholderMsg]);

      // 2. 创建 AbortController
      const controller = new AbortController();
      abortRef.current = controller;

      // 本地变量用于流式累积（避免从 ref 反复读取）
      let accumulatedContent = '';
      let fullContent = '';
      let finalIntent: string | undefined;

      try {
        const response = await chatStreamUsingPost(
          { sessionId: activeSessionId || undefined, message: trimmed },
          { signal: controller.signal },
        );

        if (!response.ok) {
          let errMsg = '请求失败，请重试';
          try {
            const errData = await response.json();
            errMsg = errData?.message || errMsg;
          } catch {
            /* ignore */
          }
          throw new Error(errMsg);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('浏览器不支持流式读取');

        const decoder = new TextDecoder();
        let buffer = '';
        let totalBytes = 0;

        // ★ 事件处理器（闭包捕获 accumulatedContent/fullContent/finalIntent 的绑定）
        const handleEvent = (event: SSEEvent) => {
          switch (event.type) {
            case 'thinking':
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.type === 'assistant' && last._streaming) {
                  copy[copy.length - 1] = { ...last, intent: event.content };
                }
                return copy;
              });
              break;

            case 'intent':
              finalIntent = event.intent;
              break;

            case 'content': {
              accumulatedContent += event.content || '';
              fullContent = accumulatedContent;
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.type === 'assistant' && last._streaming) {
                  copy[copy.length - 1] = {
                    ...last,
                    content: fullContent,
                    intent: finalIntent,
                    _streaming: true,
                  };
                }
                return copy;
              });
              break;
            }

            case 'route':
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.type === 'assistant' && last._streaming) {
                  copy[copy.length - 1] = {
                    ...last,
                    path: event.path,
                    label: event.label,
                    action: event.action || 'push',
                  };
                }
                return copy;
              });
              break;

            case 'done':
              break;

            case 'error':
              throw new Error(event.content || '服务异常');
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          totalBytes += value?.byteLength || 0;

          if (buffer === '') {
            console.log('[AI raw]', chunk.substring(0, 300));
          }

          buffer += chunk;
          const { events, rest } = parseStreamBuffer(buffer);
          buffer = rest;

          for (const event of events) {
            handleEvent(event);
          }
        }

        if (buffer.trim()) {
          const { events } = parseStreamBuffer(buffer + '\n');
          for (const event of events) {
            handleEvent(event);
          }
        }

        if (fullContent || totalBytes > 0) {
          console.log('[AI] received', fullContent.length, 'chars in', totalBytes, 'bytes');
        }

        // ★ 打字机效果：逐步揭示内容
        if (fullContent) {
          await revealWithTyping(fullContent, setMessages);
        } else {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.type === 'assistant' && last._streaming) {
              copy[copy.length - 1] = { ...last, _streaming: false };
            }
            return copy;
          });
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // 用户主动中止 — 将占位消息标记为完成
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.type === 'assistant' && last._streaming) {
              copy[copy.length - 1] = {
                ...last,
                content:
                  accumulatedContent ||
                  last.content ||
                  '对话已中止',
                _streaming: false,
              };
            }
            return copy;
          });
        } else {
          // 异常：将占位消息标记为错误
          const errMsg = err?.message || '发送失败，请检查网络';
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.type === 'assistant' && last._streaming) {
              copy[copy.length - 1] = {
                ...last,
                content: accumulatedContent || last.content || errMsg,
                _streaming: false,
                _error: true,
              };
            }
            return copy;
          });
        }
      } finally {
        sendingRef.current = false;
        abortRef.current = null;
        setSending(false);
      }
    },
    [], // 所有依赖通过 ref 和参数传入，不依赖外部 state
  );

  /** 中止当前请求 */
  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  /** 清空消息 */
  const clearMessages = useCallback(() => {
    abort();
    setMessages([]);
    setSending(false);
    sendingRef.current = false;
  }, [abort]);

  /** 加载历史消息（替换当前消息列表） */
  const loadHistory = useCallback((history: StreamMessage[]) => {
    abort();
    setMessages(history);
    setSending(false);
    sendingRef.current = false;
  }, [abort]);

  /** 更新消息（用于反馈更新等） */
  const updateMessage = useCallback(
    (index: number, partial: Partial<StreamMessage>) => {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = { ...copy[index], ...partial };
        }
        return copy;
      });
    },
    [],
  );

  return {
    messages,
    sending,
    sendMessage,
    abort,
    clearMessages,
    loadHistory,
    updateMessage,
  };
}
