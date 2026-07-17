import { updateEmployeeUsingPut } from '@/api/employeeController';
import { useEmployeeDetail } from '@/hooks/useEmployeeDetail';
import { useFieldPermissions } from '@/hooks/useFieldPermissions';
import { SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useAccess, useParams } from '@umijs/max';
import { Button, Form, message, Modal, Result, Space, Spin } from 'antd';
import React, { useMemo } from 'react';
import PersonalInfoSection from './components/PersonalInfoSection';
import SalaryContractSection from './components/SalaryContractSection';
import WorkInfoSection from './components/WorkInfoSection';
import styles from './index.less';

/**
 * 员工档案编辑页
 * 分组表单 + 字段权限控制 + dirty提交 + 取消确认
 */
const EmployeeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const access = useAccess();
  const [form] = Form.useForm();

  const { data: employee, isLoading, isError } = useEmployeeDetail(employeeId);
  const { data: permissions } = useFieldPermissions();

  // 计算初始表单值
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
      departmentName: employee.workInfo?.departmentName,
      positionName: employee.workInfo?.positionName,
      jobLevel: employee.workInfo?.jobLevel,
      directReportName: employee.workInfo?.directReportName,
      workLocation: employee.workInfo?.workLocation,
      contractType: employee.salaryInfo?.contractType,
      contractExpireDate: employee.salaryInfo?.contractExpireDate,
      probationRatio: employee.salaryInfo?.probationRatio,
      baseSalary: employee.salaryInfo?.baseSalary,
      bankAccount: employee.salaryInfo?.bankAccount,
      bankName: employee.salaryInfo?.bankName,
    };
  }, [employee]);

  // 可编辑/锁定字段
  const editableFields = permissions?.editableFields ?? [];
  const flowRequiredFields = permissions?.flowRequiredFields ?? [];

  // 是否展示薪资合同区（仅HR）
  const showSalarySection = access.isHR || access.isAdmin;

  // 加载中
  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 120 }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  // 加载失败
  if (isError || !employee) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="加载失败"
          subTitle="无法获取员工信息"
          extra={
            <Button onClick={() => history.push('/employees')}>返回列表</Button>
          }
        />
      </PageContainer>
    );
  }

  /**
   * 提交表单
   * 仅提交与原始值不同的 dirty 字段
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 计算 dirty 字段（仅提交已变更的字段）
      const dirtyFields: Record<string, any> = {};
      const init: Record<string, any> = initialValues;
      Object.keys(values).forEach((key) => {
        if (init[key] !== values[key]) {
          dirtyFields[key] = values[key] ?? null;
        }
      });

      // 处理日期格式
      if (dirtyFields.birthday) {
        // birthday already in correct format
      }
      if (dirtyFields.contractExpireDate) {
        // contractExpireDate already in correct format
      }

      if (Object.keys(dirtyFields).length === 0) {
        message.info('没有需要保存的修改');
        history.push(`/employees/${employeeId}`);
        return;
      }

      await updateEmployeeUsingPut({ id: employeeId }, dirtyFields);
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

  /**
   * 取消操作
   * 检测是否有未保存的修改
   */
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
    <PageContainer
      header={{
        title: '编辑员工档案',
        onBack: handleCancel,
        breadcrumb: {},
      }}
    >
      <div className={styles.editForm}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          scrollToFirstError
        >
          <PersonalInfoSection
            editableFields={editableFields}
            flowRequiredFields={flowRequiredFields}
            initialValues={initialValues}
          />

          <WorkInfoSection initialValues={initialValues} />

          {showSalarySection && (
            <SalaryContractSection
              editableFields={editableFields}
              flowRequiredFields={flowRequiredFields}
              initialValues={initialValues}
            />
          )}
        </Form>

        {/* 底部固定提交栏 */}
        <div className={styles.footerBar}>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
            >
              保存
            </Button>
          </Space>
        </div>
      </div>
    </PageContainer>
  );
};

export default EmployeeEdit;
