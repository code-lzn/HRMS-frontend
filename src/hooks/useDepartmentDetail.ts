import { getDepartmentDetailUsingGet } from '@/api/departmentController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 部门详情查询 hook
 */
export function useDepartmentDetail(id: number) {
  return useQuery<API.DepartmentVO | undefined>({
    queryKey: queryKeys.departments.detail(id),
    queryFn: async () => {
      const res = await getDepartmentDetailUsingGet({ id });
      return res.data as API.DepartmentVO | undefined;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
