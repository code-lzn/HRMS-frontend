import {
  BulbOutlined,
  DeleteOutlined,
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  Empty,
  Input,
  List,
  message,
  Popconfirm,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import { flushSync } from 'react-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteSessionUsingDelete,
  getHistoryUsingGet,
  getSessionsUsingGet,
  submitFeedbackUsingPost,
  chatStreamUsingPost,
} from '@/api/aiController';
import {
  type RouteEntry,
  VALID_PATHS,
  findRouteByPath,
  matchRouteByKeywords,
} from './routeRegistry';
import './index.less';

// ==================== SSE 解析 ====================

const parseSSEBuffer = (buffer: string): [API.AISSEEvent[], string] => {
  const events: API.AISSEEvent[] = [];
  const lastNL = buffer.lastIndexOf('\n');
  if (lastNL === -1) return [events, buffer];

  const complete = buffer.slice(0, lastNL + 1);
  const rest = buffer.slice(lastNL + 1);

  for (const line of complete.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data: ')) {
      try {
        events.push(JSON.parse(trimmed.slice(6)));
      } catch {
        /* ignore */
      }
    }
  }
  return [events, rest];
};

/**
 * 解析并修正后端返回的路由路径
 * - 路径在 VALID_PATHS 中 → 直接使用
 * - 路径无效但 label 能匹配到 → 用匹配到的 path
 * - 都不行 → 返回 null
 */
const resolveRoute = (p: {
  path: string;
  label: string;
  action?: string;
}): RouteEntry | null => {
  // 如果是有效路径，直接用
  if (VALID_PATHS.has(p.path)) {
    return findRouteByPath(p.path) ?? null;
  }
  // 路径无效，尝试用 label 匹配
  const matched = matchRouteByKeywords(p.label);
  if (matched) return matched;
  // 尝试用 path 本身的片段匹配
  const byPath = matchRouteByKeywords(p.path);
  if (byPath) return byPath;
  return null;
};

// ==================== 组件 ====================

const AIAssistantPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  // ---- 会话 ----
  const [sessions, setSessions] = useState<API.AISessionVO[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // ---- 消息 ----
  const [messages, setMessages] = useState<API.AIChatMessageVO[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  // 流式 UI 状态
  const [thinkingText, setThinkingText] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    path: string;
    label: string;
    action?: string;
  } | null>(null);

  // 反馈
  const [feedbacks, setFeedbacks] = useState<Record<number, number | null>>({});

  // ---- refs ----
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const streamingTextRef = useRef<HTMLDivElement | null>(null);
  const [streaming, setStreaming] = useState(false);

  // 滚动到底
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingText, streaming]);

  // ---- 会话列表 ----
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await getSessionsUsingGet();
      if (res?.code === 0 && res?.data) setSessions(res.data);
    } catch {
      /* ignore */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ---- 清理 ----
  const clearStreamState = useCallback(() => {
    if (streamingTextRef.current) {
      streamingTextRef.current.textContent = '';
    }
    setStreaming(false);
    setThinkingText('');
    setRouteInfo(null);
  }, []);

  const handleNewSession = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    clearStreamState();
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
    setSending(false);
  }, [clearStreamState]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      abortRef.current?.abort();
      abortRef.current = null;
      sendingRef.current = false;
      clearStreamState();
      setActiveSessionId(sessionId);
      setMessages([]);
      setSending(false);

      try {
        const res = await getHistoryUsingGet({ sessionId });
        if (res?.code === 0 && res?.data) setMessages(res.data);
      } catch {
        message.error('加载历史失败');
      }
    },
    [clearStreamState],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const res = await deleteSessionUsingDelete({ sessionId });
        if (res?.code === 0) {
          message.success('会话已删除');
          if (activeSessionId === sessionId) {
            setActiveSessionId(null);
            setMessages([]);
          }
          loadSessions();
        }
      } catch {
        message.error('删除失败');
      }
    },
    [activeSessionId, loadSessions],
  );

  const handleNavigate = useCallback((path: string) => {
    history.push(path);
  }, []);

  // ==================== 发送消息（核心） ====================
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || sendingRef.current) return;

    sendingRef.current = true;
    setInputValue('');
    setSending(true);
    clearStreamState();

    const userMsg: API.AIChatMessageVO = { type: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    let fullContent = '';
    let finalRoute: (RouteEntry & { action?: string }) | null = null;
    let finalIntent: string | undefined;

    const finish = (err?: string) => {
      sendingRef.current = false;
      abortRef.current = null;
      setSending(false);
      if (streamingTextRef.current) {
        streamingTextRef.current.textContent = '';
      }
      setStreaming(false);
      setThinkingText('');
      setRouteInfo(null);

      if (err) {
        message.error(err);
        return;
      }

      if (!fullContent && !finalRoute) return;

      // ★ 如果后端没有返回 route，用本地关键词匹配兜底
      if (!finalRoute && fullContent) {
        const matched = matchRouteByKeywords(fullContent);
        if (matched) {
          finalRoute = { ...matched, action: 'push' };
        }
      }

      const assistantMsg: API.AIChatMessageVO = {
        type: 'assistant',
        content: fullContent || '已为您定位到对应功能，请点击下方按钮跳转',
        intent: finalIntent,
        path: finalRoute?.path,
        label: finalRoute?.name,
        action: finalRoute?.action || 'push',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    };

    try {
      const response = await chatStreamUsingPost(
        { sessionId: activeSessionId || undefined, message: text },
        { signal: controller.signal },
      );

      if (!response.ok) {
        let errMsg = '请求失败，请重试';
        try {
          const errData = await response.json();
          errMsg = errData?.message || errMsg;
        } catch {}
        finish(errMsg);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        finish('浏览器不支持流式读取');
        return;
      }

      // ★ 强制渲染流式气泡
      flushSync(() => {
        setStreaming(true);
        setThinkingText('正在分析您的问题...');
      });

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const [events, rest] = parseSSEBuffer(buffer);
        buffer = rest;

        for (const event of events) {
          switch (event.type) {
            case 'thinking':
              flushSync(() => setThinkingText(event.content || ''));
              break;

            case 'intent':
              finalIntent = event.intent;
              break;

            case 'content':
              if (!fullContent) {
                flushSync(() => setThinkingText(''));
              }
              fullContent += event.content || '';
              if (streamingTextRef.current) {
                streamingTextRef.current.textContent = fullContent;
              }
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              break;

            case 'route': {
              // ★ 路径校验：后端给的 path 可能不存在于前端路由表中
              const resolved = resolveRoute({
                path: event.path || '',
                label: event.label || '',
                action: event.action || 'push',
              });
              if (resolved) {
                finalRoute = { ...resolved, action: event.action || 'push' };
                flushSync(() =>
                  setRouteInfo({
                    path: resolved.path,
                    label: resolved.name,
                    action: event.action || 'push',
                  }),
                );
              } else {
                // 路径无效 — 不渲染按钮，靠后续本地关键词匹配兜底
                console.warn(
                  '[AI Assistant] 后端返回的路径未在前端注册:',
                  event.path,
                );
              }
              break;
            }

            case 'done':
              break;

            case 'error':
              finish(event.content || '服务异常');
              return;
          }
        }
      }

      finish();

      if (!activeSessionId) {
        const updated = await getSessionsUsingGet();
        if (updated?.data?.length) {
          setActiveSessionId(updated.data[0].sessionId!);
          setSessions(updated.data);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        finish('发送失败，请检查网络');
      } else {
        finish();
      }
    }
  }, [inputValue, activeSessionId, clearStreamState]);

  // ---- 键盘 ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ---- 反馈 ----
  const handleFeedback = useCallback(
    async (messageId: number | undefined, fb: number) => {
      if (!messageId) {
        message.warning('消息ID不存在');
        return;
      }
      try {
        const res = await submitFeedbackUsingPost({
          chatId: messageId,
          feedback: fb,
        });
        if (res?.code === 0) {
          setFeedbacks((prev) => ({ ...prev, [messageId]: fb }));
          message.success(fb === 1 ? '感谢反馈！' : '已收到，我们会改进');
        }
      } catch {
        message.error('反馈失败');
      }
    },
    [],
  );

  // ---- 渲染消息 ----
  const renderMessage = (msg: API.AIChatMessageVO, index: number) => {
    const isUser = msg.type === 'user';
    const hasRoute = !!msg.path && !!msg.label;
    const msgId = msg.messageId;
    const fbStatus = msgId ? feedbacks[msgId] : undefined;

    return (
      <div
        key={index}
        className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}
      >
        <div className="chat-message-avatar">
          <Avatar
            size={36}
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            style={{ backgroundColor: isUser ? '#1677ff' : '#52c41a' }}
          />
        </div>

        <div className="chat-message-body">
          <div
            className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}
          >
            <div className="chat-bubble-text">{msg.content || ''}</div>
            {msg.intent && (
              <div className="chat-bubble-meta">
                <Tag color="blue" style={{ fontSize: 11 }}>
                  意图：{msg.intent}
                </Tag>
              </div>
            )}
          </div>

          {/* ★ 跳转按钮 — 路径已经过后端+本地双重校验 */}
          {hasRoute && (
            <div className="chat-route-btn-wrapper">
              <Button
                type="primary"
                size="small"
                icon={<BulbOutlined />}
                onClick={() => handleNavigate(msg.path!)}
                className="chat-route-btn"
              >
                点击前往：{msg.label}
              </Button>
            </div>
          )}

          {/* 反馈 */}
          {!isUser && (
            <div className="chat-feedback">
              <Tooltip title="点赞">
                <span
                  className="chat-feedback-btn"
                  onClick={() => handleFeedback(msgId, 1)}
                >
                  {fbStatus === 1 ? (
                    <LikeFilled style={{ color: '#1677ff' }} />
                  ) : (
                    <LikeOutlined />
                  )}
                </span>
              </Tooltip>
              <Tooltip title="点踩">
                <span
                  className="chat-feedback-btn"
                  onClick={() => handleFeedback(msgId, 0)}
                >
                  {fbStatus === 0 ? (
                    <DislikeFilled style={{ color: '#ff4d4f' }} />
                  ) : (
                    <DislikeOutlined />
                  )}
                </span>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageContainer ghost>
      <div className="ai-assistant">
        {/* ======== 左侧会话列表 ======== */}
        <div className="ai-sessions">
          <div className="ai-sessions-header">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewSession}
              block
            >
              新建对话
            </Button>
          </div>
          <div className="ai-sessions-list">
            {sessionsLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin />
              </div>
            ) : sessions.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无会话"
              />
            ) : (
              <List
                dataSource={sessions}
                renderItem={(s) => (
                  <div
                    className={`ai-session-item ${
                      activeSessionId === s.sessionId
                        ? 'ai-session-item--active'
                        : ''
                    }`}
                    onClick={() => handleSelectSession(s.sessionId!)}
                  >
                    <div className="ai-session-item-content">
                      <div className="ai-session-item-title">
                        <MessageOutlined
                          style={{ marginRight: 8, fontSize: 12 }}
                        />
                        {s.title || '新对话'}
                      </div>
                      <div className="ai-session-item-meta">
                        <span>{s.messageCount ?? 0} 条消息</span>
                        {s.lastMessageTime && (
                          <span className="ai-session-item-time">
                            {s.lastMessageTime.slice(0, 16).replace('T', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Popconfirm
                      title="确定删除此会话？"
                      placement="left"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDeleteSession(s.sessionId!);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        className="ai-session-delete"
                      />
                    </Popconfirm>
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* ======== 右侧对话区域 ======== */}
        <div className="ai-chat">
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <RobotOutlined
                style={{ fontSize: 18, color: '#1677ff', marginRight: 8 }}
              />
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                {activeSessionId
                  ? sessions.find((s) => s.sessionId === activeSessionId)
                      ?.title || 'AI 智能助理'
                  : 'AI 智能助理'}
              </span>
              <span style={{ fontSize: 12, color: '#bbb', marginLeft: 12 }}>
                小智
              </span>
            </div>
            <div className="ai-chat-header-right">
              <span style={{ fontSize: 12, color: '#999' }}>
                {currentUser?.userName || '用户'}
              </span>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.length === 0 && !streaming && !thinkingText && (
              <div className="ai-chat-empty">
                <RobotOutlined
                  style={{
                    fontSize: 48,
                    color: '#d9d9d9',
                    marginBottom: 16,
                  }}
                />
                <div className="ai-chat-empty-title">AI 智能助理 · 小智</div>
                <div className="ai-chat-empty-desc">
                  我是您的 HR 助手，可以帮您解答考勤、请假、薪资、审批等问题
                </div>
                <div className="ai-chat-empty-hints">
                  {[
                    '年假怎么请？',
                    '员工列表在哪里？',
                    '如何查看我的工资条？',
                    '入职流程是怎样的？',
                  ].map((hint) => (
                    <Tag
                      key={hint}
                      className="ai-chat-hint-tag"
                      onClick={() => {
                        setInputValue(hint);
                        inputRef.current?.focus();
                      }}
                    >
                      {hint}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => renderMessage(msg, idx))}

            {/* 流式实时输出 */}
            {(streaming || thinkingText) && (
              <div className="chat-message chat-message--assistant">
                <div className="chat-message-avatar">
                  <Avatar
                    size={36}
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                <div className="chat-message-body">
                  <div className="chat-bubble chat-bubble--assistant">
                    {thinkingText && (
                      <div className="chat-thinking">
                        <Spin size="small" style={{ marginRight: 8 }} />
                        <span>{thinkingText}</span>
                      </div>
                    )}
                    <div className="chat-bubble-text" ref={streamingTextRef} />
                    {streaming && !routeInfo && (
                      <span className="chat-cursor" />
                    )}
                  </div>
                  {routeInfo && (
                    <div className="chat-route-btn-wrapper">
                      <Button
                        type="primary"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={() => handleNavigate(routeInfo.path)}
                        className="chat-route-btn"
                      >
                        点击前往：{routeInfo.label}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-area">
            <Input.TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题，按 Enter 发送..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={sending}
              className="ai-chat-input"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              disabled={!inputValue.trim() || sending}
              className="ai-chat-send-btn"
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAssistantPage;
