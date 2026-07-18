import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs, Card, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined, UserDeleteOutlined, StopOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import ResignationFormModal from './components/ResignationFormModal';
import {
  listResignation, deleteResignation, submitDraft,
  getResignationStats,
} from './services/resignation';
import type { ResignationVO } from './types/resignation';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:        { color: '#d9d9d9', text: '草稿' },
  APPROVING:    { color: '#1677ff', text: '审批中' },
  PENDING_RESIGN:{ color: '#faad14', text: '待离职' },
  RESIGNED:     { color: '#999', text: '已离职' },
  REJECTED:     { color: '#ff4d4f', text: '已拒绝' },
};

const { Title, Text } = Typography;

const REASON_MAP: Record<string, string> = {
  VOLUNTARY: '主动离职', INVOLUNTARY: '被动离职', NEGOTIATED: '协商离职',
};
const TYPE_MAP: Record<string, string> = {
  RESIGN: '辞职', DISMISS: '辞退', CONTRACT_EXPIRE: '合同到期不续签', OTHER: '其他',
};

const ResignationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ResignationVO | null>(null);
  const [stats, setStats] = useState({ draft: 0, approving: 0, pending: 0, resigned: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getResignationStats();
      if (res.data) {
        setStats({
          draft: res.data.draft || 0,
          approving: res.data.approving || 0,
          pending: res.data.pending || 0,
          resigned: res.data.resigned || 0,
        });
      }
    } catch {
      setStats({ draft: 0, approving: 0, pending: 0, resigned: 0 });
    }
  };

  const columns: ProColumns<ResignationVO>[] = [
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
    { title: '工号', dataIndex: 'employeeNo', width: 100, search: false },
    { title: '部门', dataIndex: 'deptName', width: 120, search: false },
    { title: '职位', dataIndex: 'positionName', width: 120, search: false },
    {
      title: '离职日期', dataIndex: 'resignDate', width: 130, search: false,
      render: (date: string) => date || '-',
    },
    {
      title: '原因', dataIndex: 'resignReasonType', width: 100, search: false,
      render: (_, r) => REASON_MAP[r.resignReasonType] || r.resignReasonType,
    },
    {
      title: '类型', dataIndex: 'resignType', width: 100, search: false,
      render: (_, r) => TYPE_MAP[r.resignType] || r.resignType,
    },
    {
      title: '交接人', dataIndex: 'handoverPersonName', width: 100, search: false,
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color} style={{ fontWeight: 500 }}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', PENDING_RESIGN: '待离职',
        RESIGNED: '已离职', REJECTED: '已拒绝',
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
            <Popconfirm title="确定删除？" onConfirm={() => deleteResignation(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );
        if (r.approvalStatus === 'APPROVING' || r.status === 'APPROVING') return (
          <a href={`/approval/detail/${r.recordId}`}>查看审批进度</a>
        );
        if (r.status === 'PENDING_RESIGN' || r.status === 'RESIGNED') return (
          <span style={{ color: '#999' }}>{r.status === 'RESIGNED' ? '已离职' : '待离职'}</span>
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
    { label: '待离职', value: stats.pending, icon: <UserDeleteOutlined />, color: '#fa8c16', bgColor: '#fff7e6', borderColor: '#ffd591' },
    { label: '已离职', value: stats.resigned, icon: <StopOutlined />, color: '#999', bgColor: '#f5f5f5', borderColor: '#d9d9d9' },
  ];

  return (
    <div style={{ padding: 0, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
              离职管理
            </Title>
            <Text style={{ fontSize: 13, color: '#999' }}>
              管理员工离职申请 ◆ 审批流程
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); setFormOpen(true); }}
            style={{ borderRadius: 6, height: 36, padding: '0 20px' }}
          >
            新增离职申请
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
            { key: 'PENDING_RESIGN', label: '待离职' },
            { key: 'RESIGNED', label: '已离职' },
            { key: 'REJECTED', label: '已拒绝' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <ProTable<ResignationVO>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100 }}
          params={{ statuses: activeTab ? [activeTab] : undefined }}
          request={async (p) => {
            const res = await listResignation({
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

      <ResignationFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default ResignationPage;
