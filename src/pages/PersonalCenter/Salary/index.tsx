import { getMySalarySlipsUsingGet, getMySalaryTrendUsingGet, getSalarySlipDetailUsingPost } from '@/api/salaryController';
import { Line } from '@ant-design/charts';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';

const fmtAmt = (v?: number) =>
  v != null ? `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';

const MySalary: React.FC = () => {
  const [slips, setSlips] = useState<API.SalarySlipVO[]>([]);
  const [trend, setTrend] = useState<API.SalaryTrendVO[]>([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detail, setDetail] = useState<API.SalarySlipDetailVO | null>(null);
  const [selectedSlipId, setSelectedSlipId] = useState<number>(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSlips();
    loadTrend();
  }, []);

  const loadSlips = async () => {
    try {
      const res = await getMySalarySlipsUsingGet();
      setSlips(res?.data ?? []);
    } catch {
      // ignore
    }
  };

  const loadTrend = async () => {
    try {
      const res = await getMySalaryTrendUsingGet();
      setTrend(res?.data ?? []);
    } catch {
      // ignore
    }
  };

  const handleViewDetail = (id: number) => {
    setSelectedSlipId(id);
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await getSalarySlipDetailUsingPost(
        { id: selectedSlipId },
        { password: values.password },
      );
      if (res?.code === 0) {
        setDetail(res?.data ?? null);
        setPasswordModalOpen(false);
        setDetailModalOpen(true);
        form.resetFields();
      }
    } catch (e: any) {
      if (e.message) message.error(e.message || '密码验证失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '月份',
      dataIndex: 'salaryMonth',
      key: 'salaryMonth',
      render: (v: string) => v ?? '-',
    },
    {
      title: '应发',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      render: (v: number) => (v !== undefined? `¥${v.toFixed(2)}` : '-'),
    },
    {
      title: '应扣',
      dataIndex: 'totalDeduction',
      key: 'totalDeduction',
      render: (v: number) => (v !== undefined? `¥${v.toFixed(2)}` : '-'),
    },
    {
      title: '实发',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>
          {v !== undefined? `¥${v.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'batchStatus',
      key: 'batchStatus',
      render: (v: string) => <Tag color={v === '已发放' ? 'success' : 'default'}>{v ?? '-'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.SalarySlipVO) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id!)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const trendConfig = {
    data: trend
      .map((item) => [
        { month: item.month, value: item.grossSalary, category: '应发工资' },
        { month: item.month, value: item.netSalary, category: '实发工资' },
      ])
      .flat(),
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    color: ['#1677ff', '#52c41a'],
    point: { size: 5, shape: 'circle' },
    legend: { position: 'top' as const },
    yAxis: {
      label: {
        formatter: (v: string) => `¥${Number(v).toLocaleString()}`,
      },
    },
  };

  return (
    <div className="salary-page">
      {/* 薪资趋势图 */}
      <Card title="薪资趋势（近6个月）" style={{ marginBottom: 16 }}>
        {trend.length > 0 ? (
          <div style={{ height: 300 }}>
            <Line {...trendConfig} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无趋势数据
          </div>
        )}
      </Card>

      {/* 工资条列表 */}
      <Card title="工资条">
        <Table
          dataSource={slips}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无工资条记录' }}
        />
      </Card>

      {/* 密码验证 Modal */}
      <Modal
        title="身份验证"
        open={passwordModalOpen}
        onOk={handlePasswordSubmit}
        onCancel={() => {
          setPasswordModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        destroyOnClose
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          工资条为敏感信息，请输入登录密码以继续查看
        </p>
        <Form form={form} layout="vertical">
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入登录密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 工资条详情 Modal */}
      <Modal
        title={`工资条详情（${detail?.salaryMonth ?? ''}）`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={640}
      >
        {detail && (
          <div className="salary-slip-detail">
            <div className="slip-head">
              <h3>工 资 条</h3>
              <div className="slip-head-row">
                <span className="slip-head-item">姓名<strong>{detail.employeeName}</strong></span>
                <span className="slip-head-item">工号<strong>{detail.employeeNo}</strong></span>
                <span className="slip-head-item">月份<strong>{detail.salaryMonth}</strong></span>
              </div>
            </div>

            <div className="slip-section">
              <div className="slip-section-head">
                <span className="slip-section-dot" style={{ background: '#52c41a' }} />
                <span className="slip-section-label">收入项</span>
              </div>
              <div className="slip-items">
                <div className="slip-item"><span className="slip-item-label">基本工资</span><span className="slip-item-value">{fmtAmt(detail.baseSalary)}</span></div>
                <div className="slip-item"><span className="slip-item-label">岗位津贴</span><span className="slip-item-value">{fmtAmt(detail.allowance)}</span></div>
                <div className="slip-item"><span className="slip-item-label">绩效奖金</span><span className="slip-item-value">{fmtAmt(detail.performanceBonus)}</span></div>
                <div className="slip-item"><span className="slip-item-label">加班费</span><span className="slip-item-value">{fmtAmt(detail.overtimePay)}</span></div>
                {(detail.manualAdjust ?? 0) !== 0 && (
                  <div className="slip-item"><span className="slip-item-label">手动调整</span><span className="slip-item-value">{fmtAmt(detail.manualAdjust)}</span></div>
                )}
              </div>
            </div>

            <div className="slip-section">
              <div className="slip-section-head">
                <span className="slip-section-dot" style={{ background: '#ff4d4f' }} />
                <span className="slip-section-label">扣除项</span>
              </div>
              <div className="slip-items">
                <div className="slip-item"><span className="slip-item-label">迟到扣款</span><span className="slip-item-value">{fmtAmt(detail.lateDeduction)}</span></div>
                <div className="slip-item"><span className="slip-item-label">请假扣款</span><span className="slip-item-value">{fmtAmt(detail.leaveDeduction)}</span></div>
                <div className="slip-item"><span className="slip-item-label">养老保险</span><span className="slip-item-value">{fmtAmt(detail.socialPension)}</span></div>
                <div className="slip-item"><span className="slip-item-label">医疗保险</span><span className="slip-item-value">{fmtAmt(detail.socialMedical)}</span></div>
                <div className="slip-item"><span className="slip-item-label">失业保险</span><span className="slip-item-value">{fmtAmt(detail.socialUnemployment)}</span></div>
                <div className="slip-item"><span className="slip-item-label">住房公积金</span><span className="slip-item-value">{fmtAmt(detail.housingFund)}</span></div>
                <div className="slip-item"><span className="slip-item-label">个人所得税</span><span className="slip-item-value">{fmtAmt(detail.incomeTax)}</span></div>
              </div>
            </div>

            <div className="slip-total">
              <div className="slip-total-row">
                <span className="slip-total-label">应发工资</span>
                <span className="slip-total-value">{fmtAmt(detail.grossSalary)}</span>
              </div>
              <div className="slip-total-row">
                <span className="slip-total-label">应扣合计</span>
                <span className="slip-total-value">{fmtAmt(detail.totalDeduction)}</span>
              </div>
              <div className="slip-total-divider" />
              <div className="slip-total-net">
                <span className="slip-net-label">实发工资</span>
                <span className="slip-net-value">{fmtAmt(detail.netSalary)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySalary;
