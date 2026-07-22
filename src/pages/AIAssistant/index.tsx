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
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  deleteSessionUsingDelete,
  getHistoryUsingGet,
  getSessionsUsingGet,
  submitFeedbackUsingPost,
} from '@/api/aiController';
import { useAIChatStream, type StreamMessage } from '@/hooks/useAIChatStream';
import {
  type RouteEntry,
  VALID_PATHS,
  findRouteByPath,
  matchRouteByKeywords,
} from './routeRegistry';
import './index.less';

// ==================== 路由解析工具 ====================

/**
 * 解析并修正后端返回的路由路径
 */
const resolveRoute = (p: {
  path: string;
  label: string;
  action?: string;
}): RouteEntry | null => {
  if (VALID_PATHS.has(p.path)) {
    return findRouteByPath(p.path) ?? null;
  }
  const matched = matchRouteByKeywords(p.label);
  if (matched) return matched;
  const byPath = matchRouteByKeywords(p.path);
  if (byPath) return byPath;
  return null;
};

// ==================== 子组件：用户头像 ====================

const UserAvatar: React.FC<{
  avatarUrl?: string;
  userName?: string;
}> = ({ avatarUrl, userName }) => {
  if (avatarUrl) {
    return (
      <Avatar
        size={36}
        src={avatarUrl}
        alt={userName || '用户'}
        style={{ border: '1px solid #f0f0f0' }}
      />
    );
  }
  // 无头像时显示首字母或默认图标
  const initial = userName?.charAt(0)?.toUpperCase();
  return (
    <Avatar
      size={36}
      style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }}
    >
      {initial || <UserOutlined />}
    </Avatar>
  );
};

// ==================== 子组件：AI 头像 ====================

const AIAvatar: React.FC = () => (
  <Avatar
    size={36}
    icon={<RobotOutlined />}
    style={{ backgroundColor: '#52c41a' }}
  />
);

// ==================== 子组件：流式占位加载动画 ====================

const TypingDots: React.FC = () => (
  <span className="chat-typing-dots">
    <span className="chat-typing-dot" />
    <span className="chat-typing-dot" />
    <span className="chat-typing-dot" />
  </span>
);

// ==================== 子组件：消息气泡 ====================

