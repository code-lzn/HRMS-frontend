import { useModel } from '@umijs/max';
import { useMemo } from 'react';
import { hasPermission } from '@/utils/permission';

/**
 * 员工档案字段可见性权限 Hook
 * 根据当前登录用户的角色以及与目标员工的关系，返回各字段/区域的可见性
 *
 * 字段级可见性矩阵（按需求文档）：
 *   - 手机号/邮箱：HR + 部门主管 + 本人
 *   - 身份证号：HR + 本人
 *   - 户籍地址：HR + 本人
 *   - 薪资合同：HR + 财务 + 本人
 *   - 紧急联系人：HR + 部门主管 + 本人
 *   - 编辑：employee:edit + 本人
 *   - 变更历史：HR + 部门主管
 */
export default function useEmployeeFieldPermission(
  employeeId: number | undefined,
  detail: API.EmployeeDetailVO | null,
) {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  return useMemo(() => {
    const roleId = currentUser?.roleId ?? 5;
    const isSelf = !!(
      detail?.employeeName &&
      currentUser?.userName === detail.employeeName
    );
    const isHR = roleId === 1 || roleId === 2;
    const isDeptManager = roleId === 3;
    const isFinance = roleId === 4;

    return {
      isSelf,
      isHR,
      isDeptManager,
      isFinance,
      // 手机号/邮箱：HR + 部门主管 + 本人
      canSeeSensitivePersonal: isHR || isDeptManager || isSelf,
      // 身份证号：HR + 本人
      canSeeIdCard: isHR || isSelf,
      // 户籍地址：HR + 本人
      canSeeRegisteredAddress: isHR || isSelf,
      // 薪资合同：HR + 财务 + 本人
      canSeeSalary: isHR || isFinance || isSelf,
      // 紧急联系人：HR + 部门主管 + 本人
      canSeeEmergency: isHR || isDeptManager || isSelf,
      // 编辑按钮：employee:edit + 本人
      canEdit: hasPermission(currentUser, 'employee:edit') || isSelf,
      // 变更历史：HR + 部门主管
      canSeeHistory: isHR || isDeptManager,
    };
  }, [currentUser, detail, employeeId]);
}
