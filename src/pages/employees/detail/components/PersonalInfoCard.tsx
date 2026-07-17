import DesensitizedText from '@/components/DesensitizedText';
import { GENDER_MAP } from '@/constants/enums';
import { Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface PersonalInfoCardProps {
  personalInfo?: API.PersonalInfoVO;
  /** 是否有权限查看敏感字段（身份证号等） */
  canViewSensitive?: boolean;
}

/**
 * 个人信息卡片
 * 敏感字段（手机号、身份证号）脱敏渲染
 */
const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  personalInfo,
  canViewSensitive = true,
}) => {
  if (!personalInfo) return null;

  return (
    <Card title="个人信息" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="姓名">
          {personalInfo.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="性别">
          {GENDER_MAP[personalInfo.gender!] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="手机号">
          <DesensitizedText text={personalInfo.phone} type="phone" />
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {personalInfo.email ? (
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="身份证号">
          <DesensitizedText
            text={personalInfo.idCard}
            type="idCard"
            hasPermission={canViewSensitive}
          />
        </Descriptions.Item>
        <Descriptions.Item label="生日">
          {personalInfo.birthday
            ? dayjs(personalInfo.birthday).format('YYYY-MM-DD')
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="户籍地址" span={2}>
          <span title={personalInfo.registeredAddress}>
            {personalInfo.registeredAddress || '-'}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="现居住地址" span={2}>
          <span title={personalInfo.currentAddress}>
            {personalInfo.currentAddress || '-'}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PersonalInfoCard;
