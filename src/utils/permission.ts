/**
 * 权限判断工具
 * 基于后端 /api/permission/current 返回的 permissionCodes 动态判断
 */
export const hasPermission = (
  user: { permissionCodes?: string[]; roleId?: number | string } | undefined | null,
  permission: string,
): boolean => {
  if (!user) return false;
  const codes = user.permissionCodes;
  if (!codes || codes.length === 0) return fallback(user.roleId, permission);
  if (codes.includes('*:*')) return true;
  return codes.includes(permission);
};

export const getDataScope = (user: { dataScope?: number } | undefined | null): number =>
  user?.dataScope ?? 5;

export const hasAny = (
  user: { permissionCodes?: string[]; roleId?: number | string } | undefined | null,
  permissions: string[],
): boolean => {
  if (!user || permissions.length === 0) return false;
  const codes = user.permissionCodes;
  if (!codes || codes.length === 0) return permissions.some((p) => fallback(user.roleId, p));
  if (codes.includes('*:*')) return true;
  return permissions.some((p) => codes.includes(p));
};

const fallback = (roleId: number | string | undefined, permission: string): boolean => {
  const rid = Number(roleId) || 5;
  const map: Record<number, string[]> = {
    // 管理员：全平台，无薪资权限（职责分离）
    1: ['employee:list','employee:add','employee:edit','employee:delete','employee:detail',
        'attendance:list','attendance:manage','approval:process',
        'org:manage','role:manage','system:config','system:backup'],
    // HR：员工管理 + 薪资 + 考勤 + 审批 + 组织架构
    2: ['employee:list','employee:add','employee:edit','employee:delete','employee:detail',
        'salary:list','salary:view','salary:audit',
        'attendance:list','attendance:manage','approval:process','org:manage'],
    // 部门主管：本部门查看 + 考勤 + 审批
    3: ['employee:list','employee:detail','attendance:list','attendance:manage','approval:process'],
    // 财务：仅薪资
    4: ['salary:list','salary:view','salary:audit'],
    // 普通员工：无
    5: [],
  };
  const codes = map[rid] ?? [];
  return codes.includes(permission);
};
