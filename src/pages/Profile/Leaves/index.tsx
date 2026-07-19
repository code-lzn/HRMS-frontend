import { useEffect, useState, useCallback } from 'react';
import { Card, Tag, Button, message, Modal } from 'antd';
import dayjs from 'dayjs';
import type { LeaveRecord } from '@/services/profile/typings';
import { getLeaves, cancelLeave } from '@/services/profile';
import { getBalancesUsingGet } from '@/api/leaveController';
import { PageContainer } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';

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
  const navigate = useNavigate();
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);

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
        { leaveType: 2, leaveTypeDesc: '病假', ...items.find((b: any) => b.leaveType === 2), totalDays: items.find((b: any) => b.leaveType === 2)?.totalDays ?? 0, usedDays: items.find((b: any) => b.leaveType === 2)?.usedDays ?? 0, remainingDays: items.find((b: any) => b.leaveType === 2)?.remainingDays ?? 0 },
        { leaveType: 7, leaveTypeDesc: '调休', ...items.find((b: any) => b.leaveType === 7), totalDays: items.find((b: any) => b.leaveType === 7)?.totalDays ?? 0, usedDays: items.find((b: any) => b.leaveType === 7)?.usedDays ?? 0, remainingDays: items.find((b: any) => b.leaveType === 7)?.remainingDays ?? 0 },
      ]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认取消申请',
      content: `确定要取消 ${record.leaveTypeDesc} 申请吗？`,
      onOk: async () => {
        await cancelLeave(record.id);
        message.success('已取消');
        fetchData();
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
            onClick={() => navigate('/attendance/leave')}
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, padding: '6px 16px' }}
          >
            申请请假
          </Button>,
        ],
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
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

              return (
                <div
                  key={record.id}
                  style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Tag
                        color="blue"
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
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {record.startTime?.slice(0, 10)} ~ {record.endTime?.slice(0, 10)} &nbsp; 共 {record.leaveDays} 天
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                      {record.reason}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {record.approvalProgress?.nodes?.[0]?.approverName
                        ? `审批人：${record.approvalProgress.nodes[0].approverName}`
                        : ''}
                      {record.createTime
                        ? ` · ${dayjs(record.createTime).format('YYYY-MM-DD')}`
                        : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="link" size="small" style={{ color: '#3b82f6' }}>
                      查看进度
                    </Button>
                    {isPending && (
                      <Button type="link" danger size="small" onClick={() => handleCancel(record)}>
                        取消申请
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
