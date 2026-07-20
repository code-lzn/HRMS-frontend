/**
 * 入职申请记录（对应后端 API 响应格式）
 * 参考：入转调离-后端系分.md 9.2.1 查询入职列表 响应格式
 */
export interface OnboardingRecord {
  id: number;
  name: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  expectedHireDate: string;
  status: number;
  statusDesc: string;
  hireType?: number;
  hireTypeDesc?: string;
  applicantId?: number;
  applicantName: string;
  createTime: string;
  updateTime?: string;
  avatarColor?: string;
}

/** 入职详情（对应 GET /api/v1/onboarding/{id} 响应） */
export interface OnboardingDetail extends OnboardingRecord {
  gender: number;
  genderDesc: string;
  email: string;
  idCard: string;
  departmentId: number;
  positionId: number;
  hireType: number;
  probationMonths: number;
  probationRatio: number;
  directReportId?: number;
  directReportName?: string;
  employeeId?: number;
  employeeNo?: string;
  approvalInstanceId?: number;
  actualHireDate?: string;
  approvalProgress?: {
    instanceId: number;
    currentNodeOrder: number;
    nodes: {
      nodeId: number;
      nodeName: string;
      nodeOrder: number;
      approverId: number;
      approverName: string;
      status: number;
      statusDesc: string;
      comment?: string;
      operateTime?: string;
    }[];
  };
}
