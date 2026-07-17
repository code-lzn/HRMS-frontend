import { history } from '@umijs/max';
import { Card, Descriptions } from 'antd';
import React from 'react';

interface WorkInfoCardProps {
  workInfo?: API.WorkInfoVO;
}

/**
 * 工作信息卡片
 * 直接汇报人可点击跳转详情
 */
const WorkInfoCard: React.FC<WorkInfoCardProps> = ({ workInfo }) => {
  if (!workInfo) return null;

  return (
    <Card title="工作信息" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="所属部门">
          {workInfo.departmentName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="职位">
          {workInfo.positionName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="职级">
          {workInfo.jobLevel || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="直接汇报人">
          {workInfo.directReportName ? (
            <a
              onClick={() =>
                history.push(`/employees/${workInfo.directReportId}`)
              }
            >
              {workInfo.directReportName}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="工作地点" span={2}>
          {workInfo.workLocation || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default WorkInfoCard;
