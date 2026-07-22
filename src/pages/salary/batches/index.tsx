import {
  createBatchUsingPost,
  listBatchesUsingGet,
} from '@/api/salaryController';
import { BATCH_STATUS_MAP } from '@/constants/enums';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  message,
  Modal,
  Row,
  Statistic,
  Tag,
  Progress,
} from 'antd';
import {
  CalculatorOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

/* ========== 内联企业级样式 ========== */
const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 50%, #003eb3 100%)',
  borderRadius: 12,
  padding: '24px 28px',
  marginBottom: 24,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 16,
};
const iconCircle = (bg: string): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  color: '#fff',
  flexShrink: 0,
});
const statCard = (accent: string): React.CSSProperties => ({
  borderRadius: 10,
  borderTop: `3px solid ${accent}`,
  transition: 'all 0.25s',
});

const SalaryBatchList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);
  const [stats, setStats] = useState({ totalBatches: 0, totalEmployees: 0, totalGrossPay: 0, totalNetPay: 0 });

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await createBatchUsingPost({ salaryMonth: values.salaryMonth.format('YYYY-MM') });
      message.success('批次创建成功');
      setCreateOpen(false);
      createForm.resetFields();
      actionRef.current?.reload();
    } catch (e: any) {
      if (e?.errorFields) message.warning('请选择薪资月份');
      else message.error(e?.message || '创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: ProColumns<API.SalaryBatchVO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '批次号', dataIndex: 'batchNo', width: 170 },
    { title: '薪资月份', dataIndex: 'salaryMonth', width: 120, valueType: 'dateMonth' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => {
        const s = BATCH_STATUS_MAP[r.status!];
        return <Tag color={s?.color}>{s?.label || '-'}</Tag>;
      },
      valueEnum: Object.fromEntries(
        Object.entries(BATCH_STATUS_MAP).map(([k, v]) => [k, { text: v.label }]),
      ),
    },
    {
      title: '员工数',
      dataIndex: 'totalEmployees',
      width: 85,
      search: false,
    },
    {
      title: '应发总额',
      dataIndex: 'totalGrossPay',
      width: 130,
      search: false,
      render: (_, r) => <span style={{ fontWeight: 600, color: '#faad14' }}>¥{(r.totalGrossPay ?? 0).toLocaleString()}</span>,
    },
    {
      title: '实发总额',
      dataIndex: 'totalNetPay',
      width: 130,
      search: false,
      render: (_, r) => <span style={{ fontWeight: 700, color: '#52c41a' }}>¥{(r.totalNetPay ?? 0).toLocaleString()}</span>,
    },
    {
      title: '个税',
      dataIndex: 'totalTax',
      width: 110,
      search: false,
      render: (_, r) => <span style={{ color: '#ff4d4f' }}>¥{(r.totalTax ?? 0).toLocaleString()}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      search: false,
      render: (_, r) => (r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      search: false,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => history.push(`/salary/batches/${r.id}`)}>
          <FileTextOutlined /> 详情
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* ====== Hero 横幅 ====== */}
      <div style={heroStyle}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>薪资核算中心</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>管理薪资核算批次 · 执行计算 · 审批发放</div>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.totalBatches}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>批次总数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.totalEmployees}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>覆盖人次</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>¥{(stats.totalNetPay / 10000).toFixed(1)}万</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>实发总额</div>
          </div>
        </div>
      </div>

      {/* ====== KPI 卡片 ====== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={statCard('#1677ff')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconCircle('rgba(22,119,255,.15)')}><CalculatorOutlined style={{ color: '#1677ff' }} /></div>
              <Statistic title="批次总数" value={stats.totalBatches} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={statCard('#52c41a')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconCircle('rgba(82,196,26,.15)')}><TeamOutlined style={{ color: '#52c41a' }} /></div>
              <Statistic title="覆盖员工" value={stats.totalEmployees} suffix="人次" valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={statCard('#faad14')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconCircle('rgba(250,173,20,.15)')}><DollarOutlined style={{ color: '#faad14' }} /></div>
              <Statistic title="应发总额" value={stats.totalGrossPay} prefix="¥" precision={2} valueStyle={{ color: '#faad14', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={statCard('#722ed1')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconCircle('rgba(114,46,209,.15)')}><TrophyOutlined style={{ color: '#722ed1' }} /></div>
              <Statistic title="实发总额" value={stats.totalNetPay} prefix="¥" precision={2} valueStyle={{ color: '#722ed1', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ====== 表格 ====== */}
      <ProTable<API.SalaryBatchVO>
        headerTitle={<span><CalculatorOutlined style={{ marginRight: 8 }} />薪资核算批次</span>}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await listBatchesUsingGet({ current: params.current, pageSize: params.pageSize, salaryMonth: params.salaryMonth, status: params.status });
          const records = (res.data as any)?.records ?? [];
          const total = (res.data as any)?.total ?? 0;
          let emp = 0, gross = 0, net = 0;
          records.forEach((r: API.SalaryBatchVO) => { emp += r.totalEmployees ?? 0; gross += r.totalGrossPay ?? 0; net += r.totalNetPay ?? 0; });
          setStats({ totalBatches: total, totalEmployees: emp, totalGrossPay: gross, totalNetPay: net });
          return { data: records, success: true, total };
        }}
        toolBarRender={() => [
          access.canManageSalaryBatch && <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建批次</Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
        ]}
        rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''}
      />

      <Modal
        title={<span><PlusOutlined style={{ marginRight: 8 }} />创建核算批次</span>}
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        confirmLoading={createLoading}
        okText="创建"
        cancelText="取消"
        width={480}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="salaryMonth" label="薪资月份" rules={[{ required: true, message: '请选择薪资月份' }]} extra="选择要核算的薪资月份">
            <DatePicker picker="month" style={{ width: '100%' }} placeholder="请选择薪资月份" disabledDate={(c) => c && c >= dayjs().startOf('month')} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SalaryBatchList;
