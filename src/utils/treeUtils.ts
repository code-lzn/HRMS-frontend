import type { DataNode } from 'antd/es/tree';

/**
 * 将部门树转为 TreeSelect 可用的 DataNode 数组
 */
export const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

/**
 * 检查 targetId 是否是 sourceId 的子孙节点
 */
export const isDescendant = (
  nodes: API.DepartmentTreeVO[],
  sourceId: number,
  targetId: number,
): boolean => {
  const findSource = (list: API.DepartmentTreeVO[]): API.DepartmentTreeVO | undefined => {
    for (const node of list) {
      if (node.id === sourceId) return node;
      if (node.children?.length) {
        const found = findSource(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  const sourceNode = findSource(nodes);
  if (!sourceNode) return false;
  const containsTarget = (list: API.DepartmentTreeVO[]): boolean => {
    for (const node of list) {
      if (node.id === targetId) return true;
      if (node.children?.length && containsTarget(node.children)) return true;
    }
    return false;
  };
  return containsTarget(sourceNode.children ?? []);
};

/**
 * 将部门树转为扁平列表（用于 Select 组件）
 */
export const flattenTree = (
  nodes: API.DepartmentTreeVO[],
): { label: string; value: number }[] => {
  const result: { label: string; value: number }[] = [];
  const walk = (list: API.DepartmentTreeVO[], prefix = '') => {
    for (const node of list) {
      const label = prefix ? `${prefix} / ${node.name}` : (node.name ?? '');
      result.push({ label, value: node.id! });
      if (node.children?.length) walk(node.children, label);
    }
  };
  walk(nodes);
  return result;
};
