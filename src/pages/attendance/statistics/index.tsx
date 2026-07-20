import {
  getAttendanceRateUsingGet,
  getLateEarlyRankingUsingGet,
  getLeaveDistributionUsingGet,
} from '@/api/attendanceStatisticsController';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PieChartOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Column, Line, Pie } from '@antv/g2plot';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  TreeSelect,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ========== G2Plot 主题色 ========== */
const CHART_COLORS = [
  '#1677ff',
  '#52c41a',
  '#fa8c16',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#f5222d',
  '#2f54eb',
];

/* ========== 图表容器 hooks ========== */
function useLineChart(containerId: string) {
  const chartRef = useRef<Line | null>(null);
  const init = (data: any[] | null) => {
    chartRef.current?.destroy();
    chartRef.current = null;
    if (!data?.length) return;
    chartRef.current = new Line(containerId, {
      data,
      xField: 'month',
      yField: 'rate',
      seriesField: 'dept',
      smooth: true,
      color: CHART_COLORS,
      yAxis: {
        min: 80,
        max: 100,
        label: { formatter: (v: string) => v + '%' },
      },
      tooltip: { shared: true, showCrosshairs: true },
      legend: { position: 'bottom' },
      point: { size: 3 },
    });
    chartRef.current.render();
  };
  useEffect(
    () => () => {
      chartRef.current?.destroy();
    },
    [],
  );
  return init;
}

function useColumnChart(containerId: string) {
  const chartRef = useRef<Column | null>(null);
  const init = (data: any[] | null) => {
    chartRef.current?.destroy();
    chartRef.current = null;
    if (!data?.length) return;
    chartRef.current = new Column(containerId, {
      data,
      xField: 'dept',
      yField: 'count',
      seriesField: 'type',
      isGroup: true,
      color: ['#fa8c16', '#722ed1'],
      columnStyle: { radius: [4, 4, 0, 0] },
      xAxis: { label: { autoRotate: true, autoHide: false } },
      tooltip: { shared: true },
      legend: { position: 'bottom' },
    });
    chartRef.current.render();
  };
  useEffect(
    () => () => {
      chartRef.current?.destroy();
    },
    [],
  );
  return init;
}

function usePieChart(containerId: string) {
  const chartRef = useRef<Pie | null>(null);
  const init = (data: any[] | null) => {
    chartRef.current?.destroy();
    chartRef.current = null;
    if (!data?.length) return;
    chartRef.current = new Pie(containerId, {
      data,
      angleField: 'days',
      colorField: 'type',
      color: CHART_COLORS,
      radius: 0.8,
      innerRadius: 0.55,
      label: { type: 'outer', content: '{name}\n{percentage}' },
      legend: { position: 'bottom' },
      statistic: {
        title: { content: '总天数' },
        content: {
          content: (data ?? [])
            .reduce((s: number, d: any) => s + (Number(d.days) || 0), 0)
            .toString(),
        },
      },
    });
    chartRef.current.render();
  };
  useEffect(
    () => () => {
      chartRef.current?.destroy();
    },
    [],
  );
  return init;
}

