import { useEffect, useState, useRef } from 'react';
import { Card, Button, Modal, Descriptions, Input, Tabs, message, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Line } from '@antv/g2plot';
import type { PayslipListItem, PayslipDetailVO, SalaryTrendVO } from '@/services/profile/typings';
import { getSalaryList, getSalaryDetail, sendSalaryVerifyCode, getSalaryTrend } from '@/services/profile';
import { PageContainer } from '@ant-design/pro-components';

export default function SalaryPage() {
  const [list, setList] = useState<PayslipListItem[]>([]);
  const [trend, setTrend] = useState<SalaryTrendVO | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detail, setDetail] = useState<PayslipDetailVO | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'sms' | 'password'>('sms');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [targetId, setTargetId] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getSalaryList().then(setList).catch(() => {});
    getSalaryTrend().then((d) => { setTrend(d); }).catch(() => {});
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

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

  const handleViewDetail = (item: PayslipListItem) => {
    if (!item.hasViewed) {
      setTargetId(item.id);
      setVerifyVisible(true);
      return;
    }
    showDetail(item.id);
  };

  const showDetail = async (id: number, code?: string) => {
    const d = await getSalaryDetail(id, code);
    setDetail(d);
    setDetailVisible(true);
    setVerifyVisible(false);
    setVerifyCode('');
    setPassword('');
  };

  const handleSendCode = async () => {
    if (!targetId) return;
    await sendSalaryVerifyCode(targetId);
    message.success('验证码已发送');
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  };

  const handleVerify = async () => {
    if (verifyMethod === 'password' && !password) { message.error('请输入密码'); return; }
    if (verifyMethod === 'sms' && !verifyCode) { message.error('请输入验证码'); return; }
    try {
      await showDetail(targetId!, verifyMethod === 'password' ? password : verifyCode);
    } catch {
      message.error('验证失败');
    }
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px 20px',
                background: '#f9fafb',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#3b82f6',
                  }}
                >
                  💰
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.yearMonth}月工资条</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    基本工资 + 绩效奖金
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>
                    ¥{item.netSalary.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>实发工资</div>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item)}
                  style={{ color: '#3b82f6' }}
                >
                  查看详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        title={`${detail?.yearMonth} 工资条`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={500}
        style={{ borderRadius: 12 }}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工">{detail.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{detail.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="部门">{detail.departmentName}</Descriptions.Item>
          </Descriptions>
        )}
        {detail && (
          <>
            <Divider style={{ margin: '16px 0' }}>收入</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="基本工资">¥{detail.income.basicSalary.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="岗位津贴">¥{detail.income.allowance.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="绩效奖金">¥{detail.income.bonus.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应发)"><strong>¥{detail.income.totalIncome.toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '16px 0' }}>扣除</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="事假扣款">¥{Math.abs(detail.deductions.leaveDeduction).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="养老保险">¥{Math.abs(detail.deductions.pensionInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="医疗保险">¥{Math.abs(detail.deductions.medicalInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="失业保险">¥{Math.abs(detail.deductions.unemploymentInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="住房公积金">¥{Math.abs(detail.deductions.housingFund).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="个人所得税">¥{Math.abs(detail.deductions.incomeTax).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应扣)"><strong style={{ color: '#ef4444' }}>-¥{Math.abs(detail.deductions.totalDeduction).toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '16px 0' }}>实发</Divider>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#22c55e', textAlign: 'center', padding: '12px 0' }}>
              ¥{detail.netSalary.toLocaleString()}
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="身份验证"
        open={verifyVisible}
        onCancel={() => setVerifyVisible(false)}
        onOk={handleVerify}
        okText="验证"
        style={{ borderRadius: 12 }}
      >
        <Tabs
          activeKey={verifyMethod}
          onChange={(k) => setVerifyMethod(k as 'sms' | 'password')}
          items={[
            {
              key: 'sms',
              label: '短信验证码',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                  <Input placeholder="6位验证码" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} />
                  <Button block onClick={handleSendCode} disabled={countdown > 0}>
                    {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
                  </Button>
                </div>
              ),
            },
            {
              key: 'password',
              label: '登录密码',
              children: (
                <Input.Password placeholder="请输入登录密码" value={password} onChange={(e) => setPassword(e.target.value)} />
              ),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  );
}
