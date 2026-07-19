import { deleteUserUsingPost, listUserByPageUsingPost, updateUserStatusUsingPost, updateUserUsingPost, userRegisterUsingPost } from '@/api/userController';
import { assignRoleUsingPost, listAllRolesUsingGet } from '@/api/roleController';
import { uploadFileUsingPost } from '@/api/fileController';
import { CameraOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Form, Input, message, Modal, Select, Space, Spin, Tag, Upload } from 'antd';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import usePermission from '@/hooks/usePermission';

const ROLE_TAG_COLOR: Record<string, string> = { admin: 'red', user: 'blue' };

const UserManage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { canSeeRoleMenu } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editing, setEditing] = useState<API.User | null>(null);
  const [selectedUser, setSelectedUser] = useState<API.User | null>(null);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<API.RoleVO[]>([]);
  const [editAvatar, setEditAvatar] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const columns: ProColumns<API.User>[] = [
    {
      title: '头像',
      dataIndex: 'userAvatar',
      width: 60,
      search: false,
      render: (_, r) => <Avatar size={32} src={r.userAvatar || undefined} icon={!r.userAvatar && <UserOutlined />} />,
    },
    { title: '用户名', dataIndex: 'userName', width: 120 },
    {
      title: '角色',
      dataIndex: 'userRole',
      width: 100,
      render: (_, r) => {
        const name = r.userRoleName ?? r.userRole ?? 'user';
        return <Tag color={ROLE_TAG_COLOR[name.toLowerCase()] ?? 'default'}>{name}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isDelete',
      width: 80,
      render: (_, r) =>
        r.isDelete === 1 ? (
          <Tag color="error">禁用</Tag>
        ) : (
          <Tag color="success">正常</Tag>
        ),
    },
    {
      title: '简介',
      dataIndex: 'userProfile',
      width: 180,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, r) => (r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleToggleDisable(record)}>
            {record.isDelete === 1 ? '启用' : '禁用'}
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  const loadRoles = async () => {
    try { const r = await listAllRolesUsingGet(); setRoles(r?.data ?? []); } catch { setRoles([]); }
  };

  const openCreate = async () => {
    setEditing(null);
    form.resetFields();
    await loadRoles();
    setModalOpen(true);
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;
    setAvatarUploading(true);
    try {
      const res = await uploadFileUsingPost({ biz: 'avatar' }, {}, file);
      const url = res?.data ?? '';
      setEditAvatar(url);
      form.setFieldValue('userAvatar', url);
      message.success('头像上传成功');
    } catch (e: any) {
      message.error(e.message || '头像上传失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  const openEdit = async (record: API.User) => {
    setEditing(record);
    setEditAvatar(record.userAvatar ?? '');
    form.setFieldsValue({ userName: record.userName, userProfile: record.userProfile, userRole: record.userRole, userAvatar: record.userAvatar });
    await loadRoles();
    setModalOpen(true);
  };

  const openAssignRole = async (record: API.User) => {
    setSelectedUser(record);
    roleForm.setFieldsValue({ roleId: record.roleId });
    await loadRoles();
    setRoleModalOpen(true);
  };

  const handleToggleDisable = (record: API.User) => {
    const isDisabled = record.isDelete === 1;
    Modal.confirm({
      title: isDisabled ? '确认启用' : '确认禁用',
      content: `确定要${isDisabled ? '启用' : '禁用'}用户「${record.userName}」吗？`,
      onOk: async () => {
        try {
          await updateUserStatusUsingPost({ id: record.id!, status: isDisabled ? 0 : 1 });
          message.success(isDisabled ? '已启用' : '已禁用');
          actionRef.current?.reload();
        } catch (e: any) { message.error(e.message || '操作失败'); }
      },
    });
  };

  const handleDelete = (record: API.User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${record.userName}」吗？`,
      onOk: async () => {
        try { await deleteUserUsingPost({ id: record.id! }); message.success('已删除'); actionRef.current?.reload(); }
        catch (e: any) { message.error(e.message || '删除失败'); }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateUserUsingPost({ id: editing.id!, userName: values.userName, userProfile: values.userProfile, userRole: values.userRole });
        message.success('已更新');
      } else {
        await userRegisterUsingPost({
          userAccount: values.userAccount,
          userPassword: values.userPassword,
          checkPassword: values.checkPassword,
        });
        message.success('注册成功');
      }
      setModalOpen(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (e: any) { if (e.message) message.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleAssignRole = async () => {
    try {
      const values = await roleForm.validateFields();
      await assignRoleUsingPost({ userId: selectedUser!.id!, roleId: values.roleId });
      message.success('角色分配成功');
      setRoleModalOpen(false);
      actionRef.current?.reload();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  return (
    <>
      <ProTable<API.User>
        headerTitle="用户管理"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const res = await listUserByPageUsingPost({
              current: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
              userName: params.userName,
            });
            return { data: res?.data?.records ?? [], success: true, total: res?.data?.total ?? 0 };
          } catch { return { data: [], success: false }; }
        }}
        rowKey="id"
        toolBarRender={() => canSeeRoleMenu ? [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建用户</Button>] : []}
      />

      <Modal title={editing ? '编辑用户' : '新建用户'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {editing ? (
            <>
              <Form.Item name="userAvatar" label="头像" style={{ marginBottom: 16 }}>
                <Upload customRequest={handleAvatarUpload} showUploadList={false} accept="image/*">
                  <Spin spinning={avatarUploading}>
                    <Avatar size={64} src={editAvatar || undefined} icon={!editAvatar && <UserOutlined />} style={{ cursor: 'pointer' }} />
                    <Button size="small" icon={<CameraOutlined />} style={{ marginLeft: 12, verticalAlign: 'super' }}>上传头像</Button>
                  </Spin>
                </Upload>
              </Form.Item>
              <Form.Item name="userAvatar" hidden><Input /></Form.Item>
              <Form.Item name="userName" label="用户名" rules={[{ required: true }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item name="userProfile" label="简介">
                <Input.TextArea rows={2} placeholder="请输入用户简介" />
              </Form.Item>
              <Form.Item name="userRole" label="角色">
                <Select options={roles.map((r) => ({ label: r.roleName, value: r.roleCode }))} placeholder="请选择角色" loading={roles.length === 0} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="userAccount" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
                <Input placeholder="请输入账号" />
              </Form.Item>
              <Form.Item name="userPassword" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item
                name="checkPassword"
                label="确认密码"
                dependencies={['userPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, v) {
                      if (!v || getFieldValue('userPassword') === v) return Promise.resolve();
                      return Promise.reject(new Error('两次密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入密码" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal title={`分配角色 — ${selectedUser?.userName}`} open={roleModalOpen} onOk={handleAssignRole} onCancel={() => setRoleModalOpen(false)} destroyOnClose>
        <Form form={roleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roleId" label="角色" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ label: r.roleName, value: r.id }))} placeholder="请选择角色" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserManage;
