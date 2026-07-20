import { hasAny, hasPermission } from '@/utils/permission';

export default (initialState: any) => {
  const user = initialState?.currentUser;
  const can = (code: string) => hasPermission(user, code);
  const canAny = (...codes: string[]) => hasAny(user, codes);

  return {
    // 员工管理：管理员/HR/部门主管
    canSeeEmployeeMenu: canAny('employee:list', 'employee:detail'),
    // 薪资管理：仅 HR + 财务（管理员无薪资权限）
    canSeeSalaryMenu: canAny('salary:list', 'salary:view', 'salary:audit'),
    // 考勤管理：管理员/HR/部门主管
    canSeeAttendanceMenu: canAny('attendance:list', 'attendance:manage'),
    // 审批中心：管理员/HR/部门主管
    canSeeApprovalMenu: can('approval:process'),
    // 组织架构：管理员/HR/部门主管（部门主管只读，不能增删改）
    canSeeOrgMenu: can('org:manage') || canAny('employee:list', 'employee:detail'),
    // 角色管理：仅管理员
    canSeeRoleMenu: can('role:manage'),
    // 系统配置：仅管理员
    canSeeSystemConfig: can('system:config'),

    // 中台管理系统：管理员（有 system:config 或 role:manage 任一即可）
    canAdmin: can('system:config') || can('role:manage'),
    // HR中控台：管理员/HR
    canSeeHRConsole: canAny('employee:add', 'employee:edit', 'employee:delete'),

    // 按钮
    canAddEmployee: can('employee:add'),
    canEditEmployee: can('employee:edit'),
    canDeleteEmployee: can('employee:delete'),
    canAuditSalary: can('salary:audit'),
  };
};
