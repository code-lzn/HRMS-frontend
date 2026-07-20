import {
  getPayslipDetailUsingGet,
  verifyPayslipUsingPost,
} from '@/api/salaryController';
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  message,
  Modal,
  Spin,
  Table,
} from 'antd';
import React, { useEffect, useState } from 'react';

const PayslipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const [payslip, setPayslip] = useState<API.PayslipVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getPayslipDetailUsingGet(pid);
      setPayslip(res.data ?? null);
      setLoading(false);

      // 未查看则弹出验证
      if (res.data && res.data.payslipViewed !== 1) {
        setVerifyOpen(true);
      }
    })();
  }, [pid]);

  const handleVerify = async () => {
    await verifyPayslipUsingPost(pid, { verifyType: 2, verifyCode });
    message.success('验证成功');
    setVerifyOpen(false);
  };

  if (loading)
    return <Spin style={{ display: 'block', margin: '120px auto' }} />;
  if (!payslip) return <Empty description="工资条不存在" />;

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
      render: (v: number) => `-¥${(Math.abs(v) ?? 0).toLocaleString()}`,
    },
  ];

  return (
    <PageContainer
      title="工资条详情"
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/salary/payslips')}
        >
          返回列表
        </Button>
      }
    >
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>{payslip.salaryMonth} 工资条</h2>
          <Descriptions column={3} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="姓名">
              {payslip.employeeName}
            </Descriptions.Item>
            <Descriptions.Item label="工号">
              {payslip.employeeNo}
            </Descriptions.Item>
            <Descriptions.Item label="部门">
              {payslip.departmentName}
            </Descriptions.Item>
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
            扣除合计：-¥{(payslip.totalDeductions ?? 0).toLocaleString()}
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

      <Modal
        title={
          <>
            <SafetyOutlined /> 二次验证
          </>
        }
        open={verifyOpen}
        onOk={handleVerify}
        onCancel={() => setVerifyOpen(false)}
        closable={false}
        maskClosable={false}
      >
        <p>首次查看需验证身份，请输入登录密码：</p>
        <input
          type="password"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          placeholder="请输入密码"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            fontSize: 14,
          }}
        />
      </Modal>
    </PageContainer>
  );
};

export default PayslipDetail;
