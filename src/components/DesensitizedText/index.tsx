import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';

interface DesensitizedTextProps {
  text?: string;
  type: 'phone' | 'idCard' | 'bankAccount';
  hasPermission?: boolean;
  revealable?: boolean;
}

const mask = (str: string, type: DesensitizedTextProps['type']) => {
  switch (type) {
    case 'phone':
      return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'idCard':
      if (str.length === 18)
        return str.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
      return str.replace(/(\d{3})\d+(\d{4})/, '$1**********$2');
    case 'bankAccount':
      if (str.length > 4) return '****' + str.slice(-4);
      return '****';
    default:
      return str;
  }
};

const DesensitizedText: React.FC<DesensitizedTextProps> = ({
  text,
  type,
  hasPermission = true,
  revealable = false,
}) => {
  const [revealed, setRevealed] = useState(false);

  if (!hasPermission || !text) {
    return <span>****</span>;
  }

  const masked = mask(text, type);
  const display = revealed ? text : masked;

  if (masked === text) {
    return <span style={{ whiteSpace: 'nowrap' }}>{text}</span>;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
    >
      {/* 文本区：relative 容器 + 不可见原文占宽 + 可见文本绝对覆盖 */}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ visibility: 'hidden' }}>{text}</span>
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {display}
        </span>
      </span>
      {revealable && (
        <Tooltip title={revealed ? '隐藏' : '查看'}>
          <Button
            type="text"
            size="small"
            icon={revealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setRevealed(!revealed)}
            style={{
              color: '#1677ff',
              padding: '0 2px',
              minWidth: 24,
              flexShrink: 0,
            }}
          />
        </Tooltip>
      )}
    </span>
  );
};

export default DesensitizedText;