const MessageBubble: React.FC<{
  msg: StreamMessage;
  index: number;
  feedbacks: Record<number, number | null>;
  onFeedback: (messageId: number | undefined, fb: number) => void;
  onNavigate: (path: string) => void;
  currentUser: any;
}> = ({ msg, index, feedbacks, onFeedback, onNavigate, currentUser }) => {
  const isUser = msg.type === 'user';
  const isStreaming = msg._streaming;
  const isError = msg._error;
  const hasRoute = !!msg.path && !!msg.label;
  const msgId = msg.messageId;
  const fbStatus = msgId ? feedbacks[msgId] : undefined;

  // 是否正在显示 thinking 文本（首 chunk 未到达时的意图提示）
  const isThinking = isStreaming && !!msg.intent && !msg.content;

  return (
    <div
      className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'} ${
        isStreaming ? 'chat-message--streaming' : ''
      } ${isError ? 'chat-message--error' : ''}`}
    >
      {/* 头像 */}
      <div className="chat-message-avatar">
        {isUser ? (
          <UserAvatar
            avatarUrl={currentUser?.userAvatar}
            userName={currentUser?.userName}
          />
        ) : (
          <AIAvatar />
        )}
      </div>

      {/* 消息体 */}
      <div className="chat-message-body">
        <div
          className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--assistant'} ${
            isStreaming ? 'chat-bubble--streaming' : ''
          } ${isError ? 'chat-bubble--error' : ''}`}
        >
          {/* 正在思考中（显示 loading 文本） */}
          {isThinking && (
            <div className="chat-thinking">
              <Spin size="small" style={{ marginRight: 8 }} />
              <span>{msg.intent}</span>
            </div>
          )}

          {/* 消息文本 */}
          {msg.content && (
            <div className="chat-bubble-text">{msg.content}</div>
          )}

          {/* 首次渲染占位（空内容且非 thinking 状态） */}
          {!msg.content && !isThinking && (
            <div className="chat-bubble-placeholder">
              <TypingDots />
            </div>
          )}

          {/* 流式光标（内容非空且仍在流式时显示） */}
          {isStreaming && msg.content && <span className="chat-cursor" />}

          {/* 意图标签 */}
          {msg.intent && msg.content && (
            <div className="chat-bubble-meta">
              <Tag color="blue" style={{ fontSize: 11 }}>
                意图：{msg.intent}
              </Tag>
            </div>
          )}

          {/* 错误提示 */}
          {isError && (
            <div className="chat-error-banner">
              <WarningOutlined style={{ marginRight: 6 }} />
              响应异常，请重试
            </div>
          )}
        </div>

        {/* 跳转按钮 */}
        {hasRoute && !isStreaming && (
          <div className="chat-route-btn-wrapper">
            <Button
              type="primary"
              size="small"
              icon={<BulbOutlined />}
              onClick={() => onNavigate(msg.path!)}
              className="chat-route-btn"
            >
              点击前往：{msg.label}
            </Button>
          </div>
        )}

        {/* 反馈按钮 */}
        {!isUser && !isStreaming && (
          <div className="chat-feedback">
            <Tooltip title="点赞">
              <span
                className="chat-feedback-btn"
                onClick={() => onFeedback(msgId, 1)}
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
                onClick={() => onFeedback(msgId, 0)}
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

// ==================== 主组件 ====================

const AIAssistantPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  // ========== 从自定义 Hook 获取消息状态和发送能力 ==========
  const {
    messages,
    sending,
    sendMessage,
    clearMessages,
    loadHistory,
  } = useAIChatStream();

  // ========== 会话管理 ==========
  const [sessions, setSessions] = useState<API.AISessionVO[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // ========== 输入 ==========
  const [inputValue, setInputValue] = useState('');

  // ========== 反馈 ==========
  const [feedbacks, setFeedbacks] = useState<Record<number, number | null>>({});

  // ========== Refs ==========
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const prevMessagesLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // ========== 智能滚动 ==========

  /**
   * 检测用户是否靠近底部（50px 阈值）
   */
  const isNearBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 50;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  /**
   * 平滑滚动到底部
   */
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  /**
   * 核心滚动逻辑：
   * - 首次加载 → 立即滚动到底部（无动画）
   * - 消息从空到有（加载历史）→ 总是滚动到底部
   * - 新增消息（长度增加）→ 用户靠近底部时才自动滚动
   * - 流式内容更新（长度不变但内容变）→ 用户靠近底部时才跟随
   * - 用户在查看历史 → 不干涉
   */
  useLayoutEffect(() => {
    const currentLen = messages.length;
    const prevLen = prevMessagesLengthRef.current;

    // 首次加载或从空到有消息
    if (isInitialLoadRef.current || (prevLen === 0 && currentLen > 0)) {
      isInitialLoadRef.current = false;
      requestAnimationFrame(() => scrollToBottom(false));
      prevMessagesLengthRef.current = currentLen;
      return;
    }

    // 消息数量新增（新消息到了）
    if (currentLen > prevLen) {
      prevMessagesLengthRef.current = currentLen;
      if (isNearBottom()) {
        requestAnimationFrame(() => scrollToBottom(true));
      }
      return;
    }

    // 流式内容更新（同一条消息内容变化）
    if (isNearBottom()) {
      requestAnimationFrame(() => scrollToBottom(false));
    }
  }, [messages, isNearBottom, scrollToBottom]);

  // ========== 加载会话列表 ==========

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

  // ========== 会话操作 ==========

  const handleNewSession = useCallback(() => {
    clearMessages();
    setActiveSessionId(null);
    setInputValue('');
    isInitialLoadRef.current = true;
    prevMessagesLengthRef.current = 0;
  }, [clearMessages]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      clearMessages();
      setActiveSessionId(sessionId);
      setInputValue('');
      isInitialLoadRef.current = true;
      prevMessagesLengthRef.current = 0;

      try {
        const res = await getHistoryUsingGet({ sessionId });
        if (res?.code === 0 && res?.data) {
          // 确保历史消息没有流式标志
          const history = res.data.map((m: API.AIChatMessageVO) => ({
            ...m,
            _streaming: false,
            _error: false,
          }));
          loadHistory(history);
        }
      } catch {
        message.error('加载历史失败');
      }
    },
    [clearMessages, loadHistory],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const res = await deleteSessionUsingDelete({ sessionId });
        if (res?.code === 0) {
          message.success('会话已删除');
          if (activeSessionId === sessionId) {
            setActiveSessionId(null);
            clearMessages();
            isInitialLoadRef.current = true;
            prevMessagesLengthRef.current = 0;
          }
          loadSessions();
        }
      } catch {
        message.error('删除失败');
      }
    },
    [activeSessionId, clearMessages, loadSessions],
  );

  const handleNavigate = useCallback((path: string) => {
    history.push(path);
  }, []);

  // ========== 发送消息 ==========

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || sending) return;

    // 保存输入框文本并清空
    const text = inputValue;
    setInputValue('');

    try {
      await sendMessage(text, activeSessionId);
    } catch (e) {
      console.error('[AIAssistant] handleSend error:', e);
    }
  }, [inputValue, sending, activeSessionId, sendMessage]);

  // ========== 键盘快捷操作 ==========

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ========== 反馈 ==========

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

  // ========== 流式完成后刷新数据 ==========

  /** 重新加载会话历史（带 retry） */
  const reloadHistoryWithRetry = useCallback(
    async (sessionId: string, retries = 5, delay = 1200) => {
      for (let i = 0; i < retries; i++) {
        try {
          // 首次立即尝试，后续重试带延迟
          if (i > 0) await new Promise((r) => setTimeout(r, delay));
          const res = await getHistoryUsingGet({ sessionId });
          if (res?.code === 0 && res?.data && res.data.length > 0) {
            // 至少有一条消息才替换（避免后端还没写完就覆盖）
            const history = res.data.map((m: API.AIChatMessageVO) => ({
              ...m,
              _streaming: false,
              _error: false,
            }));
            loadHistory(history);
            return;
          }
        } catch {
          // 继续重试
        }
      }
    },
    [loadHistory],
  );

  const prevSendingRef = useRef(false);
  useEffect(() => {
    // sending 从 true → false（流式完成）时触发
    if (prevSendingRef.current && !sending) {
      if (activeSessionId) {
        // 有活跃会话 → 轮询重新加载历史
        reloadHistoryWithRetry(activeSessionId);
      } else {
        // 无活跃会话（首次对话）→ 刷新会话列表获取新 sessionId
        (async () => {
          const updated = await getSessionsUsingGet();
          if (updated?.data?.length) {
            const newId = updated.data[0].sessionId!;
            setActiveSessionId(newId);
            setSessions(updated.data);
            // 新会话创建后也要加载历史
            reloadHistoryWithRetry(newId);
          }
        })();
      }
    }
    prevSendingRef.current = sending;
  }, [sending, activeSessionId, reloadHistoryWithRetry]);

  // ========== 渲染 ==========

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
                            {s.lastMessageTime
                              .slice(0, 16)
                              .replace('T', ' ')}
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
              <UserAvatar
                avatarUrl={currentUser?.userAvatar}
                userName={currentUser?.userName}
              />
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                {currentUser?.userName || '用户'}
              </span>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="ai-chat-messages" ref={messagesContainerRef}>
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <RobotOutlined
                  style={{
                    fontSize: 48,
                    color: '#d9d9d9',
                    marginBottom: 16,
                  }}
                />
                <div className="ai-chat-empty-title">
                  AI 智能助理 · 小智
                </div>
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

            {messages.map((msg, idx) => (
              <MessageBubble
                key={`${msg.type}-${idx}-${msg._streaming ? 'streaming' : 'done'}`}
                msg={msg}
                index={idx}
                feedbacks={feedbacks}
                onFeedback={handleFeedback}
                onNavigate={handleNavigate}
                currentUser={currentUser}
              />
            ))}
          </div>

          {/* 输入区域 */}
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
