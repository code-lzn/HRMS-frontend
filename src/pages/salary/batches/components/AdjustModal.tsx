import { Form, InputNumber, Modal } from 'antd';
import { DollarOutlined, EditOutlined } from '@ant-design/icons';
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
      title={
        <span>
          <EditOutlined style={{ marginRight: 8 }} />
          手动调整工资条
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      okText="确认调整"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="adjustment"
          label="调整金额"
          rules={[{ required: true, message: '请输入调整金额' }]}
          extra="正数为补发，负数为扣回"
        >
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            prefix="¥"
            placeholder="例如：500.00 或 -200.00"
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
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              fontSize: 14,
              lineHeight: '22px',
              transition: 'border-color 0.3s',
            }}
            placeholder="请输入调整原因"
            onFocus={(e) => {
              e.target.style.borderColor = '#1677ff';
              e.target.style.boxShadow = '0 0 0 2px rgba(22, 119, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d9d9d9';
              e.target.style.boxShadow = 'none';
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdjustModal;
