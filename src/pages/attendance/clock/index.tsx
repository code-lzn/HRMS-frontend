import {
  clockUsingPost,
  queryRecordsUsingGet,
} from '@/api/attendanceController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Radio,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  TreeSelect,
  Typography,
  message,
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

const AttendanceClock: React.FC = () => {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(dayjs());
  const [clockType, setClockType] = useState<'in' | 'out'>('in');

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

  // 今日打卡统计
  const todayStats = useMemo(() => {
    const today = now.format('YYYY-MM-DD');
    const todayRecords = records.filter((r) => r.attendanceDate === today);
    const clockedIn = todayRecords.filter((r) => r.actualStartTime).length;
    const clockedOut = todayRecords.filter((r) => r.actualEndTime).length;
    return { total: records.length, clockedIn, clockedOut };
  }, [records, now]);

  // 打卡
  const handleClock = async () => {
    try {
      await clockUsingPost({
        type: clockType,
        timestamp: now.valueOf(),
        location: '上海市浦东新区',
      } as any);
      message.success(clockType === 'in' ? '上班打卡成功' : '下班打卡成功');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } catch (e: any) {
      message.error(e?.message || '打卡失败');
    }
  };

  const handleReset = () => {
    setFilterEmployeeId(undefined);
    setFilterDeptId(undefined);
    setFilterDateRange(null);
    setFilterStartStatus(undefined);
    setFilterEndStatus(undefined);
    setPage(1);
  };

  const columns: ColumnsType<RecordRow> = [
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

  return (
    <PageContainer header={{ breadcrumb: {}, title: '考勤打卡' }}>
      {/* 顶部打卡卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              color: '#fff',
            }}
            styles={{ body: { padding: 32 } }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Space direction="vertical" size={4}>
                  <span style={{ fontSize: 14, opacity: 0.85 }}>
                    <FieldTimeOutlined style={{ marginRight: 6 }} />
                    当前时间
                  </span>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  >
                    {now.format('HH:mm:ss')}
                  </span>
                  <span style={{ fontSize: 14, opacity: 0.85 }}>
                    {now.format('YYYY年MM月DD日 dddd')}
                  </span>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size={12} align="end">
                  <Radio.Group
                    value={clockType}
                    onChange={(e) => setClockType(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Radio.Button
                      value="in"
                      style={{ color: clockType === 'in' ? '#1677ff' : '#fff' }}
                    >
                      上班打卡
                    </Radio.Button>
                    <Radio.Button
                      value="out"
                      style={{
                        color: clockType === 'out' ? '#1677ff' : '#fff',
                      }}
                    >
                      下班打卡
                    </Radio.Button>
                  </Radio.Group>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={handleClock}
                    style={{
                      background: '#fff',
                      color: '#1677ff',
                      borderColor: '#fff',
                      fontWeight: 600,
                      minWidth: 180,
                      height: 48,
                    }}
                  >
                    {clockType === 'in' ? '上班打卡' : '下班打卡'}
                  </Button>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    上海市浦东新区张江高科
                  </span>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card bordered={false}>
                <Statistic
                  title="今日上班打卡"
                  value={todayStats.clockedIn}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Statistic
                  title="今日下班打卡"
                  value={todayStats.clockedOut}
                  prefix={<CheckCircleOutlined style={{ color: '#1677ff' }} />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card bordered={false}>
                <Statistic
                  title="本月总记录"
                  value={todayStats.total}
                  suffix="条"
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 筛选 */}
      <Card
        style={{ marginBottom: 16 }}
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
              }}
              allowClear
              showSearch
              filterOption={false}
              onSearch={handleSearchEmployee}
              notFoundContent={null}
              style={{ width: '100%' }}
            />
          </div>
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
          <div style={{ width: 260 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              考勤日期
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
              }}
            />
          </div>
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

      {/* 列表 */}
      <Card
        bordered={false}
        title="打卡记录列表"
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        <Table
          rowKey="id"
          columns={columns}
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
      </Card>
    </PageContainer>
  );
};

export default AttendanceClock;
