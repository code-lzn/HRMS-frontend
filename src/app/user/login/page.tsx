import { userLoginUsingPost } from '@/api/userController';
import { setCachedLoginUser } from '@/libs/loginCache';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { useLocation, useModel, useNavigate } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import './index.css';

const UserLoginPage: React.FC = () => {
  const [form] = ProForm.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { setInitialState } = useModel('@@initialState');

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/employees';

  const doSubmit = async (values: API.UserLoginRequest) => {
    try {
      const res = await userLoginUsingPost(values);
      if (res.data) {
        message.success('登录成功');
        setCachedLoginUser(res.data as API.LoginUserVO);
        setInitialState((pre: any) => ({
          ...pre,
          currentUser: res.data,
        }));
        // 处理 redirect：防止被注入完整 URL 导致路径拼接
        let target = redirect;
        try {
          const url = new URL(target);
          target = url.pathname + url.search;
        } catch {}
        navigate(target, { replace: true });
        form.resetFields();
      }
    } catch (e: any) {
      message.error('登录失败，' + (e?.message ?? '请稍后重试'));
    }
  };

  return (
    <div id="userLoginPage" className="login-page">
      <div className="login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect
                width="48"
                height="48"
                rx="10"
                fill="rgba(255,255,255,0.15)"
              />
              <path
                d="M14 32V18L24 12L34 18V32L24 38L14 32Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="25" r="5" stroke="white" strokeWidth="2" />
              <path
                d="M24 20V22"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M24 28V30"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M19 25H21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M27 25H29"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1>HRMS</h1>
          <p>Human Resource Management System</p>
          <div className="login-brand-divider" />
          <span className="login-brand-desc">高效 · 安全 · 智能</span>
        </div>
      </div>

      <div className="login-panel-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>欢迎登录</h2>
            <p>请使用您的员工账号登录系统</p>
          </div>

          <LoginForm
            form={form}
            submitter={{
              searchConfig: { submitText: '登 录' },
              submitButtonProps: {
                size: 'large',
                block: true,
                style: {
                  height: 46,
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 500,
                },
              },
            }}
            onFinish={doSubmit}
          >
            <ProFormText
              name="userAccount"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined style={{ color: '#8c8c8c' }} />,
              }}
              placeholder="请输入账号"
              rules={[{ required: true, message: '请输入账号' }]}
            />
            <ProFormText.Password
              name="userPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined style={{ color: '#8c8c8c' }} />,
              }}
              placeholder="请输入密码"
              rules={[{ required: true, message: '请输入密码' }]}
            />
          </LoginForm>

          <div className="login-form-footer">
            © 2026 HRMS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
