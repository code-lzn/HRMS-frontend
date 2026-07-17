import { useModel } from '@umijs/max';
import { useMemo } from 'react';
import { hasPermission } from '@/utils/permission';

/**
 * 员工档案字段可见性权限 Hook
 * 根据当前登录用户的角色（roleCode）以及与目标员工的关系，返回各字段/区域的可见性
 *
 * 字段级可见性矩阵：
 *   - 手机号/邮箱：HR + 部门主管 + 本人
 *   - 身份证号：HR + 本人（部门主管不可见）
 *   - 户籍地址：HR + 本人
 *   - 薪资合同：HR + 财务 + 本人（部门主管不可见）
 *   - 紧急联系人：HR + 部门主管 + 本人
 *   - 编辑按钮：employee:edit 权限持有者
 *   - 变更历史：HR + 部门主管
 *
 * 角色编码对照：
 *   admin     - 系统管理员（全平台）
 *   hr        - HR专员（全部员工）
 *   dept_head - 部门主管（本部门及下属）
 *   finance   - 财务专员（薪资相关）
 *   employee  - 普通员工（仅本人）
 */
export default function useEmployeeFieldPermission(
  employeeId: number | undefined,
  detail: API.EmployeeDetailVO | null,
) {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  return useMemo(() => {
    // 优先 currentUser.roleCode，其次 initialState.roleCode，最后才默认 employee
    const roleCode: string = currentUser?.roleCode || initialState?.roleCode || 'employee';

    // 是否为本人
    const isSelf = !!(
      detail?.employeeName &&
      currentUser?.userName === detail.employeeName
    );

    // 角色判定（基于 roleCode）
    const isAdmin = roleCode === 'admin';
    const isHR = roleCode === 'admin' || roleCode === 'hr';
    const isDeptManager = roleCode === 'dept_head';
    const isFinance = roleCode === 'finance';

    return {
      isSelf,
      isHR,
      isDeptManager,
      isFinance,
      isAdmin,

      // 手机号/邮箱：HR + 部门主管 + 本人
      canSeeSensitivePersonal: isHR || isDeptManager || isSelf,
      // 身份证号：HR + 本人（部门主管不可见）
      canSeeIdCard: isHR || isSelf,
      // 户籍地址：HR + 本人
      canSeeRegisteredAddress: isHR || isSelf,
      // 薪资合同：HR + 财务 + 本人（部门主管不可见）
      canSeeSalary: isHR || isFinance || isSelf,
      // 紧急联系人：HR + 部门主管 + 本人
      canSeeEmergency: isHR || isDeptManager || isSelf,
      // 编辑按钮：需要 employee:edit 权限（部门主管无此权限）
      canEdit: hasPermission(currentUser, 'employee:edit'),
      // 变更历史：HR + 部门主管
      canSeeHistory: isHR || isDeptManager,
    };
  }, [currentUser, detail, employeeId, initialState?.roleCode]);
}
