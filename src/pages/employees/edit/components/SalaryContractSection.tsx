import LockedField from '@/components/LockedField';
import { CONTRACT_TYPE_MAP } from '@/constants/enums';
import {
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
} from 'antd';
import React from 'react';

interface SalaryContractSectionProps {
  editableFields: string[];
  flowRequiredFields: string[];
  initialValues: Record<string, any>;
  form: any;
  style?: React.CSSProperties;
}

const SalaryContractSection: React.FC<SalaryContractSectionProps> = ({
  editableFields,
  flowRequiredFields,
  initialValues,
  form,
  style,
}) => {
  const isEditable = (field: string) => editableFields.includes(field);
  const isLocked = (field: string) => flowRequiredFields.includes(field);

  const contractTypeOptions = Object.entries(CONTRACT_TYPE_MAP).map(
    ([value, label]) => ({ label, value: Number(value) }),
  );

  const probationRatioDisplay = initialValues.probationRatio
    ? Math.round(initialValues.probationRatio * 100)
    : 80;

  return (
    <Card title="薪资与合同（HR可见）" style={{ borderRadius: 12, ...style }}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="contractType"
            label={
              <span>
                合同类型 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
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

          <Form.Item
            name="contractExpireDate"
            label={
              <span>
                合同到期日 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
          >
            {isLocked('contractExpireDate') ? (
              <LockedField
                value={initialValues.contractExpireDate || ''}
                tooltip="此字段不可编辑"
              />
            ) : (
              <DatePicker
                style={{ width: '100%' }}
                placeholder="年/月/日"
                disabled={!isEditable('contractExpireDate')}
              />
            )}
          </Form.Item>
        </div>

        <Form.Item
          name="probationRatio"
          label={
            <span>
              试用期待遇比例 <span style={{ color: '#ff4d4f' }}>*</span>
            </span>
          }
          style={{ marginBottom: 16 }}
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
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <LockedField
                  value={`${probationRatioDisplay}%`}
                  tooltip="此字段不可编辑"
                />
              </div>
              <Slider
                disabled
                min={80}
                max={100}
                value={probationRatioDisplay}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <InputNumber
                  style={{ width: 120 }}
                  min={0.8}
                  max={1}
                  step={0.05}
                  formatter={(value) =>
                    `${Math.round(((value as any) || 0) * 100)}%` as any
                  }
                  parser={(value) =>
                    value
                      ? parseFloat(value.replace('%', '')) / 100
                      : (0 as any)
                  }
                  disabled={!isEditable('probationRatio')}
                />
                <span
                  style={{ fontWeight: 600, color: '#1677ff', fontSize: 16 }}
                >
                  {probationRatioDisplay}%
                </span>
              </div>
              <Slider
                min={80}
                max={100}
                value={probationRatioDisplay}
                onChange={(value) => {
                  form.setFieldValue('probationRatio', value / 100);
                }}
                disabled={!isEditable('probationRatio')}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                范围 80%-100%，影响薪资计算
              </div>
            </div>
          )}
        </Form.Item>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Form.Item
            name="salaryAccountName"
            label={
              <span>
                薪资账套 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
          >
            {isLocked('salaryAccountName') ? (
              <LockedField
                value={initialValues.salaryAccountName || ''}
                tooltip="此字段不可编辑"
              />
            ) : (
              <Select
                placeholder="请选择薪资账套"
                options={[
                  { label: '标准账套A', value: 'standard_a' },
                  { label: '标准账套B', value: 'standard_b' },
                  { label: '标准账套C', value: 'standard_c' },
                ]}
                disabled={!isEditable('salaryAccountName')}
              />
            )}
          </Form.Item>

          <Form.Item
            name="baseSalary"
            label={
              <span>
                基本工资 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            style={{ flex: 1 }}
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
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="bankAccount"
            label="银行账号"
            style={{ flex: 1 }}
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
            style={{ flex: 1 }}
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
        </div>
      </Form>
    </Card>
  );
};

export default SalaryContractSection;
