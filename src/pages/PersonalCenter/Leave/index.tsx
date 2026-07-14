import { applyUsingPost, cancelUsingPost, getMyLeavesUsingGet } from '@/api/leaveController';
import { getApprovalProgressUsingGet } from '@/api/leaveController';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Form, Input, message, Modal, Select, Space, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const LEAVE_TYPE_OPTIONS = [
  { label: '事假', value: 0 },
  { label: '病假', value: 1 },
  { label: '年假', value: 2 },
  { label: '婚假', value: 3 },
  { label: '产假', value: 4 },
  { label: '丧假', value: 5 },
  { label: '调休', value: 6 },
];

const STATUS_COLOR: Record<number, string> = {
  0: 'processing',
  1: 'success',
  2: 'error',
  3: 'default',
};

const MyLeave: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<API.LeaveVO | null>(null);
  const [progressData, setProgressData] = useState<API.LeaveProgressVO | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<API.LeaveVO>[] = [
    {
      title: '请假类型',
      dataIndex: 'leaveTypeText',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">{record.leaveTypeText}</Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      width: 160,
      render: (_, r) => r.startDate ?? '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      width: 120,
      render: (_, r) => r.endDate ?? '-',
    },
    {
      title: '天数',
      dataIndex: 'totalDays',
      width: 80,
      render: (_, r) => `${r.totalDays ?? 0}天`,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      ellipsis: true,
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      width: 100,
      render: (_, record) => (
        <Tag color={STATUS_COLOR[record.status ?? 3]}>{record.statusText}</Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, r) => (r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewProgress(record)}
          >
            审批进度
          </Button>
          {record.status === 0 && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleApply = async () => {
    try {
      const values = await form.validateFields();
      const res = await applyUsingPost({
        leaveType: values.leaveType,
        startDate: values.startDate.format('YYYY-MM-DD HH:mm'),
        endDate: values.endDate.format('YYYY-MM-DD HH:mm'),
        reason: values.reason,
      });
      if (res?.code === 0) {
        message.success('请假申请已提交');
        setApplyModalOpen(false);
        form.resetFields();
        actionRef.current?.reload();
      }
    } catch (e: any) {
      if (e.message) message.error(e.message);
    }
  };

  const handleViewProgress = async (record: API.LeaveVO) => {
    setSelectedLeave(record);
    setProgressModalOpen(true);
    try {
      const res = await getApprovalProgressUsingGet({ id: record.id! });
      setProgressData(res?.data ?? null);
    } catch {
      setProgressData(null);
    }
  };

  const handleCancel = (record: API.LeaveVO) => {
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消此请假申请吗？`,
      onOk: async () => {
        try {
          await cancelUsingPost({ id: record.id! });
          message.success('已取消');
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message || '取消失败');
        }
      },
    });
  };

  return (
    <div>
      <ProTable<API.LeaveVO>
        headerTitle="我的请假"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          try {
            const res = await getMyLeavesUsingGet();
            return { data: res?.data ?? [], success: true, total: res?.data?.length ?? 0 };
          } catch {
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="apply"
            onClick={() => setApplyModalOpen(true)}
          >
            申请请假
          </Button>,
        ]}
      />

      {/* 申请请假 Modal */}
      <Modal
        title="申请请假"
        open={applyModalOpen}
        onOk={handleApply}
        onCancel={() => {
          setApplyModalOpen(false);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select options={LEAVE_TYPE_OPTIONS} placeholder="请选择" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
            dependencies={['startDate']}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              style={{ width: '100%' }}
              disabledDate={(current) => {
                const start = form.getFieldValue('startDate');
                return start && current && current.isBefore(start, 'day');
              }}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="原因"
            rules={[{ required: true, message: '请输入请假原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入请假原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审批进度 Modal */}
      <Modal
        title="审批进度"
        open={progressModalOpen}
        onCancel={() => setProgressModalOpen(false)}
        footer={null}
        width={500}
      >
        {selectedLeave && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>请假类型：</strong>
              <Tag color="blue">{selectedLeave.leaveTypeText}</Tag>
            </p>
            <p>
              <strong>时间：</strong>
              {selectedLeave.startDate} ~ {selectedLeave.endDate}（{selectedLeave.totalDays}天）
            </p>
            <p>
              <strong>原因：</strong>
              {selectedLeave.reason}
            </p>
            <p>
              <strong>状态：</strong>
              <Tag color={STATUS_COLOR[selectedLeave.status ?? 3]}>
                {selectedLeave.statusText}
              </Tag>
            </p>
          </div>
        )}
        <Timeline
          items={(progressData?.progressNodes ?? []).map((node) => ({
            color:
              node.status === 0 ? 'green' : node.status === 1 ? 'blue' : 'gray',
            children: (
              <div>
                <div style={{ fontWeight: 500 }}>{node.nodeName}</div>
                {node.operatorName && (
                  <div style={{ color: '#666', fontSize: 13 }}>
                    {node.operatorName}
                    {node.operateTime &&
                      ` · ${dayjs(node.operateTime).format('YYYY-MM-DD HH:mm')}`}
                  </div>
                )}
                {node.comment && (
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    {node.status === 2 ? '原因：' : '意见：'}
                    {node.comment}
                  </div>
                )}
              </div>
            ),
          }))}
        />
      </Modal>
    </div>
  );
};

export default MyLeave;
