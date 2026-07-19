import {
  queryRequestsUsingGet,
  submitLeaveRequestUsingPost,
} from '@/api/leaveController';
import { SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Result,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

interface LeaveRow {
  id: number;
  employeeName: string;
  leaveType: number;
  leaveTypeDesc: string;
  startTime: string;
  endTime: string;
  leaveDays: number;
  reason: string;
  status: number;
  statusDesc: string;
  createTime: string;
}

const LeaveManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>();
  const [leaveType, setLeaveType] = useState<number | undefined>();
  const [form] = Form.useForm();

  // 请假记录
  const {
    data: listResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['leave', 'requests', keyword, status, leaveType],
    queryFn: async () =>
      queryRequestsUsingGet({
        page: 1,
        size: 20,
        keyword: keyword || undefined,
        status: status || undefined,
        leaveType: leaveType || undefined,
      } as any),
  });
  const raw = (listResp as any)?.data?.records;
  const list: LeaveRow[] = Array.isArray(raw) ? raw : [];

  // 提交请假
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange ?? [];
      await submitLeaveRequestUsingPost({
        leaveType: values.leaveType,
        startTime: start?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: end?.format('YYYY-MM-DD HH:mm:ss'),
        reason: values.reason,
      } as any);
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
    {
      title: '申请人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 80,
      align: 'center',
      render: (v: number, record) => {
        const map: Record<number, { color: string }> = {
          1: { color: 'blue' },
          2: { color: 'red' },
          3: { color: 'orange' },
          4: { color: 'pink' },
          5: { color: 'purple' },
          6: { color: 'cyan' },
          7: { color: 'green' },
        };
        const cfg = map[v] ?? { color: 'default' };
        return (
          <Tag color={cfg.color}>
            {record.leaveTypeDesc || String(v ?? '-')}
          </Tag>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '天数',
      dataIndex: 'leaveDays',
      key: 'leaveDays',
      width: 60,
      align: 'center',
      render: (v: number) => (v !== null && v !== undefined ? `${v} 天` : '-'),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (s: number, record) => {
        const map: Record<number, { color: string }> = {
          1: { color: 'default' },
          2: { color: 'processing' },
          3: { color: 'success' },
          4: { color: 'error' },
          5: { color: 'default' },
        };
        const cfg = map[s] ?? { color: 'default' };
        return (
          <Tag color={cfg.color}>{record.statusDesc || String(s ?? '-')}</Tag>
        );
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

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '请假管理',
      }}
    >
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
            placeholder="请假类型"
            value={leaveType}
            onChange={setLeaveType}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 1, label: '年假' },
              { value: 2, label: '病假' },
              { value: 3, label: '事假' },
              { value: 4, label: '婚假' },
              { value: 5, label: '产假' },
              { value: 6, label: '丧假' },
              { value: 7, label: '调休' },
            ]}
          />
          <Select
            placeholder="状态"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 2, label: '审批中' },
              { value: 3, label: '已通过' },
              { value: 4, label: '已拒绝' },
            ]}
          />
        </Space>
      </Card>

      {/* 列表 */}
      <Card
        bordered={false}
        title="管理请假列表"
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : list}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
          }}
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
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select
              options={[
                { value: 3, label: '事假' },
                { value: 2, label: '病假' },
                { value: 1, label: '年假' },
                { value: 4, label: '婚假' },
                { value: 5, label: '产假' },
                { value: 6, label: '丧假' },
                { value: 7, label: '调休' },
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
