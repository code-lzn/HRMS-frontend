import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs, Card, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined, SwapOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import TransferFormModal from './components/TransferFormModal';
import {
  listTransfer, deleteTransfer, submitDraft,
  getTransferStats,
} from './services/transfer';
import type { TransferVO } from './types/transfer';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:    { color: '#d9d9d9', text: '草稿' },
  APPROVING:{ color: '#1677ff', text: '审批中' },
  APPROVED: { color: '#52c41a', text: '已通过' },
  EFFECTIVE:{ color: '#52c41a', text: '已生效' },
  REJECTED: { color: '#ff4d4f', text: '已拒绝' },
};

const { Title, Text } = Typography;

const TransferPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TransferVO | null>(null);
  const [stats, setStats] = useState({ draft: 0, approving: 0, approved: 0, effective: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getTransferStats();
      if (res.data) {
        setStats({
          draft: res.data.draft || 0,
          approving: res.data.approving || 0,
          approved: res.data.approved || 0,
          effective: res.data.effective || 0,
        });
      }
    } catch (e) { console.error('pages/HR/Transfer/index.tsx', e); setStats({ draft: 0, approving: 0, approved: 0, effective: 0 });
    }
  };

  const columns: ProColumns<TransferVO>[] = [
    {
      title: '姓名', dataIndex: 'employeeName', width: 120, ellipsis: true,
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#4a6cf7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {String(name ?? '').charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{name}</div>
          </div>
        </div>
      ),
    },
    {
      title: '原部门→新部门', key: 'deptChange', width: 200, search: false,
      render: (_, r) => (
        <span>
          <span style={{ color: '#999' }}>{r.fromDeptName}</span>
          {' → '}
          <span style={{ color: '#1677ff' }}>{r.toDeptName}</span>
        </span>
      ),
    },
    { title: '新职位', dataIndex: 'toPositionName', width: 120, search: false },
    {
      title: '调岗原因', dataIndex: 'reason', width: 140, search: false, ellipsis: true,
    },
    {
      title: '调薪', dataIndex: 'salaryAdjustment', width: 100, search: false,
      render: (_, r) => r.salaryAdjustment != null ? `¥${r.salaryAdjustment}` : '-',
    },
    {
      title: '生效日期', dataIndex: 'effectiveDate', width: 130, search: false,
      render: (date: string) => date || '-',
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color} style={{ fontWeight: 500 }}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', APPROVED: '已通过',
        EFFECTIVE: '已生效', REJECTED: '已拒绝',
      },
    },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right', search: false,
      render: (_, r) => {
        const isDraft = !r.recordId;
        if (isDraft) return (
          <>
            <a onClick={() => { setEditRecord(r); setFormOpen(true); }} style={{ marginRight: 8 }}>编辑</a>
            <a onClick={() => submitDraft(r.id).then(() => actionRef.current?.reload())} style={{ marginRight: 8 }}>提交审批</a>
            <Popconfirm title="确定删除？" onConfirm={() => deleteTransfer(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );
        if (r.approvalStatus === 'APPROVING' || r.status === 'APPROVING') return (
          <a href={`/approval/detail/${r.recordId}`}>查看审批进度</a>
        );
        if (r.approvalStatus === 'APPROVED' || r.status === 'APPROVED') return (
          <span style={{ color: '#999' }}>已生效</span>
        );
        if (r.approvalStatus === 'REJECTED' || r.status === 'REJECTED') return (
          <a onClick={() => { setEditRecord(r); setFormOpen(true); }}>重新编辑</a>
        );
        return null;
      },
    },
  ];

  const statCards = [
    { label: '草稿', value: stats.draft, icon: <FileTextOutlined />, color: '#d9d9d9', bgColor: '#f5f5f5', borderColor: '#e8e8e8' },
    { label: '审批中', value: stats.approving, icon: <ClockCircleOutlined />, color: '#d48806', bgColor: '#fffbe6', borderColor: '#ffe58f' },
    { label: '已通过', value: stats.approved, icon: <SwapOutlined />, color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' },
    { label: '已生效', value: stats.effective, icon: <CheckCircleOutlined />, color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' },
  ];

  return (
    <div style={{ padding: 0, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
              调岗管理
            </Title>
            <Text style={{ fontSize: 13, color: '#999' }}>
              管理员工调岗申请 ◆ 审批流程
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); setFormOpen(true); }}
            style={{ borderRadius: 6, height: 36, padding: '0 20px' }}
          >
            新增调岗申请
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {statCards.map((card) => (
            <Card
              key={card.label}
              size="small"
              style={{
                flex: 1,
                borderRadius: 8,
                border: `1px solid ${card.borderColor}`,
                background: card.bgColor,
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <span style={{ fontSize: 18, color: '#fff' }}>{card.icon}</span>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#999' }}>{card.label}</Text>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
                    {card.value}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); actionRef.current?.reload(); }}
          items={[
            { key: '', label: '全部' },
            { key: 'DRAFT', label: '草稿' },
            { key: 'APPROVING', label: '审批中' },
            { key: 'APPROVED', label: '已通过' },
            { key: 'REJECTED', label: '已拒绝' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <ProTable<TransferVO>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          scroll={{ x: 900 }}
          params={{ statuses: activeTab ? [activeTab] : undefined }}
          request={async (p) => {
            const res = await listTransfer({
              keyword: (p.employeeName as string) || undefined,
              statuses: p.statuses as string[],
              page: p.current ?? 1,
              size: p.pageSize ?? 10,
            });
            return {
              data: res.data?.records ?? [],
              total: res.data?.total ?? 0,
              success: res.code === 0,
            };
          }}
          search={{ labelWidth: 'auto', collapsed: true }}
          pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          headerTitle={null}
          toolbar={{ actions: [] }}
        />
      </div>

      <TransferFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default TransferPage;
