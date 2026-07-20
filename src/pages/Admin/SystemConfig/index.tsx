import { Card, Descriptions, Form, Input, message, Switch } from 'antd';
import React, { useState } from 'react';

const SystemConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // 预留后端接口
    setTimeout(() => {
      message.success('配置已保存（本地）');
      setSaving(false);
    }, 300);
  };

  return (
    <div>
      <Card title="系统配置" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="系统名称">HRMS 人力资源管理系统</Descriptions.Item>
          <Descriptions.Item label="版本号">4.0.1</Descriptions.Item>
          <Descriptions.Item label="前端框架">React 18 + Umi Max + Ant Design 5</Descriptions.Item>
          <Descriptions.Item label="运行时">Node.js / Java Spring Boot</Descriptions.Item>
        </Descriptions>
      </Card>

      {/*<Card title="功能开关">*/}
      {/*  <Form form={form} layout="vertical">*/}
      {/*    <Form.Item label="启用考勤打卡" name="enableAttendance" valuePropName="checked" initialValue>*/}
      {/*      <Switch />*/}
      {/*    </Form.Item>*/}
      {/*    <Form.Item label="启用薪资模块" name="enableSalary" valuePropName="checked" initialValue>*/}
      {/*      <Switch />*/}
      {/*    </Form.Item>*/}
      {/*    <Form.Item label="启用审批流程" name="enableApproval" valuePropName="checked" initialValue>*/}
      {/*      <Switch />*/}
      {/*    </Form.Item>*/}
      {/*  </Form>*/}
      {/*</Card>*/}
    </div>
  );
};

export default SystemConfig;
