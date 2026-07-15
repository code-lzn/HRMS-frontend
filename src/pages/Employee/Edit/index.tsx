import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { getDetailUsingGet, updateEmployeeUsingPut } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { history, useParams } from '@umijs/max';
import EmployeeForm from '../components/EmployeeForm';
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

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // 数据源
  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);

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

      const detail: API.EmployeeDetailVO = (detailRes as any)?.data;
      if (detail) {
        const vals: Record<string, any> = {
          employeeName: detail.employeeName,
          gender: detail.gender,
          phone: detail.phone,
          email: detail.email,
          idCard: detail.idCard,
          birthday: detail.birthday ? dayjs(detail.birthday) : undefined,
          registeredAddress: detail.registeredAddress,
          currentAddress: detail.currentAddress,
          departmentId: detail.departmentId,
          positionId: detail.positionId,
          directReportId: detail.directReportId,
          workLocation: detail.workLocation,
          hireDate: detail.hireDate ? dayjs(detail.hireDate) : undefined,
          employmentType: detail.employmentType,
          contractType: detail.contractType,
          contractExpireDate: detail.contractExpireDate ? dayjs(detail.contractExpireDate) : undefined,
          probationRatio: detail.probationRatio,
          baseSalary: detail.baseSalary,
          bankAccount: detail.bankAccount,
          bankName: detail.bankName,
          emergencyContactName: detail.emergencyContactName,
          emergencyContactPhone: detail.emergencyContactPhone,
        };
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
          lockedFields={DEFAULT_LOCKED_FIELDS}
          departmentTreeData={deptTreeData}
          positionOptions={positionOptions}
        />
      </Form>
    </div>
  );
};

export default EmployeeEditPage;
