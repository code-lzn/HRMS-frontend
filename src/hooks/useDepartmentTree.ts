import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 部门树查询 hook
 * 返回完整部门树结构
 */
export function useDepartmentTree() {
  return useQuery<API.DepartmentTreeNode[]>({
    queryKey: queryKeys.departments.tree(),
    queryFn: async () => {
      const res = await getDepartmentTreeUsingGet();
      return (res.data ?? []) as API.DepartmentTreeNode[];
    },
    staleTime: 60 * 1000, // 部门结构不频繁变动
  });
}
