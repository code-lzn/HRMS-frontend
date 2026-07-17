import { getFieldPermissionsUsingGet } from '@/api/employeeController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * 字段权限查询 hook
 * 返回当前用户对各字段的查看/编辑权限
 */
export function useFieldPermissions() {
  return useQuery<API.FieldPermissionsVO | undefined>({
    queryKey: queryKeys.employees.fieldPermissions(),
    queryFn: async () => {
      const res = await getFieldPermissionsUsingGet();
      return res.data as API.FieldPermissionsVO | undefined;
    },
    staleTime: 5 * 60 * 1000, // 权限不会频繁变动，缓存5分钟
  });
}
