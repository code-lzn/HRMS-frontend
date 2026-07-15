import {
  createAccountUsingPost,
  deleteAccountUsingDelete,
  listAccountsUsingGet,
  updateAccountUsingPut,
} from '@/api/salaryManageController';
import {
  approveBatchUsingPost,
  calculateBatchUsingPost,
  createBatchUsingPost,
  listBatchesUsingGet,
  markPaidUsingPost,
  rejectBatchUsingPost,
  submitForApprovalUsingPost,
} from '@/api/salaryManageController';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Tabs,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const BATCH_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  CALCULATED: 'processing',
  APPROVING: 'warning',
  APPROVED: 'success',
  PAID: 'blue',
  REJECTED: 'error',
};

/** ====== 薪酬账户管理 ====== */
const AccountsTab: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<API.SalaryAccountVO | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const columns: ProColumns<API.SalaryAccountVO>[] = [
    { title: '账户名称', dataIndex: 'name', width: 150 },
    {
      title: '适用范围',
      dataIndex: 'scopeTypeText',
      width: 100,
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 120,
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
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: API.SalaryAccountVO) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null,
      scopeType: record.scopeType,
    });
    setModalOpen(true);
  };

  const handleDelete = (record: API.SalaryAccountVO) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除薪酬账户「${record.name}」吗？`,
      onOk: async () => {
        try {
          await deleteAccountUsingDelete({ id: record.id! });
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
      const payload: API.SalaryAccountRequest = {
        name: values.name,
        effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
        scopeType: values.scopeType,
        scopeIds: values.scopeIds,
      };
      if (editing) {
        await updateAccountUsingPut({ id: editing.id! }, payload);
        message.success('已更新');
      } else {
        await createAccountUsingPost(payload);
        message.success('已创建');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProTable<API.SalaryAccountVO>
        headerTitle="薪酬账户"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          try {
            const res = await listAccountsUsingGet();
            return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
          } catch {
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建账户
          </Button>,
        ]}
      />

      <Modal
        title={editing ? '编辑薪酬账户' : '新建薪酬账户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="账户名称" rules={[{ required: true }]}>
            <Input placeholder="请输入账户名称" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scopeType" label="适用范围">
            <Select
              options={[
                { label: '全部', value: 0 },
                { label: '部门', value: 1 },
                { label: '职位', value: 2 },
                { label: '指定员工', value: 3 },
              ]}
            />
          </Form.Item>
          <Form.Item name="scopeIds" label="范围ID（逗号分隔）">
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

/** ====== 薪资批次管理 ====== */
const BatchesTab: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<API.SalaryBatchVO | null>(null);

  const columns: ProColumns<API.SalaryBatchVO>[] = [
    { title: '批次号', dataIndex: 'batchNo', width: 140 },
    { title: '薪资月份', dataIndex: 'salaryMonth', width: 100 },
    {
      title: '员工数',
      dataIndex: 'totalEmployeeCount',
      width: 80,
      render: (_, r) => r.totalEmployeeCount ?? '-',
    },
    {
      title: '应发合计',
      dataIndex: 'totalGross',
      width: 120,
      render: (_, r) =>
        r.totalGross != null ? `¥${r.totalGross.toFixed(2)}` : '-',
    },
    {
      title: '实发合计',
      dataIndex: 'totalNet',
      width: 120,
      render: (_, r) =>
        r.totalNet != null ? `¥${r.totalNet.toFixed(2)}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      width: 100,
      render: (_, r) => (
        <Tag color={BATCH_STATUS_COLOR[r.status ?? '']}>{r.statusText ?? r.status}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (_, r) => (r.createdAt ? dayjs(r.createdAt).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          {record.status === 'DRAFT' && (
            <>
              <Button type="link" size="small" onClick={() => handleAction(calculateBatchUsingPost, record, '计算')}>
                计算
              </Button>
              <Button type="link" size="small" onClick={() => handleAction(submitForApprovalUsingPost, record, '提交审批')}>
                提交审批
              </Button>
            </>
          )}
          {record.status === 'CALCULATED' && (
            <Button type="link" size="small" onClick={() => handleAction(submitForApprovalUsingPost, record, '提交审批')}>
              提交审批
            </Button>
          )}
          {record.status === 'APPROVING' && (
            <>
              <Button type="link" size="small" onClick={() => handleAction(approveBatchUsingPost, record, '审批通过')}>
                审批通过
              </Button>
              <Button type="link" size="small" danger onClick={() => {
                setSelectedBatch(record);
                setRejectOpen(true);
              }}>
                审批拒绝
              </Button>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Button type="link" size="small" onClick={() => handleAction(markPaidUsingPost, record, '标记已发放')}>
              标记已发放
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleAction = async (
    fn: (params: any, options?: any) => Promise<any>,
    record: API.SalaryBatchVO,
    actionName: string,
  ) => {
    Modal.confirm({
      title: `确认${actionName}`,
      content: `确定要对批次「${record.batchNo}」执行${actionName}吗？`,
      onOk: async () => {
        try {
          await fn({ id: record.id! });
          message.success(`${actionName}成功`);
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message || `${actionName}失败`);
        }
      },
    });
  };

  return (
    <>
      <ProTable<API.SalaryBatchVO>
        headerTitle="薪资批次"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          try {
            const res = await listBatchesUsingGet();
            return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
          } catch {
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            新建批次
          </Button>,
        ]}
      />

      {/* 新建批次 modal */}
      <Modal
        title="新建薪资批次"
        open={createOpen}
        onOk={async () => {
          try {
            await createBatchUsingPost({
              salaryMonth: dayjs().format('YYYY-MM'),
            });
            message.success('批次已创建');
            setCreateOpen(false);
            actionRef.current?.reload();
          } catch (e: any) {
            message.error(e.message || '创建失败');
          }
        }}
        onCancel={() => setCreateOpen(false)}
      >
        <p style={{ marginTop: 16 }}>
          将基于当前月份（{dayjs().format('YYYY-MM')}）创建新的薪资批次。
        </p>
      </Modal>

      {/* 拒绝审批 modal */}
      <Modal
        title="审批拒绝"
        open={rejectOpen}
        onOk={async () => {
          try {
            await rejectBatchUsingPost({ id: selectedBatch!.id! }, { reason: '' });
            message.success('已拒绝');
            setRejectOpen(false);
            actionRef.current?.reload();
          } catch (e: any) {
            message.error(e.message || '操作失败');
          }
        }}
        onCancel={() => setRejectOpen(false)}
      >
        <p style={{ marginTop: 16 }}>确定要拒绝批次「{selectedBatch?.batchNo}」吗？</p>
      </Modal>
    </>
  );
};

/** ====== 主页面 ====== */
const SalaryManagePage: React.FC = () => {
  return (
    <Tabs
      defaultActiveKey="accounts"
      items={[
        { key: 'accounts', label: '薪酬账户', children: <AccountsTab /> },
        { key: 'batches', label: '薪资批次', children: <BatchesTab /> },
      ]}
    />
  );
};

export default SalaryManagePage;
