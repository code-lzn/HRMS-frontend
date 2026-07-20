import {
  createAccountUsingPost,
  deleteAccountUsingDelete,
  listAccountsUsingGet,
  updateAccountUsingPut,
} from '@/api/salaryController';
import { SCOPE_TYPE_MAP } from '@/constants/enums';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, message, Modal, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import AccountForm from './components/AccountForm';

const SalaryAccountList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<API.SalaryAccountVO | null>(null);

  const handleCreate = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: API.SalaryAccountVO) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = (record: API.SalaryAccountVO) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账套"${record.name}"吗？`,
      onOk: async () => {
        await deleteAccountUsingDelete(record.id!);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleModalOk = async (values: any) => {
    if (editingRecord) {
      await updateAccountUsingPut(editingRecord.id!, {
        ...values,
        id: editingRecord.id,
      });
      message.success('更新成功');
    } else {
      await createAccountUsingPost(values);
      message.success('创建成功');
    }
    setModalOpen(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<API.SalaryAccountVO>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    {
      title: '账套名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '适用范围',
      dataIndex: 'scopeType',
      width: 100,
      render: (_, record) => (
        <Tag>{SCOPE_TYPE_MAP[record.scopeType!] || '-'}</Tag>
      ),
      valueEnum: {
        1: { text: '部门' },
        2: { text: '职位' },
        3: { text: '职级' },
      },
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 120,
      search: false,
      render: (_, record) =>
        record.effectiveDate
          ? dayjs(record.effectiveDate).format('YYYY-MM-DD')
          : '-',
    },
    {
      title: '工资项目数',
      dataIndex: 'items',
      width: 100,
      search: false,
      render: (_, record) => record.items?.length ?? 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      search: false,
      render: (_, record) =>
        record.createTime
          ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm')
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a onClick={() => history.push(`/salary/accounts/${record.id}`)}>
            详情
          </a>
          {access.canManageSalaryAccount && (
            <>
              <a onClick={() => handleEdit(record)}>编辑</a>
              <a
                style={{ color: '#ff4d4f' }}
                onClick={() => handleDelete(record)}
              >
                删除
              </a>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.SalaryAccountVO>
        headerTitle="薪资账套"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await listAccountsUsingGet({
            current: params.current,
            pageSize: params.pageSize,
            name: params.name,
            scopeType: params.scopeType,
          });
          return {
            data: (res.data as any) ?? [],
            success: true,
            total: (res.data as any)?.length ?? 0,
          };
        }}
        toolBarRender={() => [
          access.canManageSalaryAccount && (
            <Button key="create" type="primary" onClick={handleCreate}>
              新建账套
            </Button>
          ),
        ]}
      />
      <AccountForm
        open={modalOpen}
        editingRecord={editingRecord}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
      />
    </PageContainer>
  );
};

export default SalaryAccountList;
