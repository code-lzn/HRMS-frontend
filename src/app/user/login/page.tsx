import { userLoginUsingPost } from '@/api/userController';
import logo from '@/assets/logo.jpg';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useModel, useNavigate } from '@umijs/max';
import { Button, Form, Image, Input, message } from 'antd';
import React, { useState } from 'react';
import './index.css';

const UserLoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { setInitialState } = useModel('@@initialState');
  const [submitting, setSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const doSubmit = async (values: API.UserLoginRequest) => {
    setSubmitting(true);
    try {
      const res = await userLoginUsingPost(values);
      if (res.data) {
        message.success('登录成功');
        setInitialState((pre: any) => ({
          ...pre,
          currentUser: res.data,
        }));
        navigate(redirect, { replace: true });
        form.resetFields();
      }
    } catch (e: any) {
      message.error('登录失败，' + (e?.message ?? '请稍后重试'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-content">
          <Image
            src={logo}
            alt="HRMS Logo"
            height={72}
            width={72}
            preview={false}
            className="login-brand-logo"
          />
          <h1 className="login-brand-title">HRMS</h1>
          <h2 className="login-brand-subtitle">人力资源管理系统</h2>
          <p className="login-brand-desc">
            高效 · 智能 · 安全的企业人事管理平台
          </p>
          <div className="login-left-features">
            <div className="login-feature-item">
              <span className="login-feature-icon">&#10003;</span>
              <span>组织架构管理</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">&#10003;</span>
              <span>考勤打卡追踪</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">&#10003;</span>
              <span>薪酬核算发放</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">&#10003;</span>
              <span>审批流程自动化</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h3>欢迎登录</h3>
            <p>请输入您的账号和密码</p>
          </div>

          <Form form={form} layout="vertical" size="large" onFinish={doSubmit}>
            <Form.Item
              name="userAccount"
              rules={[{ required: true, message: '请输入用户账号' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户账号"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="userPassword"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
              >
                登 录
              </Button>
            </Form.Item>
          </Form>

        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
