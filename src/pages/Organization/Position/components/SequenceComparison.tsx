import React from 'react';
import { COLORS } from '../../styles';

/** 序列对照数据 */
const SEQUENCE_TABLE = [
  {
    code: 'M',
    name: '管理序列',
    label: 'M序列',
    range: 'M1 ~ M5',
    positions: 'M1主管、M2经理、M3总监、M5VP',
    color: '#8b5cf6',
    lightBg: '#f5f3ff',
    border: '#c4b5fd',
  },
  {
    code: 'P',
    name: '专业序列',
    label: 'P序列',
    range: 'P1 ~ P10',
    positions: 'P3初级、P5中级、P7高级、P9专家',
    color: '#2563eb',
    lightBg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    code: 'S',
    name: '支持序列',
    label: 'S序列',
    range: 'S1 ~ S5',
    positions: 'S1-S5职能等级',
    color: '#10b981',
    lightBg: '#ecfdf5',
    border: '#a7f3d0',
  },
];

/** 职位序列职级对照表组件 */
const SequenceComparison: React.FC = () => {
  return (
    <div style={{ marginTop: 20 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.textPrimary,
          marginBottom: 12,
        }}
      >
        职位序列职级对照表
      </h2>

      {/* 表格头 */}
      <div
        style={{
          display: 'flex',
          background: '#f8fafc',
          borderRadius: '8px 8px 0 0',
          border: '1px solid #e2e8f0',
          borderBottom: 'none',
          fontSize: 13,
          fontWeight: 600,
          color: '#475569',
        }}
      >
        <div style={{ flex: '0 0 160', padding: '10px 16px' }}>序列</div>
        <div
          style={{
            flex: 1,
            padding: '10px 16px',
            borderLeft: '1px solid #e2e8f0',
          }}
        >
          职级范围
        </div>
        <div
          style={{
            flex: 1,
            padding: '10px 16px',
            borderLeft: '1px solid #e2e8f0',
          }}
        >
          典型职位
        </div>
      </div>

      {/* 表格行 */}
      {SEQUENCE_TABLE.map((row) => (
        <div
          key={row.code}
          style={{
            display: 'flex',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            background: row.lightBg,
            fontSize: 13,
          }}
        >
          {/* 序列列 */}
          <div
            style={{
              flex: '0 0 160',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontWeight: 600, color: row.color, fontSize: 14 }}>
              {row.name}
            </span>
            <span style={{ fontSize: 12, color: row.color, opacity: 0.7 }}>
              {row.label}
            </span>
          </div>

          {/* 职级范围列 */}
          <div
            style={{
              flex: 1,
              padding: '14px 16px',
              borderLeft: `1px solid ${row.border}`,
              display: 'flex',
              alignItems: 'center',
              color: COLORS.textPrimary,
              fontWeight: 500,
            }}
          >
            {row.range}
          </div>

          {/* 典型职位列 */}
          <div
            style={{
              flex: 1,
              padding: '14px 16px',
              borderLeft: `1px solid ${row.border}`,
              display: 'flex',
              alignItems: 'center',
              color: COLORS.textPrimary,
            }}
          >
            {row.positions}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SequenceComparison;
