import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Tabs, Card, Typography, Modal, DatePicker } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined, SwapOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  listTransfer, deleteTransfer, submitDraft,
  revokeTransfer, abandonTransfer, confirmTransfer,
  updateTransferDate, resubmitTransfer,
  getTransferStats,
} from './services/transfer';
import dayjs from 'dayjs';
import type { TransferVO } from './types/transfer';
import TransferFormModal from './components/TransferFormModal';

// 调岗申请状态映射表：将状态枚举值转换为显示文本和颜色
const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:    { color: '#d9d9d9', text: '草稿' },
  APPROVING:{ color: '#1677ff', text: '审批中' },
  APPROVED: { color: '#faad14', text: '待调岗' },
  EFFECTIVE:{ color: '#52c41a', text: '已生效' },
  REJECTED: { color: '#ff4d4f', text: '已拒绝' },
  CANCELLED:{ color: '#8c8c8c', text: '已放弃' },
};

const { Title, Text } = Typography;

// 调岗管理页面组件：管理员工调岗申请的全生命周期
const TransferPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [activeTab, setActiveTab] = useState('');
  const activeTabRef = useRef('');

  const [stats, setStats] = useState({ draft: 0, approving: 0, approved: 0, effective: 0 });

  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TransferVO | null>(null);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionText, setRejectionText] = useState('');

  const [transferDateOpen, setTransferDateOpen] = useState(false);
  const [transferDateId, setTransferDateId] = useState<number>();
  const [transferDateValue, setTransferDateValue] = useState<string>('');
  const [transferDateLoading, setTransferDateLoading] = useState(false);

  // 初始化：组件挂载时获取统计数据
  useEffect(() => {
    fetchStats();
  }, []);

  // 稳定的请求函数：通过 ref 读取最新 activeTab，避免闭包捕获旧值
  const fetchData = useCallback(async (p: any) => {
    const tab = activeTabRef.current;
    const res = await listTransfer({
      keyword: (p.employeeName as string) || undefined,
      statuses: tab ? [tab] : undefined,
      page: p.current ?? 1,
      size: p.pageSize ?? 10,
    });
    return {
      data: res.data?.records ?? [],
      total: res.data?.total ?? 0,
      success: res.code === 0,
    };
  }, []);

  // 获取统计数据：调用后端接口获取各状态的调岗申请数量
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

  // 表格列配置：定义调岗申请列表的显示列
  const columns: ProColumns<TransferVO>[] = [
    {
      title: '姓名', dataIndex: 'employeeName', width: 120, ellipsis: true,
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* 姓名首字母头像 */}
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
    { title: '新职位', dataIndex: 'toPositionName', width: 120, search: false, render: (name: string) => name || '无' },
    {
      title: '调岗原因', dataIndex: 'reason', width: 140, search: false, ellipsis: true,
    },
    {
      title: '调薪', dataIndex: 'salaryAdjustment', width: 100, search: false,
      render: (_, r) => r.salaryAdjustment != null ? `¥${r.salaryAdjustment}` : '无',
    },
    {
      title: '生效日期', dataIndex: 'effectiveDate', width: 130, search: false,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color} style={{ fontWeight: 500 }}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', APPROVED: '待调岗',
        REJECTED: '已拒绝', EFFECTIVE: '已生效', CANCELLED: '已放弃',
      },
    },
    {
      title: '操作', key: 'action', width: 300, fixed: 'right', search: false,
      render: (_, r) => {
        const isDraft = !r.recordId;
        const isFirstStep = (r as any).approvalProgress?.startsWith('1/');

        // 草稿状态：编辑、提交审批、删除
        if (isDraft) return (
          <>
            <a onClick={() => { setEditRecord(r); setFormOpen(true); }} style={{ marginRight: 8 }}>编辑</a>
            <a onClick={() => submitDraft(r.id).then(() => { actionRef.current?.reload(); fetchStats(); })} style={{ marginRight: 8 }}>提交审批</a>
            <Popconfirm title="确定删除？" onConfirm={() => deleteTransfer(r.id).then(() => { actionRef.current?.reload(); fetchStats(); })}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </>
        );

        // 审批中状态：可撤回（仅第一步）、查看进度
        if (r.approvalStatus === 'APPROVING' || r.status === 'APPROVING') return (
          <>
            {isFirstStep && (
              <Popconfirm title="确定撤回？撤回后恢复为草稿" onConfirm={() =>
                revokeTransfer(r.id).then(() => { message.success('已撤回'); actionRef.current?.reload(); fetchStats(); }).catch((e: any) => message.error(e?.message || '撤回失败'))
              }>
                <a style={{ color: '#faad14', marginRight: 8 }}>撤回</a>
              </Popconfirm>
            )}
            <a href={`/approval/detail/${r.recordId}`}>查看进度</a>
          </>
        );

        // 已批准待调岗：修改调岗日期、标记放弃、确认调岗
        if (r.status === 'APPROVED') return (
          <>
            <a onClick={() => { setTransferDateId(r.id); setTransferDateValue(''); setTransferDateOpen(true); }} style={{ marginRight: 8 }}>
              修改日期
            </a>
            <Popconfirm title="确定放弃该调岗申请？" onConfirm={() =>
              abandonTransfer(r.id).then(() => { message.success('已标记放弃'); actionRef.current?.reload(); fetchStats(); }).catch((e: any) => message.error(e?.message || '操作失败'))
            }>
              <a style={{ color: '#ff4d4f', marginRight: 8 }}>标记放弃</a>
            </Popconfirm>
            <Popconfirm title="确定确认调岗？员工信息将立即更新" onConfirm={() =>
              confirmTransfer(r.id).then(() => { message.success('调岗已生效'); actionRef.current?.reload(); fetchStats(); }).catch((e: any) => message.error(e?.message || '操作失败'))
            }>
              <a style={{ color: '#1677ff' }}>确认调岗</a>
            </Popconfirm>
          </>
        );

        // 已拒绝状态：查看原因、重新发起
        if (r.approvalStatus === 'REJECTED' || r.status === 'REJECTED') return (
          <>
            <a onClick={() => {
              setRejectionText((r as any).rejectionReason || '未填写拒绝原因');
              setRejectionModalOpen(true);
            }} style={{ marginRight: 8 }}>
              查看原因
            </a>
            <Popconfirm title="确定重新发起审批？" onConfirm={() =>
              resubmitTransfer(r.id).then(() => { message.success('已重新发起'); actionRef.current?.reload(); fetchStats(); }).catch((e: any) => message.error(e?.message || '重新发起失败'))
            }>
              <a style={{ color: '#1677ff' }}>重新发起</a>
            </Popconfirm>
          </>
        );

        // 已放弃状态
        if (r.status === 'CANCELLED') return <span style={{ color: '#8c8c8c' }}>已放弃</span>;

        // 已生效状态
        if (r.status === 'EFFECTIVE') return <span style={{ color: '#52c41a' }}>已生效</span>;

        return null;
      },
    },
  ];

  const statCards = [
    { label: '草稿', value: stats.draft, icon: <FileTextOutlined />, color: '#d9d9d9', bgColor: '#f5f5f5', borderColor: '#e8e8e8' },
    { label: '审批中', value: stats.approving, icon: <ClockCircleOutlined />, color: '#d48806', bgColor: '#fffbe6', borderColor: '#ffe58f' },
    { label: '待调岗', value: stats.approved, icon: <SwapOutlined />, color: '#fa8c16', bgColor: '#fff7e6', borderColor: '#ffd591' },
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
          onChange={(key) => { setActiveTab(key); activeTabRef.current = key; actionRef.current?.reload(); }}
          items={[
            { key: '', label: '全部' },
            { key: 'DRAFT', label: '草稿' },
            { key: 'APPROVING', label: '审批中' },
            { key: 'APPROVED', label: '待调岗' },
            { key: 'REJECTED', label: '已拒绝' },
            { key: 'EFFECTIVE', label: '已生效' },
            { key: 'CANCELLED', label: '已放弃' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <ProTable<TransferVO>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          request={fetchData}
          search={{ labelWidth: 'auto', collapsed: true }}
          pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          headerTitle={null}
          toolbar={{ actions: [] }}
        />
      </div>

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

      <Modal
        title="修改调岗日期"
        open={transferDateOpen}
        onCancel={() => setTransferDateOpen(false)}
        onOk={async () => {
          if (!transferDateValue) { message.warning('请选择日期'); return; }
          setTransferDateLoading(true);
          try {
            await updateTransferDate(transferDateId!, transferDateValue);
            message.success('调岗日期已修改');
            setTransferDateOpen(false);
            actionRef.current?.reload();
            fetchStats();
          } catch (e: any) {
            if (e?.message) message.error(e.message);
          } finally {
            setTransferDateLoading(false);
          }
        }}
        confirmLoading={transferDateLoading}
        destroyOnClose
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择新的调岗日期"
          onChange={(date) => setTransferDateValue(date?.format('YYYY-MM-DD') || '')}
        />
      </Modal>

      <TransferFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); fetchStats(); }}
      />

    </div>
  );
};

export default TransferPage;
