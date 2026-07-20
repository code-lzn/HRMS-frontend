import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Tag, message, Modal, DatePicker, Select, Form, Input } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AttendanceCalendarVO, AttendanceStatus, DayItem, ClockResultVO } from '@/services/profile/typings';
import { getAttendanceCalendar, clock, getMySupplementCards } from '@/services/profile';
import { submitSupplementCardUsingPost } from '@/api/attendanceController';
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

const STATUS_LABEL_MAP: Record<string, string> = {
  NORMAL: '正常',
  LATE: '迟到',
  EARLY: '早退',
  ABSENT: '旷工',
  LEAVE: '请假',
  MISSING: '缺卡',
  WEEKEND: '休息日',
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [data, setData] = useState<AttendanceCalendarVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [todayClock, setTodayClock] = useState<{
    clockIn?: string;
    clockOut?: string;
    startStatusDesc?: string;
    endStatusDesc?: string;
  }>({});
  const [supplementOpen, setSupplementOpen] = useState(false);
  const [supplementDate, setSupplementDate] = useState<string>('');
  const [supplementForm] = Form.useForm();
  const [supplementSubmitting, setSupplementSubmitting] = useState(false);
  const [supplementCards, setSupplementCards] = useState<any[]>([]);
  const [showSupplementCards, setShowSupplementCards] = useState(false);

  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async (month: dayjs.Dayjs) => {
    setLoading(true);
    try {
      const ym = month.format('YYYY-MM');
      const res = await getAttendanceCalendar(ym);
      setData(res);
      // 提取今日打卡状态
      const today = dayjs().format('YYYY-MM-DD');
      const todayItem = res?.days?.find((d) => d.date === today);
      if (todayItem) {
        setTodayClock({
          clockIn: todayItem.clockIn,
          clockOut: todayItem.clockOut,
          startStatusDesc: todayItem.startStatusDesc,
          endStatusDesc: todayItem.endStatusDesc,
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

  // 加载补卡记录
  const fetchSupplementCards = useCallback(async () => {
    try {
      const res = await getMySupplementCards(1, 10);
      setSupplementCards((res as any)?.records || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchSupplementCards(); }, [fetchSupplementCards]);

  // 打开补卡弹窗
  const openSupplement = (date?: string) => {
    setSupplementDate(date || dayjs().format('YYYY-MM-DD'));
    supplementForm.resetFields();
    setSupplementOpen(true);
  };

  // 提交补卡
  const handleSupplementSubmit = async () => {
    try {
      const values = await supplementForm.validateFields();
      setSupplementSubmitting(true);
      await submitSupplementCardUsingPost({
        attendanceDate: values.attendanceDate.format('YYYY-MM-DD'),
        cardType: values.cardType,
        reason: values.reason,
      });
      message.success('补卡申请已提交，请等待审批');
      setSupplementOpen(false);
      fetchData(currentMonth);
      fetchSupplementCards();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '提交失败');
    } finally {
      setSupplementSubmitting(false);
    }
  };

  // 打卡
  const handleClock = async (type: 'IN' | 'OUT') => {
    setClocking(true);
    try {
      const result: ClockResultVO = await clock(type);
      message.success(
        `${type === 'IN' ? '上班' : '下班'}打卡成功 · ${result.statusDesc || ''}`,
      );
      // 刷新日历和今日状态
      await fetchData(currentMonth);
    } catch (e: any) {
      message.error(e?.message || '打卡失败');
    } finally {
      setClocking(false);
    }
  };

  const summary = data?.summary as any;
  const isTodayWeekend = [0, 6].includes(dayjs().day());

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
      const dayInfo = data?.days?.find((d) => d.date === dateStr);
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

  // 生成今日打卡状态描述
  const getTodayStatusText = () => {
    const hasClockIn = !!todayClock.clockIn;
    const hasClockOut = !!todayClock.clockOut;
    if (!hasClockIn && !hasClockOut) {
      return isTodayWeekend ? '今日休息' : '今日尚未打卡';
    }
    const parts: string[] = [];
    if (hasClockIn) {
      parts.push(`上班 ${todayClock.clockIn}${todayClock.startStatusDesc ? ` (${todayClock.startStatusDesc})` : ''}`);
    } else {
      parts.push('上班缺卡');
    }
    if (hasClockOut) {
      parts.push(`下班 ${todayClock.clockOut}${todayClock.endStatusDesc ? ` (${todayClock.endStatusDesc})` : ''}`);
    } else {
      parts.push('下班未打卡');
    }
    return parts.join('  |  ');
  };

  const canClockIn = !todayClock.clockIn;
  const canClockOut = !!todayClock.clockIn && !todayClock.clockOut;

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>我的考勤</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>查看考勤记录，打卡签到签退</div>
          </div>
        ),
      }}
    >
      {/* 打卡卡片 */}
      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
          color: '#fff',
          marginBottom: 16,
        }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              当前时间
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1.1 }}>
              {now.format('HH:mm:ss')}
            </div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
              {now.format('YYYY年MM月DD日 dddd')}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>
              {getTodayStatusText()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              size="large"
              icon={<LoginOutlined />}
              onClick={() => handleClock('IN')}
              loading={clocking}
              disabled={!canClockIn}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                height: 48,
                minWidth: 140,
                borderRadius: 8,
              }}
            >
              上班打卡
            </Button>
            <Button
              size="large"
              icon={<LogoutOutlined />}
              onClick={() => handleClock('OUT')}
              loading={clocking}
              disabled={!canClockOut}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                height: 48,
                minWidth: 140,
                borderRadius: 8,
              }}
            >
              下班打卡
            </Button>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#dbeafe' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>
              {summary?.leaveDays ?? 0}
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>请假</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#dcfce7' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#22c55e' }}>
              {summary?.normalDays ?? 0}
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>正常出勤</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#ffedd5' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f97316' }}>
              {(summary?.lateDays ?? 0) + (summary?.earlyLeaveDays ?? 0)}
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>迟到/早退</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                迟到 {summary?.lateDays ?? 0} · 早退 {summary?.earlyLeaveDays ?? 0}
              </div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fee2e2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#ef4444' }}>
              {summary?.absentDays ?? 0}
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>旷工</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fef3c7' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#fbbf24' }}>
              {summary?.cardMissingDays ?? 0}
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>缺卡</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  style={{ padding: 0, fontSize: 12, color: '#fbbf24', textAlign: 'left' }}
                  onClick={() => openSupplement()}
                >
                  申请补卡
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<FileTextOutlined />}
                  style={{ padding: 0, fontSize: 12, color: '#999', textAlign: 'left' }}
                  onClick={() => { fetchSupplementCards(); setShowSupplementCards(true); }}
                >
                  补卡记录
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 补卡记录 */}
      {showSupplementCards && (
        <Card
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>补卡记录</span>
              <Button type="link" size="small" onClick={() => setShowSupplementCards(false)}>收起</Button>
            </div>
          }
        >
          {supplementCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无补卡记录</div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {supplementCards.map((card: any) => {
              const statusMap: Record<number, { color: string; text: string }> = {
                1: { color: 'default', text: '草稿' },
                2: { color: 'processing', text: '审批中' },
                3: { color: 'success', text: '已通过' },
                4: { color: 'error', text: '已拒绝' },
              };
              const st = statusMap[card.status] || { color: 'default', text: '未知' };
              return (
                <div
                  key={card.id}
                  style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}
                >
                  <span style={{ fontSize: 13 }}>
                    {card.attendanceDate} · {card.cardTypeDesc || (card.cardType === 1 ? '上班卡' : '下班卡')}
                    <span style={{ color: '#999', marginLeft: 8 }}>{card.reason}</span>
                  </span>
                  <Tag color={st.color}>{st.text}</Tag>
                </div>
              );
            })}
          </div>
          )}
        </Card>
      )}

      {/* 日历 */}
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        loading={loading}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
            />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {currentMonth.year()}年{currentMonth.month() + 1}月
            </span>
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
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
            const status = (dayInfo?.startStatus || dayInfo?.endStatus)
              ? (dayInfo?.startStatusDesc || dayInfo?.endStatusDesc)
              : null;
            const isWeekend = date.day() === 0 || date.day() === 6;
            const isFuture = date.isAfter(dayjs(), 'day');
            const hasRecord = dayInfo && (dayInfo.startStatus != null || dayInfo.endStatus != null);
            let statusKey: string;
            if (dayInfo) {
              if (dayInfo.hasLeave) {
                statusKey = 'LEAVE';
              } else if (hasRecord) {
                // 按严重程度判断：旷工 > 缺卡 > 迟到/早退 > 正常
                const s = dayInfo.startStatus;
                const e = dayInfo.endStatus;
                if (s === 3 || e === 3) {
                  statusKey = 'ABSENT';
                } else if (s === 4 || e === 4) {
                  statusKey = 'MISSING';
                } else if (s === 2) {
                  statusKey = 'LATE';
                } else if (e === 2) {
                  statusKey = 'EARLY';
                } else {
                  statusKey = 'NORMAL';
                }
              } else if (isWeekend || dayInfo.dayType === 2 || dayInfo.dayType === 3) {
                statusKey = 'WEEKEND';
              } else if (isFuture) {
                statusKey = 'WEEKEND'; // 未来日期用浅灰，区别于已过的缺卡
              } else if (!isFuture && !isToday) {
                statusKey = 'MISSING'; // 已过的工作日无打卡 → 缺卡
              } else {
                statusKey = 'NORMAL'; // 今天尚未打卡 → 正常待打
              }
            } else {
              statusKey = isWeekend ? 'WEEKEND' : 'NORMAL';
            }
            const isMissingDay = isCurrentMonth && statusKey === 'MISSING' && !isFuture;
            const statusInfo = STATUS_MAP[statusKey as AttendanceStatus] || STATUS_MAP.WEEKEND;

            return (
              <div
                key={date.format('YYYY-MM-DD')}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: isCurrentMonth ? statusInfo.bgColor : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isToday ? '2px solid #3b82f6' : '2px solid transparent',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  cursor: isMissingDay ? 'pointer' : 'default',
                }}
                title={
                  isCurrentMonth && dayInfo
                    ? [
                        dayInfo.startStatusDesc && `上班: ${dayInfo.startStatusDesc}`,
                        dayInfo.endStatusDesc && `下班: ${dayInfo.endStatusDesc}`,
                        dayInfo.clockIn && `上班打卡: ${dayInfo.clockIn}`,
                        dayInfo.clockOut && `下班打卡: ${dayInfo.clockOut}`,
                        dayInfo.hasLeave && '请假',
                        isMissingDay && '点击申请补卡',
                      ]
                        .filter(Boolean)
                        .join('\n')
                    : undefined
                }
                onClick={() => {
                  if (isMissingDay) openSupplement(date.format('YYYY-MM-DD'));
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: isCurrentMonth ? '#333' : '#ccc' }}>
                  {date.date()}
                </div>
                {isCurrentMonth && (status || dayInfo?.hasLeave) && (
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
                {isCurrentMonth && dayInfo?.hasLeave && (
                  <span style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>假</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
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

      {/* 补卡弹窗 */}
      <Modal
        title="补卡申请"
        open={supplementOpen}
        onCancel={() => setSupplementOpen(false)}
        onOk={handleSupplementSubmit}
        confirmLoading={supplementSubmitting}
        okText="提交申请"
        cancelText="取消"
        centered
        destroyOnClose
      >
        <Form form={supplementForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="attendanceDate"
            label="补卡日期"
            rules={[{ required: true, message: '请选择日期' }]}
            initialValue={supplementDate ? dayjs(supplementDate) : undefined}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="cardType"
            label="补卡类型"
            rules={[{ required: true, message: '请选择补卡类型' }]}
            initialValue={1}
          >
            <Select
              options={[
                { value: 1, label: '上班卡' },
                { value: 2, label: '下班卡' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="补卡原因"
            rules={[{ required: true, message: '请输入补卡原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请说明缺卡原因" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
