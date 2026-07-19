import {
  ONBOARDING_STATUS,
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
  Input,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import OnboardingFormDrawer from './components/OnboardingFormModal';
import { OnboardingRecord } from './mock';
import { listUsingGet, confirmJoinUsingPost, cancelUsingPost1 } from '@/api/onboardingController';

const STATUS_BG_COLORS: Record<number, string> = {
  [ONBOARDING_STATUS.DRAFT]: '#f9fafb',
  [ONBOARDING_STATUS.PENDING]: '#fef9c3',
  [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: '#eff6ff',
  [ONBOARDING_STATUS.JOINED]: '#f0fdf4',
  [ONBOARDING_STATUS.REJECTED]: '#fef2f2',
  [ONBOARDING_STATUS.ABANDONED]: '#f9fafb',
};

const STATUS_TEXT_COLORS: Record<number, string> = {
  [ONBOARDING_STATUS.DRAFT]: '#6b7280',
  [ONBOARDING_STATUS.PENDING]: '#ca8a04',
  [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: '#3b82f6',
  [ONBOARDING_STATUS.JOINED]: '#22c55e',
  [ONBOARDING_STATUS.REJECTED]: '#dc2626',
  [ONBOARDING_STATUS.ABANDONED]: '#6b7280',
};

const STATUS_LABEL_COLORS: Record<number, { bg: string; color: string }> = {
  [ONBOARDING_STATUS.DRAFT]: { bg: '#f3f4f6', color: '#6b7280' },
  [ONBOARDING_STATUS.PENDING]: { bg: '#fef3c7', color: '#d97706' },
  [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: { bg: '#dbeafe', color: '#2563eb' },
  [ONBOARDING_STATUS.JOINED]: { bg: '#dcfce7', color: '#16a34a' },
  [ONBOARDING_STATUS.REJECTED]: { bg: '#fee2e2', color: '#dc2626' },
  [ONBOARDING_STATUS.ABANDONED]: { bg: '#f3f4f6', color: '#6b7280' },
};

const OnboardingPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const [stats, setStats] = useState({ draft: 0, pending: 0, approved: 0, joined: 0, rejected: 0, abandoned: 0, total: 0 });

  const loadStats = async () => {
    try {
      const res = await listUsingGet({ current: 1, pageSize: 10000 });
      if (res.code === 0 && res.data?.records) {
        const records = res.data.records;
        setStats({
          draft: records.filter((i) => i.status === ONBOARDING_STATUS.DRAFT).length,
          pending: records.filter((i) => i.status === ONBOARDING_STATUS.PENDING).length,
          approved: records.filter((i) => i.status === ONBOARDING_STATUS.APPROVED_PENDING_JOIN).length,
          joined: records.filter((i) => i.status === ONBOARDING_STATUS.JOINED).length,
          rejected: records.filter((i) => i.status === ONBOARDING_STATUS.REJECTED).length,
          abandoned: records.filter((i) => i.status === ONBOARDING_STATUS.ABANDONED).length,
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

  const columns: ProColumns<OnboardingRecord>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            style={{ backgroundColor: record.avatarColor || '#3b82f6', fontSize: 16, fontWeight: 600 }}
          >
            {getInitial(record.name)}
          </Avatar>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
              }}
              onClick={() => history.push(`/hr-change/onboarding/${record.id}`)}
            >
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{record.phone}</div>
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
      title: '录用类型',
      dataIndex: 'hireTypeDesc',
      key: 'hireTypeDesc',
      width: 100,
      render: (_, record) => (
        <Tag
          style={{
            background: '#f3f4f6',
            color: '#6b7280',
            borderRadius: 4,
            fontSize: 12,
            margin: 0,
            border: 'none',
          }}
        >
          {record.hireTypeDesc}
        </Tag>
      ),
    },
    {
      title: '预计入职日期',
      dataIndex: 'expectedHireDate',
      key: 'expectedHireDate',
      width: 130,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => {
        const isDraft = record.status === ONBOARDING_STATUS.DRAFT;
        const isPending = record.status === ONBOARDING_STATUS.PENDING;
        const isApproved = record.status === ONBOARDING_STATUS.APPROVED_PENDING_JOIN;

        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button
              type="link"
              size="small"
              onClick={() => history.push(`/hr-change/onboarding/${record.id}`)}
              style={{ color: '#3b82f6', padding: 0 }}
            >
              查看详情
            </Button>
            {isPending && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: '确认撤回',
                    content: '撤回后申请将变更为草稿状态',
                    onOk: async () => {
                      try {
                        await cancelUsingPost1({ id: record.id });
                        message.success('已撤回');
                        actionRef.current?.reload();
                        loadStats();
                      } catch {
                        message.error('撤回失败');
                      }
                    },
                  });
                }}
                style={{ padding: 0 }}
              >
                撤回
              </Button>
            )}
            {isApproved && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  let dateValue = dayjs().format('YYYY-MM-DD');
                  const modal = Modal.confirm({
                    title: '确认入职',
                    content: (
                      <div>
                        <p>确认该候选人已入职？</p>
                        <div style={{ marginTop: 8 }}>
                          <span>实际入职日期：</span>
                          <input
                            type="date"
                            defaultValue={dateValue}
                            onChange={(e) => { dateValue = e.target.value; }}
                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                          />
                        </div>
                      </div>
                    ),
                    onOk: async () => {
                      try {
                        await confirmJoinUsingPost({ id: record.id!, actualHireDate: dateValue } as any);
                        message.success('已确认入职');
                        actionRef.current?.reload();
                      } catch {
                        message.error('操作失败');
                      }
                    },
                  });
                }}
                style={{ color: '#3b82f6', padding: 0 }}
              >
                确认入职
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const statCards = [
    {
      label: '草稿',
      count: stats.draft,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.DRAFT],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.DRAFT],
    },
    {
      label: '审批中',
      count: stats.pending,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.PENDING],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.PENDING],
    },
    {
      label: '待入职',
      count: stats.approved,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.APPROVED_PENDING_JOIN],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.APPROVED_PENDING_JOIN],
    },
    {
      label: '已入职',
      count: stats.joined,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.JOINED],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.JOINED],
    },
    {
      label: '已拒绝',
      count: stats.rejected,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.REJECTED],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.REJECTED],
    },
    {
      label: '已放弃',
      count: stats.abandoned,
      bgColor: STATUS_BG_COLORS[ONBOARDING_STATUS.ABANDONED],
      textColor: STATUS_TEXT_COLORS[ONBOARDING_STATUS.ABANDONED],
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>入职管理</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理候选人入职申请与审批流程</div>
          </div>
        ),
        extra: [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: '#3b82f6',
              borderColor: '#3b82f6',
              borderRadius: 8,
              padding: '6px 16px',
              height: 'auto',
            }}
          >
            新建入职申请
          </Button>,
        ],
      }}
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col flex="1" key={card.label}>
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
          placeholder="搜索姓名/手机号"
          allowClear
          onSearch={(v) => { setKeyword(v); actionRef.current?.reload(); }}
          style={{ width: 280 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>
      </div>

      <ProTable<OnboardingRecord>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, status } = params as any;
          const tabStatusMap: Record<string, number> = {
            draft: ONBOARDING_STATUS.DRAFT,
            pending: ONBOARDING_STATUS.PENDING,
            approved: ONBOARDING_STATUS.APPROVED_PENDING_JOIN,
            joined: ONBOARDING_STATUS.JOINED,
            rejected: ONBOARDING_STATUS.REJECTED,
            abandoned: ONBOARDING_STATUS.ABANDONED,
          };
          const apiParams: API.listUsingGETParams = {
            current,
            pageSize,
            keyword,
            status: activeTab !== 'all' ? tabStatusMap[activeTab] : status,
          };
          try {
            const res = await listUsingGet(apiParams);
            if (res.code === 0 && res.data) {
              return { data: (res.data.records || []) as OnboardingRecord[], success: true, total: res.data.total || 0 };
            }
            return { data: [] as OnboardingRecord[], success: true, total: 0 };
          } catch {
            message.error('获取入职列表失败');
            return { data: [] as OnboardingRecord[], success: true, total: 0 };
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
                loadStats();
                actionRef.current?.reload();
              }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#3b82f6" /></> },
                { key: 'draft', label: <>草稿 <Badge count={stats.draft} showZero color="#9ca3af" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#f59e0b" /></> },
                { key: 'approved', label: <>待入职 <Badge count={stats.approved} showZero color="#3b82f6" /></> },
                { key: 'joined', label: <>已入职 <Badge count={stats.joined} showZero color="#22c55e" /></> },
                { key: 'rejected', label: <>已拒绝 <Badge count={stats.rejected} showZero color="#ef4444" /></> },
                { key: 'abandoned', label: <>已放弃 <Badge count={stats.abandoned} showZero color="#9ca3af" /></> },
              ]}
            />,
          ],
        }}
        cardProps={{
          style: { borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
        }}
      />

      <OnboardingFormDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </PageContainer>
  );
};

export default OnboardingPage;
