import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Button, Empty, Input, Space, Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';

interface DepartmentTreeProps {
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onAddRoot: () => void;
}

/**
 * 将 API 部门树节点转换为 antd Tree 的 DataNode 格式
 */
function convertToTreeData(nodes: API.DepartmentTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id!,
    title: `${node.name} (${node.employeeCount ?? 0})`,
    children: node.children ? convertToTreeData(node.children) : undefined,
  }));
}

/**
 * 递归搜索并高亮匹配的节点
 */
function searchTreeData(nodes: DataNode[], keyword: string): DataNode[] {
  if (!keyword) return nodes;

  return nodes
    .map((node) => {
      const titleStr = String(node.title);
      const match = titleStr.includes(keyword);
      const children = node.children
        ? searchTreeData(node.children, keyword)
        : undefined;

      if (match || (children && children.length > 0)) {
        return {
          ...node,
          title: match ? (
            <span>
              {titleStr.replace(
                new RegExp(
                  `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
                  'g',
                ),
                '<mark>$1</mark>',
              )}
            </span>
          ) : (
            titleStr
          ),
          children,
        };
      }
      return null;
    })
    .filter(Boolean) as DataNode[];
}

/**
 * 左侧部门树面板
 * 节点格式: "{部门名称} ({员工数})"
 * 支持搜索过滤和高亮
 */
const DepartmentTreePanel: React.FC<DepartmentTreeProps> = ({
  selectedId,
  onSelect,
  onAddRoot,
}) => {
  const { data, isLoading, refetch } = useDepartmentTree();
  const [keyword, setKeyword] = useState('');
  const access = useAccess();

  const treeData = useMemo(() => {
    const nodes = data ?? [];
    const converted = convertToTreeData(nodes);
    return searchTreeData(converted, keyword);
  }, [data, keyword]);

  return (
    <div
      style={{
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 工具栏 */}
      <Space style={{ marginBottom: 12 }} wrap>
        {access.canManageOrganization && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAddRoot}
          >
            新增根部门
          </Button>
        )}
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
        >
          刷新
        </Button>
      </Space>

      {/* 搜索框 */}
      <Input
        placeholder="请输入部门名称搜索"
        prefix={<SearchOutlined />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />

      {/* 部门树 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Spin
            style={{ display: 'block', marginTop: 40, textAlign: 'center' }}
          />
        ) : treeData.length === 0 ? (
          <Empty description="暂无部门数据" />
        ) : (
          <Tree
            showLine={{ showLeafIcon: false }}
            defaultExpandAll
            selectedKeys={selectedId ? [selectedId] : []}
            onSelect={(keys) => {
              if (keys.length > 0) {
                onSelect(keys[0] as number);
              }
            }}
            treeData={treeData}
            style={{ fontSize: 14 }}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentTreePanel;
