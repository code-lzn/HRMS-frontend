import { EMPLOYEE_STATUS_MAP, STATUS_COLOR_MAP } from '@/constants/enums';
import { Tag } from 'antd';
import React from 'react';

interface StatusTagProps {
  status: number;
}

/**
 * 在职状态标签组件
 * 试用期=蓝色、正式=绿色、待离职=橙色、已离职=灰色
 */
const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const text = EMPLOYEE_STATUS_MAP[status] || '未知';
  const color = STATUS_COLOR_MAP[status] || 'default';

  return <Tag color={color}>{text}</Tag>;
};

export default StatusTag;
