import { getMyPayslipsUsingGet } from '@/api/salaryController';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, Col, Empty, Row, Spin, Statistic, Tag } from 'antd';
import { DollarOutlined, EyeOutlined, FileTextOutlined, WalletOutlined, CalendarOutlined, RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 50%, #237804 100%)',
  borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
};
const iconCircle = (bg: string): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: '50%', background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
});

const MyPayslips: React.FC = () => {
  const [data, setData] = useState<API.PayslipVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { setLoading(true); try { const res = await getMyPayslipsUsingGet(); setData((res.data as any) ?? []); } catch {} setLoading(false); })();
  }, []);

  const totalNet = data.reduce((s, r) => s + (r.netPay ?? 0), 0);
  const totalGross = data.reduce((s, r) => s + (r.grossPay ?? 0), 0);
  const totalDeductions = data.reduce((s, r) => s + (r.totalDeductions ?? 0), 0);
  const avgNet = data.length > 0 ? totalNet / data.length : 0;

  const columns: ProColumns<API.PayslipVO>[] = [
    { title: '月份', dataIndex: 'salaryMonth', width: 120, render: (_, r) => <span style={{ fontWeight: 500 }}><FileTextOutlined style={{ marginRight: 6, color: '#1677ff' }} />{r.salaryMonth}</span> },
    { title: '应发', dataIndex: 'grossPay', width: 120, render: (_, r) => <span style={{ color: '#faad14', fontWeight: 500 }}>¥{(r.grossPay ?? 0).toLocaleString()}</span> },
    { title: '扣除', dataIndex: 'totalDeductions', width: 120, render: (_, r) => <span style={{ color: '#ff4d4f' }}>-¥{(r.totalDeductions ?? 0).toLocaleString()}</span> },
    { title: '实发', dataIndex: 'netPay', width: 140, render: (_, r) => <strong style={{ fontSize: 16, color: '#52c41a' }}>¥{(r.netPay ?? 0).toLocaleString()}</strong> },
    { title: '状态', dataIndex: 'payslipViewed', width: 90, render: (_, r) => r.payslipViewed === 2 ? <Tag color="success" icon={<EyeOutlined />}>已查看</Tag> : <Tag color="default">未查看</Tag> },
    { title: '发放时间', dataIndex: 'createTime', width: 160, render: (_, r) => r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-' },
  ];

  if (loading) return <PageContainer><Spin style={{ display: 'block', margin: '120px auto' }} size="large" /></PageContainer>;

  return (
    <PageContainer>
      <div style={heroStyle}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>我的工资条</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>查看历史工资明细，核对每月收入与扣除</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800 }}>{data.length}</div><div style={{ fontSize: 12, opacity: 0.75 }}>累计月份</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800 }}>¥{(totalNet / 10000).toFixed(1)}万</div><div style={{ fontSize: 12, opacity: 0.75 }}>累计实发</div></div>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={{ borderRadius: 10, borderTop: '3px solid #1677ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconCircle('rgba(22,119,255,.12)')}><FileTextOutlined style={{ color: '#1677ff' }} /></div>
              <Statistic title="工资条数量" value={data.length} suffix="个月" valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={{ borderRadius: 10, borderTop: '3px solid #faad14' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconCircle('rgba(250,173,20,.12)')}><RiseOutlined style={{ color: '#faad14' }} /></div>
              <Statistic title="累计应发" value={totalGross} prefix="¥" precision={2} valueStyle={{ color: '#faad14', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={{ borderRadius: 10, borderTop: '3px solid #ff4d4f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconCircle('rgba(255,77,79,.12)')}><DollarOutlined style={{ color: '#ff4d4f' }} /></div>
              <Statistic title="累计扣除" value={totalDeductions} prefix="¥" precision={2} valueStyle={{ color: '#ff4d4f', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable style={{ borderRadius: 10, borderTop: '3px solid #52c41a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconCircle('rgba(82,196,26,.12)')}><WalletOutlined style={{ color: '#52c41a' }} /></div>
              <Statistic title="月均实发" value={avgNet} prefix="¥" precision={2} valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {data.length === 0 ? <Empty description="暂无工资条数据" style={{ padding: 60 }} /> : (
        <ProTable<API.PayslipVO>
          headerTitle={<span><WalletOutlined style={{ marginRight: 8 }} />历史工资条</span>}
          rowKey="id" search={false} columns={columns} dataSource={data} pagination={false}
          onRow={(r) => ({ style: { cursor: 'pointer' }, onClick: () => history.push(`/salary/payslips/${r.id}`) })}
          options={{ reload: false }} rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''}
        />
      )}
    </PageContainer>
  );
};

export default MyPayslips;
