import { useEmployeeDetail } from '@/hooks/useEmployeeDetail';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useAccess, useParams } from '@umijs/max';
import { Button, Result, Spin } from 'antd';
import React from 'react';
import BasicInfoCard from './components/BasicInfoCard';
import ChangeHistory from './components/ChangeHistory';
import PersonalInfoCard from './components/PersonalInfoCard';
import SalaryInfoCard from './components/SalaryInfoCard';
import WorkInfoCard from './components/WorkInfoCard';

/**
 * 员工档案详情页
 * 顶栏（返回+标题+编辑按钮）+ 4个信息卡片 + 底部变更历史
 */
const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const access = useAccess();
  const { data: employee, isLoading, isError } = useEmployeeDetail(employeeId);

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
          subTitle="无法获取员工信息，请检查员工ID是否正确"
          extra={
            <Button onClick={() => history.push('/employees')}>返回列表</Button>
          }
        />
      </PageContainer>
    );
  }

  // 是否可编辑
  const canEdit = access.canEditAnyEmployee || access.isEmployee; // 部门主管/本人的判断在详情页不做严格限制

  // 是否有权限查看敏感字段（身份证号等）
  // HR/Admin可查看，普通员工仅可查看自己的
  const canViewSensitive = access.isAdmin || access.isHR;

  return (
    <PageContainer
      header={{
        title: '员工档案详情',
        breadcrumb: {},
        extra: canEdit ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => history.push(`/employees/${employeeId}/edit`)}
          >
            编辑
          </Button>
        ) : null,
      }}
      onBack={() => history.push('/employees')}
    >
      <BasicInfoCard data={employee} />
      <PersonalInfoCard
        personalInfo={employee.personalInfo}
        canViewSensitive={canViewSensitive}
      />
      <WorkInfoCard workInfo={employee.workInfo} />
      <SalaryInfoCard salaryInfo={employee.salaryInfo} />
      <ChangeHistory />
    </PageContainer>
  );
};

export default EmployeeDetail;