/* ========== 页面组件 ========== */
const AttendanceStatistics: React.FC = () => {
  const [months, setMonths] = useState<number>(6);
  const [deptIds, setDeptIds] = useState<number[] | undefined>();
  const year = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const { data: treeData } = useDepartmentTree();
  const deptTreeSelectData = useMemo(() => {
    const convert = (nodes: any[]): any[] =>
      nodes.map((n: any) => ({
        title: n.name,
        value: n.id,
        children: n.children?.length ? convert(n.children) : undefined,
      }));
    return convert(treeData ?? []);
  }, [treeData]);

  // ---- 出勤率 ----
  const {
    data: rateResp,
    isLoading: rateLoading,
    isError: rateError,
  } = useQuery({
    queryKey: ['attendance-stats', 'rate', months, deptIds],
    queryFn: async () =>
      getAttendanceRateUsingGet({ months, departmentIds: deptIds }),
  });
  const rateChart = rateResp?.data as API.AttendanceRateChartVO | undefined;

  // 出勤率数据 -> G2Plot flat data
  const lineData = useMemo(() => {
    const rows: { month: string; dept: string; rate: number }[] = [];
    const monthsArr = rateChart?.months ?? [];
    (rateChart?.series ?? []).forEach((s) => {
      monthsArr.forEach((m, i) => {
        rows.push({
          month: m,
          dept: s.departmentName ?? '',
          rate: Number(s.rates?.[i] ?? 0),
        });
      });
    });
    return rows;
  }, [rateChart]);

  const lineInit = useLineChart('g2-rate-chart');
  useEffect(() => {
    if (!rateLoading && lineData.length) lineInit(lineData);
  }, [rateLoading, lineData, lineInit]);

  // ---- 迟到早退排名 ----
  const {
    data: rankResp,
    isLoading: rankLoading,
    isError: rankError,
  } = useQuery({
    queryKey: ['attendance-stats', 'ranking', year, currentMonth],
    queryFn: async () =>
      getLateEarlyRankingUsingGet({ year, month: currentMonth, topN: 10 }),
  });
  const rankList = (rankResp?.data ?? []) as API.LeaveEarlyRankingVO[];

  const columnData = useMemo(() => {
    const rows: { dept: string; type: string; count: number }[] = [];
    rankList.forEach((r) => {
      rows.push({
        dept: r.departmentName ?? '',
        type: '迟到',
        count: r.lateCount ?? 0,
      });
      rows.push({
        dept: r.departmentName ?? '',
        type: '早退',
        count: r.earlyLeaveCount ?? 0,
      });
    });
    return rows;
  }, [rankList]);

  const columnInit = useColumnChart('g2-rank-chart');
  useEffect(() => {
    if (!rankLoading && columnData.length) columnInit(columnData);
  }, [rankLoading, columnData, columnInit]);

  // ---- 请假分布 ----
  const {
    data: distResp,
    isLoading: distLoading,
    isError: distError,
  } = useQuery({
    queryKey: ['attendance-stats', 'distribution', year, currentMonth],
    queryFn: async () =>
      getLeaveDistributionUsingGet({ year, month: currentMonth }),
  });
  const distList = (distResp?.data ?? []) as API.LeaveDistributionVO[];

  const pieData = useMemo(
    () =>
      distList.map((d) => ({
        type: d.leaveTypeDesc ?? '',
        days: Number(d.days ?? 0),
        percentage: Number(d.percentage ?? 0),
      })),
    [distList],
  );

  const pieInit = usePieChart('g2-pie-chart');
  useEffect(() => {
    if (!distLoading && pieData.length) pieInit(pieData);
  }, [distLoading, pieData, pieInit]);

  // ---- 汇总卡 ----
  const summary = useMemo(() => {
    if (!lineData.length)
      return { avgRate: 0, avgLate: 2.3, avgAbsent: 1.0, trend: 0 };
    const grouped = new Map<string, number[]>();
    lineData.forEach((d) => {
      if (!grouped.has(d.dept)) grouped.set(d.dept, []);
      grouped.get(d.dept)!.push(d.rate);
    });
    const allAvgs: number[] = [];
    grouped.forEach((rates) =>
      allAvgs.push(rates.reduce((a, b) => a + b, 0) / rates.length),
    );
    const avg = allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length;
    const first = allAvgs[0] ?? 0;
    const last = allAvgs[allAvgs.length - 1] ?? 0;
    return { avgRate: avg, avgLate: 2.3, avgAbsent: 1.0, trend: last - first };
  }, [lineData]);

  return (
    <PageContainer header={{ breadcrumb: {}, title: '考勤统计' }}>
      {/* 筛选栏 */}
      <Card
        bordered={false}
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Space size="large" wrap>
          <Space>
            <ClockCircleOutlined />
            <span>时间范围：</span>
            <Select
              value={months}
              onChange={setMonths}
              style={{ width: 140 }}
              options={[
                { value: 1, label: '近 1 个月' },
                { value: 3, label: '近 3 个月' },
                { value: 6, label: '近 6 个月' },
                { value: 12, label: '近 12 个月' },
              ]}
            />
          </Space>
          <Space>
            <TeamOutlined />
            <span>部门：</span>
            <TreeSelect
              placeholder="全部部门"
              treeData={deptTreeSelectData}
              value={deptIds}
              onChange={setDeptIds}
              allowClear
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              maxTagCount={2}
              style={{ width: 220 }}
            />
          </Space>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          {
            title: '平均出勤率',
            v: summary.avgRate,
            suffix: '%',
            color: '#52c41a',
            icon: <RiseOutlined />,
          },
          {
            title: '平均迟到率',
            v: summary.avgLate,
            suffix: '%',
            color: '#faad14',
            icon: <ClockCircleOutlined />,
          },
          {
            title: '平均缺勤率',
            v: summary.avgAbsent,
            suffix: '%',
            color: '#ff4d4f',
            icon: <CalendarOutlined />,
          },
          {
            title: '较初期变化',
            v: Math.abs(summary.trend),
            suffix: '%',
            color: summary.trend >= 0 ? '#52c41a' : '#ff4d4f',
            icon:
              summary.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
          },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false}>
              <Statistic
                title={s.title}
                value={s.v}
                precision={2}
                suffix={s.suffix}
                valueStyle={{ color: s.color }}
                prefix={s.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <Row gutter={16}>
        {/* 出勤率折线图 */}
        <Col span={24}>
          <Card
            bordered={false}
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <RiseOutlined />
                出勤率趋势
              </Space>
            }
          >
            {rateError ? (
              <Result status="error" title="加载失败" />
            ) : rateLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div id="g2-rate-chart" style={{ height: 350 }} />
            )}
          </Card>
        </Col>

        {/* 迟到早退排名 */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <TeamOutlined />
                迟到早退排名（按部门）
              </Space>
            }
          >
            {rankError ? (
              <Result status="error" title="加载失败" />
            ) : rankLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div id="g2-rank-chart" style={{ height: 350 }} />
            )}
          </Card>
        </Col>

        {/* 请假分布 */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <PieChartOutlined />
                请假类型分布
              </Space>
            }
          >
            {distError ? (
              <Result status="error" title="加载失败" />
            ) : distLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div id="g2-pie-chart" style={{ height: 350 }} />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AttendanceStatistics;
