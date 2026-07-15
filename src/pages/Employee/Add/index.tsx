import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { addEmployeeUsingPost } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { listAllRolesUsingGet } from '@/api/roleController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { history } from '@umijs/max';
import EmployeeForm from '../components/EmployeeForm';

const EmployeeAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  // 数据源
  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据源
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, roleRes] = await Promise.all([
        getDepartmentTreeUsingGet(),
        listPositionsUsingGet({}),
        listAllRolesUsingGet(),
      ]);
      setDeptTreeData((deptRes as any)?.data ?? []);
      setPositionOptions((posRes as any)?.data ?? []);
      const roles: API.RoleVO[] = (roleRes as any)?.data ?? [];
      console.log('[Add] role list:', JSON.stringify(roles)); // 调试：查看返回的角色列表
      setRoleOptions(
        roles
          .filter((r) => r.roleName !== '系统管理员')
          .map((r) => ({ label: r.roleName ?? '', value: r.id! })),
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        roleId: values.roleId,
        contractType: values.contractType,
        contractExpireDate: values.contractExpireDate?.format('YYYY-MM-DD'),
        probationRatio: values.probationRatio,
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
        title: '未保存的更改将丢失',
        content: '确定要离开吗？已填写的信息将不会保存。',
        okText: '确定离开',
        cancelText: '继续填写',
        okType: 'danger',
        onOk: () => history.push('/employee/list'),
      });
    } else {
      history.push('/employee/list');
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
              返回列表
            </Button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>新增员工</span>
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{ probationRatio: 0.8 }}
        onFieldsChange={() => setDirty(true)}
      >
        <EmployeeForm
          mode="add"
          form={form}
          departmentTreeData={deptTreeData}
          positionOptions={positionOptions}
          roleOptions={roleOptions}
        />
      </Form>
    </div>
  );
};

export default EmployeeAddPage;
