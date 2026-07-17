/**
 * 统一 Query Key 工厂
 * 使用层级结构确保缓存失效可精确控制
 */
export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (params: Record<string, any>) =>
      [...queryKeys.employees.lists(), params] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.employees.details(), id] as const,
    statuses: () => [...queryKeys.employees.all, 'statuses'] as const,
    fieldPermissions: () =>
      [...queryKeys.employees.all, 'field-permissions'] as const,
  },
  departments: {
    all: ['departments'] as const,
    tree: () => [...queryKeys.departments.all, 'tree'] as const,
    details: () => [...queryKeys.departments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.departments.details(), id] as const,
    lists: () => [...queryKeys.departments.all, 'list'] as const,
    list: (params: Record<string, any>) =>
      [...queryKeys.departments.lists(), params] as const,
  },
  positions: {
    all: ['positions'] as const,
    lists: () => [...queryKeys.positions.all, 'list'] as const,
    list: (params: Record<string, any>) =>
      [...queryKeys.positions.lists(), params] as const,
    details: () => [...queryKeys.positions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.positions.details(), id] as const,
    sequences: () => [...queryKeys.positions.all, 'sequences'] as const,
  },
};
