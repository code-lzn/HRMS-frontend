import { useState, useEffect } from 'react';
import { Descriptions, Button, Input, DatePicker, Tag, Space, Card, message, Modal, Tooltip } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { ProfileUpdateDTO } from '@/services/profile/typings';
import { updateProfile } from '@/services/profile';
import { useProfile } from '@/hooks/useProfile';
import dayjs from 'dayjs';

export default function ProfilePage() {
  const { profile, loading, fetchProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileUpdateDTO>>({});
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<Partial<ProfileUpdateDTO>>({});

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    const data = {
      email: profile?.email,
      address: profile?.address,
      emergencyContact: profile?.emergencyContact,
      emergencyPhone: profile?.emergencyPhone,
    };
    setEditData(data);
    setOriginalData({ ...data });
    setEditing(true);
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(editData) !== JSON.stringify(originalData);
    if (hasChanges) {
      Modal.confirm({
        title: '确认取消',
        content: '修改尚未保存，确定要取消吗？',
        onOk: () => {
          setEditing(false);
          setEditData({});
        },
      });
    } else {
      setEditing(false);
      setEditData({});
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(editData);
      message.success('保存成功');
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      message.error(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const isLocked = (field: string): boolean => profile?.lockedFields?.includes(field) ?? false;

  const renderField = (_label: string, field: string, value: any, locked: boolean) => {
    if (editing && !locked) {
      if (field === 'birthday') {
        return (
          <DatePicker
            value={(editData as any).birthday ? dayjs((editData as any).birthday) : null}
            onChange={(d) => setEditData({ ...editData, birthday: d?.format('YYYY-MM-DD') } as any)}
          />
        );
      }
      return (
        <Input
          value={(editData as any)[field] ?? ''}
          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
        />
      );
    }
    if (locked) {
      return (
        <Tooltip title="如需修改请联系 HR">
          <span style={{ color: '#999', cursor: 'not-allowed' }}>{value ?? '-'}</span>
        </Tooltip>
      );
    }
    return <span>{value ?? '-'}</span>;
  };

  if (!profile) return <Card loading={loading} />;

  return (
    <Card
      title="我的档案"
      extra={
        editing ? (
          <Space>
            <Button icon={<SaveOutlined />} type="primary" onClick={handleSave} loading={saving}>
              保存
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              取消
            </Button>
          </Space>
        ) : (
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
        )
      }
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="工号">{profile.employeeNo}</Descriptions.Item>
        <Descriptions.Item label="姓名">
          {renderField('姓名', 'name', profile.name, isLocked('name'))}
        </Descriptions.Item>
        <Descriptions.Item label="性别">{profile.genderDesc}</Descriptions.Item>
        <Descriptions.Item label="手机号">
          {renderField('手机号', 'phone', profile.phone, true)}
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {renderField('邮箱', 'email', profile.email, false)}
        </Descriptions.Item>
        <Descriptions.Item label="身份证号">
          {renderField('身份证号', 'idCard', profile.idCard, true)}
        </Descriptions.Item>
        <Descriptions.Item label="生日">
          {renderField('生日', 'birthday', profile.birthday, false)}
        </Descriptions.Item>
        <Descriptions.Item label="现居住地址">
          {renderField('现居住地址', 'address', profile.address, false)}
        </Descriptions.Item>
        <Descriptions.Item label="紧急联系人">
          {renderField('紧急联系人', 'emergencyContact', profile.emergencyContact, false)}
        </Descriptions.Item>
        <Descriptions.Item label="紧急联系人电话">
          {renderField('紧急联系人电话', 'emergencyPhone', profile.emergencyPhone, false)}
        </Descriptions.Item>
        <Descriptions.Item label="所属部门">
          {renderField('所属部门', 'departmentName', profile.departmentName, isLocked('departmentName'))}
        </Descriptions.Item>
        <Descriptions.Item label="职位">
          {renderField('职位', 'positionName', profile.positionName, isLocked('positionName'))}
        </Descriptions.Item>
        <Descriptions.Item label="职级">
          {renderField('职级', 'jobLevel', profile.jobLevel, isLocked('jobLevel'))}
        </Descriptions.Item>
        <Descriptions.Item label="在职状态">
          <Tag
            color={
              profile.status === 2
                ? 'green'
                : profile.status === 1
                  ? 'blue'
                  : 'red'
            }
          >
            {profile.statusDesc}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="入职日期">{profile.hireDate}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
