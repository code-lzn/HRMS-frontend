import LockedField from '@/components/LockedField';
import { CONTRACT_TYPE_MAP } from '@/constants/enums';
import { Card, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import React from 'react';

interface SalaryContractSectionProps {
  editableFields: string[];
  flowRequiredFields: string[];
  initialValues: Record<string, any>;
}

/**
 * 薪资与合同信息编辑区（仅HR可见）
 */
const SalaryContractSection: React.FC<SalaryContractSectionProps> = ({
  editableFields,
  flowRequiredFields,
  initialValues,
}) => {
  const isEditable = (field: string) => editableFields.includes(field);
  const isLocked = (field: string) => flowRequiredFields.includes(field);

  const contractTypeOptions = Object.entries(CONTRACT_TYPE_MAP).map(
    ([value, label]) => ({ label, value: Number(value) }),
  );

  return (
    <Card title="薪资与合同信息" style={{ marginBottom: 16 }}>
      <Form.Item
        name="contractType"
        label="合同类型"
        rules={
          isEditable('contractType')
            ? [{ required: true, message: '请选择合同类型' }]
            : undefined
        }
      >
        {isLocked('contractType') ? (
          <LockedField
            value={CONTRACT_TYPE_MAP[initialValues.contractType] || ''}
            tooltip="此字段不可编辑"
          />
        ) : (
          <Select
            placeholder="请选择合同类型"
            options={contractTypeOptions}
            disabled={!isEditable('contractType')}
          />
        )}
      </Form.Item>

      <Form.Item name="contractExpireDate" label="合同到期日">
        {isLocked('contractExpireDate') ? (
          <LockedField
            value={initialValues.contractExpireDate || ''}
            tooltip="此字段不可编辑"
          />
        ) : (
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择合同到期日"
            disabled={!isEditable('contractExpireDate')}
          />
        )}
      </Form.Item>

      <Form.Item
        name="probationRatio"
        label="试用期待遇比例"
        rules={
          isEditable('probationRatio')
            ? [
                { required: true, message: '请输入试用期比例' },
                {
                  type: 'number',
                  min: 0.8,
                  max: 1.0,
                  message: '比例为0.8~1.0',
                },
              ]
            : undefined
        }
      >
        {isLocked('probationRatio') ? (
          <LockedField
            value={
              initialValues.probationRatio
                ? `${(initialValues.probationRatio * 100).toFixed(0)}%`
                : ''
            }
            tooltip="此字段不可编辑"
          />
        ) : (
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入试用期比例（0.8~1.0）"
            min={0.8}
            max={1}
            step={0.05}
            disabled={!isEditable('probationRatio')}
          />
        )}
      </Form.Item>

      <Form.Item
        name="baseSalary"
        label="基本工资"
        rules={
          isEditable('baseSalary')
            ? [{ required: true, message: '请输入基本工资' }]
            : undefined
        }
      >
        {isLocked('baseSalary') ? (
          <LockedField value="****" tooltip="此字段不可编辑" />
        ) : (
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入基本工资"
            min={0}
            precision={2}
            prefix="¥"
            disabled={!isEditable('baseSalary')}
          />
        )}
      </Form.Item>

      <Form.Item
        name="bankAccount"
        label="银行账号"
        rules={
          isEditable('bankAccount')
            ? [{ max: 64, message: '最多64个字符' }]
            : undefined
        }
      >
        {isLocked('bankAccount') ? (
          <LockedField
            value={
              initialValues.bankAccount
                ? `****${initialValues.bankAccount.slice(-4)}`
                : ''
            }
            tooltip="此字段不可编辑"
          />
        ) : (
          <Input
            placeholder="请输入银行账号"
            disabled={!isEditable('bankAccount')}
          />
        )}
      </Form.Item>

      <Form.Item
        name="bankName"
        label="开户行"
        rules={
          isEditable('bankName')
            ? [{ max: 128, message: '最多128个字符' }]
            : undefined
        }
      >
        {isLocked('bankName') ? (
          <LockedField
            value={initialValues.bankName}
            tooltip="此字段不可编辑"
          />
        ) : (
          <Input
            placeholder="请输入开户行"
            disabled={!isEditable('bankName')}
          />
        )}
      </Form.Item>
    </Card>
  );
};

export default SalaryContractSection;
