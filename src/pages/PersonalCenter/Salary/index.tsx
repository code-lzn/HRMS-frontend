import { getMySalarySlipsUsingGet, getMySalaryTrendUsingGet, getSalarySlipDetailUsingPost } from '@/api/salaryController';
import { Line } from '@ant-design/charts';
import {
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
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
      setSlips((res as any)?.data ?? []);
    } catch {
      // ignore
    }
  };

  const loadTrend = async () => {
    try {
      const res = await getMySalaryTrendUsingGet();
      setTrend((res as any)?.data ?? []);
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
      const res: any = await getSalarySlipDetailUsingPost(
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
      render: (v: number) => (v !== undefined ? `¥${v.toFixed(2)}` : '-'),
    },
    {
      title: '应扣',
      dataIndex: 'totalDeduction',
      key: 'totalDeduction',
      render: (v: number) => (v !== undefined ? `¥${v.toFixed(2)}` : '-'),
    },
    {
      title: '实发',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>
          {v !== undefined ? `¥${v.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'batchStatus',
      key: 'batchStatus',
      render: (v: string) => <Tag color={v === 'PAID' ? 'success' : v === 'APPROVED' ? 'processing' : 'default'}>{v === 'PAID' ? '已发放' : v === 'APPROVED' ? '已通过' : v ?? '-'}</Tag>,
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

  const handlePrint = () => {
    window.print();
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

      {/* ========== 工资条详情弹窗（设计稿样式） ========== */}
      <Modal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={720}
        closable={false}
        destroyOnClose
        bodyStyle={{ padding: 0 }}
        className="payslip-modal"
      >
        {detail && (
          <div className="payslip-container">
            {/* 蓝色头部 */}
            <div className="payslip-header">
              <div className="payslip-header-top">
                <div className="payslip-header-left">
                  <span className="payslip-header-dot" />
                  <span className="payslip-header-title">工 资 条</span>
                </div>
                <div className="payslip-header-actions">
                  <Button type="text" size="small" icon={<PrinterOutlined />} style={{ color: '#fff' }} onClick={handlePrint} />
                  <Button type="text" size="small" icon={<DownloadOutlined />} style={{ color: '#fff' }} />
                  <Button type="text" size="small" icon={<CloseOutlined />} style={{ color: '#fff' }}
                    onClick={() => setDetailModalOpen(false)}
                  />
                </div>
              </div>
              <div className="payslip-header-company">星辰科技有限公司</div>
              <div className="payslip-header-month">{detail.salaryMonth} 工资条</div>
              <div className="payslip-header-employee">
                <span>姓名：<strong>{detail.employeeName}</strong></span>
                <span className="payslip-header-divider" />
                <span>工号：<strong>{detail.employeeNo}</strong></span>
                <span className="payslip-header-divider" />
                <span>部门：<strong>{detail.employeeName ? '技术部' : '-'}</strong></span>
              </div>
            </div>

            {/* 主体：双栏 */}
            <div className="payslip-body">
              {/* 左栏：收入明细 */}
              <div className="payslip-column payslip-income">
                <div className="payslip-section-title">
                  <span className="payslip-section-bar payslip-section-bar-green" />
                  <span>收入明细</span>
                </div>
                <div className="payslip-items">
                  <div className="payslip-item">
                    <span className="payslip-item-label">基本工资</span>
                    <span className="payslip-item-value">{fmtAmt(detail.baseSalary)}</span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">岗位津贴</span>
                    <span className="payslip-item-value">{fmtAmt(detail.allowance)}</span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">绩效奖金</span>
                    <span className="payslip-item-value">{fmtAmt(detail.performanceBonus)}</span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">加班费</span>
                    <span className="payslip-item-value">{fmtAmt(detail.overtimePay)}</span>
                  </div>
                  {(detail.manualAdjust ?? 0) !== 0 && (
                    <div className="payslip-item">
                      <span className="payslip-item-label">手动调整</span>
                      <span className="payslip-item-value" style={{ color: (detail.manualAdjust ?? 0) > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {fmtAmt(detail.manualAdjust)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="payslip-subtotal payslip-subtotal-income">
                  <span>应发小计</span>
                  <span>{fmtAmt(detail.grossSalary)}</span>
                </div>
              </div>

              {/* 右栏：扣除明细 */}
              <div className="payslip-column payslip-deduction">
                <div className="payslip-section-title">
                  <span className="payslip-section-bar payslip-section-bar-red" />
                  <span>扣除明细</span>
                </div>
                <div className="payslip-items">
                  <div className="payslip-item">
                    <span className="payslip-item-label">迟到扣款</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.lateDeduction ? `-${fmtAmt(detail.lateDeduction)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">请假扣款</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.leaveDeduction ? `-${fmtAmt(detail.leaveDeduction)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">养老保险</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.socialPension ? `-${fmtAmt(detail.socialPension)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">医疗保险</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.socialMedical ? `-${fmtAmt(detail.socialMedical)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">失业保险</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.socialUnemployment ? `-${fmtAmt(detail.socialUnemployment)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">住房公积金</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.housingFund ? `-${fmtAmt(detail.housingFund)}` : fmtAmt(0)}
                    </span>
                  </div>
                  <div className="payslip-item">
                    <span className="payslip-item-label">个人所得税</span>
                    <span className="payslip-item-value" style={{ color: '#ff4d4f' }}>
                      {detail.incomeTax ? `-${fmtAmt(detail.incomeTax)}` : fmtAmt(0)}
                    </span>
                  </div>
                </div>
                <div className="payslip-subtotal payslip-subtotal-deduction">
                  <span>应扣小计</span>
                  <span>-{fmtAmt(detail.totalDeduction)}</span>
                </div>
              </div>
            </div>

            {/* 底部：实发工资 */}
            <div className="payslip-footer">
              <div className="payslip-footer-label">实发工资</div>
              <div className="payslip-footer-amount">{fmtAmt(detail.netSalary)}</div>
              <div className="payslip-footer-note">
                税后实发金额，已扣除个人社保、公积金及个税
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySalary;
