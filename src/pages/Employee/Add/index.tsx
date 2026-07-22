import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { addEmployeeUsingPost, listEmployeesUsingGet, listManagerCandidatesUsingGet } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { listEnabledRolesUsingGet } from '@/api/roleController';
import { listAccountsUsingGet } from '@/api/salaryManageController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, message, Space, Spin,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { extractData, extractNested, getErrorMessage } from '@/utils/apiHelper';
import { buildTreeSelectData } from '@/utils/treeUtils';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import PersonalInfoSection from '@/pages/Employee/components/sections/PersonalInfoSection';
import WorkInfoSection from '@/pages/Employee/components/sections/WorkInfoSection';
import SalaryContractSection from '@/pages/Employee/components/sections/SalaryContractSection';
import EmergencyContactSection from '@/pages/Employee/components/sections/EmergencyContactSection';

const inputStyle = { borderRadius: 6 };

const EmployeeAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { handleCancel: handleLeave } = useLeaveConfirm();

  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: number; label: string }[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
  const [salaryAccounts, setSalaryAccounts] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [probationRatio, setProbationRatio] = useState(0.8);

  // 树数据（派生数据）
  const treeSelectData = useMemo(() => buildTreeSelectData(deptTreeData), [deptTreeData]);

  // 加载部门负责人候选（系统管理员/HR专员/部门主管）
  const fetchManagerCandidates = useCallback(async () => {
    setEmployeeLoading(true);
    try {
      const res = await listManagerCandidatesUsingGet();
      const records = extractData<API.Employee[]>(res, []);
      setEmployeeOptions(records.map((e) => ({
        value: e.id!,
        label: `${e.employeeName}（${e.employeeNo}）`,
      })));
    } catch (e: unknown) { console.error('pages/Employee/Add/index.tsx', e); setEmployeeOptions([]); } finally {
      setEmployeeLoading(false);
    }
  }, []);

  // 加载初始数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, acctRes, roleRes] = await Promise.allSettled([
        getDepartmentTreeUsingGet(),
        listPositionsUsingGet({}),
        listAccountsUsingGet(),
        listEnabledRolesUsingGet(),
      ]);

      if (deptRes.status === 'fulfilled') setDeptTreeData(extractData<API.DepartmentTreeVO[]>(deptRes.value, []));
      if (posRes.status === 'fulfilled') setPositionOptions(extractData<API.PositionVO[]>(posRes.value, []));
      if (acctRes.status === 'fulfilled') {
        const accts = extractData<API.SalaryAccountVO[]>(acctRes.value, []);
        setSalaryAccounts(accts.map((a) => ({ value: a.id!, label: a.name ?? '' })));
      }
      if (roleRes.status === 'fulfilled') {
        const roles = extractData<API.RoleVO[]>(roleRes.value, []);
        setRoleOptions(roles.filter((r) => r.roleName !== '系统管理员').map((r) => ({ label: r.roleName ?? '', value: r.id! })));
      }
      // 加载部门负责人候选
      fetchManagerCandidates();
    } catch (e: unknown) { console.error('pages/Employee/Add/index.tsx', e);  /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** 手机号唯一性校验 */
  const checkPhoneUnique = useCallback(async (_: any, value: string) => {
    if (!value || value.length < 11) return;
    const res = await listEmployeesUsingGet({ keyword: value, page: 1, size: 1 });
    const records = extractNested<API.EmployeeVO[]>('records', res, []);
    if (records.length > 0) throw new Error('该手机号已被其他员工使用');
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const body: API.EmployeeAddRequest = {
        employeeName: values.employeeName,
        gender: values.gender,
        phone: values.phone,
        email: values.email,
        idCard: values.idCard,
        birthday: values.birthday?.format('YYYY-MM-DD'),
        registeredAddress: values.registeredAddress,
        currentAddress: values.currentAddress,
        departmentId: values.departmentId,
        positionId: values.positionId,
        directReportId: values.directReportId,
        workLocation: values.workLocation,
        hireDate: values.hireDate?.format('YYYY-MM-DD'),
        employmentType: values.employmentType,
        ...(values.roleId != null ? { roleId: values.roleId } : {}),
        accountSetId: values.accountSetId,
        contractType: values.contractType,
        contractExpireDate: values.contractExpireDate?.format('YYYY-MM-DD'),
        probationRatio: values.probationRatio ?? 0.8,
        baseSalary: values.baseSalary,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
      };
      await addEmployeeUsingPost(body);
      setDirty(false);
      message.success('新增员工成功');
      history.push('/employee/list');
    } catch (e: unknown) {
      message.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleLeave(dirty, () => history.push('/employee/list'));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      {/* ===== 顶部导航 ===== */}
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2', flexShrink: 0 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>返回列表</Button>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#000' }}>新增员工</span>
          </Space>
          <Space>
            <Button style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>取消</Button>
            <Button type="primary" loading={submitting} style={{ borderRadius: 6, background: '#1677ff' }} onClick={handleSubmit}>保存</Button>
          </Space>
        </div>
      </Card>

      {/* ===== 表单区域 ===== */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{ probationRatio: 0.8 }}
        onFieldsChange={() => setDirty(true)}
        style={{ display: 'flex', gap: 20, flex: 1, overflow: 'hidden' }}
      >
        {/* ===== 左侧：个人信息 (40%) ===== */}
        <PersonalInfoSection
          form={form}
          mode="add"
          inputStyle={inputStyle}
          checkPhoneUnique={checkPhoneUnique}
        />

        {/* ===== 右侧 (60%) ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>
          <WorkInfoSection
            form={form}
            mode="add"
            treeSelectData={treeSelectData}
            positionOptions={positionOptions}
            roleOptions={roleOptions}
            employeeOptions={employeeOptions}
            employeeLoading={employeeLoading}
            inputStyle={inputStyle}
          />

          <SalaryContractSection
            form={form}
            mode="add"
            salaryAccounts={salaryAccounts}
            probationRatio={probationRatio}
            onProbationRatioChange={setProbationRatio}
            inputStyle={inputStyle}
          />

          <EmergencyContactSection inputStyle={inputStyle} />
        </div>
      </Form>
    </div>
  );
};

export default EmployeeAddPage;
