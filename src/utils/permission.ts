/**
 * 权限判断工具
 * 当前基于 roleId 硬编码，后续可替换为调用权限模块 API
 *
 * 角色定义：
 *   roleId 1 - 系统管理员  所有权限
 *   roleId 2 - HR专员      employee 增删改查
 *   roleId 3 - 部门主管     employee 查询/编辑 + 审批
 *   roleId 4 - 财务专员     salary 查询/审核
 *   roleId 5 - 普通员工     考勤打卡
 */

/** 根据角色ID获取该角色拥有的权限列表 */
const getRolePermissions = (roleId: number): string[] => {
  const rolePermissionMap: Record<number, string[]> = {
    1: ['*:*'], // 系统管理员：全部权限
    2: ['employee:list', 'employee:add', 'employee:edit', 'employee:delete', 'org:manage'],
    3: ['employee:list', 'employee:edit', 'approval:process', 'org:view'],
    4: ['salary:list', 'salary:view', 'salary:audit', 'org:view'],
    5: ['attendance:clock', 'org:view'],
  };
  return rolePermissionMap[roleId] ?? [];
};

/**
 * 判断当前用户是否拥有指定权限
 * @param user 当前用户对象（含 roleId）
 * @param permission 权限编码，如 'employee:add'
 * @returns 是否有权限
 */
export const hasPermission = (user: { roleId?: number } | undefined | null, permission: string): boolean => {
  if (!user) return false;
  const roleId = user.roleId ?? 5;
  const permissions = getRolePermissions(roleId);
  // 系统管理员（*:*）拥有所有权限
  if (permissions.includes('*:*')) return true;
  return permissions.includes(permission);
};
