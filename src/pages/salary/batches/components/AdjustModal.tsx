import { Form, InputNumber, Modal } from 'antd';
import React, { useEffect } from 'react';

interface AdjustModalProps {
  open: boolean;
  onOk: (values: API.SalaryDetailAdjustRequest) => void;
  onCancel: () => void;
}

const AdjustModal: React.FC<AdjustModalProps> = ({ open, onOk, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onOk(values);
  };

  return (
    <Modal
      title="手动调整工资条"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="adjustment"
          label="调整金额（正=补发, 负=扣回）"
          rules={[{ required: true, message: '请输入调整金额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            prefix="¥"
            placeholder="如：500.00 或 -200.00"
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="调整原因"
          rules={[{ required: true, message: '请输入调整原因' }]}
        >
          <input
            style={{
              width: '100%',
              padding: '4px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              fontSize: 14,
              lineHeight: '30px',
            }}
            placeholder="请输入原因"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdjustModal;
