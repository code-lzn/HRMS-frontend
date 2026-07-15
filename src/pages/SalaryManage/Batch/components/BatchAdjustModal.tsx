import { adjustDetailUsingPut } from '@/api/salaryManageController';
import { Form, Input, InputNumber, message, Modal } from 'antd';
import React, { useState } from 'react';

interface BatchAdjustModalProps {
  open: boolean;
  batchId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BatchAdjustModal: React.FC<BatchAdjustModalProps> = ({
  open,
  batchId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await adjustDetailUsingPut(
        { id: batchId },
        {
          employeeId: values.employeeId,
          manualAdjust: values.manualAdjust,
          adjustReason: values.adjustReason,
        },
      );
      message.success('手动调整成功');
      onSuccess();
      form.resetFields();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="手动调整薪资"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="employeeId"
          label="员工ID"
          rules={[{ required: true, message: '请输入员工ID' }]}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: '100%' }}
            placeholder="请输入员工ID"
          />
        </Form.Item>

        <Form.Item
          name="manualAdjust"
          label="调整金额"
          rules={[{ required: true, message: '请输入调整金额' }]}
          tooltip="正数=补发，负数=扣减"
        >
          <InputNumber
            prefix="¥"
            precision={2}
            style={{ width: '100%' }}
            placeholder="正数=补发，负数=扣减"
          />
        </Form.Item>

        <Form.Item
          name="adjustReason"
          label="调整原因"
          rules={[
            { required: true, message: '请输入调整原因' },
            { max: 256, message: '最长256个字符' },
          ]}
        >
          <Input.TextArea placeholder="请输入调整原因" maxLength={256} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchAdjustModal;
