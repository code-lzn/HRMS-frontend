import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { getDetailUsingGet, updateEmployeeUsingPut } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useModel, useModel, useParams } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import EmployeeForm from '../components/EmployeeForm';
import { hasPermission } from '@/utils/permission';
import dayjs from 'dayjs';

/** 编辑模式下默认被锁定的字段 */
const DEFAULT_LOCKED_FIELDS = [
  'phone',
  'idCard',
  'departmentId',
  'positionId',
  'directReportId',
  'workLocation',
  'contractType',
  'contractExpireDate',
  'probationRatio',
  'baseSalary',
  'bankAccount',
  'bankName',
];

const EmployeeEditPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const employeeId = Number(params.id);

  // 管理员/HR 拥有 employee:edit，所有字段可编辑
  const canEditAll = hasPermission(initialState?.currentUser, 'employee:edit');
  const lockedFields = canEditAll ? [] : RESTRICTED_FIELDS;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // 数据源
  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);

  /** 根据当前用户角色动态生成锁定字段列表 */
  const lockedFields = useMemo(() => {
    // 调岗流程字段（所有人不可直接编辑）
    const processFields = ['departmentId', 'positionId', 'directReportId', 'workLocation'];
    // 录用类型（业务上不可修改）
    const alwaysLocked = ['employmentType'];
    // 需HR协助的字段（身份证/手机号唯一性约束）
    const hrRequiredFields = ['phone', 'idCard'];
    // 薪资合同字段（仅HR/管理员可编辑）
    const salaryFields = ['contractType', 'contractExpireDate', 'probationRatio', 'baseSalary', 'bankAccount', 'bankName'];

    const roleId = Number(currentUser?.roleId) || 5;

    // 系统管理员(1)：仅录用类型不可修改
    if (roleId === 1) return alwaysLocked;
    // HR专员(2)：调岗流程 + 录用类型不可修改
    if (roleId === 2) return [...processFields, ...alwaysLocked];
    // 部门主管(3) / 财务(4) / 普通员工(5)：全部锁定
    const personalInfoFields = ['employeeName', 'gender', 'email', 'birthday', 'registeredAddress', 'currentAddress'];
    return [...processFields, ...alwaysLocked, ...hrRequiredFields, ...salaryFields, ...personalInfoFields];
  }, [currentUser]);

  /** 记录初始值用于对比变更字段 */
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});

  // 加载数据源 + 详情
  const loadData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [deptRes, posRes, detailRes] = await Promise.all([
        getDepartmentTreeUsingGet(),
        listPositionsUsingGet({}),
        getDetailUsingGet({ id: employeeId }),
      ]);
      setDeptTreeData((deptRes as any)?.data ?? []);
      setPositionOptions((posRes as any)?.data ?? []);

      const detail: any = (detailRes as any)?.data;
      if (detail) {
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
          contractType: pickVal(detail, 'contractType', 'salaryInfo', 'contractType'),
          contractExpireDate: pickVal(detail, 'contractExpireDate', 'salaryInfo', 'contractExpireDate'),
          probationRatio: pickVal(detail, 'probationRatio', 'salaryInfo', 'probationRatio'),
          baseSalary: pickVal(detail, 'baseSalary', 'salaryInfo', 'baseSalary'),
          bankAccount: pickVal(detail, 'bankAccount', 'salaryInfo', 'bankAccount'),
          bankName: pickVal(detail, 'bankName', 'salaryInfo', 'bankName'),
          emergencyContactName: pickVal(detail, 'emergencyContactName', 'emergencyContact', 'emergencyContactName'),
          emergencyContactPhone: pickVal(detail, 'emergencyContactPhone', 'emergencyContact', 'emergencyContactPhone'),
        };
        // dayjs 转换
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 监听表单变化
  const handleFieldsChange = () => {
    const current = form.getFieldsValue();
    const changed = Object.keys(current).some((key) => {
      const cur = current[key];
      const init = initialValues[key];
      if (cur === undefined && init === undefined) return false;
      if (cur === undefined || init === undefined) return true;
      // dayjs 对象比较
      if (cur?.format && init?.format) {
        return cur.format('YYYY-MM-DD') !== init.format('YYYY-MM-DD');
      }
      return cur !== init;
    });
    setHasChanges(changed);
  };

  /** 只提交变更字段 */
  const getChangedFields = (): API.EmployeeUpdateRequest => {
    const current = form.getFieldsValue();
    const changed: Record<string, any> = { id: employeeId };
    Object.keys(current).forEach((key) => {
      const cur = current[key];
      const init = initialValues[key];
      let isChanged = false;
      if (cur === undefined && init === undefined) {
        isChanged = false;
      } else if (cur === undefined || init === undefined) {
        isChanged = true;
      } else if (cur?.format && init?.format) {
        isChanged = cur.format('YYYY-MM-DD') !== init.format('YYYY-MM-DD');
      } else {
        isChanged = cur !== init;
      }
      if (isChanged) {
        if (cur?.format) {
          changed[key] = cur.format('YYYY-MM-DD');
        } else {
          changed[key] = cur;
        }
      }
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
        okText: '确定离开',
        cancelText: '继续编辑',
        okType: 'danger',
        onOk: () => history.push(`/employee/detail/${employeeId}`),
      });
    } else {
      history.push(`/employee/detail/${employeeId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部操作栏 */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              返回
            </Button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>编辑员工</span>
          </Space>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </div>
      </Card>

      {/* 表单 */}
      <Form form={form} layout="vertical" onFieldsChange={handleFieldsChange}>
        <EmployeeForm
          mode="edit"
          form={form}
          lockedFields={lockedFields}
          departmentTreeData={deptTreeData}
          positionOptions={positionOptions}
        />
      </Form>
    </div>
  );
};

export default EmployeeEditPage;
