import {
  getBalancesUsingGet,
  queryRequestsUsingGet,
} from '@/api/leaveController';
import request from '@/libs/request';
import {
  CalendarOutlined,
  PlusOutlined,
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
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

interface LeaveRow {
  id: number;
  userName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  createTime: string;
}

interface BalanceItem {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

const LeaveManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [form] = Form.useForm();

  // 假期余额
  const { data: balanceResp } = useQuery({
    queryKey: ['leave', 'balances'],
    queryFn: async () => getBalancesUsingGet({}),
  });
  const balanceData = balanceResp?.data;
  const balances: BalanceItem[] = Array.isArray(balanceData)
    ? (balanceData as BalanceItem[])
    : balanceData
    ? [balanceData as BalanceItem]
    : [];

  // 请假记录
  const {
    data: listResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['leave', 'requests', keyword, status],
    queryFn: async () =>
      queryRequestsUsingGet({
        page: 1,
        size: 20,
        keyword: keyword || undefined,
        status: status || undefined,
      } as any),
  });
  const raw = (listResp as any)?.data?.records;
  const list: LeaveRow[] = Array.isArray(raw) ? raw : [];

  const LEAVE_TYPE_MAP: Record<string, number> = {
    年假: 1, 病假: 2, 事假: 3, 婚假: 4, 产假: 5, 丧假: 6, 调休: 7,
  };

  // 提交请假
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange ?? [];
      await request('/api/leave/requests', {
        method: 'POST',
        data: {
          leaveType: LEAVE_TYPE_MAP[values.type] ?? 3,
          startTime: start?.format('YYYY-MM-DDTHH:mm:ss'),
          endTime: end?.format('YYYY-MM-DDTHH:mm:ss'),
          leaveDays: values.days,
          reason: values.reason,
          submitDirectly: true,
        },
      });
      message.success('请假申请已提交');
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '提交失败');
    }
  };

  const columns: ColumnsType<LeaveRow> = [
    { title: '申请人', dataIndex: 'userName', key: 'userName', width: 120 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => {
        const map: Record<string, string> = {
          事假: 'orange',
          病假: 'red',
          年假: 'blue',
          婚假: 'magenta',
          产假: 'purple',
          调休: 'green',
        };
        return <Tag color={map[v] ?? 'default'}>{v}</Tag>;
      },
    },
    { title: '开始', dataIndex: 'startDate', key: 'startDate', width: 120 },
    { title: '结束', dataIndex: 'endDate', key: 'endDate', width: 120 },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
      width: 80,
      align: 'right',
    },
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
          已撤回: { color: 'default', text: '已撤回' },
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
        title: '请假管理',
      }}
    >
      {/* 假期余额 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {balances.length === 0 ? (
          <Col span={24}>
            <Card bordered={false}>
              <Empty description="暂无假期余额数据" />
            </Card>
          </Col>
        ) : (
          balances.map((b) => {
            const usedPercent = b.total > 0 ? (b.used / b.total) * 100 : 0;
            return (
              <Col span={6} key={b.type}>
                <Card bordered={false}>
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size={8}
                  >
                    <Space>
                      <CalendarOutlined style={{ color: '#1677ff' }} />
                      <strong>{b.type}</strong>
                    </Space>
                    <Statistic
                      title="剩余"
                      value={b.remaining ?? 0}
                      suffix="天"
                      valueStyle={{ color: '#1677ff' }}
                    />
                    <Progress
                      percent={Number(usedPercent.toFixed(1))}
                      size="small"
                      format={() => `已用 ${b.used ?? 0} / 共 ${b.total ?? 0}`}
                    />
                  </Space>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      {/* 筛选 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索申请人"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="状态"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: '待审批', label: '待审批' },
              { value: '已通过', label: '已通过' },
              { value: '已拒绝', label: '已拒绝' },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            申请请假
          </Button>
        </Space>
      </Card>

      {/* 列表 */}
      <Card bordered={false} title="请假记录">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : list}
          loading={isLoading}
          locale={{
            emptyText: isError ? (
              <Result
                status="error"
                title="加载失败"
                subTitle="请检查后端服务"
              />
            ) : (
              <Empty description="暂无请假记录" />
            ),
          }}
        />
      </Card>

      {/* 申请弹窗 */}
      <Modal
        title="申请请假"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        centered
        okText="提交"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="type"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select
              options={[
                { value: '事假', label: '事假' },
                { value: '病假', label: '病假' },
                { value: '年假', label: '年假' },
                { value: '婚假', label: '婚假' },
                { value: '产假', label: '产假' },
                { value: '调休', label: '调休' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="请假时间"
            rules={[{ required: true, message: '请选择请假时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="days"
            label="请假天数"
            rules={[{ required: true, message: '请输入请假天数' }]}
          >
            <InputNumber
              min={0.5}
              max={365}
              step={0.5}
              style={{ width: '100%' }}
              placeholder="可填 0.5"
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="请假原因"
            rules={[{ required: true, message: '请输入请假原因' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请详细说明请假原因"
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default LeaveManagement;
