import {
  createOvertimeRecordUsingPost,
  deleteOvertimeRecordUsingDelete,
  queryRecordsUsingGet1,
  updateOvertimeRecordUsingPut,
} from '@/api/overtimeRecordController';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Result,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

interface OvertimeRow {
  id: number;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  type: string;
  reason: string;
  status: string;
}

const OvertimeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [form] = Form.useForm();

  // 列表
  const { data, isLoading, isError } = useQuery({
    queryKey: ['overtime', 'records'],
    queryFn: async () => queryRecordsUsingGet1({ page: 1, size: 20 }),
  });
  const raw = (data as any)?.data?.records;
  const list: OvertimeRow[] = Array.isArray(raw) ? raw : [];

  // 新增
  const handleAdd = () => {
    setModalMode('create');
    setCurrentId(undefined);
    form.resetFields();
    setModalOpen(true);
  };

  // 编辑
  const handleEdit = (record: OvertimeRow) => {
    setModalMode('edit');
    setCurrentId(record.id);
    form.setFieldsValue({
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      hours: record.hours,
      type: record.type,
      reason: record.reason,
    });
    setModalOpen(true);
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'create') {
        await createOvertimeRecordUsingPost(values as any);
        message.success('加班申请已提交');
      } else if (currentId) {
        await updateOvertimeRecordUsingPut({ id: currentId }, values as any);
        message.success('加班记录已更新');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteOvertimeRecordUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  const columns: ColumnsType<OvertimeRow> = [
    { title: '员工', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: '加班日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 110,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 110,
    },
    {
      title: '时长(小时)',
      dataIndex: 'hours',
      key: 'hours',
      width: 110,
      align: 'right',
      render: (h: number) => (
        <strong>
          <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 4 }} />
          {h ?? 0}
        </strong>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => {
        const map: Record<string, string> = {
          工作日: 'blue',
          周末: 'orange',
          节假日: 'red',
        };
        return <Tag color={map[v] ?? 'default'}>{v}</Tag>;
      },
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
        };
        const cfg = map[s] ?? { color: 'default', text: s ?? '-' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该加班记录？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '加班管理',
      }}
    >
      <Card
        bordered={false}
        title="加班记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            申请加班
          </Button>
        }
      >
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
              <Empty description="暂无加班记录" />
            ),
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '申请加班' : '编辑加班'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        centered
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="date"
            label="加班日期"
            rules={[{ required: true, message: '请选择加班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="加班时段"
            rules={[{ required: true, message: '请选择加班时段' }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="hours"
            label="加班时长(小时)"
            rules={[{ required: true, message: '请输入加班时长' }]}
          >
            <InputNumber
              min={0.5}
              max={24}
              step={0.5}
              style={{ width: '100%' }}
              placeholder="可填 0.5"
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="加班类型"
            rules={[{ required: true, message: '请选择加班类型' }]}
          >
            <Select
              options={[
                { value: '工作日', label: '工作日' },
                { value: '周末', label: '周末' },
                { value: '节假日', label: '节假日' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="加班原因"
            rules={[{ required: true, message: '请输入加班原因' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请说明加班原因"
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default OvertimeManagement;
