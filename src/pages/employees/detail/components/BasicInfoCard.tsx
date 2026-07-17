import DesensitizedText from '@/components/DesensitizedText';
import StatusTag from '@/components/StatusTag';
import { HIRE_TYPE_MAP } from '@/constants/enums';
import { Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface BasicInfoCardProps {
  data?: API.EmployeeDetailVO;
}

/**
 * 基础信息卡片
 */
const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <Card title="基础信息" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="工号">
          <span style={{ fontFamily: 'monospace' }}>{data.employeeNo}</span>
        </Descriptions.Item>
        <Descriptions.Item label="系统账号">
          <DesensitizedText text={data.account} type="phone" />
        </Descriptions.Item>
        <Descriptions.Item label="在职状态">
          <StatusTag status={data.status!} />
        </Descriptions.Item>
        <Descriptions.Item label="入职日期">
          {data.hireDate ? dayjs(data.hireDate).format('YYYY-MM-DD') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="入职类型">
          {HIRE_TYPE_MAP[data.hireType!] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {data.createTime
            ? dayjs(data.createTime).format('YYYY-MM-DD HH:mm')
            : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default BasicInfoCard;
