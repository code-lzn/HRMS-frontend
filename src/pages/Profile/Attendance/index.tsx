import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Calendar, Statistic, Row, Col, Space, Tag, message, Badge, Popover } from 'antd';
import { ClockCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AttendanceCalendarVO, ClockResultVO, AttendanceStatus, DayItem } from '@/services/profile/typings';
import { getAttendanceCalendar, clock } from '@/services/profile';

const STATUS_MAP: Record<AttendanceStatus, { color: string; label: string; dot: string }> = {
  NORMAL: { color: '#52c41a', label: '正常', dot: '●' },
  LATE: { color: '#fa8c16', label: '迟到', dot: '●' },
  EARLY: { color: '#fa8c16', label: '早退', dot: '●' },
  ABSENT: { color: '#f5222d', label: '旷工', dot: '●' },
  LEAVE: { color: '#1890ff', label: '请假', dot: '●' },
  MISSING: { color: '#bfbfbf', label: '缺卡', dot: '●' },
  WEEKEND: { color: '#d9d9d9', label: '休息日', dot: '-' },
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [data, setData] = useState<AttendanceCalendarVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [todayRecord, setTodayRecord] = useState<DayItem | null>(null);

  const fetchData = useCallback(async (month: dayjs.Dayjs) => {
    setLoading(true);
    try {
      const ym = month.format('YYYY-MM');
      const res = await getAttendanceCalendar(ym);
      setData(res);
      const today = dayjs().format('YYYY-MM-DD');
      const td = res.days.find((d) => d.date === today);
      setTodayRecord(td || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

  const handleClock = async (type: 'IN' | 'OUT') => {
    setClocking(true);
    try {
      const res: ClockResultVO = await clock(type);
      message.success(`${res.statusDesc} (${dayjs(res.clockTime).format('HH:mm:ss')})`);
      fetchData(currentMonth);
    } catch (err: any) {
      message.error(err?.response?.data?.message || '打卡失败');
    } finally {
      setClocking(false);
    }
  };

  const cellRender = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const day = data?.days.find((d) => d.date === dateStr);
    const isToday = dateStr === dayjs().format('YYYY-MM-DD');

    if (!day) return null;

    const statusInfo = STATUS_MAP[day.status] || { color: '#999', label: day.status, dot: '●' };

    const popContent = day.status !== 'WEEKEND' ? (
      <div style={{ minWidth: 120 }}>
        <p><strong>{day.date}</strong> ({day.weekday})</p>
        <p>状态: <Tag color={statusInfo.color}>{day.statusDesc}</Tag></p>
        {day.clockIn && <p>上班: {day.clockIn}</p>}
        {day.clockOut && <p>下班: {day.clockOut}</p>}
      </div>
    ) : null;

    return (
      <Popover content={popContent}>
        <div style={{ textAlign: 'center', padding: '4px 0', background: isToday ? '#e6f7ff' : undefined }}>
          <div style={{ fontSize: 12, color: statusInfo.color }}>{statusInfo.dot}</div>
          <div style={{ fontSize: 14 }}>{date.date()}</div>
        </div>
      </Popover>
    );
  };

  const now = dayjs();

  return (
    <div>
      {/* 打卡区 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{now.format('YYYY年MM月DD日')}</div>
            <div style={{ color: '#999' }}>{now.format('dddd')}</div>
          </Col>
          <Col>
            <Space size="large">
              <Badge status={todayRecord?.clockIn ? 'success' : 'default'} text={
                todayRecord?.clockIn ? `上班: ${todayRecord.clockIn}` : '上班未打卡'
              } />
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => handleClock('IN')}
                loading={clocking}
                disabled={clocking || !!todayRecord?.clockIn}
                type={todayRecord?.clockIn ? 'default' : 'primary'}
              >
                {todayRecord?.clockIn ? '已打卡' : '上班打卡'}
              </Button>
              <Badge status={todayRecord?.clockOut ? 'success' : 'default'} text={
                todayRecord?.clockOut ? `下班: ${todayRecord.clockOut}` : '下班未打卡'
              } />
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => handleClock('OUT')}
                loading={clocking}
                disabled={clocking || !!todayRecord?.clockOut}
                type={todayRecord?.clockOut ? 'default' : 'primary'}
              >
                {todayRecord?.clockOut ? '已打卡' : '下班打卡'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计区 */}
      {data?.summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}><Card><Statistic title="应出勤" value={data.summary.shouldWorkDays} suffix="天" /></Card></Col>
          <Col span={4}><Card><Statistic title="实际出勤" value={data.summary.actualWorkDays} suffix="天" /></Card></Col>
          <Col span={4}><Card><Statistic title="迟到" value={data.summary.lateCount} suffix="次" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
          <Col span={4}><Card><Statistic title="早退" value={data.summary.earlyCount} suffix="次" /></Card></Col>
          <Col span={4}><Card><Statistic title="旷工" value={data.summary.absentCount} suffix="天" valueStyle={{ color: '#f5222d' }} /></Card></Col>
          <Col span={4}><Card><Statistic title="请假" value={data.summary.leaveDays} suffix="天" /></Card></Col>
        </Row>
      )}

      {/* 日历区 */}
      <Card
        title="考勤日历"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} />
            <span>{currentMonth.format('YYYY年MM月')}</span>
            <Button icon={<ArrowRightOutlined />} onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} />
            <Button type="link">补卡申请</Button>
          </Space>
        }
      >
        <Calendar
          fullscreen
          value={currentMonth}
          onPanelChange={(d) => setCurrentMonth(d)}
          cellRender={cellRender}
        />
        {/* 图例 */}
        <Row gutter={16} style={{ marginTop: 12 }}>
          {Object.entries(STATUS_MAP).slice(0, 6).map(([key, val]) => (
            <Col key={key}><span style={{ color: val.color }}>{val.dot}</span> {val.label}</Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
