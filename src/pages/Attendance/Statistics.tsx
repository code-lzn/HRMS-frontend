import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Button, Tag, Table, Space, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  getDepartmentStatsUsingGet,
  getLeaveTypeDistributionUsingGet,
  getAttendanceTrendUsingGet,
  getLateEarlyRankingUsingGet,
} from '@/api/attendanceStatsController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';

const STATUS_COLOR_MAP: Record<string, string> = {
  NORMAL: '#52c41a',
  LATE: '#faad14',
  EARLY: '#fa8c16',
  MISSING: '#bfbfbf',
  LEAVE: '#1890ff',
  ABSENT: '#ff4d4f',
  MISS_IN: '#722ed1',
  MISS_OUT: '#1890ff',
};

const STATUS_TEXT_MAP: Record<string, string> = {
  NORMAL: '正常',
  LATE: '迟到',
  EARLY: '早退',
  MISSING: '缺卡',
  LEAVE: '请假',
  ABSENT: '旷工',
  MISS_IN: '上班缺卡',
  MISS_OUT: '下班缺卡',
};

interface DepartmentOption {
  value: string;
  label: string;
}

interface TrendData {
  months: string[];
  rates: number[];
}

interface LeaveTypeData {
  leaveTypes: string[];
  counts: number[];
  percentages: number[];
}

interface LateEarlyData {
  departmentName: string;
  lateCount: number;
  earlyCount: number;
}

interface DepartmentStats {
  departmentId: number;
  departmentName: string;
  attendanceRate: number;
  lateRate: number;
  leaveRate: number;
  employeeCount: number;
  lateCount: number;
  earlyCount: number;
}

