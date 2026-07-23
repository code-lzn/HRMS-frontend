export interface TransferAddRequest {
  employeeId: number;
  toDeptId: number;
  toPositionId: number;
  toRankCode?: string;
  toReporterId?: number;
  salaryAdjustment?: number;
  reason: string;
  effectiveDate?: string;
  flowId?: number;
  remark?: string;
  workLocation?: string;
  employmentType: string;
}

export interface TransferVO {
  id: number;
  businessNo: string;
  flowId?: number;
  recordId?: number;
  employeeId: number;
  employeeName?: string;
  employeeNo?: string;
  approverId?: number;
  approverName?: string;
  fromDeptId: number;
  fromDeptName?: string;
  toDeptId: number;
  toDeptName?: string;
  toPositionId?: number;
  toPositionName?: string;
  toRankCode?: string;
  toReporterId?: number;
  toReporterName?: string;
  workLocation?: string;
  employmentType?: string;
  salaryAdjustment?: number;
  reason: string;
  status: string;
  operatorId: number;
  operatorName?: string;
  effectiveDate?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  approvalStatus?: string;
  approvalProgress?: string;
  rejectionReason?: string;
}

export interface PageVO<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
