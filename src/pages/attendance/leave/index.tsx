import { queryRequestsUsingGet } from '@/api/leaveController';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Result,
  Row,
  Select,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

interface LeaveRow {
  id: number;
  employeeName: string;
  leaveType: number;
  leaveTypeDesc: string;
  startTime: string;
  endTime: string;
  leaveDays: number;
  reason: string;
  status: number;
  statusDesc: string;
  createTime: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  suffix,
}) => (
  <Card
    variant="borderless"
    style={{
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.3s',
    }}
    styles={{ body: { padding: '20px 24px' } }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 24,
          color: color,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: '#8c8c8c',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: color,
            lineHeight: 1.2,
          }}
        >
          {value}
          {suffix && (
            <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const LeaveManagement: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>();
  const [leaveType, setLeaveType] = useState<number | undefined>();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState<number | undefined>();
  const [searchLeaveType, setSearchLeaveType] = useState<number | undefined>();

  const {
    data: listResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'leave',
      'requests',
      searchKeyword,
      searchStatus,
      searchLeaveType,
    ],
    queryFn: async () =>
      queryRequestsUsingGet({
        page: 1,
        size: 100,
        keyword: searchKeyword || undefined,
        status: searchStatus || undefined,
        leaveType: searchLeaveType || undefined,
      } as any),
  });
  const raw = (listResp as any)?.data?.records;
  const list: LeaveRow[] = Array.isArray(raw) ? raw : [];

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let thisMonthDays = 0;
    const now = dayjs();
    const thisMonth = now.month();
    const thisYear = now.year();

    list.forEach((item) => {
      if (item.status === 2) pending++;
      if (item.status === 3) approved++;
      if (item.status === 4) rejected++;
      const start = dayjs(item.startTime);
      if (start.month() === thisMonth && start.year() === thisYear) {
        thisMonthDays += item.leaveDays || 0;
      }
    });

    return { pending, approved, rejected, thisMonthDays };
  }, [list]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setSearchStatus(status);
    setSearchLeaveType(leaveType);
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(undefined);
    setLeaveType(undefined);
    setSearchKeyword('');
    setSearchStatus(undefined);
    setSearchLeaveType(undefined);
  };

  const getLeaveTypeTag = (type: number, desc: string) => {
    const colorMap: Record<number, string> = {
      1: 'blue',
      2: 'red',
      3: 'orange',
      4: 'pink',
      5: 'purple',
      6: 'cyan',
      7: 'green',
    };
    return <Tag color={colorMap[type] || 'default'}>{desc || '-'}</Tag>;
  };

  const getStatusTag = (s: number, desc: string) => {
    const map: Record<number, { color: string; icon: React.ReactNode }> = {
      1: { color: 'default', icon: null },
      2: { color: 'processing', icon: <ClockCircleOutlined /> },
      3: { color: 'success', icon: <CheckCircleOutlined /> },
      4: { color: 'error', icon: <CloseCircleOutlined /> },
      5: { color: 'default', icon: null },
    };
    const cfg = map[s] ?? { color: 'default', icon: null };
    return (
      <Tag icon={cfg.icon} color={cfg.color}>
        {desc || '-'}
      </Tag>
    );
  };

  const columns: ColumnsType<LeaveRow> = [
    {
      title: '申请人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 100,
      align: 'center',
      render: (v: number, record) => getLeaveTypeTag(v, record.leaveTypeDesc),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '天数',
      dataIndex: 'leaveDays',
      key: 'leaveDays',
      width: 80,
      align: 'center',
      render: (v: number) => (v !== null && v !== undefined ? `${v} 天` : '-'),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (s: number, record) => getStatusTag(s, record.statusDesc),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '请假管理',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="待审批"
            value={stats.pending}
            icon={<ClockCircleOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="已通过"
            value={stats.approved}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="已拒绝"
            value={stats.rejected}
            icon={<CloseCircleOutlined />}
            color="#ff4d4f"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="本月请假天数"
            value={stats.thisMonthDays}
            suffix="天"
            icon={<CalendarOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* 筛选区 */}
      <Card
        variant="borderless"
        style={{ marginBottom: 16, borderRadius: 8 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索申请人"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="请假类型"
              value={leaveType}
              onChange={setLeaveType}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 1, label: '年假' },
                { value: 2, label: '病假' },
                { value: 3, label: '事假' },
                { value: 4, label: '婚假' },
                { value: 5, label: '产假' },
                { value: 6, label: '丧假' },
                { value: 7, label: '调休' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="状态"
              value={status}
              onChange={setStatus}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 2, label: '审批中' },
                { value: 3, label: '已通过' },
                { value: 4, label: '已拒绝' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 列表区 */}
      <Card
        variant="borderless"
        style={{ borderRadius: 8 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>请假列表</span>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : list}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
            style: { padding: '16px 24px' },
          }}
          locale={{
            emptyText: isError ? (
              <Result
                status="error"
                title="加载失败"
                subTitle="请检查后端服务"
              />
            ) : (
              <Empty description="暂无请假记录" />
            ),
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default LeaveManagement;
