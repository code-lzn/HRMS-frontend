import { Card, Form, Input } from 'antd';
import React from 'react';

interface EmergencyContactSectionProps {
  inputStyle?: React.CSSProperties;
}

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  inputStyle = { borderRadius: 6 },
}) => {
  return (
    <Card
      title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>紧急联系人</span>}
      style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Form.Item name="emergencyContactName" label="联系人姓名" rules={[{ max: 32 }]}>
          <Input placeholder="请输入联系人姓名" maxLength={32} style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="emergencyContactPhone"
          label="联系人电话"
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: '电话格式不正确' }]}
        >
          <Input placeholder="请输入联系人电话" maxLength={11} style={inputStyle} />
        </Form.Item>
      </div>
    </Card>
  );
};

export default EmergencyContactSection;
