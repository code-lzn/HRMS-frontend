/**
 * 权限定义
 * 基于 getInitialState 返回的初始化数据，定义项目中的权限
 * getInitialState 返回 { name, currentUser }，其中 currentUser 是 API.LoginUserVO
 */
export default (initialState?: {
  name?: string;
  currentUser?: API.LoginUserVO;
}) => {
  const role = initialState?.currentUser?.userRole;

  return {
    // ========== 角色判断 ==========
    /** 系统管理员 */
    isAdmin: role === 'admin',
    /** HR 专员 */
    isHR: role === 'hr',
    /** 部门主管 */
    isDeptHead: role === 'dept_head',
    /** 财务专员 */
    isFinance: role === 'finance',
    /** 普通员工 */
    isEmployee: role === 'employee',

    // ========== 页面/菜单可见性 ==========
    /** 可查看员工档案模块（所有登录用户） */
    canSeeEmployees: !!initialState?.currentUser,
    /** 可管理组织架构（仅 HR 和系统管理员） */
    canManageOrganization: role === 'admin' || role === 'hr',

    // ========== 功能权限 ==========
    /** 可导出员工列表 */
    canExportEmployee:
      role === 'admin' || role === 'hr' || role === 'dept_head',
    /** 可查看薪资信息 */
    canViewSalary: role === 'admin' || role === 'hr' || role === 'finance',
    /** 可编辑员工档案（HR/Admin 全部；dept_head 和普通员工的限制在组件内判断） */
    canEditAnyEmployee: role === 'admin' || role === 'hr',
    /** 可执行调岗/离职操作 */
    canTransferOrResign: role === 'admin' || role === 'hr',

    // ========== 兼容旧版 ==========
    canSeeAdmin: role === 'admin',
  };
};
