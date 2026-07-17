import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { getDetailUsingGet, listEmployeesUsingGet, updateEmployeeUsingPut } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { listAccountsUsingGet } from '@/api/salaryManageController';
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Slider,
  Space,
  Spin,
  Tooltip,
  TreeSelect,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useModel, useParams } from '@umijs/max';
import { hasPermission } from '@/utils/permission';

const CONTRACT_OPTIONS = [
  { value: 1, label: '固定期限' },
  { value: 2, label: '无固定期限' },
  { value: 3, label: '劳务合同' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: '全职' },
  { value: 'PART_TIME', label: '兼职' },
  { value: 'INTERN', label: '实习' },
];

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

  // 直属上级搜索防抖
  const fetchRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const lockedFields = useMemo(() => {
    const processFields = ['departmentId', 'positionId', 'directReportId', 'workLocation', 'hireDate'];
    const alwaysLocked = ['employmentType', 'phone', 'idCard'];
    const salaryFields = ['contractType', 'contractExpireDate', 'probationRatio', 'accountSetId', 'baseSalary', 'bankAccount', 'bankName'];
    const roleId = Number(currentUser?.roleId) || 5;
    // 所有角色：工作信息 + 手机号 + 身份证号 不可编辑
    const baseLocked = [...processFields, ...alwaysLocked];
    if (roleId === 1) return baseLocked;               // 管理员
    if (roleId === 2) return baseLocked;               // HR
    const personalInfoFields = ['employeeName', 'gender', 'email', 'birthday', 'registeredAddress', 'currentAddress'];
    return [...baseLocked, ...salaryFields, ...personalInfoFields];
  }, [currentUser]);

  const isLocked = (field: string) => lockedFields.includes(field);

  const lockedLabel = (label: string, field: string, tip: string) => {
    if (!isLocked(field)) return label;
    return <span>{label} <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#1677ff', fontSize: 12 }} /></Tooltip></span>;
  };

  // 部门树转 TreeSelect
  const treeSelectData = useMemo(() => {
    const build = (nodes: API.DepartmentTreeVO[]): any[] =>
      nodes.map((n) => ({ key: n.id!, value: n.id!, title: n.name, children: n.children?.length ? build(n.children) : [] }));
    return build(deptTreeData);
  }, [deptTreeData]);

  // 搜索员工（直属上级）
  const searchEmployee = useCallback(async (keyword: string) => {
    if (!keyword) { setEmployeeOptions([]); return; }
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    try {
      const res = await listEmployeesUsingGet({ keyword, page: 1, size: 20 });
      if (fetchId === fetchRef.current) {
        const data = (res as any)?.data?.records ?? [];
        setEmployeeOptions(data.map((e: any) => ({ value: e.id, label: `${e.employeeName} (${e.employeeNo})` })));
      }
    } catch { /* ignore */ }
  }, []);

  const debouncedSearch = useCallback((kw: string) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => searchEmployee(kw), 400);
  }, [searchEmployee]);

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
      setDeptTreeData((deptRes as any)?.data ?? []);
      setPositionOptions((posRes as any)?.data ?? []);
      const accts: API.SalaryAccountVO[] = (acctRes as any)?.data ?? [];
      setSalaryAccounts(accts.map((a) => ({ value: a.id!, label: a.name ?? '' })));
      const detail: any = (detailRes as any)?.data;
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
      }
    } catch (e: any) {
      message.error(e.message ?? '加载员工信息失败');
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
      await form.validateFields();
      setSubmitting(true);
      const changedFields = getChangedFields();
      if (Object.keys(changedFields).length <= 1) {
        message.info('没有修改任何内容');
        return;
      }
      await updateEmployeeUsingPut(changedFields);
      message.success('保存成功');
      setHasChanges(false);
      history.push(`/employee/detail/${employeeId}`);
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: '未保存的更改将丢失',
        content: '确定要离开吗？未保存的更改将丢失。',
        okText: '确定离开', cancelText: '继续编辑', okType: 'danger',
        onOk: () => history.push(`/employee/detail/${employeeId}`),
      });
    } else {
      history.push(`/employee/detail/${employeeId}`);
    }
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

        {/* ===== 左侧：个人信息 (40%) — 独立滚动 ===== */}
        <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>个人信息</span>}
          style={{ width: '40%', borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', height: '100%', overflow: 'auto' }}
          styles={{ body: { padding: 20 } }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="employeeName" label={lockedLabel('姓名', 'employeeName', '基本信息不可修改')}
              rules={[{ required: true, message: '请输入姓名' }, { max: 32 }]}>
              <Input placeholder="请输入姓名" maxLength={32} style={isLocked('employeeName') ? disabledInputStyle : inputStyle} disabled={isLocked('employeeName')} />
            </Form.Item>
            <Form.Item name="gender" label={lockedLabel('性别', 'gender', '基本信息不可修改')}
              rules={[{ required: true, message: '请选择性别' }]}>
              <Select placeholder="请选择" disabled={isLocked('gender')}
                options={[{ value: 1, label: '男' }, { value: 0, label: '女' }]} style={inputStyle} />
            </Form.Item>
            <Form.Item name="phone" label={lockedLabel('手机号', 'phone', '需调岗流程修改')}
              rules={isLocked('phone') ? [] : [{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}>
              <Input placeholder="请输入手机号" maxLength={11} style={isLocked('phone') ? disabledInputStyle : inputStyle} disabled={isLocked('phone')} />
            </Form.Item>
            <Form.Item name="email" label={lockedLabel('邮箱', 'email', '基本信息不可修改')}
              rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
              <Input placeholder="请输入邮箱" style={isLocked('email') ? disabledInputStyle : inputStyle} disabled={isLocked('email')} />
            </Form.Item>
            <Form.Item name="idCard" label={lockedLabel('身份证号', 'idCard', '需调岗流程修改')}
              rules={isLocked('idCard') ? [] : [{ required: true, message: '请输入身份证号' }, { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确' }]}>
              <Input placeholder="请输入身份证号" maxLength={18} style={isLocked('idCard') ? disabledInputStyle : inputStyle} disabled={isLocked('idCard')} />
            </Form.Item>
            <Form.Item name="birthday" label={lockedLabel('生日', 'birthday', '基本信息不可修改')}>
              <DatePicker style={{ width: '100%', ...inputStyle }} disabled={isLocked('birthday')} />
            </Form.Item>
            <Form.Item name="registeredAddress" label={lockedLabel('户籍地址', 'registeredAddress', '基本信息不可修改')}
              style={{ gridColumn: '1 / -1' }}>
              <Input placeholder="请输入户籍地址" maxLength={128} style={isLocked('registeredAddress') ? disabledInputStyle : inputStyle} disabled={isLocked('registeredAddress')} />
            </Form.Item>
            <Form.Item name="currentAddress" label={lockedLabel('现居住地址', 'currentAddress', '基本信息不可修改')}
              style={{ gridColumn: '1 / -1' }}>
              <Input placeholder="请输入现居住地址" maxLength={128} style={isLocked('currentAddress') ? disabledInputStyle : inputStyle} disabled={isLocked('currentAddress')} />
            </Form.Item>
          </div>
        </Card>

        {/* ===== 右侧 (60%) — 独立滚动 ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>
          {/* ===== 工作信息 ===== */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>工作信息</span>}
            style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name="departmentId" label={<span>{lockedLabel('所属部门', 'departmentId', '需调岗流程')} {isLocked('departmentId') && <Tag style={{ fontSize: 11, color: '#999', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 4, marginLeft: 4 }}>需调岗流程</Tag>}</span>}
                rules={[{ required: true, message: '请选择部门' }]}>
                <TreeSelect treeData={treeSelectData} placeholder="请选择部门"
                  style={inputStyle} disabled={isLocked('departmentId')} />
              </Form.Item>
              <Form.Item name="positionId" label={<span>{lockedLabel('职位', 'positionId', '需调岗流程')} {isLocked('positionId') && <Tag style={{ fontSize: 11, color: '#999', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 4, marginLeft: 4 }}>需调岗流程</Tag>}</span>}
                rules={[{ required: true, message: '请选择职位' }]}>
                <Select placeholder="请选择职位" showSearch
                  filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
                  options={positionOptions.map((p) => ({ value: p.id, label: p.name }))}
                  style={inputStyle} disabled={isLocked('positionId')} />
              </Form.Item>
              <Form.Item name="directReportId" label={<span>{lockedLabel('直接汇报人', 'directReportId', '需调岗流程')} {isLocked('directReportId') && <Tag style={{ fontSize: 11, color: '#999', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 4, marginLeft: 4 }}>需调岗流程</Tag>}</span>}>
                <Select placeholder="请搜索并选择" showSearch allowClear filterOption={false}
                  onSearch={debouncedSearch}
                  options={employeeOptions} style={inputStyle} disabled={isLocked('directReportId')} />
              </Form.Item>
              <Form.Item name="workLocation" label={<span>{lockedLabel('工作地点', 'workLocation', '需调岗流程')} {isLocked('workLocation') && <Tag style={{ fontSize: 11, color: '#999', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 4, marginLeft: 4 }}>需调岗流程</Tag>}</span>}
                rules={[{ max: 64 }]}>
                <Input placeholder="请输入工作地点" maxLength={64} style={isLocked('workLocation') ? disabledInputStyle : inputStyle} disabled={isLocked('workLocation')} />
              </Form.Item>
              <Form.Item name="hireDate" label="入职日期"
                rules={[{ required: true, message: '请选择入职日期' }]}>
                <DatePicker style={{ width: '100%', ...inputStyle }} />
              </Form.Item>
              <Form.Item name="employmentType" label={lockedLabel('录用类型', 'employmentType', '录用类型不可修改')}
                rules={[{ required: true, message: '请选择录用类型' }]}>
                <Select placeholder="请选择录用类型" options={EMPLOYMENT_TYPE_OPTIONS}
                  style={inputStyle} disabled={isLocked('employmentType')} />
              </Form.Item>
            </div>
            {/* 黄色警告 */}
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f', fontSize: 12, color: '#ad8b00', display: 'flex', alignItems: 'center', gap: 6 }}>
              <WarningOutlined />
              <span>工作信息变更需通过调岗流程，修改后提交审批方可生效。</span>
            </div>
          </Card>

          {/* ===== 薪资与合同 ===== */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>薪资与合同</span>}
            style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name="contractType" label={lockedLabel('合同类型', 'contractType', '如需修改请联系HR')}
                rules={[{ required: true, message: '请选择合同类型' }]}>
                <Select placeholder="请选择合同类型" options={CONTRACT_OPTIONS}
                  style={inputStyle} disabled={isLocked('contractType')} />
              </Form.Item>
              <Form.Item name="contractExpireDate" label={lockedLabel('合同到期日', 'contractExpireDate', '如需修改请联系HR')}
                dependencies={['contractType']}
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('contractType') === 1,
                    message: '固定期限合同请选择到期日',
                  }),
                ]}>
                <DatePicker style={{ width: '100%', ...inputStyle }} disabled={isLocked('contractExpireDate')} />
              </Form.Item>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>试用期待遇比例 <span style={{ color: '#ff4d4f' }}>*</span></div>
                <Form.Item name="probationRatio" rules={[{ required: true, message: '请设置试用期待遇比例' }]}
                  hidden>
                  <Input />
                </Form.Item>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Slider min={0.6} max={1} step={0.05}
                    defaultValue={0.8}
                    onChange={(val) => { form.setFieldValue('probationRatio', val); }}
                    style={{ flex: 1 }}
                    tooltip={{ formatter: (v) => `${((v ?? 0.8) * 100).toFixed(0)}%` }}
                  />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1677ff', minWidth: 48, textAlign: 'right' }}>
                    {(form.getFieldValue('probationRatio') != null ? (form.getFieldValue('probationRatio') * 100).toFixed(0) : '80')}%
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>范围：60% ~ 100%，步长 5%</div>
              </div>
              <Form.Item name="accountSetId" label={lockedLabel('薪资账套', 'accountSetId', '如需修改请联系HR')}>
                <Select placeholder="请选择薪资账套" allowClear
                  options={salaryAccounts} style={inputStyle} disabled={isLocked('accountSetId')} />
              </Form.Item>
              <Form.Item name="baseSalary" label={lockedLabel('基本工资', 'baseSalary', '如需修改请联系HR')}
                rules={[{ required: true, message: '请输入基本工资' }]}>
                <InputNumber min={0} precision={2} prefix="¥" placeholder="0.00"
                  style={{ width: '100%', ...inputStyle }} disabled={isLocked('baseSalary')} />
              </Form.Item>
              <Form.Item name="bankAccount" label={lockedLabel('银行账号', 'bankAccount', '如需修改请联系HR')}
                rules={[{ max: 32 }]}>
                <Input placeholder="请输入银行账号" maxLength={32} style={isLocked('bankAccount') ? disabledInputStyle : inputStyle} disabled={isLocked('bankAccount')} />
              </Form.Item>
              <Form.Item name="bankName" label={lockedLabel('开户行', 'bankName', '如需修改请联系HR')}
                rules={[{ max: 64 }]}>
                <Input placeholder="请输入开户行" maxLength={64} style={isLocked('bankName') ? disabledInputStyle : inputStyle} disabled={isLocked('bankName')} />
              </Form.Item>
            </div>
          </Card>
        </div>
      </Form>
    </div>
  );
};

// Tag helper（避免额外 import）
const Tag: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-block', padding: '0 6px', fontSize: 11, lineHeight: '20px', ...style }}>{children}</span>
);

export default EmployeeEditPage;
