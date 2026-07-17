import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { addEmployeeUsingPost, listEmployeesUsingGet } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { listEnabledRolesUsingGet } from '@/api/roleController';
import { listAccountsUsingGet } from '@/api/salaryManageController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Slider,
  Space,
  Spin,
  TreeSelect,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history } from '@umijs/max';

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

const EmployeeAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: number; label: string }[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
  const [salaryAccounts, setSalaryAccounts] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [probationRatio, setProbationRatio] = useState(0.8);

  const fetchRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // 部门树转 TreeSelect
  const treeSelectData = useCallback(() => {
    const build = (nodes: API.DepartmentTreeVO[]): any[] =>
      nodes.map((n) => ({ key: n.id!, value: n.id!, title: n.name, children: n.children?.length ? build(n.children) : [] }));
    return build(deptTreeData);
  }, [deptTreeData]);

  // 搜索员工（直属上级）
  const searchEmployee = useCallback(async (keyword: string) => {
    if (!keyword) return;
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    try {
      const res = await listEmployeesUsingGet({ keyword, page: 1, size: 20 });
      if (fetchId === fetchRef.current) {
        const records = (res as any)?.data?.records ?? [];
        setEmployeeOptions(records.map((e: any) => ({ value: e.id, label: `${e.employeeName} (${e.employeeNo})` })));
      }
    } catch { /* ignore */ }
  }, []);

  const debouncedSearch = useCallback((kw: string) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => searchEmployee(kw), 400);
  }, [searchEmployee]);

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

      if (deptRes.status === 'fulfilled') setDeptTreeData((deptRes.value as any)?.data ?? []);
      if (posRes.status === 'fulfilled') setPositionOptions((posRes.value as any)?.data ?? []);
      if (acctRes.status === 'fulfilled') {
        const accts: API.SalaryAccountVO[] = (acctRes.value as any)?.data ?? [];
        setSalaryAccounts(accts.map((a) => ({ value: a.id!, label: a.name ?? '' })));
      }
      if (roleRes.status === 'fulfilled') {
        const roles: API.RoleVO[] = (roleRes.value as any)?.data ?? [];
        setRoleOptions(roles.filter((r) => r.roleName !== '系统管理员').map((r) => ({ label: r.roleName ?? '', value: r.id! })));
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** 手机号唯一性校验 */
  const checkPhoneUnique = useCallback(async (_: any, value: string) => {
    if (!value || value.length < 11) return;
    const res = await listEmployeesUsingGet({ keyword: value, page: 1, size: 1 });
    const records = (res as any)?.data?.records ?? [];
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
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (dirty) {
      Modal.confirm({
        title: '未保存的更改将丢失', content: '确定要离开吗？已填写的信息将不会保存。',
        okText: '确定离开', cancelText: '继续填写', okType: 'danger',
        onOk: () => history.push('/employee/list'),
      });
    } else {
      history.push('/employee/list');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;

  const inputStyle = { borderRadius: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa' }}>
      {/* ===== 顶部导航 ===== */}
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2' }} styles={{ body: { padding: '16px 20px' } }}>
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
        style={{ display: 'flex', gap: 20 }}
      >
        {/* ===== 左侧：个人信息 (40%) ===== */}
        <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>个人信息</span>}
          style={{ width: '40%', borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
          styles={{ body: { padding: 20 } }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {/* 姓名 + 性别 */}
            <Form.Item name="employeeName" label={<span style={{ fontSize: 13, color: '#333' }}>姓名 <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: '请输入姓名' }, { max: 32 }]}>
              <Input placeholder="请输入姓名" maxLength={32} style={inputStyle} />
            </Form.Item>
            <Form.Item name="gender" label={<span style={{ fontSize: 13, color: '#333' }}>性别 <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: '请选择性别' }]}>
              <Radio.Group>
                <Radio value={1}>男</Radio>
                <Radio value={0}>女</Radio>
              </Radio.Group>
            </Form.Item>

            {/* 手机号 */}
            <Form.Item name="phone" label={<span style={{ fontSize: 13, color: '#333' }}>手机号 <span style={{ color: '#ff4d4f' }}>*</span></span>}
              style={{ gridColumn: '1 / -1' }}
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                { validator: checkPhoneUnique, validateTrigger: 'onBlur' },
              ]}>
              <Input placeholder="请输入手机号" maxLength={11} style={inputStyle} />
            </Form.Item>

            {/* 邮箱 */}
            <Form.Item name="email" label={<span style={{ fontSize: 13, color: '#333' }}>邮箱</span>}
              style={{ gridColumn: '1 / -1' }}
              rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
              <Input placeholder="请输入邮箱" style={inputStyle} />
            </Form.Item>

            {/* 身份证号 */}
            <Form.Item name="idCard" label={<span style={{ fontSize: 13, color: '#333' }}>身份证号 <span style={{ color: '#ff4d4f' }}>*</span></span>}
              style={{ gridColumn: '1 / -1' }}
              rules={[
                { required: true, message: '请输入身份证号' },
                { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确' },
              ]}>
              <Input placeholder="请输入身份证号" maxLength={18} style={inputStyle} />
            </Form.Item>

            {/* 生日 */}
            <Form.Item name="birthday" label={<span style={{ fontSize: 13, color: '#333' }}>生日</span>}
              style={{ gridColumn: '1 / -1' }}>
              <DatePicker style={{ width: '100%', ...inputStyle }} placeholder="请选择生日" />
            </Form.Item>

            {/* 户籍地址 */}
            <Form.Item name="registeredAddress" label={<span style={{ fontSize: 13, color: '#333' }}>户籍地址</span>}
              style={{ gridColumn: '1 / -1' }} rules={[{ max: 128 }]}>
              <Input placeholder="请输入户籍地址" maxLength={128} style={inputStyle} />
            </Form.Item>

            {/* 现居住地址 */}
            <Form.Item name="currentAddress" label={<span style={{ fontSize: 13, color: '#333' }}>现居住地址</span>}
              style={{ gridColumn: '1 / -1' }} rules={[{ max: 128 }]}>
              <Input placeholder="请输入现居住地址" maxLength={128} style={inputStyle} />
            </Form.Item>
          </div>
        </Card>

        {/* ===== 右侧 (60%) ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ===== 工作信息 ===== */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>工作信息</span>}
            style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {/* 所属部门 + 职位 */}
              <Form.Item name="departmentId" label={<span style={{ fontSize: 13, color: '#333' }}>所属部门 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请选择所属部门' }]}>
                <TreeSelect treeData={treeSelectData()} placeholder="请选择部门" allowClear style={inputStyle} />
              </Form.Item>
              <Form.Item name="positionId" label={<span style={{ fontSize: 13, color: '#333' }}>职位 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请选择职位' }]}>
                <Select placeholder="请选择职位" allowClear showSearch
                  filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
                  options={positionOptions.map((p) => ({ value: p.id, label: p.name }))} style={inputStyle} />
              </Form.Item>

              {/* 身份 + 直属上级 */}
              {roleOptions.length > 0 && (
                <Form.Item name="roleId" label={<span style={{ fontSize: 13, color: '#333' }}>身份 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                  rules={[{ required: true, message: '请选择身份' }]} tooltip="新增员工的系统角色权限">
                  <Select placeholder="请选择身份" options={roleOptions} style={inputStyle} />
                </Form.Item>
              )}
              <Form.Item name="directReportId" label={<span style={{ fontSize: 13, color: '#333' }}>直属上级</span>}>
                <Select placeholder="请输入姓名搜索" showSearch allowClear filterOption={false}
                  onSearch={debouncedSearch}
                  options={employeeOptions} style={inputStyle} />
              </Form.Item>

              {/* 工作地点 + 入职日期 */}
              <Form.Item name="workLocation" label={<span style={{ fontSize: 13, color: '#333' }}>工作地点</span>} rules={[{ max: 64 }]}>
                <Input placeholder="请输入工作地点" maxLength={64} style={inputStyle} />
              </Form.Item>
              <Form.Item name="hireDate" label={<span style={{ fontSize: 13, color: '#333' }}>入职日期 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请选择入职日期' }]}>
                <DatePicker style={{ width: '100%', ...inputStyle }} placeholder="请选择入职日期" />
              </Form.Item>

              {/* 录用类型 */}
              <Form.Item name="employmentType" label={<span style={{ fontSize: 13, color: '#333' }}>录用类型 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请选择录用类型' }]}>
                <Select placeholder="请选择录用类型" options={EMPLOYMENT_TYPE_OPTIONS} style={inputStyle} />
              </Form.Item>
            </div>
          </Card>

          {/* ===== 薪资与合同信息 ===== */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>薪资与合同信息</span>}
            style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {/* 合同类型 + 合同到期日 */}
              <Form.Item name="contractType" label={<span style={{ fontSize: 13, color: '#333' }}>合同类型 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请选择合同类型' }]}>
                <Select placeholder="请选择合同类型" options={CONTRACT_OPTIONS} style={inputStyle} />
              </Form.Item>
              <Form.Item name="contractExpireDate" label={<span style={{ fontSize: 13, color: '#333' }}>合同到期日</span>}
                dependencies={['contractType']}
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('contractType') === 1,
                    message: '固定期限合同请选择到期日',
                  }),
                ]}>
                <DatePicker style={{ width: '100%', ...inputStyle }} placeholder="请选择合同到期日" />
              </Form.Item>

              {/* 试用期待遇比例 - Slider */}
              <Form.Item name="probationRatio" label={<span style={{ fontSize: 13, color: '#333' }}>试用期待遇比例 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请设置试用期待遇比例' }]}
                style={{ gridColumn: '1 / -1' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Slider min={0.8} max={1} step={0.05}
                      value={form.getFieldValue('probationRatio') ?? 0.8}
                      onChange={(val) => { form.setFieldValue('probationRatio', val); setProbationRatio(val); }}
                      style={{ flex: 1 }}
                      tooltip={{ formatter: (v) => `${((v ?? 0.8) * 100).toFixed(0)}%` }}
                    />
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', minWidth: 52, textAlign: 'right' }}>
                      {((form.getFieldValue('probationRatio') ?? 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>范围 80% ~ 100%</div>
                </div>
              </Form.Item>

              {/* 薪资账套 + 基本工资 */}
              <Form.Item name="accountSetId" label={<span style={{ fontSize: 13, color: '#333' }}>薪资账套</span>}>
                <Select placeholder="请选择薪资账套" allowClear
                  options={salaryAccounts} style={inputStyle} />
              </Form.Item>
              <Form.Item name="baseSalary" label={<span style={{ fontSize: 13, color: '#333' }}>基本工资 <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: '请输入基本工资' }, { type: 'number', min: 0 }]}>
                <InputNumber min={0} precision={2} prefix="¥" placeholder="0.00"
                  style={{ width: '100%', ...inputStyle }} />
              </Form.Item>
              <Form.Item name="bankAccount" label={<span style={{ fontSize: 13, color: '#333' }}>银行账号</span>} rules={[{ max: 32 }]}>
                <Input placeholder="请输入银行账号" maxLength={32} style={inputStyle} />
              </Form.Item>

              {/* 开户行 */}
              <Form.Item name="bankName" label={<span style={{ fontSize: 13, color: '#333' }}>开户行</span>} rules={[{ max: 64 }]}>
                <Input placeholder="请输入开户行" maxLength={64} style={inputStyle} />
              </Form.Item>
            </div>
          </Card>

          {/* ===== 紧急联系人 ===== */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>紧急联系人</span>}
            style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name="emergencyContactName" label={<span style={{ fontSize: 13, color: '#333' }}>联系人姓名</span>} rules={[{ max: 32 }]}>
                <Input placeholder="请输入联系人姓名" maxLength={32} style={inputStyle} />
              </Form.Item>
              <Form.Item name="emergencyContactPhone" label={<span style={{ fontSize: 13, color: '#333' }}>联系人电话</span>}
                rules={[{ pattern: /^1[3-9]\d{9}$/, message: '电话格式不正确' }]}>
                <Input placeholder="请输入联系人电话" maxLength={11} style={inputStyle} />
              </Form.Item>
            </div>
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default EmployeeAddPage;
