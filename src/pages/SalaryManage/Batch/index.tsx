import {
  approveBatchUsingPost,
  calculateBatchUsingPost,
  createBatchUsingPost,
  getBatchDetailUsingGet,
  listBatchesUsingGet,
  markPaidUsingPost,
  rejectBatchUsingPost,
  submitForApprovalUsingPost,
} from '@/api/salaryManageController';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useRef, useState } from 'react';
import BatchAdjustModal from './components/BatchAdjustModal';
import BatchPreviewDrawer from './components/BatchPreviewDrawer';

/** 批次状态映射 */
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  CALCULATING: { label: '计算中', color: 'processing' },
  PENDING_CONFIRM: { label: '待确认', color: 'warning' },
  APPROVING: { label: '审批中', color: 'orange' },
  APPROVED: { label: '已通过', color: 'cyan' },
  PAID: { label: '已发放', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
};

const { confirm } = Modal;

const BatchPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 创建批次
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMonth, setCreateMonth] = useState<string | null>(null);

  // 批次详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<API.SalaryBatchVO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 预览/异常
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'anomalies'>('preview');
  const [previewBatchId, setPreviewBatchId] = useState<number | null>(null);

  // 手动调整
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustBatchId, setAdjustBatchId] = useState<number>(0);

  // 审批驳回原因
  const [rejectReason, setRejectReason] = useState('');

  const refresh = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  /** 查看批次详情 */
  const handleViewDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getBatchDetailUsingGet({ id });
      setDetailData((res as any)?.data ?? null);
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  /** 执行计算 */
  const handleCalculate = async (id: number) => {
    try {
      await calculateBatchUsingPost({ id });
      message.success('计算完成');
      refresh();
    } catch (e: any) {
      message.error(e.message ?? '计算失败');
    }
  };

  /** 提交审批 */
  const handleSubmit = (id: number) => {
    confirm({
      title: '确认提交审批？',
      icon: <ExclamationCircleOutlined />,
      content: '提交后将不能再手动调整。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await submitForApprovalUsingPost({ id });
          message.success('已提交审批');
          refresh();
        } catch (e: any) {
          message.error(e.message ?? '提交失败');
        }
      },
    });
  };

  /** 审批通过 */
  const handleApprove = async (id: number) => {
    try {
      await approveBatchUsingPost({ id });
      message.success('审批通过');
      refresh();
    } catch (e: any) {
      message.error(e.message ?? '审批失败');
    }
  };

  /** 驳回 */
  const handleReject = (id: number) => {
    confirm({
      title: '确认驳回？',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>请输入驳回原因：</div>
          <Input.TextArea
            rows={3}
            placeholder="请输入驳回原因"
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      ),
      okText: '确定驳回',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await rejectBatchUsingPost(
            { id },
            { reason: rejectReason || '无' },
          );
          message.success('已驳回');
          setRejectReason('');
          refresh();
        } catch (e: any) {
          message.error(e.message ?? '驳回失败');
        }
      },
    });
  };

  /** 标记已发放 */
  const handleMarkPaid = (id: number) => {
    confirm({
      title: '确认标记已发放？',
      icon: <ExclamationCircleOutlined />,
      content: '确认后工资条将对员工可见。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await markPaidUsingPost({ id });
          message.success('已标记发放');
          refresh();
        } catch (e: any) {
          message.error(e.message ?? '操作失败');
        }
      },
    });
  };

  const columns: ProColumns<API.SalaryBatchVO>[] = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      width: 140,
    },
    {
      title: '核算月份',
      dataIndex: 'salaryMonth',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => {
        const s = STATUS_MAP[r.status ?? ''] ?? {
          label: r.statusText ?? r.status ?? '-',
          color: 'default',
        };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '核算人数',
      dataIndex: 'totalEmployeeCount',
      width: 80,
      align: 'right',
    },
    {
      title: '应发合计',
      dataIndex: 'totalGross',
      width: 110,
      render: (v) =>
        v != null ? `¥${(v as number).toLocaleString()}` : '-',
    },
    {
      title: '扣除合计',
      dataIndex: 'totalDeduction',
      width: 110,
      render: (v) =>
        v != null ? `¥${(v as number).toLocaleString()}` : '-',
    },
    {
      title: '实发合计',
      dataIndex: 'totalNet',
      width: 110,
      render: (v) =>
        v != null ? (
          <span style={{ fontWeight: 600, color: '#1677ff' }}>
            ¥{(v as number).toLocaleString()}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      width: 300,
      render: (_, record) => {
        const status = record.status ?? '';
        const actions: React.ReactNode[] = [];

        // 查看详情 / 预览
        if (
          [
            'PENDING_CONFIRM',
            'APPROVING',
            'APPROVED',
            'PAID',
          ].includes(status)
        ) {
          actions.push(
            <Button
              key="preview"
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setPreviewMode('preview');
                setPreviewBatchId(record.id!);
                setPreviewOpen(true);
              }}
            >
              预览
            </Button>,
          );
        } else {
          actions.push(
            <Button
              key="detail"
              type="link"
              size="small"
              onClick={() => handleViewDetail(record.id!)}
            >
              详情
            </Button>,
          );
        }

        // 草稿 → 计算
        if (status === 'DRAFT') {
          actions.push(
            <Popconfirm
              key="calc"
              title="确认执行计算？"
              onConfirm={() => handleCalculate(record.id!)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
              >
                计算
              </Button>
            </Popconfirm>,
          );
        }

        // 待确认 → 异常项 + 调整 + 提交
        if (status === 'PENDING_CONFIRM') {
          actions.push(
            <Button
              key="anomaly"
              type="link"
              size="small"
              icon={<WarningOutlined />}
              onClick={() => {
                setPreviewMode('anomalies');
                setPreviewBatchId(record.id!);
                setPreviewOpen(true);
              }}
            >
              异常
            </Button>,
            <Button
              key="adjust"
              type="link"
              size="small"
              onClick={() => {
                setAdjustBatchId(record.id!);
                setAdjustOpen(true);
              }}
            >
              调整
            </Button>,
            <Button
              key="submit"
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSubmit(record.id!)}
            >
              提交
            </Button>,
          );
        }

        // 审批中 → 通过 / 驳回
        if (status === 'APPROVING') {
          actions.push(
            <Button
              key="approve"
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleApprove(record.id!)}
            >
              通过
            </Button>,
            <Button
              key="reject"
              type="link"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record.id!)}
            >
              驳回
            </Button>,
          );
        }

        // 已通过 → 标记发放
        if (status === 'APPROVED') {
          actions.push(
            <Button
              key="paid"
              type="link"
              size="small"
              icon={<DollarOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleMarkPaid(record.id!)}
            >
              标记发放
            </Button>,
          );
        }

        return <Space size={0}>{actions}</Space>;
      },
    },
  ];

  return (
    <div>
      <ProTable<API.SalaryBatchVO>
        headerTitle="月度薪资核算"
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        request={async () => {
          try {
            const res = await listBatchesUsingGet();
            return {
              data: (res as any)?.data ?? [],
              success: true,
              total: (res as any)?.data?.length ?? 0,
            };
          } catch {
            return { data: [], success: false };
          }
        }}
        toolbar={{
          actions: [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              新建核算批次
            </Button>,
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={refresh}
            >
              刷新
            </Button>,
          ],
        }}
      />

      {/* 创建批次 Modal */}
      <Modal
        title="新建核算批次"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          setCreateMonth(null);
        }}
        onOk={async () => {
          if (!createMonth) {
            message.warning('请选择核算月份');
            return;
          }
          setCreateLoading(true);
          try {
            await createBatchUsingPost({ salaryMonth: createMonth });
            message.success('创建批次成功');
            setCreateOpen(false);
            setCreateMonth(null);
            refresh();
          } catch (e: any) {
            message.error(e.message ?? '创建失败');
          } finally {
            setCreateLoading(false);
          }
        }}
        confirmLoading={createLoading}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 8 }}>选择核算月份：</div>
          <DatePicker
            picker="month"
            style={{ width: '100%' }}
            placeholder="请选择月份"
            format="YYYY-MM"
            value={createMonth ? dayjs(createMonth) : null}
            onChange={(_, dateStr) => setCreateMonth(dateStr as string)}
          />
        </div>
      </Modal>

      {/* 批次详情抽屉 */}
      <Drawer
        title="批次详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={480}
      >
        <Spin spinning={detailLoading}>
          {detailData && (
            <>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="批次号">
                  {detailData.batchNo}
                </Descriptions.Item>
                <Descriptions.Item label="核算月份">
                  {detailData.salaryMonth}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag
                    color={
                      STATUS_MAP[detailData.status ?? '']?.color ?? 'default'
                    }
                  >
                    {STATUS_MAP[detailData.status ?? '']?.label ??
                      detailData.statusText ??
                      '-'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {detailData.createdAt ?? '-'}
                </Descriptions.Item>
              </Descriptions>

              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <Statistic
                  title="核算人数"
                  value={detailData.totalEmployeeCount ?? 0}
                />
                <Statistic
                  title="应发合计"
                  value={detailData.totalGross ?? 0}
                  precision={2}
                  prefix="¥"
                />
                <Statistic
                  title="扣除合计"
                  value={detailData.totalDeduction ?? 0}
                  precision={2}
                  prefix="¥"
                />
                <Statistic
                  title="实发合计"
                  value={detailData.totalNet ?? 0}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#1677ff' }}
                />
              </div>
            </>
          )}
        </Spin>
      </Drawer>

      {/* 预览/异常抽屉 */}
      <BatchPreviewDrawer
        open={previewOpen}
        batchId={previewBatchId}
        mode={previewMode}
        onClose={() => setPreviewOpen(false)}
      />

      {/* 手动调整弹窗 */}
      <BatchAdjustModal
        open={adjustOpen}
        batchId={adjustBatchId}
        onClose={() => setAdjustOpen(false)}
        onSuccess={() => {
          setAdjustOpen(false);
          refresh();
        }}
      />
    </div>
  );
};

export default BatchPage;
