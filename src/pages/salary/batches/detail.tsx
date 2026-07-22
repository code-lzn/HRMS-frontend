import {
  adjustDetailUsingPut, approveUsingPut, executeCalculateUsingPost,
  getBatchDetailUsingGet, listDetailsUsingGet, markAsPaidUsingPut,
  rejectUsingPut, submitForApprovalUsingPut,
} from '@/api/salaryController';
import { ABNORMAL_LEVEL_MAP, BATCH_STATUS_MAP } from '@/constants/enums';
import {
  ArrowLeftOutlined, CalculatorOutlined, CheckCircleOutlined,
  CloseCircleOutlined, DollarOutlined, FileProtectOutlined,
  PlayCircleOutlined, SendOutlined, TeamOutlined, WalletOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useAccess, useParams } from '@umijs/max';
import {
  Button, Card, Col, Descriptions, message, Modal, Popconfirm,
  Row, Space, Statistic, Steps, Tag, Tooltip, Timeline, Typography,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdjustModal from './components/AdjustModal';

const { Text } = Typography;

const heroGradient: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff',
};
const iconCircle = (bg: string): React.CSSProperties => ({
  width: 42, height: 42, borderRadius: '50%', background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
});
const statBox: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px',
  textAlign: 'center', minWidth: 120,
};

const BatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const bId = batchId!;
  const access = useAccess();
  const actionRef = useRef<any>();
  const [batch, setBatch] = useState<API.SalaryBatchVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustDetailId, setAdjustDetailId] = useState<number | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBatch = useCallback(async () => {
    const res = await getBatchDetailUsingGet(bId);
    setBatch(res.data ?? null);
    setLoading(false);
  }, [bId]);

  useEffect(() => { fetchBatch(); }, [fetchBatch]);

  const handleAction = async (action: string) => {
    if (actionLoading) return;
    setActionLoading(action);
    try {
      switch (action) {
        case 'calculate': await executeCalculateUsingPost(bId); message.success('薪资计算已完成，请核对结果'); break;
        case 'submit': await submitForApprovalUsingPut(bId); message.success('已提交审批'); break;
        case 'approve': await approveUsingPut(bId); message.success('审批已通过'); break;
        case 'reject': await rejectUsingPut(bId, { reason: rejectReason }); message.success('已驳回'); setRejectOpen(false); setRejectReason(''); break;
        case 'paid': await markAsPaidUsingPut(bId); message.success('已标记为发放'); break;
      }
      await fetchBatch();
      actionRef.current?.reload();
    } catch (e: any) { message.error(e?.message || '操作失败'); }
    finally { setActionLoading(null); }
  };

  const status = batch?.status ?? 0;
  const isRejected = status === 6;
  const isCalculating = status === 1;

  const stepItems = [
    { title: '草稿', icon: <PlayCircleOutlined /> },
    { title: '待确认', icon: <FileProtectOutlined /> },
    { title: '审批中', icon: <SendOutlined /> },
    { title: '已通过', icon: <CheckCircleOutlined /> },
    { title: '已发放', icon: <WalletOutlined /> },
  ];
  const stepCurrent = isRejected ? 2 : status >= 5 ? 4 : status >= 3 ? Math.min(status - 1, 4) : status === 2 ? 1 : 0;

  const detailColumns = [
    { title: '员工ID', dataIndex: 'employeeId', width: 80 },
    { title: '应发工资', dataIndex: 'grossPay', width: 110, render: (_: any, r: any) => `¥${(r.grossPay ?? 0).toLocaleString()}` },
    { title: '社保', dataIndex: 'socialSecurity', width: 100, render: (_: any, r: any) => `-¥${(r.socialSecurity ?? 0).toLocaleString()}` },
    { title: '公积金', dataIndex: 'housingFund', width: 100, render: (_: any, r: any) => `-¥${(r.housingFund ?? 0).toLocaleString()}` },
    { title: '个税', dataIndex: 'incomeTax', width: 100, render: (_: any, r: any) => <span style={{ color: '#ff4d4f' }}>-¥{(r.incomeTax ?? 0).toLocaleString()}</span> },
    { title: '扣除合计', dataIndex: 'totalDeductions', width: 110, render: (_: any, r: any) => <span style={{ color: '#ff4d4f' }}>-¥{(r.totalDeductions ?? 0).toLocaleString()}</span> },
    { title: '实发工资', dataIndex: 'netPay', width: 130, render: (_: any, r: any) => <strong style={{ fontSize: 15, color: '#1677ff' }}>¥{(r.netPay ?? 0).toLocaleString()}</strong> },
    { title: '异常', dataIndex: 'isAbnormal', width: 90, render: (_: any, r: any) => { const s = ABNORMAL_LEVEL_MAP[r.isAbnormal!]; return s ? <Tag color={s.color}>{s.label}</Tag> : '-'; } },
    { title: '手动调整', dataIndex: 'manualAdjustment', width: 100, render: (_: any, r: any) => r.manualAdjustment ? <Tag color={r.manualAdjustment > 0 ? 'green' : 'red'}>{r.manualAdjustment > 0 ? '+' : ''}¥{r.manualAdjustment}</Tag> : '-' },
    { title: '操作', key: 'action', width: 80, fixed: 'right' as const, search: false, render: (_: any, r: any) => access.canManageSalaryBatch && status === 2 ? <a onClick={() => { setAdjustDetailId(r.id!); setAdjustOpen(true); }}>调整</a> : <span style={{ color: '#ccc' }}>-</span> },
  ];

  return (
    <PageContainer title="批次详情" extra={<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/salary/batches')}>返回列表</Button>} loading={loading}>
      {batch && (
        <>
          {/* ====== Hero 信息横幅 ====== */}
          <div style={heroGradient}>
            <Row align="middle" justify="space-between" wrap>
              <Col>
                <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 1 }}>批次号</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{batch.batchNo}</div>
                <Tag color={BATCH_STATUS_MAP[status]?.color} style={{ marginTop: 8, fontSize: 13, padding: '2px 12px', border: 'none' }}>
                  {BATCH_STATUS_MAP[status]?.label}
                </Tag>
              </Col>
              <Col>
                <Row gutter={24}>
                  <Col><div style={statBox}><div style={{ fontSize: 12, opacity: 0.7 }}>薪资月份</div><div style={{ fontSize: 20, fontWeight: 700 }}>{batch.salaryMonth}</div></div></Col>
                  <Col><div style={statBox}><div style={{ fontSize: 12, opacity: 0.7 }}>参与人数</div><div style={{ fontSize: 20, fontWeight: 700 }}>{batch.totalEmployees ?? 0}<span style={{ fontSize: 14 }}> 人</span></div></div></Col>
                  <Col><div style={statBox}><div style={{ fontSize: 12, opacity: 0.7 }}>应发总额</div><div style={{ fontSize: 20, fontWeight: 700 }}>¥{(batch.totalGrossPay ?? 0).toLocaleString()}</div></div></Col>
                  <Col><div style={statBox}><div style={{ fontSize: 12, opacity: 0.7 }}>实发总额</div><div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>¥{(batch.totalNetPay ?? 0).toLocaleString()}</div></div></Col>
                  <Col><div style={statBox}><div style={{ fontSize: 12, opacity: 0.7 }}>个税合计</div><div style={{ fontSize: 20, fontWeight: 700, color: '#ff7a7a' }}>¥{(batch.totalTax ?? 0).toLocaleString()}</div></div></Col>
                </Row>
              </Col>
            </Row>
          </div>

          {/* ====== 步骤条 ====== */}
          <Card style={{ marginBottom: 24, borderRadius: 10 }}>
            <Steps
              current={stepCurrent}
              status={isRejected ? 'error' : status >= 5 ? 'finish' : isCalculating ? 'process' : 'process'}
              items={stepItems.map((item, idx) => ({
                ...item,
                status: isRejected && idx === 2 ? ('error' as const) : isRejected && idx < 2 ? ('finish' as const) : undefined,
              }))}
            />
            {isRejected && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Tag color="error" icon={<CloseCircleOutlined />} style={{ fontSize: 13, padding: '4px 14px' }}>审批已驳回，需重新调整后再次提交</Tag>
              </div>
            )}
            {isCalculating && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontSize: 13, padding: '4px 14px' }}>正在计算中，请稍候…</Tag>
              </div>
            )}
          </Card>

          {/* ====== 操作按钮 ====== */}
          <Card style={{ marginBottom: 24, borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {status === 0 && access.canManageSalaryBatch && (
                <Tooltip title="根据薪资项目、考勤数据自动计算所有员工当月薪资">
                  <Button type="primary" size="large" icon={<CalculatorOutlined />} loading={actionLoading === 'calculate'} disabled={actionLoading !== null}
                    onClick={() => handleAction('calculate')} style={{ minWidth: 150, borderRadius: 8 }}>
                    {actionLoading === 'calculate' ? '计算中…' : '执行计算'}
                  </Button>
                </Tooltip>
              )}
              {status === 2 && access.canManageSalaryBatch && (
                <Tooltip title="确认计算结果无误后，提交至财务审批">
                  <Button type="primary" size="large" icon={<SendOutlined />} loading={actionLoading === 'submit'} disabled={actionLoading !== null}
                    onClick={() => handleAction('submit')} style={{ minWidth: 150, borderRadius: 8 }}>
                    {actionLoading === 'submit' ? '提交中…' : '提交审批'}
                  </Button>
                </Tooltip>
              )}
              {status === 3 && access.canApproveSalary && (
                <>
                  <Popconfirm title="确认审批通过？" description="审批通过后，薪资批次将进入待发放状态" onConfirm={() => handleAction('approve')} okText="确认通过" cancelText="再想想">
                    <Button type="primary" size="large" icon={<CheckCircleOutlined />} loading={actionLoading === 'approve'} disabled={actionLoading !== null}
                      style={{ minWidth: 150, borderRadius: 8 }}>{actionLoading === 'approve' ? '处理中…' : '审批通过'}</Button>
                  </Popconfirm>
                  <Button danger size="large" icon={<CloseCircleOutlined />} disabled={actionLoading !== null}
                    onClick={() => setRejectOpen(true)} style={{ minWidth: 100, borderRadius: 8 }}>驳回</Button>
                </>
              )}
              {status === 4 && access.canApproveSalary && (
                <Popconfirm title="确认已发放？" description="标记发放后不可撤回" onConfirm={() => handleAction('paid')} okText="确认发放" cancelText="再想想">
                  <Button type="primary" size="large" icon={<DollarOutlined />} loading={actionLoading === 'paid'} disabled={actionLoading !== null}
                    style={{ minWidth: 170, borderRadius: 8, background: '#52c41a', borderColor: '#52c41a' }}>
                    {actionLoading === 'paid' ? '处理中…' : '标记已发放'}
                  </Button>
                </Popconfirm>
              )}
              {status === 1 && <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontSize: 14, padding: '6px 18px', borderRadius: 8 }}>正在计算中，请稍候刷新…</Tag>}
              {status === 5 && <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '6px 18px', borderRadius: 8 }}>薪资已发放完成 ✓</Tag>}
            </div>
          </Card>

          {/* ====== 明细表 ====== */}
          <ProTable<API.SalaryDetailVO>
            headerTitle="员工薪资明细"
            actionRef={actionRef}
            rowKey="id"
            search={false}
            columns={detailColumns}
            request={async (params) => {
              const res = await listDetailsUsingGet(bId, { current: params.current, pageSize: params.pageSize });
              return { data: (res.data as any)?.records ?? [], success: true, total: (res.data as any)?.total ?? 0 };
            }}
            options={{ reload: true, density: true, fullScreen: true }}
            scroll={{ x: 1200 }}
            rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''}
          />

          <AdjustModal open={adjustOpen} onOk={async (values) => { if (adjustDetailId) { await adjustDetailUsingPut(adjustDetailId, values); message.success('调整成功'); setAdjustOpen(false); setAdjustDetailId(null); actionRef.current?.reload(); } }} onCancel={() => { setAdjustOpen(false); setAdjustDetailId(null); }} />

          <Modal title="驳回原因" open={rejectOpen} onOk={() => handleAction('reject')} onCancel={() => { setRejectOpen(false); setRejectReason(''); }}
            okText="确认驳回" okButtonProps={{ danger: true, loading: actionLoading === 'reject' }}>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>请输入驳回原因：</label>
              <textarea style={{ width: '100%', minHeight: 80, padding: '10px 14px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14, resize: 'vertical' }}
                onChange={(e) => setRejectReason(e.target.value)} placeholder="例如：薪资数据异常，请重新核算" autoFocus />
            </div>
          </Modal>
        </>
      )}
    </PageContainer>
  );
};

export default BatchDetailPage;
