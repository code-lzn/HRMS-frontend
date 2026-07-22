import { Card, DatePicker, Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React from 'react';

interface PersonalInfoSectionProps {
  form: FormInstance;
  mode: 'add' | 'edit';
  inputStyle?: React.CSSProperties;
  /** 编辑模式：禁用态样式 */
  disabledInputStyle?: React.CSSProperties;
  /** 编辑模式：判断字段是否锁定 */
  isLocked?: (field: string) => boolean;
  /** 编辑模式：锁定字段的 label 提示 — 参数顺序 (label, field, tip) */
  lockedLabel?: (label: string, field: string, tip: string) => React.ReactNode;
  /** 编辑模式：锁定字段的 suffix 问号 */
  lockedSuffix?: (field: string, tip: string) => React.ReactNode;
  /** 新增模式：手机号唯一性校验 */
  checkPhoneUnique?: (rule: any, value: string) => Promise<void>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  mode,
  inputStyle = { borderRadius: 6 },
  disabledInputStyle = { borderRadius: 6, color: '#999', background: '#f5f5f5' },
  isLocked = () => false,
  lockedLabel = (label) => label,
  lockedSuffix = () => undefined,
  checkPhoneUnique,
}) => {
  return (
    <Card
      title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>个人信息</span>}
      style={{
        borderRadius: 8, border: '1px solid #e8edf2',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%', overflow: 'auto',
      }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Form.Item
          name="employeeName"
          label={lockedLabel('姓名', 'employeeName', '基本信息不可修改')}
          rules={[{ required: true, message: '请输入姓名' }, { max: 32 }]}
        >
          <Input
            placeholder="请输入姓名" maxLength={32}
            style={isLocked('employeeName') ? disabledInputStyle : inputStyle}
            disabled={isLocked('employeeName')}
          />
        </Form.Item>

        <Form.Item
          name="gender"
          label={lockedLabel('性别', 'gender', '基本信息不可修改')}
          rules={[{ required: true, message: '请选择性别' }]}
        >
          <Select
            placeholder="请选择"
            disabled={isLocked('gender')}
            options={[{ value: 1, label: '男' }, { value: 0, label: '女' }]}
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label={lockedLabel('手机号', 'phone', '如需修改手机号请联系HR')}
          style={{ gridColumn: '1 / -1' }}
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ...(checkPhoneUnique ? [{ validator: checkPhoneUnique, validateTrigger: 'onBlur' as const }] : []),
          ]}
        >
          <Input
            placeholder="请输入手机号" maxLength={11}
            style={isLocked('phone') ? disabledInputStyle : inputStyle}
            disabled={isLocked('phone')}
            suffix={lockedSuffix('phone', '如需修改手机号请联系HR')}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={lockedLabel('邮箱', 'email', '基本信息不可修改')}
          style={{ gridColumn: '1 / -1' }}
          rules={[{ type: 'email' as const, message: '邮箱格式不正确' }]}
        >
          <Input
            placeholder="请输入邮箱"
            style={isLocked('email') ? disabledInputStyle : inputStyle}
            disabled={isLocked('email')}
          />
        </Form.Item>

        <Form.Item
          name="idCard"
          label={lockedLabel('身份证号', 'idCard', '如需修改身份证号请联系HR')}
          style={{ gridColumn: '1 / -1' }}
          rules={[
            { required: true, message: '请输入身份证号' },
            { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确' },
          ]}
        >
          <Input
            placeholder="请输入身份证号" maxLength={18}
            style={isLocked('idCard') ? disabledInputStyle : inputStyle}
            disabled={isLocked('idCard')}
            suffix={lockedSuffix('idCard', '如需修改身份证号请联系HR')}
          />
        </Form.Item>

        <Form.Item
          name="birthday"
          label={lockedLabel('生日', 'birthday', '基本信息不可修改')}
          style={{ gridColumn: '1 / -1' }}
        >
          <DatePicker style={{ width: '100%', ...inputStyle }} disabled={isLocked('birthday')} />
        </Form.Item>

        <Form.Item
          name="registeredAddress"
          label={lockedLabel('户籍地址', 'registeredAddress', '基本信息不可修改')}
          style={{ gridColumn: '1 / -1' }}
          rules={[{ max: 128 }]}
        >
          <Input
            placeholder="请输入户籍地址" maxLength={128}
            style={isLocked('registeredAddress') ? disabledInputStyle : inputStyle}
            disabled={isLocked('registeredAddress')}
          />
        </Form.Item>

        <Form.Item
          name="currentAddress"
          label={lockedLabel('现居住地址', 'currentAddress', '基本信息不可修改')}
          style={{ gridColumn: '1 / -1' }}
          rules={[{ max: 128 }]}
        >
          <Input
            placeholder="请输入现居住地址" maxLength={128}
            style={isLocked('currentAddress') ? disabledInputStyle : inputStyle}
            disabled={isLocked('currentAddress')}
          />
        </Form.Item>
      </div>
    </Card>
  );
};

export default PersonalInfoSection;
