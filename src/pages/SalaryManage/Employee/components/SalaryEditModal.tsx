import { listAccountsUsingGet } from '@/api/salaryManageController';
import { updateEmployeeSalaryUsingPut } from '@/api/salaryManageController';
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface SalaryEditModalProps {
  open: boolean;
  employeeId: number;
  editRecord?: API.EmployeeSalaryVO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SalaryEditModal: React.FC<SalaryEditModalProps> = ({
  open,
  employeeId,
  editRecord,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<API.SalaryAccountVO[]>([]);

  useEffect(() => {
    if (!open) return;
    // 加载账套列表
    (async () => {
      try {
        const res = await listAccountsUsingGet();
        setAccounts((res as any)?.data ?? []);
      } catch {
        // ignore
      }
    })();
    if (editRecord) {
      form.setFieldsValue({
        accountSetId: editRecord.accountSetId,
        baseSalary: editRecord.baseSalary,
        allowanceBase: editRecord.allowanceBase,
        socialInsuranceBase: editRecord.socialInsuranceBase,
        housingFundBase: editRecord.housingFundBase,
        performanceBase: editRecord.performanceBase,
        probationSalaryRatio: editRecord.probationSalaryRatio,
        effectiveDate: editRecord.effectiveDate ? dayjs(editRecord.effectiveDate) : undefined,
        remark: '',
      });
    } else {
      form.resetFields();
    }
  }, [open, editRecord, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await updateEmployeeSalaryUsingPut(
        { employeeId },
        {
          accountSetId: values.accountSetId,
          baseSalary: values.baseSalary,
          allowanceBase: values.allowanceBase,
          socialInsuranceBase: values.socialInsuranceBase,
          housingFundBase: values.housingFundBase,
          performanceBase: values.performanceBase,
          probationSalaryRatio: values.probationSalaryRatio,
          effectiveDate: values.effectiveDate
            ? dayjs(values.effectiveDate).format('YYYY-MM-DD HH:mm:ss')
            : undefined,
          remark: values.remark,
        },
      );

      message.success('更新薪资档案成功');
      onSuccess();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="编辑员工薪资档案"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="accountSetId" label="适用账套">
          <Select
            placeholder="请选择适用账套"
            options={accounts.map((a) => ({ label: a.name, value: a.id }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="baseSalary"
          label="基本工资"
          rules={[{ required: true, message: '请输入基本工资' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="请输入基本工资"
          />
        </Form.Item>

        <Form.Item name="allowanceBase" label="岗位津贴基数">
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="岗位津贴基数"
          />
        </Form.Item>

        <Form.Item name="performanceBase" label="绩效奖金基数">
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="绩效奖金基数"
          />
        </Form.Item>

        <Form.Item
          name="socialInsuranceBase"
          label="社保缴纳基数"
          rules={[{ required: true, message: '请输入社保缴纳基数' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="社保缴纳基数"
          />
        </Form.Item>

        <Form.Item
          name="housingFundBase"
          label="公积金缴纳基数"
          rules={[{ required: true, message: '请输入公积金缴纳基数' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="公积金缴纳基数"
          />
        </Form.Item>

        <Form.Item name="probationSalaryRatio" label="试用期薪资比例">
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
            placeholder="如 0.8 表示试用期发 80%"
          />
        </Form.Item>

        <Form.Item name="effectiveDate" label="生效日期">
          <DatePicker showTime style={{ width: '100%' }} placeholder="请选择生效日期" />
        </Form.Item>

        <Form.Item name="remark" label="备注" rules={[{ max: 256, message: '最长256个字符' }]}>
          <Input.TextArea placeholder="请输入调薪备注" maxLength={256} rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SalaryEditModal;
