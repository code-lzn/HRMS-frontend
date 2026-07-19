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
  salary: {
    accounts: {
      all: ['salary', 'accounts'] as const,
      lists: () => [...queryKeys.salary.accounts.all, 'list'] as const,
      list: (params: Record<string, any>) =>
        [...queryKeys.salary.accounts.lists(), params] as const,
      details: () => [...queryKeys.salary.accounts.all, 'detail'] as const,
      detail: (id: number) =>
        [...queryKeys.salary.accounts.details(), id] as const,
      items: (accountId: number) =>
        [...queryKeys.salary.accounts.detail(accountId), 'items'] as const,
    },
    employeeSalaries: {
      all: ['salary', 'employeeSalaries'] as const,
      detail: (employeeId: number) =>
        [...queryKeys.salary.employeeSalaries.all, employeeId] as const,
      history: (employeeId: number) =>
        [
          ...queryKeys.salary.employeeSalaries.detail(employeeId),
          'history',
        ] as const,
    },
    batches: {
      all: ['salary', 'batches'] as const,
      lists: () => [...queryKeys.salary.batches.all, 'list'] as const,
      list: (params: Record<string, any>) =>
        [...queryKeys.salary.batches.lists(), params] as const,
      details: () => [...queryKeys.salary.batches.all, 'detail'] as const,
      detail: (id: number) =>
        [...queryKeys.salary.batches.details(), id] as const,
    },
    payslips: {
      all: ['salary', 'payslips'] as const,
      my: () => [...queryKeys.salary.payslips.all, 'my'] as const,
      detail: (id: number) => [...queryKeys.salary.payslips.all, id] as const,
    },
    statistics: {
      all: ['salary', 'statistics'] as const,
      trend: () => [...queryKeys.salary.statistics.all, 'trend'] as const,
      department: () =>
        [...queryKeys.salary.statistics.all, 'department'] as const,
      composition: () =>
        [...queryKeys.salary.statistics.all, 'composition'] as const,
      variation: () =>
        [...queryKeys.salary.statistics.all, 'variation'] as const,
    },
  },
};
