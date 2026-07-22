import { SCOPE_TYPE_MAP } from '@/constants/enums';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

interface AccountFormProps {
  open: boolean;
  editingRecord: API.SalaryAccountVO | null;
  onOk: (values: any) => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  open,
  editingRecord,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!editingRecord;

  useEffect(() => {
    if (open && editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        effectiveDate: editingRecord.effectiveDate
          ? dayjs(editingRecord.effectiveDate)
          : undefined,
        scopeIds: editingRecord.scopeIds ?? [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingRecord, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: any = {
      name: values.name,
      scopeType: values.scopeType,
      scopeIds: values.scopeIds ?? [],
      effectiveDate:
        typeof values.effectiveDate === 'string'
          ? values.effectiveDate
          : values.effectiveDate?.format('YYYY-MM-DD'),
      items: values.items,
    };
    onOk(payload);
  };

  return (
    <Modal
      title={
        <span>
          <BankOutlined style={{ marginRight: 8 }} />
          {isEdit ? '编辑账套' : '新建账套'}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={560}
      destroyOnClose
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="账套名称"
          rules={[{ required: true, message: '请输入账套名称' }]}
        >
          <Input placeholder="例如：标准职员工资账套" />
        </Form.Item>
        <Form.Item
          name="scopeType"
          label="适用范围类型"
          rules={[{ required: true, message: '请选择适用范围类型' }]}
          extra="选择该账套适用的员工范围维度"
        >
          <Select
            placeholder="请选择"
            options={Object.entries(SCOPE_TYPE_MAP).map(([k, v]) => ({
              label: v,
              value: Number(k),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="scopeIds"
          label="适用对象ID"
          extra="留空则全员适用；输入部门/职位/职级 ID 后按回车添加"
        >
          <Select mode="tags" placeholder="输入ID后按回车添加" />
        </Form.Item>
        <Form.Item
          name="effectiveDate"
          label="生效日期"
          rules={[{ required: true, message: '请选择生效日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="选择生效日期" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountForm;
