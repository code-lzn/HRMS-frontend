import { useState } from 'react';
import { Card, Form, Input, Button, message, Progress } from 'antd';
import { changePassword } from '@/services/profile';
import { clearCachedLoginUser } from '@/libs/loginCache';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';

function PasswordStrength(password: string): { percent: number; status: 'exception' | 'active' | 'success'; text: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (score >= 3) return { percent: 100, status: 'success', text: '强' };
  if (score >= 2) return { percent: 60, status: 'active', text: '中' };
  return { percent: 30, status: 'exception', text: '弱' };
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [pwdStrength, setPwdStrength] = useState<ReturnType<typeof PasswordStrength> | null>(null);
  const [loading, setLoading] = useState(false);
  const pwdValue = Form.useWatch('newPassword', form);

  const handleSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await changePassword(values);
      message.success('密码修改成功，请重新登录');
      form.resetFields();
      setPwdStrength(null);
      clearCachedLoginUser();
      navigate('/user/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const strength = pwdStrength;

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>修改密码</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>修改您的登录密码以保障账号安全</div>
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
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🔒
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>修改密码</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>请定期更换密码以确保账号安全</div>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password style={{ borderRadius: 8, padding: '8px 12px' }} placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码长度至少8位' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需包含大小写字母和数字' },
            ]}
          >
            <Input.Password
              style={{ borderRadius: 8, padding: '8px 12px' }}
              placeholder="请输入新密码"
              onChange={(e) => setPwdStrength(PasswordStrength(e.target.value))}
            />
          </Form.Item>

          {strength && pwdValue && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={strength.percent} status={strength.status} format={() => strength.text} size="small" />
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password style={{ borderRadius: 8, padding: '8px 12px' }} placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: '#6366f1',
                borderColor: '#6366f1',
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
            密码安全建议
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
            <li>密码长度至少 8 位</li>
            <li>包含大小写字母、数字和特殊字符</li>
            <li>不要使用生日、手机号等易被猜到的信息</li>
            <li>定期更换密码，不同平台使用不同密码</li>
          </ul>
        </div>
      </Card>
    </PageContainer>
  );
}
