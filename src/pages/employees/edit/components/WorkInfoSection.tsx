import LockedField from '@/components/LockedField';
import { HIRE_TYPE_MAP, LOCKED_FIELD_MESSAGES } from '@/constants/enums';
import { Card, Tag } from 'antd';
import React from 'react';

interface WorkInfoSectionProps {
  initialValues: Record<string, any>;
}

const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({ initialValues }) => {
  return (
    <Card title="工作信息" style={{ borderRadius: 12, marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500 }}>所属部门</span>
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>*</span>
            <Tag color="orange" style={{ fontSize: 10 }}>
              需调岗流程
            </Tag>
          </div>
          <LockedField
            value={initialValues.departmentName || ''}
            tooltip={LOCKED_FIELD_MESSAGES.departmentName || '修改需走调岗流程'}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500 }}>职位</span>
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>*</span>
            <Tag color="orange" style={{ fontSize: 10 }}>
              需调岗流程
            </Tag>
          </div>
          <LockedField
            value={initialValues.positionName || ''}
            tooltip={LOCKED_FIELD_MESSAGES.positionName || '修改需走调岗流程'}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500 }}>直接汇报人</span>
            <Tag color="orange" style={{ fontSize: 10 }}>
              需调岗流程
            </Tag>
          </div>
          <LockedField
            value={initialValues.directReportName || ''}
            tooltip="修改需走调岗流程"
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500 }}>工作地点</span>
            <Tag color="orange" style={{ fontSize: 10 }}>
              需调岗流程
            </Tag>
          </div>
          <LockedField
            value={initialValues.workLocation || ''}
            tooltip="修改需走调岗流程"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500 }}>入职类型</span>
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>*</span>
            <Tag color="orange" style={{ fontSize: 10 }}>
              需调岗流程
            </Tag>
          </div>
          <LockedField
            value={
              HIRE_TYPE_MAP[initialValues.hireType] ||
              initialValues.hireType ||
              ''
            }
            tooltip="修改需走调岗流程"
          />
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 16px',
          backgroundColor: '#fffbe6',
          borderLeft: '4px solid #faad14',
          borderRadius: 4,
          fontSize: 13,
          color: '#ad8b00',
        }}
      >
        工作信息变更需通过调岗流程，请在员工详情页发起调岗申请
      </div>
    </Card>
  );
};

export default WorkInfoSection;
