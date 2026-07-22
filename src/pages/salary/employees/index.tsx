import { getEmployeeListUsingGet } from '@/api/employeeController';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, Row, Space, Statistic, Tag } from 'antd';
import { EditOutlined, EyeOutlined, IdcardOutlined, UserOutlined, TeamOutlined, ContactsOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #722ed1 0%, #531dab 50%, #391085 100%)',
  borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
};
const iconCircle = (bg: string): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: '50%', background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
});

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: '试用期', color: 'blue' }, 2: { label: '正式', color: 'green' },
  3: { label: '待离职', color: 'orange' }, 4: { label: '已离职', color: 'red' },
};

const EmployeeSalaryList: React.FC = () => {
  const actionRef = useRef<any>();
  const [total, setTotal] = useState(0);

  const columns: ProColumns<any>[] = [
    { title: '工号', dataIndex: 'employeeNo', width: 120, search: false, render: (_, r) => <span><IdcardOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />{r.employeeNo || '-'}</span> },
    { title: '姓名', dataIndex: 'name', width: 110, render: (_, r) => <a onClick={() => history.push(`/salary/employees/${r.id}`)} style={{ fontWeight: 500 }}><UserOutlined style={{ marginRight: 4 }} />{r.name}</a> },
    { title: '部门', dataIndex: 'departmentName', width: 140, search: false },
    { title: '职位', dataIndex: 'positionName', width: 140, search: false },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => { const s = statusMap[r.status]; return s ? <Tag color={s.color}>{s.label}</Tag> : '-'; }, valueEnum: { 1: { text: '试用期' }, 2: { text: '正式' }, 3: { text: '待离职' }, 4: { text: '已离职' } } },
    { title: '操作', key: 'action', width: 170, fixed: 'right', search: false, render: (_, r) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => history.push(`/salary/employees/${r.id}`)}>薪资详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => history.push(`/salary/employees/${r.id}/edit`)}>编辑</Button>
      </Space>
    )},
  ];

  return (
    <PageContainer>
      {/* Hero */}
      <div style={heroStyle}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>员工薪资档案</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>管理员工薪资账套、基数及调薪历史</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800 }}>{total}</div><div style={{ fontSize: 12, opacity: 0.75 }}>档案总数</div></div>
        </div>
      </div>

      <ProTable<any>
        headerTitle={<span><IdcardOutlined style={{ marginRight: 8 }} />员工薪资档案</span>}
        actionRef={actionRef} rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await getEmployeeListUsingGet({ current: params.current, pageSize: params.pageSize, keyword: params.keyword, departmentId: params.departmentId, status: params.status } as any);
          const records = (res.data as any)?.records ?? [];
          setTotal((res.data as any)?.total ?? records.length);
          return { data: records, success: true, total: (res.data as any)?.total ?? records.length };
        }}
        rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''}
      />
    </PageContainer>
  );
};

export default EmployeeSalaryList;
