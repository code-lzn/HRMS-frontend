import { getStatusesUsingGet } from '@/api/employeeController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 员工在职状态枚举查询 hook
 */
export function useStatuses() {
  return useQuery<Record<string, any>[]>({
    queryKey: queryKeys.employees.statuses(),
    queryFn: async () => {
      const res = await getStatusesUsingGet();
      return (res.data ?? []) as Record<string, any>[];
    },
    staleTime: 60 * 1000,
  });
}
