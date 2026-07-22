import { getEmployeeSalaryUsingGet, listAccountsUsingGet, updateEmployeeSalaryUsingPut } from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Row, Select, Space, Spin, Divider } from 'antd';
import { SaveOutlined, RollbackOutlined, DollarOutlined, SafetyOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const accentCard = (color: string): React.CSSProperties => ({
  borderRadius: 10, borderLeft: `4px solid ${color}`,
});

const EmployeeSalaryEdit: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const empId = employeeId!;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [salRes, accRes] = await Promise.all([getEmployeeSalaryUsingGet(empId), listAccountsUsingGet()]);
      const accList = (accRes.data as any) ?? [];
      setAccounts(accList.map((a: API.SalaryAccountVO) => ({ label: a.name!, value: a.id! })));
      if (salRes.data) {
        form.setFieldsValue({ ...salRes.data, effectiveDate: salRes.data.effectiveDate ? dayjs(salRes.data.effectiveDate) : undefined });
      }
      setLoading(false);
    })();
  }, [empId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateEmployeeSalaryUsingPut(empId, {
        accountId: values.accountId, baseSalary: values.baseSalary, allowanceBase: values.allowanceBase,
        socialSecurityBase: values.socialSecurityBase, housingFundBase: values.housingFundBase,
        performanceBase: values.performanceBase, effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'), remark: values.remark,
      });
      message.success('薪资档案已更新');
      history.push(`/salary/employees/${empId}`);
    } catch (e: any) {
      if (e?.errorFields) message.warning('请填写所有必填项');
      else message.error(e?.message || '保存失败');
    } finally { setSaving(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '120px auto' }} size="large" />;

  return (
    <PageContainer title="编辑薪资档案" extra={<Space>
      <Button icon={<RollbackOutlined />} onClick={() => history.push(`/salary/employees/${empId}`)}>取消</Button>
      <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={saving} style={{ borderRadius: 8 }}>保存</Button>
    </Space>}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={<span><BankOutlined style={{ marginRight: 8 }} />薪资账套 & 收入</span>} style={accentCard('#1677ff')}>
            <Form form={form} layout="vertical" preserve={false}>
              <Form.Item name="accountId" label="薪资账套" rules={[{ required: true, message: '请选择薪资账套' }]} extra="选择适用于该员工的薪资计算规则">
                <Select placeholder="请选择账套" options={accounts} showSearch optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="baseSalary" label={<span><DollarOutlined style={{ marginRight: 4 }} />月基本工资</span>} rules={[{ required: true, message: '请输入月基本工资' }]}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="例如：15000.00" size="large" />
              </Form.Item>
              <Form.Item name="allowanceBase" label="津贴补贴基数">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="例如：2000.00" />
              </Form.Item>
              <Form.Item name="performanceBase" label="绩效工资基数">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="例如：3000.00" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span><SafetyOutlined style={{ marginRight: 8 }} />社保公积金 & 生效</span>} style={accentCard('#722ed1')}>
            <Form form={form} layout="vertical" preserve={false}>
              <Form.Item name="socialSecurityBase" label="社保缴费基数">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="例如：12000.00" />
              </Form.Item>
              <Form.Item name="housingFundBase" label="公积金缴费基数">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="例如：12000.00" />
              </Form.Item>
              <Form.Item name="effectiveDate" label={<span><CalendarOutlined style={{ marginRight: 4 }} />生效日期</span>} rules={[{ required: true, message: '请选择生效日期' }]}>
                <DatePicker style={{ width: '100%' }} placeholder="选择生效日期" />
              </Form.Item>
              <Form.Item name="remark" label="变更备注">
                <Input.TextArea rows={4} placeholder="请输入调薪原因或备注说明" maxLength={200} showCount />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default EmployeeSalaryEdit;
