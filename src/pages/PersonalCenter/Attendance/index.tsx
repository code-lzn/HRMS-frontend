import { getCalendarUsingGet, getMonthRecordsUsingGet, getTodayStatusUsingGet, punchUsingPost } from '@/api/attendanceController';
import { applyUsingPost1 as applyMakeupPunch } from '@/api/makeupPunchController';
import { applyUsingPost2 as applyOvertime } from '@/api/overtimeController';
import { CalendarOutlined, ClockCircleOutlined, FieldTimeOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Badge, Button, Calendar, Card, Col, DatePicker, Form, Input, InputNumber, message, Modal, Popover, Radio, Row, Select, Statistic, Tag, TimePicker, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './index.less';

const { Text } = Typography;

/** 考勤状态映射 */
const STATUS_MAP: Record<number, { color: string; text: string; bg: string }> = {
  0: { color: '#52c41a', text: '正常', bg: '#f6ffed' },
  1: { color: '#faad14', text: '迟到', bg: '#fffbe6' },
  2: { color: '#faad14', text: '早退', bg: '#fffbe6' },
  3: { color: '#8c8c8c', text: '缺卡', bg: '#fafafa' },
  4: { color: '#1677ff', text: '请假', bg: '#f0f5ff' },
  5: { color: '#ff4d4f', text: '旷工', bg: '#fff2f0' },
  6: { color: '#722ed1', text: '上班缺卡', bg: '#f9f0ff' },
  7: { color: '#1890ff', text: '下班缺卡', bg: '#f0f5ff' },
  8: { color: '#87d068', text: '休息', bg: '#f6ffed' },
  9: { color: '#ff7a45', text: '迟到&早退', bg: '#fff2e8' },
};

/** 按文字匹配颜色（后端 dailyStatus 的 code 和前端定义可能不一致，用文字兜底） */
const COLOR_BY_TEXT: Record<string, string> = {
  '正常': '#52c41a', '迟到': '#faad14', '早退': '#faad14',
  '旷工': '#ff4d4f', '请假': '#1677ff', '缺卡': '#8c8c8c',
};
const BG_BY_TEXT: Record<string, string> = {
  '正常': '#f6ffed', '迟到': '#fffbe6', '早退': '#fffbe6',
  '旷工': '#fff2f0', '请假': '#f0f5ff', '缺卡': '#fafafa',
};

const MyAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState<API.AttendanceVO | null>(null);
  const [calendarData, setCalendarData] = useState<API.AttendanceCalendarVO | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [clockTime, setClockTime] = useState(dayjs().format('HH:mm:ss'));
  const [punchLoading, setPunchLoading] = useState(false);
  const [makeupModalOpen, setMakeupModalOpen] = useState(false);
  const [makeupForm] = Form.useForm();
  const [makeupLoading, setMakeupLoading] = useState(false);
  const [selectedDateRecords, setSelectedDateRecords] = useState<API.AttendanceVO[]>([]);
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
  const [overtimeForm] = Form.useForm();
  const [overtimeLoading, setOvertimeLoading] = useState(false);

  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setClockTime(dayjs().format('HH:mm:ss')), 1000);
    return () => clearInterval(timer);
  }, []);

  // 加载今日打卡状态
  const loadTodayStatus = useCallback(async () => {
    try {
      const res = await getTodayStatusUsingGet();
      setTodayStatus(res?.data ?? null);
    } catch (e) { console.error('pages/PersonalCenter/Attendance/index.tsx', e); }
  }, []);

  // 加载考勤日历
  const loadCalendar = useCallback(async (month: string) => {
    setCalendarData(null);
    try {
      const res = await getCalendarUsingGet({ month });
      setCalendarData(res?.data ?? null);
    } catch (e) { console.error('pages/PersonalCenter/Attendance/index.tsx', e); }
  }, []);

  useEffect(() => {
    loadTodayStatus();
    loadCalendar(currentMonth);
  }, [loadTodayStatus, loadCalendar, currentMonth]);

  // 打卡
  const handlePunch = async (punchType: number) => {
    setPunchLoading(true);
    try {
      const res = await punchUsingPost({ punchType });
      if (res?.code === 0) {
        message.success(punchType === 0 ? '上班打卡成功' : '下班打卡成功');
        loadTodayStatus();
        loadCalendar(currentMonth);
      }
    } catch (e: any) {
      message.error(e.message || '打卡失败');
    } finally {
      setPunchLoading(false);
    }
  };

  // 点击日期获取当日记录
  const handleDateSelect = async (date: Dayjs) => {
    try {
      const month = date.format('YYYY-MM');
      const res = await getMonthRecordsUsingGet({ month });
      const records = (res?.data ?? []).filter(
        (r) => r.attendanceDate === date.format('YYYY-MM-DD'),
      );
      setSelectedDateRecords(records);
    } catch (e) { console.error('pages/PersonalCenter/Attendance/index.tsx', e); setSelectedDateRecords([]); }
  };

  // 日历日期格渲染
  const dateCellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dailyStatus = calendarData?.dailyStatus ?? {};
    const dailyStatusText = calendarData?.dailyStatusText ?? {};
    const status = dailyStatus[dateStr] as number | undefined;

    if (status === undefined) return null;

    const cfg = STATUS_MAP[status];
    const statusText = dailyStatusText[dateStr] || cfg?.text || String(status);
    const color = COLOR_BY_TEXT[statusText] || cfg?.color || '#8c8c8c';
    const bg = BG_BY_TEXT[statusText] || cfg?.bg || '#fafafa';

    return (
      <Popover
        title={dateStr}
        content={
          <div>
            {selectedDateRecords.length > 0 ? (
              selectedDateRecords.map((r) => (
                <div key={r.id} style={{ marginBottom: 4 }}>
                  <Text>
                    上班: {r.punchInTime ?? '-'} / 下班: {r.punchOutTime ?? '-'}
                  </Text>
                  <br />
                  <Tag color={STATUS_MAP[r.status ?? 5]?.color}>{r.statusText ?? '-'}</Tag>
                </div>
              ))
            ) : (
              <Text type="secondary">无详细记录</Text>
            )}
          </div>
        }
        trigger="click"
      >
        <div
          style={{
            background: bg,
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 12,
            color,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {statusText}
        </div>
      </Popover>
    );
  };

  // 日历面板变化
  const onPanelChange = (date: Dayjs) => {
    const month = date.format('YYYY-MM');
    setCurrentMonth(month);
  };

  // 旷工天数：优先取 API 字段，兜底从 dailyStatus 统计 status=3
  const absentDays = useMemo(() => {
    const apiVal = (calendarData as any)?.absentDays;
    if (typeof apiVal === 'number') return apiVal;
    const ds = calendarData?.dailyStatus ?? {};
    return Object.values(ds).filter((v) => v === 3).length;
  }, [calendarData]);

  // 格式化打卡时间（后端可能返回完整 datetime，提取时间部分）
  const fmtTime = (v?: string) => {
    if (!v) return '-';
    const d = dayjs(v);
    return d.isValid() ? d.format('HH:mm:ss') : v;
  };

  // 判断是否已打上班/下班卡
  const hasPunchedIn = !!todayStatus?.punchInTime;
  const hasPunchedOut = !!todayStatus?.punchOutTime;

  return (
    <div className="attendance-page">
      {/* 顶部打卡区 */}
      <Card className="punch-card">
        <Row align="middle" justify="space-between">
          <Col>
            <div className="clock-section">
              <Text type="secondary" style={{ fontSize: 14 }}>
                {dayjs().format('YYYY年MM月DD日')}
              </Text>
              <div className="clock-time">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace' }}>
                  {clockTime}
                </span>
              </div>
              {todayStatus?.statusText && (
                <Tag
                  color={COLOR_BY_TEXT[todayStatus.statusText] || STATUS_MAP[todayStatus.status ?? 5]?.color}
                  style={{ marginTop: 4 }}
                >
                  今日: {todayStatus.statusText}
                </Tag>
              )}
            </div>
          </Col>
          <Col>
            <div className="punch-buttons">
              {hasPunchedIn ? (
                <div className="punch-done">
                  <Text type="secondary">上班打卡</Text>
                  <Text strong style={{ fontSize: 18 }}>
                    {todayStatus?.punchInTime}
                  </Text>
                  <Tag
                    color={
                      todayStatus?.punchInType === 0
                        ? 'success'
                        : todayStatus?.punchInType === 1
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {todayStatus?.punchInType === 0
                      ? '正常'
                      : todayStatus?.punchInType === 1
                        ? '迟到'
                        : '-'}
                  </Tag>
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon={<ClockCircleOutlined />}
                  loading={punchLoading}
                  onClick={() => handlePunch(0)}
                >
                  上班打卡
                </Button>
              )}
              <div style={{ width: 24 }} />
              {hasPunchedOut ? (
                <div className="punch-done">
                  <Text type="secondary">下班打卡</Text>
                  <Text strong style={{ fontSize: 18 }}>
                    {todayStatus?.punchOutTime}
                  </Text>
                  <Tag
                    color={
                      todayStatus?.punchOutType === 0
                        ? 'success'
                        : todayStatus?.punchOutType === 1
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {todayStatus?.punchOutType === 0
                      ? '正常'
                      : todayStatus?.punchOutType === 1
                        ? '早退'
                        : '-'}
                  </Tag>
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon={<ClockCircleOutlined />}
                  loading={punchLoading}
                  disabled={!hasPunchedIn}
                  onClick={() => handlePunch(1)}
                >
                  下班打卡
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 月度统计 */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {[
          { title: '正常出勤', value: calendarData?.normalDays ?? 0, color: '#52c41a' },
          { title: '迟到/早退', value: calendarData?.lateDays ?? 0, color: '#faad14' },
          { title: '旷工', value: absentDays, color: '#ff4d4f' },
          { title: '请假', value: calendarData?.leaveDays ?? 0, color: '#1677ff' },
          { title: '缺卡', value: calendarData?.missingDays ?? 0, color: '#8c8c8c' },
        ].map((item) => (
          <Card key={item.title} style={{ flex: 1 }}>
            <Statistic title={item.title} value={item.value} suffix="天" valueStyle={{ color: item.color }} />
          </Card>
        ))}
      </div>
      {/* 考勤日历 */}
      {/*  <div style={{ fontSize: 14, color: item.title === '旷工' ? '#ff4d4f' : 'rgba(0,0,0,0.45)', marginBottom: 8 }}>
              {item.title}
            </div>*/}
      <Card title="考勤日历" style={{ marginTop: 16 }} className="calendar-card">
        <Calendar
          fullscreen={false}
          cellRender={dateCellRender}
          onPanelChange={onPanelChange}
          onSelect={handleDateSelect}
        />
        {/* 图例 */}
        <div className="calendar-legend">
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <span key={key} className="legend-item">
              <Badge color={val.color} text={val.text} />
            </span>
          ))}
        </div>
      </Card>

      {/* 快捷操作 */}
      <Card style={{ marginTop: 16 }}>
        <Button
          icon={<SendOutlined />}
          onClick={() => navigate('/personal/leave')}
        >
          申请请假
        </Button>
        <Button
          icon={<CalendarOutlined />}
          style={{ marginLeft: 12 }}
          onClick={() => {
            if (calendarData?.makeupAvailableDates?.length) {
              makeupForm.setFieldsValue({
                punchDate: dayjs(calendarData.makeupAvailableDates[0]),
              });
            }
            setMakeupModalOpen(true);
          }}
        >
          申请补卡
        </Button>
        <Button
          icon={<FieldTimeOutlined />}
          style={{ marginLeft: 12 }}
          onClick={() => setOvertimeModalOpen(true)}
        >
          申请加班
        </Button>
      </Card>

      {/* 申请补卡 Modal */}
      <Modal
        title="申请补卡"
        open={makeupModalOpen}
        onOk={async () => {
          try {
            const values = await makeupForm.validateFields();
            setMakeupLoading(true);
            await applyMakeupPunch({
              punchDate: values.punchDate.format('YYYY-MM-DD'),
              punchTime: values.punchTime?.format('HH:mm'),
              punchType: values.punchType,
              reason: values.reason,
            });
            message.success('补卡申请已提交');
            setMakeupModalOpen(false);
            makeupForm.resetFields();
            loadCalendar(currentMonth);
          } catch (e: any) {
            if (e.message) message.error(e.message);
          } finally {
            setMakeupLoading(false);
          }
        }}
        onCancel={() => {
          setMakeupModalOpen(false);
          makeupForm.resetFields();
        }}
        confirmLoading={makeupLoading}
        destroyOnClose
      >
        <Form form={makeupForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="punchDate"
            label="补卡日期"
            rules={[{ required: true, message: '请选择补卡日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="punchType"
            label="打卡类型"
            rules={[{ required: true, message: '请选择打卡类型' }]}
          >
            <Radio.Group>
              <Radio value={0}>上班打卡</Radio>
              <Radio value={1}>下班打卡</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="punchTime"
            label="打卡时间"
            rules={[{ required: true, message: '请选择打卡时间' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="补卡原因"
            rules={[{ required: true, message: '请输入补卡原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入补卡原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 申请加班 Modal */}
      <Modal
        title="申请加班"
        open={overtimeModalOpen}
        onOk={async () => {
          try {
            const values = await overtimeForm.validateFields();
            setOvertimeLoading(true);
            const hours = values.endTime.diff(values.startTime, 'hour', true);
            await applyOvertime({
              overtimeDate: values.overtimeDate.format('YYYY-MM-DD'),
              startTime: values.startTime.format('HH:mm'),
              endTime: values.endTime.format('HH:mm'),
              overtimeHours: Math.round(hours * 10) / 10,
              overtimeType: values.overtimeType,
              reason: values.reason,
            });
            message.success('加班申请已提交');
            setOvertimeModalOpen(false);
            overtimeForm.resetFields();
          } catch (e: any) {
            if (e.message) message.error(e.message);
          } finally {
            setOvertimeLoading(false);
          }
        }}
        onCancel={() => {
          setOvertimeModalOpen(false);
          overtimeForm.resetFields();
        }}
        confirmLoading={overtimeLoading}
        destroyOnClose
      >
        <Form form={overtimeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="overtimeDate"
            label="加班日期"
            rules={[{ required: true, message: '请选择加班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="起止时间" required>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="startTime"
                  noStyle
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="开始时间" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endTime"
                  noStyle
                  rules={[{ required: true, message: '请选择结束时间' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="结束时间" />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            name="overtimeType"
            label="加班类型"
            rules={[{ required: true, message: '请选择加班类型' }]}
            initialValue={0}
          >
            <Radio.Group>
              <Radio value={0}>工作日加班</Radio>
              <Radio value={1}>休息日加班</Radio>
              <Radio value={2}>节假日加班</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="reason"
            label="加班原因"
            rules={[{ required: true, message: '请输入加班原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入加班原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAttendance;
