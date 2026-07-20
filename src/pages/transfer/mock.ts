/** 调岗申请记录 */
export interface TransferRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  fromDepartmentName: string;
  toDepartmentName: string;
  fromPositionName: string;
  toPositionName: string;
  status: number;
  statusDesc: string;
  reason?: string;
  createTime: string;
}

/** 调岗详情 */
export interface TransferDetail extends TransferRecord {
  fromDepartmentId: number;
  toDepartmentId: number;
  fromPositionId: number;
  toPositionId: number;
  fromJobLevel?: string;
  toJobLevel?: string;
  fromDirectReportId?: number;
  fromDirectReportName?: string;
  toDirectReportId?: number;
  toDirectReportName?: string;
  salaryAdjustment?: number;
  approvalInstanceId?: number;
  transferDate?: string;
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

/** 调岗历史 */
export interface TransferHistoryItem {
  id: number;
  fromDepartmentName: string;
  toDepartmentName: string;
  fromPositionName: string;
  toPositionName: string;
  fromJobLevel?: string;
  toJobLevel?: string;
  transferDate: string;
  reason?: string;
}
