import { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { changePhone } from '@/services/profile';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';

export default function ChangePhonePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await changePhone(values);
      message.success('手机号修改成功');
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    try {
      const newPhone = form.getFieldValue('newPhone');
      if (!newPhone) {
        message.error('请先输入新手机号');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        message.error('手机号格式不正确');
        return;
      }
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((c) => { if (c <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; } return c - 1; });
      }, 1000);
      message.success('验证码已发送');
    } catch {
      message.error('发送失败，请重试');
    }
  };

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>修改手机号</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>修改您绑定的手机号码</div>
          </div>
        ),
        onBack: () => navigate('/profile/security'),
      }}
    >
      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          maxWidth: 500,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            📱
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>修改手机号</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>更换绑定的手机号码</div>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="newPhone"
            label="新手机号"
            rules={[
              { required: true, message: '请输入新手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input
              style={{ borderRadius: 8, padding: '8px 12px' }}
              placeholder="请输入新手机号"
              maxLength={11}
            />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="verifyCode"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="请输入6位验证码"
                maxLength={6}
                style={{ borderRadius: 8, padding: '8px 12px', flex: 1 }}
              />
              <Button
                onClick={sendCode}
                disabled={countdown > 0}
                style={{
                  borderRadius: 8,
                  padding: '8px 16px',
                  background: countdown > 0 ? '#f3f4f6' : '#f0fdf4',
                  borderColor: countdown > 0 ? '#e5e7eb' : '#22c55e',
                  color: countdown > 0 ? '#9ca3af' : '#16a34a',
                }}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: '#22c55e',
                borderColor: '#22c55e',
                borderRadius: 8,
                padding: '8px 20px',
                height: 'auto',
                fontSize: 15,
              }}
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
            温馨提示
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
            <li>修改手机号需要验证新手机号的有效性</li>
            <li>验证码将发送到您填写的新手机号上</li>
            <li>修改成功后，下次登录请使用新手机号</li>
          </ul>
        </div>
      </Card>
    </PageContainer>
  );
}
