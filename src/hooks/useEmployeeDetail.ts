import { getEmployeeDetailUsingGet } from '@/api/employeeController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 员工详情查询 hook
 */
export function useEmployeeDetail(id: number) {
  return useQuery<API.EmployeeDetailVO | undefined>({
    queryKey: queryKeys.employees.detail(id),
    queryFn: async () => {
      const res = await getEmployeeDetailUsingGet({ id });
      return res.data as API.EmployeeDetailVO | undefined;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
