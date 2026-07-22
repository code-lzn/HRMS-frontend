import { bindPhoneUsingPost, changePasswordUsingPost, getLoginLogsUsingGet } from '@/api/accountSecurityController';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Card, Form, Input, message, Space, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const ERROR_MSG: Record<number, string> = {
  50018: '原密码错误',
  50019: '新密码不能与旧密码相同',
  50020: '新密码与近期使用过的密码重复',
  50021: '该手机号已被其他账号绑定',
};

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await changePasswordUsingPost({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('密码修改成功');
      form.resetFields();
    } catch (e: any) {
      const match = e.message?.match(/\d+/);
      const code = match ? Number(match[0]) : 0;
      message.error(ERROR_MSG[code] || e.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 480 }}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="oldPassword"
          label="旧密码"
          rules={[{ required: true, message: '请输入旧密码' }]}
        >
          <Input.Password placeholder="请输入旧密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '新密码至少8位' },
          ]}
        >
          <Input.Password placeholder="请输入新密码（至少8位）" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的新密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const BindPhone: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await bindPhoneUsingPost({ phone: values.phone });
      message.success(values.phone ? '手机号绑定成功' : '手机号已解绑');
      form.resetFields();
    } catch (e: any) {
      const match = e.message?.match(/\d+/);
      const code = match ? Number(match[0]) : 0;
      message.error(ERROR_MSG[code] || e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 480 }}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            {
              pattern: /^$|^1[3-9]\d{9}$/,
              message: '请输入正确的手机号格式',
            },
          ]}
          extra="留空则解绑手机号"
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              保存
            </Button>
            <Button
              onClick={() => {
                form.setFieldsValue({ phone: '' });
              }}
            >
              解绑
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

const LoginLogs: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.LoginLogVO>[] = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
      render: (_, r) =>
        r.loginTime ? dayjs(r.loginTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    { title: 'IP', dataIndex: 'ip', width: 150 },
    { title: '设备', dataIndex: 'device', width: 150, ellipsis: true },
    {
      title: '登录方式',
      dataIndex: 'loginTypeText',
      width: 100,
    },
    {
      title: '是否成功',
      dataIndex: 'isSuccess',
      width: 100,
      render: (_, r) =>
        r.isSuccess === 1 ? (
          <span style={{ color: '#52c41a' }}>
            <CheckCircleOutlined /> 成功
          </span>
        ) : (
          <span style={{ color: '#ff4d4f' }}>
            <CloseCircleOutlined /> 失败
          </span>
        ),
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      width: 150,
      ellipsis: true,
      render: (_, r) => r.failReason || '-',
    },
  ];

  return (
    <ProTable<API.LoginLogVO>
      headerTitle="登录日志（最近30条）"
      actionRef={actionRef}
      columns={columns}
      request={async () => {
        try {
          const res = await getLoginLogsUsingGet();
          return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
        } catch (e) { console.error('pages/PersonalCenter/Security/index.tsx', e); return { data: [], success: false };
        }
      }}
      rowKey="id"
      search={false}
      pagination={{ pageSize: 30 }}
    />
  );
};

const AccountSecurity: React.FC = () => {
  return (
    <div>
      <Tabs
        defaultActiveKey="password"
        items={[
          { key: 'password', label: '修改密码', children: <ChangePassword /> },
          { key: 'phone', label: '绑定手机号', children: <BindPhone /> },
          { key: 'logs', label: '登录日志', children: <LoginLogs /> },
        ]}
      />
    </div>
  );
};

export default AccountSecurity;
