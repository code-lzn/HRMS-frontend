import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import usePermission from '@/hooks/usePermission';
import OnboardingFormModal from './components/OnboardingFormModal';
import ConfirmModal from './components/ConfirmModal';
import {
  listOnboarding, deleteOnboarding, submitDraft,
  abandonOnboarding,
} from './services/onboarding';
import type { OnboardingVO } from './types/onboarding';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  DRAFT:      { color: '#d9d9d9', text: '草稿' },
  APPROVING:  { color: '#1677ff', text: '审批中' },
  APPROVED:   { color: '#52c41a', text: '已批准待入职' },
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

  const columns: ProColumns<OnboardingVO>[] = [
    { title: '单号', dataIndex: 'businessNo', width: 180, search: false },
    { title: '姓名', dataIndex: 'candidateName', width: 100, ellipsis: true },
    { title: '手机号', dataIndex: 'phone', width: 130, search: false },
    { title: '部门', dataIndex: 'deptName', width: 120, search: false },
    { title: '职位', dataIndex: 'positionName', width: 120, search: false },
    { title: '审批人', dataIndex: 'approverName', width: 100, search: false },
    {
      title: '录用类型', dataIndex: 'employmentType', width: 90, search: false,
      render: (_, r) => r.employmentType === 'FULL_TIME' ? '全职' : '兼职',
    },
    {
      title: '预定入职', dataIndex: 'hireDate', width: 110, search: false, valueType: 'date',
    },
    {
      title: '状态', dataIndex: 'approvalStatus', width: 120,
      render: (_, r) => {
        const cfg = STATUS_MAP[r.approvalStatus ?? 'DRAFT'];
        return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', APPROVING: '审批中', APPROVED: '已批准待入职',
        REJECTED: '已拒绝', ONBOARDED: '已入职',
      },
    },
    {
      title: '创建时间', dataIndex: 'createTime', width: 170, search: false, valueType: 'dateTime',
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right', search: false,
      render: (_, r) => {
        const status = (r as any).approvalStatus;
        const isDraft = !r.recordId;
        if (isDraft) return (
          <>
            <a onClick={() => { setEditRecord(r); setFormOpen(true); }}>编辑</a>
            <a style={{ marginLeft: 8 }} onClick={() => submitDraft(r.id).then(() => actionRef.current?.reload())}>
              提交审批
            </a>
            <Popconfirm title="确定删除？" onConfirm={() => deleteOnboarding(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: 'red', marginLeft: 8 }}>删除</a>
            </Popconfirm>
          </>
        );
        if (status === 'APPROVING') return (
          <a href={`/approval/detail/${r.recordId}`}>查看审批进度</a>
        );
        if (status === 'APPROVED') return (
          <>
            <a onClick={() => { setConfirmId(r.id); setConfirmOpen(true); }}>确认入职</a>
            <Popconfirm title="确定放弃？" onConfirm={() => abandonOnboarding(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: '#faad14', marginLeft: 8 }}>放弃</a>
            </Popconfirm>
          </>
        );
        if (status === 'REJECTED') return (
          <a onClick={() => { setEditRecord(r); setFormOpen(true); }}>重新编辑</a>
        );
        return <span style={{ color: '#999' }}>已入职</span>;
      },
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <ProTable<OnboardingVO>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        params={{ statuses: activeTab ? [activeTab] : undefined }}
        request={async (p) => {
          const res = await listOnboarding({
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
          actions: canAddEmployee ? [
            <Button key="add" type="primary" icon={<PlusOutlined />}
              onClick={() => { setEditRecord(null); setFormOpen(true); }}>
              新增入职
            </Button>,
          ] : [],
        }}
        headerTitle={
          <Tabs activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); actionRef.current?.reload(); }}
            items={[
              { key: '', label: '全部' },
              { key: 'DRAFT', label: '草稿' },
              { key: 'APPROVING', label: '审批中' },
              { key: 'APPROVED', label: '已批准待入职' },
              { key: 'REJECTED', label: '已拒绝' },
              { key: 'ONBOARDED', label: '已入职' },
            ]}
          />
        }
      />
      <OnboardingFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
      <ConfirmModal open={confirmOpen} onboardingId={confirmId}
        onOk={() => { setConfirmOpen(false); actionRef.current?.reload(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default OnboardingPage;
