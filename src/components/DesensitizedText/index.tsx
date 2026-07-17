import React from 'react';

interface DesensitizedTextProps {
  text?: string;
  /** 脱敏类型 */
  type: 'phone' | 'idCard' | 'bankAccount';
  /** 是否有权限查看完整内容 */
  hasPermission?: boolean;
}

/**
 * 敏感字段脱敏组件
 * - 无权限时显示 ****
 * - 手机号：138****1234
 * - 身份证：3301**********1234
 * - 银行卡：****1234（仅显示后4位）
 */
const DesensitizedText: React.FC<DesensitizedTextProps> = ({
  text,
  type,
  hasPermission = true,
}) => {
  if (!hasPermission || !text) {
    return <span>****</span>;
  }

  const mask = (str: string) => {
    switch (type) {
      case 'phone':
        // 138****1234
        return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      case 'idCard':
        // 3301**********1234
        if (str.length === 18) {
          return str.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
        }
        return str.replace(/(\d{3})\d+(\d{4})/, '$1**********$2');
      case 'bankAccount':
        // ****1234（仅显示后4位）
        if (str.length > 4) {
          return '****' + str.slice(-4);
        }
        return '****';
      default:
        return str;
    }
  };

  const desensitized = mask(text);

  if (desensitized === text) {
    return <span>{text}</span>;
  }

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{desensitized}</span>
  );
};

export default DesensitizedText;
