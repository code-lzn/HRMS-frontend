/** 离职申请记录 */
export interface ResignationRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  positionName: string;
  resignationDate: string;
  resignationType: number;
  resignationTypeDesc: string;
  status: number;
  statusDesc: string;
  applicantName: string;
  createTime: string;
}

/** 离职详情 */
export interface ResignationDetail extends ResignationRecord {
  reason: string;
  handoverToId: number;
  handoverToName: string;
  actualResignationDate?: string;
  approvalInstanceId?: number;
  remark?: string;
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
