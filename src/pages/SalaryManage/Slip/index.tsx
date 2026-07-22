import {
  listBatchesUsingGet,
  previewBatchUsingGet,
} from '@/api/salaryManageController';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  CALCULATING: { label: '计算中', color: 'processing' },
  PENDING_CONFIRM: { label: '待确认', color: 'warning' },
  APPROVING: { label: '审批中', color: 'orange' },
  APPROVED: { label: '已通过', color: 'cyan' },
  PAID: { label: '已发放', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
};

const fmtMoney = (v?: number) =>
  v != null
    ? `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const SlipPage: React.FC = () => {
  // 批次
  const [batches, setBatches] = useState<API.SalaryBatchVO[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<API.SalaryBatchVO | null>(null);

  // 工资条列表
  const [records, setRecords] = useState<API.SalaryDetailVO[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 筛选
  const [keyword, setKeyword] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | undefined>();

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<API.SalaryDetailVO | null>(null);

  // 分页
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await listBatchesUsingGet();
      const data: API.SalaryBatchVO[] = (res as any)?.data ?? [];
      // 只显示已审批/已发放的（工资条可见的）
      const visible = data.filter((b) => b.status === 'APPROVED' || b.status === 'PAID');
      setBatches(visible);
      if (visible.length > 0 && !selectedBatchId) {
        setSelectedBatchId(visible[visible.length - 1].id!);
      }
    } catch (e) { console.error('pages/SalaryManage/Slip/index.tsx', e); } finally {
      setBatchesLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async (batchId: number, page: number, size: number) => {
    setRecordsLoading(true);
    try {
      const res = await previewBatchUsingGet({ id: batchId, current: page, size: Math.min(size, 500) });
      const raw: any = res;
      const data = raw?.data ?? raw;
      let list: any[] = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.records)) list = data.records;
      setRecords(list);
      setTotal(data?.total ?? list.length);

      // 加载批次信息
      const batch = await listBatchesUsingGet();
      const allBatches = (batch as any)?.data ?? [];
      setSelectedBatch(allBatches.find((b: API.SalaryBatchVO) => b.id === batchId) ?? null);
    } catch (e) { console.error('pages/SalaryManage/Slip/index.tsx', e); } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (selectedBatchId) {
      setPagination({ current: 1, pageSize: 20 });
      loadRecords(selectedBatchId, 1, 20);
    }
  }, [selectedBatchId, loadRecords]);

  // 部门列表（从数据中提取）
  const departments = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.departmentName) set.add(r.departmentName);
    });
    return Array.from(set).sort();
  }, [records]);

  // 前端筛选
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchKeyword =
        !keyword ||
        (r.employeeName ?? '').includes(keyword) ||
        (r.employeeNo ?? '').includes(keyword);
      const matchDept = !deptFilter || r.departmentName === deptFilter;
      return matchKeyword && matchDept;
    });
  }, [records, keyword, deptFilter]);

  // 统计
  const stats = useMemo(() => {
    const all = records;
    const totalGross = all.reduce((s, r) => s + (r.grossSalary ?? 0), 0);
    const totalNet = all.reduce((s, r) => s + (r.netSalary ?? 0), 0);
    const anomalyCount = all.filter((r) => r.hasAnomaly !== 0).length;
    const viewedCount = all.length; // 实际应从后端获取查看日志
    return { totalGross, totalNet, anomalyCount, viewedCount, total: all.length };
  }, [records]);

  const columns: ColumnsType<API.SalaryDetailVO> = [
    {
      title: '工号', dataIndex: 'employeeNo', width: 110,
      sorter: (a, b) => (a.employeeNo ?? '').localeCompare(b.employeeNo ?? ''),
    },
    {
      title: '姓名', dataIndex: 'employeeName', width: 80,
    },
    {
      title: '部门', dataIndex: 'departmentName', width: 120, ellipsis: true,
    },
    {
      title: '基本工资', dataIndex: 'baseSalary', width: 100, align: 'right',
      sorter: (a, b) => (a.baseSalary ?? 0) - (b.baseSalary ?? 0),
      render: (v) => fmtMoney(v),
    },
    {
      title: '绩效奖金', dataIndex: 'performanceBonus', width: 100, align: 'right',
      render: (v) => fmtMoney(v),
    },
    {
      title: '加班费', dataIndex: 'overtimePay', width: 90, align: 'right',
      render: (v) => fmtMoney(v),
    },
    {
      title: '应发合计', dataIndex: 'grossSalary', width: 110, align: 'right',
      sorter: (a, b) => (a.grossSalary ?? 0) - (b.grossSalary ?? 0),
      render: (v) => <span style={{ fontWeight: 500 }}>{fmtMoney(v)}</span>,
    },
    {
      title: '社保+公积金', width: 120, align: 'right',
      render: (_, r) => {
        const total =
          (r.socialPension ?? 0) +
          (r.socialMedical ?? 0) +
          (r.socialUnemployment ?? 0) +
          (r.housingFund ?? 0);
        return <span style={{ color: '#ff4d4f' }}>-{fmtMoney(total).replace('¥', '')}</span>;
      },
    },
    {
      title: '个税', dataIndex: 'incomeTax', width: 90, align: 'right',
      render: (v) =>
        v ? <span style={{ color: '#ff4d4f' }}>-{fmtMoney(v).replace('¥', '')}</span> : '-',
    },
    {
      title: '实发工资', dataIndex: 'netSalary', width: 120, align: 'right',
      sorter: (a, b) => (a.netSalary ?? 0) - (b.netSalary ?? 0),
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff', fontSize: 14 }}>
          {fmtMoney(v)}
        </span>
      ),
    },
    {
      title: '查看状态', width: 90, align: 'center',
      render: (_, r) => {
        // 实际查看状态应从 SalPayslipViewLog 获取
        // 此处根据批次状态推断
        const isViewed = selectedBatch?.status === 'PAID';
        return isViewed ? (
          <Tag icon={<CheckCircleOutlined />} color="success">已查看</Tag>
        ) : (
          <Tag color="default">未查看</Tag>
        );
      },
    },
    {
      title: '异常', dataIndex: 'hasAnomaly', width: 80,
      render: (v) => {
        if (v === 2) return <Tag color="error">阻断</Tag>;
        if (v === 1) return <Tag color="warning">预警</Tag>;
        return <Tag color="success">正常</Tag>;
      },
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setDetailRecord(r);
            setDetailOpen(true);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>工资条管理</Title>
          <Text type="secondary">管理和查看已审批通过的员工工资条</Text>
        </div>
        <Space>
          <Select
            style={{ width: 300 }}
            value={selectedBatchId}
            onChange={(v) => setSelectedBatchId(v)}
            loading={batchesLoading}
            placeholder="选择核算批次"
            options={batches.map((b) => ({
              label: `${b.salaryMonth ?? ''} · ${b.batchNo ?? ''} · ${STATUS_MAP[b.status ?? '']?.label ?? ''}`,
              value: b.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
          <Button icon={<ReloadOutlined />} onClick={() => selectedBatchId && loadRecords(selectedBatchId, 1, 20)}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      {selectedBatch && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small" style={{ borderLeft: '3px solid #5B8FF9' }}>
              <Statistic title="工资条数量" value={stats.total} suffix="份" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
              <Statistic title="应发总额" value={stats.totalGross} precision={2} prefix="¥" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderLeft: '3px solid #722ED1' }}>
              <Statistic title="实发总额" value={stats.totalNet} precision={2} prefix="¥" valueStyle={{ color: '#722ED1' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderLeft: stats.anomalyCount > 0 ? '3px solid #ff4d4f' : '3px solid #d9d9d9' }}>
              <Statistic
                title="异常标记"
                value={stats.anomalyCount}
                suffix={`/ ${stats.total}`}
                valueStyle={{ color: stats.anomalyCount > 0 ? '#ff4d4f' : '#999' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <Space size={16} wrap>
          <Input
            placeholder="搜索姓名/工号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="筛选部门"
            value={deptFilter}
            onChange={(v) => setDeptFilter(v)}
            allowClear
            style={{ width: 180 }}
            options={departments.map((d) => ({ label: d, value: d }))}
          />
        </Space>
      </Card>

      {/* 工资条表格 */}
      <Card title={
        <Space>
          <FileTextOutlined />
          <span>工资条列表</span>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {selectedBatch && `批次 ${selectedBatch.batchNo} · ${selectedBatch.salaryMonth}`}
          </Text>
        </Space>
      }>
        <Spin spinning={recordsLoading}>
          {!selectedBatchId ? (
            <Empty description="请先选择一个已审批的核算批次" />
          ) : filteredRecords.length === 0 ? (
            <Empty description="暂无工资条数据" />
          ) : (
            <Table<API.SalaryDetailVO>
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              size="middle"
              scroll={{ x: 1400 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条工资条`,
                pageSizeOptions: ['20', '50', '100'],
                onChange: (page, size) => {
                  setPagination({ current: page, pageSize: size });
                  if (selectedBatchId) loadRecords(selectedBatchId, page, size);
                },
              }}
            />
          )}
        </Spin>
      </Card>

      {/* 工资条详情弹窗 */}
      <Modal
        title={detailRecord ? `${detailRecord.employeeName} - ${selectedBatch?.salaryMonth ?? ''} 工资条` : '工资条详情'}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
      >
        {detailRecord && (
          <div style={{ padding: '8px 0' }}>
            {/* 员工信息 */}
            <Descriptions column={3} size="small" bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="姓名">{detailRecord.employeeName}</Descriptions.Item>
              <Descriptions.Item label="工号">{detailRecord.employeeNo}</Descriptions.Item>
              <Descriptions.Item label="部门">{detailRecord.departmentName}</Descriptions.Item>
            </Descriptions>

            {/* 双栏明细 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* 收入 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a', marginBottom: 12 }}>
                  ▎收入项
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Row justify="space-between"><Text>基本工资</Text><Text strong>{fmtMoney(detailRecord.baseSalary)}</Text></Row>
                  <Row justify="space-between"><Text>岗位津贴</Text><Text strong>{fmtMoney(detailRecord.allowance)}</Text></Row>
                  <Row justify="space-between"><Text>绩效奖金</Text><Text strong>{fmtMoney(detailRecord.performanceBonus)}</Text></Row>
                  <Row justify="space-between"><Text>加班费</Text><Text strong>{fmtMoney(detailRecord.overtimePay)}</Text></Row>
                  {(detailRecord.manualAdjust ?? 0) !== 0 && (
                    <Row justify="space-between">
                      <Text>手动调整</Text>
                      <Text strong style={{ color: (detailRecord.manualAdjust ?? 0) > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {fmtMoney(detailRecord.manualAdjust)}
                      </Text>
                    </Row>
                  )}
                </div>
                <div style={{ borderTop: '1px solid #e8e8e8', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ color: '#52c41a' }}>应发小计</Text>
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>{fmtMoney(detailRecord.grossSalary)}</Text>
                </div>
              </div>

              {/* 扣除 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f', marginBottom: 12 }}>
                  ▎扣除项
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Row justify="space-between"><Text>迟到扣款</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.lateDeduction).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>请假扣款</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.leaveDeduction).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>养老保险</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.socialPension).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>医疗保险</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.socialMedical).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>失业保险</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.socialUnemployment).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>住房公积金</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.housingFund).replace('¥', '')}</Text></Row>
                  <Row justify="space-between"><Text>个人所得税</Text><Text style={{ color: '#ff4d4f' }}>-{fmtMoney(detailRecord.incomeTax).replace('¥', '')}</Text></Row>
                </div>
                <div style={{ borderTop: '1px solid #e8e8e8', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ color: '#ff4d4f' }}>应扣小计</Text>
                  <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>-{fmtMoney(detailRecord.totalDeduction).replace('¥', '')}</Text>
                </div>
              </div>
            </div>

            {/* 实发 */}
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
              border: '1px solid #bae0ff',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <Text type="secondary">实发工资</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff', letterSpacing: 1 }}>
                {fmtMoney(detailRecord.netSalary)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SlipPage;
