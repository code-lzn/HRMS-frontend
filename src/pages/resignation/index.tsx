import {
  RESIGNATION_STATUS,
  RESIGNATION_STATUS_COLOR,
  RESIGNATION_STATUS_MAP,
  RESIGNATION_TYPE_MAP,
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
  Tag,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import ResignationFormModal from './components/ResignationForm';
import { ResignationRecord, resignationList } from './mock';

const ResignationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const stats = {
    total: resignationList.length,
    pending: resignationList.filter((i) => i.status === RESIGNATION_STATUS.PENDING).length,
    approved: resignationList.filter((i) => i.status === RESIGNATION_STATUS.APPROVED).length,
  };

  const columns: ProColumns<ResignationRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
      render: (_, record) => (
        <a onClick={() => history.push(`/hr-change/resignation/${record.id}`)}>{record.employeeName}</a>
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
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 120,
    },
    {
      title: '离职日期',
      dataIndex: 'resignationDate',
      key: 'resignationDate',
      width: 120,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '离职类型',
      dataIndex: 'resignationType',
      key: 'resignationType',
      width: 120,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(RESIGNATION_TYPE_MAP).map(([k, v]) => [k, { text: v }]),
      ),
      render: (_, record) => (
        <Tag>{record.resignationTypeDesc}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [RESIGNATION_STATUS.DRAFT]: { text: '草稿' },
        [RESIGNATION_STATUS.PENDING]: { text: '审批中' },
        [RESIGNATION_STATUS.APPROVED]: { text: '待离职' },
        [RESIGNATION_STATUS.RESIGNED]: { text: '已离职' },
        [RESIGNATION_STATUS.REJECTED]: { text: '已拒绝' },
      },
      render: (_, record) => (
        <Tag color={RESIGNATION_STATUS_COLOR[record.status]}>
          {RESIGNATION_STATUS_MAP[record.status]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      search: false,
      render: (_, record) => dayjs(record.createTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a onClick={() => history.push(`/hr-change/resignation/${record.id}`)}>查看详情</a>
          {record.status === RESIGNATION_STATUS.DRAFT && (
            <a onClick={() => {
              Modal.confirm({
                title: '确认提交离职审批',
                content: '提交后将不可修改，确定提交吗？',
                onOk: () => message.success('已提交离职审批'),
              });
            }}>
              提交
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<ResignationRecord>
        headerTitle="离职列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, status } = params as any;
          let filtered = [...resignationList];
          if (activeTab !== 'all') {
            filtered = filtered.filter((i) => i.status === Number(activeTab));
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
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建离职</Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
        ]}
        toolbar={{
          actions: [
            <Tabs key="tabs" activeKey={activeTab} onChange={(k) => { setActiveTab(k); actionRef.current?.reload(); }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#1677ff" /></> },
                { key: String(RESIGNATION_STATUS.PENDING), label: <>审批中 <Badge count={stats.pending} showZero color="#fa8c16" /></> },
                { key: String(RESIGNATION_STATUS.APPROVED), label: <>待离职 <Badge count={stats.approved} showZero color="#fa8c16" /></> },
              ]}
            />,
          ],
        }}
      />

      <ResignationFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageContainer>
  );
};

export default ResignationPage;
