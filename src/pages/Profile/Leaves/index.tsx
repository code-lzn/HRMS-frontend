import { useEffect, useState, useCallback } from 'react';
import { Card, Tag, Button, message, Modal } from 'antd';
import dayjs from 'dayjs';
import type { LeaveRecord } from '@/services/profile/typings';
import { getLeaves, cancelLeave } from '@/services/profile';
import { PageContainer } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';

const LEAVE_BALANCE = [
  { type: 'annual', name: '年假余额', used: 5, total: 15, bgColor: '#eff6ff', barColor: '#3b82f6', textColor: '#3b82f6' },
  { type: 'sick', name: '病假余额', used: 1, total: 10, bgColor: '#fef2f2', barColor: '#ef4444', textColor: '#dc2626' },
  { type: 'compensatory', name: '调休余额', used: 2, total: 4, bgColor: '#faf5ff', barColor: '#a855f7', textColor: '#9333ea' },
];

const LEAVE_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  年假: { bg: '#dbeafe', color: '#2563eb' },
  病假: { bg: '#fee2e2', color: '#dc2626' },
  事假: { bg: '#fef3c7', color: '#d97706' },
  调休: { bg: '#f3e8ff', color: '#7c3aed' },
  婚假: { bg: '#fce7f3', color: '#be185d' },
  产假: { bg: '#d1fae5', color: '#047857' },
};

const STATUS_COLORS: Record<number, { bg: string; color: string; text: string }> = {
  1: { bg: '#fef3c7', color: '#d97706', text: '审批中' },
  2: { bg: '#dcfce7', color: '#16a34a', text: '已批准' },
  3: { bg: '#fee2e2', color: '#dc2626', text: '已拒绝' },
  4: { bg: '#e5e7eb', color: '#6b7280', text: '已撤回' },
};

export default function LeavesPage() {
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeaves({});
      setData(res.records || []);
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
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, padding: '6px 16px' }}
          >
            申请请假
          </Button>,
        ],
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {LEAVE_BALANCE.map((item) => (
          <Card
            key={item.type}
            style={{ borderRadius: 12, border: 'none', boxShadow: 'none', background: item.bgColor }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#374151' }}>{item.name}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: item.textColor }}>
                {item.total - item.used}天
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#fff', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(item.used / item.total) * 100}%`,
                  height: '100%',
                  background: item.barColor,
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
              已用 {item.used} 天 / 共 {item.total} 天
            </div>
          </Card>
        ))}
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
              const statusColor = STATUS_COLORS[record.status] || STATUS_COLORS[1];
              const isPending = record.status === 1;

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
                        {statusColor.text}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {record.startTime?.slice(0, 10)} ~ {record.endTime?.slice(0, 10)} &nbsp; 共 {record.duration} 天
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
                    <Button
                      type="link"
                      size="small"
                      style={{ color: '#3b82f6' }}
                    >
                      查看进度
                    </Button>
                    {isPending && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() => handleCancel(record)}
                      >
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
