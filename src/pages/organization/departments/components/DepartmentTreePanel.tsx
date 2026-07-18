import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Spin } from 'antd';
import React, { useMemo, useState } from 'react';
import styles from './TreePanel.less';

interface FlatNode {
  id: number;
  name: string;
  code?: string;
  managerName?: string;
  employeeCount: number;
  level: number;
}

function flatten(nodes: API.DepartmentTreeNode[], level = 0): FlatNode[] {
  return nodes.reduce<FlatNode[]>((acc, node) => {
    acc.push({
      id: node.id!,
      name: node.name!,
      code: node.code,
      managerName: node.managerName,
      employeeCount: node.employeeCount ?? 0,
      level,
    });
    if (node.children?.length) {
      acc.push(...flatten(node.children, level + 1));
    }
    return acc;
  }, []);
}

interface DepartmentTreeProps {
  selectedId: number | undefined;
  onSelect: (id: number) => void;
}

const DepartmentTreePanel: React.FC<DepartmentTreeProps> = ({
  selectedId,
  onSelect,
}) => {
  const { data, isLoading } = useDepartmentTree();
  const [keyword, setKeyword] = useState('');

  const flatList = useMemo(() => {
    const list = flatten(data ?? []);
    if (!keyword) return list;
    return list.filter(
      (n) => n.name.includes(keyword) || (n.code && n.code.includes(keyword)),
    );
  }, [data, keyword]);

  return (
    <div className={styles.panel}>
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
          <Spin className={styles.loading} />
        ) : flatList.length === 0 ? (
          <Empty description="暂无部门数据" />
        ) : (
          flatList.map((node) => {
            const isSelected = selectedId === node.id;
            return (
              <div
                key={node.id}
                className={`${styles.item} ${
                  isSelected ? styles.itemSelected : ''
                }`}
                style={{ paddingLeft: 16 + node.level * 24 }}
                onClick={() => onSelect(node.id)}
              >
                <div className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    <span
                      className={`${styles.bullet} ${
                        node.level > 0 ? styles.bulletDot : ''
                      }`}
                    />
                    <span className={styles.name}>{node.name}</span>
                    {node.code && (
                      <span className={styles.code}>{node.code}</span>
                    )}
                    {node.managerName && (
                      <span className={styles.manager}>{node.managerName}</span>
                    )}
                  </div>
                  <span className={styles.count}>{node.employeeCount}人</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DepartmentTreePanel;
