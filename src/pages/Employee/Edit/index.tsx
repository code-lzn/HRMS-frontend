import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { getDetailUsingGet, listEmployeesUsingGet, updateEmployeeUsingPut } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { listAccountsUsingGet } from '@/api/salaryManageController';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, message, Space, Spin, Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useModel, useParams } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import { extractData, extractNested, getErrorMessage } from '@/utils/apiHelper';
import { buildTreeSelectData } from '@/utils/treeUtils';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import PersonalInfoSection from '@/pages/Employee/components/sections/PersonalInfoSection';
import WorkInfoSection from '@/pages/Employee/components/sections/WorkInfoSection';
import SalaryContractSection from '@/pages/Employee/components/sections/SalaryContractSection';

/** 从详情对象中安全取值 */
const pickVal = (obj: any, flatKey: string, section?: string, nestedKey?: string): any => {
  if (!obj) return undefined;
  if (section && nestedKey && obj[section]?.[nestedKey] !== undefined) return obj[section][nestedKey];
  return obj[flatKey];
};

const EmployeeEditPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const params = useParams<{ id: string }>();
  const employeeId = Number(params.id);

  const canEditAll = hasPermission(currentUser, 'employee:edit');

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: number; label: string }[]>([]);
  const [salaryAccounts, setSalaryAccounts] = useState<{ value: number; label: string }[]>([]);
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [probationRatio, setProbationRatio] = useState(0.8);

  const { handleCancel: handleLeave } = useLeaveConfirm();

  // 直属上级搜索防抖
  const fetchRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const lockedFields = useMemo(() => {
    const processFields = ['departmentId', 'positionId', 'directReportId', 'workLocation', 'hireDate'];
    const alwaysLocked = ['employmentType'];
    const salaryFields = ['contractType', 'contractExpireDate', 'probationRatio', 'accountSetId', 'baseSalary', 'bankAccount', 'bankName'];
    const personalInfoFields = ['employeeName', 'gender', 'email', 'birthday', 'registeredAddress', 'currentAddress'];

    const roleId = Number(currentUser?.roleId) || 5;
    const baseLocked = [...processFields, ...alwaysLocked];

    if (roleId === 1) return baseLocked;  // 管理员
    if (roleId === 2) return baseLocked;  // HR
    return [...baseLocked, ...salaryFields, ...personalInfoFields]; // 其他角色全部锁定
  }, [currentUser]);

  const isLocked = (field: string) => lockedFields.includes(field);

  /** 锁定字段的 label 提示 */
  const renderLockedLabel = (label: string, field: string, tip: string) => {
    if (!isLocked(field)) return label;
    return <span>{label} <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#1677ff', fontSize: 12 }} /></Tooltip></span>;
  };

  /** 锁定字段的 suffix 问号图标 */
  const renderLockedSuffix = (field: string, tip: string) =>
    isLocked(field) ? <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#999' }} /></Tooltip> : undefined;

  // 部门树转 TreeSelect
  const treeSelectData = useMemo(() => buildTreeSelectData(deptTreeData), [deptTreeData]);

  // 监听所属部门变化，筛选对应部门的员工
  const selectedDeptId = Form.useWatch('departmentId', form);

  // 搜索员工（直属上级）
  const searchEmployee = useCallback(async (keyword: string, deptId?: number) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    try {
      const params: any = { page: 1, size: 20 };
      if (keyword) params.keyword = keyword;
      if (deptId) params.departmentIds = [deptId];
      const res = await listEmployeesUsingGet(params);
      if (fetchId === fetchRef.current) {
        const records = extractNested<API.EmployeeVO[]>('records', res, []);
        setEmployeeOptions(records.map((e) => ({ value: e.id, label: `${e.employeeName} (${e.employeeNo})` })));
      }
    } catch (e: unknown) { console.error('pages/Employee/Edit/index.tsx', e);  /* ignore */ }
  }, []);

  const debouncedSearch = useCallback((kw: string) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => searchEmployee(kw, selectedDeptId), 400);
  }, [searchEmployee, selectedDeptId]);

  // 部门变化时重新加载直属上级候选
  useEffect(() => {
    searchEmployee('', selectedDeptId);
  }, [selectedDeptId, searchEmployee]);

  const loadData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [deptRes, posRes, acctRes, detailRes] = await Promise.all([
        getDepartmentTreeUsingGet(),
        listPositionsUsingGet({}),
        listAccountsUsingGet(),
        getDetailUsingGet({ id: employeeId }),
      ]);
      setDeptTreeData(extractData<API.DepartmentTreeVO[]>(deptRes, []));
      setPositionOptions(extractData<API.PositionVO[]>(posRes, []));
      const accts = extractData<API.SalaryAccountVO[]>(acctRes, []);
      setSalaryAccounts(accts.map((a) => ({ value: a.id!, label: a.name ?? '' })));
      const detail: any = extractData(detailRes, null) ?? {};
      if (detail) {
        setEmployeeName(detail.employeeName ?? '');
        setEmployeeNo(detail.employeeNo ?? '');
        const vals: Record<string, any> = {
          employeeName: pickVal(detail, 'employeeName', 'personalInfo', 'employeeName'),
          gender: pickVal(detail, 'gender', 'personalInfo', 'gender'),
          phone: pickVal(detail, 'phone', 'personalInfo', 'phone'),
          email: pickVal(detail, 'email', 'personalInfo', 'email'),
          idCard: pickVal(detail, 'idCard', 'personalInfo', 'idCard'),
          birthday: pickVal(detail, 'birthday', 'personalInfo', 'birthday'),
          registeredAddress: pickVal(detail, 'registeredAddress', 'personalInfo', 'registeredAddress'),
          currentAddress: pickVal(detail, 'currentAddress', 'personalInfo', 'currentAddress'),
          departmentId: pickVal(detail, 'departmentId', 'workInfo', 'departmentId'),
          positionId: pickVal(detail, 'positionId', 'workInfo', 'positionId'),
          directReportId: pickVal(detail, 'directReportId', 'workInfo', 'directReportId'),
          workLocation: pickVal(detail, 'workLocation', 'workInfo', 'workLocation'),
          hireDate: pickVal(detail, 'hireDate'),
          employmentType: pickVal(detail, 'employmentType', 'workInfo', 'employmentType'),
          accountSetId: pickVal(detail, 'accountSetId', 'salaryInfo', 'accountSetId'),
          contractType: pickVal(detail, 'contractType', 'salaryInfo', 'contractType'),
          probationRatio: pickVal(detail, 'probationRatio', 'salaryInfo', 'probationRatio'),
          baseSalary: pickVal(detail, 'baseSalary', 'salaryInfo', 'baseSalary'),
          bankAccount: pickVal(detail, 'bankAccount', 'salaryInfo', 'bankAccount'),
          bankName: pickVal(detail, 'bankName', 'salaryInfo', 'bankName'),
        };
        if (vals.birthday) vals.birthday = dayjs(vals.birthday);
        if (vals.contractExpireDate) vals.contractExpireDate = dayjs(vals.contractExpireDate);
        if (vals.hireDate) vals.hireDate = dayjs(vals.hireDate);
        form.setFieldsValue(vals);
        setInitialValues(vals);
        if (vals.probationRatio !== null && vals.probationRatio !== undefined) setProbationRatio(vals.probationRatio);
      }
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '加载员工信息失败'));
    } finally {
      setLoading(false);
    }
  }, [employeeId, form]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFieldsChange = () => {
    const current = form.getFieldsValue();
    const changed = Object.keys(current).some((key) => {
      const cur = current[key];
      const init = initialValues[key];
      if (cur === undefined && init === undefined) return false;
      if (cur === undefined || init === undefined) return true;
      if (cur?.format && init?.format) return cur.format('YYYY-MM-DD') !== init.format('YYYY-MM-DD');
      return cur !== init;
    });
    setHasChanges(changed);
  };

  const getChangedFields = (): API.EmployeeUpdateRequest => {
    const current = form.getFieldsValue();
    const changed: Record<string, any> = { id: employeeId };
    Object.keys(current).forEach((key) => {
      const cur = current[key];
      const init = initialValues[key];
      let isChanged = false;
      if (cur === undefined && init === undefined) return;
      if (cur === undefined || init === undefined) isChanged = true;
      else if (cur?.format && init?.format) isChanged = cur.format('YYYY-MM-DD') !== init.format('YYYY-MM-DD');
      else isChanged = cur !== init;
      if (isChanged) changed[key] = cur?.format ? cur.format('YYYY-MM-DD') : cur;
    });
    return changed as API.EmployeeUpdateRequest;
  };

  const handleSubmit = async () => {
    try {
      const changedFields = getChangedFields();
      const changedKeys = Object.keys(changedFields).filter((k) => k !== 'id');
      if (changedKeys.length === 0) {
        message.info('没有修改任何内容');
        return;
      }
      // 只校验有变更的字段（校验失败时 antd 会自动高亮错误字段）
      await form.validateFields(changedKeys);
      setSubmitting(true);
      await updateEmployeeUsingPut(changedFields);
      message.success('保存成功');
      setHasChanges(false);
      history.push(`/employee/detail/${employeeId}`);
    } catch (e: unknown) {
      // validateFields 校验失败：antd 已自动高亮错误字段，不覆盖错误提示
      const err = e as Record<string, unknown>;
      if (err?.errorFields) return;
      message.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleLeave(hasChanges, () => history.push(`/employee/detail/${employeeId}`));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  if (!canEditAll) return <div style={{ textAlign: 'center', padding: 64, color: '#999' }}>您没有编辑权限</div>;

  const inputStyle = { borderRadius: 6 };
  const disabledInputStyle = { borderRadius: 6, color: '#999', background: '#f5f5f5' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      {/* ===== 顶部导航 ===== */}
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2', flexShrink: 0 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>
              <span style={{ cursor: 'pointer', color: '#666' }} onClick={() => history.push('/employee/list')}>员工管理</span>
              <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
              <span style={{ color: '#333' }}>{employeeName} 的档案</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#000' }}>{employeeName} 的档案</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>工号 {employeeNo} · 部分字段需通过调岗流程修改</div>
          </div>
          <Space>
            <Button style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>取消</Button>
            <Button type="primary" loading={submitting} style={{ borderRadius: 6, background: '#1677ff' }}
              onClick={handleSubmit}>保存修改</Button>
          </Space>
        </div>
      </Card>

      {/* ===== 表单 ===== */}
      <Form form={form} layout="vertical" onFieldsChange={handleFieldsChange}
        style={{ display: 'flex', gap: 20, flex: 1, overflow: 'hidden' }}>

        {/* ===== 左侧：个人信息 (40%) ===== */}
        <PersonalInfoSection
          form={form}
          mode="edit"
          inputStyle={inputStyle}
          disabledInputStyle={disabledInputStyle}
          isLocked={isLocked}
          lockedLabel={renderLockedLabel}
        />

        {/* ===== 右侧 (60%) ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>
          <WorkInfoSection
            form={form}
            mode="edit"
            treeSelectData={treeSelectData}
            positionOptions={positionOptions}
            employeeOptions={employeeOptions}
            employeeLoading={false}
            onSearchEmployee={debouncedSearch}
            inputStyle={inputStyle}
            disabledInputStyle={disabledInputStyle}
            isLocked={isLocked}
            lockedLabel={renderLockedLabel}
          />

          <SalaryContractSection
            form={form}
            mode="edit"
            salaryAccounts={salaryAccounts}
            probationRatio={probationRatio}
            onProbationRatioChange={setProbationRatio}
            inputStyle={inputStyle}
            disabledInputStyle={disabledInputStyle}
            isLocked={isLocked}
            lockedLabel={renderLockedLabel}
            lockedSuffix={renderLockedSuffix}
          />
        </div>
      </Form>
    </div>
  );
};

export default EmployeeEditPage;
