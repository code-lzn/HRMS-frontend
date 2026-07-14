import { SearchOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Input, Space, Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

/** 递归收集前 N 级节点 key */
const collectExpandedKeys = (nodes: API.DepartmentTreeVO[], depth: number, maxDepth: number): React.Key[] => {
  if (depth >= maxDepth) return [];
  const keys: React.Key[] = [];
  for (const node of nodes) {
    keys.push(node.id!);
    if (node.children?.length) {
      keys.push(...collectExpandedKeys(node.children, depth + 1, maxDepth));
    }
  }
  return keys;
};

/** 将部门树转为 Ant Design TreeData */
const buildTreeData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!,
    title: (
      <span>
        {node.name}
        <Badge
          count={node.employeeCount ?? 0}
          showZero
          overflowCount={9999}
          style={{
            backgroundColor: node.employeeCount && node.employeeCount > 0 ? '#1890ff' : '#d9d9d9',
            marginLeft: 8,
            fontSize: 11,
          }}
        />
      </span>
    ),
    label: node.name,
    children: node.children?.length ? buildTreeData(node.children) : [],
  }));

/**
 * 根据搜索关键词过滤树节点，只保留名称匹配的节点以及其父节点路径
 */
const filterTreeBySearch = (nodes: API.DepartmentTreeVO[], keyword: string): API.DepartmentTreeVO[] => {
  if (!keyword.trim()) return nodes;
  const lowerKeyword = keyword.toLowerCase();
  const filter = (list: API.DepartmentTreeVO[]): API.DepartmentTreeVO[] => {
    const result: API.DepartmentTreeVO[] = [];
    for (const node of list) {
      const nameMatch = node.name?.toLowerCase().includes(lowerKeyword) ?? false;
      const filteredChildren = node.children?.length ? filter(node.children) : [];
      if (nameMatch || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        });
      }
    }
    return result;
  };
  return filter(nodes);
};

/** 获取所有节点 key（用于展开） */
const getAllKeys = (nodes: API.DepartmentTreeVO[]): React.Key[] => {
  const keys: React.Key[] = [];
  const walk = (list: API.DepartmentTreeVO[]) => {
    for (const node of list) {
      keys.push(node.id!);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return keys;
};

interface DepartmentTreeProps {
  selectedDeptId: number | undefined;
  onSelect: (dept: API.DepartmentTreeVO) => void;
  onAddDept: () => void;
  onMergeDept: () => void;
  treeData: API.DepartmentTreeVO[];
  loading: boolean;
}

const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  selectedDeptId,
  onSelect,
  onAddDept,
  onMergeDept,
  treeData,
  loading,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 初始展开前2级
  useEffect(() => {
    if (treeData.length > 0) {
      setExpandedKeys(collectExpandedKeys(treeData, 0, 2));
    }
  }, [treeData]);

  // 搜索时展开匹配节点的所有父节点
  useEffect(() => {
    if (searchValue.trim()) {
      // 展开匹配节点的所有祖先
      const allKeys = getAllKeys(treeData);
      setExpandedKeys(allKeys);
      setAutoExpandParent(false);
    }
  }, [searchValue, treeData]);

  // 根据搜索词过滤树
  const filteredTreeData = useMemo(
    () => filterTreeBySearch(treeData, searchValue),
    [treeData, searchValue],
  );
  const treeDataNodes = useMemo(() => buildTreeData(filteredTreeData), [filteredTreeData]);

  const handleSelect = useCallback(
    (selectedKeys: React.Key[]) => {
      if (selectedKeys.length === 0) return;
      const key = selectedKeys[0] as number;
      // 从 treeData 中找到对应节点
      const findNode = (nodes: API.DepartmentTreeVO[]): API.DepartmentTreeVO | undefined => {
        for (const node of nodes) {
          if (node.id === key) return node;
          if (node.children?.length) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      const node = findNode(treeData);
      if (node) onSelect(node);
    },
    [treeData, onSelect],
  );

  const hasMultipleDepts = treeData.length > 1 || treeData.some((n) => (n.children?.length ?? 0) > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具栏 */}
      <div style={{ padding: '0 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>部门列表</span>
        <Space>
          <Button size="small" type="primary" onClick={onAddDept}>
            新增部门
          </Button>
          <Button size="small" onClick={onMergeDept} disabled={!hasMultipleDepts}>
            合并部门
          </Button>
        </Space>
      </div>

      {/* 搜索框 */}
      <Input
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        placeholder="搜索部门名称"
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {/* 树 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Spin spinning={loading}>
          {treeData.length === 0 && !loading ? (
            <Empty description="暂无部门数据" style={{ marginTop: 60 }} />
          ) : (
            <Tree
              treeData={treeDataNodes}
              selectedKeys={selectedDeptId ? [selectedDeptId] : []}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={(keys) => {
                setExpandedKeys(keys);
                setAutoExpandParent(false);
              }}
              onSelect={handleSelect}
              blockNode
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default DepartmentTree;
