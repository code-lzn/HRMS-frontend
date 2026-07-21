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
    /** 普通员工（后端 userRole 值为 "user"） */
    isEmployee: role === 'user',

    // ========== 页面/菜单可见性 ==========
    /** 可查看员工档案模块（管理员/HR/部门主管） */
    canSeeEmployees:
      role === 'admin' || role === 'hr' || role === 'dept_head',
    /** 可查看组织架构（管理员/HR/部门主管） */
    canSeeOrganization:
      role === 'admin' || role === 'hr' || role === 'dept_head',
    /** 可管理组织架构（仅 HR 和系统管理员） */
    canManageOrganization: role === 'admin' || role === 'hr',
    /** 可查看入转调离管理（管理员/HR/部门主管） */
    canSeeHRChange:
      role === 'admin' || role === 'hr' || role === 'dept_head',
    /** 可管理考勤设置（考勤组/统计/加班/工作日） */
    canManageAttendance:
      role === 'admin' || role === 'hr' || role === 'dept_head',

    // ========== 功能权限 ==========
    /** 可导出员工列表 */
    canExportEmployee:
      role === 'admin' || role === 'hr' || role === 'dept_head',
    /** 可查看薪资信息 */
    canViewSalary: role === 'admin' || role === 'hr' || role === 'finance',
    /** 可管理薪资账套 */
    canManageSalaryAccount: role === 'admin' || role === 'hr',
    /** 可管理薪资核算批次 */
    canManageSalaryBatch: role === 'admin' || role === 'hr',
    /** 可审批薪资（通过/驳回/发放） */
    canApproveSalary: role === 'admin' || role === 'finance',
    /** 可查看工资条 */
    canViewPayslip: !!initialState?.currentUser,
    /** 可编辑员工档案（HR/Admin 全部；dept_head 和普通员工的限制在组件内判断） */
    canEditAnyEmployee: role === 'admin' || role === 'hr',
    /** 可执行调岗/离职操作 */
    canTransferOrResign: role === 'admin' || role === 'hr',

    // ========== 兼容旧版 ==========
    canSeeAdmin: role === 'admin',
  };
};
