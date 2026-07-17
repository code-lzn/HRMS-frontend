import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';

interface DepartmentDetailProps {
  department: API.DepartmentTreeVO | null;
  subDepartments: API.DepartmentTreeVO[];
  onEdit: (dept: API.DepartmentTreeVO) => void;
  onDelete?: (dept: API.DepartmentTreeVO) => void;
  canManage: boolean;
  treeData?: API.DepartmentTreeVO[];
}

/** 在树中查找上级部门名称 */
function findParentName(treeData: API.DepartmentTreeVO[], parentId?: number): string {
  if (parentId === null || parentId === undefined) return '-';
  const walk = (nodes: API.DepartmentTreeVO[]): string => {
    for (const node of nodes) {
      if (node.id === parentId) return node.name ?? '-';
      if (node.children?.length) {
        const found = walk(node.children);
        if (found !== '-') return found;
      }
    }
    return '-';
  };
  return walk(treeData);
}

// ============================================================
// Label-Value 行组件
// ============================================================

const InfoRow: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({
  label,
  value,
}) => (
  <div
    style={{
      display: 'flex',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
    }}
  >
    <span style={{ width: 100, fontSize: 13, color: '#64748b', flexShrink: 0 }}>
      {label}
    </span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{value ?? '-'}</span>
  </div>
);

// ============================================================
// 子部门卡片
// ============================================================

const SubDeptCard: React.FC<{ node: API.DepartmentTreeVO }> = ({ node }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      background: '#fff',
    }}
  >
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {node.name}
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{node.managerName ?? '-'}</div>
    </div>
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        background: '#dbeafe',
        color: '#2563eb',
        padding: '2px 10px',
        borderRadius: 9999,
        whiteSpace: 'nowrap',
      }}
    >
      {node.employeeCount ?? 0}人
    </span>
  </div>
);

// ============================================================
// 主组件
// ============================================================

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  department,
  subDepartments,
  onEdit,
  onDelete,
  canManage,
  treeData = [],
}) => {
  // ---------- 空状态 ----------
  if (!department) {
    return (
      <div
        style={{
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>请从左侧选择一个部门查看详情</p>
        </div>
      </div>
    );
  }

  // ---------- 选中状态 ----------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', minHeight: 0 }}>
      {/* ===== 卡片 1：部门基本信息 ===== */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: 0,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>部门基本信息</span>
          {canManage && (
            <Space size={0}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                style={{ color: '#2563eb', fontSize: 13, padding: '0 8px' }}
                onClick={() => onEdit(department)}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ fontSize: 13, padding: '0 8px' }}
                onClick={() => onDelete?.(department)}
              >
                删除
              </Button>
            </Space>
          )}
        </div>

        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', flex: 1 }}>
            <InfoRow label="编码" value={department.code ?? '-'} />
            <InfoRow label="部门名称" value={department.name ?? '-'} />
            <InfoRow label="上级部门" value={findParentName(treeData, department.parentId)} />
            <InfoRow label="部门负责人" value={department.managerName ?? '-'} />
            <InfoRow label="排序序号" value={department.sortOrder ?? '-'} />
            <InfoRow label="部门描述" value={department.description ?? '-'} />
          </div>

          {/* 在职人数大字展示 */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: '#64748b' }}>在职人数</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', lineHeight: 1 }}>
              {department.employeeCount ?? 0}
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>人</span>
          </div>
        </div>
      </div>

      {/* ===== 卡片 2：直属子部门（无子部门时占位保持一半高度） ===== */}
      <div
        style={{
          background: subDepartments.length > 0 ? '#fff' : 'transparent',
          borderRadius: 8,
          border: subDepartments.length > 0 ? '1px solid #e2e8f0' : '1px solid transparent',
          boxShadow: subDepartments.length > 0 ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
          padding: subDepartments.length > 0 ? '16px 20px' : 0,
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {subDepartments.length > 0 && (
          <>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>直属子部门</span>
              <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 6 }}>
                {subDepartments.length}个
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {subDepartments.map((child) => (
                <SubDeptCard key={child.id} node={child} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentDetail;
