import {
  PROBATION_STATUS,
  PROBATION_STATUS_COLOR,
  PROBATION_STATUS_MAP,
} from '@/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Alert,
  Badge,
  Button,
  message,
  Modal,
  Space,
  Tag,
  Tabs,
} from 'antd';
import {
  BellOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import ProbationFormModal from './components/ProbationForm';
import { pendingEmployees, ProbationRecord, probationList } from './mock';

const ProbationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();

  // 按状态统计
  const stats = {
    total: probationList.length,
    pending: probationList.filter((i) => i.status === PROBATION_STATUS.PENDING).length,
    completed: probationList.filter((i) => i.status === PROBATION_STATUS.COMPLETED).length,
  };

  const columns: ProColumns<ProbationRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
      render: (_, record) => (
        <a onClick={() => history.push(`/hr-change/probation/${record.id}`)}>{record.employeeName}</a>
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
      width: 130,
    },
    {
      title: '试用期开始',
      dataIndex: 'probationStartDate',
      key: 'probationStartDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '试用期结束',
      dataIndex: 'probationEndDate',
      key: 'probationEndDate',
      width: 120,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [PROBATION_STATUS.DRAFT]: { text: '草稿' },
        [PROBATION_STATUS.PENDING]: { text: '审批中' },
        [PROBATION_STATUS.COMPLETED]: { text: '已完成' },
        [PROBATION_STATUS.REJECTED]: { text: '已拒绝' },
      },
      render: (_, record) => (
        <Tag color={PROBATION_STATUS_COLOR[record.status]}>
          {PROBATION_STATUS_MAP[record.status]}
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
          <a onClick={() => history.push(`/hr-change/probation/${record.id}`)}>查看详情</a>
          {record.status === PROBATION_STATUS.DRAFT && (
            <a onClick={() => {
              Modal.confirm({
                title: '确认提交转正审批',
                content: '提交后将不可修改，确定提交吗？',
                onOk: () => message.success('已提交转正审批'),
              });
            }}>
              提交
            </a>
          )}
        </Space>
      ),
    },
  ];

  // 处理待转正员工的"发起转正"操作
  const handleStartProbation = (empId: number) => {
    setSelectedEmpId(empId);
    setCreateOpen(true);
  };

  return (
    <PageContainer>
      {/* 待转正提醒 */}
      {pendingEmployees.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<BellOutlined />}
          message={
            <span>
              有 <b>{pendingEmployees.length}</b> 名员工试用期即将到期，请及时发起转正评估
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
          action={
            <Button size="small" onClick={() => {
              Modal.info({
                title: '待转正员工',
                width: 600,
                content: (
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {pendingEmployees.map((emp) => (
                      <div key={emp.employeeId} style={{
                        padding: '12px', borderBottom: '1px solid #f0f0f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{emp.employeeName} - {emp.departmentName}/{emp.positionName}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>
                            试用期截止: {emp.probationEndDate} · 剩余 {emp.daysRemaining} 天
                          </div>
                        </div>
                        <Button size="small" type="primary" onClick={() => handleStartProbation(emp.employeeId)}>
                          发起转正
                        </Button>
                      </div>
                    ))}
                  </div>
                ),
              });
            }}>
              查看详情
            </Button>
          }
        />
      )}

      <ProTable<ProbationRecord>
        headerTitle="转正列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, status } = params as any;
          let filtered = [...probationList];
          if (activeTab !== 'all') {
            const tabMap: Record<string, number> = {
              pending: PROBATION_STATUS.PENDING,
              completed: PROBATION_STATUS.COMPLETED,
              rejected: PROBATION_STATUS.REJECTED,
            };
            filtered = filtered.filter((i) => i.status === tabMap[activeTab]);
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
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedEmpId(undefined); setCreateOpen(true); }}>
            新建转正申请
          </Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
        ]}
        toolbar={{
          actions: [
            <Tabs key="tabs" activeKey={activeTab} onChange={(k) => { setActiveTab(k); actionRef.current?.reload(); }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#1677ff" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#fa8c16" /></> },
                { key: 'completed', label: <>已完成 <Badge count={stats.completed} showZero color="#52c41a" /></> },
              ]}
            />,
          ],
        }}
      />

      <ProbationFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        preselectedEmployeeId={selectedEmpId}
      />
    </PageContainer>
  );
};

export default ProbationPage;
