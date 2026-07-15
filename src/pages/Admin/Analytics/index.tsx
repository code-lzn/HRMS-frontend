import {
  getSummaryUsingGet,
  getGrowthTrendUsingGet,
  getSourceDistributionUsingGet,
} from '@/api/analyticsController';
import { Line, Pie } from '@ant-design/charts';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { Card, Col, Empty, Row, Segmented, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';

const RANGE_OPTIONS = ['7days', '30days', '90days'];

const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<string>('7days');
  const [summary, setSummary] = useState<API.AnalyticsSummaryVO | null>(null);
  const [trend, setTrend] = useState<API.GrowthTrendVO[]>([]);
  const [sources, setSources] = useState<API.SourceDistributionVO[]>([]);

  useEffect(() => {
    loadAll();
  }, [range]);

  const loadAll = async () => {
    try { const r = await getSummaryUsingGet({ range }); setSummary(r?.data ?? null); } catch {}
    try { const r = await getGrowthTrendUsingGet({ range }); setTrend(r?.data ?? []); } catch {}
    try { const r = await getSourceDistributionUsingGet({ range }); setSources(r?.data ?? []); } catch {}
  };

  const trendConfig = {
    data: trend.flatMap((t) => [
      { date: t.date, value: t.userCount, category: '用户数' },
      { date: t.date, value: t.revenue, category: '收入' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    color: ['#1677ff', '#52c41a'],
    height: 300,
  };

  const sourceConfig = {
    data: sources.map((s) => ({ name: s.sourceName, value: s.count })),
    angleField: 'value',
    colorField: 'name',
    radius: 0.8,
    label: { type: 'outer' },
    height: 300,
  };

  return (
    <div>
      <Segmented
        options={RANGE_OPTIONS}
        value={range}
        onChange={(v) => setRange(v as string)}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="总用户数"
              value={summary?.totalUsers ?? 0}
              prefix={<TeamOutlined />}
              suffix={
                summary?.totalUsersChange != null && summary.totalUsersChange !== 0 && (
                  <span style={{ fontSize: 14, color: summary.totalUsersChange > 0 ? '#3f8600' : '#cf1322' }}>
                    {summary.totalUsersChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(summary.totalUsersChange)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="活跃用户"
              value={summary?.activeUsers ?? 0}
              prefix={<UserOutlined />}
              suffix={
                summary?.activeUsersChange != null && summary.activeUsersChange !== 0 && (
                  <span style={{ fontSize: 14, color: summary.activeUsersChange > 0 ? '#3f8600' : '#cf1322' }}>
                    {summary.activeUsersChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(summary.activeUsersChange)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="总收入"
              value={summary?.totalRevenue ?? 0}
              prefix={<DollarOutlined />}
              suffix={
                summary?.totalRevenueChange != null && summary.totalRevenueChange !== 0 && (
                  <span style={{ fontSize: 14, color: summary.totalRevenueChange > 0 ? '#3f8600' : '#cf1322' }}>
                    {summary.totalRevenueChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(summary.totalRevenueChange)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="转化率"
              value={summary?.avgConversionRate ?? 0}
              prefix={<PercentageOutlined />}
              suffix={
                summary?.avgConversionRateChange != null && summary.avgConversionRateChange !== 0 && (
                  <span style={{ fontSize: 14, color: summary.avgConversionRateChange > 0 ? '#3f8600' : '#cf1322' }}>
                    {summary.avgConversionRateChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(summary.avgConversionRateChange)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="增长趋势" style={{ marginBottom: 16 }}>
            {trend.length > 0 ? <Line {...trendConfig} /> : <Empty description="暂无数据" />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="来源分布" style={{ marginBottom: 16 }}>
            {sources.length > 0 ? <Pie {...sourceConfig} /> : <Empty description="暂无数据" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;
