import {
  RESIGNATION_STATUS,
  RESIGNATION_TYPE_MAP,
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
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import ResignationFormModal from './components/ResignationForm';
import { ResignationRecord } from './mock';
import { listUsingGet2 } from '@/api/resignationController';

const RESIGN_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  辞职: { bg: '#fee2e2', color: '#dc2626' },
  辞退: { bg: '#fee2e2', color: '#dc2626' },
  合同到期不续签: { bg: '#f3f4f6', color: '#6b7280' },
  协商离职: { bg: '#fef3c7', color: '#d97706' },
  其他: { bg: '#f3f4f6', color: '#6b7280' },
};

const STATUS_BG_COLORS: Record<number, string> = {
  [RESIGNATION_STATUS.DRAFT]: '#f9fafb',
  [RESIGNATION_STATUS.PENDING]: '#fef9c3',
  [RESIGNATION_STATUS.APPROVED]: '#eff6ff',
  [RESIGNATION_STATUS.RESIGNED]: '#f0fdf4',
};

const STATUS_TEXT_COLORS: Record<number, string> = {
  [RESIGNATION_STATUS.DRAFT]: '#6b7280',
  [RESIGNATION_STATUS.PENDING]: '#ca8a04',
  [RESIGNATION_STATUS.APPROVED]: '#3b82f6',
  [RESIGNATION_STATUS.RESIGNED]: '#22c55e',
};

const STATUS_LABEL_COLORS: Record<number, { bg: string; color: string }> = {
  [RESIGNATION_STATUS.DRAFT]: { bg: '#f3f4f6', color: '#6b7280' },
  [RESIGNATION_STATUS.PENDING]: { bg: '#fef3c7', color: '#d97706' },
  [RESIGNATION_STATUS.APPROVED]: { bg: '#dbeafe', color: '#2563eb' },
  [RESIGNATION_STATUS.RESIGNED]: { bg: '#dcfce7', color: '#16a34a' },
  [RESIGNATION_STATUS.REJECTED]: { bg: '#fee2e2', color: '#dc2626' },
};

const ResignationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const [stats, setStats] = useState({ draft: 0, pending: 0, approved: 0, resigned: 0, rejected: 0, total: 0 });

  const loadStats = async () => {
    try {
      const res = await listUsingGet2({ current: 1, pageSize: 10000 });
      if (res.code === 0 && res.data?.records) {
        const records = res.data.records;
        setStats({
          draft: records.filter((i) => i.status === RESIGNATION_STATUS.DRAFT).length,
          pending: records.filter((i) => i.status === RESIGNATION_STATUS.PENDING).length,
          approved: records.filter((i) => i.status === RESIGNATION_STATUS.APPROVED).length,
          resigned: records.filter((i) => i.status === RESIGNATION_STATUS.RESIGNED).length,
          rejected: records.filter((i) => i.status === RESIGNATION_STATUS.REJECTED).length,
          total: res.data.total || 0,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getInitial = (name: string) => name?.charAt(0) || '?';

  const getHandoverName = (_: ResignationRecord) => {
    return '-';
  };

  const columns: ProColumns<ResignationRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            style={{ backgroundColor: '#60a5fa', fontSize: 16, fontWeight: 600 }}
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
              onClick={() => history.push(`/hr-change/resignation/${record.id}`)}
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
      title: '离职类型',
      dataIndex: 'resignationTypeDesc',
      key: 'resignationTypeDesc',
      width: 120,
      render: (_, record) => {
        const color = RESIGN_TYPE_COLORS[record.resignationTypeDesc] || RESIGN_TYPE_COLORS['其他'];
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
            {record.resignationTypeDesc}
          </Tag>
        );
      },
    },
    {
      title: '离职日期',
      dataIndex: 'resignationDate',
      key: 'resignationDate',
      width: 120,
      sorter: true,
    },
    {
      title: '交接人',
      dataIndex: 'handoverToName',
      key: 'handoverToName',
      width: 100,
      render: (_, record) => getHandoverName(record),
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
          onClick={() => history.push(`/hr-change/resignation/${record.id}`)}
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
      bgColor: STATUS_BG_COLORS[RESIGNATION_STATUS.DRAFT],
      textColor: STATUS_TEXT_COLORS[RESIGNATION_STATUS.DRAFT],
    },
    {
      label: '审批中',
      count: stats.pending,
      bgColor: STATUS_BG_COLORS[RESIGNATION_STATUS.PENDING],
      textColor: STATUS_TEXT_COLORS[RESIGNATION_STATUS.PENDING],
    },
    {
      label: '待离职',
      count: stats.approved,
      bgColor: STATUS_BG_COLORS[RESIGNATION_STATUS.APPROVED],
      textColor: STATUS_TEXT_COLORS[RESIGNATION_STATUS.APPROVED],
    },
    {
      label: '已离职',
      count: stats.resigned,
      bgColor: STATUS_BG_COLORS[RESIGNATION_STATUS.RESIGNED],
      textColor: STATUS_TEXT_COLORS[RESIGNATION_STATUS.RESIGNED],
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>离职管理</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理员工离职申请与审批流程</div>
          </div>
        ),
        extra: [
          <Button
            key="create"
            type="primary"
            danger
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: '#ef4444',
              borderColor: '#ef4444',
              borderRadius: 8,
              padding: '6px 16px',
              height: 'auto',
            }}
          >
            发起离职申请
          </Button>,
        ],
      }}
    >
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        message={
          <span>
            风险提醒：本月离职人数 <b>4</b> 人，离职率 <b>3.2%</b>，高于上月 <b>1.1%</b>，请关注团队稳定性。
          </span>
        }
        style={{ marginBottom: 20, borderRadius: 8, background: '#fef2f2', border: 'none', color: '#dc2626' }}
      />

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

      <ProTable<ResignationRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, status } = params as any;
          const tabMap: Record<string, number> = {
            draft: RESIGNATION_STATUS.DRAFT,
            pending: RESIGNATION_STATUS.PENDING,
            approved: RESIGNATION_STATUS.APPROVED,
            resigned: RESIGNATION_STATUS.RESIGNED,
            rejected: RESIGNATION_STATUS.REJECTED,
          };
          const apiParams: API.listUsingGET2Params = {
            current,
            pageSize,
            status: activeTab !== 'all' ? tabMap[activeTab] : status,
          };
          try {
            const res = await listUsingGet2(apiParams);
            if (res.code === 0 && res.data) {
              return { data: (res.data.records || []) as ResignationRecord[], success: true, total: res.data.total || 0 };
            }
            return { data: [] as ResignationRecord[], success: true, total: 0 };
          } catch {
            message.error('获取离职列表失败');
            return { data: [] as ResignationRecord[], success: true, total: 0 };
          }
        }}
        toolBarRender={() => [
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
            style={{ borderRadius: 8 }}
          >
            刷新
          </Button>,
        ]}
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
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#ef4444" /></> },
                { key: 'draft', label: <>草稿 <Badge count={stats.draft} showZero color="#9ca3af" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#f59e0b" /></> },
                { key: 'approved', label: <>待离职 <Badge count={stats.approved} showZero color="#fb923c" /></> },
                { key: 'resigned', label: <>已离职 <Badge count={stats.resigned} showZero color="#22c55e" /></> },
                { key: 'rejected', label: <>已拒绝 <Badge count={stats.rejected} showZero color="#ef4444" /></> },
              ]}
            />,
          ],
        }}
        cardProps={{
          style: { borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
        }}
      />

      <ResignationFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageContainer>
  );
};

export default ResignationPage;
