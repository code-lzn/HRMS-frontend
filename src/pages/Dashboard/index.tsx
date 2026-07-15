import { getGrowthTrendUsingGet, getSourceDistributionUsingGet, getSummaryUsingGet } from '@/api/analyticsController';
import { getMetricsUsingGet, getRecentLogsUsingGet } from '@/api/dashboardController';
import { Line, Pie } from '@ant-design/charts';
import { ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, DollarOutlined, PercentageOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Segmented, Spin, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const RANGE_OPTIONS = ['7days', '30days', '90days'];
const CARD_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1'];
const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'];

const DashboardPage: React.FC = () => {
  const [range, setRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<API.DashboardMetricsVO | null>(null);
  const [summary, setSummary] = useState<API.AnalyticsSummaryVO | null>(null);
  const [trend, setTrend] = useState<API.GrowthTrendVO[]>([]);
  const [sources, setSources] = useState<API.SourceDistributionVO[]>([]);
  const [logs, setLogs] = useState<API.RecentLogVO[]>([]);

  useEffect(() => { loadAll(); }, [range]);

  const loadAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getMetricsUsingGet(), getSummaryUsingGet({ range }),
      getGrowthTrendUsingGet({ range }), getSourceDistributionUsingGet({ range }),
      getRecentLogsUsingGet(),
    ]);
    if (results[0].status === 'fulfilled') setMetrics(results[0].value?.data ?? null);
    if (results[1].status === 'fulfilled') setSummary(results[1].value?.data ?? null);
    if (results[2].status === 'fulfilled') setTrend(results[2].value?.data ?? []);
    if (results[3].status === 'fulfilled') setSources(results[3].value?.data ?? []);
    if (results[4].status === 'fulfilled') setLogs(results[4].value?.data ?? []);
    setLoading(false);
  };

  const fmt = (v: number) => {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}w`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return v.toString();
  };

  const renderChange = (val?: number) => {
    if (val == null || val === 0) return null;
    const isUp = val > 0;
    return (
      <span style={{ fontSize: 13, marginLeft: 10, color: isUp ? '#52c41a' : '#ff4d4f' }}>
        {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(val)}%
      </span>
    );
  };

  const MetricCard = ({ title, value, icon, change, color }: {
    title: string; value?: number; icon: React.ReactNode; change?: number; color: string;
  }) => (
    <Card
      hoverable
      style={{ borderRadius: 10, border: '1px solid #f0f0f0', height: '100%' }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#262626', lineHeight: 1.2 }}>
            {value != null ? fmt(value) : '-'}
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${color}14`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20, color,
        }}>
          {icon}
        </div>
      </div>
      {change != null && change !== 0 && (
        <Tag color={change > 0 ? 'success' : 'error'} style={{ marginTop: 12, fontSize: 12, borderRadius: 6 }}>
          {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change)}%
        </Tag>
      )}
    </Card>
  );

  const trendConfig = {
    data: trend.flatMap((t) => [
      { date: t.date, value: t.userCount, category: '用户数' },
      { date: t.date, value: t.revenue, category: '收入' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    height: 360,
    color: ['#1677ff', '#52c41a'],
    area: {
      style: {
        fill: 'l(270) 0:rgba(22,119,255,0.0) 1:rgba(22,119,255,0.1)',
      },
    },
    point: { size: 3, shape: 'circle', style: { lineWidth: 2, fillOpacity: 1 } },
    lineStyle: { lineWidth: 2.5 },
    legend: { position: 'top' as const, itemName: { style: { fontSize: 13 } }, marker: { symbol: 'circle' } },
    tooltip: {
      shared: true,
      showCrosshairs: true,
      customContent: (_t: string, items: any[]) =>
        `<div style="padding:10px 14px;background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.1);font-size:13px">
          ${items.map((i: any) => `<div style="display:flex;align-items:center;gap:8px;padding:2px 0">
            <span style="width:8px;height:8px;border-radius:2px;background:${i.color};flex-shrink:0"></span>
            <span style="color:#8c8c8c">${i.name}</span><b>${i.value?.toLocaleString() ?? '-'}</b>
          </div>`).join('')}
        </div>`,
    },
    xAxis: { line: { style: { stroke: '#f0f0f0' } }, label: { style: { fill: '#8c8c8c', fontSize: 11 } } },
    yAxis: { grid: { line: { style: { stroke: '#f5f5f5', lineDash: [4, 4] } } }, label: { style: { fill: '#8c8c8c', fontSize: 11 } } },
    animation: { appear: { animation: 'wave-in', duration: 800 } },
  };

  const sourceConfig = {
    data: sources.map((s) => ({ name: s.sourceName, value: s.count })),
    angleField: 'value',
    colorField: 'name',
    radius: 0.82,
    innerRadius: 0.62,
    height: 360,
    color: PIE_COLORS,
    statistic: {
      title: { style: { fontSize: 13, color: '#8c8c8c' }, content: '来源数' },
      content: { style: { fontSize: 22, fontWeight: 700, color: '#262626' } },
    },
    label: { type: 'spider' as const, labelHeight: 28, style: { fontSize: 11, fill: '#8c8c8c' } },
    legend: { position: 'bottom' as const, itemName: { style: { fontSize: 12 } }, flipPage: false },
    interactions: [{ type: 'element-active' }],
    animation: { appear: { animation: 'wave-in', duration: 800 } },
  };

  const sectionHeader = (title: string) => (
    <div style={{ fontSize: 15, fontWeight: 600, color: '#262626', marginBottom: 16, letterSpacing: 0.3 }}>{title}</div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      {sectionHeader('实时概览')}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}><MetricCard title="用户总数" value={metrics?.totalUsers} icon={<TeamOutlined />} change={metrics?.totalUsersGrowth} color={CARD_COLORS[0]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="活跃用户" value={metrics?.activeUsers} icon={<UserOutlined />} change={metrics?.activeUsersGrowth} color={CARD_COLORS[1]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="今日事务" value={metrics?.todayOrders} icon={<ClockCircleOutlined />} change={metrics?.todayOrdersGrowth} color={CARD_COLORS[2]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="系统健康度" value={metrics?.systemHealth} icon={<TeamOutlined />} change={metrics?.systemHealthChange} color={CARD_COLORS[3]} /></Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '28px 0 16px' }}>
        {sectionHeader('数据分析')}
        <Segmented size="small" options={RANGE_OPTIONS} value={range} onChange={(v) => setRange(v as string)} />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}><MetricCard title="总用户数" value={summary?.totalUsers} icon={<TeamOutlined />} change={summary?.totalUsersChange} color={CARD_COLORS[0]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="活跃用户" value={summary?.activeUsers} icon={<UserOutlined />} change={summary?.activeUsersChange} color={CARD_COLORS[1]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="总收入" value={summary?.totalRevenue} icon={<DollarOutlined />} change={summary?.totalRevenueChange} color={CARD_COLORS[2]} /></Col>
        <Col xs={12} lg={6}><MetricCard title="转化率" value={summary?.avgConversionRate} icon={<PercentageOutlined />} change={summary?.avgConversionRateChange} color={CARD_COLORS[3]} /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 0 }}>
        <Col xs={24} lg={14}>
          <Card title="增长趋势" style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 20px 16px' } }}>
            {trend.length > 0 ? <Line {...trendConfig} /> : <Empty description="暂无数据" />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="来源分布" style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 20px 16px' } }}>
            {sources.length > 0 ? <Pie {...sourceConfig} /> : <Empty description="暂无数据" />}
          </Card>
        </Col>
      </Row>

      <Card title="最近操作" style={{ borderRadius: 10, marginTop: 16 }} styles={{ body: { padding: '12px 20px 16px' } }}>
        {logs.length > 0 ? (
          <Timeline
            items={logs.slice(0, 8).map((l) => {
              const color = l.actionType === 'DELETE' ? 'red' : l.actionType === 'CREATE' ? 'green' : 'blue';
              return {
                color,
                children: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, color: '#262626' }}>{l.operatorName}</span>
                    <Tag color={color}>{l.actionType}</Tag>
                    <span style={{ color: '#bfbfbf', fontSize: 12, marginLeft: 'auto' }}>
                      {l.operateTime ? dayjs(l.operateTime).format('MM-DD HH:mm') : ''}
                    </span>
                  </div>
                ),
              };
            })}
          />
        ) : (
          <Empty description="暂无操作记录" />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
