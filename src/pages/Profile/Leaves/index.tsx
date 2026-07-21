import { useEffect, useState, useCallback } from 'react';
import { Card, Tag, Button, message, Modal, Form, Select, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';
import type { LeaveRecord } from '@/services/profile/typings';
import { getLeaves, cancelLeave } from '@/services/profile';
import { getBalancesUsingGet, submitDraftUsingPost, deleteDraftUsingDelete, submitLeaveRequestUsingPost } from '@/api/leaveController';
import { PageContainer } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import ApprovalTimeline from '@/components/ApprovalTimeline';

const BALANCE_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  年假: { bg: '#eff6ff', bar: '#3b82f6', text: '#3b82f6' },
  病假: { bg: '#fef2f2', bar: '#ef4444', text: '#dc2626' },
  调休: { bg: '#faf5ff', bar: '#a855f7', text: '#9333ea' },
  事假: { bg: '#fff7ed', bar: '#f97316', text: '#ea580c' },
  婚假: { bg: '#fdf2f8', bar: '#ec4899', text: '#be185d' },
  产假: { bg: '#ecfdf5', bar: '#10b981', text: '#047857' },
};

const LEAVE_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  年假: { bg: '#dbeafe', color: '#2563eb' },
  病假: { bg: '#fee2e2', color: '#dc2626' },
  事假: { bg: '#fef3c7', color: '#d97706' },
  调休: { bg: '#f3e8ff', color: '#7c3aed' },
  婚假: { bg: '#fce7f3', color: '#be185d' },
  产假: { bg: '#d1fae5', color: '#047857' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  审批中: { bg: '#fef3c7', color: '#d97706' },
  已通过: { bg: '#dcfce7', color: '#16a34a' },
  已拒绝: { bg: '#fee2e2', color: '#dc2626' },
  已取消: { bg: '#e5e7eb', color: '#6b7280' },
  草稿: { bg: '#f3f4f6', color: '#6b7280' },
};

