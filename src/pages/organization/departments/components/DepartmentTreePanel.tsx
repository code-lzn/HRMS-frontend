import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Button, Empty, Input, Spin, Tree, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import styles from './TreePanel.less';

/** antd Tree DataNode 扩展：携带后端 DepartmentTreeNode 的额外字段 */
interface DeptDataNode {
  key: number;
  title: string;
  code?: string;
  managerName?: string;
  employeeCount: number;
  children?: DeptDataNode[];
}

interface DepartmentTreeProps {
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onAddRoot: () => void;
  onAddChild: (parentId: number) => void;
}

/** 将后端 DepartmentTreeNode[] 递归转为 antd Tree 可用格式 */
function convertToTreeData(nodes: API.DepartmentTreeNode[]): DeptDataNode[] {
  return nodes.map((node) => ({
    key: node.id!,
    title: `${node.name} (${node.employeeCount ?? 0})`,
    code: node.code,
    managerName: node.managerName,
    employeeCount: node.employeeCount ?? 0,
    children: node.children ? convertToTreeData(node.children) : undefined,
  }));
}

/** 按关键字递归过滤树节点（保留匹配节点及其祖先路径） */
function filterTreeByKW(list: DeptDataNode[], kw: string): DeptDataNode[] {
  return list
    .map((n) => {
      const match = n.title.includes(kw);
      const children = n.children ? filterTreeByKW(n.children, kw) : undefined;
      return match || (children && children.length > 0)
        ? { ...n, children }
        : null;
    })
    .filter(Boolean) as DeptDataNode[];
}

const DepartmentTreePanel: React.FC<DepartmentTreeProps> = ({
  selectedId,
  onSelect,
  onAddRoot,
  onAddChild,
}) => {
  const { data, isLoading } = useDepartmentTree();
  const [keyword, setKeyword] = useState('');
  const access = useAccess();
  const canManage = access.canManageOrganization;

  const treeData = useMemo(() => {
    const converted = convertToTreeData(data ?? []);
    return keyword ? filterTreeByKW(converted, keyword) : converted;
  }, [data, keyword]);

  return (
    <div className={styles.panel}>
      {/* 标题行：部门 + [+] */}
      <div className={styles.header}>
        <Typography.Text strong className={styles.title}>
          部门
        </Typography.Text>
        {canManage && (
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAddRoot}
          />
        )}
      </div>

      <Input
        className={styles.search}
        placeholder="搜索部门名称或编码"
        prefix={<SearchOutlined />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        allowClear
      />

      <div className={styles.treeWrap}>
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
              if (keys.length > 0) onSelect(keys[0] as number);
            }}
            treeData={treeData as any}
            titleRender={(rawNode) => {
              const node = rawNode as any;
              const isSelected = selectedId === node.key;
              return (
                <div
                  className={`${styles.treeItem} ${
                    isSelected ? styles.treeItemSelected : ''
                  }`}
                >
                  <div className={styles.treeTitle}>
                    <div className={styles.treeTitleContent}>
                      <div className={styles.deptNameRow}>
                        <span className={styles.deptName}>
                          {node.title.split('(')[0].trim()}
                        </span>
                        {node.code && (
                          <span className={styles.deptCode}>{node.code}</span>
                        )}
                      </div>
                      {node.managerName && (
                        <span className={styles.deptManager}>
                          {node.managerName}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.deptCount}>
                        {node.employeeCount}人
                      </span>
                      {canManage && (
                        <PlusOutlined
                          className={styles.addIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(node.key);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentTreePanel;
