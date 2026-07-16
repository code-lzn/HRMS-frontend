import { useModel } from '@umijs/max';
import { useMemo } from 'react';
import { hasAny, hasPermission } from '@/utils/permission';

/**
 * 统一权限 Hook
 * 封装权限判断逻辑，组件中直接使用
 *
 * @example
 * const { hasPerm, hasAnyPerm, dataScope } = usePermission();
 * if (hasPerm('employee:add')) { ... }
 * if (hasAnyPerm('salary:list', 'salary:view')) { ... }
 */
export default function usePermission() {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  return useMemo(() => {
    const can = (code: string) => hasPermission(user, code);
    const canAny = (...codes: string[]) => hasAny(user, codes);

    return {
      /** 判断是否拥有某个权限 */
      hasPerm: can,
      /** 判断是否拥有任意一个权限 */
      hasAnyPerm: canAny,
      /** 数据范围 */
      dataScope: (initialState?.dataScope ?? 5) as number,
      /** 数据范围描述 */
      dataScopeDesc: (initialState?.dataScopeDesc ?? '') as string,
      /** 角色编码 */
      roleCode: (initialState?.roleCode ?? '') as string,

      // === 常用菜单权限 ===
      canSeeEmployeeMenu: canAny('employee:list', 'employee:detail'),
      canSeeSalaryMenu: canAny('salary:list', 'salary:view', 'salary:audit'),
      canSeeAttendanceMenu: canAny('attendance:list', 'attendance:manage'),
      canSeeApprovalMenu: can('approval:process'),
      canSeeOrgMenu: can('org:manage'),
      canSeeRoleMenu: can('role:manage'),

      // === 常用按钮权限 ===
      canAddEmployee: can('employee:add'),
      canEditEmployee: can('employee:edit'),
      canDeleteEmployee: can('employee:delete'),
      canViewEmployeeDetail: can('employee:detail'),
      canAuditSalary: can('salary:audit'),
      canManageSystem: can('system:config'),
      canBackup: can('system:backup'),

      /** 是否为系统管理员 */
      isAdmin: can('system:config'),
      /** 数据范围是否仅限本人 */
      isSelfOnly: (initialState?.dataScope ?? 5) === 5,
    };
  }, [user, initialState?.dataScope, initialState?.dataScopeDesc, initialState?.roleCode]);
}
