import { LockOutlined } from '@ant-design/icons';
import { LoginForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Link, useLocation, useNavigate } from '@umijs/max';
import { Image, message } from 'antd';
import React from 'react';
import request from '@/libs/request';
import logo from '@/assets/logo.jpg';
import '../login/index.css';

/**
 * 首次登录强制重置密码页面
 */
const ResetPasswordPage: React.FC = () => {
  const [form] = ProForm.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const doSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    if (values.newPassword.length < 8) {
      message.error('密码长度至少8位，需包含大小写字母和数字');
      return;
    }
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
    }
  };

  return (
    <div className="user-auth-page">
      <LoginForm
        form={form}
        logo={<Image src={logo} alt="HRMS" height={44} width={44} preview={false} />}
        title="HRMS 人力资源管理系统"
        subTitle="首次登录，请设置新密码"
        submitter={{ searchConfig: { submitText: '确认修改' } }}
        onFinish={doSubmit}
      >
        <ProFormText.Password
          name="newPassword"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="新密码（至少8位，含大小写字母+数字）"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度至少8位' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: '需包含大小写字母和数字' },
          ]}
        />
        <ProFormText.Password
          name="confirmPassword"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="确认新密码"
          rules={[
            { required: true, message: '请再次输入新密码' },
          ]}
        />
        <div className="user-auth-footer">
          <Link to={`/user/login?redirect=${encodeURIComponent(redirect)}`}>返回登录</Link>
        </div>
      </LoginForm>
    </div>
  );
};

export default ResetPasswordPage;
