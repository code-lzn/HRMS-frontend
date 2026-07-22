import {
  getAnomaliesUsingGet,
  previewBatchUsingGet,
} from '@/api/salaryManageController';
import { Card, Drawer, Empty, message, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

interface BatchPreviewDrawerProps {
  open: boolean;
  batchId: number | null;
  mode: 'preview' | 'anomalies';
  onClose: () => void;
}

const BatchPreviewDrawer: React.FC<BatchPreviewDrawerProps> = ({
  open,
  batchId,
  mode,
  onClose,
}) => {
  const [records, setRecords] = useState<API.SalaryDetailVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });

  useEffect(() => {
    if (!open || !batchId) return;
    setLoading(true);
    setPagination({ current: 1, pageSize: 50, total: 0 });
    (async () => {
      try {
        if (mode === 'preview') {
          const res = await previewBatchUsingGet({
            id: batchId,
            current: 1,
            size: 500,
          });
          const raw: any = res;
          const data = raw?.data ?? raw;
          let list: any[] = [];
          if (Array.isArray(data)) list = data;
          else if (data && Array.isArray(data.records)) list = data.records;
          setRecords(list);
          setPagination((prev) => ({
            ...prev,
            total: data?.total ?? list.length,
          }));
        } else {
          const res = await getAnomaliesUsingGet({ id: batchId });
          const data = (res as any)?.data ?? [];
          setRecords(data);
          setPagination((prev) => ({ ...prev, total: data.length }));
        }
      } catch (e) { console.error('pages/SalaryManage/Batch/components/BatchPreviewDrawer.tsx', e); message.error('加载数据失败'); } finally {
        setLoading(false);
      }
    })();
  }, [open, batchId, mode]);

  /** 行样式：预警/异常高亮 */
  const getRowClassName = (record: API.SalaryDetailVO) => {
    if (record.hasAnomaly === 2) return 'row-anomaly-block';
    if (record.hasAnomaly === 1) return 'row-anomaly-warn';
    return '';
  };

  const columns: ColumnsType<API.SalaryDetailVO> = [
    { title: '工号', dataIndex: 'employeeNo', width: 100, fixed: 'left' as const },
    { title: '姓名', dataIndex: 'employeeName', width: 80, fixed: 'left' as const },
    {
      title: '部门',
      dataIndex: 'departmentName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '基本工资',
      dataIndex: 'baseSalary',
      width: 90,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '岗位津贴',
      dataIndex: 'allowance',
      width: 90,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '绩效奖金',
      dataIndex: 'performanceBonus',
      width: 90,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '加班费',
      dataIndex: 'overtimePay',
      width: 80,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '应发小计',
      dataIndex: 'grossSalary',
      width: 100,
      align: 'right',
      render: (v) => (
        <span style={{ fontWeight: 500, color: '#1677ff' }}>
          {v != null ? `¥${v.toFixed(0)}` : '-'}
        </span>
      ),
    },
    {
      title: '迟到扣款',
      dataIndex: 'lateDeduction',
      width: 80,
      align: 'right',
      render: (v) =>
        v != null && v > 0 ? (
          <span style={{ color: '#ff4d4f' }}>-¥{v.toFixed(0)}</span>
        ) : (
          '-'
        ),
    },
    {
      title: '请假扣款',
      dataIndex: 'leaveDeduction',
      width: 80,
      align: 'right',
      render: (v) =>
        v != null && v > 0 ? (
          <span style={{ color: '#ff4d4f' }}>-¥{v.toFixed(0)}</span>
        ) : (
          '-'
        ),
    },
    {
      title: '养老',
      dataIndex: 'socialPension',
      width: 70,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '医疗',
      dataIndex: 'socialMedical',
      width: 70,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '失业',
      dataIndex: 'socialUnemployment',
      width: 70,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '公积金',
      dataIndex: 'housingFund',
      width: 80,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '个税',
      dataIndex: 'incomeTax',
      width: 70,
      align: 'right',
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '应扣合计',
      dataIndex: 'totalDeduction',
      width: 90,
      align: 'right',
      render: (v) => (
        <span style={{ fontWeight: 500, color: '#ff4d4f' }}>
          {v != null ? `¥${v.toFixed(0)}` : '-'}
        </span>
      ),
    },
    {
      title: '实发工资',
      dataIndex: 'netSalary',
      width: 100,
      align: 'right',
      fixed: 'right' as const,
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff', fontSize: 14 }}>
          {v != null ? `¥${v.toFixed(0)}` : '-'}
        </span>
      ),
    },
    {
      title: '手动调整',
      dataIndex: 'manualAdjust',
      width: 90,
      align: 'right',
      render: (v, r) => {
        if (v == null || v === 0) return '-';
        return (
          <div>
            <Tag color={v > 0 ? 'blue' : 'orange'}>
              {v > 0 ? '+' : ''}
              {v.toFixed(0)}
            </Tag>
            {r.adjustReason && (
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                {r.adjustReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '异常状态',
      dataIndex: 'hasAnomaly',
      width: 100,
      fixed: 'right' as const,
      render: (v, r) => {
        if (v === 2)
          return (
            <div>
              <Tag color="error">🔴 阻断</Tag>
              {r.anomalyReason && (
                <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 2, maxWidth: 160 }}>
                  {r.anomalyReason}
                </div>
              )}
            </div>
          );
        if (v === 1)
          return (
            <div>
              <Tag color="warning">⚠️ 预警</Tag>
              {r.anomalyReason && (
                <div style={{ fontSize: 11, color: '#faad14', marginTop: 2, maxWidth: 160 }}>
                  {r.anomalyReason}
                </div>
              )}
            </div>
          );
        return <Tag color="success">正常</Tag>;
      },
    },
  ];

  return (
    <Drawer
      title={mode === 'preview' ? '核算预览' : '异常项列表'}
      open={open}
      onClose={onClose}
      width={window.innerWidth * 0.92}
      styles={{ body: { padding: '12px 24px' } }}
    >
      <style>
        {`
          .row-anomaly-warn { background-color: #fffbe6 !important; }
          .row-anomaly-warn:hover > td { background-color: #fff7cc !important; }
          .row-anomaly-block { background-color: #fff1f0 !important; }
          .row-anomaly-block:hover > td { background-color: #ffe7e5 !important; }
        `}
      </style>
      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Empty
            description={mode === 'anomalies' ? '暂无异常项 🎉' : '暂无数据'}
            style={{ paddingTop: 80 }}
          />
        ) : (
          <Table<API.SalaryDetailVO>
            columns={columns}
            dataSource={records}
            rowKey="id"
            size="small"
            rowClassName={getRowClassName}
            scroll={{ x: 1800 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['20', '50', '100', '200'],
              onChange: async (page, size) => {
                // 仅预览模式支持分页请求（异常项一次取完）
                if (mode !== 'preview') return;
                setLoading(true);
                try {
                  const res = await previewBatchUsingGet({
                    id: batchId!,
                    current: page,
                    size,
                  });
                  const data = (res as any)?.data;
                  setRecords(data?.records ?? []);
                  setPagination({ current: page, pageSize: size, total: data?.total ?? 0 });
                } catch (e) { console.error('pages/SalaryManage/Batch/components/BatchPreviewDrawer.tsx', e); } finally {
                  setLoading(false);
                }
              },
            }}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default BatchPreviewDrawer;
