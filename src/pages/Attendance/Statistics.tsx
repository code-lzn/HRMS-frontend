import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Button, Tag, Table, Space, Spin, Row, Col, Statistic } from 'antd';
import {
  DownloadOutlined, CalendarOutlined, ClockCircleOutlined,
  WarningOutlined, StopOutlined, FileTextOutlined,
  CoffeeOutlined, GiftOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  getDepartmentStatsUsingGet,
  getLeaveTypeDistributionUsingGet,
  getAttendanceTrendUsingGet,
  getLateEarlyRankingUsingGet,
  getPersonalTrendUsingGet,
  getPersonalLeaveDistributionUsingGet,
  getPersonalStatsUsingGet,
} from '@/api/attendanceStatsController';
import { getMonthRecordsUsingGet } from '@/api/attendanceController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import usePermission from '@/hooks/usePermission';

const STATUS_COLOR_MAP: Record<string, string> = {
  NORMAL: '#52c41a', LATE: '#faad14', EARLY: '#fa8c16',
  MISSING: '#bfbfbf', LEAVE: '#1890ff', ABSENT: '#ff4d4f',
  MISS_IN: '#722ed1', MISS_OUT: '#1890ff', REST: '#87d068',
};

const STATUS_TEXT_MAP: Record<string, string> = {
  NORMAL: '正常', LATE: '迟到', EARLY: '早退', MISSING: '缺卡',
  LEAVE: '请假', ABSENT: '旷工', MISS_IN: '上班缺卡', MISS_OUT: '下班缺卡',
};

const STATUS_NUM_MAP: Record<number, string> = {
  0: 'NORMAL', 1: 'LATE', 2: 'EARLY', 3: 'MISSING', 4: 'LEAVE', 5: 'ABSENT',
};

interface DepartmentOption { value: string; label: string; }
interface TrendData { months: string[]; rates: number[]; }
interface LeaveTypeData { leaveTypes: string[]; counts: number[]; percentages: number[]; }
interface DepartmentStats {
  departmentId: number; departmentName: string; attendanceRate: number;
  lateRate: number; leaveRate: number; employeeCount: number;
  lateCount: number; earlyCount: number;
}

interface PersonalStats {
  totalDays: number; normalDays: number; lateDays: number;
  earlyDays: number; missingDays: number; leaveDays: number;
  absentDays: number; attendanceRate: number; overtimeHours: number;
  annualLeaveBalance: number; totalLeaveDays: number;
}

interface CalendarData {
  month: string; normalDays: number; lateDays: number;
  leaveDays: number; missingDays: number;
  dailyStatus: Record<string, number>;
}

