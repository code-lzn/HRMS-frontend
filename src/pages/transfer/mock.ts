import { TRANSFER_STATUS } from '@/constants';

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

/** Mock 调岗列表 */
export const transferList: TransferRecord[] = [
  {
    id: 401,
    employeeId: 1001,
    employeeName: '张三',
    employeeNo: '202401001',
    fromDepartmentName: '技术部',
    toDepartmentName: '产品部',
    fromPositionName: '前端工程师',
    toPositionName: '产品经理',
    status: TRANSFER_STATUS.PENDING,
    statusDesc: '审批中',
    createTime: '2026-07-10T10:00:00',
  },
  {
    id: 402,
    employeeId: 1003,
    employeeName: '王五',
    employeeNo: '202401003',
    fromDepartmentName: '运营部',
    toDepartmentName: '市场部',
    fromPositionName: '运营专员',
    toPositionName: '市场主管',
    status: TRANSFER_STATUS.EFFECTIVE,
    statusDesc: '已生效',
    reason: '业务发展需要',
    createTime: '2026-06-15T09:00:00',
  },
  {
    id: 403,
    employeeId: 1008,
    employeeName: '钱十一',
    employeeNo: '202401008',
    fromDepartmentName: '人事行政部',
    toDepartmentName: '运营部',
    fromPositionName: 'HR 专员',
    toPositionName: '运营经理',
    status: TRANSFER_STATUS.DRAFT,
    statusDesc: '草稿',
    createTime: '2026-07-14T16:00:00',
  },
  {
    id: 404,
    employeeId: 1009,
    employeeName: '冯十二',
    employeeNo: '202401009',
    fromDepartmentName: '技术部',
    toDepartmentName: '技术部',
    fromPositionName: '后端工程师',
    toPositionName: '技术经理',
    status: TRANSFER_STATUS.REJECTED,
    statusDesc: '已拒绝',
    reason: '编制不足',
    createTime: '2026-07-05T11:00:00',
  },
];

/** Mock 调岗详情 */
export const transferDetails: Record<number, TransferDetail> = {
  401: {
    ...transferList[0],
    fromDepartmentId: 10,
    toDepartmentId: 20,
    fromPositionId: 101,
    toPositionId: 201,
    fromJobLevel: 'P5',
    toJobLevel: 'P5',
    fromDirectReportId: 100,
    fromDirectReportName: '陈工',
    toDirectReportId: 200,
    toDirectReportName: '王总',
    reason: '张三长期参与产品相关工作，具备产品思维，经沟通后申请调至产品部担任产品经理。',
    approvalInstanceId: 4001,
    approvalProgress: {
      instanceId: 4001,
      currentNodeOrder: 2,
      nodes: [
        { nodeId: 30, nodeName: '原部门负责人审批', nodeOrder: 1, approverId: 100, approverName: '陈工', status: 2, statusDesc: '已通过', comment: '认同该调动，支持', operateTime: '2026-07-11T09:00:00' },
        { nodeId: 31, nodeName: '新部门负责人审批', nodeOrder: 2, approverId: 200, approverName: '王总', status: 1, statusDesc: '待审批' },
        { nodeId: 32, nodeName: 'HR负责人备案', nodeOrder: 3, approverId: 302, approverName: '刘经理', status: 1, statusDesc: '待审批' },
      ],
    },
  },
  402: {
    ...transferList[1],
    fromDepartmentId: 30,
    toDepartmentId: 40,
    fromPositionId: 301,
    toPositionId: 402,
    fromJobLevel: 'S3',
    toJobLevel: 'S4',
    fromDirectReportId: 300,
    fromDirectReportName: '赵经理',
    toDirectReportId: 400,
    toDirectReportName: '马总',
    reason: '市场部拓展业务线，急需有运营背景的主管人员。调岗并晋升。',
    transferDate: '2026-06-20',
    approvalProgress: {
      instanceId: 4002,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 33, nodeName: '原部门负责人审批', nodeOrder: 1, approverId: 300, approverName: '赵经理', status: 2, statusDesc: '已通过', comment: '支持', operateTime: '2026-06-16T09:00:00' },
        { nodeId: 34, nodeName: '新部门负责人审批', nodeOrder: 2, approverId: 400, approverName: '马总', status: 2, statusDesc: '已通过', comment: '欢迎加入', operateTime: '2026-06-17T10:00:00' },
        { nodeId: 35, nodeName: 'HR负责人备案', nodeOrder: 3, approverId: 302, approverName: '刘经理', status: 2, statusDesc: '已通过', comment: '已备案', operateTime: '2026-06-18T14:00:00' },
      ],
    },
  },
  403: {
    ...transferList[2],
    fromDepartmentId: 60,
    toDepartmentId: 30,
    fromPositionId: 601,
    toPositionId: 302,
    fromJobLevel: 'S3',
    toJobLevel: 'S4',
    reason: '运营部经理岗位空缺，该员工有丰富的协调管理经验。',
    approvalProgress: undefined,
  },
  404: {
    ...transferList[3],
    fromDepartmentId: 10,
    toDepartmentId: 10,
    fromPositionId: 102,
    toPositionId: 104,
    fromJobLevel: 'P5',
    toJobLevel: 'M1',
    fromDirectReportId: 102,
    fromDirectReportName: '张工',
    toDirectReportId: 100,
    toDirectReportName: '陈工',
    reason: '技术团队扩展，需要新增一名技术经理。',
    salaryAdjustment: 3000,
    approvalProgress: {
      instanceId: 4004,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 39, nodeName: '原部门负责人审批', nodeOrder: 1, approverId: 100, approverName: '陈工', status: 2, statusDesc: '已通过', comment: '推荐晋升', operateTime: '2026-07-06T09:00:00' },
        { nodeId: 40, nodeName: '新部门负责人审批', nodeOrder: 2, approverId: 100, approverName: '陈工', status: 2, statusDesc: '已通过', comment: '同意', operateTime: '2026-07-06T10:00:00' },
        { nodeId: 41, nodeName: 'HR负责人备案', nodeOrder: 3, approverId: 302, approverName: '刘经理', status: 3, statusDesc: '已拒绝', comment: '当前编制已满，暂不批准', operateTime: '2026-07-07T11:00:00' },
      ],
    },
  },
};

/** Mock 调岗历史 */
export const transferHistory: Record<number, TransferHistoryItem[]> = {
  1001: [
    { id: 501, fromDepartmentName: '技术部', toDepartmentName: '产品部', fromPositionName: '前端工程师', toPositionName: '产品经理', fromJobLevel: 'P5', toJobLevel: 'P5', transferDate: '2026-06-20', reason: '个人发展意愿' },
    { id: 502, fromDepartmentName: '产品部', toDepartmentName: '技术部', fromPositionName: '产品经理', toPositionName: '高级前端', fromJobLevel: 'P5', toJobLevel: 'P6', transferDate: '2025-12-01', reason: '回归技术线' },
  ],
};
