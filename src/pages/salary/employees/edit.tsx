import {
  getEmployeeSalaryUsingGet,
  listAccountsUsingGet,
  updateEmployeeSalaryUsingPut,
} from '@/api/salaryController';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const EmployeeSalaryEdit: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const empId = Number(employeeId);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<{ label: string; value: number }[]>(
    [],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [salRes, accRes] = await Promise.all([
        getEmployeeSalaryUsingGet(empId),
        listAccountsUsingGet(),
      ]);
      const accList = (accRes.data as any) ?? [];
      setAccounts(
        accList.map((a: API.SalaryAccountVO) => ({
          label: a.name!,
          value: a.id!,
        })),
      );

      if (salRes.data) {
        form.setFieldsValue({
          ...salRes.data,
          effectiveDate: salRes.data.effectiveDate
            ? dayjs(salRes.data.effectiveDate)
            : undefined,
        });
      }
      setLoading(false);
    })();
  }, [empId, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await updateEmployeeSalaryUsingPut(empId, {
      accountId: values.accountId,
      baseSalary: values.baseSalary,
      allowanceBase: values.allowanceBase,
      socialSecurityBase: values.socialSecurityBase,
      housingFundBase: values.housingFundBase,
      performanceBase: values.performanceBase,
      effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
      remark: values.remark,
    });
    message.success('薪资档案已更新');
    history.push(`/salary/employees/${empId}`);
  };

  if (loading)
    return <Spin style={{ display: 'block', margin: '120px auto' }} />;

  return (
    <PageContainer
      title="编辑薪资档案"
      extra={
        <Space>
          <Button onClick={() => history.push(`/salary/employees/${empId}`)}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      <Card style={{ maxWidth: 720 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountId"
            label="薪资账套"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择账套" options={accounts} />
          </Form.Item>
          <Form.Item
            name="baseSalary"
            label="月基本工资"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item name="allowanceBase" label="津贴补贴基数">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item name="socialSecurityBase" label="社保缴费基数">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item name="housingFundBase" label="公积金缴费基数">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item name="performanceBase" label="绩效工资基数">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item
            name="effectiveDate"
            label="生效日期"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="变更备注">
            <Input.TextArea rows={3} placeholder="请输入调薪原因或备注" />
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default EmployeeSalaryEdit;
