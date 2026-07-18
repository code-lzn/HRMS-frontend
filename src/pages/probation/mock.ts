/** 转正申请记录 */
export interface ProbationRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  positionName: string;
  probationStartDate: string;
  probationEndDate: string;
  status: number;
  statusDesc: string;
  result?: number;
  resultDesc?: string;
  createTime: string;
}

/** 转正详情 */
export interface ProbationDetail extends ProbationRecord {
  jobLevel?: string;
  hireDate: string;
  probationMonths: number;
  performanceReview: string;
  salaryAdjustment?: number;
  extendedEndDate?: string;
  approvalInstanceId?: number;
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

/** 待转正员工 */
export interface PendingProbationEmployee {
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  positionName: string;
  hireDate: string;
  probationEndDate: string;
  daysRemaining: number;
  hasPendingApplication: boolean;
}
