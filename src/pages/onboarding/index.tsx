import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import OnboardingFormModal from './components/OnboardingFormModal';
import { OnboardingStatus, OnboardingStatusMap, onboardingList } from './mock';

/** 入职状态对应的 Tag 颜色 */
const STATUS_TAG_COLORS: Record<OnboardingStatus, string> = {
  draft: 'default',
  approving: 'warning',
  approved: 'processing',
  rejected: 'error',
  onboarded: 'success',
};

const OnboardingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  /** 统计各状态数量 */
  const stats = useMemo(() => {
    return {
      draft: onboardingList.filter((i) => i.status === 'draft').length,
      approving: onboardingList.filter((i) => i.status === 'approving').length,
      approved: onboardingList.filter((i) => i.status === 'approved').length,
      onboarded: onboardingList.filter((i) => i.status === 'onboarded').length,
      rejected: onboardingList.filter((i) => i.status === 'rejected').length,
    };
  }, []);

  /** 根据当前标签过滤数据 */
  const filteredList = useMemo(() => {
    if (activeTab === 'all') return onboardingList;
    return onboardingList.filter((i) => i.status === activeTab);
  }, [activeTab]);

  /** 提交审批 */
  const handleSubmit = () => {
    Modal.confirm({
      title: '确认提交审批',
      content: '提交后无法修改，确定要提交该入职申请吗？',
      onOk: () => {
        message.success('已提交审批');
      },
    });
  };

  /** 编辑草稿 */
  const handleEdit = () => {
    setCreateOpen(true);
  };

  /** 撤回审批 */
  const handleWithdraw = () => {
    Modal.confirm({
      title: '确认撤回',
      content: '撤回后该入职申请将变更为草稿状态',
      onOk: () => {
        message.success('已撤回');
      },
    });
  };

  /** 确认入职 */
  const handleConfirmOnboard = () => {
    Modal.confirm({
      title: '确认入职',
      content: '确认该候选人已入职？确认后将自动创建员工档案。',
      onOk: () => {
        message.success('已确认入职，员工档案创建成功');
      },
    });
  };

  /** 重新发起 */
  const handleReapply = () => {
    setCreateOpen(true);
  };

  /** 表格列定义 */
  const columns: ColumnsType<(typeof onboardingList)[number]> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: record.avatarColor }}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '录用类型',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '预计入职日期',
      dataIndex: 'expectedHireDate',
      key: 'expectedHireDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: OnboardingStatus) => (
        <Tag color={STATUS_TAG_COLORS[status]}>
          {OnboardingStatusMap[status]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => {
        if (record.status === 'draft') {
          return (
            <Space>
              <a onClick={handleSubmit}>提交审批</a>
              <a onClick={handleEdit}>编辑</a>
            </Space>
          );
        }
        if (record.status === 'approving') {
          return (
            <a onClick={handleWithdraw} style={{ color: '#fa8c16' }}>
              撤回
            </a>
          );
        }
        if (record.status === 'approved') {
          return (
            <a onClick={handleConfirmOnboard} style={{ color: '#1677ff' }}>
              确认入职
            </a>
          );
        }
        if (record.status === 'rejected') {
          return (
            <Space>
              <a>查看原因</a>
              <a onClick={handleReapply}>重新发起</a>
            </Space>
          );
        }
        return <a>查看详情</a>;
      },
    },
  ];

  return (
    <PageContainer>
      {/* 顶部标题区 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>入职管理</h1>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            管理候选人入职申请{''}◆{''}◆{''}◆{''}审批流程
          </div>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          新建入职申请
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            bordered={false}
            style={{ background: '#fafafa' }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  草稿
                </div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {stats.draft}
                </div>
              </div>
              <Avatar
                size={48}
                icon={<ClockCircleOutlined />}
                style={{ backgroundColor: '#f0f0f0', color: '#666' }}
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            bordered
            style={{ borderColor: '#faad14', background: '#fffbe6' }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, color: '#ad8b00', marginBottom: 8 }}
                >
                  审批中
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 600, color: '#fa8c16' }}
                >
                  {stats.approving}
                </div>
              </div>
              <Avatar
                size={48}
                icon={<ClockCircleOutlined />}
                style={{ backgroundColor: '#fff7e6', color: '#fa8c16' }}
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            bordered
            style={{ borderColor: '#1677ff', background: '#e6f4ff' }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, color: '#003eb3', marginBottom: 8 }}
                >
                  待入职
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 600, color: '#1677ff' }}
                >
                  {stats.approved}
                </div>
              </div>
              <Avatar
                size={48}
                icon={<UserAddOutlined />}
                style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            bordered
            style={{ borderColor: '#52c41a', background: '#f6ffed' }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, color: '#389e0d', marginBottom: 8 }}
                >
                  已入职
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 600, color: '#52c41a' }}
                >
                  {stats.onboarded}
                </div>
              </div>
              <Avatar
                size={48}
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 状态 Tab 切换 + 列表 */}
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: (
                <span>
                  全部{' '}
                  <Badge
                    count={onboardingList.length}
                    showZero
                    color="#1677ff"
                  />
                </span>
              ),
            },
            {
              key: 'draft',
              label: (
                <span>
                  草稿 <Badge count={stats.draft} showZero color="#999" />
                </span>
              ),
            },
            {
              key: 'approving',
              label: (
                <span>
                  审批中{' '}
                  <Badge count={stats.approving} showZero color="#fa8c16" />
                </span>
              ),
            },
            {
              key: 'approved',
              label: (
                <span>
                  已批准待入职{' '}
                  <Badge count={stats.approved} showZero color="#1677ff" />
                </span>
              ),
            },
            {
              key: 'rejected',
              label: (
                <span>
                  已拒绝{' '}
                  <Badge count={stats.rejected} showZero color="#ff4d4f" />
                </span>
              ),
            },
            {
              key: 'onboarded',
              label: (
                <span>
                  已入职{' '}
                  <Badge count={stats.onboarded} showZero color="#52c41a" />
                </span>
              ),
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <OnboardingFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </PageContainer>
  );
};

export default OnboardingPage;
