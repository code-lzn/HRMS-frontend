export interface RegularizationAddRequest {
  employeeId: number;
  evaluation: string;
  probationScore?: number;
  result?: string;
  extendedMonths?: number;
  salaryAdjustment?: number;
  adjustRemark?: string;
  flowId?: number;
  remark?: string;
}

export interface RegularizationVO {
  id: number;
  businessNo: string;
  flowId?: number;
  recordId?: number;
  employeeId: number;
  employeeName?: string;
  employeeNo?: string;
  deptName?: string;
  positionName?: string;
  approverId?: number;
  approverName?: string;
  probationStartDate: string;
  probationEndDate: string;
  evaluation: string;
  probationScore?: number;
  salaryAdjustment?: number;
  adjustRemark?: string;
  result?: string;
  extendedMonths?: number;
  status: string;
  operatorId: number;
  operatorName?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  approvalStatus?: string;
  approvalProgress?: string;
}

export interface PageVO<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
