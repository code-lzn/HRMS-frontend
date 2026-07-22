import {
  getAttendanceRateUsingGet,
  getLateEarlyRankingUsingGet,
  getLeaveDistributionUsingGet,
} from '@/api/attendanceStatisticsController';
import {
  ClockCircleOutlined,
  PieChartOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Column, Line, Pie } from '@antv/g2plot';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Result, Row, Select, Space } from 'antd';
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
        nice: true,
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
      label: {
        type: 'spider',
        content: '{name} {percentage}',
      },
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
  const year = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  // ---- 出勤率 ----
  const {
    data: rateResp,
    isLoading: rateLoading,
    isError: rateError,
    error: rateErr,
  } = useQuery({
    queryKey: ['attendance-stats', 'rate', months],
    queryFn: async () => getAttendanceRateUsingGet({ months }),
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
          rate: Number(s.rates?.[i] ?? 0) * 100,
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
    error: rankErr,
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
    error: distErr,
  } = useQuery({
    queryKey: ['attendance-stats', 'distribution', year, currentMonth],
    queryFn: async () =>
      getLeaveDistributionUsingGet({ year, month: currentMonth }),
  });
  const distList = (distResp?.data ?? []) as API.LeaveDistributionVO[];

  const pieData = useMemo(
    () =>
      distList
        .map((d) => ({
          type: d.leaveTypeDesc ?? '',
          days: Number(d.days ?? 0),
          percentage: Number(d.percentage ?? 0),
        }))
        .filter((d) => d.days > 0),
    [distList],
  );

  const pieInit = usePieChart('g2-pie-chart');
  useEffect(() => {
    if (!distLoading && pieData.length) pieInit(pieData);
  }, [distLoading, pieData, pieInit]);

  // 权限判断
  const isRatePermErr = (rateErr as any)?.code === 40101;
  const isRankPermErr = (rankErr as any)?.code === 40101;
  const isDistPermErr = (distErr as any)?.code === 40101;

  const renderError = (isPerm: boolean) => (
    <Result
      status={isPerm ? '403' : 'error'}
      title={isPerm ? '无权限' : '加载失败'}
      subTitle={
        isPerm ? '您没有权限查看该数据，请联系管理员' : '请检查后端服务'
      }
    />
  );

  return (
    <PageContainer header={{ breadcrumb: {}, title: '考勤统计' }}>
      {/* 筛选栏 */}
      <Card
        variant="borderless"
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
                { value: 3, label: '近 3 个月' },
                { value: 6, label: '近 6 个月' },
                { value: 12, label: '近 12 个月' },
              ]}
            />
          </Space>
        </Space>
      </Card>

      {/* 图表区 */}
      <Row gutter={16}>
        {/* 出勤率折线图 */}
        <Col span={24}>
          <Card
            variant="borderless"
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <RiseOutlined />
                出勤率趋势
              </Space>
            }
          >
            {rateError ? (
              renderError(isRatePermErr)
            ) : rateLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div
                id="g2-rate-chart"
                dir="ltr"
                style={{ height: 350, direction: 'ltr' as any }}
              />
            )}
          </Card>
        </Col>

        {/* 迟到早退排名 */}
        <Col span={12}>
          <Card
            variant="borderless"
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <TeamOutlined />
                迟到早退排名（按部门）
              </Space>
            }
          >
            {rankError ? (
              renderError(isRankPermErr)
            ) : rankLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div
                id="g2-rank-chart"
                dir="ltr"
                style={{ height: 350, direction: 'ltr' as any }}
              />
            )}
          </Card>
        </Col>

        {/* 请假分布 */}
        <Col span={12}>
          <Card
            variant="borderless"
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <PieChartOutlined />
                请假类型分布
              </Space>
            }
          >
            {distError ? (
              renderError(isDistPermErr)
            ) : distLoading ? (
              <div
                style={{ height: 350, background: '#fafafa', borderRadius: 8 }}
              />
            ) : (
              <div
                id="g2-pie-chart"
                dir="ltr"
                style={{ height: 350, direction: 'ltr' as any }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AttendanceStatistics;
