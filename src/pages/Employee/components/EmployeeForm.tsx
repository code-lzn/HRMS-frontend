import { listEmployeesUsingGet } from '@/api/employeeController';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
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

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

interface EmployeeFormProps {
  mode: 'add' | 'edit';
  form: FormInstance;
  /** 编辑模式下被锁定的字段（不可编辑） */
  lockedFields?: string[];
  /** 部门树原始数据 */
  departmentTreeData: API.DepartmentTreeVO[];
  /** 职位列表 */
  positionOptions: API.PositionVO[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode,
  form,
  lockedFields = [],
  departmentTreeData,
  positionOptions,
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
      const res = await listEmployeesUsingGet({ keyword, page: 1, size: 20 });
      if (fetchId === fetchRef.current) {
        const records = (res as any)?.data?.records ?? [];
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
    } catch {
      // ignore
    } finally {
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

  // 重置员工选项
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const isLocked = (field: string) => mode === 'edit' && lockedFields.includes(field);

  const renderLockedTooltip = (field: string, tip: string, children: React.ReactNode) => {
    if (isLocked(field)) {
      return (
        <Tooltip title={tip}>
          <span style={{ cursor: 'not-allowed' }}>
            <QuestionCircleOutlined style={{ color: '#999', marginRight: 4 }} />
            {children}
          </span>
        </Tooltip>
      );
    }
    return children;
  };

  // 合同类型变化时，控制合同到期日必填
  const contractTypeValue = Form.useWatch('contractType', form);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ========== 个人信息 ========== */}
      <Card title="个人信息" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="employeeName"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }, { max: 32, message: '姓名最长32个字符' }]}
            >
              <Input placeholder="请输入姓名" maxLength={32} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <Radio.Group>
                <Radio value={1}>男</Radio>
                <Radio value={0}>女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
              ]}
            >
              {renderLockedTooltip(
                'phone',
                '如需修改手机号请联系HR',
                <Input placeholder="请输入手机号" maxLength={11} disabled={isLocked('phone')} />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="请输入邮箱" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idCard"
              label="身份证号"
              rules={[
                { required: true, message: '请输入身份证号' },
                { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确' },
              ]}
            >
              {renderLockedTooltip(
                'idCard',
                '如需修改身份证号请联系HR',
                <Input placeholder="请输入身份证号" maxLength={18} disabled={isLocked('idCard')} />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="birthday" label="生日">
              <DatePicker style={{ width: '100%' }} placeholder="请选择生日" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registeredAddress" label="户籍地址" rules={[{ max: 128 }]}>
              <Input placeholder="请输入户籍地址" maxLength={128} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="currentAddress" label="现居住地址" rules={[{ max: 128 }]}>
              <Input placeholder="请输入现居住地址" maxLength={128} />
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
              label="所属部门"
              rules={[{ required: true, message: '请选择所属部门' }]}
            >
              {renderLockedTooltip(
                'departmentId',
                '如需调整请走调岗流程',
                <TreeSelect
                  treeData={treeSelectData}
                  placeholder="请选择部门"
                  allowClear
                  treeDefaultExpandAll={false}
                  disabled={isLocked('departmentId')}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="positionId"
              label="职位"
              rules={[{ required: true, message: '请选择职位' }]}
            >
              {renderLockedTooltip(
                'positionId',
                '如需调整请走调岗流程',
                <Select
                  placeholder="请选择职位"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                  disabled={isLocked('positionId')}
                  options={positionOptions.map((p) => ({ value: p.id, label: p.name }))}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="directReportId" label="直接汇报人">
              {renderLockedTooltip(
                'directReportId',
                '如需调整请走调岗流程',
                <Select
                  showSearch
                  placeholder="请输入姓名搜索"
                  filterOption={false}
                  loading={employeeLoading}
                  onSearch={debouncedFetch}
                  allowClear
                  disabled={isLocked('directReportId')}
                  options={employeeOptions.map((emp) => ({
                    value: emp.id,
                    label: `${emp.employeeName}（${emp.employeeNo}）`,
                  }))}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="workLocation" label="工作地点" rules={[{ max: 64 }]}>
              {renderLockedTooltip(
                'workLocation',
                '如需调整请走调岗流程',
                <Input placeholder="请输入工作地点" maxLength={64} disabled={isLocked('workLocation')} />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hireDate"
              label="入职日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="employmentType"
              label="录用类型"
              rules={[{ required: true, message: '请选择录用类型' }]}
            >
              <Select
                placeholder="请选择录用类型"
                options={[
                  { value: 'FULL_TIME', label: '全职' },
                  { value: 'PART_TIME', label: '兼职' },
                  { value: 'INTERN', label: '实习' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ========== 薪资与合同信息 ========== */}
      <Card title="薪资与合同信息" size="small">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="contractType"
              label="合同类型"
              rules={[{ required: true, message: '请选择合同类型' }]}
            >
              {renderLockedTooltip(
                'contractType',
                '仅HR可编辑',
                <Select
                  placeholder="请选择合同类型"
                  disabled={isLocked('contractType')}
                  options={[
                    { value: 1, label: '固定期限' },
                    { value: 2, label: '无固定期限' },
                    { value: 3, label: '劳务合同' },
                  ]}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contractExpireDate"
              label="合同到期日"
              rules={[
                { required: contractTypeValue === 1, message: '固定期限合同必须填写到期日' },
              ]}
            >
              {renderLockedTooltip(
                'contractExpireDate',
                '仅HR可编辑',
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择合同到期日"
                  disabled={isLocked('contractExpireDate')}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="probationRatio"
              label="试用期待遇比例"
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
              {renderLockedTooltip(
                'probationRatio',
                '仅HR可编辑',
                <InputNumber
                  min={0.8}
                  max={1.0}
                  step={0.05}
                  precision={2}
                  placeholder="0.80 ~ 1.00"
                  style={{ width: '100%' }}
                  disabled={isLocked('probationRatio')}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="baseSalary"
              label="基本工资"
              rules={[
                { required: true, message: '请输入基本工资' },
                { type: 'number', min: 0, message: '基本工资不能为负数' },
              ]}
            >
              {renderLockedTooltip(
                'baseSalary',
                '仅HR可编辑',
                <InputNumber
                  min={0}
                  precision={2}
                  prefix="¥"
                  placeholder="请输入基本工资"
                  style={{ width: '100%' }}
                  disabled={isLocked('baseSalary')}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bankAccount" label="银行账号" rules={[{ max: 32 }]}>
              {renderLockedTooltip(
                'bankAccount',
                '仅HR可编辑',
                <Input placeholder="请输入银行账号" maxLength={32} disabled={isLocked('bankAccount')} />,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bankName" label="开户行" rules={[{ max: 64 }]}>
              {renderLockedTooltip(
                'bankName',
                '仅HR可编辑',
                <Input placeholder="请输入开户行" maxLength={64} disabled={isLocked('bankName')} />,
              )}
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
