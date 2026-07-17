import {
  TRANSFER_STATUS,
  TRANSFER_STATUS_COLOR,
  TRANSFER_STATUS_MAP,
} from '@/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import TransferFormModal from './components/TransferForm';
import { TransferRecord, transferList, transferHistory } from './mock';

const TransferPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEmpId, setHistoryEmpId] = useState<number | undefined>();

  const stats = {
    total: transferList.length,
    pending: transferList.filter((i) => i.status === TRANSFER_STATUS.PENDING).length,
    effective: transferList.filter((i) => i.status === TRANSFER_STATUS.EFFECTIVE).length,
  };

  const handleViewHistory = (empId: number) => {
    setHistoryEmpId(empId);
    setHistoryOpen(true);
  };

  const columns: ProColumns<TransferRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
      render: (_, record) => (
        <a onClick={() => history.push(`/hr-change/transfer/${record.id}`)}>{record.employeeName}</a>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 120,
      search: false,
      render: (_, record) => (
        <span style={{ fontFamily: 'monospace' }}>{record.employeeNo}</span>
      ),
    },
    {
      title: '原部门',
      dataIndex: 'fromDepartmentName',
      key: 'fromDepartmentName',
      width: 120,
    },
    {
      title: '新部门',
      dataIndex: 'toDepartmentName',
      key: 'toDepartmentName',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#1677ff', fontWeight: 500 }}>{record.toDepartmentName}</span>
      ),
    },
    {
      title: '原职位',
      dataIndex: 'fromPositionName',
      key: 'fromPositionName',
      width: 130,
    },
    {
      title: '新职位',
      dataIndex: 'toPositionName',
      key: 'toPositionName',
      width: 130,
      render: (_, record) => (
        <span style={{ color: '#1677ff' }}>{record.toPositionName}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [TRANSFER_STATUS.DRAFT]: { text: '草稿' },
        [TRANSFER_STATUS.PENDING]: { text: '审批中' },
        [TRANSFER_STATUS.EFFECTIVE]: { text: '已生效' },
        [TRANSFER_STATUS.REJECTED]: { text: '已拒绝' },
      },
      render: (_, record) => (
        <Tag color={TRANSFER_STATUS_COLOR[record.status]}>
          {TRANSFER_STATUS_MAP[record.status]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      search: false,
      sorter: true,
      render: (_, record) => dayjs(record.createTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a onClick={() => history.push(`/hr-change/transfer/${record.id}`)}>查看详情</a>
          <a onClick={() => handleViewHistory(record.employeeId)}>调岗历史</a>
          {record.status === TRANSFER_STATUS.DRAFT && (
            <a onClick={() => {
              Modal.confirm({
                title: '确认提交调岗审批',
                content: '提交后将不可修改，确定提交吗？',
                onOk: () => message.success('已提交调岗审批'),
              });
            }}>提交</a>
          )}
        </Space>
      ),
    },
  ];

  const historyData = historyEmpId ? transferHistory[historyEmpId] || [] : [];

  return (
    <PageContainer>
      <ProTable<TransferRecord>
        headerTitle="调岗列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, status } = params as any;
          let filtered = [...transferList];
          if (activeTab !== 'all') {
            const tabMap: Record<string, number> = {
              pending: TRANSFER_STATUS.PENDING,
              effective: TRANSFER_STATUS.EFFECTIVE,
            };
            filtered = filtered.filter((i) => i.status === (tabMap[activeTab] ?? activeTab));
          }
          if (keyword) {
            const kw = String(keyword).toLowerCase();
            filtered = filtered.filter((i) => i.employeeName.toLowerCase().includes(kw) || i.employeeNo.includes(kw));
          }
          if (status !== undefined && status !== null && status !== '') {
            filtered = filtered.filter((i) => i.status === Number(status));
          }
          const total = filtered.length;
          const page = current || 1;
          const size = pageSize || 10;
          return { data: filtered.slice((page - 1) * size, page * size), success: true, total };
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建调岗</Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
        ]}
        toolbar={{
          actions: [
            <Tabs key="tabs" activeKey={activeTab} onChange={(k) => { setActiveTab(k); actionRef.current?.reload(); }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#1677ff" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#fa8c16" /></> },
                { key: 'effective', label: <>已生效 <Badge count={stats.effective} showZero color="#52c41a" /></> },
              ]}
            />,
          ],
        }}
      />

      <TransferFormModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* 调岗历史弹窗 */}
      <Modal
        title="调岗历史"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        width={800}
        footer={null}
      >
        {historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无调岗记录</div>
        ) : (
          <Table
            dataSource={historyData}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '原部门', dataIndex: 'fromDepartmentName', width: 100 },
              { title: '新部门', dataIndex: 'toDepartmentName', width: 100, render: (v: string) => <span style={{ color: '#1677ff' }}>{v}</span> },
              { title: '原职位', dataIndex: 'fromPositionName', width: 110 },
              { title: '新职位', dataIndex: 'toPositionName', width: 110, render: (v: string) => <span style={{ color: '#1677ff' }}>{v}</span> },
              { title: '原职级', dataIndex: 'fromJobLevel', width: 70 },
              { title: '新职级', dataIndex: 'toJobLevel', width: 70 },
              { title: '生效日期', dataIndex: 'transferDate', width: 110 },
              { title: '原因', dataIndex: 'reason', ellipsis: true },
            ]}
            size="small"
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default TransferPage;
