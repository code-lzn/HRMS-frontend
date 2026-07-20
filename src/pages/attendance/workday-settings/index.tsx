import {
  batchUpdateWorkCalendarUsingPut,
  generateWorkCalendarYearUsingPost,
  getWorkCalendarUsingGet,
  syncWorkCalendarYearUsingPost,
} from '@/api/workCalendarController';
import {
  CalendarOutlined,
  CheckCircleFilled,
  SmileOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Calendar,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import './index.css';

const { Text } = Typography;

const DAY_TYPE_MAP: Record<
  number,
  { label: string; color: string; bg: string; lightBg: string }
> = {
  1: { label: '工作日', color: '#1677ff', bg: '#e6f4ff', lightBg: '#f0f7ff' },
  2: { label: '休息日', color: '#52c41a', bg: '#f6ffed', lightBg: '#f9fff4' },
  3: { label: '节假日', color: '#fa8c16', bg: '#fff7e6', lightBg: '#fffaf0' },
};

const BATCH_OPTIONS = [
  { value: 1, label: '设为工作日' },
  { value: 2, label: '设为休息日' },
  { value: 3, label: '设为节假日' },
];

const WorkdaySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [saving, setSaving] = useState(false);
  const year = currentDate.year();
  const month = currentDate.month() + 1;

  const { data, isError, refetch } = useQuery({
    queryKey: ['work-calendar', year, month],
    queryFn: async () => getWorkCalendarUsingGet({ year, month }),
    staleTime: 0,
    retry: false,
  });
  const calendarData = data?.data;

  const dayMap = useMemo(() => {
    const map = new Map<string, { dayType: number; holidayName?: string }>();
    (calendarData?.days ?? []).forEach((d: any) => {
      let dateStr: string | null = null;
      if (typeof d.date === 'string') {
        dateStr = d.date;
      } else if (Array.isArray(d.date)) {
        dateStr = `${d.date[0]}-${String(d.date[1]).padStart(2, '0')}-${String(
          d.date[2],
        ).padStart(2, '0')}`;
      } else if (typeof d.date === 'number') {
        dateStr = dayjs(d.date).format('YYYY-MM-DD');
      } else if (d.date !== null && d.date !== undefined) {
        dateStr = dayjs(String(d.date)).format('YYYY-MM-DD');
      }
      if (dateStr) {
        map.set(dateStr, {
          dayType: d.dayType ?? 1,
          holidayName: d.holidayName,
        });
      }
    });
    return map;
  }, [calendarData]);

  const monthStats = useMemo(() => {
    let workDays = 0;
    let restDays = 0;
    let holidayDays = 0;
    dayMap.forEach((info) => {
      if (info.dayType === 1) workDays++;
      else if (info.dayType === 2) restDays++;
      else if (info.dayType === 3) holidayDays++;
    });
    return { workDays, restDays, holidayDays };
  }, [dayMap]);

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const handleBatchSet = async (dayType: number) => {
    if (selectedDates.length === 0) {
      message.warning('请先选择日期');
      return;
    }
    setSaving(true);
    try {
      const name = dayType === 3 ? holidayName || undefined : undefined;
      await batchUpdateWorkCalendarUsingPut({
        days: selectedDates.map((date) => ({
          date,
          dayType,
          holidayName: name,
        })),
      });
      message.success(`已设置 ${selectedDates.length} 天`);
      setSelectedDates([]);
      setHolidayName('');
      queryClient.invalidateQueries({
        queryKey: ['work-calendar', year, month],
      });
    } catch (e: any) {
      message.error(e?.message || '设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInitYear = async () => {
    try {
      await generateWorkCalendarYearUsingPost({ year });
      message.success(`${year} 年标准日历已生成`);
      queryClient.invalidateQueries({
        queryKey: ['work-calendar', year, month],
      });
    } catch (e: any) {
      message.error(e?.message || '初始化失败');
    }
  };

  const handleSyncHolidays = async () => {
    try {
      const res = await syncWorkCalendarYearUsingPost({ year });
      const count = (res as any)?.data ?? 0;
      message.success(`已同步 ${year} 年法定节假日，共 ${count} 天`);
      queryClient.invalidateQueries({
        queryKey: ['work-calendar', year, month],
      });
    } catch (e: any) {
      message.error(e?.message || '同步失败');
    }
  };

  const dateCellRender = useCallback(
    (value: Dayjs) => {
      const dateStr = value.format('YYYY-MM-DD');
      const info = dayMap.get(dateStr);
      const dayType =
        info?.dayType ?? (value.day() === 0 || value.day() === 6 ? 2 : 1);
      const holidayNameFromServer = info?.holidayName;
      const cfg = DAY_TYPE_MAP[dayType] ?? DAY_TYPE_MAP[1];
      const isSelected = selectedDates.includes(dateStr);
      const isToday = value.isSame(dayjs(), 'day');
      const isCurrentMonth = value.month() === currentDate.month();

      return (
        <div
          onClick={isCurrentMonth ? () => toggleDate(dateStr) : undefined}
          style={{
            cursor: isCurrentMonth ? 'pointer' : 'default',
            borderRadius: 8,
            opacity: isCurrentMonth ? 1 : 0.3,
            background: isSelected ? '#1677ff' : cfg.lightBg,
            height: '100%',
            minHeight: 72,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSelected
              ? '0 2px 8px rgba(22, 119, 255, 0.35)'
              : 'none',
            transition: 'all 0.2s',
            position: 'relative' as const,
            border: isToday
              ? `2px solid ${cfg.color}`
              : '2px solid transparent',
          }}
        >
          {isSelected && (
            <CheckCircleFilled
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                fontSize: 18,
                color: '#fff',
                background: '#1677ff',
                borderRadius: '50%',
                border: '2px solid #fff',
              }}
            />
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: isSelected ? 700 : isToday ? 700 : 500,
              color: isSelected
                ? '#fff'
                : isCurrentMonth
                ? cfg.color
                : '#bfbfbf',
              lineHeight: 1.2,
              marginBottom: holidayNameFromServer ? 2 : 0,
            }}
          >
            {value.date()}
          </div>
          {holidayNameFromServer && (
            <Text
              style={{
                fontSize: 11,
                color: isSelected ? 'rgba(255,255,255,0.9)' : cfg.color,
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '0 4px',
              }}
              title={holidayNameFromServer}
            >
              {holidayNameFromServer}
            </Text>
          )}
        </div>
      );
    },
    [dayMap, selectedDates, currentDate],
  );

  const clearSelection = () => {
    setSelectedDates([]);
    setHolidayName('');
  };

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '工作日设置',
      }}
    >
      {/* 全局样式覆盖 - 确保日历默认样式被清除 */}
      <style>{`
        .ant-picker-calendar .ant-picker-calendar-date-value {
          display: none !important;
        }
        .ant-picker-calendar .ant-picker-cell-today .ant-picker-cell-inner::before {
          display: none !important;
        }
        .ant-picker-calendar .ant-picker-cell-today .ant-picker-calendar-date {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        .ant-picker-calendar .ant-picker-calendar-date {
          padding: 0 !important;
          border: none !important;
        }
        .ant-picker-calendar .ant-picker-calendar-date-content {
          height: 100% !important;
          padding: 4px !important;
        }
        .ant-picker-calendar .ant-picker-cell-selected .ant-picker-calendar-date,
        .ant-picker-calendar .ant-picker-cell:hover .ant-picker-calendar-date {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* 月度统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1677ff',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <CalendarOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}
                >
                  工作日
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#1677ff' }}
                >
                  {monthStats.workDays}
                  <span
                    style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}
                  >
                    天
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#52c41a',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <SmileOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}
                >
                  休息日
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}
                >
                  {monthStats.restDays}
                  <span
                    style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}
                  >
                    天
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fa8c16',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <StarOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}
                >
                  节假日
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}
                >
                  {monthStats.holidayDays}
                  <span
                    style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}
                  >
                    天
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 操作卡片 */}
      <Card
        style={{ marginBottom: 16 }}
        variant="borderless"
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space size={16} align="center">
            <Space size={8}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: '#e6f4ff',
                  border: '1px solid #91caff',
                }}
              />
              <Text style={{ fontSize: 13 }}>工作日</Text>
            </Space>
            <Space size={8}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                }}
              />
              <Text style={{ fontSize: 13 }}>休息日</Text>
            </Space>
            <Space size={8}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: '#fff7e6',
                  border: '1px solid #ffd591',
                }}
              />
              <Text style={{ fontSize: 13 }}>节假日</Text>
            </Space>
          </Space>

          <Space size="middle" wrap align="center">
            {selectedDates.length > 0 && (
              <Space size={12} align="center">
                <Tag color="blue" style={{ margin: 0 }}>
                  已选 {selectedDates.length} 天
                </Tag>
                <Select
                  placeholder="批量设置"
                  style={{ width: 140 }}
                  options={BATCH_OPTIONS}
                  onChange={handleBatchSet}
                  loading={saving}
                />
                <Input
                  placeholder="节假日名称（选填）"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  style={{ width: 160 }}
                  allowClear
                />
                <Button onClick={clearSelection} size="small" shape="round">
                  取消选中
                </Button>
              </Space>
            )}
            <Space size={8}>
              <Popconfirm
                title={`确认将${year}年全部初始化为标准工作日历？\n（周一~五=工作日，周六日=休息日）`}
                onConfirm={handleInitYear}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  shape="round"
                  style={{ color: '#1677ff', borderColor: '#1677ff' }}
                >
                  初始化全年
                </Button>
              </Popconfirm>
              <Popconfirm
                title={`确认从外部同步${year}年法定节假日？将自动标记节假日和调休`}
                onConfirm={handleSyncHolidays}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  shape="round"
                  style={{ color: '#1677ff', borderColor: '#1677ff' }}
                >
                  同步节假日
                </Button>
              </Popconfirm>
            </Space>
          </Space>
        </div>
      </Card>

      {/* 日历 */}
      <Card variant="borderless" styles={{ body: { padding: 16 } }}>
        {isError ? (
          <Result
            status="error"
            title="加载失败"
            subTitle="无法获取工作日历数据"
            extra={<Button onClick={() => refetch()}>重试</Button>}
          />
        ) : (
          <Calendar
            value={currentDate}
            onChange={setCurrentDate}
            fullscreen
            dateCellRender={dateCellRender}
            disabledDate={(d) => d.month() !== currentDate.month()}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default WorkdaySettings;
