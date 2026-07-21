import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { ApartmentOutlined, SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Result, Spin, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import styles from './TreePanel.less';

interface FlatNode {
  id: number;
  name: string;
  code?: string;
  managerName?: string;
  employeeCount: number;
  level: number;
  hasChildren: boolean;
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
      hasChildren: !!(node.children && node.children.length > 0),
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
  const { data, isLoading, isError, error } = useDepartmentTree();
  const httpError = error as any;
  const isPermissionError = httpError?.code === 40101;
  const [keyword, setKeyword] = useState('');

  const flatList = useMemo(() => {
    const list = flatten(data ?? []);
    if (!keyword) return list;
    return list.filter(
      (n) => n.name.includes(keyword) || (n.code && n.code.includes(keyword)),
    );
  }, [data, keyword]);

  const totalCount = useMemo(() => {
    const list = flatten(data ?? []);
    return list.length;
  }, [data]);

  return (
    <div className={styles.panel}>
      {/* 顶部统计 + 搜索 */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Typography.Text strong style={{ fontSize: 15 }}>
            部门列表
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            共 {totalCount} 个
          </Typography.Text>
        </div>
        <Input
          className={styles.search}
          placeholder="搜索部门名称或编码"
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
        />
      </div>

      <div className={styles.treeWrap}>
        {isLoading ? (
          <Spin className={styles.loading} />
        ) : isError ? (
          <Result
            status={isPermissionError ? '403' : 'error'}
            title={isPermissionError ? '无权限' : '加载失败'}
            subTitle={
              isPermissionError
                ? '您没有权限查看部门数据，请联系管理员'
                : '请检查后端服务是否运行'
            }
          />
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
                style={{ paddingLeft: 12 + node.level * 22 }}
                onClick={() => onSelect(node.id)}
              >
                {isSelected && <span className={styles.activeBar} />}
                <ApartmentOutlined
                  className={styles.itemIcon}
                  style={{
                    color: isSelected
                      ? '#1677ff'
                      : node.level === 0
                      ? '#8c8c8c'
                      : '#bfbfbf',
                    fontSize: node.level === 0 ? 16 : 14,
                  }}
                />
                <div className={styles.itemRow}>
                  <span
                    className={`${styles.name} ${
                      isSelected ? styles.nameSelected : ''
                    }`}
                  >
                    {node.name}
                  </span>
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
