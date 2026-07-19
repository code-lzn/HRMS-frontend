import {
  createBatchUsingPost,
  listBatchesUsingGet,
} from '@/api/salaryController';
import { BATCH_STATUS_MAP } from '@/constants/enums';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, message, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const SalaryBatchList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [createOpen, setCreateOpen] = useState(false);
  const [month, setMonth] = useState('');

  const handleCreate = async () => {
    if (!month) {
      message.warning('请选择月份');
      return;
    }
    await createBatchUsingPost({ salaryMonth: month });
    message.success('批次创建成功');
    setCreateOpen(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<API.SalaryBatchVO>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '批次号', dataIndex: 'batchNo', width: 150 },
    {
      title: '薪资月份',
      dataIndex: 'salaryMonth',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => {
        const s = BATCH_STATUS_MAP[record.status!];
        return <Tag color={s?.color}>{s?.label || '-'}</Tag>;
      },
      valueEnum: Object.fromEntries(
        Object.entries(BATCH_STATUS_MAP).map(([k, v]) => [
          k,
          { text: v.label },
        ]),
      ),
    },
    {
      title: '员工数',
      dataIndex: 'totalEmployees',
      width: 80,
      search: false,
    },
    {
      title: '应发总额',
      dataIndex: 'totalGrossPay',
      width: 130,
      search: false,
      render: (_, record) => `¥${(record.totalGrossPay ?? 0).toLocaleString()}`,
    },
    {
      title: '实发总额',
      dataIndex: 'totalNetPay',
      width: 130,
      search: false,
      render: (_, record) => `¥${(record.totalNetPay ?? 0).toLocaleString()}`,
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
      width: 100,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <a onClick={() => history.push(`/salary/batches/${record.id}`)}>详情</a>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.SalaryBatchVO>
        headerTitle="薪资核算批次"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await listBatchesUsingGet({
            current: params.current,
            pageSize: params.pageSize,
            salaryMonth: params.salaryMonth,
            status: params.status,
          });
          return {
            data: (res.data as any)?.records ?? [],
            success: true,
            total: (res.data as any)?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          access.canManageSalaryBatch && (
            <Button
              key="create"
              type="primary"
              onClick={() => setCreateOpen(true)}
            >
              创建批次
            </Button>
          ),
          <Button key="reload" onClick={() => actionRef.current?.reload()}>
            刷新
          </Button>,
        ]}
      />
      <Modal
        title="创建核算批次"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
      >
        <div style={{ marginTop: 16 }}>
          <label>薪资月份（格式 yyyy-MM）：</label>
          <input
            type="month"
            style={{
              width: '100%',
              marginTop: 8,
              padding: '4px 8px',
              fontSize: 14,
            }}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default SalaryBatchList;
