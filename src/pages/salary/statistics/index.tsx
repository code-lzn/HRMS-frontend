import { getAvailableMonthsUsingGet, getCompositionUsingGet, getDepartmentDistributionUsingGet, getMonthlyTrendUsingGet, getVariationDistributionUsingGet } from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Empty, Row, Select, Space, Spin, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, TeamOutlined, DollarOutlined, PieChartOutlined, BarChartOutlined, LineChartOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911'];
const fmtMoney = (v: number | string) => { const n = typeof v === 'string' ? parseFloat(v) : v; if (isNaN(n)) return '¥0'; if (n >= 10000) return `¥${(n / 10000).toFixed(1)}万`; return `¥${n.toLocaleString()}`; };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '10px 14px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 12, color: p.color }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.color, marginRight: 6 }} />
          {p.name}：{fmtMoney(p.value)}
        </div>
      ))}
    </div>
  );
};

const ChartCard: React.FC<{ title: React.ReactNode; loading: boolean; empty: boolean; h?: number; children: React.ReactNode }> = ({ title, loading, empty, h = 300, children }) => (
  <Card title={title} style={{ height: '100%', borderRadius: 10 }} styles={{ body: { padding: '16px 8px 4px' } }}>
    {loading ? <Spin style={{ display: 'block', textAlign: 'center', padding: h / 2 - 20 }} /> : empty ? <Empty description="暂无数据" style={{ padding: h / 2 - 60 }} /> : <ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>}
  </Card>
);

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderRadius: 12, padding: '20px 28px', marginBottom: 24, color: '#fff',
};
const statBox: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 18px', textAlign: 'center', minWidth: 100,
};
const kpiCard = (accent: string): React.CSSProperties => ({
  borderRadius: 10, borderTop: `3px solid ${accent}`, transition: 'all 0.25s',
});

const SalaryStatistics: React.FC = () => {
  const [trend, setTrend] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [composition, setComposition] = useState<any[]>([]);
  const [variation, setVariation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

  useEffect(() => { (async () => { try { const res = await getAvailableMonthsUsingGet(); const list = (res.data as any) ?? []; setMonths(list); if (list.length > 0) setSelectedMonth(list[0]); } catch {} })(); }, []);

  const fetchData = useCallback(async (month: string | undefined) => {
    setLoading(true); const mp = month ? { salaryMonth: month } : undefined;
    const [t, d, c, v] = await Promise.all([getMonthlyTrendUsingGet(), getDepartmentDistributionUsingGet(mp), getCompositionUsingGet(mp), getVariationDistributionUsingGet(mp)]);
    setTrend((t.data as any) ?? []); setDepartment((d.data as any) ?? []); setComposition((c.data as any) ?? []); setVariation((v.data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(selectedMonth); }, [selectedMonth, fetchData]);

  const kpis = useMemo(() => {
    const cur = trend.length > 0 ? trend[trend.length - 1] : null;
    const prev = trend.length > 1 ? trend[trend.length - 2] : null;
    const gross = cur?.grossPay ?? 0; const net = cur?.netPay ?? 0;
    const deptCount = department.length;
    const empTotal = department.reduce((s: number, d: any) => s + (d.employeeCount ?? 0), 0);
    const grossChange = prev && prev.grossPay > 0 ? ((gross - prev.grossPay) / prev.grossPay) * 100 : 0;
    const avgSalary = empTotal > 0 ? net / empTotal : 0;
    return { gross, net, deptCount, empTotal, grossChange, avgSalary };
  }, [trend, department]);

  return (
    <PageContainer title="薪资统计分析">
      {/* ====== 筛选栏 ====== */}
      <Card style={{ marginBottom: 24, borderRadius: 10 }}>
        <Space size="middle">
          <Typography.Text strong style={{ fontSize: 15 }}>统计月份：</Typography.Text>
          <Select style={{ width: 180 }} value={selectedMonth} onChange={(v) => setSelectedMonth(v)}
            options={months.map((m) => ({ label: m, value: m }))} placeholder="请选择月份" allowClear size="large" />
        </Space>
      </Card>

      {/* ====== Hero KPI ====== */}
      <div style={heroStyle}>
        <div style={{ fontSize: 13, opacity: 0.6, letterSpacing: 1, marginBottom: 12 }}>关键指标汇总</div>
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>本月应发总额</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmtMoney(kpis.gross)}</div>
              {kpis.grossChange !== 0 && (
                <div style={{ fontSize: 12, marginTop: 2, color: kpis.grossChange > 0 ? '#ff7a7a' : '#73d13d' }}>
                  {kpis.grossChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(kpis.grossChange).toFixed(1)}% vs 上月
                </div>
              )}
            </div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>本月实发总额</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmtMoney(kpis.net)}</div></div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>人均实发</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmtMoney(kpis.avgSalary)}</div></div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>涉及部门</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{kpis.deptCount} 个</div></div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>覆盖员工</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{kpis.empTotal} 人</div></div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={statBox}><div style={{ fontSize: 11, opacity: 0.6 }}>趋势月份</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{trend.length} 个月</div></div>
          </Col>
        </Row>
      </div>

      {/* ====== 图表 ====== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard title={<span><LineChartOutlined style={{ marginRight: 6, color: '#1677ff' }} />薪资成本月度趋势</span>} loading={loading} empty={trend.length === 0}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.35} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="nG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#52c41a" stopOpacity={0.35} /><stop offset="95%" stopColor="#52c41a" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmtMoney(v)} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Area type="monotone" dataKey="grossPay" name="应发总额" stroke="#1677ff" fill="url(#gG)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="netPay" name="实发总额" stroke="#52c41a" fill="url(#nG)" strokeWidth={2.5} dot={{ r: 3 }} />
            </AreaChart>
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title={<span><BarChartOutlined style={{ marginRight: 6, color: '#722ed1' }} />部门薪资分布</span>} loading={loading} empty={department.length === 0}>
            <BarChart data={department} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmtMoney(v)} />
              <Tooltip content={<CustomTooltip />} /><Legend />
              <Bar dataKey="grossPay" name="应发" fill="#1677ff" radius={[5, 5, 0, 0]} maxBarSize={38} />
              <Bar dataKey="netPay" name="实发" fill="#52c41a" radius={[5, 5, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title={<span><PieChartOutlined style={{ marginRight: 6, color: '#faad14' }} />薪资构成占比</span>} loading={loading} empty={composition.length === 0}>
            <PieChart>
              <Pie data={composition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} innerRadius={55} paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                {composition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title={<span><BarChartOutlined style={{ marginRight: 6, color: '#13c2c2' }} />薪资变动分布</span>} loading={loading} empty={variation.length === 0}>
            <BarChart data={variation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar dataKey="count" name="员工人数" radius={[5, 5, 0, 0]} maxBarSize={50}>
                {variation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ChartCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default SalaryStatistics;
