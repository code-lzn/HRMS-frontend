import {
  PROBATION_STATUS,
} from '@/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Modal,
  Row,
  Col,
  Avatar,
  Tag,
  message,
  Tabs,
  Alert,
  Input,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  BellOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import ProbationFormModal from './components/ProbationForm';
import { ProbationRecord, PendingProbationEmployee } from './mock';
import { listUsingGet1, getPendingEmployeesUsingGet } from '@/api/probationController';

const STATUS_BG_COLORS: Record<number, string> = {
  [PROBATION_STATUS.DRAFT]: '#f9fafb',
  [PROBATION_STATUS.PENDING]: '#fef9c3',
  [PROBATION_STATUS.COMPLETED]: '#f0fdf4',
  [PROBATION_STATUS.REJECTED]: '#fef2f2',
};

const STATUS_TEXT_COLORS: Record<number, string> = {
  [PROBATION_STATUS.DRAFT]: '#6b7280',
  [PROBATION_STATUS.PENDING]: '#ca8a04',
  [PROBATION_STATUS.COMPLETED]: '#22c55e',
  [PROBATION_STATUS.REJECTED]: '#dc2626',
};

const STATUS_LABEL_COLORS: Record<number, { bg: string; color: string }> = {
  [PROBATION_STATUS.DRAFT]: { bg: '#f3f4f6', color: '#6b7280' },
  [PROBATION_STATUS.PENDING]: { bg: '#fef3c7', color: '#d97706' },
  [PROBATION_STATUS.COMPLETED]: { bg: '#dcfce7', color: '#16a34a' },
  [PROBATION_STATUS.REJECTED]: { bg: '#fee2e2', color: '#dc2626' },
};

const ProbationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();

  const [pendingEmployees, setPendingEmployees] = useState<PendingProbationEmployee[]>([]);
  const [stats, setStats] = useState({ draft: 0, pending: 0, completed: 0, rejected: 0, total: 0, expiring: 0 });

  const loadStats = async () => {
    try {
      const [listRes, pendingRes] = await Promise.all([
        listUsingGet1({ current: 1, pageSize: 10000 }),
        getPendingEmployeesUsingGet({}),
      ]);
      if (listRes.code === 0 && listRes.data?.records) {
        const records = listRes.data.records;
        setStats({
          draft: records.filter((i) => i.status === PROBATION_STATUS.DRAFT).length,
          pending: records.filter((i) => i.status === PROBATION_STATUS.PENDING).length,
          completed: records.filter((i) => i.status === PROBATION_STATUS.COMPLETED).length,
          rejected: records.filter((i) => i.status === PROBATION_STATUS.REJECTED).length,
          total: listRes.data.total || 0,
          expiring: 0,
        });
      }
      if (pendingRes.code === 0 && pendingRes.data) {
        setPendingEmployees(pendingRes.data as any);
        setStats((prev) => ({ ...prev, expiring: (pendingRes.data as any).length || 0 }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getInitial = (name: string) => name?.charAt(0) || '?';

  const handleStartProbation = (empId: number) => {
    setSelectedEmpId(empId);
    setCreateOpen(true);
  };

  const columns: ProColumns<ProbationRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            style={{ backgroundColor: '#8b5cf6', fontSize: 16, fontWeight: 600 }}
          >
            {getInitial(record.employeeName)}
          </Avatar>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
              }}
              onClick={() => history.push(`/hr-change/probation/${record.id}`)}
            >
              {record.employeeName}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{record.employeeNo}</div>
          </div>
        </div>
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
    },
    {
      title: '试用期结束',
      dataIndex: 'probationEndDate',
      key: 'probationEndDate',
      width: 120,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const color = STATUS_LABEL_COLORS[record.status] || STATUS_LABEL_COLORS[1];
        return (
          <Tag
            style={{
              background: color.bg,
              color: color.color,
              borderRadius: 4,
              fontSize: 12,
              margin: 0,
              border: 'none',
              padding: '2px 10px',
            }}
          >
            {record.statusDesc}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => history.push(`/hr-change/probation/${record.id}`)}
          style={{ color: '#3b82f6', padding: 0 }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const statCards = [
    {
      label: '草稿',
      count: stats.draft,
      bgColor: STATUS_BG_COLORS[PROBATION_STATUS.DRAFT],
      textColor: STATUS_TEXT_COLORS[PROBATION_STATUS.DRAFT],
    },
    {
      label: '审批中',
      count: stats.pending,
      bgColor: STATUS_BG_COLORS[PROBATION_STATUS.PENDING],
      textColor: STATUS_TEXT_COLORS[PROBATION_STATUS.PENDING],
    },
    {
      label: '已完成',
      count: stats.completed,
      bgColor: STATUS_BG_COLORS[PROBATION_STATUS.COMPLETED],
      textColor: STATUS_TEXT_COLORS[PROBATION_STATUS.COMPLETED],
    },
    {
      label: '已拒绝',
      count: stats.rejected,
      bgColor: STATUS_BG_COLORS[PROBATION_STATUS.REJECTED],
      textColor: STATUS_TEXT_COLORS[PROBATION_STATUS.REJECTED],
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>转正管理</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理员工转正申请与审批流程</div>
          </div>
        ),
        extra: [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedEmpId(undefined);
              setCreateOpen(true);
            }}
            style={{
              background: '#22c55e',
              borderColor: '#22c55e',
              borderRadius: 8,
              padding: '6px 16px',
              height: 'auto',
            }}
          >
            新建转正申请
          </Button>,
        ],
      }}
    >
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
          style={{ marginBottom: 20, borderRadius: 8 }}
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => {
                Modal.info({
                  title: '待转正员工',
                  width: 600,
                  content: (
                    <div style={{ maxHeight: 400, overflow: 'auto' }}>
                      {pendingEmployees.map((emp) => (
                        <div
                          key={emp.employeeId}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {emp.employeeName} - {emp.departmentName}/{emp.positionName}
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                              试用期截止: {emp.probationEndDate} · 剩余 {emp.daysRemaining} 天
                            </div>
                          </div>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleStartProbation(emp.employeeId)}
                          >
                            发起转正
                          </Button>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }}
            >
              查看详情
            </Button>
          }
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col span={6} key={card.label}>
            <Card
              style={{
                background: card.bgColor,
                border: 'none',
                borderRadius: 12,
                boxShadow: 'none',
              }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: card.textColor }}>{card.count}</div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#fff',
                    opacity: 0.8,
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 12, background: '#fafafa', padding: '8px 12px', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Input.Search
          placeholder="搜索员工姓名/工号"
          allowClear
          onSearch={(v) => { setKeyword(v); actionRef.current?.reload(); }}
          style={{ width: 280 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>
      </div>

      <ProTable<ProbationRecord>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, status } = params as any;
          const tabMap: Record<string, number> = {
            draft: PROBATION_STATUS.DRAFT,
            pending: PROBATION_STATUS.PENDING,
            completed: PROBATION_STATUS.COMPLETED,
            rejected: PROBATION_STATUS.REJECTED,
          };
          const apiParams: API.listUsingGET1Params = {
            current,
            pageSize,
            keyword,
            status: activeTab !== 'all' ? tabMap[activeTab] : status,
          };
          try {
            const res = await listUsingGet1(apiParams);
            if (res.code === 0 && res.data) {
              return { data: (res.data.records || []) as ProbationRecord[], success: true, total: res.data.total || 0 };
            }
            return { data: [] as ProbationRecord[], success: true, total: 0 };
          } catch {
            message.error('获取转正列表失败');
            return { data: [] as ProbationRecord[], success: true, total: 0 };
          }
        }}
        toolBarRender={false}
        toolbar={{
          actions: [
            <Tabs
              key="tabs"
              activeKey={activeTab}
              onChange={(k) => {
                setActiveTab(k);
                actionRef.current?.reload();
              }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#22c55e" /></> },
                { key: 'draft', label: <>草稿 <Badge count={stats.draft} showZero color="#9ca3af" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#f59e0b" /></> },
                { key: 'completed', label: <>已完成 <Badge count={stats.completed} showZero color="#22c55e" /></> },
                { key: 'rejected', label: <>已拒绝 <Badge count={stats.rejected} showZero color="#ef4444" /></> },
              ]}
            />,
          ],
        }}
        cardProps={{
          style: { borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
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
