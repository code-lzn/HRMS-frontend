/**
 * 权限判断工具
 * 基于后端 /api/permission/current 返回的 permissionCodes 动态判断
 *
 * 数据范围 dataScope：
 *   1 - 全平台（系统管理员）
 *   2 - 全部员工（HR专员）
 *   3 - 本部门及下属（部门主管）
 *   4 - 薪资相关（财务专员）
 *   5 - 仅本人（普通员工）
 */

/**
 * 判断当前用户是否拥有指定权限
 */
export const hasPermission = (
  user:
    | { permissionCodes?: string[]; roleId?: number }
    | undefined
    | null,
  permission: string,
): boolean => {
  if (!user) return false;

  const codes = user.permissionCodes;
  if (!codes || codes.length === 0) {
    return hasFallbackPermission(user.roleId, permission);
  }
  if (codes.includes('*:*')) return true;
  return codes.includes(permission);
};

/**
 * 判断当前用户是否拥有任意一个权限
 */
export const hasAny = (
  user:
    | { permissionCodes?: string[]; roleId?: number }
    | undefined
    | null,
  permissions: string[],
): boolean => {
  if (!user || permissions.length === 0) return false;

  const codes = user.permissionCodes;
  if (!codes || codes.length === 0) {
    return permissions.some((p) => hasFallbackPermission(user.roleId, p));
  }
  if (codes.includes('*:*')) return true;
  return permissions.some((p) => codes.includes(p));
};

/**
 * 获取数据范围值，默认 5（仅本人）
 */
export const getDataScope = (
  user: { dataScope?: number } | undefined | null,
): number => {
  return user?.dataScope ?? 5;
};

/**
 * 回退权限映射：完全匹配后端 RBAC 模型
 * 仅在权限码未加载时使用（getInitialState 完成前）
 */
const hasFallbackPermission = (
  roleId: number | undefined,
  permission: string,
): boolean => {
  const rid = roleId ?? 5;
  const rolePermissionMap: Record<number, string[]> = {
    // 系统管理员 — 全平台，拥有所有权限
    1: ['*:*'],
    // HR专员
    2: [
      'employee:list', 'employee:add', 'employee:edit', 'employee:delete',
      'employee:detail', 'salary:list', 'salary:view', 'salary:audit',
      'attendance:list', 'attendance:manage', 'approval:process', 'org:manage',
    ],
    // 部门主管 — 只能看自己部门的员工，不能编辑
    3: [
      'employee:list', 'employee:detail',
      'attendance:list', 'attendance:manage',
      'approval:process',
    ],
    // 财务专员 — 只能看薪资
    4: ['salary:list', 'salary:view', 'salary:audit'],
    // 普通员工 — 只能看自己的信息（通过个人中心）
    5: [],
  };

  const codes = rolePermissionMap[rid] ?? [];
  if (codes.includes('*:*')) return true;
  return codes.includes(permission);
};
