import {
  getAttendanceRateUsingGet,
  getLateEarlyRankingUsingGet,
  getLeaveDistributionUsingGet,
} from '@/api/attendanceStatisticsController';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Empty,
  Progress,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

interface RateItem {
  month: string;
  attendanceRate: number;
  lateRate: number;
  earlyRate: number;
  absentRate: number;
}

interface RankingItem {
  userName: string;
  departmentName: string;
  count: number;
}

interface DistributionItem {
  type: string;
  count: number;
  days: number;
  percentage: number;
}

const AttendanceStatistics: React.FC = () => {
  const [months, setMonths] = useState<string>('6');
  const [topN, setTopN] = useState<string>('10');

  // 出勤率
  const {
    data: rateResp,
    isLoading: rateLoading,
    isError: rateError,
  } = useQuery({
    queryKey: ['attendance-stats', 'rate', months],
    queryFn: async () => getAttendanceRateUsingGet({ months: Number(months) }),
  });
  const rateRespData = rateResp?.data;
  const rateData: RateItem[] = Array.isArray(rateRespData) ? rateRespData : [];

  // 迟到早退排名
  const {
    data: rankingResp,
    isLoading: rankingLoading,
    isError: rankError,
  } = useQuery({
    queryKey: ['attendance-stats', 'ranking', topN],
    queryFn: async () =>
      getLateEarlyRankingUsingGet({
        topN: Number(topN),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
  });
  const rankingRespData = rankingResp?.data;
  const ranking: RankingItem[] = Array.isArray(rankingRespData)
    ? rankingRespData
    : [];

  // 请假分布
  const {
    data: distResp,
    isLoading: distLoading,
    isError: distError,
  } = useQuery({
    queryKey: ['attendance-stats', 'distribution'],
    queryFn: async () =>
      getLeaveDistributionUsingGet({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
  });
  const distRespData = distResp?.data;
  const distribution: DistributionItem[] = Array.isArray(distRespData)
    ? distRespData
    : [];

  // 汇总统计
  const summary = useMemo(() => {
    if (!rateData.length) {
      return { avgRate: 0, avgLate: 0, avgAbsent: 0, trend: 0 };
    }
    const sum = rateData.reduce(
      (acc, cur) => ({
        rate: acc.rate + (cur.attendanceRate || 0),
        late: acc.late + (cur.lateRate || 0),
        absent: acc.absent + (cur.absentRate || 0),
      }),
      { rate: 0, late: 0, absent: 0 },
    );
    const len = rateData.length;
    const last = rateData[rateData.length - 1]?.attendanceRate ?? 0;
    const first = rateData[0]?.attendanceRate ?? 0;
    return {
      avgRate: sum.rate / len,
      avgLate: sum.late / len,
      avgAbsent: sum.absent / len,
      trend: last - first,
    };
  }, [rateData]);

  // 排名表格
  const rankingColumns: ColumnsType<RankingItem> = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, idx) => {
        const top3 = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <Tag
            color={idx < 3 ? 'gold' : 'default'}
            style={
              idx < 3
                ? { background: top3[idx], color: '#fff', border: 'none' }
                : undefined
            }
          >
            {idx + 1}
          </Tag>
        );
      },
    },
    { title: '员工', dataIndex: 'userName', key: 'userName' },
    { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
    {
      title: '迟到/早退次数',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (n: number) => <strong style={{ color: '#ff4d4f' }}>{n}</strong>,
    },
  ];

  // 分布表格
  const distColumns: ColumnsType<DistributionItem> = [
    { title: '请假类型', dataIndex: 'type', key: 'type' },
    {
      title: '人数',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      width: 100,
    },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
      align: 'right',
      width: 100,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'right',
      width: 200,
      render: (p: number) => (
        <Space style={{ width: '100%' }} direction="vertical" size={2}>
          <Progress
            percent={Number(p) || 0}
            size="small"
            format={(v) => `${v}%`}
          />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '考勤统计',
      }}
    >
      {/* 顶部筛选 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>
            <ClockCircleOutlined /> 时间范围：
          </span>
          <Select
            value={months}
            onChange={setMonths}
            style={{ width: 140 }}
            options={[
              { value: '1', label: '近 1 个月' },
              { value: '3', label: '近 3 个月' },
              { value: '6', label: '近 6 个月' },
              { value: '12', label: '近 12 个月' },
            ]}
          />
          <span>
            <UserOutlined /> 排名 Top：
          </span>
          <Select
            value={topN}
            onChange={setTopN}
            style={{ width: 120 }}
            options={[
              { value: '5', label: 'Top 5' },
              { value: '10', label: 'Top 10' },
              { value: '20', label: 'Top 20' },
            ]}
          />
        </Space>
      </Card>

      {/* 顶部 4 张统计卡 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="平均出勤率"
              value={summary.avgRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="平均迟到率"
              value={summary.avgLate}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="平均缺勤率"
              value={summary.avgAbsent}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="较初期变化"
              value={summary.trend}
              precision={2}
              suffix="%"
              valueStyle={{
                color: summary.trend >= 0 ? '#52c41a' : '#ff4d4f',
              }}
              prefix={
                summary.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Tab 切换 */}
      <Card bordered={false}>
        <Tabs
          defaultActiveKey="rate"
          items={[
            {
              key: 'rate',
              label: '出勤率趋势',
              children: rateError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="请检查后端服务是否运行"
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {rateData.length === 0 && !rateLoading ? (
                    <Col span={24}>
                      <Empty description="暂无出勤率数据" />
                    </Col>
                  ) : (
                    rateData.map((item) => (
                      <Col span={6} key={item.month}>
                        <Card size="small" style={{ background: '#fafafa' }}>
                          <Space
                            direction="vertical"
                            style={{ width: '100%' }}
                            size={8}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#262626',
                              }}
                            >
                              {item.month}
                            </div>
                            <Progress
                              percent={Number(item.attendanceRate) || 0}
                              strokeColor="#52c41a"
                              format={(v) => `${v}%`}
                            />
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                              迟到 {item.lateRate ?? 0}% · 早退{' '}
                              {item.earlyRate ?? 0}% · 缺勤{' '}
                              {item.absentRate ?? 0}%
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              ),
            },
            {
              key: 'ranking',
              label: '迟到早退排名',
              children: rankError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="请检查后端服务是否运行"
                />
              ) : (
                <Table
                  rowKey={(r) => r.userName}
                  columns={rankingColumns}
                  dataSource={ranking}
                  loading={rankingLoading}
                  pagination={false}
                  locale={{ emptyText: <Empty description="暂无排名数据" /> }}
                />
              ),
            },
            {
              key: 'distribution',
              label: '请假分布',
              children: distError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="请检查后端服务是否运行"
                />
              ) : (
                <Table
                  rowKey="type"
                  columns={distColumns}
                  dataSource={distribution}
                  loading={distLoading}
                  pagination={false}
                  locale={{ emptyText: <Empty description="暂无请假数据" /> }}
                />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default AttendanceStatistics;
