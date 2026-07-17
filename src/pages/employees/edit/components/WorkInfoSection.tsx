import LockedField from '@/components/LockedField';
import { LOCKED_FIELD_MESSAGES } from '@/constants/enums';
import { Card } from 'antd';
import React from 'react';

interface WorkInfoSectionProps {
  initialValues: Record<string, any>;
}

/**
 * 工作信息编辑区
 * 全部字段锁定（部门/职位/职级/汇报人/工作地点均需走调岗流程）
 */
const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({ initialValues }) => {
  const lockedFields = [
    {
      key: 'departmentName',
      label: '所属部门',
      value: initialValues.departmentName,
    },
    { key: 'positionName', label: '职位', value: initialValues.positionName },
    { key: 'jobLevel', label: '职级', value: initialValues.jobLevel },
    {
      key: 'directReportName',
      label: '直接汇报人',
      value: initialValues.directReportName,
    },
    {
      key: 'workLocation',
      label: '工作地点',
      value: initialValues.workLocation,
    },
  ];

  return (
    <Card title="工作信息" style={{ marginBottom: 16 }}>
      {lockedFields.map((field) => (
        <div key={field.key} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>{field.label}</div>
          <LockedField
            value={field.value || ''}
            tooltip={LOCKED_FIELD_MESSAGES[field.key] || '修改需走调岗流程'}
          />
        </div>
      ))}
    </Card>
  );
};

export default WorkInfoSection;
