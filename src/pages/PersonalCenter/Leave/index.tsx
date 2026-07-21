import { applyUsingPost, cancelUsingPost, getBalanceUsingGet, getMyLeavesUsingGet } from '@/api/leaveController';
import { getApprovalProgressUsingGet } from '@/api/leaveController';
import { getMyMakeupPunchesUsingGet, getApprovalProgressUsingGet1, cancelUsingPost1 } from '@/api/makeupPunchController';
import { getMyOvertimesUsingGet, cancelUsingPost2, getApprovalProgressUsingGet2 } from '@/api/overtimeController';
import { CalendarOutlined, CoffeeOutlined, MedicineBoxOutlined, ScheduleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Radio, Row, Select, Space, Statistic, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

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
  const [balance, setBalance] = useState<API.LeaveBalanceVO | null>(null);
  const [progressData, setProgressData] = useState<API.LeaveProgressVO | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getBalanceUsingGet().then((r) => setBalance(r?.data ?? null)).catch(() => {});
  }, []);

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
        timeSlot: values.timeSlot ?? 0,
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

  const handleViewProgress = async (record: any) => {
    setSelectedLeave(record);
    setProgressModalOpen(true);
    try {
      if (record._recordType === 'overtime') {
        const res = await getApprovalProgressUsingGet2({ id: record._rawId ?? record.id! });
        const data = res?.data;
        setProgressData(data
          ? { leave: { ...record, leaveTypeText: record.leaveTypeText }, progressNodes: data.progressNodes }
          : null);
      } else if (record._recordType === 'makeup') {
        const res = await getApprovalProgressUsingGet1({ id: record._rawId ?? record.id! });
        const data = res?.data;
        setProgressData(data
          ? { leave: { ...record, leaveTypeText: record.leaveTypeText }, progressNodes: data.progressNodes }
          : null);
      } else {
        const res = await getApprovalProgressUsingGet({ id: record.id! });
        setProgressData(res?.data ?? null);
      }
    } catch (e) { console.error('pages/PersonalCenter/Leave/index.tsx', e); setProgressData(null); }
  };

  const handleCancel = (record: any) => {
    const isMakeup = record._recordType === 'makeup';
    const isOvertime = record._recordType === 'overtime';
    const label = isMakeup ? '补卡' : isOvertime ? '加班' : '请假';
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消此${label}申请吗？`,
      onOk: async () => {
        try {
          if (isMakeup) {
            await cancelUsingPost1({ id: record._rawId ?? record.id! });
          } else if (isOvertime) {
            await cancelUsingPost2({ id: record._rawId ?? record.id! });
          } else {
            await cancelUsingPost({ id: record.id! });
          }
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
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="年假剩余"
              value={balance?.annualRemaining ?? 0}
              suffix="天"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="调休剩余"
              value={balance?.compRemaining ?? 0}
              suffix="天"
              prefix={<CoffeeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="病假剩余"
              value={balance?.sickRemaining ?? 0}
              suffix="天"
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="合计剩余"
              value={balance?.totalRemaining ?? 0}
              suffix="天"
              prefix={<ScheduleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<API.LeaveVO>
        headerTitle="我的请假"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          try {
            const [leaveRes, makeupRes, overtimeRes] = await Promise.all([
              getMyLeavesUsingGet(),
              getMyMakeupPunchesUsingGet(),
              getMyOvertimesUsingGet(),
            ]);

            const leaveData = (leaveRes?.data ?? []).map((r: any) => ({
              ...r,
              _recordType: 'leave' as const,
            }));

            const makeupData = ((makeupRes?.data ?? []) as any[]).map((r: any) => ({
              id: r.id,
              leaveType: -1,
              leaveTypeText: `补卡(${r.punchTypeText})`,
              startDate: r.punchDate,
              endDate: r.punchDate,
              totalDays: 0.5,
              reason: r.reason,
              status: r.status,
              statusText: r.statusText,
              createTime: r.createTime,
              employeeName: r.employeeName,
              _recordType: 'makeup' as const,
              _rawId: r.id,
            }));

            const overtimeData = ((overtimeRes?.data ?? []) as any[]).map((r: any) => ({
              id: r.id,
              leaveType: -2,
              leaveTypeText: `加班(${r.overtimeTypeText})`,
              startDate: r.overtimeDate,
              endDate: r.overtimeDate,
              totalDays: r.overtimeHours ?? 0,
              reason: r.reason,
              status: r.status,
              statusText: r.statusText,
              createTime: r.createTime,
              employeeName: r.employeeName,
              _recordType: 'overtime' as const,
              _rawId: r.id,
            }));

            const merged = [...leaveData, ...makeupData, ...overtimeData].sort((a, b) =>
              (b.createTime || '').localeCompare(a.createTime || ''),
            );
            return { data: merged, success: true, total: merged.length };
          } catch (e) { console.error('pages/PersonalCenter/Leave/index.tsx', e); return { data: [], success: false };
          }
        }}
        rowKey={(r: any) => `${r._recordType ?? 'leave'}-${r.id}`}
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
            name="timeSlot"
            label="时段"
            initialValue={0}
          >
            <Radio.Group>
              <Radio value={0}>全天</Radio>
              <Radio value={1}>上午</Radio>
              <Radio value={2}>下午</Radio>
            </Radio.Group>
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
              <strong>{(selectedLeave as any)._recordType === 'makeup' ? '补卡类型' : (selectedLeave as any)._recordType === 'overtime' ? '加班类型' : '请假类型'}：</strong>
              <Tag color="blue">{selectedLeave.leaveTypeText}</Tag>
            </p>
            <p>
              <strong>时间：</strong>
              {(selectedLeave as any)._recordType === 'makeup'
                ? selectedLeave.startDate
                : (selectedLeave as any)._recordType === 'overtime'
                ? `${selectedLeave.startDate}（${selectedLeave.totalDays}h）`
                : `${selectedLeave.startDate} ~ ${selectedLeave.endDate}（${selectedLeave.totalDays}天）`}
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
