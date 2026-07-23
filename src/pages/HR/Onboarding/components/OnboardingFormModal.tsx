import {
  saveDraft, submitOnboarding, updateOnboarding, submitDraft,
} from '../services/onboarding';
import { getDepartmentTreeUsingGet, getDepartmentDetailUsingGet } from '@/api/departmentController';
import { listPositionsUsingGet } from '@/api/positionController';
import { listEmployeesUsingGet } from '@/api/employeeController';
import type { OnboardingAddRequest, OnboardingVO } from '../types/onboarding';
import {
  Drawer, Form, Input, Select, DatePicker, InputNumber, message, Button,
} from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  editData: OnboardingVO | null;
  onCancel: () => void;
  onOk: () => void;
}

const OnboardingFormModal: React.FC<Props> = ({ open, editData, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deptList, setDeptList] = useState<{ label: string; value: number }[]>([]);
  const [posList, setPosList] = useState<{ label: string; value: number }[]>([]);
  const [employeeList, setEmployeeList] = useState<{ label: string; value: number }[]>([]);
  const [defaultReportId, setDefaultReportId] = useState<number | undefined>();
  const isEdit = !!editData;

  const fetchDeptList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      const data = res?.data ?? [];
      const flatten = (tree: any[]): { label: string; value: number }[] => {
        let result: { label: string; value: number }[] = [];
        tree.forEach((node) => {
          result.push({ label: node.name, value: node.id });
          if (node.children && node.children.length > 0) {
            result = result.concat(flatten(node.children));
          }
        });
        return result;
      };
      setDeptList(flatten(data));
    } catch (e) { console.error('pages/HR/Onboarding/components/OnboardingFormModal.tsx', e); setDeptList([]); }
  };

  const fetchPosList = async () => {
    try {
      const res = await listPositionsUsingGet({});
      const data = res?.data ?? [];
      setPosList(data.map((p: any) => ({ label: p.name, value: p.id })));
    } catch (e) { console.error('pages/HR/Onboarding/components/OnboardingFormModal.tsx', e); setPosList([]); }
  };

  const fetchEmployeeList = async (keyword?: string, deptId?: number) => {
    try {
      const res = await listEmployeesUsingGet({
        keyword,
        departmentIds: deptId ? [deptId] : undefined,
        page: 1,
        size: 50,
      });
      const data = res?.data?.records ?? [];
      setEmployeeList(data.map((e: any) => ({ label: `${e.employeeName} (${e.employeeNo})`, value: e.id })));
    } catch (e) { console.error('pages/HR/Onboarding/components/OnboardingFormModal.tsx', e); setEmployeeList([]); }
  };

  const handleDeptChange = async (deptId: number) => {
    if (!deptId) {
      setDefaultReportId(undefined);
      return;
    }
    try {
      const res = await getDepartmentDetailUsingGet({ id: deptId });
      const managerId = res?.data?.managerId;
      const managerName = res?.data?.managerName;
      if (managerId) {
        setDefaultReportId(managerId);
        form.setFieldValue('directReportId', managerId);
        // 预填充直接汇报人到下拉列表
        setEmployeeList(prev => {
          const exists = prev.find(e => e.value === managerId);
          if (exists) return prev;
          return [{ label: managerName || `负责人(${managerId})`, value: managerId }, ...prev];
        });
      } else {
        setDefaultReportId(undefined);
      }
      fetchEmployeeList(undefined, deptId);
    } catch (e) { console.error('pages/HR/Onboarding/components/OnboardingFormModal.tsx', e); setDefaultReportId(undefined); }
  };

  useEffect(() => {
    if (open) {
      fetchDeptList();
      fetchPosList();
      fetchEmployeeList();
      if (editData) {
        form.setFieldsValue({
          ...editData,
          hireDate: editData.hireDate ? dayjs(editData.hireDate) : null,
          contractExpireDate: editData.contractExpireDate ? dayjs(editData.contractExpireDate) : null,
        });
        if (editData.deptId) handleDeptChange(editData.deptId);
      } else {
        form.resetFields();
        setDefaultReportId(undefined);
      }
    }
  }, [open, editData, form]);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload: OnboardingAddRequest = {
        ...values,
        hireDate: values.hireDate?.format?.('YYYY-MM-DD') ?? values.hireDate,
        contractExpireDate: values.contractExpireDate?.format?.('YYYY-MM-DD') ?? values.contractExpireDate,
      };
      if (isEdit) {
        await updateOnboarding(editData!.id, payload);
        if (submitNow) {
          await submitDraft(editData!.id);
          message.success('已提交审批');
        } else {
          message.success('已保存');
        }
      } else {
        if (submitNow) {
          await submitOnboarding(payload);
          message.success('已提交审批');
        } else {
          await saveDraft(payload);
          message.success('草稿已保存');
        }
      }
      onOk();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message;
      if (msg) message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑入职申请' : '新建入职申请'}
      open={open} onClose={onCancel} width={640} destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          {isEdit ? [
            <Button key="cancel" onClick={onCancel}>取消</Button>,
            <Button key="save" type="primary" loading={loading} onClick={() => handleSubmit(false)} style={{ marginLeft: 8 }}>保存</Button>,
          ] : [
            <Button key="cancel" onClick={onCancel}>取消</Button>,
            <Button key="draft" loading={loading} onClick={() => handleSubmit(false)} style={{ marginLeft: 8 }}>保存草稿</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={() => handleSubmit(true)} style={{ marginLeft: 8 }}>提交审批</Button>,
          ]}
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}
        initialValues={{ probationMonth: 3, probationSalaryRatio: 80, employmentType: 'FULL_TIME' }}>

        <Form.Item name="candidateName" label="姓名"
          rules={[{ required: true, message: '必填' }]}>
          <Input placeholder="候选人姓名" maxLength={64} />
        </Form.Item>

        <Form.Item name="gender" label="性别"
          rules={[{ required: true, message: '必选' }]}>
          <Select options={[
            { label: '男', value: 'MALE' },
            { label: '女', value: 'FEMALE' },
          ]} placeholder="选择性别" />
        </Form.Item>

        <Form.Item name="phone" label="手机号"
          rules={[
            { required: true, message: '必填' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
          <Input placeholder="11位手机号" maxLength={11} />
        </Form.Item>

        <Form.Item name="email" label="邮箱"
          rules={[{ required: true, message: '必填' }, { type: 'email', message: '格式不正确' }]}>
          <Input placeholder="候选人邮箱" />
        </Form.Item>

        <Form.Item name="idCard" label="身份证号"
          rules={[{ required: true, message: '必填' }]}>
          <Input placeholder="身份证号" maxLength={18} />
        </Form.Item>

        <Form.Item name="hireDate" label="预计入职日期"
          rules={[{ required: true, message: '必选' }]}>
          <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
        </Form.Item>

        <Form.Item name="deptId" label="所属部门"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择部门" showSearch
            optionFilterProp="label" options={deptList}
            onChange={handleDeptChange}
          />
        </Form.Item>

        <Form.Item name="positionId" label="职位"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择职位" showSearch
            optionFilterProp="label" options={posList}
          />
        </Form.Item>

        <Form.Item name="employmentType" label="录用类型"
          rules={[{ required: true, message: '必选' }]}>
          <Select options={[
            { label: '全职', value: 'FULL_TIME' },
            { label: '兼职', value: 'PART_TIME' },
            { label: '实习', value: 'INTERN' },
          ]} placeholder="选择录用类型" />
        </Form.Item>

        <Form.Item name="probationMonth" label="试用期(月)"
          rules={[{ required: true, message: '必填' }]}>
          <InputNumber min={0} max={12} style={{ width: '100%' }} placeholder="默认3个月" />
        </Form.Item>

        <Form.Item name="probationSalaryRatio" label="试用期薪资比例(%)"
          rules={[{ required: true, message: '必填' }]}>
          <InputNumber min={0} max={100} style={{ width: '100%' }}
            placeholder="默认80%" formatter={(v) => `${v}%`} />
        </Form.Item>

        <Form.Item name="directReportId" label="直接汇报人"
          rules={[{ required: true, message: '请选择直接汇报人' }]}>
          <Select placeholder="默认部门负责人，可修改" showSearch
            optionFilterProp="label" options={employeeList}
            allowClear
          />
        </Form.Item>

        <Form.Item name="contractType" label="合同类型">
          <Select options={[
            { label: '固定期限', value: 1 },
            { label: '无固定期限', value: 2 },
            { label: '实习', value: 3 },
          ]} />
        </Form.Item>

        <Form.Item name="contractExpireDate" label="合同到期日">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="baseSalary" label="基本工资">
          <InputNumber min={0} step={100} style={{ width: '100%' }}
            prefix="¥" placeholder="约定基本工资" />
        </Form.Item>

        <Form.Item name="socialInsuranceBase" label="社保基数">
          <InputNumber min={0} step={100} style={{ width: '100%' }} prefix="¥" />
        </Form.Item>

        <Form.Item name="housingFundBase" label="公积金基数">
          <InputNumber min={0} step={100} style={{ width: '100%' }} prefix="¥" />
        </Form.Item>

        <Form.Item name="bankAccount" label="工资卡账号">
          <Input placeholder="银行卡号" maxLength={32} />
        </Form.Item>

        <Form.Item name="bankName" label="开户行">
          <Input placeholder="开户行名称" maxLength={128} />
        </Form.Item>

        <Form.Item name="emergencyContactName" label="紧急联系人">
          <Input placeholder="姓名" maxLength={64} />
        </Form.Item>

        <Form.Item name="emergencyContactPhone" label="紧急联系电话">
          <Input placeholder="手机号" maxLength={20} />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default OnboardingFormModal;
