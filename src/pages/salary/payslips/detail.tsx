import { getPayslipDetailUsingGet, verifyPayslipUsingPost, sendPayslipVerifyCodeUsingPost } from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { ArrowLeftOutlined, SafetyOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, message, Modal, Spin, Table, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useParams } from '@umijs/max';

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPayslipDetailUsingGet(pid);
        setPayslip(res.data ?? null);
        // 未查看则弹出验证；已查看则直接标记已验证
        if (res.data && res.data.payslipViewed === 0) {
          setVerified(false);
          setVerifyOpen(true);
        } else {
          setVerified(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [pid]);

  const handleSendCode = async () => {
    setSendingCode(true);
    try {
      await sendPayslipVerifyCodeUsingPost(pid);
      message.success('验证码已发送');
      setCountdown(60);
    } catch {
      message.error('发送失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    try {
      await verifyPayslipUsingPost(pid, { verifyType, verifyCode });
      message.success('验证成功');
      setVerifyOpen(false);
      setVerified(true);
      // 验证通过后重新加载工资条详情
      setLoading(true);
      try {
        const res = await getPayslipDetailUsingGet(pid);
        setPayslip(res.data ?? null);
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      message.error(err?.message || '验证失败，请重试');
    }
  };

  const handleCancel = () => {
    history.push('/salary/payslips');
  };

  if (loading) return <Spin style={{ display: 'block', margin: '120px auto' }} />;
  if (!payslip) return <Empty description="工资条不存在" />;

  // 未验证时隐藏工资明细，只显示验证弹窗
  if (!verified) {
    return (
      <PageContainer title="工资条详情">
        <Empty description="请先完成二次验证以查看工资条" />
        <Modal
          title={<><SafetyOutlined /> 二次验证</>}
          open={verifyOpen}
          onOk={handleVerify}
          onCancel={handleCancel}
          closable={false}
          maskClosable={false}
          okText="验证"
        >
          <Tabs
            activeKey={String(verifyType)}
            onChange={(k) => setVerifyType(Number(k) as 1 | 2)}
            items={[
              {
                key: '2',
                label: <span><KeyOutlined /> 密码验证</span>,
                children: (
                  <>
                    <p>请输入登录密码：</p>
                    <input
                      type="password"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="请输入密码"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        fontSize: 14,
                      }}
                    />
                  </>
                ),
              },
              {
                key: '1',
                label: <span><MailOutlined /> 短信验证</span>,
                children: (
                  <>
                    <p>请输入短信验证码：</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="6位验证码"
                        maxLength={6}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 6,
                          fontSize: 14,
                        }}
                      />
                      <Button
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        loading={sendingCode}
                      >
                        {countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Modal>
      </PageContainer>
    );
  }

  const incomeCols = [
    { title: '收入项目', dataIndex: 'name', width: 160 },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      align: 'right' as const,
      render: (v: number) => `¥${(v ?? 0).toLocaleString()}`,
    },
  ];

  const dedCols = [
    { title: '扣除项目', dataIndex: 'name', width: 160 },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      align: 'right' as const,
      render: (v: number) => `¥${(v ?? 0).toLocaleString()}`,
    },
  ];

  return (
    <PageContainer
      title="工资条详情"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/salary/payslips')}>
          返回列表
        </Button>
      }
    >
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>{payslip.salaryMonth} 工资条</h2>
          <Descriptions column={3} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="姓名">{payslip.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{payslip.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="部门">{payslip.departmentName}</Descriptions.Item>
          </Descriptions>
        </div>

        <Card title="💰 收入明细" size="small" style={{ marginBottom: 16 }}>
          <Table
            rowKey="name"
            dataSource={payslip.incomeItems ?? []}
            columns={incomeCols}
            pagination={false}
            size="small"
            showHeader={false}
          />
          <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 600 }}>
            应发合计：¥{(payslip.grossPay ?? 0).toLocaleString()}
          </div>
        </Card>

        <Card title="📉 扣除明细" size="small" style={{ marginBottom: 16 }}>
          <Table
            rowKey="name"
            dataSource={payslip.deductionItems ?? []}
            columns={dedCols}
            pagination={false}
            size="small"
            showHeader={false}
          />
          <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 600 }}>
            扣除合计：¥{(payslip.totalDeductions ?? 0).toLocaleString()}
          </div>
        </Card>

        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            background: '#f6ffed',
            borderRadius: 8,
            border: '1px solid #b7eb8f',
          }}
        >
          <div style={{ fontSize: 13, color: '#8c8c8c' }}>实发工资</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>
            ¥{(payslip.netPay ?? 0).toLocaleString()}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default PayslipDetail;