const Statistics: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [trendData, setTrendData] = useState<TrendData>({ months: [], rates: [] });
  const [leaveData, setLeaveData] = useState<LeaveTypeData>({ leaveTypes: [], counts: [], percentages: [] });
  const [lateEarlyData, setLateEarlyData] = useState<LateEarlyData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);

  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      fetchStatsData();
    }
  }, [selectedMonth, selectedDept, departments]);

  const fetchDepartmentList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      if (res.code === 0 && res.data) {
        const options: DepartmentOption[] = [{ value: '', label: '全部部门' }];
        const traverse = (nodes: any[]) => {
          nodes.forEach(node => {
            options.push({ value: node.id, label: node.departmentName });
            if (node.children) {
              traverse(node.children);
            }
          });
        };
        traverse(res.data);
        setDepartments(options);
      }
    } catch (e) {
      console.error('获取部门列表失败:', e);
    }
  };

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const [trendRes, leaveRes, lateEarlyRes, deptStatsRes] = await Promise.all([
        getAttendanceTrendUsingGet({ 
          departmentId: selectedDept ? Number(selectedDept) : 0, 
          months: 6 
        }),
        getLeaveTypeDistributionUsingGet({ month: selectedMonth }),
        getLateEarlyRankingUsingGet({ month: selectedMonth }),
        getDepartmentStatsUsingGet({ month: selectedMonth }),
      ]);

      if (trendRes.code === 0 && trendRes.data) {
        setTrendData({
          months: trendRes.data.months || [],
          rates: trendRes.data.rates || [],
        });
      }

      if (leaveRes.code === 0 && leaveRes.data) {
        setLeaveData({
          leaveTypes: leaveRes.data.leaveTypes || [],
          counts: leaveRes.data.counts || [],
          percentages: leaveRes.data.percentages || [],
        });
      }

      if (deptStatsRes.code === 0 && deptStatsRes.data) {
        setLateEarlyData(deptStatsRes.data.map((d: DepartmentStats) => ({
          departmentName: d.departmentName,
          lateCount: d.lateCount,
          earlyCount: d.earlyCount,
        })));
        setDepartmentStats(deptStatsRes.data);
      }

      if (lateEarlyRes.code === 0 && lateEarlyRes.data) {
        console.log('Late early ranking:', lateEarlyRes.data);
      }
    } catch (e) {
      console.error('获取统计数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartRef1.current && trendData.months.length > 0) {
      const chart = echarts.init(chartRef1.current);
      chart.setOption({
        title: { text: '近6个月出勤率趋势', left: 'center', fontSize: 14 },
        xAxis: { type: 'category', data: trendData.months },
        yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
          type: 'line',
          data: trendData.rates,
          smooth: true,
          lineStyle: { color: '#1890ff', width: 3 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.3)' },
            { offset: 1, color: 'rgba(24,144,255,0.05)' },
          ]) },
        }],
      });
      return () => chart.dispose();
    }
  }, [trendData]);

  useEffect(() => {
    if (chartRef2.current && leaveData.leaveTypes.length > 0) {
      const chart = echarts.init(chartRef2.current);
      const pieData = leaveData.leaveTypes.map((name, index) => ({
        name,
        value: leaveData.percentages[index] || 0,
        itemStyle: { color: ['#52c41a', '#faad14', '#1890ff', '#722ed1', '#ff4d4f', '#fa8c16', '#bfbfbf'][index % 7] },
      }));
      chart.setOption({
        title: { text: '当月请假类型占比', left: 'center', fontSize: 14 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: pieData,
          label: { formatter: '{b}: {c}%' },
        }],
      });
      return () => chart.dispose();
    }
  }, [leaveData]);

  useEffect(() => {
    if (chartRef3.current && lateEarlyData.length > 0) {
      const chart = echarts.init(chartRef3.current);
      chart.setOption({
        title: { text: '各部门迟到早退人次', left: 'center', fontSize: 14 },
        xAxis: { type: 'category', data: lateEarlyData.map((d) => d.departmentName) },
        yAxis: { type: 'value' },
        series: [
          { name: '迟到', type: 'bar', data: lateEarlyData.map((d) => d.lateCount), itemStyle: { color: '#faad14' } },
          { name: '早退', type: 'bar', data: lateEarlyData.map((d) => d.earlyCount), itemStyle: { color: '#fa8c16' } },
        ],
      });
      return () => chart.dispose();
    }
  }, [lateEarlyData]);

  const columns = [
    { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
    { title: '部门人数', dataIndex: 'employeeCount', key: 'employeeCount' },
    { 
      title: '出勤率', 
      dataIndex: 'attendanceRate', 
      key: 'attendanceRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
    { 
      title: '迟到率', 
      dataIndex: 'lateRate', 
      key: 'lateRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
    { 
      title: '请假率', 
      dataIndex: 'leaveRate', 
      key: 'leaveRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
    { title: '迟到人次', dataIndex: 'lateCount', key: 'lateCount' },
    { title: '早退人次', dataIndex: 'earlyCount', key: 'earlyCount' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>考勤统计</h1>
          <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>查看考勤数据统计与明细</span>
        </div>
        <Space>
          <Select 
            placeholder="选择部门" 
            style={{ width: 150 }} 
            value={selectedDept} 
            onChange={setSelectedDept} 
            allowClear
            options={departments}
          />
          <Select 
            placeholder="选择月份" 
            style={{ width: 120 }} 
            value={selectedMonth} 
            onChange={setSelectedMonth}
            options={Array.from({ length: 6 }, (_, i) => {
              const date = dayjs().subtract(i, 'month');
              return { value: date.format('YYYY-MM'), label: date.format('YYYY年M月') };
            })}
          />
          <Button type="primary" icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div ref={chartRef1} style={{ height: 280 }} />
          </Card>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div ref={chartRef2} style={{ height: 280 }} />
          </Card>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div ref={chartRef3} style={{ height: 280 }} />
          </Card>
          <Card title="部门考勤概况" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table 
              columns={columns} 
              dataSource={departmentStats} 
              rowKey="departmentId" 
              pagination={false}
              size="small"
            />
          </Card>
        </div>
      </Spin>
    </div>
  );
};

export default Statistics;
