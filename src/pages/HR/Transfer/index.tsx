import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import TransferFormModal from './components/TransferFormModal';
import {
  listTransfer, deleteTransfer, submitDraft,
} from './services/transfer';
import type { TransferVO } from './types/transfer';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:    { color: '#d9d9d9', text: '草稿' },
  APPROVING:{ color: '#1677ff', text: '审批中' },
  APPROVED: { color: '#52c41a', text: '已通过' },
  EFFECTIVE:{ color: '#52c41a', text: '已生效' },
  REJECTED: { color: '#ff4d4f', text: '已拒绝' },
};

const TransferPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TransferVO | null>(null);

  const columns: ProColumns<TransferVO>[] = [
    { title: '单号', dataIndex: 'businessNo', width: 170, search: false },
    { title: '姓名', dataIndex: 'employeeName', width: 100, ellipsis: true },
    {
      title: '原部门→新部门', key: 'deptChange', width: 180, search: false,
      render: (_, r) => (
        <span>
          <span style={{ color: '#999' }}>{r.fromDeptName}</span>
          {' → '}
          <span style={{ color: '#1677ff' }}>{r.toDeptName}</span>
        </span>
      ),
    },
    { title: '新职位', dataIndex: 'toPositionName', width: 100, search: false },
    {
      title: '调岗原因', dataIndex: 'reason', width: 140, search: false, ellipsis: true,
    },
    {
      title: '调薪', dataIndex: 'salaryAdjustment', width: 90, search: false,
      render: (_, r) => r.salaryAdjustment != null ? `¥${r.salaryAdjustment}` : '-',
    },
    {
      title: '生效日期', dataIndex: 'effectiveDate', width: 110, search: false, valueType: 'date',
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', APPROVED: '已通过',
        EFFECTIVE: '已生效', REJECTED: '已拒绝',
      },
    },
    {
      title: '创建时间', dataIndex: 'createTime', width: 160, search: false, valueType: 'dateTime',
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right', search: false,
      render: (_, r) => {
        const isDraft = !r.recordId;
        if (isDraft) return (
          <>
            <a onClick={() => { setEditRecord(r); setFormOpen(true); }}>编辑</a>
            <a style={{ marginLeft: 8 }} onClick={() => submitDraft(r.id).then(() => actionRef.current?.reload())}>
              提交审批
            </a>
            <Popconfirm title="确定删除？" onConfirm={() => deleteTransfer(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: 'red', marginLeft: 8 }}>删除</a>
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

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <ProTable<TransferVO>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        params={{ statuses: activeTab ? [activeTab] : undefined }}
        request={async (p) => {
          const res = await listTransfer({
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
        search={{ labelWidth: 'auto' }}
        toolbar={{
          actions: [
            <Button type="primary" icon={<PlusOutlined />}
              onClick={() => { setEditRecord(null); setFormOpen(true); }}>
              新增调岗申请
            </Button>,
          ],
        }}
        headerTitle={
          <Tabs activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); actionRef.current?.reload(); }}
            items={[
              { key: '', label: '全部' },
              { key: 'DRAFT', label: '草稿' },
              { key: 'APPROVING', label: '审批中' },
              { key: 'APPROVED', label: '已通过' },
              { key: 'REJECTED', label: '已拒绝' },
            ]}
          />
        }
      />
      <TransferFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default TransferPage;