export default function LeavesPage() {
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm] = Form.useForm();
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        getLeaves({}),
        getBalancesUsingGet({}),
      ]);
      setData(leavesRes.records || []);
      const bd = (balanceRes as any)?.data;
      const items = bd?.balances || [];
      setBalances([
        { leaveType: 1, leaveTypeDesc: '年假', ...items.find((b: any) => b.leaveType === 1), totalDays: items.find((b: any) => b.leaveType === 1)?.totalDays ?? 0, usedDays: items.find((b: any) => b.leaveType === 1)?.usedDays ?? 0, remainingDays: items.find((b: any) => b.leaveType === 1)?.remainingDays ?? 0 },
        { leaveType: 7, leaveTypeDesc: '调休', ...items.find((b: any) => b.leaveType === 7), totalDays: items.find((b: any) => b.leaveType === 7)?.totalDays ?? 0, usedDays: items.find((b: any) => b.leaveType === 7)?.usedDays ?? 0, remainingDays: items.find((b: any) => b.leaveType === 7)?.remainingDays ?? 0 },
      ]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLeaveSubmit = async () => {
    try {
      const values = await leaveForm.validateFields();
      setLeaveSubmitting(true);
      const [start, end] = values.dateRange ?? [];
      await submitLeaveRequestUsingPost({
        leaveType: values.leaveType,
        startTime: start.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: end.format('YYYY-MM-DDTHH:mm:ss'),
        leaveDays: values.leaveDays,
        reason: values.reason,
        submitDirectly: true,
      } as any);
      message.success('请假申请已提交');
      setLeaveOpen(false);
      leaveForm.resetFields();
      fetchData();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '提交失败');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCancel = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认取消申请',
      content: `确定要取消 ${record.leaveTypeDesc} 申请吗？`,
      onOk: async () => {
        try {
          await cancelLeave(record.id);
          message.success('已撤回为草稿');
          fetchData();
        } catch (e: any) {
          message.error(e?.message || '撤回失败');
        }
      },
    });
  };

  const handleResubmit = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认重新提交',
      content: `确定要重新提交 ${record.leaveTypeDesc} 申请吗？`,
      onOk: async () => {
        try {
          await submitDraftUsingPost({ id: record.id });
          message.success('已重新提交审批');
          fetchData();
        } catch (e: any) {
          message.error(e?.message || '提交失败');
        }
      },
    });
  };

  const handleDelete = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.leaveTypeDesc} 草稿吗？此操作不可撤销。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDraftUsingDelete({ id: record.id });
          message.success('已删除');
          fetchData();
        } catch (e: any) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>我的请假</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理请假申请与审批进度</div>
          </div>
        ),
        extra: [
          <Button
            key="apply"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setLeaveOpen(true)}
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, padding: '6px 16px' }}
          >
            申请请假
          </Button>,
        ],
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${balances.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {balances.map((item: any) => {
          const colors = BALANCE_COLORS[item.leaveTypeDesc] || BALANCE_COLORS['年假'];
          const total = item.totalDays ?? 0;
          const used = item.usedDays ?? 0;
          const remaining = item.remainingDays ?? 0;
          return (
            <Card
              key={item.leaveType}
              style={{ borderRadius: 12, border: 'none', boxShadow: 'none', background: colors.bg }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#374151' }}>{item.leaveTypeDesc}余额</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
                  {remaining}天
                </span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#fff', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: total > 0 ? `${(used / total) * 100}%` : '0%',
                    height: '100%',
                    background: colors.bar,
                    borderRadius: 3,
                  }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
                已用 {used} 天 / 共 {total} 天
              </div>
            </Card>
          );
        })}
      </div>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        title={<div style={{ fontSize: 16, fontWeight: 600 }}>申请记录</div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>暂无请假记录</div>
          ) : (
            data.map((record) => {
              const typeColor = LEAVE_TYPE_COLORS[record.leaveTypeDesc] || { bg: '#e5e7eb', color: '#6b7280' };
              const statusColor = STATUS_COLORS[record.statusDesc] || { bg: '#f3f4f6', color: '#6b7280' };
              const isPending = record.statusDesc === '审批中';
              const isDraft = record.statusDesc === '草稿';
              const isExpanded = expandedIds.has(record.id);
              const hasProgress = record.approvalProgress?.nodes?.length > 0;

              return (
                <div
                  key={record.id}
                  style={{
                    background: '#f9fafb',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {/* 基本信息行 */}
                  <div
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Tag
                          style={{
                            background: typeColor.bg,
                            color: typeColor.color,
                            borderRadius: 4,
                            fontSize: 12,
                            margin: 0,
                          }}
                        >
                          {record.leaveTypeDesc}
                        </Tag>
                        <Tag
                          style={{
                            background: statusColor.bg,
                            color: statusColor.color,
                            borderRadius: 4,
                            fontSize: 12,
                            margin: 0,
                            border: 'none',
                          }}
                        >
                          {record.statusDesc}
                        </Tag>
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {record.startTime?.slice(0, 10)} ~ {record.endTime?.slice(0, 10)}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          共 {record.leaveDays} 天
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        {record.reason}
                        {record.createTime && (
                          <span style={{ marginLeft: 12, color: '#9ca3af', fontSize: 12 }}>
                            {dayjs(record.createTime).format('YYYY-MM-DD')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      {hasProgress && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => toggleExpand(record.id)}
                        >
                          {isExpanded ? '收起详情' : '查看详情'}
                        </Button>
                      )}
                      {isPending && (
                        <Button type="link" danger size="small" onClick={() => handleCancel(record)}>
                          撤回
                        </Button>
                      )}
                      {isDraft && (
                        <>
                          <Button type="link" size="small" style={{ color: '#3b82f6' }} onClick={() => handleResubmit(record)}>
                            重新提交
                          </Button>
                          <Button type="link" danger size="small" onClick={() => handleDelete(record)}>
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 展开：审批进度 */}
                  {isExpanded && hasProgress && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #e5e7eb', marginTop: 0 }}>
                      <div style={{ paddingTop: 12 }}>
                        {record.approvalProgress?.nodes?.[0]?.approverName && (
                          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                            审批人：{record.approvalProgress.nodes[0].approverName}
                          </div>
                        )}
                        <ApprovalTimeline
                          nodes={record.approvalProgress.nodes as any}
                          currentNodeOrder={record.approvalProgress.currentNodeOrder}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Modal
        title="申请请假"
        open={leaveOpen}
        onCancel={() => { setLeaveOpen(false); leaveForm.resetFields(); }}
        onOk={handleLeaveSubmit}
        confirmLoading={leaveSubmitting}
        okText="提交"
        cancelText="取消"
        centered
        destroyOnClose
      >
        <Form form={leaveForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="leaveType" label="请假类型" rules={[{ required: true, message: '请选择' }]}>
            <Select options={[
              { value: 3, label: '事假' }, { value: 2, label: '病假' }, { value: 1, label: '年假' },
              { value: 4, label: '婚假' }, { value: 5, label: '产假' }, { value: 6, label: '丧假' }, { value: 7, label: '调休' },
            ]} />
          </Form.Item>
          <Form.Item name="dateRange" label="请假时间" rules={[{ required: true, message: '请选择' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="leaveDays" label="请假天数" rules={[{ required: true, message: '请输入' }]}>
            <Input type="number" min={0.5} max={365} step={0.5} placeholder="可填 0.5" />
          </Form.Item>
          <Form.Item name="reason" label="请假原因" rules={[{ required: true, message: '请输入' }]}>
            <Input.TextArea rows={3} placeholder="请说明原因" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
