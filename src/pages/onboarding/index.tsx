import {
  ONBOARDING_STATUS,
  ONBOARDING_STATUS_COLOR,
  ONBOARDING_STATUS_MAP,
} from '@/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import OnboardingFormDrawer from './components/OnboardingFormModal';
import { OnboardingRecord, onboardingList } from './mock';

/**
 * 入职管理列表页
 * 统计卡片 + 状态Tab + ProTable搜索筛选
 */
const OnboardingPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  /** 各状态统计 */
  const stats = useMemo(() => {
    const draft = onboardingList.filter((i) => i.status === ONBOARDING_STATUS.DRAFT).length;
    const pending = onboardingList.filter((i) => i.status === ONBOARDING_STATUS.PENDING).length;
    const approved = onboardingList.filter((i) => i.status === ONBOARDING_STATUS.APPROVED_PENDING_JOIN).length;
    const joined = onboardingList.filter((i) => i.status === ONBOARDING_STATUS.JOINED).length;
    const rejected = onboardingList.filter((i) => i.status === ONBOARDING_STATUS.REJECTED).length;
    return { draft, pending, approved, joined, rejected, total: onboardingList.length };
  }, []);

  const columns: ProColumns<OnboardingRecord>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (_, record) => (
        <a onClick={() => history.push(`/hr-change/onboarding/${record.id}`)}>{record.name}</a>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      search: false,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 130,
      ellipsis: true,
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 130,
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        '前端工程师': { text: '前端工程师' },
        '后端工程师': { text: '后端工程师' },
        '测试工程师': { text: '测试工程师' },
        '产品经理': { text: '产品经理' },
      },
    },
    {
      title: '预计入职日期',
      dataIndex: 'expectedHireDate',
      key: 'expectedHireDate',
      width: 130,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: {
        [ONBOARDING_STATUS.DRAFT]: { text: '草稿' },
        [ONBOARDING_STATUS.PENDING]: { text: '审批中' },
        [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: { text: '已批准待入职' },
        [ONBOARDING_STATUS.JOINED]: { text: '已入职' },
        [ONBOARDING_STATUS.REJECTED]: { text: '已拒绝' },
      },
      render: (_, record) => (
        <Tag color={ONBOARDING_STATUS_COLOR[record.status]}>
          {ONBOARDING_STATUS_MAP[record.status]}
        </Tag>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
      search: false,
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
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => {
        const isDraft = record.status === ONBOARDING_STATUS.DRAFT;
        const isPending = record.status === ONBOARDING_STATUS.PENDING;
        const isApproved = record.status === ONBOARDING_STATUS.APPROVED_PENDING_JOIN;
        const isJoined = record.status === ONBOARDING_STATUS.JOINED;
        const isRejected = record.status === ONBOARDING_STATUS.REJECTED;

        const actions: React.ReactNode[] = [
          <a key="detail" onClick={() => history.push(`/hr-change/onboarding/${record.id}`)}>
            查看详情
          </a>,
        ];

        if (isDraft) {
          actions.push(
            <a key="submit" onClick={() => {
              Modal.confirm({
                title: '确认提交审批',
                content: '提交后不可修改，确定提交吗？',
                onOk: () => message.success('已提交审批'),
              });
            }}>
              提交审批
            </a>,
            <a key="edit" onClick={() => setCreateOpen(true)}>编辑</a>,
          );
        }

        if (isPending) {
          actions.push(
            <a key="cancel" style={{ color: '#fa8c16' }} onClick={() => {
              Modal.confirm({
                title: '确认撤回',
                content: '撤回后申请将变更为草稿状态',
                onOk: () => message.success('已撤回'),
              });
            }}>
              撤回
            </a>,
          );
        }

        if (isApproved) {
          actions.push(
            <a key="confirm" style={{ color: '#1677ff' }} onClick={() => {
              Modal.confirm({
                title: '确认入职',
                content: '确认该候选人已入职？',
                onOk: () => message.success('已确认入职'),
              });
            }}>
              确认入职
            </a>,
            <a key="abandon" style={{ color: '#ff4d4f' }} onClick={() => {
              Modal.confirm({
                title: '确认放弃',
                content: '确定放弃入职？操作不可恢复。',
                okButtonProps: { danger: true },
                onOk: () => message.success('已放弃入职'),
              });
            }}>
              放弃入职
            </a>,
          );
        }

        if (isRejected) {
          actions.push(<a key="retry">重新发起</a>);
        }

        if (isJoined) {
          actions.push(<span style={{ color: '#999' }}>已归档</span>);
        }

        return <Space size="small">{actions}</Space>;
      },
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { label: '草稿', count: stats.draft, icon: <ClockCircleOutlined />, bg: '#fafafa', color: '#666' },
          { label: '审批中', count: stats.pending, icon: <ClockCircleOutlined />, bg: '#fffbe6', color: '#fa8c16', border: '#faad14' },
          { label: '已批准待入职', count: stats.approved, icon: <UserAddOutlined />, bg: '#e6f4ff', color: '#1677ff', border: '#1677ff' },
          { label: '已入职', count: stats.joined, icon: <CheckCircleOutlined />, bg: '#f6ffed', color: '#52c41a', border: '#52c41a' },
        ].map((card) => (
          <Col span={6} key={card.label}>
            <Card
              bordered={!!card.border}
              style={{
                background: card.bg,
                borderColor: card.border,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: card.color, marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: card.color }}>{card.count}</div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.6)', color: card.color, fontSize: 20,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ProTable */}
      <ProTable<OnboardingRecord>
        headerTitle="入职列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          span: 8,
        }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, status, expectedHireDate } = params as any;

          // 本地筛选（模拟 API）
          let filtered = [...onboardingList];
          if (activeTab !== 'all') {
            const tabStatusMap: Record<string, number> = {
              draft: ONBOARDING_STATUS.DRAFT,
              pending: ONBOARDING_STATUS.PENDING,
              approved: ONBOARDING_STATUS.APPROVED_PENDING_JOIN,
              rejected: ONBOARDING_STATUS.REJECTED,
              joined: ONBOARDING_STATUS.JOINED,
            };
            filtered = filtered.filter((i) => i.status === tabStatusMap[activeTab]);
          }
          if (keyword) {
            const kw = String(keyword).toLowerCase();
            filtered = filtered.filter(
              (i) => i.name.toLowerCase().includes(kw) || i.phone.includes(kw),
            );
          }
          if (status !== undefined && status !== null && status !== '') {
            filtered = filtered.filter((i) => i.status === Number(status));
          }

          const total = filtered.length;
          const page = current || 1;
          const size = pageSize || 10;
          const records = filtered.slice((page - 1) * size, page * size);

          return { data: records, success: true, total };
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            新建入职
          </Button>,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
        toolbar={{
          actions: [
            <Tabs
              key="tabs"
              activeKey={activeTab}
              onChange={(k) => { setActiveTab(k); actionRef.current?.reload(); }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#1677ff" /></> },
                { key: 'draft', label: <>草稿 <Badge count={stats.draft} showZero color="#999" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#fa8c16" /></> },
                { key: 'approved', label: <>已批准待入职 <Badge count={stats.approved} showZero color="#1677ff" /></> },
                { key: 'rejected', label: <>已拒绝 <Badge count={stats.rejected} showZero color="#ff4d4f" /></> },
                { key: 'joined', label: <>已入职 <Badge count={stats.joined} showZero color="#52c41a" /></> },
              ]}
            />,
          ],
        }}
      />

      {/* 表单 Drawer */}
      <OnboardingFormDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </PageContainer>
  );
};

export default OnboardingPage;
