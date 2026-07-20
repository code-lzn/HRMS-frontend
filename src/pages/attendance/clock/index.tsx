import {
  queryRecordsUsingGet,
  querySupplementCardsUsingGet,
} from '@/api/attendanceController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { getWorkCalendarUsingGet } from '@/api/workCalendarController';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  SearchOutlined,
  StarFilled,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Result,
  Row,
  Select,
  Table,
  Tabs,
  Tag,
  TreeSelect,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

const { RangePicker } = DatePicker;

interface RecordRow {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  attendanceDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime: string;
  actualEndTime: string;
  shiftType: number;
  startStatus: number;
  startStatusDesc: string;
  endStatus: number;
  endStatusDesc: string;
}

interface SupplementRow {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  attendanceDate: string;
  cardType: number;
  cardTypeDesc: string;
  reason: string;
  status: number;
  statusDesc: string;
  createTime: string;
}

const START_STATUS_MAP: Record<number, { color: string }> = {
  1: { color: 'green' },
  2: { color: 'orange' },
  3: { color: 'red' },
  4: { color: 'purple' },
};

const END_STATUS_MAP: Record<number, { color: string }> = {
  1: { color: 'green' },
  2: { color: 'orange' },
  3: { color: 'red' },
  4: { color: 'purple' },
};

const DAY_TYPE_CONFIG: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  1: { label: '工作日', color: '#1677ff', bg: 'rgba(22,119,255,0.12)' },
  2: { label: '休息日', color: '#52c41a', bg: 'rgba(82,196,26,0.12)' },
  3: { label: '节假日', color: '#fa8c16', bg: 'rgba(250,140,22,0.12)' },
};

