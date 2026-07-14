import { useModel } from '@umijs/max';
import { useMemo } from 'react';

/**
 * 员工档案字段可见性权限 Hook
 * 根据当前登录用户的角色以及与目标员工的关系，返回各字段/区域的可见性
 */
export default function useEmployeeFieldPermission(
  employeeId: number | undefined,
  detail: API.EmployeeDetailVO | null,
) {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  return useMemo(() => {
    if (!currentUser) {
      return {
        isSelf: false,
        isHR: false,
        isDeptManager: false,
        isFinance: false,
        canSeeSensitivePersonal: false,   // 手机号/邮箱
        canSeeIdCard: false,              // 身份证号
        canSeeRegisteredAddress: false,   // 户籍地址
        canSeeSalary: false,              // 薪资合同卡片
        canSeeEmergency: false,           // 紧急联系人
        canEdit: false,                   // 编辑按钮
        canSeeHistory: false,             // 变更历史按钮
      };
    }

    const userRole: string = currentUser?.userRole ?? '';
    const isSelf = !!(
      detail?.employeeName &&
      currentUser?.userName === detail.employeeName
    );
    const isHR = userRole === 'hr' || userRole === 'system_admin';
    const isDeptManager = userRole === 'dept_manager';
    const isFinance = userRole === 'finance';

    // 可见性矩阵（按需求文档）
    // 手机号/邮箱：HR + 部门主管 + 本人
    const canSeeSensitivePersonal = isHR || isDeptManager || isSelf;
    // 身份证号：HR + 本人
    const canSeeIdCard = isHR || isSelf;
    // 户籍地址：HR + 本人
    const canSeeRegisteredAddress = isHR || isSelf;
    // 薪资合同：HR + 财务 + 本人
    const canSeeSalary = isHR || isFinance || isSelf;
    // 紧急联系人：HR + 部门主管 + 本人
    const canSeeEmergency = isHR || isDeptManager || isSelf;
    // 编辑：HR + 部门主管 + 本人
    const canEdit = isHR || isDeptManager || isSelf;
    // 变更历史：HR + 部门主管
    const canSeeHistory = isHR || isDeptManager;

    return {
      isSelf,
      isHR,
      isDeptManager,
      isFinance,
      canSeeSensitivePersonal,
      canSeeIdCard,
      canSeeRegisteredAddress,
      canSeeSalary,
      canSeeEmergency,
      canEdit,
      canSeeHistory,
    };
  }, [currentUser, detail, employeeId]);
}
