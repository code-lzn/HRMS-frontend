import DesensitizedText from '@/components/DesensitizedText';
import StatusTag from '@/components/StatusTag';
import {
  CONTRACT_TYPE_MAP,
  GENDER_MAP,
  HIRE_TYPE_MAP,
} from '@/constants/enums';
import { useEmployeeDetail } from '@/hooks/useEmployeeDetail';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  UserSwitchOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { history, useAccess, useParams } from '@umijs/max';
import { Button, Card, Descriptions, Result, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const access = useAccess();
  const { data: employee, isLoading, isError } = useEmployeeDetail(employeeId);
  const [activeTab, setActiveTab] = useState('personal');

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
          subTitle="无法获取员工信息，请检查员工ID是否正确"
          extra={
            <Button onClick={() => history.push('/employees')}>返回列表</Button>
          }
        />
      </div>
    );
  }

  const canEdit = access.canEditAnyEmployee || access.isEmployee;
  const canViewSensitive = access.isAdmin || access.isHR;

  const getSeniority = (hireDate?: string) => {
    if (!hireDate) return '-';
    const now = dayjs();
    const hire = dayjs(hireDate);
    let years = now.year() - hire.year();
    let months = now.month() - hire.month();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return `${years}年${months > 0 ? months + '个月' : ''}`;
    }
    return `${months}个月`;
  };

  const formatDate = (date?: string) => {
    return date ? dayjs(date).format('YYYY-MM-DD') : '-';
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => history.push('/employees')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>
      <Card style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 50,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <UserOutlined style={{ fontSize: 36, color: '#999' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
                  {employee.personalInfo?.name || ''}
                </h1>
                <StatusTag status={employee.status!} />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 8,
                  fontSize: 14,
                  color: '#666',
                }}
              >
                <span>{employee.employeeNo}</span>
                <span>{employee.workInfo?.departmentName}</span>
                <span>{employee.workInfo?.positionName}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 4,
                  fontSize: 13,
                  color: '#999',
                }}
              >
                <span>入职 {formatDate(employee.hireDate)}</span>
                <span>工龄 {getSeniority(employee.hireDate)}</span>
                <span>工作地 {employee.workInfo?.workLocation || '-'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {canEdit && (
              <Button
                onClick={() => history.push(`/employees/${employeeId}/edit`)}
              >
                编辑档案
              </Button>
            )}
            <Button type="primary">发起调岗</Button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
              直接汇报人
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {employee.workInfo?.directReportName ? (
                <a
                  onClick={() =>
                    history.push(
                      `/employees/${employee.workInfo?.directReportId}`,
                    )
                  }
                >
                  {employee.workInfo?.directReportName}
                </a>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
              入职类型
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {HIRE_TYPE_MAP[employee.hireType!] || '-'}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
              合同类型
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {CONTRACT_TYPE_MAP[employee.salaryInfo?.contractType ?? -1] ||
                '-'}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
              试用期比例
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {employee.salaryInfo?.probationRatio !== null &&
              employee.salaryInfo?.probationRatio !== undefined
                ? `${(employee.salaryInfo.probationRatio * 100).toFixed(0)}%`
                : '-'}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', marginBottom: 24 }}>
        <Button
          type={activeTab === 'personal' ? 'primary' : 'default'}
          onClick={() => setActiveTab('personal')}
          block
          icon={<UserSwitchOutlined />}
        >
          个人信息
        </Button>
        <Button
          type={activeTab === 'work' ? 'primary' : 'default'}
          onClick={() => setActiveTab('work')}
          block
          icon={<FileTextOutlined />}
        >
          工作信息
        </Button>
        <Button
          type={activeTab === 'salary' ? 'primary' : 'default'}
          onClick={() => setActiveTab('salary')}
          block
          icon={<WalletOutlined />}
        >
          薪资合同
        </Button>
      </div>

      {activeTab === 'personal' && (
        <div style={{ display: 'flex', gap: 24 }}>
          <Card title="基础信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="工号">
                <span style={{ fontFamily: 'monospace' }}>
                  {employee.employeeNo}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="系统账号">
                <DesensitizedText text={employee.account} type="phone" />
              </Descriptions.Item>
              <Descriptions.Item label="在职状态">
                <StatusTag status={employee.status!} />
              </Descriptions.Item>
              <Descriptions.Item label="入职日期">
                {formatDate(employee.hireDate)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {employee.createTime
                  ? dayjs(employee.createTime).format('YYYY-MM-DD HH:mm')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="个人信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="姓名">
                {employee.personalInfo?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {GENDER_MAP[employee.personalInfo?.gender ?? -1] || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                <DesensitizedText
                  text={employee.personalInfo?.phone}
                  type="phone"
                />
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {employee.personalInfo?.email ? (
                  <a href={`mailto:${employee.personalInfo.email}`}>
                    {employee.personalInfo.email}
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="身份证号">
                <DesensitizedText
                  text={employee.personalInfo?.idCard}
                  type="idCard"
                  hasPermission={canViewSensitive}
                />
              </Descriptions.Item>
              <Descriptions.Item label="生日">
                {formatDate(employee.personalInfo?.birthday)}
              </Descriptions.Item>
              <Descriptions.Item label="户籍地址">
                {employee.personalInfo?.registeredAddress || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="现居住地址">
                {employee.personalInfo?.currentAddress || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}

      {activeTab === 'work' && (
        <div style={{ display: 'flex', gap: 24 }}>
          <Card title="工作信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="所属部门">
                {employee.workInfo?.departmentName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="职位">
                {employee.workInfo?.positionName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="职级">
                {employee.workInfo?.jobLevel || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="直接汇报人">
                {employee.workInfo?.directReportName ? (
                  <a
                    onClick={() =>
                      history.push(
                        `/employees/${employee.workInfo?.directReportId}`,
                      )
                    }
                  >
                    {employee.workInfo?.directReportName}
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="工作地点">
                {employee.workInfo?.workLocation || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="入职类型">
                {HIRE_TYPE_MAP[employee.hireType!] || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="合同信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="合同类型">
                {CONTRACT_TYPE_MAP[employee.salaryInfo?.contractType ?? -1] ||
                  '-'}
              </Descriptions.Item>
              <Descriptions.Item label="合同到期日">
                {formatDate(employee.salaryInfo?.contractExpireDate)}
              </Descriptions.Item>
              <Descriptions.Item label="试用期待遇比例">
                {employee.salaryInfo?.probationRatio !== null &&
                employee.salaryInfo?.probationRatio !== undefined
                  ? `${(employee.salaryInfo.probationRatio * 100).toFixed(0)}%`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="薪资账套">
                {employee.salaryInfo?.salaryAccountName || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}

      {activeTab === 'salary' && (
        <div style={{ display: 'flex', gap: 24 }}>
          <Card title="薪资信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="基本工资">
                <DesensitizedText
                  text={String(employee.salaryInfo?.baseSalary ?? '')}
                  type="bankAccount"
                />
              </Descriptions.Item>
              <Descriptions.Item label="银行账号">
                <DesensitizedText
                  text={employee.salaryInfo?.bankAccount}
                  type="bankAccount"
                />
              </Descriptions.Item>
              <Descriptions.Item label="开户行">
                {employee.salaryInfo?.bankName || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="合同信息" style={{ flex: 1, borderRadius: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="合同类型">
                {CONTRACT_TYPE_MAP[employee.salaryInfo?.contractType ?? -1] ||
                  '-'}
              </Descriptions.Item>
              <Descriptions.Item label="合同到期日">
                {formatDate(employee.salaryInfo?.contractExpireDate)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
