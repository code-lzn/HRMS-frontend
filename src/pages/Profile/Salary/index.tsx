import { useEffect, useState, useRef } from 'react';
import { Card, Timeline, Button, Modal, Descriptions, Input, Tabs, Badge, message, Space, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Line } from '@antv/g2plot';
import type { PayslipListItem, PayslipDetailVO, SalaryTrendVO } from '@/services/profile/typings';
import { getSalaryList, getSalaryDetail, sendSalaryVerifyCode, getSalaryTrend } from '@/services/profile';

export default function SalaryPage() {
  const [list, setList] = useState<PayslipListItem[]>([]);
  const [trend, setTrend] = useState<SalaryTrendVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detail, setDetail] = useState<PayslipDetailVO | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'sms' | 'password'>('sms');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [targetId, setTargetId] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSalaryList().then(setList);
    getSalaryTrend().then((d) => { setTrend(d); });
  }, []);

  // 折线图渲染
  useEffect(() => {
    if (!trend || !chartRef.current) return;
    const chart = new Line(chartRef.current, {
      data: trend.months.map((m, i) => ({ month: m, salary: trend.netSalaries[i] })),
      xField: 'month',
      yField: 'salary',
      smooth: true,
      point: { size: 5, shape: 'circle' },
      tooltip: { formatter: (d: any) => ({ name: '实发工资', value: `¥${d.salary.toLocaleString()}` }) },
      yAxis: { label: { formatter: (v: string) => `¥${(Number(v) / 1000).toFixed(0)}k` } },
      color: '#1890ff',
      area: { style: { fill: 'l(270) 0:#ffffff 1:#91d5ff' } },
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
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
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
    <div>
      {/* 趋势图 */}
      <Card title="薪资趋势" style={{ marginBottom: 16 }}>
        <div ref={chartRef} style={{ height: 300 }} />
      </Card>

      {/* 工资条列表 */}
      <Card title="工资条">
        <Timeline
          items={list.map((item) => ({
            color: item.hasViewed ? 'gray' : 'blue',
            dot: !item.hasViewed ? <Badge dot /> : undefined,
            children: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {item.yearMonth} — <strong>¥{item.netSalary.toLocaleString()}</strong>
                  <span style={{ marginLeft: 8, color: '#999' }}>({item.statusDesc})</span>
                </span>
                <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(item)}>查看</Button>
              </div>
            ),
          }))}
        />
      </Card>

      {/* 工资条详情 */}
      <Modal title={`${detail?.yearMonth} 工资条`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={500}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工">{detail.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{detail.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="部门">{detail.departmentName}</Descriptions.Item>
          </Descriptions>
        )}
        {detail && (
          <>
            <Divider>收入</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="基本工资">¥{detail.income.basicSalary.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="岗位津贴">¥{detail.income.allowance.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="绩效奖金">¥{detail.income.bonus.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应发)"><strong>¥{detail.income.totalIncome.toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider>扣除</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="事假扣款">¥{Math.abs(detail.deductions.leaveDeduction).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="养老保险">¥{Math.abs(detail.deductions.pensionInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="医疗保险">¥{Math.abs(detail.deductions.medicalInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="失业保险">¥{Math.abs(detail.deductions.unemploymentInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="住房公积金">¥{Math.abs(detail.deductions.housingFund).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="个人所得税">¥{Math.abs(detail.deductions.incomeTax).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应扣)"><strong style={{ color: '#f5222d' }}>-¥{Math.abs(detail.deductions.totalDeduction).toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider>实发</Divider>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', textAlign: 'center' }}>
              ¥{detail.netSalary.toLocaleString()}
            </div>
          </>
        )}
      </Modal>

      {/* 二次验证弹窗 */}
      <Modal title="身份验证" open={verifyVisible} onCancel={() => setVerifyVisible(false)} onOk={handleVerify} okText="验证">
        <Tabs activeKey={verifyMethod} onChange={(k) => setVerifyMethod(k as 'sms' | 'password')}
          items={[
            { key: 'sms', label: '短信验证码', children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input placeholder="6位验证码" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} />
                <Button block onClick={handleSendCode} disabled={countdown > 0}>{countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}</Button>
              </Space>
            )},
            { key: 'password', label: '登录密码', children: (
              <Input.Password placeholder="请输入登录密码" value={password} onChange={(e) => setPassword(e.target.value)} />
            )},
          ]}
        />
      </Modal>
    </div>
  );
}
