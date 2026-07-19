/**
 * HRMS 智能助手 — 前端聊天组件
 *
 * 功能:
 * - 右下角悬浮按钮，点击打开聊天面板
 * - 用户输入问题 → 调用后端 /api/chat
 * - 解析回复中的路由信息，渲染为可点击的跳转卡片
 * - 支持多轮对话（thread_id）
 */

import {
  CustomerServiceOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  LinkOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Drawer,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  sendMessage,
  parseRouteFromResponse,
  type RouteInfo,
} from '@/services/assistant';
import './index.less';

const { Text } = Typography;

// ── 轻量 Markdown 渲染（替代 react-markdown） ──────────────

function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pi) => {
    const lines = para.split('\n');
    return (
      <p key={pi} style={{ margin: '0 0 4px 0' }}>
        {lines.map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const inlineRegex = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(
        <code key={key++} style={{ padding: '1px 5px', borderRadius: 3, fontSize: 12, background: 'rgba(0,0,0,0.06)' }}>
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      parts.push(
        <a key={key++} href={match[7]} target="_blank" rel="noreferrer">{match[6]}</a>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

// ── 消息类型 ──────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  route: RouteInfo | null;
  timestamp: number;
}

// ── 路由卡片 ──────────────────────────────────────────────

interface RouteCardProps {
  route: RouteInfo;
  onNavigate: (path: string) => void;
}

function RouteCard({ route, onNavigate }: RouteCardProps) {
  if (!route || !route.name) return null;
  const exist = route.exist;

  return (
    <Card
      size="small"
      className="assistant-route-card"
      title={
        <Space size={4}>
          {exist ? <LinkOutlined style={{ color: '#1677ff' }} /> : <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          <span>{exist ? route.name : `${route.name}（待开发）`}</span>
          {!exist && <Tag color="warning">开发中</Tag>}
        </Space>
      }
    >
      {route.description && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          {route.description}
        </Text>
      )}
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        {exist && route.path ? (
          <Button type="primary" size="small" icon={<LinkOutlined />} onClick={() => onNavigate(route.path)}>
            前往「{route.name}」
          </Button>
        ) : route.fallback_path ? (
          <Button size="small" icon={<LinkOutlined />} onClick={() => onNavigate(route.fallback_path!)}>
            前往「{route.fallback_name || route.fallback_path}」（降级入口）
          </Button>
        ) : null}
        {route.fallback_reason && <Text type="secondary" style={{ fontSize: 11 }}>说明：{route.fallback_reason}</Text>}
        {route.related_routes && route.related_routes.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>相关入口：</Text>
            <Space wrap size={[4, 4]}>
              {route.related_routes.map((r, idx) => (
                <Button key={idx} size="small" type="dashed" icon={<LinkOutlined />} onClick={() => onNavigate(r.path)}>
                  {r.name}
                </Button>
              ))}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
}

// ── 主组件 ────────────────────────────────────────────────

export default function HRMSAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是 **HR 智能助手** 👋\n\n' +
        '📋 **查询制度**：请假、考勤、薪酬福利、离职流程、奖惩...\n' +
        '🔗 **直达功能**：查工资条、调薪、调岗、组织架构...\n\n' +
        '直接告诉我你需要什么～',
      route: null,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadIdRef = useRef(`thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染（避免 SSR 时 document.body 不存在）
  useEffect(() => {
    setMounted(true);
    console.log('🤖 HRMS 助手已挂载');
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      route: null,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await sendMessage(text, threadIdRef.current);
      const { cleanText, route } = parseRouteFromResponse(res.response);
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: cleanText || '抱歉，我暂时无法回答这个问题。',
        route: route || res.route || null,
        timestamp: Date.now(),
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，连接助手服务失败，请稍后重试。',
        route: null,
        timestamp: Date.now(),
      }]);
      message.error(`请求失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [inputValue, loading, scrollToBottom]);

  // 路由跳转
  const handleNavigate = useCallback((path: string) => {
    if (!path) return;
    setOpen(false);
    history.push(path);
  }, []);

  // ── 渲染 ────────────────────────────────────────────────

  if (!mounted) return null;

  return createPortal(
    <>
      {/* 悬浮按钮 — 用纯 div 固定定位，比 FloatButton 更可靠 */}
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 48,
          zIndex: 9999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#1677ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          color: '#fff',
          fontSize: 22,
        }}
        title="HR 智能助手"
      >
        <CustomerServiceOutlined />
      </div>

      {/* 聊天抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined />
            <span>HR 智能助手</span>
          </Space>
        }
        placement="right"
        width={420}
        open={open}
        onClose={() => setOpen(false)}
        extra={<Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        {/* 消息列表 */}
        <div className="assistant-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`assistant-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="assistant-message-bubble">
                <div className="assistant-avatar">
                  {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className="assistant-content">
                  <div className="assistant-text">{renderMarkdown(msg.content)}</div>
                  {msg.route && msg.route.name && (
                    <RouteCard route={msg.route} onNavigate={handleNavigate} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="assistant-message assistant">
              <div className="assistant-message-bubble">
                <div className="assistant-avatar"><RobotOutlined /></div>
                <div className="assistant-content"><Spin size="small" /> 思考中...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="assistant-input-area">
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入问题，如「年假怎么请」或「帮我查工资」"
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            disabled={loading}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} disabled={!inputValue.trim()}>
            发送
          </Button>
        </div>
      </Drawer>
    </>,
    document.body,
  );
}