const AttendanceClock: React.FC = () => {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(dayjs());
  const [activeTab, setActiveTab] = useState<string>('records');

  // 筛选状态
  const [filterEmployeeId, setFilterEmployeeId] = useState<
    number | undefined
  >();
  const [filterDeptId, setFilterDeptId] = useState<number | undefined>();
  const [filterDateRange, setFilterDateRange] = useState<
    [string, string] | null
  >(null);
  const [filterStartStatus, setFilterStartStatus] = useState<
    number | undefined
  >();
  const [filterEndStatus, setFilterEndStatus] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 补卡筛选
  const [suppStatus, setSuppStatus] = useState<number | undefined>();
  const [suppPage, setSuppPage] = useState(1);
  const [suppPageSize, setSuppPageSize] = useState(10);

  // 数据源
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

  const [employeeOptions, setEmployeeOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const handleSearchEmployee = async (keyword: string) => {
    if (!keyword) {
      setEmployeeOptions([]);
      return;
    }
    try {
      const res = await getEmployeeListUsingGet({
        keyword,
        current: 1,
        pageSize: 20,
      });
      const records = (res as any)?.data?.records ?? [];
      setEmployeeOptions(
        records.map((r: any) => ({
          label: `${r.name} (${r.employeeNo})`,
          value: r.id,
        })),
      );
    } catch {
      setEmployeeOptions([]);
    }
  };

  // 实时时钟
  React.useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 工作日历 - 判断今天类型
  const { data: calendarData } = useQuery({
    queryKey: ['work-calendar', now.year(), now.month() + 1],
    queryFn: () =>
      getWorkCalendarUsingGet({ year: now.year(), month: now.month() + 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const todayInfo = useMemo(() => {
    const today = now.format('YYYY-MM-DD');
    const days = (calendarData as any)?.data?.days ?? [];
    return days.find((d: any) => {
      if (typeof d.date === 'string') return d.date === today;
      if (Array.isArray(d.date)) {
        return (
          `${d.date[0]}-${String(d.date[1]).padStart(2, '0')}-${String(
            d.date[2],
          ).padStart(2, '0')}` === today
        );
      }
      return false;
    });
  }, [calendarData, now]);

  // 打卡记录
  const {
    data: recordsResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'attendance',
      'records',
      filterEmployeeId,
      filterDeptId,
      filterDateRange,
      filterStartStatus,
      filterEndStatus,
      page,
      pageSize,
    ],
    queryFn: async () =>
      queryRecordsUsingGet({
        employeeId: filterEmployeeId,
        departmentId: filterDeptId,
        startDate: filterDateRange?.[0],
        endDate: filterDateRange?.[1],
        startStatus: filterStartStatus,
        endStatus: filterEndStatus,
        current: page,
        pageSize,
      }),
  });
  const raw = (recordsResp as any)?.data?.records;
  const records: RecordRow[] = Array.isArray(raw) ? raw : [];
  const total = (recordsResp as any)?.data?.total ?? 0;

  // 补卡记录
  const {
    data: suppResp,
    isLoading: suppLoading,
    isError: suppError,
  } = useQuery({
    queryKey: [
      'attendance',
      'supplement',
      filterEmployeeId,
      filterDateRange,
      suppStatus,
      suppPage,
      suppPageSize,
    ],
    queryFn: async () =>
      querySupplementCardsUsingGet({
        employeeId: filterEmployeeId,
        startDate: filterDateRange?.[0],
        endDate: filterDateRange?.[1],
        status: suppStatus,
        page: suppPage,
        size: suppPageSize,
      }),
    enabled: true,
  });
  const suppRaw = (suppResp as any)?.data?.records;
  const supplements: SupplementRow[] = Array.isArray(suppRaw) ? suppRaw : [];
  const suppTotal = (suppResp as any)?.data?.total ?? 0;

  // 今日打卡统计
  const todayStats = useMemo(() => {
    const today = now.format('YYYY-MM-DD');
    const todayRecords = records.filter((r) => r.attendanceDate === today);
    const clockedIn = todayRecords.filter((r) => r.actualStartTime).length;
    const clockedOut = todayRecords.filter((r) => r.actualEndTime).length;
    return { total: records.length, clockedIn, clockedOut };
  }, [records, now]);

  // 今日状态描述
  const todayStatusText = useMemo(() => {
    const cfg = DAY_TYPE_CONFIG[todayInfo?.dayType] ?? null;
    if (!cfg) return null;
    const holidayName = todayInfo?.holidayName;
    if (cfg.label === '节假日' && holidayName) return holidayName;
    return cfg.label;
  }, [todayInfo]);

  const handleReset = () => {
    setFilterEmployeeId(undefined);
    setFilterDeptId(undefined);
    setFilterDateRange(null);
    setFilterStartStatus(undefined);
    setFilterEndStatus(undefined);
    setSuppStatus(undefined);
    setPage(1);
    setSuppPage(1);
  };

  const recordColumns: ColumnsType<RecordRow> = [
    {
      title: '员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 90,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '考勤日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '排班时间',
      key: 'scheduled',
      width: 190,
      align: 'center',
      render: (_: any, r) => {
        if (!r.scheduledStartTime || !r.scheduledEndTime) return '-';
        const timeText = `${r.scheduledStartTime} ~ ${r.scheduledEndTime}`;
        if (r.shiftType === 2) {
          return (
            <span>
              <Tag
                color="orange"
                style={{ margin: 0, fontSize: 11, padding: '0 4px' }}
              >
                核心
              </Tag>
              <span
                style={{
                  marginLeft: 4,
                  fontVariantNumeric: 'tabular-nums' as any,
                }}
              >
                {timeText}
              </span>
            </span>
          );
        }
        return (
          <span style={{ fontVariantNumeric: 'tabular-nums' as any }}>
            {timeText}
          </span>
        );
      },
    },
    {
      title: '上班打卡',
      dataIndex: 'actualStartTime',
      key: 'actualStartTime',
      width: 100,
      align: 'center',
      render: (v: string) =>
        v ? dayjs(v).format('HH:mm') : <Tag color="blue">未打卡</Tag>,
    },
    {
      title: '下班打卡',
      dataIndex: 'actualEndTime',
      key: 'actualEndTime',
      width: 100,
      align: 'center',
      render: (v: string) =>
        v ? dayjs(v).format('HH:mm') : <Tag color="blue">未打卡</Tag>,
    },
    {
      title: '上班状态',
      dataIndex: 'startStatus',
      key: 'startStatus',
      width: 90,
      align: 'center',
      render: (v: number, r) => {
        if (v === null || v === undefined)
          return <Tag color="blue">未打卡</Tag>;
        const cfg = START_STATUS_MAP[v] ?? { color: 'default' };
        return <Tag color={cfg.color}>{r.startStatusDesc || String(v)}</Tag>;
      },
    },
    {
      title: '下班状态',
      dataIndex: 'endStatus',
      key: 'endStatus',
      width: 90,
      align: 'center',
      render: (v: number, r) => {
        if (v === null || v === undefined)
          return <Tag color="blue">未打卡</Tag>;
        const cfg = END_STATUS_MAP[v] ?? { color: 'default' };
        return <Tag color={cfg.color}>{r.endStatusDesc || String(v)}</Tag>;
      },
    },
  ];

  const supplementColumns: ColumnsType<SupplementRow> = [
    {
      title: '申请人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 90,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '补卡日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '类型',
      dataIndex: 'cardTypeDesc',
      key: 'cardType',
      width: 90,
      align: 'center',
      render: (v: string, r) => {
        const colorMap: Record<number, string> = {
          1: 'blue',
          2: 'orange',
          3: 'green',
        };
        return <Tag color={colorMap[r.cardType] ?? 'default'}>{v || '-'}</Tag>;
      },
    },
    { title: '原因', dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      key: 'status',
      width: 90,
      align: 'center',
      render: (v: string, r) => {
        const colorMap: Record<number, string> = {
          1: 'cyan',
          2: 'processing',
          3: 'success',
          4: 'error',
        };
        return <Tag color={colorMap[r.status] ?? 'default'}>{v || '-'}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
  ];

  const dayTypeCfg =
    todayInfo?.dayType !== null && todayInfo?.dayType !== undefined
      ? DAY_TYPE_CONFIG[todayInfo.dayType]
      : null;

  // 统计卡片渲染
  const statCard = (
    title: string,
    value: number,
    icon: React.ReactNode,
    iconBg: string,
    valueColor: string,
    suffix?: string,
  ) => (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        flex: 1,
        minWidth: 140,
      }}
      styles={{ body: { padding: '20px 20px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 2 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: valueColor,
              lineHeight: 1.2,
            }}
          >
            {value}
            {suffix && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#8c8c8c',
                  marginLeft: 4,
                }}
              >
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <PageContainer header={{ breadcrumb: {}, title: '考勤打卡' }}>
      {/* 顶部时钟卡片 */}
      <Card
        style={{
          marginBottom: 16,
          background:
            'linear-gradient(135deg, #3b82c4 0%, #5b9bd5 40%, #7bb3e0 100%)',
          color: '#fff',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(59,130,196,0.25)',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* 今日状态标签 */}
          {dayTypeCfg && (
            <Tag
              style={{
                margin: 0,
                border: 'none',
                borderRadius: 20,
                padding: '2px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: dayTypeCfg.color,
                background: 'rgba(255,255,255,0.85)',
              }}
            >
              {dayTypeCfg.label === '节假日' ? (
                <>
                  <StarFilled style={{ marginRight: 4, fontSize: 12 }} />
                  {todayStatusText || dayTypeCfg.label}
                </>
              ) : (
                todayStatusText || dayTypeCfg.label
              )}
            </Tag>
          )}
          {/* 时间 */}
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace",
              letterSpacing: 2,
              lineHeight: 1.1,
            }}
          >
            {now.format('HH:mm:ss')}
          </span>
          {/* 日期 */}
          <span style={{ fontSize: 15, opacity: 0.9, fontWeight: 400 }}>
            {now.format('YYYY年MM月DD日')}
            <span style={{ marginLeft: 10, opacity: 0.75, fontSize: 14 }}>
              {now.format('dddd')}
            </span>
          </span>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statCard(
          '今日上班打卡',
          todayStats.clockedIn,
          <CheckCircleFilled style={{ color: '#52c41a' }} />,
          'rgba(82,196,26,0.12)',
          '#52c41a',
        )}
        {statCard(
          '今日下班打卡',
          todayStats.clockedOut,
          <CheckCircleFilled style={{ color: '#1677ff' }} />,
          'rgba(22,119,255,0.12)',
          '#1677ff',
        )}
        {statCard(
          '本月总记录',
          todayStats.total,
          <ClockCircleFilled style={{ color: '#722ed1' }} />,
          'rgba(114,46,209,0.12)',
          '#722ed1',
          '条',
        )}
      </Row>

      {/* 筛选 */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ width: 200 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              员工
            </Typography.Text>
            <Select
              placeholder="输入姓名搜索"
              options={employeeOptions}
              value={filterEmployeeId}
              onChange={(v) => {
                setFilterEmployeeId(v);
                setPage(1);
                setSuppPage(1);
              }}
              allowClear
              showSearch
              filterOption={false}
              onSearch={handleSearchEmployee}
              notFoundContent={null}
              style={{ width: '100%' }}
            />
          </div>
          {activeTab === 'records' && (
            <div style={{ width: 220 }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
              >
                部门
              </Typography.Text>
              <TreeSelect
                placeholder="选择部门"
                treeData={deptTreeSelectData}
                value={filterDeptId}
                onChange={(v) => {
                  setFilterDeptId(v);
                  setPage(1);
                }}
                allowClear
                style={{ width: '100%' }}
              />
            </div>
          )}
          <div style={{ width: 260 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              {activeTab === 'supplements' ? '补卡日期' : '考勤日期'}
            </Typography.Text>
            <RangePicker
              style={{ width: '100%' }}
              value={
                filterDateRange
                  ? [dayjs(filterDateRange[0]), dayjs(filterDateRange[1])]
                  : null
              }
              onChange={(dates) => {
                if (dates?.[0] && dates?.[1]) {
                  setFilterDateRange([
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD'),
                  ]);
                } else {
                  setFilterDateRange(null);
                }
                setPage(1);
                setSuppPage(1);
              }}
            />
          </div>
          {activeTab === 'records' ? (
            <>
              <div style={{ width: 140 }}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
                >
                  上班状态
                </Typography.Text>
                <Select
                  placeholder="选择状态"
                  allowClear
                  style={{ width: '100%' }}
                  value={filterStartStatus}
                  onChange={(v) => {
                    setFilterStartStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: 1, label: '正常' },
                    { value: 2, label: '迟到' },
                    { value: 3, label: '旷工半天' },
                    { value: 4, label: '缺卡' },
                  ]}
                />
              </div>
              <div style={{ width: 140 }}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
                >
                  下班状态
                </Typography.Text>
                <Select
                  placeholder="选择状态"
                  allowClear
                  style={{ width: '100%' }}
                  value={filterEndStatus}
                  onChange={(v) => {
                    setFilterEndStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: 1, label: '正常' },
                    { value: 2, label: '早退' },
                    { value: 3, label: '旷工半天' },
                    { value: 4, label: '缺卡' },
                  ]}
                />
              </div>
            </>
          ) : (
            <div style={{ width: 140 }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
              >
                补卡状态
              </Typography.Text>
              <Select
                placeholder="选择状态"
                allowClear
                style={{ width: '100%' }}
                value={suppStatus}
                onChange={(v) => {
                  setSuppStatus(v);
                  setSuppPage(1);
                }}
                options={[
                  { value: 2, label: '审批中' },
                  { value: 3, label: '已通过' },
                  { value: 4, label: '已拒绝' },
                ]}
              />
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              paddingTop: 20,
            }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['attendance'] })
              }
            >
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
        </div>
      </Card>

      {/* 列表 Tabs */}
      <Card
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
            setSuppPage(1);
          }}
        >
          <Tabs.TabPane tab="打卡记录" key="records" />
          <Tabs.TabPane tab="补卡记录" key="supplements" />
        </Tabs>
        {/* 打卡记录表格 */}
        {activeTab === 'records' && (
          <Table
            rowKey="id"
            columns={recordColumns}
            dataSource={isError ? [] : records}
            loading={isLoading}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            locale={{
              emptyText: isError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="请检查后端服务"
                />
              ) : (
                <Empty description="暂无打卡记录" />
              ),
            }}
          />
        )}
        {/* 补卡记录表格 */}
        {activeTab === 'supplements' && (
          <Table
            rowKey="id"
            columns={supplementColumns}
            dataSource={suppError ? [] : supplements}
            loading={suppLoading}
            pagination={{
              current: suppPage,
              pageSize: suppPageSize,
              total: suppTotal,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setSuppPage(p);
                setSuppPageSize(ps);
              },
            }}
            locale={{
              emptyText: suppError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="请检查后端服务"
                />
              ) : (
                <Empty description="暂无补卡记录" />
              ),
            }}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default AttendanceClock;
