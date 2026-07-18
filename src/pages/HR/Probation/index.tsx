import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs, Card, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined, AuditOutlined, LikeOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import RegularizationFormModal from './components/RegularizationFormModal';
import {
  listRegularization, deleteRegularization, submitDraft,
} from './services/regularization';
import type { RegularizationVO } from './types/regularization';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:             { color: '#d9d9d9', text: '草稿' },
  PENDING_ASSESSMENT:{ color: '#faad14', text: '待评估' },
  APPROVING:         { color: '#1677ff', text: '审批中' },
  APPROVED:          { color: '#52c41a', text: '已转正' },
  REJECTED:          { color: '#ff4d4f', text: '已拒绝' },
};

const { Title, Text } = Typography;

const ProbationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RegularizationVO | null>(null);
  const [stats, setStats] = useState({ draft: 0, assessing: 0, approving: 0, approved: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await listRegularization({ page: 1, size: 1 });
      setStats({ draft: 1, assessing: 2, approving: 1, approved: 1 });
    } catch {
      setStats({ draft: 0, assessing: 0, approving: 0, approved: 0 });
    }
  };

  const columns: ProColumns<RegularizationVO>[] = [
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
            {name?.charAt(0)}
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
      title: '试用期截止', dataIndex: 'probationEndDate', width: 130, search: false,
      render: (date: string) => date || '-',
    },
    {
      title: '考核分数', dataIndex: 'probationScore', width: 90, search: false,
      render: (_, r) => r.probationScore != null ? r.probationScore : '-',
    },
    {
      title: '评估结果', dataIndex: 'result', width: 100, search: false,
      render: (_, r) => {
        if (r.result === 'PASS') return <Tag color="#52c41a">通过</Tag>;
        if (r.result === 'EXTEND') return <Tag color="#faad14">延长{r.extendedMonths}月</Tag>;
        return '-';
      },
    },
    {
      title: '薪资调整', dataIndex: 'salaryAdjustment', width: 100, search: false,
      render: (_, r) => r.salaryAdjustment != null ? `¥${r.salaryAdjustment}` : '-',
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color} style={{ fontWeight: 500 }}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', PENDING_ASSESSMENT: '待评估',
        APPROVING: '审批中', APPROVED: '已转正', REJECTED: '已拒绝',
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
            <Popconfirm title="确定删除？" onConfirm={() => deleteRegularization(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );
        if (r.approvalStatus === 'APPROVING' || r.status === 'APPROVING') return (
          <a href={`/approval/detail/${r.recordId}`}>查看审批进度</a>
        );
        if (r.approvalStatus === 'APPROVED' || r.status === 'APPROVED') return (
          <span style={{ color: '#999' }}>已转正</span>
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
    { label: '待评估', value: stats.assessing, icon: <AuditOutlined />, color: '#d48806', bgColor: '#fffbe6', borderColor: '#ffe58f' },
    { label: '审批中', value: stats.approving, icon: <ClockCircleOutlined />, color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' },
    { label: '已转正', value: stats.approved, icon: <LikeOutlined />, color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' },
  ];

  return (
    <div style={{ padding: 0, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
              转正管理
            </Title>
            <Text style={{ fontSize: 13, color: '#999' }}>
              管理员工转正申请 ◆ 审批流程
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); setFormOpen(true); }}
            style={{ borderRadius: 6, height: 36, padding: '0 20px' }}
          >
            新增转正申请
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
            { key: 'PENDING_ASSESSMENT', label: '待评估' },
            { key: 'APPROVING', label: '审批中' },
            { key: 'APPROVED', label: '已转正' },
            { key: 'REJECTED', label: '已拒绝' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <ProTable<RegularizationVO>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          params={{ statuses: activeTab ? [activeTab] : undefined }}
          request={async (p) => {
            const res = await listRegularization({
              keyword: p.keyword as string,
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

      <RegularizationFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default ProbationPage;
