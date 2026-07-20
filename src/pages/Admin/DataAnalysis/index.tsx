import {
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { Card, Col, Radio, Row, Table, Tag, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import React, { useMemo, useState } from 'react';

const { Title, Text } = Typography;

/* ============================================================
   TypeScript 接口
   ============================================================ */

interface TrendPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
}

interface RevenuePoint {
  date: string;
  revenue: number;
}

/* ============================================================
   Mock 数据
   ============================================================ */

function genDates(start: string, end: string): string[] {
  const arr: string[] = [];
  const d = new Date(start);
  while (d <= new Date(end)) {
    arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    d.setDate(d.getDate() + 1);
  }
  return arr;
}

function genTrend(): TrendPoint[] {
  const dates = genDates('2024-06-01', '2024-07-06');
  let nb = 100, ab = 180;
  return dates.map((date, i) => {
    nb += Math.round(Math.random() * 20 - 5 + (i % 7 === 0 ? 15 : 0));
    ab += Math.round(Math.random() * 25 - 8 + (i % 5 === 0 ? 20 : 0));
    return { date, newUsers: nb, activeUsers: ab };
  });
}

function genRevenue(): RevenuePoint[] {
  const dates = genDates('2024-06-01', '2024-07-06');
  let v = 10000;
  return dates.map((date, i) => {
    v += Math.round(Math.random() * 1500 - 200 + (i % 6 === 0 ? 3000 : 0));
    return { date, revenue: v };
  });
}

const SOURCE = [
  { name: '自然搜索', value: 38, color: '#3b82f6' },
  { name: '社交媒体', value: 27, color: '#8b5cf6' },
  { name: '直接访问', value: 18, color: '#10b981' },
  { name: '推荐链接', value: 12, color: '#f97316' },
  { name: '其他', value: 5, color: '#ef4444' },
];

const CONV = [
  { channel: '搜索', impressions: 8500, conversions: 2100 },
  { channel: '社交', impressions: 6200, conversions: 1600 },
  { channel: '邮件', impressions: 3800, conversions: 1200 },
  { channel: '推送', impressions: 2800, conversions: 650 },
  { channel: '广告', impressions: 4800, conversions: 980 },
];

const TABLE_DATA = [
  { key: '1', label: '总用户数', value: '128,450', change: '+12.4%', up: true },
  { key: '2', label: '活跃用户', value: '89,320', change: '+8.7%', up: true },
  { key: '3', label: '总收入', value: '¥396,000', change: '+23.1%', up: true },
  { key: '4', label: '平均转化率', value: '18.6%', change: '-1.2%', up: false },
];

/* ============================================================
   公共 ECharts 配置
   ============================================================ */

const GRID: EChartsOption['grid'] = { top: 40, right: 20, bottom: 20, left: 40, containLabel: true };

const TIP: EChartsOption['tooltip'] = {
  trigger: 'axis',
  backgroundColor: '#fff',
  borderWidth: 0,
  padding: [10, 14],
  extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 6px;',
};

const xAxis = (data: string[]) => ({
  type: 'category' as const,
  data,
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { show: false },
  axisLabel: { fontSize: 11, color: '#9ca3af' },
});

const yAxis = (fmt?: (v: number) => string) => ({
  type: 'value' as const,
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { show: true, lineStyle: { type: 'dashed' as const, color: '#f3f4f6' } },
  axisLabel: { fontSize: 11, color: '#9ca3af', ...(fmt ? { formatter: fmt } : {}) },
});

/* ============================================================
   图表 Option
   ============================================================ */

function useLine(data: TrendPoint[]): EChartsOption {
  return useMemo<EChartsOption>(() => ({
    tooltip: TIP, grid: GRID,
    xAxis: xAxis(data.map(d => d.date)),
    yAxis: yAxis(),
    legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: '#6b7280' } },
    series: [
      {
        name: '新增用户', type: 'line', smooth: true, symbol: 'none',
        lineStyle: { width: 2.5, color: '#3b82f6' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.15)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) },
        data: data.map(d => d.newUsers),
      },
      {
        name: '活跃用户', type: 'line', smooth: true, symbol: 'none',
        lineStyle: { width: 2.5, color: '#10b981' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.15)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) },
        data: data.map(d => d.activeUsers),
      },
    ],
  }), [data]);
}

