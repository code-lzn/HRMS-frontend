import { SCOPE_TYPE_MAP } from '@/constants/enums';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
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
      scopeIds: values.scopeIds,
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
      title={isEdit ? '编辑账套' : '新建账套'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="账套名称"
          rules={[{ required: true, message: '请输入账套名称' }]}
        >
          <Input placeholder="如：标准职员工资" />
        </Form.Item>
        <Form.Item
          name="scopeType"
          label="适用范围"
          rules={[{ required: true, message: '请选择适用范围' }]}
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
          label="适用范围 ID（留空=全员适用）"
        >
          <Select mode="tags" placeholder="输入部门/职位/职级ID，回车添加" />
        </Form.Item>
        <Form.Item
          name="effectiveDate"
          label="生效日期"
          rules={[{ required: true, message: '请选择生效日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountForm;
