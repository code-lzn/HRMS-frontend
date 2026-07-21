import { useState, useEffect } from 'react';
import { Descriptions, Button, Input, Tag, Card, message, Modal, Upload } from 'antd';
import { EditOutlined, UserOutlined, CameraOutlined } from '@ant-design/icons';
import { uploadFileUsingPost } from '@/api/fileController';
import type { ProfileUpdateDTO } from '@/services/profile/typings';
import { updateProfile } from '@/services/profile';
import { useProfile } from '@/hooks/useProfile';
import { PageContainer } from '@ant-design/pro-components';

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

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!profile) return <PageContainer><Card loading={loading} /></PageContainer>;

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>我的档案</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>查看和管理您的个人信息</div>
          </div>
        ),
      }}
    >
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Upload
            showUploadList={false}
            accept="image/*"
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const res = await uploadFileUsingPost(
                  { biz: 'user_avatar' } as any,
                  {},
                  file as File,
                );
                if ((res as any)?.code === 0) {
                  onSuccess?.(res);
                  message.success('头像更新成功');
                  fetchProfile();
                } else {
                  onError?.({ message: '上传失败' } as any);
                }
              } catch (e: any) {
                onError?.({ message: e?.message || '上传失败' } as any);
                message.error(e?.message || '上传失败');
              }
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: profile.userAvatar
                  ? `url(${profile.userAvatar}) center/cover`
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              title="点击上传头像"
            >
              {!profile.userAvatar && getInitial(profile.name)}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 24,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 12 }} />
              </div>
            </div>
          </Upload>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#999' }}>{profile.employeeNo}</span>
              <Tag color="blue" style={{ background: '#dbeafe', color: '#2563eb', borderRadius: 4, fontSize: 12 }}>
                {profile.departmentName}
              </Tag>
              <Tag color="green" style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 4, fontSize: 12 }}>
                {profile.statusDesc}
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>基本信息</span>
              <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>如需修改请联系HR</span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>工号</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.employeeNo}</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>部门</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.departmentName}</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>职位</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.positionName}</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>入职日期</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.hireDate}</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>手机号</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>薪资</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>****</div>
            </div>
          </div>
        </Card>

        <Card
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>联系信息</span>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                style={{ color: '#6366f1', padding: 0 }}
                onClick={editing ? handleCancel : handleEdit}
              >
                {editing ? '取消' : '编辑'}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>邮箱</div>
              {editing ? (
                <Input
                  value={(editData as any).email ?? ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  size="small"
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.email || '-'}</div>
              )}
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>现居住地址</div>
              {editing ? (
                <Input
                  value={(editData as any).address ?? ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  size="small"
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.address || '-'}</div>
              )}
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>紧急联系人</div>
              {editing ? (
                <Input
                  value={(editData as any).emergencyContact ?? ''}
                  onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
                  size="small"
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.emergencyContact || '-'}</div>
              )}
            </div>
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>紧急联系电话</div>
              {editing ? (
                <Input
                  value={(editData as any).emergencyPhone ?? ''}
                  onChange={(e) => setEditData({ ...editData, emergencyPhone: e.target.value })}
                  size="small"
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {profile.emergencyPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '-'}
                </div>
              )}
            </div>
            {editing && (
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                style={{ marginTop: 8, background: '#6366f1', borderColor: '#6366f1', borderRadius: 8 }}
              >
                保存
              </Button>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
