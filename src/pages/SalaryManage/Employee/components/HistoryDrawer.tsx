import { getEmployeeSalaryHistoryUsingGet } from '@/api/salaryManageController';
import { Drawer, Empty, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

const CHANGE_TYPE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '调薪', color: 'blue' },
  2: { label: '账套变更', color: 'green' },
  3: { label: '基数调整', color: 'orange' },
  4: { label: '转正调薪', color: 'purple' },
  5: { label: '调岗调薪', color: 'red' },
};

interface HistoryDrawerProps {
  open: boolean;
  employeeId: number | null;
  employeeName: string;
  onClose: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  open,
  employeeId,
  employeeName,
  onClose,
}) => {
  const [data, setData] = useState<API.SalaryChangeLogVO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !employeeId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await getEmployeeSalaryHistoryUsingGet({ employeeId });
        setData((res as any)?.data ?? []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, employeeId]);

  const columns: ColumnsType<API.SalaryChangeLogVO> = [
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 100,
      render: (t: number) => {
        const info = CHANGE_TYPE_MAP[t];
        return <Tag color={info?.color}>{info?.label ?? '-'}</Tag>;
      },
    },
    {
      title: '变更前值',
      dataIndex: 'oldValue',
      width: 160,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '变更后值',
      dataIndex: 'newValue',
      width: 160,
      ellipsis: true,
      render: (v) => v || '-',
    },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 110 },
    { title: '操作人', dataIndex: 'operatorName', width: 100 },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true },
    { title: '时间', dataIndex: 'createTime', width: 160 },
  ];

  return (
    <Drawer
      title={`${employeeName} - 调薪历史`}
      open={open}
      onClose={onClose}
      width={800}
    >
      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="暂无调薪记录" />
        ) : (
          <Table<API.SalaryChangeLogVO>
            columns={columns}
            dataSource={data}
            rowKey="id"
            size="small"
            pagination={false}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default HistoryDrawer;
