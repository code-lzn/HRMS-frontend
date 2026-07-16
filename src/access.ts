import { hasAny, hasPermission } from '@/utils/permission';

/**
 * Umi 权限控制入口
 * 返回的每个字段对应路由中的 `access` 属性
 */
export default (initialState: any) => {
  const user = initialState?.currentUser;

  const can = (code: string) => hasPermission(user, code);
  const canAny = (...codes: string[]) => hasAny(user, codes);

  return {
    // === 菜单级权限 ===
    /** 员工管理菜单：可查看员工列表或详情 */
    canSeeEmployeeMenu: canAny('employee:list', 'employee:detail'),
    /** 薪资管理菜单：可查看薪资列表/详情/审核 */
    canSeeSalaryMenu: canAny('salary:list', 'salary:view', 'salary:audit'),
    /** 考勤管理菜单 */
    canSeeAttendanceMenu: canAny('attendance:list', 'attendance:manage'),
    /** 审批中心菜单 */
    canSeeApprovalMenu: can('approval:process'),
    /** 组织架构菜单 */
    canSeeOrgMenu: can('org:manage'),
    /** 角色用户管理菜单 */
    canSeeRoleMenu: can('role:manage'),
    /** 系统配置菜单 */
    canSeeSystemConfig: can('system:config'),

    // === 页面级权限 ===
    /** 中台管理系统（仪表盘/用户管理/角色权限/系统配置/操作日志） */
    canAdmin: can('system:config') || can('role:manage'),
    /** HR 中控台（入职/转正/调岗/离职管理） */
    canSeeHRConsole: canAny('employee:add', 'employee:edit', 'employee:delete'),

    // === 按钮级权限 ===
    /** 新增员工 */
    canAddEmployee: can('employee:add'),
    /** 编辑员工 */
    canEditEmployee: can('employee:edit'),
    /** 删除员工 */
    canDeleteEmployee: can('employee:delete'),
    /** 薪资审核 */
    canAuditSalary: can('salary:audit'),
  };
};
