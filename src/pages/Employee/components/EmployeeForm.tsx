import { listEmployeesUsingGet } from '@/api/employeeController';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { buildTreeSelectData } from '@/utils/treeUtils';
import { CONTRACT_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from '@/utils/employeeConstants';
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Tooltip,
  TreeSelect,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { extractData, extractNested, getErrorMessage } from '@/utils/apiHelper';

interface EmployeeFormProps {
  mode: 'add' | 'edit';
  form: FormInstance;
  /** 编辑模式下被锁定的字段（不可编辑） */
  lockedFields?: string[];
  /** 部门树原始数据 */
  departmentTreeData: API.DepartmentTreeVO[];
  /** 职位列表 */
  positionOptions: API.PositionVO[];
  /** 角色选项（新增时选择身份，不包括系统管理员） */
  roleOptions?: { label: string; value: number }[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode,
  form,
  lockedFields = [],
  departmentTreeData,
  positionOptions,
  roleOptions = [],
}) => {
  const [employeeOptions, setEmployeeOptions] = useState<API.EmployeeSimpleVO[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const fetchRef = useRef(0);

  const treeSelectData = useMemo(() => buildTreeSelectData(departmentTreeData), [departmentTreeData]);

  // 搜索员工（汇报人）
  const fetchEmployees = useCallback(async (keyword: string) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    setEmployeeLoading(true);
    try {
      const params: any = { page: 1, size: 20 };
      if (keyword) params.keyword = keyword;
      const res = await listEmployeesUsingGet(params);
      if (fetchId === fetchRef.current) {
        const records = extractNested<API.EmployeeVO[]>('records', res, []);
        setEmployeeOptions((prev) => {
          const currentIds = new Set(records.map((o: API.EmployeeVO) => o.id));
          const existing = prev.filter((o: API.EmployeeSimpleVO) => !currentIds.has(o.id));
          return [...existing, ...records.map((o: API.EmployeeVO) => ({
            id: o.id,
            employeeName: o.employeeName,
            employeeNo: o.employeeNo,
          }))];
        });
      }
    } catch (e: unknown) { console.error('pages/Employee/components/EmployeeForm.tsx', e); } finally {
      setEmployeeLoading(false);
    }
  }, []);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedFetch = useCallback(
    (kw: string) => {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => fetchEmployees(kw), 400);
    },
    [fetchEmployees],
  );

  // 加载初始员工列表（供汇报人选择）
  useEffect(() => {
    fetchEmployees('');
    return () => {
      clearTimeout(debounceTimerRef.current);
    };
  }, [fetchEmployees]);

  const isLocked = (field: string) => mode === 'edit' && lockedFields.includes(field);

  /** 锁定字段的 suffix 问号图标（用于 Input / InputNumber） */
  const lockedSuffix = (field: string, tip: string) => {
    if (!isLocked(field)) return undefined;
    return <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#999' }} /></Tooltip>;
  };

  /** 锁定字段 label 上的问号提示 */
  const lockedLabel = (field: string, label: string, tip: string) => {
    if (!isLocked(field)) return label;
    return (
      <span>
        {label}
        <Tooltip title={tip}>
          <QuestionCircleOutlined style={{ color: '#999', marginLeft: 4, cursor: 'pointer' }} />
        </Tooltip>
      </span>
    );
  };

  // 合同类型变化时，控制合同到期日必填
  const contractTypeValue = Form.useWatch('contractType', form);

  /** 手机号唯一性校验（通过 keyword 搜索是否存在） */
  const checkPhoneUnique = useCallback(async (_: any, value: string) => {
    if (!value || value.length < 11) return;
    // 编辑模式下不校验自己
    if (mode === 'edit') return;
    const res = await listEmployeesUsingGet({ keyword: value, page: 1, size: 1 });
    const records = extractNested<API.EmployeeVO[]>('records', res, []);
    if (records.length > 0) {
      throw new Error('该手机号已被其他员工使用');
    }
  }, [mode]);

  /** 身份证号唯一性校验（通过 keyword 精确搜索，无法完全覆盖，提交时后端兜底） */
  const checkIdCardUnique = useCallback(async (_: any, value: string) => {
    if (!value || value.length < 18) return;
    if (mode === 'edit') return;
    // 后端兜底唯一性校验，前端只做格式提示
  }, [mode]);

  /** 邮箱唯一性校验（后端兜底） */
  const checkEmailUnique = useCallback(async (_: any, value: string) => {
    if (!value) return;
    if (mode === 'edit') return;
    // 后端兜底唯一性校验
  }, [mode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ========== 个人信息 ========== */}
      <Card title="个人信息" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="employeeName"
              label={lockedLabel('employeeName', '姓名', '仅管理员和HR可编辑')}
              rules={[{ required: true, message: '请输入姓名' }, { max: 32, message: '姓名最长32个字符' }]}
            >
              <Input placeholder="请输入姓名" maxLength={32} disabled={isLocked('employeeName')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label={lockedLabel('gender', '性别', '仅管理员和HR可编辑')} rules={[{ required: true, message: '请选择性别' }]}>
              <Radio.Group disabled={isLocked('gender')}>
                <Radio value={1}>男</Radio>
                <Radio value={0}>女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label={lockedLabel('phone', '手机号', '如需修改手机号请联系HR')}
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                { validator: checkPhoneUnique, validateTrigger: 'onBlur' },
              ]}
            >
              <Input placeholder="请输入手机号" maxLength={11} disabled={isLocked('phone')} suffix={lockedSuffix('phone', '如需修改手机号请联系HR')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="email"
              label={lockedLabel('email', '邮箱', '仅管理员和HR可编辑')}
              rules={[
                { type: 'email', message: '邮箱格式不正确' },
                { validator: checkEmailUnique, validateTrigger: 'onBlur' },
              ]}
            >
              <Input placeholder="请输入邮箱" maxLength={64} disabled={isLocked('email')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idCard"
              label={lockedLabel('idCard', '身份证号', '如需修改身份证号请联系HR')}
              rules={[
                { required: true, message: '请输入身份证号' },
                { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确' },
                { validator: checkIdCardUnique, validateTrigger: 'onBlur' },
              ]}
            >
              <Input placeholder="请输入身份证号" maxLength={18} disabled={isLocked('idCard')} suffix={lockedSuffix('idCard', '如需修改身份证号请联系HR')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="birthday" label={lockedLabel('birthday', '生日', '仅管理员和HR可编辑')}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择生日" disabled={isLocked('birthday')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registeredAddress" label={lockedLabel('registeredAddress', '户籍地址', '仅管理员和HR可编辑')} rules={[{ max: 128 }]}>
              <Input placeholder="请输入户籍地址" maxLength={128} disabled={isLocked('registeredAddress')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="currentAddress" label={lockedLabel('currentAddress', '现居住地址', '仅管理员和HR可编辑')} rules={[{ max: 128 }]}>
              <Input placeholder="请输入现居住地址" maxLength={128} disabled={isLocked('currentAddress')} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ========== 工作信息 ========== */}
      <Card title="工作信息" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="departmentId"
              label={lockedLabel('departmentId', '所属部门', '如需调整请走调岗流程')}
              rules={[{ required: true, message: '请选择所属部门' }]}
            >
              <TreeSelect
                treeData={treeSelectData}
                placeholder="请选择部门"
                allowClear
                treeDefaultExpandAll={false}
                disabled={isLocked('departmentId')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="positionId"
              label={lockedLabel('positionId', '职位', '如需调整请走调岗流程')}
              rules={[{ required: true, message: '请选择职位' }]}
            >
              <Select
                placeholder="请选择职位"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                }
                disabled={isLocked('positionId')}
                options={positionOptions.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="directReportId" label={lockedLabel('directReportId', '直属上级', '如需调整请走调岗流程')}>
              <Select
                showSearch
                placeholder="请输入姓名搜索"
                filterOption={false}
                loading={employeeLoading}
                onSearch={debouncedFetch}
                onFocus={() => { if (employeeOptions.length === 0) fetchEmployees(''); }}
                allowClear
                disabled={isLocked('directReportId')}
                options={employeeOptions.map((emp) => ({
                  value: emp.id,
                  label: `${emp.employeeName}（${emp.employeeNo}）`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="workLocation" label={lockedLabel('workLocation', '工作地点', '如需调整请走调岗流程')} rules={[{ max: 64 }]}>
              <Input placeholder="请输入工作地点" maxLength={64} disabled={isLocked('workLocation')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hireDate"
              label="入职日期"
              rules={[{ required: true, message: '请选择入职日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="employmentType"
              label={lockedLabel('employmentType', '录用类型', '录用类型不可修改')}
              rules={[{ required: true, message: '请选择录用类型' }]}
            >
              <Select
                placeholder="请选择录用类型"
                disabled={isLocked('employmentType')}
                options={EMPLOYMENT_TYPE_OPTIONS}
              />
            </Form.Item>
          </Col>
          {mode === 'add' && roleOptions.length > 0 && (
            <Col span={8}>
              <Form.Item
                name="roleId"
                label="身份"
                rules={[{ required: true, message: '请选择身份' }]}
                tooltip="新增员工的系统角色权限"
              >
                <Select
                  placeholder="请选择身份"
                  options={roleOptions}
                />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Card>

      {/* ========== 薪资与合同信息 ========== */}
      <Card title="薪资与合同信息" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="contractType"
              label={lockedLabel('contractType', '合同类型', '仅HR可编辑')}
              rules={[{ required: true, message: '请选择合同类型' }]}
            >
              <Select
                placeholder="请选择合同类型"
                disabled={isLocked('contractType')}
                options={CONTRACT_OPTIONS}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contractExpireDate"
              label={lockedLabel('contractExpireDate', '合同到期日', '仅HR可编辑')}
              rules={[
                { required: contractTypeValue === 1, message: '固定期限合同必须填写到期日' },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择合同到期日"
                disabled={isLocked('contractExpireDate')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="probationRatio"
              label={lockedLabel('probationRatio', '试用期待遇比例', '仅HR可编辑')}
              rules={[
                { required: true, message: '请输入试用期待遇比例' },
                {
                  type: 'number',
                  min: 0.8,
                  max: 1.0,
                  message: '比例范围为 0.8 ~ 1.0',
                },
              ]}
            >
              <InputNumber
                min={0.8}
                max={1.0}
                step={0.05}
                precision={2}
                placeholder="0.80 ~ 1.00"
                style={{ width: '100%' }}
                disabled={isLocked('probationRatio')}
                suffix={lockedSuffix('probationRatio', '仅HR可编辑')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="baseSalary"
              label={lockedLabel('baseSalary', '基本工资', '仅HR可编辑')}
              rules={[
                { required: true, message: '请输入基本工资' },
                { type: 'number', min: 0, message: '基本工资不能为负数' },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                prefix="¥"
                placeholder="请输入基本工资"
                style={{ width: '100%' }}
                disabled={isLocked('baseSalary')}
                suffix={lockedSuffix('baseSalary', '仅HR可编辑')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bankAccount" label={lockedLabel('bankAccount', '银行账号', '仅HR可编辑')} rules={[{ max: 32 }]}>
              <Input placeholder="请输入银行账号" maxLength={32} disabled={isLocked('bankAccount')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bankName" label={lockedLabel('bankName', '开户行', '仅HR可编辑')} rules={[{ max: 64 }]}>
              <Input placeholder="请输入开户行" maxLength={64} disabled={isLocked('bankName')} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ========== 紧急联系人 ========== */}
      <Card title="紧急联系人" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="emergencyContactName" label="联系人姓名" rules={[{ max: 32 }]}>
              <Input placeholder="请输入联系人姓名" maxLength={32} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="emergencyContactPhone"
              label="联系人电话"
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '电话格式不正确' }]}
            >
              <Input placeholder="请输入联系人电话" maxLength={11} />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeForm;
