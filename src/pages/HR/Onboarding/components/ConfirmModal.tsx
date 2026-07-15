import { confirmOnboarding } from '../services/onboarding';
import { Modal, Form, DatePicker, message } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onboardingId?: number;
  onOk: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({ open, onboardingId, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const dateStr = values.actualEntryDate.format('YYYY-MM-DD');
      setLoading(true);
      await confirmOnboarding(onboardingId!, dateStr);
      message.success('确认入职成功，已自动创建员工档案和登录账号');
      onOk();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="确认入职" open={open} onOk={handleOk} onCancel={onCancel}
      confirmLoading={loading} destroyOnClose width={420} draggable>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}
        initialValues={{ actualEntryDate: dayjs() }}>
        <Form.Item name="actualEntryDate" label="实际入职日期"
          rules={[{ required: true, message: '请选择' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
      <p style={{ color: '#666', fontSize: 12 }}>
        确认后系统将自动：生成工号 → 创建员工档案 → 创建系统登录账号
      </p>
    </Modal>
  );
};

export default ConfirmModal;
