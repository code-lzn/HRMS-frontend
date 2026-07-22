import { createAccountUsingPost, deleteAccountUsingDelete, listAccountsUsingGet, updateAccountUsingPut } from '@/api/salaryController';
import { SCOPE_TYPE_MAP } from '@/constants/enums';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, Card, Col, message, Modal, Popconfirm, Row, Space, Statistic, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, BankOutlined, TeamOutlined, TagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import AccountForm from './components/AccountForm';

const SCOPE_COLOR_MAP: Record<number, string> = { 1: 'blue', 2: 'green', 3: 'purple' };
const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #13c2c2 0%, #08979c 50%, #006d75 100%)',
  borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
};

const SalaryAccountList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<API.SalaryAccountVO | null>(null);
  const [summary, setSummary] = useState({ count: 0, totalItems: 0 });

  const handleCreate = () => { setEditingRecord(null); setModalOpen(true); };
  const handleEdit = (r: API.SalaryAccountVO) => { setEditingRecord(r); setModalOpen(true); };

  const handleDelete = (r: API.SalaryAccountVO) => {
    Modal.confirm({ title: '确认删除', icon: <DeleteOutlined />, content: `确定要删除账套「${r.name}」吗？删除后不可恢复。`, okText: '确认删除', okButtonProps: { danger: true }, cancelText: '取消',
      onOk: async () => { await deleteAccountUsingDelete(r.id!); message.success('账套已删除'); actionRef.current?.reload(); } });
  };

  const handleModalOk = async (values: any) => {
    if (editingRecord) { await updateAccountUsingPut(editingRecord.id!, { ...values, id: editingRecord.id }); message.success('账套已更新'); }
    else { await createAccountUsingPost(values); message.success('账套已创建'); }
    setModalOpen(false); actionRef.current?.reload();
  };

  const columns: ProColumns<API.SalaryAccountVO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '账套名称', dataIndex: 'name', width: 220, ellipsis: true, render: (_, r) => <a onClick={() => history.push(`/salary/accounts/${r.id}`)} style={{ fontWeight: 500 }}><BankOutlined style={{ marginRight: 6 }} />{r.name}</a> },
    { title: '适用范围', dataIndex: 'scopeType', width: 100, render: (_, r) => <Tag color={SCOPE_COLOR_MAP[r.scopeType!] || 'default'}>{SCOPE_TYPE_MAP[r.scopeType!] || '-'}</Tag>, valueEnum: Object.fromEntries(Object.entries(SCOPE_TYPE_MAP).map(([k, v]) => [k, { text: v }])) },
    { title: '适用对象', dataIndex: 'scopeIds', width: 140, search: false, render: (_, r) => {
      const ids = r.scopeIds; if (!ids || (Array.isArray(ids) && ids.length === 0)) return <Tag color="cyan">全员适用</Tag>;
      if (Array.isArray(ids)) return <Space size={3} wrap>{ids.slice(0, 3).map((id, i) => <Tag key={i}>{id}</Tag>)}{ids.length > 3 && <Tag>+{ids.length - 3}</Tag>}</Space>;
      return <span>{String(ids)}</span>;
    }},
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120, search: false, render: (_, r) => r.effectiveDate ? dayjs(r.effectiveDate).format('YYYY-MM-DD') : '-' },
    { title: '项目数', dataIndex: 'items', width: 80, search: false, render: (_, r) => { const c = r.items?.length ?? 0; return <Tag color={c > 0 ? 'blue' : 'default'}>{c} 项</Tag>; } },
    { title: '创建时间', dataIndex: 'createTime', width: 160, search: false, render: (_, r) => r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '操作', key: 'action', width: 200, fixed: 'right', search: false, render: (_, r) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => history.push(`/salary/accounts/${r.id}`)}>详情</Button>
        {access.canManageSalaryAccount && <>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" description={`确定要删除「${r.name}」吗？`} onConfirm={() => handleDelete(r)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </>}
      </Space>
    )},
  ];

  return (
    <PageContainer>
      <div style={heroStyle}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>薪资账套管理</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>配置薪资计算规则、工资项目与适用范围</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800 }}>{summary.count}</div><div style={{ fontSize: 12, opacity: 0.75 }}>账套总数</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800 }}>{summary.totalItems}</div><div style={{ fontSize: 12, opacity: 0.75 }}>工资项目</div></div>
        </div>
      </div>

      <ProTable<API.SalaryAccountVO>
        headerTitle={<span><BankOutlined style={{ marginRight: 8 }} />薪资账套</span>}
        actionRef={actionRef} rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await listAccountsUsingGet({ current: params.current, pageSize: params.pageSize, name: params.name, scopeType: params.scopeType });
          const data = (res.data as any) ?? [];
          let items = 0; data.forEach((a: API.SalaryAccountVO) => { items += a.items?.length ?? 0; });
          setSummary({ count: data.length, totalItems: items });
          return { data, success: true, total: data.length };
        }}
        toolBarRender={() => [access.canManageSalaryAccount && <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建账套</Button>]}
        rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''}
      />
      <AccountForm open={modalOpen} editingRecord={editingRecord} onOk={handleModalOk} onCancel={() => setModalOpen(false)} />
    </PageContainer>
  );
};

export default SalaryAccountList;
