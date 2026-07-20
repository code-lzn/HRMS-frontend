import {
  batchUpdateWorkCalendarUsingPut,
  generateWorkCalendarYearUsingPost,
  getWorkCalendarUsingGet,
  syncWorkCalendarYearUsingPost,
} from '@/api/workCalendarController';
import {
  CheckCircleFilled,
  ClearOutlined,
  CloudSyncOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Calendar,
  Card,
  Input,
  message,
  Popconfirm,
  Result,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';

const DAY_TYPE_MAP: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  1: { label: '工作日', color: '#1677ff', bg: '#e6f4ff' },
  2: { label: '休息日', color: '#999', bg: '#f5f5f5' },
  3: { label: '节假日', color: '#fa8c16', bg: '#fff7e6' },
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

  // 拉取当前月工作日历
  const { data, isError, refetch } = useQuery({
    queryKey: ['work-calendar', year, month],
    queryFn: async () => getWorkCalendarUsingGet({ year, month }),
  });
  const calendarData = data?.data;

  // date → dayType + holidayName（兼容后端 Jackson LocalDate 序列化格式）
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

  // 切换某天的选中状态
  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  // 批量设置
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

  // 初始化全年
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

  // 同步法定节假日
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

  // 自定义日历单元格
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

      const cell = (
        <div
          onClick={isCurrentMonth ? () => toggleDate(dateStr) : undefined}
          style={{
            cursor: isCurrentMonth ? 'pointer' : 'not-allowed',
            padding: 4,
            borderRadius: 8,
            opacity: isCurrentMonth ? 1 : 0.4,
            background: isSelected
              ? '#1677ff'
              : isCurrentMonth
              ? cfg.bg
              : '#f5f5f5',
            border: isToday
              ? '2px solid #1677ff'
              : isSelected
              ? '2px solid #0958d9'
              : isCurrentMonth
              ? '2px solid transparent'
              : '1px solid #e8e8e8',
            minHeight: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: isSelected
              ? '0 2px 8px rgba(22, 119, 255, 0.35)'
              : 'none',
            transition: 'all 0.2s',
            position: 'relative' as const,
          }}
        >
          {/* 选中勾 */}
          {isSelected && (
            <CheckCircleFilled
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                fontSize: 16,
                color: '#1677ff',
                background: '#fff',
                borderRadius: '50%',
              }}
            />
          )}
          <div
            style={{
              fontSize: 14,
              fontWeight: isSelected ? 700 : isToday ? 600 : 400,
              color: isSelected
                ? '#fff'
                : isCurrentMonth
                ? '#262626'
                : '#bfbfbf',
            }}
          >
            {value.date()}
          </div>
          <Tag
            color={isSelected ? 'default' : cfg.color}
            style={{
              margin: 0,
              fontSize: 10,
              padding: '0 4px',
              lineHeight: '16px',
            }}
          >
            {cfg.label}
          </Tag>
          {holidayNameFromServer && (
            <Typography.Text
              style={{
                fontSize: 10,
                color: isSelected ? 'rgba(255,255,255,0.85)' : '#fa8c16',
                lineHeight: '14px',
              }}
              ellipsis
            >
              {holidayNameFromServer}
            </Typography.Text>
          )}
        </div>
      );

      return cell;
    },
    [dayMap, selectedDates, currentDate],
  );

  // 清除选中
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
      {/* 操作卡片 */}
      <Card
        style={{ marginBottom: 16 }}
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
          <Space size={4}>
            <Tag color="#1677ff">工作日</Tag>
            <Tag color="#999">休息日</Tag>
            <Tag color="#fa8c16">节假日</Tag>
          </Space>

          <Space size="middle" wrap>
            {selectedDates.length > 0 && (
              <>
                <Typography.Text type="secondary">
                  已选 {selectedDates.length} 天
                </Typography.Text>
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
                <Button
                  onClick={clearSelection}
                  icon={<ClearOutlined />}
                  size="small"
                >
                  取消选中
                </Button>
              </>
            )}
            <Popconfirm
              title={`确认将${year}年全部初始化为标准工作日历？\n（周一~五=工作日，周六日=休息日）`}
              onConfirm={handleInitYear}
              okText="确认"
              cancelText="取消"
            >
              <Button icon={<ReloadOutlined />}>初始化全年</Button>
            </Popconfirm>
            <Popconfirm
              title={`确认从外部同步${year}年法定节假日？将自动标记节假日和调休`}
              onConfirm={handleSyncHolidays}
              okText="确认"
              cancelText="取消"
            >
              <Button icon={<CloudSyncOutlined />}>同步节假日</Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>

      {/* 日历 */}
      <Card bordered={false} styles={{ body: { padding: 16 } }}>
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
