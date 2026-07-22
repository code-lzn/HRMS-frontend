import { Card, DatePicker, Form, Input, InputNumber, Select, Slider } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React from 'react';
import { CONTRACT_OPTIONS } from '@/utils/employeeConstants';

interface SalaryContractSectionProps {
  form: FormInstance;
  mode: 'add' | 'edit';
  inputStyle?: React.CSSProperties;
  disabledInputStyle?: React.CSSProperties;
  /** 薪资账套选项 */
  salaryAccounts?: { value: number; label: string }[];
  /** 编辑模式：试用期比例 slider 值 */
  probationRatio?: number;
  onProbationRatioChange?: (val: number) => void;
  isLocked?: (field: string) => boolean;
  lockedLabel?: (label: string, field: string, tip: string) => React.ReactNode;
  lockedSuffix?: (field: string, tip: string) => React.ReactNode;
}

const SalaryContractSection: React.FC<SalaryContractSectionProps> = ({
  form,
  mode,
  inputStyle = { borderRadius: 6 },
  disabledInputStyle = { borderRadius: 6, color: '#999', background: '#f5f5f5' },
  salaryAccounts = [],
  probationRatio = 0.8,
  onProbationRatioChange,
  isLocked = () => false,
  lockedLabel = (label) => label,
  lockedSuffix = () => undefined,
}) => {
  return (
    <Card
      title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>薪资与合同信息</span>}
      style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {/* 合同类型 */}
        <Form.Item
          name="contractType"
          label={lockedLabel('合同类型', 'contractType', '仅HR可编辑')}
          rules={[{ required: true, message: '请选择合同类型' }]}
        >
          <Select
            placeholder="请选择合同类型"
            options={CONTRACT_OPTIONS}
            style={inputStyle} disabled={isLocked('contractType')}
          />
        </Form.Item>

        {/* 合同到期日 */}
        <Form.Item
          name="contractExpireDate"
          label={lockedLabel('合同到期日', 'contractExpireDate', '仅HR可编辑')}
          dependencies={['contractType']}
          rules={[
            ({ getFieldValue }) => ({
              required: getFieldValue('contractType') === 1,
              message: '固定期限合同请选择到期日',
            }),
          ]}
        >
          <DatePicker
            style={{ width: '100%', ...inputStyle }}
            disabled={isLocked('contractExpireDate')}
          />
        </Form.Item>

        {/* 试用期待遇比例 — 滑块选择 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>
            试用期待遇比例 <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <Form.Item name="probationRatio" rules={[{ required: true, message: '请设置试用期待遇比例' }]} hidden>
            <Input />
          </Form.Item>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Slider
              min={mode === 'add' ? 0.8 : 0.6} max={1} step={0.05}
              value={probationRatio}
              onChange={(val) => {
                onProbationRatioChange?.(val);
                form.setFieldValue('probationRatio', val);
              }}
              style={{ flex: 1 }}
              tooltip={{ formatter: (v) => `${((v ?? 0.8) * 100).toFixed(0)}%` }}
            />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', minWidth: 52, textAlign: 'right' }}>
              {(probationRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
            范围 {mode === 'add' ? '80% ~ 100%' : '60% ~ 100%'}，步长 5%
          </div>
        </div>

        {/* 薪资账套 */}
        <Form.Item
          name="accountSetId"
          label={lockedLabel('薪资账套', 'accountSetId', '仅HR可编辑')}
        >
          <Select
            placeholder="请选择薪资账套" allowClear
            options={salaryAccounts}
            style={inputStyle} disabled={isLocked('accountSetId')}
          />
        </Form.Item>

        {/* 基本工资 */}
        <Form.Item
          name="baseSalary"
          label={lockedLabel('基本工资', 'baseSalary', '仅HR可编辑')}
          rules={[
            { required: true, message: '请输入基本工资' },
            { type: 'number', min: 0, message: '基本工资不能为负数' },
          ]}
        >
          <InputNumber
            min={0} precision={2} prefix="¥" placeholder="0.00"
            style={{ width: '100%', ...inputStyle }}
          />
        </Form.Item>

        {/* 银行账号 */}
        <Form.Item
          name="bankAccount"
          label={lockedLabel('银行账号', 'bankAccount', '仅HR可编辑')}
          rules={[{ max: 32 }]}
        >
          <Input
            placeholder="请输入银行账号" maxLength={32}
            style={isLocked('bankAccount') ? disabledInputStyle : inputStyle}
            disabled={isLocked('bankAccount')}
          />
        </Form.Item>

        {/* 开户行 */}
        <Form.Item
          name="bankName"
          label={lockedLabel('开户行', 'bankName', '仅HR可编辑')}
          rules={[{ max: 64 }]}
        >
          <Input
            placeholder="请输入开户行" maxLength={64}
            style={isLocked('bankName') ? disabledInputStyle : inputStyle}
            disabled={isLocked('bankName')}
          />
        </Form.Item>
      </div>
    </Card>
  );
};

export default SalaryContractSection;
