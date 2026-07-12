import { getMyProfileUsingGet, updateMyProfileUsingPost } from '@/api/employeeController';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Form, Input, message, Modal, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

const GENDER_MAP: Record<number, string> = { 0: '女', 1: '男' };
const STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: '离职', color: 'error' },
  1: { text: '在职', color: 'success' },
  2: { text: '试用期', color: 'processing' },
};

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<API.EmpProfileVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfileUsingGet();
      setProfile(res?.data ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEdit = () => {
    if (profile) {
      form.setFieldsValue({
        email: profile.email,
        currentAddress: profile.currentAddress,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
      });
    }
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await updateMyProfileUsingPost(values);
      message.success('保存成功');
      setEditOpen(false);
      loadProfile();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = profile?.status != null ? STATUS_MAP[profile.status] : null;

  return (
    <div>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>我的档案</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
        }
        loading={loading}
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="姓名">{profile?.employeeName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="工号">{profile?.employeeNo ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="性别">
            {profile?.gender != null ? GENDER_MAP[profile.gender] ?? '-' : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">{profile?.phone ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{profile?.email ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="身份证号">{profile?.idCard ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="部门">{profile?.departmentName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="职位">{profile?.positionName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="入职日期">{profile?.hireDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="员工类型">{profile?.employmentType ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {statusInfo ? (
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="基本工资">
            {profile?.baseSalary != null ? `¥${profile.baseSalary.toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="现住址" span={2}>
            {profile?.currentAddress ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="紧急联系人">{profile?.emergencyContactName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="紧急联系电话">
            {profile?.emergencyContactPhone ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="编辑档案"
        open={editOpen}
        onOk={handleSave}
        onCancel={() => setEditOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="currentAddress" label="现住址">
            <Input placeholder="请输入现住址" />
          </Form.Item>
          <Form.Item name="emergencyContactName" label="紧急联系人">
            <Input placeholder="请输入紧急联系人姓名" />
          </Form.Item>
          <Form.Item
            name="emergencyContactPhone"
            label="紧急联系电话"
            rules={[
              {
                pattern: /^$|^1[3-9]\d{9}$/,
                message: '请输入正确的手机号格式',
              },
            ]}
          >
            <Input placeholder="请输入紧急联系电话" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProfile;
