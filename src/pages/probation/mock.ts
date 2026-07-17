import { PROBATION_STATUS, PROBATION_RESULT } from '@/constants';

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

/** Mock 转正列表 */
export const probationList: ProbationRecord[] = [
  {
    id: 301,
    employeeId: 1001,
    employeeName: '张三',
    employeeNo: '202401001',
    departmentName: '技术部',
    positionName: '前端工程师',
    probationStartDate: '2026-04-01',
    probationEndDate: '2026-06-30',
    status: PROBATION_STATUS.PENDING,
    statusDesc: '审批中',
    createTime: '2026-06-20T10:00:00',
  },
  {
    id: 302,
    employeeId: 1002,
    employeeName: '李四',
    employeeNo: '202401002',
    departmentName: '产品部',
    positionName: '产品助理',
    probationStartDate: '2026-03-15',
    probationEndDate: '2026-06-14',
    status: PROBATION_STATUS.COMPLETED,
    statusDesc: '已完成',
    result: PROBATION_RESULT.PASS,
    resultDesc: '通过',
    createTime: '2026-06-10T09:00:00',
  },
  {
    id: 303,
    employeeId: 1003,
    employeeName: '王五',
    employeeNo: '202401003',
    departmentName: '运营部',
    positionName: '运营专员',
    probationStartDate: '2026-03-01',
    probationEndDate: '2026-05-31',
    status: PROBATION_STATUS.COMPLETED,
    statusDesc: '已完成',
    result: PROBATION_RESULT.EXTEND,
    resultDesc: '延长试用',
    createTime: '2026-05-25T14:00:00',
  },
  {
    id: 304,
    employeeId: 1004,
    employeeName: '赵六',
    employeeNo: '202401004',
    departmentName: '市场部',
    positionName: '市场专员',
    probationStartDate: '2026-02-01',
    probationEndDate: '2026-04-30',
    status: PROBATION_STATUS.REJECTED,
    statusDesc: '已拒绝',
    result: PROBATION_RESULT.FAIL,
    resultDesc: '不通过',
    createTime: '2026-04-20T11:00:00',
  },
  {
    id: 305,
    employeeId: 1005,
    employeeName: '孙七',
    employeeNo: '202401005',
    departmentName: '技术部',
    positionName: '后端工程师',
    probationStartDate: '2026-06-01',
    probationEndDate: '2026-08-31',
    status: PROBATION_STATUS.DRAFT,
    statusDesc: '草稿',
    createTime: '2026-08-20T09:00:00',
  },
];

/** Mock 待转正员工列表 */
export const pendingEmployees: PendingProbationEmployee[] = [
  {
    employeeId: 1005,
    employeeName: '孙七',
    employeeNo: '202401005',
    departmentName: '技术部',
    positionName: '后端工程师',
    hireDate: '2026-06-01',
    probationEndDate: '2026-08-31',
    daysRemaining: 7,
    hasPendingApplication: false,
  },
  {
    employeeId: 1006,
    employeeName: '周八',
    employeeNo: '202402006',
    departmentName: '财务部',
    positionName: '财务分析师',
    hireDate: '2026-06-15',
    probationEndDate: '2026-09-14',
    daysRemaining: 5,
    hasPendingApplication: false,
  },
  {
    employeeId: 1007,
    employeeName: '吴九',
    employeeNo: '202401007',
    departmentName: '技术部',
    positionName: '测试工程师',
    hireDate: '2026-06-10',
    probationEndDate: '2026-09-09',
    daysRemaining: 3,
    hasPendingApplication: false,
  },
];

/** Mock 转正详情 */
export const probationDetails: Record<number, ProbationDetail> = {
  301: {
    ...probationList[0],
    jobLevel: 'P5',
    hireDate: '2026-04-01',
    probationMonths: 3,
    performanceReview: '该员工在试用期内表现积极，技术能力符合岗位要求，团队协作良好，建议按期转正。',
    approvalInstanceId: 3001,
    approvalProgress: {
      instanceId: 3001,
      currentNodeOrder: 1,
      nodes: [
        { nodeId: 10, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 100, approverName: '陈工', status: 1, statusDesc: '待审批' },
        { nodeId: 11, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 1, statusDesc: '待审批' },
      ],
    },
  },
  302: {
    ...probationList[1],
    jobLevel: 'P4',
    hireDate: '2026-03-15',
    probationMonths: 3,
    performanceReview: '学习能力强，已能独立承担日常产品工作。',
    salaryAdjustment: 1000,
    approvalProgress: {
      instanceId: 3002,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 12, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 200, approverName: '王总', status: 2, statusDesc: '已通过', comment: '表现优秀', operateTime: '2026-06-11T09:00:00' },
        { nodeId: 13, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 2, statusDesc: '已通过', comment: '同意转正', operateTime: '2026-06-12T14:00:00' },
      ],
    },
  },
  303: {
    ...probationList[2],
    jobLevel: 'S3',
    hireDate: '2026-03-01',
    probationMonths: 3,
    performanceReview: '基本完成工作任务，但独立性和效率有待提升，建议延长试用期一个月。',
    extendedEndDate: '2026-06-30',
    approvalProgress: {
      instanceId: 3003,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 14, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 300, approverName: '赵经理', status: 2, statusDesc: '已通过', comment: '建议延长试用', operateTime: '2026-05-26T10:00:00' },
        { nodeId: 15, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 2, statusDesc: '已通过', comment: '同意', operateTime: '2026-05-27T11:00:00' },
      ],
    },
  },
  304: {
    ...probationList[3],
    jobLevel: 'S2',
    hireDate: '2026-02-01',
    probationMonths: 3,
    performanceReview: '试用期考核未达标，多次迟到旷工。',
    approvalProgress: {
      instanceId: 3004,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 16, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 400, approverName: '马总', status: 2, statusDesc: '已通过', comment: '建议不通过转正', operateTime: '2026-04-21T09:00:00' },
        { nodeId: 17, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 3, statusDesc: '已拒绝', comment: '转正不通过', operateTime: '2026-04-21T16:00:00' },
      ],
    },
  },
  305: {
    ...probationList[4],
    jobLevel: 'P5',
    hireDate: '2026-06-01',
    probationMonths: 3,
    performanceReview: '',
    approvalProgress: undefined,
  },
};
