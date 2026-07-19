import {
  getCompositionUsingGet,
  getDepartmentDistributionUsingGet,
  getMonthlyTrendUsingGet,
  getVariationDistributionUsingGet,
} from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Empty, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
];

const StatCard: React.FC<{
  title: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}> = ({ title, loading, empty, children }) => (
  <Card title={title}>
    {loading ? (
      <Spin style={{ display: 'block', textAlign: 'center', padding: 60 }} />
    ) : empty ? (
      <Empty description="暂无数据" />
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    )}
  </Card>
);

const SalaryStatistics: React.FC = () => {
  const [trend, setTrend] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [composition, setComposition] = useState<any[]>([]);
  const [variation, setVariation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [t, d, c, v] = await Promise.all([
        getMonthlyTrendUsingGet(),
        getDepartmentDistributionUsingGet(),
        getCompositionUsingGet(),
        getVariationDistributionUsingGet(),
      ]);
      setTrend((t.data as any) ?? []);
      setDepartment((d.data as any) ?? []);
      setComposition((c.data as any) ?? []);
      setVariation((v.data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <PageContainer title="薪资统计">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <StatCard
            title="📈 薪资成本月度趋势"
            loading={loading}
            empty={trend.length === 0}
          >
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="grossPay"
                name="应发总额"
                stroke="#1890ff"
              />
              <Line
                type="monotone"
                dataKey="netPay"
                name="实发总额"
                stroke="#52c41a"
              />
            </LineChart>
          </StatCard>
        </Col>
        <Col span={12}>
          <StatCard
            title="🏢 部门薪资分布"
            loading={loading}
            empty={department.length === 0}
          >
            <BarChart data={department}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="grossPay" name="应发" fill="#1890ff" />
              <Bar dataKey="netPay" name="实发" fill="#52c41a" />
            </BarChart>
          </StatCard>
        </Col>
        <Col span={12}>
          <StatCard
            title="🥧 薪资构成占比"
            loading={loading}
            empty={composition.length === 0}
          >
            <PieChart>
              <Pie
                data={composition}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {composition.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </StatCard>
        </Col>
        <Col span={12}>
          <StatCard
            title="📊 薪资变动分布"
            loading={loading}
            empty={variation.length === 0}
          >
            <BarChart data={variation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="人数" fill="#722ed1" />
            </BarChart>
          </StatCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default SalaryStatistics;
