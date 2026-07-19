import {
  adjustDetailUsingPut,
  approveUsingPut,
  executeCalculateUsingPost,
  getBatchDetailUsingGet,
  listDetailsUsingGet,
  markAsPaidUsingPut,
  rejectUsingPut,
  submitForApprovalUsingPut,
} from '@/api/salaryController';
import { ABNORMAL_LEVEL_MAP, BATCH_STATUS_MAP } from '@/constants/enums';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history, useAccess, useParams } from '@umijs/max';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AdjustModal from './components/AdjustModal';

const BatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const bId = Number(batchId);
  const access = useAccess();
  const actionRef = useRef<any>();
  const [batch, setBatch] = useState<API.SalaryBatchVO | null>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      switch (action) {
        case 'calculate':
          await executeCalculateUsingPost(bId);
          message.info('计算任务已提交，请稍后刷新查看结果');
          break;
        case 'submit':
          await submitForApprovalUsingPut(bId);
          message.success('已提交审批');
          break;
        case 'approve':
          await approveUsingPut(bId);
          message.success('审批已通过');
          break;
        case 'reject':
          await rejectUsingPut(bId, { reason: rejectReason });
          message.success('已驳回');
          setRejectOpen(false);
          break;
        case 'paid':
          await markAsPaidUsingPut(bId);
          message.success('已标记为发放');
          break;
      }
      await fetchBatch();
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    }
  };

  const handleAdjust = (detailId: number) => {
    setAdjustDetailId(detailId);
    setAdjustOpen(true);
  };

  const handleAdjustOk = async (values: API.SalaryDetailAdjustRequest) => {
    if (adjustDetailId) {
      await adjustDetailUsingPut(adjustDetailId, values);
      message.success('调整成功');
      setAdjustOpen(false);
      actionRef.current?.reload();
    }
  };

  const status = batch?.status ?? 0;

  const detailColumns = [
    { title: '员工ID', dataIndex: 'employeeId', width: 80 },
    {
      title: '应发工资',
      dataIndex: 'grossPay',
      width: 110,
      render: (_: any, r: API.SalaryDetailVO) => `¥${(r.grossPay ?? 0).toLocaleString()}`,
    },
    {
      title: '社保',
      dataIndex: 'socialSecurity',
      width: 90,
      render: (_: any, r: API.SalaryDetailVO) => `¥${(r.socialSecurity ?? 0).toLocaleString()}`,
    },
    {
      title: '公积金',
      dataIndex: 'housingFund',
      width: 90,
      render: (_: any, r: API.SalaryDetailVO) => `¥${(r.housingFund ?? 0).toLocaleString()}`,
    },
    {
      title: '个税',
      dataIndex: 'incomeTax',
      width: 90,
      render: (_: any, r: API.SalaryDetailVO) => `¥${(r.incomeTax ?? 0).toLocaleString()}`,
    },
    {
      title: '实发',
      dataIndex: 'netPay',
      width: 110,
      render: (_: any, r: API.SalaryDetailVO) => (
        <strong>¥{(r.netPay ?? 0).toLocaleString()}</strong>
      ),
    },
    {
      title: '异常',
      dataIndex: 'isAbnormal',
      width: 90,
      render: (_: any, r: API.SalaryDetailVO) => {
        const s = ABNORMAL_LEVEL_MAP[r.isAbnormal!];
        return s ? <Tag color={s.color}>{s.label}</Tag> : '-';
      },
    },
    {
      title: '手动调整',
      dataIndex: 'manualAdjustment',
      width: 100,
      render: (_: any, r: API.SalaryDetailVO) =>
        r.manualAdjustment ? `¥${r.manualAdjustment}` : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      search: false,
      render: (_: any, record: API.SalaryDetailVO) =>
        access.canManageSalaryBatch && status === 3 ? (
          <a onClick={() => handleAdjust(record.id!)}>调整</a>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        ),
    },
  ];

  return (
    <PageContainer
      title="批次详情"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/salary/batches')}>
          返回列表
        </Button>
      }
      loading={loading}
    >
      {batch && (
        <>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <Descriptions column={3} size="small" style={{ flex: 1 }}>
                <Descriptions.Item label="批次号">{batch.batchNo}</Descriptions.Item>
                <Descriptions.Item label="薪资月份">{batch.salaryMonth}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={BATCH_STATUS_MAP[status]?.color}>
                    {BATCH_STATUS_MAP[status]?.label}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              <div style={{ display: 'flex', gap: 32 }}>
                <Statistic title="员工数" value={batch.totalEmployees ?? 0} suffix="人" />
                <Statistic title="应发总额" value={batch.totalGrossPay ?? 0} prefix="¥" precision={2} />
                <Statistic title="实发总额" value={batch.totalNetPay ?? 0} prefix="¥" precision={2} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              {/* Status-based action buttons */}
              {status === 1 && access.canManageSalaryBatch && (
                <Button type="primary" onClick={() => handleAction('calculate')}>
                  执行计算
                </Button>
              )}
              {status === 3 && access.canManageSalaryBatch && (
                <Button type="primary" onClick={() => handleAction('submit')}>
                  提交审批
                </Button>
              )}
              {status === 4 && access.canApproveSalary && (
                <>
                  <Button type="primary" onClick={() => handleAction('approve')}>
                    审批通过
                  </Button>
                  <Button danger onClick={() => setRejectOpen(true)}>
                    驳回
                  </Button>
                </>
              )}
              {status === 5 && access.canApproveSalary && (
                <Button type="primary" onClick={() => handleAction('paid')}>
                  标记已发放
                </Button>
              )}
            </div>
          </Card>

          <ProTable<API.SalaryDetailVO>
            headerTitle="员工薪资明细"
            actionRef={actionRef}
            rowKey="id"
            search={false}
            columns={detailColumns}
            request={async (params) => {
              const res = await listDetailsUsingGet(bId, {
                current: params.current,
                pageSize: params.pageSize,
              });
              return {
                data: (res.data as any)?.records ?? [],
                success: true,
                total: (res.data as any)?.total ?? 0,
              };
            }}
            options={{ reload: true, density: true }}
          />

          <AdjustModal
            open={adjustOpen}
            onOk={handleAdjustOk}
            onCancel={() => setAdjustOpen(false)}
          />

          <Modal
            title="驳回原因"
            open={rejectOpen}
            onOk={() => handleAction('reject')}
            onCancel={() => setRejectOpen(false)}
          >
            <label>请输入驳回原因：</label>
            <textarea
              style={{ width: '100%', marginTop: 8, minHeight: 80, padding: 8 }}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="驳回原因..."
            />
          </Modal>
        </>
      )}
    </PageContainer>
  );
};

export default BatchDetailPage;
