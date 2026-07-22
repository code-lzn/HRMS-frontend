import { getEmployeeSalaryUsingGet, getSalaryHistoryUsingGet } from '@/api/salaryController';
import { EditOutlined, DollarOutlined, CalendarOutlined, ClockCircleOutlined, SafetyOutlined, TrophyOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Card, Col, Descriptions, Empty, message, Row, Spin, Statistic, Tag, Timeline, Progress } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff',
};
const statBox: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', minWidth: 100,
};
const accentCard = (color: string): React.CSSProperties => ({
  borderRadius: 10, borderLeft: `4px solid ${color}`, transition: 'all 0.25s',
});

const EmployeeSalaryDetail: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const empId = employeeId!;
  const [salary, setSalary] = useState<API.EmployeeSalaryVO | null>(null);
  const [historyList, setHistory] = useState<API.SalaryChangeHistoryVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [salRes, histRes] = await Promise.all([getEmployeeSalaryUsingGet(empId), getSalaryHistoryUsingGet(empId)]);
        setSalary(salRes.data ?? null);
        setHistory((histRes.data as any) ?? []);
      } catch { message.error('获取薪资数据失败'); }
      setLoading(false);
    })();
  }, [empId]);

  if (loading) return <Spin style={{ display: 'block', margin: '120px auto' }} size="large" />;

  if (!salary) {
    return (
      <PageContainer title="员工薪资档案" extra={<Button type="primary" icon={<EditOutlined />} onClick={() => history.push(`/salary/employees/${empId}/edit`)}>新建薪资档案</Button>}>
        <Empty description="该员工暂无薪资档案，请先创建" />
      </PageContainer>
    );
  }

  const baseSalary = salary.baseSalary ?? 0;
  const maxSalary = Math.max(baseSalary, salary.allowanceBase ?? 0, salary.performanceBase ?? 0, 1);

  return (
    <PageContainer title="员工薪资档案" extra={<Button type="primary" icon={<EditOutlined />} onClick={() => history.push(`/salary/employees/${empId}/edit`)}>编辑薪资档案</Button>}>
      {/* ====== Hero ====== */}
      <div style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 1 }}>薪资档案</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}><UserOutlined style={{ marginRight: 8 }} />账套：{salary.accountName || '未设置'}</div>
          <Tag color="green" style={{ marginTop: 8 }}>有效</Tag>
        </div>
        <Row gutter={24}>
          <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>基本工资</div><div style={{ fontSize: 18, fontWeight: 700 }}>¥{baseSalary.toLocaleString()}</div></div></Col>
          <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>津贴基数</div><div style={{ fontSize: 18, fontWeight: 700 }}>¥{(salary.allowanceBase ?? 0).toLocaleString()}</div></div></Col>
          <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>绩效基数</div><div style={{ fontSize: 18, fontWeight: 700 }}>¥{(salary.performanceBase ?? 0).toLocaleString()}</div></div></Col>
          <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>社保基数</div><div style={{ fontSize: 18, fontWeight: 700 }}>¥{(salary.socialSecurityBase ?? 0).toLocaleString()}</div></div></Col>
          <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>公积金基数</div><div style={{ fontSize: 18, fontWeight: 700 }}>¥{(salary.housingFundBase ?? 0).toLocaleString()}</div></div></Col>
        </Row>
      </div>

      {/* ====== 薪资构成 Progress ====== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title={<span><DollarOutlined style={{ marginRight: 6, color: '#1677ff' }} />薪资构成</span>} style={accentCard('#1677ff')} size="small">
            <div style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>基本工资</span><strong>¥{baseSalary.toLocaleString()}</strong></div><Progress percent={Math.round((baseSalary / maxSalary) * 100)} showInfo={false} strokeColor="#1677ff" trailColor="#f0f0f0" size="small" /></div>
            <div style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>津贴基数</span><strong>¥{(salary.allowanceBase ?? 0).toLocaleString()}</strong></div><Progress percent={Math.round(((salary.allowanceBase ?? 0) / maxSalary) * 100)} showInfo={false} strokeColor="#52c41a" trailColor="#f0f0f0" size="small" /></div>
            <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>绩效基数</span><strong>¥{(salary.performanceBase ?? 0).toLocaleString()}</strong></div><Progress percent={Math.round(((salary.performanceBase ?? 0) / maxSalary) * 100)} showInfo={false} strokeColor="#faad14" trailColor="#f0f0f0" size="small" /></div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span><SafetyOutlined style={{ marginRight: 6, color: '#722ed1' }} />社保公积金</span>} style={accentCard('#722ed1')} size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="社保基数">¥{(salary.socialSecurityBase ?? 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="公积金基数">¥{(salary.housingFundBase ?? 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="生效日期"><CalendarOutlined style={{ marginRight: 4 }} />{salary.effectiveDate ? dayjs(salary.effectiveDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
              <Descriptions.Item label="更新时间"><ClockCircleOutlined style={{ marginRight: 4 }} />{salary.updateTime ? dayjs(salary.updateTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* ====== 调薪历史 Timeline ====== */}
      <Card title={<span><HistoryOutlined style={{ marginRight: 6 }} />调薪历史</span>} style={{ borderRadius: 10 }}>
        {historyList.length === 0 ? (
          <Empty description="暂无调薪记录" />
        ) : (
          <Timeline
            items={historyList.map((h) => ({
              color: 'blue',
              children: (
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <Tag color="blue">{h.changeTypeLabel}</Tag>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>{h.createTime ? dayjs(h.createTime).format('YYYY-MM-DD HH:mm') : '-'}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    {h.oldValue && <span style={{ color: '#8c8c8c', textDecoration: 'line-through' }}>{h.oldValue}</span>}
                    {h.oldValue && h.newValue && <span style={{ margin: '0 8px', color: '#8c8c8c' }}>→</span>}
                    {h.newValue && <strong>{h.newValue}</strong>}
                  </div>
                  {h.remark && <div style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}>备注：{h.remark}</div>}
                  {h.effectiveDate && <div style={{ marginTop: 2, fontSize: 12, color: '#8c8c8c' }}>生效：{dayjs(h.effectiveDate).format('YYYY-MM-DD')}</div>}
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default EmployeeSalaryDetail;
