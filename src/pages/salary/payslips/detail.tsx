import { getPayslipDetailUsingGet, verifyPayslipUsingPost, sendPayslipVerifyCodeUsingPost } from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { ArrowLeftOutlined, SafetyOutlined, MailOutlined, KeyOutlined, LockOutlined, DollarOutlined, WalletOutlined, BankOutlined, UserOutlined, TeamOutlined, IdcardOutlined, PrinterOutlined } from '@ant-design/icons';
import { history, useParams } from '@umijs/max';
import { Button, Card, Empty, message, Modal, Spin, Table, Tabs, Watermark } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState, useRef } from 'react';

const PayslipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pid = id!;
  const [payslip, setPayslip] = useState<API.PayslipVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyType, setVerifyType] = useState<1 | 2>(2);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => { setLoading(true); try {
      const res = await getPayslipDetailUsingGet(pid); setPayslip(res.data ?? null);
      if (res.data && res.data.payslipViewed === 0) { setVerified(false); setVerifyOpen(true); } else { setVerified(true); }
    } finally { setLoading(false); } })();
  }, [pid]);

  const handleSendCode = async () => {
    setSendingCode(true); try {
      const res = await sendPayslipVerifyCodeUsingPost(pid); const code = (res as any)?.data || (res as any);
      Modal.info({ title: '验证码', icon: <SafetyOutlined />, content: `您的短信验证码是：${code}`, okText: '知道了' });
      setVerifyCode(code); setCountdown(60);
    } catch { message.error('发送失败，请稍后重试'); } finally { setSendingCode(false); }
  };

  useEffect(() => { if (countdown <= 0) return; const t = setInterval(() => setCountdown((c) => c - 1), 1000); return () => clearInterval(t); }, [countdown]);

  const handleVerify = async () => {
    if (!verifyCode.trim()) { message.warning(verifyType === 2 ? '请输入登录密码' : '请输入短信验证码'); return; }
    setVerifying(true); try {
      await verifyPayslipUsingPost(pid, { verifyType, verifyCode }); message.success('验证成功'); setVerifyOpen(false); setVerified(true);
      setLoading(true); try { const res = await getPayslipDetailUsingGet(pid); setPayslip(res.data ?? null); } finally { setLoading(false); }
    } catch (err: any) { message.error(err?.message || '验证失败，请重试'); } finally { setVerifying(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '120px auto' }} size="large" />;
  if (!payslip) return <PageContainer><Empty description="工资条不存在" /></PageContainer>;

  if (!verified) {
    return (
      <PageContainer title="工资条详情">
        <Empty description={<span><LockOutlined style={{ marginRight: 8 }} />请先完成二次验证以查看工资条详情</span>} style={{ padding: 60 }} />
        <Modal title={<span><SafetyOutlined style={{ marginRight: 8 }} />安全验证</span>} open={verifyOpen} onOk={handleVerify} onCancel={() => history.push('/salary/payslips')}
          closable={false} maskClosable={false} okText="验证" confirmLoading={verifying} cancelText="返回列表">
          <Tabs activeKey={String(verifyType)} onChange={(k) => setVerifyType(Number(k) as 1 | 2)} items={[
            { key: '2', label: <span><KeyOutlined /> 密码验证</span>, children: (
              <div style={{ padding: '8px 0' }}><p style={{ marginBottom: 12, color: '#666' }}>请输入您的登录密码以验证身份</p>
                <input type="password" value={verifyType === 2 ? verifyCode : ''} onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="请输入登录密码" onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }} autoFocus
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14 }} /></div>)},
            { key: '1', label: <span><MailOutlined /> 短信验证</span>, children: (
              <div style={{ padding: '8px 0' }}><p style={{ marginBottom: 12, color: '#666' }}>请输入发送到您手机的验证码</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={verifyType === 1 ? verifyCode : ''} onChange={(e) => setVerifyCode(e.target.value)} placeholder="6位验证码" maxLength={6}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14 }} />
                  <Button onClick={handleSendCode} disabled={countdown > 0} loading={sendingCode} style={{ minWidth: 110 }}>{countdown > 0 ? `${countdown}s` : '获取验证码'}</Button>
                </div></div>)},
          ]} />
        </Modal>
      </PageContainer>
    );
  }

  const incomeCols = [
    { title: '收入项目', dataIndex: 'name', width: 200, render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: '金额', dataIndex: 'amount', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontSize: 14, fontWeight: 500 }}>¥{(v ?? 0).toLocaleString()}</span> },
  ];
  const dedCols = [
    { title: '扣除项目', dataIndex: 'name', width: 200, render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: '金额', dataIndex: 'amount', width: 140, align: 'right' as const, render: (v: number) => <span style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 500 }}>-¥{(v ?? 0).toLocaleString()}</span> },
  ];

  return (
    <PageContainer title="工资条详情" extra={<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/salary/payslips')}>返回列表</Button>}>
      <Watermark content={[payslip.employeeName || '', payslip.employeeNo || '']} font={{ fontSize: 16, color: 'rgba(0,0,0,0.05)' }}>
        <Card style={{ maxWidth: 720, margin: '0 auto', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}
          styles={{ body: { padding: 0 } }}>
          {/* 企业头部 */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '32px 36px 24px', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 12, opacity: 0.6, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Salary Statement</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>{payslip.salaryMonth} 工资条</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 20, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, opacity: 0.5 }}>姓名</div><div style={{ fontSize: 16, fontWeight: 600 }}><UserOutlined style={{ marginRight: 4 }} />{payslip.employeeName}</div></div>
              <div><div style={{ fontSize: 11, opacity: 0.5 }}>工号</div><div style={{ fontSize: 16, fontWeight: 600 }}><IdcardOutlined style={{ marginRight: 4 }} />{payslip.employeeNo}</div></div>
              <div><div style={{ fontSize: 11, opacity: 0.5 }}>部门</div><div style={{ fontSize: 16, fontWeight: 600 }}><TeamOutlined style={{ marginRight: 4 }} />{payslip.departmentName}</div></div>
            </div>
          </div>

          <div style={{ padding: '28px 36px' }}>
            {/* 收入 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#52c41a', marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                <DollarOutlined style={{ marginRight: 6 }} />收入明细
              </div>
              <Table rowKey="name" dataSource={payslip.incomeItems ?? []} columns={incomeCols} pagination={false} size="small" showHeader={false}
                style={{ borderRadius: 8, overflow: 'hidden' }} rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''} />
              <div style={{ textAlign: 'right', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #d9d9d9', fontSize: 16, fontWeight: 700, color: '#52c41a' }}>
                应发合计：¥{(payslip.grossPay ?? 0).toLocaleString()}
              </div>
            </div>

            {/* 扣除 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ff4d4f', marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                <BankOutlined style={{ marginRight: 6 }} />扣除明细
              </div>
              <Table rowKey="name" dataSource={payslip.deductionItems ?? []} columns={dedCols} pagination={false} size="small" showHeader={false}
                style={{ borderRadius: 8, overflow: 'hidden' }} rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''} />
              <div style={{ textAlign: 'right', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #d9d9d9', fontSize: 16, fontWeight: 700, color: '#ff4d4f' }}>
                扣除合计：¥{(payslip.totalDeductions ?? 0).toLocaleString()}
              </div>
            </div>

            {/* 实发 */}
            <div style={{ textAlign: 'center', padding: '32px 0', background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 50%, #f0f5ff 100%)', borderRadius: 14, border: '2px solid #d9f7be' }}>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 6, letterSpacing: 1 }}>实发工资（税后）</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#237804', letterSpacing: 2, lineHeight: 1.2 }}>
                ¥{(payslip.netPay ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>本工资条仅供核对参考，如有疑问请联系 HR 部门</div>
            </div>

            {/* 签章区 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#8c8c8c' }}>
              <div>制表：HR 薪资组</div>
              <div>发放时间：{payslip.paidTime ? dayjs(payslip.paidTime).format('YYYY-MM-DD HH:mm') : '-'}</div>
              <div>电子工资条 · 与纸质版同等效力</div>
            </div>
          </div>
        </Card>
      </Watermark>
    </PageContainer>
  );
};

export default PayslipDetail;
