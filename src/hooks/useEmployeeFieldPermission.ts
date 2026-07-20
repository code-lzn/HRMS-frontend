import { useModel } from '@umijs/max';
import { useMemo } from 'react';
import { hasPermission } from '@/utils/permission';

/**
 * 员工档案字段可见性权限 Hook
 * 根据当前登录用户的角色（roleId）以及与目标员工的关系，返回各字段/区域的可见性
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
 * roleId 对照：
 *   1 - 系统管理员
 *   2 - HR专员
 *   3 - 部门主管
 *   4 - 财务专员
 *   5 - 普通员工
 */
export default function useEmployeeFieldPermission(
  employeeId: number | undefined,
  detail: API.EmployeeDetailVO | null,
) {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  return useMemo(() => {
    // 使用 roleId 判别角色，与 permission.ts / lockedFields 保持一致
    const roleId = Number(currentUser?.roleId) || 5;

    // 是否为本人（通过姓名匹配，后续可由后端返回 employeeId 精确判断）
    const isSelf = !!(
      detail?.employeeName &&
      currentUser?.userName === detail.employeeName
    );

    // 角色判定（基于 roleId）
    const isAdmin = roleId === 1;
    const isHR = roleId === 1 || roleId === 2;
    const isDeptManager = roleId === 3;
    const isFinance = roleId === 4;

    return {
      isSelf,
      isHR,
      isDeptManager,
      isFinance,
      isAdmin,

      // 手机号/邮箱/现居住地址：HR(1/2) + 部门主管(3) + 本人
      canSeeSensitivePersonal: isHR || isDeptManager || isSelf,
      // 身份证号：HR(1/2) + 本人（部门主管不可见）
      canSeeIdCard: isHR || isSelf,
      // 户籍地址：HR(1/2) + 本人
      canSeeRegisteredAddress: isHR || isSelf,
      // 薪资合同：HR(1/2) + 财务(4) + 本人（部门主管不可见）
      canSeeSalary: isHR || isFinance || isSelf,
      // 紧急联系人：HR(1/2) + 部门主管(3) + 本人
      canSeeEmergency: isHR || isDeptManager || isSelf,
      // 编辑按钮：需要 employee:edit 权限
      canEdit: hasPermission(currentUser, 'employee:edit'),
      // 变更历史：HR(1/2) + 部门主管(3)
      canSeeHistory: isHR || isDeptManager,
    };
  }, [currentUser, detail, employeeId]);
}
