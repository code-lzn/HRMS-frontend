import {
  copyAccountUsingPost,
  deleteAccountUsingDelete,
  getAccountDetailUsingGet,
  listAccountsUsingGet,
} from '@/api/salaryManageController';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import usePermission from '@/hooks/usePermission';
import AccountDetailDrawer from './components/AccountDetailDrawer';
import AccountFormModal from './components/AccountFormModal';

const { confirm } = Modal;

const SCOPE_TYPE_MAP: Record<number, string> = {
  1: '部门',
  2: '职位',
  3: '职级',
};

const AccountPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { canAuditSalary } = usePermission();

  // 账套弹窗
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editRecord, setEditRecord] = useState<API.SalaryAccountVO | null>(null);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const handleDelete = (record: API.SalaryAccountVO) => {
    confirm({
      title: '确定删除该账套吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除账套「${record.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAccountUsingDelete({ id: record.id! });
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  const handleCopy = async (record: API.SalaryAccountVO) => {
    try {
      await copyAccountUsingPost({ id: record.id! });
      message.success('复制成功');
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e.message ?? '复制失败');
    }
  };

  const columns: ProColumns<API.SalaryAccountVO>[] = [
    {
      title: '账套名称',
      dataIndex: 'name',
      width: 160,
    },
    {
      title: '适用范围',
      dataIndex: 'scopeType',
      width: 100,
      render: (_, r) => (
        <Tag>{SCOPE_TYPE_MAP[r.scopeType ?? 0] ?? '-'}</Tag>
      ),
    },
    {
      title: '适用ID',
      dataIndex: 'scopeIds',
      width: 120,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 120,
    },
    {
      title: '项目数',
      width: 80,
      render: (_, r) => r.items?.length ?? 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      width: 260,
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailId(record.id!);
              setDetailOpen(true);
            }}
          >
            查看
          </Button>
          {canAuditSalary && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setFormMode('edit');
                  setEditRecord(record);
                  setFormOpen(true);
                }}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(record)}
              >
                复制
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<API.SalaryAccountVO>
        headerTitle="薪资账套管理"
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        request={async () => {
          try {
            const res = await listAccountsUsingGet();
            return {
              data: (res as any)?.data ?? [],
              success: true,
              total: (res as any)?.data?.length ?? 0,
            };
          } catch {
            return { data: [], success: false };
          }
        }}
        toolbar={{
          actions: [
            canAuditSalary && (
              <Button
                key="add"
                type="primary"
                onClick={() => {
                  setFormMode('add');
                  setEditRecord(null);
                  setFormOpen(true);
                }}
              >
                新建账套
              </Button>
            ),
          ].filter(Boolean),
        }}
      />

      {/* 账套详情抽屉（含工资项目管理） */}
      <AccountDetailDrawer
        open={detailOpen}
        accountId={detailId}
        onClose={() => setDetailOpen(false)}
        onRefreshList={() => actionRef.current?.reload()}
      />

      {/* 账套表单弹窗 */}
      <AccountFormModal
        open={formOpen}
        mode={formMode}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          actionRef.current?.reload();
        }}
      />
    </div>
  );
};

export default AccountPage;
