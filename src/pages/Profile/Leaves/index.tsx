import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Tabs, Button, message, Modal, Tooltip } from 'antd';
import type { LeaveRecord } from '@/services/profile/typings';
import { getLeaves, cancelLeave } from '@/services/profile';

const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: '1', label: '审批中' },
  { key: '2', label: '已通过' },
  { key: '3', label: '已拒绝' },
  { key: '4', label: '已撤回' },
];

const STATUS_MAP: Record<number, { color: string }> = {
  1: { color: 'processing' },
  2: { color: 'success' },
  3: { color: 'error' },
  4: { color: 'default' },
};

export default function LeavesPage() {
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const fetchData = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const res = await getLeaves({ status: status ? Number(status) : undefined });
      setData(res.records);
    } catch {
      // silent — state shows empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

  const handleCancel = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认取消申请',
      content: `确定要取消 ${record.leaveTypeDesc} 申请吗？`,
      onOk: async () => {
        await cancelLeave(record.id);
        message.success('已取消');
        fetchData(activeTab);
      },
    });
  };

  const columns = [
    { title: '请假类型', dataIndex: 'leaveType', key: 'leaveType', render: (_: any, r: LeaveRecord) => <Tag>{r.leaveTypeDesc}</Tag> },
    { title: '起止时间', key: 'time', render: (_: any, r: LeaveRecord) => `${r.startTime} ~ ${r.endTime}` },
    { title: '天数', dataIndex: 'duration', key: 'duration', render: (v: number) => `${v}天` },
    { title: '事由', dataIndex: 'reason', key: 'reason', render: (v: string) => <Tooltip title={v}>{v.length > 15 ? v.slice(0, 15) + '...' : v}</Tooltip> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (_: any, r: LeaveRecord) => <Tag color={STATUS_MAP[r.status]?.color}>{r.statusDesc}</Tag> },
    { title: '审批进度', key: 'progress', render: (_: any, r: LeaveRecord) => {
      const nodes = r.approvalProgress?.nodes || [];
      const done = nodes.filter((n) => n.status === 2).length;
      return `${done}/${nodes.length} 已完成`;
    }},
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: (v: string) => v.slice(0, 16).replace('T', ' ') },
    {
      title: '操作', key: 'action',
      render: (_: any, r: LeaveRecord) => r.status === 1 ? (
        <Button type="link" danger onClick={() => handleCancel(r)}>取消申请</Button>
      ) : null,
    },
  ];

  return (
    <Card title="我的请假">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={STATUS_TABS} />
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
    </Card>
  );
}
