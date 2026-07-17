import { getEmployeeListUsingGet } from '@/api/employeeController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

interface EmployeeListParams {
  keyword?: string;
  departmentIds?: number[];
  positionIds?: number[];
  statuses?: number[];
  jobLevels?: string[];
  hireDateStart?: string;
  hireDateEnd?: string;
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
}

/**
 * 员工列表查询 hook
 * 用于 ProTable 的 request 属性
 */
export function useEmployeeList(params: EmployeeListParams) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => getEmployeeListUsingGet(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev, // 翻页时保持上一页数据，避免闪烁
  });
}
