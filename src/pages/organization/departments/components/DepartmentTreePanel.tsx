import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Empty, Input, Spin, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';
import styles from './TreePanel.less';

interface DepartmentTreeProps {
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onAddRoot: () => void;
  onAddChild: (parentId: number) => void;
}

function convertToTreeData(nodes: API.DepartmentTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id!,
    title: `${node.name} (${node.employeeCount ?? 0})`,
    code: node.code,
    managerName: node.managerName,
    employeeCount: node.employeeCount ?? 0,
    children: node.children ? convertToTreeData(node.children) : undefined,
  }));
}

const DepartmentTreePanel: React.FC<DepartmentTreeProps> = ({
  selectedId,
  onSelect,
  onAddChild,
}) => {
  const { data, isLoading } = useDepartmentTree();
  const [keyword, setKeyword] = useState('');
  const access = useAccess();
  const canManage = access.canManageOrganization;

  const treeData = useMemo(() => {
    const nodes = data ?? [];
    let converted = convertToTreeData(nodes);
    if (keyword) {
      const filter = (list: DataNode[]): DataNode[] =>
        list
          .map((n) => {
            const match = String(n.title).includes(keyword);
            const children = n.children ? filter(n.children) : undefined;
            if (match || (children && children.length > 0)) {
              return { ...n, children };
            }
            return null;
          })
          .filter(Boolean) as DataNode[];
      converted = filter(converted);
    }
    return converted;
  }, [data, keyword]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Typography.Text strong className={styles.title}>
          部门
        </Typography.Text>
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
            treeData={treeData}
            titleRender={(node) => {
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
                          {String(node.title).split('(')[0].trim()}
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
                        {(node as any).employeeCount ?? 0}人
                      </span>
                      {canManage && (
                        <PlusOutlined
                          className={styles.addIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(node.key as number);
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
