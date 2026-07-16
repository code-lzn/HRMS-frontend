import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import ResignationFormModal from './components/ResignationFormModal';
import {
  listResignation, deleteResignation, submitDraft,
} from './services/resignation';
import type { ResignationVO } from './types/resignation';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:        { color: '#d9d9d9', text: '草稿' },
  APPROVING:    { color: '#1677ff', text: '审批中' },
  PENDING_RESIGN:{ color: '#faad14', text: '待离职' },
  RESIGNED:     { color: '#999', text: '已离职' },
  REJECTED:     { color: '#ff4d4f', text: '已拒绝' },
};

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

  const columns: ProColumns<ResignationVO>[] = [
    { title: '单号', dataIndex: 'businessNo', width: 170, search: false },
    { title: '姓名', dataIndex: 'employeeName', width: 100, ellipsis: true },
    { title: '工号', dataIndex: 'employeeNo', width: 100, search: false },
    { title: '部门', dataIndex: 'deptName', width: 120, search: false },
    {
      title: '离职日期', dataIndex: 'resignDate', width: 110, search: false, valueType: 'date',
    },
    {
      title: '原因', dataIndex: 'resignReasonType', width: 90, search: false,
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
      title: '状态', dataIndex: 'status', width: 90,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.status ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', PENDING_RESIGN: '待离职',
        RESIGNED: '已离职', REJECTED: '已拒绝',
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
            <Popconfirm title="确定删除？" onConfirm={() => deleteResignation(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: 'red', marginLeft: 8 }}>删除</a>
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

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <ProTable<ResignationVO>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        params={{ statuses: activeTab ? [activeTab] : undefined }}
        request={async (p) => {
          const res = await listResignation({
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
              新增离职申请
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
              { key: 'PENDING_RESIGN', label: '待离职' },
              { key: 'RESIGNED', label: '已离职' },
              { key: 'REJECTED', label: '已拒绝' },
            ]}
          />
        }
      />
      <ResignationFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default ResignationPage;
