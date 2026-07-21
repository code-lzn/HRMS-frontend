import { LockOutlined } from '@ant-design/icons';
import { Card, DatePicker, Form, Input, Select, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface PersonalInfoSectionProps {
  editableFields: string[];
  flowRequiredFields: string[];
  initialValues: Record<string, any>;
  form: any;
  style?: React.CSSProperties;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  editableFields,
  flowRequiredFields,
  initialValues,
  form,
  style,
}) => {
  const isEditable = (field: string) => editableFields.includes(field);
  const isLocked = (field: string) => flowRequiredFields.includes(field);

  return (
    <Card title="个人信息" style={{ borderRadius: 12, ...style }}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="姓名"
            style={{ flex: 1 }}
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
            style={{ flex: 1 }}
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select
              placeholder="请选择性别"
              options={[
                { label: '男', value: 1 },
                { label: '女', value: 2 },
              ]}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="phone"
            label="手机号"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: '请输入邮箱' },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '邮箱格式不正确',
              },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </div>

        <Form.Item name="idCard" label="身份证号" style={{ marginBottom: 16 }}>
          <Input
            value={initialValues.idCard || ''}
            disabled
            style={{ backgroundColor: '#f5f5f5', color: '#bfbfbf' }}
            suffix={
              <Tooltip title="身份证号不可编辑">
                <LockOutlined style={{ color: '#bfbfbf' }} />
              </Tooltip>
            }
          />
        </Form.Item>

        <Form.Item
          name="birthday"
          label="生日"
          style={{ marginBottom: 16 }}
          rules={
            isEditable('birthday')
              ? [
                  {
                    validator: (_: any, value: any) => {
                      if (!value) return Promise.resolve();
                      const d = dayjs.isDayjs(value) ? value : dayjs(value);
                      if (!d.isValid()) return Promise.resolve();
                      if (d.isAfter(dayjs(), 'day')) {
                        return Promise.reject(new Error('不能晚于今天'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]
              : undefined
          }
        >
          {isLocked('birthday') ? (
            <Input
              value={
                initialValues.birthday
                  ? dayjs.isDayjs(initialValues.birthday)
                    ? initialValues.birthday.format('YYYY-MM-DD')
                    : String(initialValues.birthday)
                  : ''
              }
              disabled
            />
          ) : (
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择生日"
              disabled={!isEditable('birthday')}
            />
          )}
        </Form.Item>

        <Form.Item
          name="registeredAddress"
          label="户籍地址"
          style={{ marginBottom: 16 }}
          rules={
            isEditable('registeredAddress')
              ? [{ max: 256, message: '最多256个字符' }]
              : undefined
          }
        >
          {isLocked('registeredAddress') ? (
            <Input.TextArea
              rows={2}
              value={initialValues.registeredAddress}
              disabled
            />
          ) : (
            <Input.TextArea
              rows={2}
              placeholder="请输入户籍地址"
              disabled={!isEditable('registeredAddress')}
            />
          )}
        </Form.Item>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="emergencyContactName"
            label="紧急联系人"
            style={{ flex: 1 }}
            rules={[{ max: 32, message: '最多32个字符' }]}
          >
            <Input placeholder="请输入紧急联系人姓名" />
          </Form.Item>

          <Form.Item
            name="emergencyContactPhone"
            label="紧急联系电话"
            style={{ flex: 1 }}
            rules={[{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="请输入紧急联系电话" maxLength={11} />
          </Form.Item>
        </div>

        <Form.Item
          name="registeredAddress"
          label="户籍地址"
          style={{ marginBottom: 16 }}
          rules={
            isEditable('registeredAddress')
              ? [{ max: 256, message: '最多256个字符' }]
              : undefined
          }
        >
          {isLocked('registeredAddress') ? (
            <Input.TextArea
              rows={2}
              value={initialValues.registeredAddress}
              disabled
            />
          ) : (
            <Input.TextArea
              rows={2}
              placeholder="请输入户籍地址"
              disabled={!isEditable('registeredAddress')}
            />
          )}
        </Form.Item>

        <Form.Item
          name="currentAddress"
          label="现居住地址"
          rules={
            isEditable('currentAddress')
              ? [{ max: 256, message: '最多256个字符' }]
              : undefined
          }
        >
          {isLocked('currentAddress') ? (
            <Input.TextArea
              rows={2}
              value={initialValues.currentAddress}
              disabled
            />
          ) : (
            <Input.TextArea
              rows={2}
              placeholder="请输入现居住地址"
              disabled={!isEditable('currentAddress')}
            />
          )}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PersonalInfoSection;
