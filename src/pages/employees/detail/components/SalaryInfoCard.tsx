import DesensitizedText from '@/components/DesensitizedText';
import { CONTRACT_TYPE_MAP } from '@/constants/enums';
import { Card, Descriptions, Empty } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface SalaryInfoCardProps {
  salaryInfo?: API.SalaryInfoVO | null;
}

/**
 * 薪资与合同信息卡片
 * - 无权限（salaryInfo === null）时显示"无权限查看"
 * - 有权限时敏感字段脱敏
 */
const SalaryInfoCard: React.FC<SalaryInfoCardProps> = ({ salaryInfo }) => {
  // 无权限
  if (salaryInfo === null || salaryInfo === undefined) {
    return (
      <Card title="薪资与合同信息" style={{ marginBottom: 16 }}>
        <Empty description="无权限查看" />
      </Card>
    );
  }

  return (
    <Card title="薪资与合同信息" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="合同类型">
          {CONTRACT_TYPE_MAP[salaryInfo.contractType!] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="合同到期日">
          {salaryInfo.contractExpireDate
            ? dayjs(salaryInfo.contractExpireDate).format('YYYY-MM-DD')
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="试用期待遇比例">
          {salaryInfo.probationRatio !== null &&
          salaryInfo.probationRatio !== undefined
            ? `${(salaryInfo.probationRatio * 100).toFixed(0)}%`
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="薪资账套">
          {salaryInfo.salaryAccountName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="基本工资">
          <DesensitizedText
            text={String(salaryInfo.baseSalary ?? '')}
            type="bankAccount"
          />
        </Descriptions.Item>
        <Descriptions.Item label="银行账号">
          <DesensitizedText text={salaryInfo.bankAccount} type="bankAccount" />
        </Descriptions.Item>
        <Descriptions.Item label="开户行" span={2}>
          {salaryInfo.bankName || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default SalaryInfoCard;