function usePie(): EChartsOption {
  return useMemo<EChartsOption>(() => ({
    tooltip: { trigger: 'item', backgroundColor: '#fff', borderWidth: 0, padding: [10, 14], extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 6px;', formatter: '{b}: {c}%' as any },
    legend: { orient: 'vertical', right: 0, top: 'center', icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: '#6b7280' } },
    series: [{ type: 'pie', radius: ['40%', '70%'], center: ['48%', '50%'], avoidLabelOverlap: true, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' } }, data: SOURCE.map(s => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })) }],
  }), []);
}

function useBar(): EChartsOption {
  return useMemo<EChartsOption>(() => ({
    tooltip: TIP, grid: GRID,
    xAxis: xAxis(CONV.map(d => d.channel)),
    yAxis: yAxis(),
    legend: { bottom: 0, left: 'center', icon: 'rect', itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 12, color: '#6b7280' } },
    series: [
      { name: '展示', type: 'bar', barWidth: '40%', barGap: '20%', itemStyle: { color: '#bfdbfe', borderRadius: [4, 4, 0, 0] }, data: CONV.map(d => d.impressions) },
      { name: '转化', type: 'bar', barWidth: '40%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: CONV.map(d => d.conversions) },
    ],
  }), []);
}

function useArea(data: RevenuePoint[]): EChartsOption {
  return useMemo<EChartsOption>(() => ({
    tooltip: TIP, grid: GRID,
    xAxis: xAxis(data.map(d => d.date)),
    yAxis: yAxis(v => v >= 10000 ? `${(v / 10000).toFixed(0)}w` : `${v}`),
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 2.5, color: '#f97316' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(249,115,22,0.3)' }, { offset: 1, color: 'rgba(249,115,22,0.01)' }]) }, data: data.map(d => d.revenue) }],
  }), [data]);
}

/* ============================================================
   表格列
   ============================================================ */

const COLUMNS = [
  { title: '指标', dataIndex: 'label', key: 'label' },
  { title: '数值', dataIndex: 'value', key: 'value', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
  {
    title: '环比变化', key: 'change',
    render: (_: unknown, r: typeof TABLE_DATA[number]) => (
      <span style={{ color: r.up ? '#22c55e' : '#ef4444' }}>
        {r.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {r.change}
      </span>
    ),
  },
  {
    title: '趋势', key: 'trend',
    render: (_: unknown, r: typeof TABLE_DATA[number]) => (
      <Tag color={r.up ? 'green' : 'red'}>{r.up ? '上升' : '下降'}</Tag>
    ),
  },
];

/* ============================================================
   主组件（纯内容区，适配 ProLayout）
   ============================================================ */

const DataAnalysis: React.FC = () => {
  const [range, setRange] = useState('近30天');

  const trend = useMemo(() => genTrend(), []);
  const revenue = useMemo(() => genRevenue(), []);

  const optLine = useLine(trend);
  const optPie = usePie();
  const optBar = useBar();
  const optArea = useArea(revenue);

  return (
    <div style={{ background: '#f0f2f5', padding: '0 24px 24px', minHeight: '100vh' }}>
      {/* 标题行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>数据分析</Title>
          <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>全渠道业务数据概览</Text>
        </div>
        <Radio.Group value={range} onChange={e => setRange(e.target.value)} optionType="button" buttonStyle="solid" size="small">
          <Radio.Button value="今日">今日</Radio.Button>
          <Radio.Button value="近7天">近7天</Radio.Button>
          <Radio.Button value="近30天">近30天</Radio.Button>
          <Radio.Button value="自定义">自定义</Radio.Button>
        </Radio.Group>
      </div>

        {/* 图表网格 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title={<span style={{ fontSize: 14, fontWeight: 600 }}>用户增长趋势</span>} styles={{ body: { padding: 16 } }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>新增用户 & 活跃用户对比</Text>
              <ReactECharts option={optLine} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<span style={{ fontSize: 14, fontWeight: 600 }}>用户来源分布</span>} styles={{ body: { padding: 16 } }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>各渠道用户占比</Text>
              <ReactECharts option={optPie} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<span style={{ fontSize: 14, fontWeight: 600 }}>各渠道转化率</span>} styles={{ body: { padding: 16 } }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>展示量与转化量对比</Text>
              <ReactECharts option={optBar} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<span style={{ fontSize: 14, fontWeight: 600 }}>收入趋势</span>} styles={{ body: { padding: 16 } }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>近期收入走势 (元)</Text>
              <ReactECharts option={optArea} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>

        {/* 表格 */}
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>数据汇总</span>}
          style={{ marginTop: 24 }}
          styles={{ body: { padding: 0 } }}
        >
          <Table columns={COLUMNS} dataSource={TABLE_DATA} pagination={false} style={{ whiteSpace: 'nowrap' }} />
        </Card>
    </div>
  );
};

export default DataAnalysis;
