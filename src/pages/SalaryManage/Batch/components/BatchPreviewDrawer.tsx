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

  useEffect(() => {
    if (!open || !batchId) return;
    setLoading(true);
    (async () => {
      try {
        let data: API.SalaryDetailVO[] = [];
        if (mode === 'preview') {
          const res = await previewBatchUsingGet({
            id: batchId,
            current: 1,
            size: 500,
          });
          data = (res as any)?.data?.records ?? [];
        } else {
          const res = await getAnomaliesUsingGet({ id: batchId });
          data = (res as any)?.data ?? [];
        }
        setRecords(data);
      } catch {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, batchId, mode]);

  const columns: ColumnsType<API.SalaryDetailVO> = [
    { title: '工号', dataIndex: 'employeeNo', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', width: 80 },
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
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '绩效',
      dataIndex: 'performanceBonus',
      width: 80,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '加班费',
      dataIndex: 'overtimePay',
      width: 80,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '迟到扣款',
      dataIndex: 'lateDeduction',
      width: 80,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '社保',
      dataIndex: 'socialPension',
      width: 80,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '公积金',
      dataIndex: 'housingFund',
      width: 80,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '个税',
      dataIndex: 'incomeTax',
      width: 70,
      render: (v) => (v != null ? `¥${v.toFixed(0)}` : '-'),
    },
    {
      title: '应发',
      dataIndex: 'grossSalary',
      width: 90,
      render: (v) => (
        <span style={{ fontWeight: 500 }}>
          {v != null ? `¥${v.toFixed(0)}` : '-'}
        </span>
      ),
    },
    {
      title: '实发',
      dataIndex: 'netSalary',
      width: 90,
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>
          {v != null ? `¥${v.toFixed(0)}` : '-'}
        </span>
      ),
    },
    {
      title: '异常',
      dataIndex: 'hasAnomaly',
      width: 80,
      render: (v, r) => {
        if (v === 2)
          return <Tag color="red">红色预警</Tag>;
        if (v === 1)
          return <Tag color="gold">黄色预警</Tag>;
        return <Tag color="green">正常</Tag>;
      },
    },
    {
      title: '手动调整',
      dataIndex: 'manualAdjust',
      width: 80,
      render: (v) =>
        v != null && v !== 0 ? (
          <Tag color={v > 0 ? 'blue' : 'orange'}>
            {v > 0 ? '+' : ''}
            {v.toFixed(0)}
          </Tag>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Drawer
      title={mode === 'preview' ? '核算预览' : '异常项'}
      open={open}
      onClose={onClose}
      width={window.innerWidth * 0.9}
    >
      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Empty description={mode === 'anomalies' ? '暂无异常项' : '暂无数据'} />
        ) : (
          <Table<API.SalaryDetailVO>
            columns={columns}
            dataSource={records}
            rowKey="id"
            size="small"
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 50, showSizeChanger: true }}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default BatchPreviewDrawer;
