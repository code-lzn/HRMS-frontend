import LockedField from '@/components/LockedField';
import { GENDER_MAP, LOCKED_FIELD_MESSAGES } from '@/constants/enums';
import { Card, DatePicker, Form, Input, Select, Tag } from 'antd';
import React from 'react';

interface PersonalInfoSectionProps {
  editableFields: string[];
  flowRequiredFields: string[];
  initialValues: Record<string, any>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  editableFields,
  flowRequiredFields,
  initialValues,
}) => {
  const isEditable = (field: string) => editableFields.includes(field);
  const isLocked = (field: string) => flowRequiredFields.includes(field);

  return (
    <Card title="个人信息" style={{ borderRadius: 12, marginBottom: 0 }}>
      <Form layout="vertical">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="name"
            label={
              <span>
                姓名 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
            rules={
              isEditable('name')
                ? [{ required: true, message: '请输入姓名' }]
                : undefined
            }
          >
            {isLocked('name') ? (
              <LockedField
                value={initialValues.name}
                tooltip={LOCKED_FIELD_MESSAGES.name || '此字段不可编辑'}
              />
            ) : (
              <Input placeholder="请输入姓名" disabled={!isEditable('name')} />
            )}
          </Form.Item>

          <Form.Item
            name="gender"
            label={
              <span>
                性别 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
            rules={
              isEditable('gender')
                ? [{ required: true, message: '请选择性别' }]
                : undefined
            }
          >
            {isLocked('gender') ? (
              <LockedField
                value={GENDER_MAP[initialValues.gender] || ''}
                tooltip="此字段不可编辑"
              />
            ) : (
              <Select
                placeholder="请选择性别"
                options={[
                  { label: '男', value: 1 },
                  { label: '女', value: 2 },
                ]}
                disabled={!isEditable('gender')}
              />
            )}
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="phone"
            label={
              <span>
                手机号 <span style={{ color: '#ff4d4f' }}>*</span>
                <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>
                  需调岗流程
                </Tag>
              </span>
            }
            style={{ flex: 1 }}
          >
            <LockedField
              value={initialValues.phone || ''}
              tooltip={LOCKED_FIELD_MESSAGES.phone}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span>
                邮箱 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
            rules={
              isEditable('email')
                ? [
                    { required: true, message: '请输入邮箱' },
                    {
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: '邮箱格式不正确',
                    },
                  ]
                : undefined
            }
          >
            {isLocked('email') ? (
              <LockedField
                value={initialValues.email}
                tooltip={LOCKED_FIELD_MESSAGES.email || '此字段不可编辑'}
              />
            ) : (
              <Input placeholder="请输入邮箱" disabled={!isEditable('email')} />
            )}
          </Form.Item>
        </div>

        <Form.Item
          name="idCard"
          label={
            <span>
              身份证号 <span style={{ color: '#ff4d4f' }}>*</span>
              <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>
                需调岗流程
              </Tag>
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <LockedField
            value={initialValues.idCard || ''}
            tooltip={LOCKED_FIELD_MESSAGES.idCard}
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
                    validator: (_, value) => {
                      if (value && value.isAfter(new Date())) {
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
            <LockedField
              value={initialValues.birthday || ''}
              tooltip="此字段不可编辑"
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
            <LockedField
              value={initialValues.registeredAddress}
              tooltip="此字段不可编辑"
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
            <LockedField
              value={initialValues.currentAddress}
              tooltip="此字段不可编辑"
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
