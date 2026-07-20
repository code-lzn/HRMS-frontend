import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 将后端返回的平铺部门列表组装成树形结构
 * 后端约定：按 level ASC, sortOrder ASC 排序返回的平铺列表，
 * 前端按 parentId 分组递归构建树（null 为根节点）
 */
export function buildTree(
  flatList: API.DepartmentTreeNode[],
): API.DepartmentTreeNode[] {
  // parentId → 子节点列表
  const childrenMap = new Map<number | null, API.DepartmentTreeNode[]>();
  for (const node of flatList) {
    const pid = node.parentId ?? null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid)!.push(node);
  }

  // 递归构建：每个节点挂载已排序的子节点
  function assemble(pid: number | null): API.DepartmentTreeNode[] {
    const siblings = childrenMap.get(pid);
    if (!siblings || siblings.length === 0) return [];
    // sortOrder 升序（后端已排，这里二次保险）
    siblings.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return siblings.map((n) => ({
      ...n,
      children: assemble(n.id!),
    }));
  }

  return assemble(null);
}

/**
 * 部门树查询 hook
 * 获取平铺列表后由前端组装为树形结构
 */
export function useDepartmentTree() {
  return useQuery<API.DepartmentTreeNode[]>({
    queryKey: queryKeys.departments.tree(),
    queryFn: async () => {
      const res = await getDepartmentTreeUsingGet();
      const flatList = (res.data ?? []) as API.DepartmentTreeNode[];
      return buildTree(flatList);
    },
    staleTime: 60 * 1000,
  });
}
