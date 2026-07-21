import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Tabs, Card, Typography, Modal, DatePicker } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined, UserAddOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import usePermission from '@/hooks/usePermission';
import OnboardingFormModal from './components/OnboardingFormModal';
import ConfirmModal from './components/ConfirmModal';
import {
  listOnboarding, deleteOnboarding, submitDraft,
  abandonOnboarding, revokeOnboarding, updateHireDate, resubmitOnboarding,
  getOnboardingStats,
} from './services/onboarding';
import dayjs from 'dayjs';
import type { OnboardingVO } from './types/onboarding';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:      { color: '#d9d9d9', text: '草稿' },
  APPROVING:  { color: '#faad14', text: '审批中' },
  APPROVED:   { color: '#1677ff', text: '已批准待入职' },
  REJECTED:   { color: '#ff4d4f', text: '已拒绝' },
  ONBOARDED:  { color: '#52c41a', text: '已入职' },
};

const OnboardingPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { canAddEmployee } = usePermission();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<OnboardingVO | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number>();
  const [hireDateOpen, setHireDateOpen] = useState(false);
  const [hireDateId, setHireDateId] = useState<number>();
  const [hireDateValue, setHireDateValue] = useState<string>('');
  const [hireDateLoading, setHireDateLoading] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionText, setRejectionText] = useState('');
  const [stats, setStats] = useState({ draft: 0, approving: 0, approved: 0, onboarded: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getOnboardingStats();
      if (res.data) {
        setStats({
          draft: res.data.draft || 0,
          approving: res.data.approving || 0,
          approved: res.data.approved || 0,
          onboarded: res.data.onboarded || 0,
        });
      }
    } catch (e) { console.error('pages/HR/Onboarding/index.tsx', e); setStats({ draft: 0, approving: 0, approved: 0, onboarded: 0 });
    }
  };

  const columns: ProColumns<OnboardingVO>[] = [
    {
      title: '姓名', dataIndex: 'candidateName', width: 120, ellipsis: true,
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
    { title: '部门', dataIndex: 'deptName', width: 120, search: false },
    { title: '职位', dataIndex: 'positionName', width: 120, search: false },
    {
      title: '录用类型', dataIndex: 'employmentType', width: 90, search: false,
      render: (_, r) => (
        <Tag color={r.employmentType === 'FULL_TIME' ? '#1677ff' : '#faad14'}>
          {r.employmentType === 'FULL_TIME' ? '全职' : '兼职'}
        </Tag>
      ),
    },
    {
      title: '预计入职日期', dataIndex: 'hireDate', width: 130, search: false,
      render: (date: string) => date || '-',
    },
    {
      title: '状态', dataIndex: 'approvalStatus', width: 120,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.approvalStatus ?? 'DRAFT'];
        const colorMap: Record<string, string> = {
          DRAFT: '#d9d9d9',
          APPROVING: '#faad14',
          APPROVED: '#1677ff',
          REJECTED: '#ff4d4f',
          ONBOARDED: '#52c41a',
        };
        return cfg ? (
          <Tag color={colorMap[r.approvalStatus ?? 'DRAFT']} style={{ fontWeight: 500 }}>
            {cfg.text}
          </Tag>
        ) : (
          <Tag>草稿</Tag>
        );
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', APPROVED: '已批准待入职',
        REJECTED: '已拒绝', ONBOARDED: '已入职',
      },
    },
    {
      title: '操作', key: 'action', width: 280, fixed: 'right', search: false,
      render: (_, r) => {
        const status = (r as any).approvalStatus;
        const isDraft = !r.recordId;
        const isFirstStep = (r as any).approvalProgress?.startsWith('1/');
        if (isDraft) return (
          <>
            <a onClick={() => { setEditRecord(r); setFormOpen(true); }} style={{ marginRight: 8 }}>编辑</a>
            <a onClick={() => submitDraft(r.id).then(() => { message.success('已提交审批'); actionRef.current?.reload(); fetchStats(); }).catch((e: any) => message.error(e?.message || '提交失败'))} style={{ marginRight: 8 }}>
              提交审批
            </a>
            <Popconfirm title="确定删除？" onConfirm={() => deleteOnboarding(r.id).then(() => { actionRef.current?.reload(); fetchStats(); })}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );
        if (status === 'APPROVING') return (
          <>
            <a href={`/approval/detail/${r.recordId}`} style={{ marginRight: 8 }}>查看进度</a>
            {isFirstStep && (
              <Popconfirm title="确定撤回？撤回后恢复为草稿" onConfirm={() =>
                revokeOnboarding(r.id).then(() => { message.success('已撤回'); actionRef.current?.reload(); fetchStats(); })
              }>
                <a style={{ color: '#faad14', marginRight: 8 }}>撤回</a>
              </Popconfirm>
            )}
            <Popconfirm title="确定删除？将永久删除该申请及关联审批数据" onConfirm={() =>
              deleteOnboarding(r.id).then(() => { message.success('已删除'); actionRef.current?.reload(); fetchStats(); })
            }>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );
        if (status === 'APPROVED') return (
          <>
            <a onClick={() => { setConfirmId(r.id); setConfirmOpen(true); }} style={{ marginRight: 8, color: '#1677ff' }}>确认入职</a>
            <a onClick={() => { setHireDateId(r.id); setHireDateValue(''); setHireDateOpen(true); }} style={{ marginRight: 8 }}>
              修改日期
            </a>
            <Popconfirm title="确定放弃入职？" onConfirm={() =>
              abandonOnboarding(r.id).then(() => { message.success('已标记放弃'); actionRef.current?.reload(); fetchStats(); })
            }>
              <a style={{ color: '#ff4d4f' }}>标记放弃</a>
            </Popconfirm>
          </>
        );
        if (status === 'REJECTED') return (
          <>
            <a onClick={() => {
              setRejectionText((r as any).rejectionReason || '未填写拒绝原因');
              setRejectionModalOpen(true);
            }} style={{ marginRight: 8 }}>
              查看原因
            </a>
            <Popconfirm title="确定重新发起审批？" onConfirm={() =>
              resubmitOnboarding(r.id).then(() => { message.success('已重新发起'); actionRef.current?.reload(); fetchStats(); })
            }>
              <a style={{ color: '#1677ff', marginRight: 8 }}>重新发起</a>
            </Popconfirm>
          </>
        );
        return <span style={{ color: '#999' }}>完成入职</span>;
      },
    },
  ];

  const statCards = [
    { label: '草稿', value: stats.draft, icon: <FileTextOutlined />, color: '#fff', bgColor: '#f5f5f5', borderColor: '#e8e8e8' },
    { label: '审批中', value: stats.approving, icon: <ClockCircleOutlined />, color: '#d48806', bgColor: '#fffbe6', borderColor: '#ffe58f' },
    { label: '待入职', value: stats.approved, icon: <UserAddOutlined />, color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' },
    { label: '已入职', value: stats.onboarded, icon: <CheckCircleOutlined />, color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' },
  ];

  return (
    <div style={{ padding: 0, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
              入职管理
            </Title>
            <Text style={{ fontSize: 13, color: '#999' }}>
              管理候选人入职申请 ◆◆◆ 审批流程
            </Text>
          </div>
          {canAddEmployee && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditRecord(null); setFormOpen(true); }}
              style={{ borderRadius: 6, height: 36, padding: '0 20px' }}
            >
              新建入职申请
            </Button>
          )}
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
                  <span style={{ fontSize: 20, color: card.color === '#fff' ? '#999' : card.color }}>
                    {card.label === '草稿' ? '1' : card.label === '审批中' ? '2' : card.label === '待入职' ? '1' : '1'}
                  </span>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#999' }}>{card.label}</Text>
                  <div style={{ fontSize: 18, fontWeight: 600, color: card.color === '#fff' ? '#333' : card.color }}>
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
            { key: 'APPROVED', label: '已批准待入职' },
            { key: 'REJECTED', label: '已拒绝' },
            { key: 'ONBOARDED', label: '已入职' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <ProTable<OnboardingVO>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          params={{ statuses: activeTab ? [activeTab] : undefined }}
          request={async (p) => {
            const res = await listOnboarding({
              keyword: (p.candidateName as string) || undefined,
              statuses: activeTab ? [activeTab] : undefined,
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

      <OnboardingFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); fetchStats(); }}
      />
      <ConfirmModal open={confirmOpen} onboardingId={confirmId}
        onOk={() => { setConfirmOpen(false); actionRef.current?.reload(); fetchStats(); }}
        onCancel={() => setConfirmOpen(false)}
      />

      <Modal
        title="修改入职日期"
        open={hireDateOpen}
        onCancel={() => setHireDateOpen(false)}
        onOk={async () => {
          if (!hireDateValue) { message.warning('请选择日期'); return; }
          setHireDateLoading(true);
          try {
            await updateHireDate(hireDateId!, hireDateValue);
            message.success('入职日期已修改');
            setHireDateOpen(false);
            actionRef.current?.reload();
            fetchStats();
          } catch (e: any) {
            if (e?.message) message.error(e.message);
          } finally {
            setHireDateLoading(false);
          }
        }}
        confirmLoading={hireDateLoading}
        destroyOnClose
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择新的入职日期"
          onChange={(date) => setHireDateValue(date?.format('YYYY-MM-DD') || '')}
        />
      </Modal>

      <Modal
        title="拒绝原因"
        open={rejectionModalOpen}
        onCancel={() => setRejectionModalOpen(false)}
        footer={<Button onClick={() => setRejectionModalOpen(false)}>关闭</Button>}
        destroyOnClose
      >
        <div style={{ padding: '12px 0' }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 16, marginRight: 8 }} />
          {rejectionText}
        </div>
      </Modal>
    </div>
  );
};

export default OnboardingPage;
