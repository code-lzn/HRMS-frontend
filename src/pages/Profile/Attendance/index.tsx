import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Tag, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AttendanceCalendarVO, AttendanceStatus, DayItem } from '@/services/profile/typings';
import { getAttendanceCalendar } from '@/services/profile';
import { PageContainer } from '@ant-design/pro-components';

const STATUS_MAP: Record<AttendanceStatus, { bgColor: string; dotColor: string; label: string }> = {
  NORMAL: { bgColor: '#dcfce7', dotColor: '#22c55e', label: '正常' },
  LATE: { bgColor: '#ffedd5', dotColor: '#f97316', label: '迟到' },
  EARLY: { bgColor: '#ffedd5', dotColor: '#f97316', label: '早退' },
  ABSENT: { bgColor: '#fee2e2', dotColor: '#ef4444', label: '旷工' },
  LEAVE: { bgColor: '#dbeafe', dotColor: '#3b82f6', label: '请假' },
  MISSING: { bgColor: '#fef3c7', dotColor: '#fbbf24', label: '缺卡' },
  WEEKEND: { bgColor: '#f3f4f6', dotColor: '#d1d5db', label: '休息日' },
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [data, setData] = useState<AttendanceCalendarVO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (month: dayjs.Dayjs) => {
    setLoading(true);
    try {
      const ym = month.format('YYYY-MM');
      const res = await getAttendanceCalendar(ym);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

  const summary = data?.summary;

  const generateCalendarDays = () => {
    const year = currentMonth.year();
    const month = currentMonth.month();
    const firstDay = dayjs(`${year}-${month + 1}-01`);
    const startDay = firstDay.startOf('week');
    const endDay = firstDay.endOf('month').endOf('week');

    const days: { date: dayjs.Dayjs; dayInfo?: DayItem; isCurrentMonth: boolean }[] = [];
    let current = startDay;

    while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayInfo = data?.days.find((d) => d.date === dateStr);
      days.push({
        date: current,
        dayInfo,
        isCurrentMonth: current.month() === month,
      });
      current = current.add(1, 'day');
    }

    return days;
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>我的考勤</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>查看考勤记录，申请请假或补卡</div>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#f0fdf4' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#22c55e' }}>{summary?.actualWorkDays || 0}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>出勤天数</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fef9c3' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#ca8a04' }}>{summary?.leaveDays || 0}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>请假天数</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#ffedd5' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f97316' }}>{summary?.lateCount || 0}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>迟到次数</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fee2e2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#ef4444' }}>{summary?.absentCount || 0}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>缺卡次数</div>
            </div>
          </div>
        </Card>
      </div>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
              style={{ border: 'none' }}
            />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {currentMonth.year()}年{currentMonth.month() + 1}月
            </span>
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
              style={{ border: 'none' }}
            />
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
          {weekDays.map((day) => (
            <div key={day} style={{ textAlign: 'center', fontSize: 13, color: '#999', padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {generateCalendarDays().map(({ date, dayInfo, isCurrentMonth }) => {
            const isToday = date.isSame(dayjs(), 'day');
            const status = dayInfo?.status || 'WEEKEND';
            const statusInfo = STATUS_MAP[status] || STATUS_MAP.WEEKEND;
            const isWeekend = date.day() === 0 || date.day() === 6;

            return (
              <div
                key={date.format('YYYY-MM-DD')}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: isCurrentMonth
                    ? (isWeekend && !dayInfo ? '#f9fafb' : statusInfo.bgColor)
                    : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: isToday ? '2px solid #3b82f6' : '2px solid transparent',
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: isCurrentMonth ? '#333' : '#ccc' }}>
                  {date.date()}
                </div>
                {isCurrentMonth && dayInfo && dayInfo.status !== 'WEEKEND' && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: statusInfo.dotColor,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_MAP).filter(([k]) => k !== 'WEEKEND').map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: val.dotColor,
                }}
              />
              <span style={{ fontSize: 12, color: '#666' }}>{val.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
