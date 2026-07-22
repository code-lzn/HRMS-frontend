import { getRecentLogsUsingGet } from '@/api/dashboardController';
import { getLoginLogsUsingGet } from '@/api/accountSecurityController';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Tag, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';

const OperationLogsTab: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RecentLogVO>[] = [
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 120,
    },
    {
      title: '操作类型',
      dataIndex: 'actionType',
      width: 120,
      render: (_, r) => <Tag color="blue">{r.actionType}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      width: 180,
      render: (_, r) =>
        r.operateTime ? dayjs(r.operateTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
  ];

  return (
    <ProTable<API.RecentLogVO>
      headerTitle="操作日志"
      actionRef={actionRef}
      columns={columns}
      request={async () => {
        try {
          const res = await getRecentLogsUsingGet();
          return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
        } catch (e) { console.error('pages/Admin/OperationLog/index.tsx', e); return { data: [], success: false };
        }
      }}
      rowKey="operateTime"
      search={false}
    />
  );
};

const LoginLogsTab: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.LoginLogVO>[] = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
      render: (_, r) =>
        r.loginTime ? dayjs(r.loginTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    { title: 'IP', dataIndex: 'ip', width: 150 },
    { title: '设备', dataIndex: 'device', width: 180, ellipsis: true },
    {
      title: '登录方式',
      dataIndex: 'loginTypeText',
      width: 100,
    },
    {
      title: '结果',
      dataIndex: 'isSuccess',
      width: 100,
      render: (_, r) =>
        r.isSuccess === 1 ? (
          <span style={{ color: '#52c41a' }}>
            <CheckCircleOutlined /> 成功
          </span>
        ) : (
          <span style={{ color: '#ff4d4f' }}>
            <CloseCircleOutlined /> 失败
          </span>
        ),
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      width: 150,
      ellipsis: true,
      render: (_, r) => r.failReason || '-',
    },
  ];

  return (
    <ProTable<API.LoginLogVO>
      headerTitle="登录日志"
      actionRef={actionRef}
      columns={columns}
      request={async () => {
        try {
          const res = await getLoginLogsUsingGet();
          return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
        } catch (e) { console.error('pages/Admin/OperationLog/index.tsx', e); return { data: [], success: false };
        }
      }}
      rowKey="id"
      search={false}
    />
  );
};

const OperationLog: React.FC = () => {
  return (
    <Tabs
      defaultActiveKey="operation"
      items={[
        { key: 'operation', label: '操作日志', children: <OperationLogsTab /> },
        { key: 'login', label: '登录日志', children: <LoginLogsTab /> },
      ]}
    />
  );
};

export default OperationLog;
