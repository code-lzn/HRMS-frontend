import { LockOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useLocation, useNavigate } from '@umijs/max';
import { message, Form, Input, Button, Progress } from 'antd';
import React, { useState, useMemo } from 'react';
import request from '@/libs/request';
import '../login/index.css';

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [pwdValue, setPwdValue] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const strength = useMemo(() => {
    if (!pwdValue) return { score: 0, label: '', color: '#e5e7eb' };
    let s = 0;
    if (pwdValue.length >= 8) s++;
    if (/[a-z]/.test(pwdValue)) s++;
    if (/[A-Z]/.test(pwdValue)) s++;
    if (/\d/.test(pwdValue)) s++;
    const map = [
      { score: 1, label: '弱', color: '#ef4444' },
      { score: 2, label: '较弱', color: '#f97316' },
      { score: 3, label: '中等', color: '#fbbf24' },
      { score: 4, label: '强', color: '#22c55e' },
    ];
    return map[Math.min(s - 1, 3)] || { score: 0, label: '', color: '#e5e7eb' };
  }, [pwdValue]);

  const checks = useMemo(() => [
    { label: '至少 8 个字符', pass: pwdValue.length >= 8 },
    { label: '包含小写字母 a-z', pass: /[a-z]/.test(pwdValue) },
    { label: '包含大写字母 A-Z', pass: /[A-Z]/.test(pwdValue) },
    { label: '包含数字 0-9', pass: /\d/.test(pwdValue) },
  ], [pwdValue]);

  const doSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      await request('/api/profile/reset-password', {
        method: 'PUT',
        data: {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      });
      message.success('密码设置成功，请重新登录');
      navigate(`/user/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
    } catch (e: any) {
      message.error(e?.message || '设置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 左侧品牌面板 --- 与登录页一致 */}
      <div className="login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="rgba(255,255,255,0.15)" />
              <path d="M14 32V18L24 12L34 18V32L24 38L14 32Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="24" cy="25" r="5" stroke="white" strokeWidth="2" />
              <path d="M24 20V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>HRMS</h1>
          <div className="login-brand-divider" />
          <p>Human Resource Management</p>
          <div className="login-brand-desc">安全 · 高效 · 智能</div>
        </div>
      </div>

      {/* 右侧表单 */}
      <div className="login-panel-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>设置新密码</h2>
            <p>首次登录，请设置一个安全的密码</p>
          </div>

          <Form form={form} onFinish={doSubmit} layout="vertical" size="large">
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: '密码不符合复杂度要求' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="新密码"
                onChange={(e) => setPwdValue(e.target.value)}
              />
            </Form.Item>

            {/* 密码强度 */}
            {pwdValue && (
              <div style={{ marginTop: -16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Progress
                    percent={(strength.score / 4) * 100}
                    showInfo={false}
                    strokeColor={strength.color}
                    trailColor="#f0f0f0"
                    size="small"
                    style={{ flex: 1, margin: 0 }}
                  />
                  <span style={{ fontSize: 12, color: strength.color, fontWeight: 500, minWidth: 32 }}>
                    {strength.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 8 }}>
                  {checks.map((c) => (
                    <div key={c.label} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.pass
                        ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 10 }} />
                        : <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: 10 }} />
                      }
                      <span style={{ color: c.pass ? '#22c55e' : '#999' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('两次密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="确认新密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, borderRadius: 6 }}>
                确认修改
              </Button>
            </Form.Item>

            <div className="login-form-footer">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/user/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
                }}
                style={{ color: '#1e3a5f', cursor: 'pointer' }}
              >
                返回登录
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
