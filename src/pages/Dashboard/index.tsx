import { getGrowthTrendUsingGet, getSourceDistributionUsingGet } from '@/api/analyticsController';
import { getMetricsUsingGet, getRecentLogsUsingGet } from '@/api/dashboardController';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Empty, Row, Spin, Statistic, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import React, { useEffect, useMemo, useState } from 'react';

const METRIC_COLORS = [
  { hex: '#1677ff', bg: '#f0f5ff' },
  { hex: '#52c41a', bg: '#f6ffed' },
  { hex: '#fa8c16', bg: '#fff7e6' },
  { hex: '#722ed1', bg: '#f9f0ff' },
];

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<API.DashboardMetricsVO | null>(null);
  const [trend, setTrend] = useState<API.GrowthTrendVO[]>([]);
  const [sources, setSources] = useState<API.SourceDistributionVO[]>([]);
  const [logs, setLogs] = useState<API.RecentLogVO[]>([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getMetricsUsingGet(),
      getGrowthTrendUsingGet({ range: '30days' }),
      getSourceDistributionUsingGet({ range: '30days' }),
      getRecentLogsUsingGet(),
    ]);
    if (results[0].status === 'fulfilled') setMetrics(results[0].value?.data ?? null);
    if (results[1].status === 'fulfilled') setTrend(results[1].value?.data ?? []);
    if (results[2].status === 'fulfilled') setSources(results[2].value?.data ?? []);
    if (results[3].status === 'fulfilled') setLogs(results[3].value?.data ?? []);
    setLoading(false);
  };

  // ---- ECharts 增长趋势 ----
  const trendOption = useMemo<EChartsOption>(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 13 },
      padding: [8, 12],
    },
    legend: {
      bottom: 0, left: 'center', icon: 'rect', itemWidth: 12, itemHeight: 2,
      textStyle: { fontSize: 12, color: '#666' },
    },
    grid: { top: 12, right: 16, bottom: 40, left: 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.map((t) => t.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#999' },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'solid' } },
      axisLabel: { fontSize: 11, color: '#999' },
    },
    series: [
      {
        name: '用户数', type: 'line', smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#1677ff' },
        data: trend.map((t) => t.userCount),
      },
      {
        name: '收入', type: 'line', smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#52c41a' },
        data: trend.map((t) => t.revenue),
      },
    ],
  }), [trend]);

  // ---- ECharts 来源分布 ----
  const sourceOption = useMemo<EChartsOption>(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 13 },
      padding: [8, 12],
    },
    legend: {
      bottom: 0, left: 'center', icon: 'circle', itemWidth: 6, itemHeight: 6,
      textStyle: { fontSize: 12, color: '#666' },
    },
    color: ['#1677ff', '#52c41a', '#faad14', '#ff7a45', '#597ef7', '#13c2c2', '#b37feb'],
    series: [{
      type: 'pie',
      radius: ['60%', '80%'],
      center: ['50%', '46%'],
      data: sources.map((s) => ({ name: s.sourceName, value: s.count })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13 } },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
    }],
  }), [sources]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* 数据概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { label: '用户总数', value: metrics?.totalUsers, change: metrics?.totalUsersGrowth, icon: <TeamOutlined />, idx: 0 },
          { label: '活跃用户', value: metrics?.activeUsers, change: metrics?.activeUsersGrowth, icon: <UserOutlined />, idx: 1 },
          { label: '今日事务', value: metrics?.todayOrders, change: metrics?.todayOrdersGrowth, icon: <ClockCircleOutlined />, idx: 2 },
          { label: '系统健康度', value: metrics?.systemHealth, change: metrics?.systemHealthChange, icon: <TeamOutlined />, idx: 3 },
        ].map((m) => (
          <Col xs={12} lg={6} key={m.idx}>
            <Card
              size="small"
              styles={{ body: { padding: '14px 18px' } }}
              style={{ border: '1px solid #f0f0f0', borderRadius: 6 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#8c8c8c' }}>{m.label}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 4, fontSize: 14,
                  color: METRIC_COLORS[m.idx].hex, background: METRIC_COLORS[m.idx].bg,
                }}>
                  {m.icon}
                </span>
              </div>
              <Statistic
                value={m.value ?? 0}
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a' }}
                suffix={m.change != null && m.change !== 0 && (
                  <span style={{ fontSize: 13, color: m.change > 0 ? '#52c41a' : '#ff4d4f', marginLeft: 6 }}>
                    {m.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(m.change)}%
                  </span>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>增长趋势</span>}
            size="small"
            style={{ border: '1px solid #f0f0f0', borderRadius: 6, marginBottom: 16 }}
            styles={{ body: { padding: '8px 12px 4px' } }}
          >
            {trend.length > 0 ? (
              <ReactECharts option={trendOption} style={{ height: 300 }} />
            ) : <Empty description="暂无数据" />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>来源分布</span>}
            size="small"
            style={{ border: '1px solid #f0f0f0', borderRadius: 6, marginBottom: 16 }}
            styles={{ body: { padding: '8px 12px 4px' } }}
          >
            {sources.length > 0 ? (
              <ReactECharts option={sourceOption} style={{ height: 300 }} />
            ) : <Empty description="暂无数据" />}
          </Card>
        </Col>
      </Row>

      {/* 最近操作 */}
      <Card
        title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>最近操作</span>}
        size="small"
        style={{ border: '1px solid #f0f0f0', borderRadius: 6 }}
        styles={{ body: { padding: '8px 12px 4px' } }}
      >
        {logs.length > 0 ? (
          <Timeline
            style={{ paddingTop: 8 }}
            items={logs.slice(0, 8).map((l) => {
              const color = l.actionType === 'DELETE' ? 'red' : l.actionType === 'CREATE' ? 'green' : 'blue';
              return {
                color,
                children: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                    <span style={{ fontWeight: 500, color: '#333' }}>{l.operatorName}</span>
                    <Tag color={color} style={{ fontSize: 11, lineHeight: '18px' }}>{l.actionType}</Tag>
                    <span style={{ color: '#bfbfbf', fontSize: 12, marginLeft: 'auto' }}>
                      {l.operateTime ? dayjs(l.operateTime).format('MM-DD HH:mm') : ''}
                    </span>
                  </div>
                ),
              };
            })}
          />
        ) : <Empty description="暂无操作记录" />}
      </Card>
    </div>
  );
};

export default DashboardPage;
