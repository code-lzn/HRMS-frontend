import {
  addRoleUsingPost,
  deleteRoleUsingPost,
  listRoleByPageUsingPost,
  updateRoleUsingPost,
} from '@/api/roleController';
import { getAllPermissionCodesUsingGet } from '@/api/permissionController';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select, Space, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const DATA_SCOPE_OPTIONS = [
  { label: '全部数据', value: 0 },
  { label: '本部门数据', value: 1 },
  { label: '本部门及以下', value: 2 },
  { label: '仅本人数据', value: 3 },
];

const RolePermission: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<API.RoleVO | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [permCodes, setPermCodes] = useState<string[]>([]);

  useEffect(() => {
    loadPermCodes();
  }, []);

  const loadPermCodes = async () => {
    try {
      const res = await getAllPermissionCodesUsingGet();
      setPermCodes(res?.data ?? []);
    } catch (e) { console.error('pages/Admin/RolePermission/index.tsx', e); }
  };

  const columns: ProColumns<API.RoleVO>[] = [
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      width: 140,
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      width: 140,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '数据范围',
      dataIndex: 'dataScopeDesc',
      width: 120,
      render: (_, r) => <Tag>{r.dataScopeDesc ?? '-'}</Tag>,
    },
    {
      title: '权限数',
      dataIndex: 'permissionCodes',
      width: 80,
      render: (_, r) =>
        r.permissionCodes?.length ? (
          <Tag color="blue">{r.permissionCodes.length}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, r) =>
        r.status === 1 ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="default">禁用</Tag>
        ),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: API.RoleVO) => {
    setEditing(record);
    form.setFieldsValue({
      roleCode: record.roleCode,
      roleName: record.roleName,
      description: record.description,
      dataScope: record.dataScope,
      permissionCodes: record.permissionCodes ?? [],
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleDelete = (record: API.RoleVO) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${record.roleName}」吗？`,
      onOk: async () => {
        try {
          await deleteRoleUsingPost({ id: record.id! });
          message.success('已删除');
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: any = { ...values };
      if (values.permissionCodes?.length) {
        payload.permissions = values.permissionCodes.join(',');
      }
      if (editing) {
        await updateRoleUsingPost({ id: editing.id!, ...payload });
        message.success('已更新');
      } else {
        await addRoleUsingPost(payload);
        message.success('已创建');
      }
      setModalOpen(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProTable<API.RoleVO>
        headerTitle="角色权限"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const res = await listRoleByPageUsingPost({
              current: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
            });
            return {
              data: res?.data?.records ?? [],
              success: true,
              total: res?.data?.total ?? 0,
            };
          } catch (e) { console.error('pages/Admin/RolePermission/index.tsx', e); return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建角色
          </Button>,
        ]}
      />

      <Modal
        title={editing ? '编辑角色' : '新建角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true }]}>
            <Input placeholder="如: ADMIN" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="如: 管理员" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="角色描述" />
          </Form.Item>
          <Form.Item name="dataScope" label="数据范围">
            <Select options={DATA_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="permissionCodes" label="权限码">
            <Select mode="multiple" options={permCodes.map((c) => ({ label: c, value: c }))} placeholder="选择权限码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RolePermission;
