import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Timeline, Progress, Space } from 'antd';
import type { LoginLogVO } from '@/services/profile/typings';
import { changePassword, changePhone, getLoginLogs } from '@/services/profile';

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

export default function SecurityPage() {
  const [logs, setLogs] = useState<LoginLogVO[]>([]);
  const [pwdForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [pwdStrength, setPwdStrength] = useState<ReturnType<typeof PasswordStrength> | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getLoginLogs().then(setLogs); }, []);

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await changePassword(values);
      message.success('密码修改成功，请重新登录');
      pwdForm.resetFields();
      setPwdStrength(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (values: any) => {
    setLoading(true);
    try {
      await changePhone(values);
      message.success('手机号修改成功');
      phoneForm.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const strength = pwdStrength;
  const pwdValue = Form.useWatch('newPassword', pwdForm);

  return (
    <div>
      {/* 修改密码 */}
      <Card title="修改密码" style={{ marginBottom: 16 }}>
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 400 }}>
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度至少8位' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需包含大小写字母和数字' },
          ]}>
            <Input.Password onChange={(e) => setPwdStrength(PasswordStrength(e.target.value))} />
          </Form.Item>
          {strength && pwdValue && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={strength.percent} status={strength.status} format={() => strength.text} size="small" />
            </div>
          )}
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={loading}>修改密码</Button></Form.Item>
        </Form>
      </Card>

      {/* 修改手机号 */}
      <Card title="修改手机号" style={{ marginBottom: 16 }}>
        <Form form={phoneForm} layout="vertical" onFinish={handleChangePhone} style={{ maxWidth: 400 }}>
          <Form.Item name="newPhone" label="新手机号" rules={[
            { required: true, message: '请输入新手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
            <Input />
          </Form.Item>
          <Form.Item label="验证码">
            <Space>
              <Form.Item name="verifyCode" noStyle rules={[{ required: true, message: '请输入验证码' }]}>
                <Input placeholder="6位验证码" maxLength={6} style={{ width: 150 }} />
              </Form.Item>
              <Button onClick={sendCode} disabled={countdown > 0}>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
            </Space>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={loading}>修改手机号</Button></Form.Item>
        </Form>
      </Card>

      {/* 登录日志 */}
      <Card title="登录日志">
        <Timeline
          items={logs.map((log) => ({
            color: log.result === 1 ? 'green' : 'red',
            children: (
              <div>
                <div>{log.loginTime} — {log.resultDesc}</div>
                <div style={{ color: '#999', fontSize: 12 }}>{log.ipAddress} | {log.device}</div>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
