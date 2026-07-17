import { LockOutlined } from '@ant-design/icons';
import { Input, Tooltip } from 'antd';
import React from 'react';

interface LockedFieldProps {
  value?: string;
  tooltip: string;
}

/**
 * 锁定字段组件
 * 用于编辑页中需要走审批流程才能修改的字段
 * 展示为 disabled Input + 灰色背景 + 🔒 图标 + Tooltip
 */
const LockedField: React.FC<LockedFieldProps> = ({ value, tooltip }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Input
        value={value}
        disabled
        style={{
          backgroundColor: '#f5f5f5',
          color: '#bfbfbf',
          cursor: 'not-allowed',
          flex: 1,
        }}
      />
      <Tooltip title={tooltip}>
        <LockOutlined
          style={{
            color: '#bfbfbf',
            fontSize: 16,
            cursor: 'help',
          }}
        />
      </Tooltip>
    </div>
  );
};

export default LockedField;
