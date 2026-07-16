export interface ResignationAddRequest {
  employeeId: number;
  resignDate: string;
  resignReasonType: string;
  resignType: string;
  detailReason: string;
  handoverPersonId: number;
  flowId?: number;
  remark?: string;
}

export interface ResignationVO {
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
  resignDate: string;
  resignReasonType: string;
  resignType: string;
  detailReason: string;
  handoverPersonId: number;
  handoverPersonName?: string;
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
