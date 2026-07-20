import { getMyPayslipsUsingGet } from '@/api/salaryController';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const MyPayslips: React.FC = () => {
  const columns: ProColumns<API.PayslipVO>[] = [
    {
      title: '薪资月份',
      dataIndex: 'salaryMonth',
      width: 120,
    },
    {
      title: '应发工资',
      dataIndex: 'grossPay',
      width: 120,
      render: (_, record) => `¥${(record.grossPay ?? 0).toLocaleString()}`,
    },
    {
      title: '扣除合计',
      dataIndex: 'totalDeductions',
      width: 120,
      render: (_, record) => `¥${(record.totalDeductions ?? 0).toLocaleString()}`,
    },
    {
      title: '实发工资',
      dataIndex: 'netPay',
      width: 130,
      render: (_, record) => (
        <strong style={{ fontSize: 15 }}>¥{(record.netPay ?? 0).toLocaleString()}</strong>
      ),
    },
    {
      title: '查看状态',
      dataIndex: 'payslipViewed',
      width: 100,
      render: (_, record) =>
        record.payslipViewed === 2 ? (
          <Tag color="blue">已查看</Tag>
        ) : (
          <Tag color="default">未查看</Tag>
        ),
    },
    {
      title: '发放时间',
      dataIndex: 'createTime',
      width: 160,
      render: (_, record) =>
        record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.PayslipVO>
        headerTitle="我的工资条"
        rowKey="id"
        search={false}
        columns={columns}
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onClick: () => history.push(`/salary/payslips/${record.id}`),
        })}
        request={async () => {
          const res = await getMyPayslipsUsingGet();
          return {
            data: (res.data as any) ?? [],
            success: true,
            total: (res.data as any)?.length ?? 0,
          };
        }}
        pagination={false}
      />
    </PageContainer>
  );
};

export default MyPayslips;
