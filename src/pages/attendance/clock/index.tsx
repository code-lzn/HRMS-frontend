import {
  clockUsingPost,
  queryRecordsUsingGet,
  querySupplementCardsUsingGet,
  submitSupplementCardUsingPost,
} from '@/api/attendanceController';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

const { RangePicker } = DatePicker;

/** 打卡记录行 */
interface RecordRow {
  id: number;
  userName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  workHours: number;
  remark?: string;
}

/** 补卡申请行 */
interface SupplementRow {
  id: number;
  userName: string;
  date: string;
  type: string;
  reason: string;
  status: string;
  createTime: string;
}

const AttendanceClock: React.FC = () => {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(dayjs());
  const [clockType, setClockType] = useState<'in' | 'out'>('in');
  const [supplementOpen, setSupplementOpen] = useState(false);
  const [supplementForm] = Form.useForm();

  // 实时时钟
  React.useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 打卡记录
  const {
    data: recordsResp,
    isLoading: recordsLoading,
    isError: recordsError,
  } = useQuery({
    queryKey: ['attendance', 'records'],
    queryFn: async () => queryRecordsUsingGet({ current: 1, pageSize: 20 }),
  });
  const records: RecordRow[] = Array.isArray(
    (recordsResp as any)?.data?.records,
  )
    ? ((recordsResp as any).data.records as RecordRow[])
    : [];

  // 补卡申请
  const {
    data: supplementResp,
    isLoading: supplementLoading,
    isError: supplementError,
  } = useQuery({
    queryKey: ['attendance', 'supplement-cards'],
    queryFn: async () => querySupplementCardsUsingGet({ page: 1, size: 20 }),
  });
  const supplements: SupplementRow[] = Array.isArray(
    (supplementResp as any)?.data?.records,
  )
    ? ((supplementResp as any).data.records as SupplementRow[])
    : [];

  // 今日打卡统计
  const todayStats = useMemo(() => {
    const today = now.format('YYYY-MM-DD');
    const todayRecords = records.filter((r) => r.date === today);
    const clockedIn = todayRecords.filter((r) => r.clockIn).length;
    const clockedOut = todayRecords.filter((r) => r.clockOut).length;
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

  // 提交补卡申请
  const handleSubmitSupplement = async () => {
    try {
      const values = await supplementForm.validateFields();
      await submitSupplementCardUsingPost({
        ...values,
        timestamp: Date.now(),
      } as any);
      message.success('补卡申请已提交');
      setSupplementOpen(false);
      supplementForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '提交失败');
    }
  };

  const recordColumns: ColumnsType<RecordRow> = [
    { title: '员工', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '上班打卡',
      dataIndex: 'clockIn',
      key: 'clockIn',
      width: 120,
      render: (v: string) =>
        v ? <Tag color="green">{v}</Tag> : <Tag color="default">未打卡</Tag>,
    },
    {
      title: '下班打卡',
      dataIndex: 'clockOut',
      key: 'clockOut',
      width: 120,
      render: (v: string) =>
        v ? <Tag color="blue">{v}</Tag> : <Tag color="default">未打卡</Tag>,
    },
    {
      title: '工时',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 100,
      render: (h: number) => `${h ?? 0} 小时`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const map: Record<string, { color: string; text: string }> = {
          正常: { color: 'green', text: '正常' },
          迟到: { color: 'orange', text: '迟到' },
          早退: { color: 'orange', text: '早退' },
          缺卡: { color: 'red', text: '缺卡' },
        };
        const cfg = map[s] ?? { color: 'default', text: s ?? '-' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const supplementColumns: ColumnsType<SupplementRow> = [
    { title: '申请人', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: '补卡日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const map: Record<string, { color: string; text: string }> = {
          待审批: { color: 'processing', text: '待审批' },
          已通过: { color: 'success', text: '已通过' },
          已拒绝: { color: 'error', text: '已拒绝' },
        };
        const cfg = map[s] ?? { color: 'default', text: s ?? '-' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '考勤打卡',
      }}
    >
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

      {/* 提示 */}
      <Alert
        message="工作日 09:00-18:00，迟到超过 30 分钟将扣除当日全勤奖"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 记录与补卡 */}
      <Card bordered={false}>
        <Tabs
          defaultActiveKey="records"
          items={[
            {
              key: 'records',
              label: '打卡记录',
              children: recordsError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="无法获取打卡记录，请检查后端服务是否运行"
                />
              ) : (
                <Table
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={records}
                  loading={recordsLoading}
                  pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无打卡记录" /> }}
                />
              ),
            },
            {
              key: 'supplements',
              label: (
                <span>
                  补卡申请{' '}
                  <Badge
                    count={supplements.length}
                    style={{ backgroundColor: '#1677ff' }}
                  />
                </span>
              ),
              children: supplementError ? (
                <Result
                  status="error"
                  title="加载失败"
                  subTitle="无法获取补卡申请，请检查后端服务是否运行"
                />
              ) : (
                <>
                  <div style={{ marginBottom: 12, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      onClick={() => setSupplementOpen(true)}
                    >
                      申请补卡
                    </Button>
                  </div>
                  <Table
                    rowKey="id"
                    columns={supplementColumns}
                    dataSource={supplements}
                    loading={supplementLoading}
                    pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
                    locale={{ emptyText: <Empty description="暂无补卡申请" /> }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* 补卡弹窗 */}
      <Modal
        title="补卡申请"
        open={supplementOpen}
        onCancel={() => setSupplementOpen(false)}
        onOk={handleSubmitSupplement}
        centered
        okText="提交"
        cancelText="取消"
      >
        <Form form={supplementForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="date"
            label="补卡日期"
            rules={[{ required: true, message: '请选择补卡日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="type"
            label="补卡类型"
            rules={[{ required: true, message: '请选择补卡类型' }]}
          >
            <Select
              options={[
                { label: '上班卡', value: '上班卡' },
                { label: '下班卡', value: '下班卡' },
                { label: '全天', value: '全天' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="补卡原因"
            rules={[{ required: true, message: '请输入补卡原因' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请详细说明补卡原因"
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AttendanceClock;
