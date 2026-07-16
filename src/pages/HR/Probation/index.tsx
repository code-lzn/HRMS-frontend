import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
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

const ProbationPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RegularizationVO | null>(null);

  const columns: ProColumns<RegularizationVO>[] = [
    { title: '单号', dataIndex: 'businessNo', width: 170, search: false },
    { title: '姓名', dataIndex: 'employeeName', width: 100, ellipsis: true },
    { title: '工号', dataIndex: 'employeeNo', width: 100, search: false },
    { title: '部门', dataIndex: 'deptName', width: 120, search: false },
    {
      title: '试用期截止', dataIndex: 'probationEndDate', width: 110, search: false, valueType: 'date',
    },
    {
      title: '评价', dataIndex: 'evaluation', width: 160, search: false, ellipsis: true,
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
        return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : <Tag>草稿</Tag>;
      },
      valueType: 'select',
      valueEnum: {
        DRAFT: '草稿', PENDING_ASSESSMENT: '待评估',
        APPROVING: '审批中', APPROVED: '已转正', REJECTED: '已拒绝',
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
            <Popconfirm title="确定删除？" onConfirm={() => deleteRegularization(r.id).then(() => actionRef.current?.reload())}>
              <a style={{ color: 'red', marginLeft: 8 }}>删除</a>
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

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <ProTable<RegularizationVO>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
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
        search={{ labelWidth: 'auto' }}
        toolbar={{
          actions: [
            <Button type="primary" icon={<PlusOutlined />}
              onClick={() => { setEditRecord(null); setFormOpen(true); }}>
              新增转正申请
            </Button>,
          ],
        }}
        headerTitle={
          <Tabs activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); actionRef.current?.reload(); }}
            items={[
              { key: '', label: '全部' },
              { key: 'DRAFT', label: '草稿' },
              { key: 'PENDING_ASSESSMENT', label: '待评估' },
              { key: 'APPROVING', label: '审批中' },
              { key: 'APPROVED', label: '已转正' },
              { key: 'REJECTED', label: '已拒绝' },
            ]}
          />
        }
      />
      <RegularizationFormModal open={formOpen} editData={editRecord}
        onCancel={() => { setFormOpen(false); setEditRecord(null); }}
        onOk={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload(); }}
      />
    </div>
  );
};

export default ProbationPage;