const Statistics: React.FC = () => {
  const { isAdmin, dataScope } = usePermission();
  const canViewAllStats = isAdmin || dataScope <= 4;
  const isPersonal = !canViewAllStats; // 普通员工(dataScope=5)

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [trendData, setTrendData] = useState<TrendData>({ months: [], rates: [] });
  const [leaveData, setLeaveData] = useState<LeaveTypeData>({ leaveTypes: [], counts: [], percentages: [] });
  const [lateEarlyData, setLateEarlyData] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);

  // Personal view states
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);

  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPersonal) {
      fetchPersonalData();
    } else {
      fetchDepartmentList();
    }
  }, []);

  useEffect(() => {
    if (!isPersonal && departments.length > 0) {
      fetchAdminData();
    }
  }, [selectedMonth, selectedDept, departments, isPersonal]);

  useEffect(() => {
    if (isPersonal) {
      fetchPersonalData();
    }
  }, [selectedMonth]);

  const fetchDepartmentList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      if (res.code === 0 && res.data) {
        const options: DepartmentOption[] = [{ value: '', label: '全部部门' }];
        const traverse = (nodes: any[]) => {
          nodes.forEach(node => {
            options.push({ value: node.id, label: node.name });
            if (node.children) traverse(node.children);
          });
        };
        traverse(res.data);
        setDepartments(options);
      }
    } catch (e) { console.error('获取部门列表失败:', e); }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [trendRes, leaveRes, lateEarlyRes, deptStatsRes] = await Promise.all([
        getAttendanceTrendUsingGet({ departmentId: selectedDept ? Number(selectedDept) : 0, months: 6 }),
        getLeaveTypeDistributionUsingGet({ month: selectedMonth }),
        getLateEarlyRankingUsingGet({ month: selectedMonth }),
        getDepartmentStatsUsingGet({ month: selectedMonth }),
      ]);
      if (trendRes.code === 0 && trendRes.data) {
        setTrendData({ months: trendRes.data.months || [], rates: trendRes.data.rates || [] });
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
          departmentName: d.departmentName, lateCount: d.lateCount, earlyCount: d.earlyCount,
        })));
        setDepartmentStats(deptStatsRes.data);
      }
    } catch (e) { console.error('获取统计数据失败:', e); }
    finally { setLoading(false); }
  };

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const [statsRes, recordsRes, trendRes] = await Promise.all([
        getPersonalStatsUsingGet({ month: selectedMonth }),
        getMonthRecordsUsingGet({ month: selectedMonth }),
        getPersonalTrendUsingGet({ months: 3 }),
      ]);

      if (statsRes.code === 0 && statsRes.data) setPersonalStats(statsRes.data);
      if (recordsRes.code === 0 && recordsRes.data) {
        const records = Array.isArray(recordsRes.data) ? recordsRes.data : [];
        setDailyRecords(records);
        // 从月记录派生日历数据
        const dailyStatus: Record<string, number> = {};
        records.forEach((r: any) => {
          const dateStr = dayjs(r.attendanceDate).format('YYYY-MM-DD');
          dailyStatus[dateStr] = r.status;
        });
        setCalendarData({
          month: selectedMonth,
          normalDays: records.filter((r: any) => r.status === 0).length,
          lateDays: records.filter((r: any) => r.status === 1).length,
          leaveDays: records.filter((r: any) => r.status === 4).length,
          missingDays: records.filter((r: any) => r.status === 3).length,
          dailyStatus,
        });
      }
      if (trendRes.code === 0 && trendRes.data) {
        setTrendData({ months: trendRes.data.months || [], rates: trendRes.data.rates || [] });
      }
    } catch (e) { console.error('获取个人统计数据失败:', e); }
    finally { setLoading(false); }
  };

  // 出勤率趋势图
  useEffect(() => {
    if (chartRef1.current && trendData.months.length > 0) {
      const chart = echarts.init(chartRef1.current);
      chart.setOption({
        title: { text: '近6个月出勤率趋势', left: 'center', fontSize: 14 },
        xAxis: { type: 'category', data: trendData.months },
        yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
          type: 'line', data: trendData.rates, smooth: true,
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

  // 每日状态柱状图（个人视图）
  useEffect(() => {
    if (isPersonal && chartRef2.current && dailyRecords.length > 0) {
      const chart = echarts.init(chartRef2.current);
      const dates = dailyRecords.map((r: any) => dayjs(r.attendanceDate).format('MM-DD'));
      const statusTexts = dailyRecords.map((r: any) => {
        const key = STATUS_NUM_MAP[r.status] || 'NORMAL';
        return STATUS_TEXT_MAP[key] || '未知';
      });
      const statusCounts: Record<string, number> = {};
      statusTexts.forEach((s: string) => { statusCounts[s] = (statusCounts[s] || 0) + 1; });

      chart.setOption({
        title: { text: `${selectedMonth} 每日出勤状态`, left: 'center', fontSize: 14 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
          type: 'bar',
          data: dailyRecords.map((r: any) => ({
            value: 1,
            itemStyle: { color: STATUS_COLOR_MAP[STATUS_NUM_MAP[r.status]] || '#bfbfbf' },
          })),
          barMaxWidth: 20,
        }],
        grid: { bottom: 60 },
      });
      return () => chart.dispose();
    }
  }, [dailyRecords, isPersonal, selectedMonth]);

  // 管理员：请假类型饼图
  useEffect(() => {
    if (!isPersonal && chartRef2.current && leaveData.leaveTypes.length > 0) {
      const chart = echarts.init(chartRef2.current);
      chart.setOption({
        title: { text: '当月请假类型占比', left: 'center', fontSize: 14 },
        series: [{
          type: 'pie', radius: ['40%', '70%'],
          data: leaveData.leaveTypes.map((name, i) => ({
            name, value: leaveData.percentages[i] || 0,
            itemStyle: { color: ['#52c41a', '#faad14', '#1890ff', '#722ed1', '#ff4d4f', '#fa8c16', '#bfbfbf'][i % 7] },
          })),
          label: { formatter: '{b}: {c}%' },
        }],
      });
      return () => chart.dispose();
    }
  }, [leaveData, isPersonal]);

  // 管理员：迟到早退柱状图
  useEffect(() => {
    if (!isPersonal && chartRef3.current && lateEarlyData.length > 0) {
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
  }, [lateEarlyData, isPersonal]);

  const deptColumns = [
    { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
    { title: '部门人数', dataIndex: 'employeeCount', key: 'employeeCount' },
    { title: '出勤率', dataIndex: 'attendanceRate', key: 'attendanceRate',
      render: (rate: number) => `${(rate ?? 0).toFixed(1)}%` },
    { title: '迟到率', dataIndex: 'lateRate', key: 'lateRate',
      render: (rate: number) => `${(rate ?? 0).toFixed(1)}%` },
    { title: '请假率', dataIndex: 'leaveRate', key: 'leaveRate',
      render: (rate: number) => `${(rate ?? 0).toFixed(1)}%` },
    { title: '迟到人次', dataIndex: 'lateCount', key: 'lateCount' },
    { title: '早退人次', dataIndex: 'earlyCount', key: 'earlyCount' },
  ];

  const dailyColumns = [
    { title: '日期', dataIndex: 'attendanceDate', width: 120,
      render: (d: string) => dayjs(d).format('MM-DD') },
    { title: '上班打卡', dataIndex: 'punchInTime', width: 120,
      render: (t: string) => t ? dayjs(t).format('HH:mm') : '-' },
    { title: '下班打卡', dataIndex: 'punchOutTime', width: 120,
      render: (t: string) => t ? dayjs(t).format('HH:mm') : '-' },
    { title: '状态', dataIndex: 'status', width: 100,
      render: (s: number) => {
        const key = STATUS_NUM_MAP[s] || 'NORMAL';
        return <Tag color={STATUS_COLOR_MAP[key]}>{STATUS_TEXT_MAP[key]}</Tag>;
      } },
  ];

  const statCards = isPersonal && personalStats ? [
    { label: '应出勤天数', value: personalStats.totalDays, icon: <CalendarOutlined />, color: '#1890ff' },
    { label: '实际出勤', value: personalStats.normalDays + personalStats.lateDays + personalStats.earlyDays, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { label: '迟到次数', value: personalStats.lateDays, icon: <WarningOutlined />, color: '#faad14' },
    { label: '早退次数', value: personalStats.earlyDays, icon: <WarningOutlined />, color: '#fa8c16' },
    { label: '旷工天数', value: personalStats.absentDays, icon: <StopOutlined />, color: '#ff4d4f' },
    { label: '请假天数', value: personalStats.totalLeaveDays, icon: <FileTextOutlined />, color: '#722ed1' },
    { label: '加班时长', value: `${personalStats.overtimeHours ?? 0}h`, icon: <CoffeeOutlined />, color: '#13c2c2' },
    { label: '年假余额', value: `${personalStats.annualLeaveBalance ?? 0}天`, icon: <GiftOutlined />, color: '#eb2f96' },
  ] : null;

  // 日历渲染
  const renderCalendarGrid = () => {
    if (!calendarData) return null;
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).day(); // 0=Sun
    const daysInMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
    const today = dayjs().format('YYYY-MM-DD');
    const cells: React.ReactNode[] = [];

    // 空单元格（月初对齐）
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ aspectRatio: '1', padding: 4 }} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = calendarData.dailyStatus?.[dateStr];
      const hasRecord = status !== undefined && status !== null;
      const statusKey = hasRecord ? (STATUS_NUM_MAP[status] || 'MISSING') : null;
      const color = statusKey ? STATUS_COLOR_MAP[statusKey] : 'transparent';
      const isToday = dateStr === today;

      cells.push(
        <div key={dateStr} style={{
          aspectRatio: '1', padding: 2, textAlign: 'center',
          borderRadius: 8, backgroundColor: isToday ? '#e6f7ff' : '#fafafa',
          border: isToday ? '1px solid #1890ff' : '1px solid #f0f0f0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? '#1890ff' : '#333' }}>
            {d}
          </span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, marginTop: 2 }} />
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['日', '一', '二', '三', '四', '五', '六'].map(w => (
          <div key={w} style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: '4px 0' }}>{w}</div>
        ))}
        {cells}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>考勤统计</h1>
          <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>
            {isPersonal ? '个人考勤数据概览' : '查看考勤数据统计与明细'}
          </span>
        </div>
        <Space>
          {!isPersonal && (
            <Select placeholder="选择部门" style={{ width: 150 }} value={selectedDept}
              onChange={setSelectedDept} allowClear options={departments} />
          )}
          <Select placeholder="选择月份" style={{ width: 120 }} value={selectedMonth}
            onChange={setSelectedMonth}
            options={Array.from({ length: 6 }, (_, i) => {
              const date = dayjs().subtract(i, 'month');
              return { value: date.format('YYYY-MM'), label: date.format('YYYY年M月') };
            })} />
          <Button type="primary" icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* ===== 个人视图 ===== */}
        {isPersonal && (
          <>
            {/* 统计卡片 */}
            {statCards && (
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statCards.map(card => (
                  <Col xs={12} sm={6} md={3} key={card.label}>
                    <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                      <Statistic title={card.label} value={card.value}
                        valueStyle={{ color: card.color, fontSize: 22, fontWeight: 600 }}
                        prefix={<span style={{ fontSize: 16 }}>{card.icon}</span>} />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* 日历 + 柱状图 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <Card title={`${selectedMonth} 考勤日历`} style={{ borderRadius: 12 }}>
                {renderCalendarGrid()}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_TEXT_MAP).slice(0, 6).map(([key, text]) => (
                    <span key={key} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block', backgroundColor: STATUS_COLOR_MAP[key] }} />
                      {text}
                    </span>
                  ))}
                </div>
              </Card>
              <Card style={{ borderRadius: 12 }}>
                <div ref={chartRef2} style={{ height: 320 }} />
              </Card>
            </div>

            {/* 出勤率趋势图 */}
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              <div ref={chartRef1} style={{ height: 280 }} />
            </Card>

            {/* 每日记录表格 */}
            <Card title="每日打卡明细" style={{ borderRadius: 12 }}>
              <Table columns={dailyColumns} dataSource={dailyRecords} rowKey="id"
                pagination={false} size="small" />
            </Card>
          </>
        )}

        {/* ===== 管理员视图 ===== */}
        {!isPersonal && (
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
              <Table columns={deptColumns} dataSource={departmentStats}
                rowKey="departmentId" pagination={false} size="small" />
            </Card>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Statistics;
