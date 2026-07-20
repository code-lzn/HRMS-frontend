import { useModel } from '@umijs/max';
import { useMemo } from 'react';
import { hasAny, hasPermission } from '@/utils/permission';

export default function usePermission() {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  return useMemo(() => {
    const can = (code: string) => hasPermission(user, code);
    const canAny = (...codes: string[]) => hasAny(user, codes);

    // 数据范围：优先 initialState，其次 currentUser
    const dataScope: number = (initialState?.dataScope ?? user?.dataScope ?? 5) as number;
    const dataScopeDesc: string = (initialState?.dataScopeDesc ?? '') as string;
    const roleCode: string = (initialState?.roleCode ?? user?.roleCode ?? '') as string;

    return {
      hasPerm: can,
      hasAnyPerm: canAny,
      dataScope,
      dataScopeDesc,
      roleCode,

      canSeeEmployeeMenu: canAny('employee:list', 'employee:detail'),
      canSeeSalaryMenu: canAny('salary:list', 'salary:view', 'salary:audit'),
      canSeeAttendanceMenu: canAny('attendance:list', 'attendance:manage'),
      canSeeApprovalMenu: can('approval:process'),
      canSeeOrgMenu: can('org:manage') || canAny('employee:list', 'employee:detail'),
      canSeeRoleMenu: can('role:manage'),

      canAddEmployee: can('employee:add'),
      canEditEmployee: can('employee:edit'),
      canDeleteEmployee: can('employee:delete'),
      canAuditSalary: can('salary:audit'),
      canManageSystem: can('system:config'),

      // isAdmin 综合判断：dataScope 为 1 或 roleCode 为 admin 或有 system:config 权限
      isAdmin: dataScope === 1 || roleCode === 'admin' || can('system:config'),
      isSelfOnly: dataScope === 5,
    };
  }, [user, initialState?.dataScope, initialState?.dataScopeDesc, initialState?.roleCode]);
}
