import { updateEmployeeUsingPut } from '@/api/employeeController';
import { queryKeys } from '@/hooks/queryKeys';
import { useEmployeeDetail } from '@/hooks/useEmployeeDetail';
import { useFieldPermissions } from '@/hooks/useFieldPermissions';
import { UserOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { history, useAccess, useParams } from '@umijs/max';
import { Avatar, Button, Card, Form, message, Modal, Result, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import PersonalInfoSection from './components/PersonalInfoSection';
import SalaryContractSection from './components/SalaryContractSection';
import WorkInfoSection from './components/WorkInfoSection';

const EmployeeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const access = useAccess();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: employee, isLoading, isError } = useEmployeeDetail(employeeId);
  const { data: permissions } = useFieldPermissions();

  const initialValues = useMemo(() => {
    if (!employee) return {};
    return {
      name: employee.personalInfo?.name,
      gender: employee.personalInfo?.gender,
      phone: employee.personalInfo?.phone,
      email: employee.personalInfo?.email,
      idCard: employee.personalInfo?.idCard,
      birthday: employee.personalInfo?.birthday,
      registeredAddress: employee.personalInfo?.registeredAddress,
      currentAddress: employee.personalInfo?.currentAddress,
      emergencyContactName: employee.personalInfo?.emergencyContactName,
      emergencyContactPhone: employee.personalInfo?.emergencyContactPhone,
      departmentName: employee.workInfo?.departmentName,
      positionName: employee.workInfo?.positionName,
      jobLevel: employee.workInfo?.jobLevel,
      directReportName: employee.workInfo?.directReportName,
      workLocation: employee.workInfo?.workLocation,
      hireType: employee.hireType,
      contractType: employee.salaryInfo?.contractType,
      contractExpireDate: employee.salaryInfo?.contractExpireDate,
      probationRatio: employee.salaryInfo?.probationRatio,
      baseSalary: employee.salaryInfo?.baseSalary,
      bankAccount: employee.salaryInfo?.bankAccount,
      bankName: employee.salaryInfo?.bankName,
    };
  }, [employee]);

  const editableFields = permissions?.editableFields ?? [];
  const flowRequiredFields = permissions?.flowRequiredFields ?? [];
  const showSalarySection = access.isHR || access.isAdmin;

  if (isLoading) {
    return (
      <div
        style={{ padding: '24px 32px', textAlign: 'center', paddingTop: 120 }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <Result
          status="error"
          title="加载失败"
          subTitle="无法获取员工信息"
          extra={
            <Button onClick={() => history.push('/employees')}>返回列表</Button>
          }
        />
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 将 dayjs 对象转为字符串，保证脏检测和发送值的类型一致
      const normalizeValue = (v: any) =>
        dayjs.isDayjs(v) ? v.format('YYYY-MM-DD') : v;

      const dirtyFields: Record<string, any> = {};
      const init: Record<string, any> = initialValues;
      Object.keys(values).forEach((key) => {
        // idCard 不在后端 EmployeeUpdateRequest DTO 中，跳过
        if (key === 'idCard') return;
        const normalized = normalizeValue(values[key]);
        if (init[key] !== normalized) {
          dirtyFields[key] = normalized ?? null;
        }
      });

      if (Object.keys(dirtyFields).length === 0) {
        message.info('没有需要保存的修改');
        history.push(`/employees/${employeeId}`);
        return;
      }

      await updateEmployeeUsingPut({ id: employeeId }, dirtyFields);

      // 直接更新缓存，确保详情页拿到的就是最新值
      queryClient.setQueryData(
        queryKeys.employees.detail(employeeId),
        (oldData: any) => {
          if (!oldData) return oldData;
          const updated = { ...oldData };
          // 合并顶层字段和个人信息
          Object.entries(dirtyFields).forEach(([key, val]) => {
            if (
              [
                'name',
                'gender',
                'phone',
                'email',
                'idCard',
                'birthday',
                'registeredAddress',
                'currentAddress',
                'emergencyContactName',
                'emergencyContactPhone',
              ].includes(key)
            ) {
              updated.personalInfo = { ...updated.personalInfo, [key]: val };
            } else if (
              [
                'departmentName',
                'positionName',
                'jobLevel',
                'directReportName',
                'workLocation',
                'hireType',
              ].includes(key)
            ) {
              updated.workInfo = { ...updated.workInfo, [key]: val };
            } else {
              updated.salaryInfo = { ...updated.salaryInfo, [key]: val };
            }
          });
          return updated;
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
      message.success('保存成功');
      history.push(`/employees/${employeeId}`);
    } catch (error: any) {
      if (error?.code === 409) {
        Modal.error({
          title: '数据冲突',
          content: '数据已被他人修改，请刷新后重试',
          okText: '刷新',
          onOk: () => window.location.reload(),
        });
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('保存失败，请重试');
      }
    }
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: '确认离开',
        content: '您有未保存的修改，确定要离开吗？',
        okText: '确定离开',
        cancelText: '继续编辑',
        onOk: () => history.push(`/employees/${employeeId}`),
      });
    } else {
      history.push(`/employees/${employeeId}`);
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <Card style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#f0f0f0', color: '#999' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                  {employee.personalInfo?.name || ''} 的档案
                </h1>
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                工号 {employee.employeeNo} · 部分字段需通过调岗流程修改
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存修改
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <PersonalInfoSection
            editableFields={editableFields}
            flowRequiredFields={flowRequiredFields}
            initialValues={initialValues}
            form={form}
          />
        </div>

        <div style={{ flex: 1 }}>
          <WorkInfoSection initialValues={initialValues} />

          {showSalarySection && (
            <SalaryContractSection
              editableFields={editableFields}
              flowRequiredFields={flowRequiredFields}
              initialValues={initialValues}
              form={form}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeEdit;
