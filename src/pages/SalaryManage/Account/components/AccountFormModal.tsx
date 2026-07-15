import {
  createAccountUsingPost,
  updateAccountUsingPut,
} from '@/api/salaryManageController';
import {
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const SCOPE_TYPE_OPTIONS = [
  { label: '部门', value: 1 },
  { label: '职位', value: 2 },
  { label: '职级', value: 3 },
];

interface AccountFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  editRecord?: API.SalaryAccountVO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  open,
  mode,
  editRecord,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editRecord) {
      form.setFieldsValue({
        name: editRecord.name,
        scopeType: editRecord.scopeType,
        scopeIds: editRecord.scopeIds,
        effectiveDate: editRecord.effectiveDate ? dayjs(editRecord.effectiveDate) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, mode, editRecord, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: API.SalaryAccountRequest = {
        name: values.name,
        scopeType: values.scopeType,
        scopeIds: values.scopeIds,
        effectiveDate: values.effectiveDate
          ? dayjs(values.effectiveDate).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
      };

      if (mode === 'add') {
        await createAccountUsingPost(payload);
        message.success('新建账套成功');
      } else {
        await updateAccountUsingPut({ id: editRecord!.id! }, payload);
        message.success('编辑账套成功');
      }
      onSuccess();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? '新建薪资账套' : '编辑薪资账套'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="账套名称"
          rules={[
            { required: true, message: '请输入账套名称' },
            { max: 64, message: '账套名称最长64个字符' },
          ]}
        >
          <Input placeholder="请输入账套名称" maxLength={64} />
        </Form.Item>

        <Form.Item
          name="scopeType"
          label="适用范围类型"
          rules={[{ required: true, message: '请选择适用范围类型' }]}
        >
          <Select placeholder="请选择适用范围类型" options={SCOPE_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="scopeIds"
          label="适用范围ID（JSON数组）"
          tooltip="例如：[1,2,3]，留空表示不限制"
          rules={[{ max: 512, message: '最长512个字符' }]}
        >
          <Input placeholder="请输入适用范围ID，如：[1,2,3]" maxLength={512} />
        </Form.Item>

        <Form.Item
          name="effectiveDate"
          label="生效日期"
          rules={[{ required: true, message: '请选择生效日期' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="请选择生效日期"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountFormModal;
