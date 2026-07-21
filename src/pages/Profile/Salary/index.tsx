import { useEffect, useState, useRef } from 'react';
import { Card, Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import { Line } from '@antv/g2plot';
import type { SalaryTrendVO } from '@/services/profile/typings';
import { getSalaryTrend } from '@/services/profile';
import { getMyPayslipsUsingGet } from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';

const payslipColumns: ColumnsType<any> = [
  { title: '薪资月份', dataIndex: 'salaryMonth', width: 100 },
  { title: '应发工资', dataIndex: 'grossPay', width: 110, render: (v: number) => v != null ? `¥${v.toLocaleString()}` : '-' },
  { title: '扣除合计', dataIndex: 'totalDeductions', width: 110, render: (v: number) => v != null ? `¥${v.toLocaleString()}` : '-' },
  { title: '实发工资', dataIndex: 'netPay', width: 130, render: (v: number) => v != null ? <strong>¥{v.toLocaleString()}</strong> : '-' },
  { title: '状态', dataIndex: 'payslipViewed', width: 80, render: (v: number) => v === 2 ? <Tag color="blue">已查看</Tag> : <Tag>未查看</Tag> },
];

export default function SalaryPage() {
  const [list, setList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [trend, setTrend] = useState<SalaryTrendVO | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setListLoading(true);
    getMyPayslipsUsingGet()
      .then((res) => setList((res as any)?.data || []))
      .catch(() => {})
      .finally(() => setListLoading(false));
    getSalaryTrend().then((d) => { setTrend(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!trend || !chartRef.current) return;
    const chart = new Line(chartRef.current, {
      data: trend.months.map((m, i) => ({ month: m, salary: trend.netSalaries[i] })),
      xField: 'month',
      yField: 'salary',
      smooth: true,
      point: { size: 4, shape: 'circle', style: { fill: '#3b82f6', stroke: '#fff', lineWidth: 2 } },
      tooltip: { formatter: (d: any) => ({ name: '实发工资', value: `¥${d.salary.toLocaleString()}` }) },
      yAxis: { label: { formatter: (v: string) => `¥${(Number(v) / 1000).toFixed(0)}k` }, grid: { line: { style: { stroke: '#f3f4f6' } } } },
      xAxis: { line: null, tickLine: null },
      color: '#3b82f6',
      area: { style: { fill: 'l(270) 0:#eff6ff 1:#dbeafe' } },
      lineStyle: { lineWidth: 2 },
      padding: [20, 40, 40, 40],
    });
    chart.render();
    return () => { chart.destroy(); };
  }, [trend]);

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>我的薪资</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>查看薪资记录与趋势分析</div>
          </div>
        ),
      }}
    >
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
        title={<div style={{ fontSize: 16, fontWeight: 600 }}>近6个月实发工资趋势</div>}
      >
        <div ref={chartRef} style={{ height: 280 }} />
      </Card>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        title={<div style={{ fontSize: 16, fontWeight: 600 }}>工资条</div>}
      >
        <Table
          rowKey="id"
          loading={listLoading}
          dataSource={list}
          pagination={false}
          columns={[
            ...payslipColumns,
            {
              title: '操作', key: 'action', width: 80,
              render: (_: any, r: any) => (
                <Button type="link" size="small" icon={<EyeOutlined />}
                  onClick={() => history.push(`/salary/payslips/${r.id}`)}
                >
                  查看
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
