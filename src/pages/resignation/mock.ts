import { RESIGNATION_STATUS, RESIGNATION_TYPE } from '@/constants';

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

/** Mock 离职列表 */
export const resignationList: ResignationRecord[] = [
  {
    id: 601,
    employeeId: 1004,
    employeeName: '赵六',
    employeeNo: '202401004',
    departmentName: '市场部',
    positionName: '市场专员',
    resignationDate: '2026-07-31',
    resignationType: RESIGNATION_TYPE.VOLUNTARY,
    resignationTypeDesc: '辞职',
    status: RESIGNATION_STATUS.PENDING,
    statusDesc: '审批中',
    applicantName: 'HR管理员',
    createTime: '2026-07-15T10:00:00',
  },
  {
    id: 602,
    employeeId: 1009,
    employeeName: '冯十二',
    employeeNo: '202401009',
    departmentName: '技术部',
    positionName: '后端工程师',
    resignationDate: '2026-07-20',
    resignationType: RESIGNATION_TYPE.DISMISSAL,
    resignationTypeDesc: '辞退',
    status: RESIGNATION_STATUS.APPROVED,
    statusDesc: '待离职',
    applicantName: 'HR管理员',
    createTime: '2026-07-10T14:00:00',
  },
  {
    id: 603,
    employeeId: 1010,
    employeeName: '陈十三',
    employeeNo: '202401010',
    departmentName: '运营部',
    positionName: '运营专员',
    resignationDate: '2026-06-30',
    resignationType: RESIGNATION_TYPE.CONTRACT_EXPIRE,
    resignationTypeDesc: '合同到期不续签',
    status: RESIGNATION_STATUS.RESIGNED,
    statusDesc: '已离职',
    applicantName: 'HR管理员',
    createTime: '2026-06-15T09:00:00',
  },
  {
    id: 604,
    employeeId: 1011,
    employeeName: '褚十四',
    employeeNo: '202401011',
    departmentName: '人事行政部',
    positionName: 'HR 助理',
    resignationDate: '2026-08-15',
    resignationType: RESIGNATION_TYPE.VOLUNTARY,
    resignationTypeDesc: '辞职',
    status: RESIGNATION_STATUS.DRAFT,
    statusDesc: '草稿',
    applicantName: 'HR管理员',
    createTime: '2026-07-14T16:00:00',
  },
  {
    id: 605,
    employeeId: 1012,
    employeeName: '卫十五',
    employeeNo: '202401012',
    departmentName: '产品部',
    positionName: '产品助理',
    resignationDate: '2026-07-10',
    resignationType: RESIGNATION_TYPE.OTHER,
    resignationTypeDesc: '其他',
    status: RESIGNATION_STATUS.REJECTED,
    statusDesc: '已拒绝',
    applicantName: 'HR管理员',
    createTime: '2026-07-05T11:00:00',
  },
];

/** Mock 离职详情 */
export const resignationDetails: Record<number, ResignationDetail> = {
  601: {
    ...resignationList[0],
    reason: '个人职业发展规划，已找到新的工作机会，申请离职。',
    handoverToId: 1002,
    handoverToName: '李四',
    approvalInstanceId: 6001,
    approvalProgress: {
      instanceId: 6001,
      currentNodeOrder: 1,
      nodes: [
        { nodeId: 50, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 400, approverName: '马总', status: 1, statusDesc: '待审批' },
        { nodeId: 51, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 1, statusDesc: '待审批' },
      ],
    },
  },
  602: {
    ...resignationList[1],
    reason: '绩效连续不达标，经沟通后决定辞退。已结清薪资及补偿金。',
    handoverToId: 1005,
    handoverToName: '孙七',
    actualResignationDate: '2026-07-20',
    approvalProgress: {
      instanceId: 6002,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 52, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 100, approverName: '陈工', status: 2, statusDesc: '已通过', comment: '同意离职，交接已完成', operateTime: '2026-07-11T09:00:00' },
        { nodeId: 53, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 2, statusDesc: '已通过', comment: '已确认，待离职', operateTime: '2026-07-12T14:00:00' },
      ],
    },
  },
  603: {
    ...resignationList[2],
    reason: '合同到期，公司决定不续签。',
    handoverToId: 1001,
    handoverToName: '张三',
    actualResignationDate: '2026-06-30',
    approvalProgress: {
      instanceId: 6003,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 54, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 300, approverName: '赵经理', status: 2, statusDesc: '已通过', comment: '已确认', operateTime: '2026-06-16T10:00:00' },
        { nodeId: 55, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 2, statusDesc: '已通过', comment: '已归档', operateTime: '2026-06-17T11:00:00' },
      ],
    },
  },
  604: {
    ...resignationList[3],
    reason: '',
    handoverToId: 1008,
    handoverToName: '钱十一',
    approvalProgress: undefined,
  },
  605: {
    ...resignationList[4],
    reason: '因个人健康原因申请离职。',
    handoverToId: 1003,
    handoverToName: '王五',
    approvalProgress: {
      instanceId: 6005,
      currentNodeOrder: 0,
      nodes: [
        { nodeId: 58, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 200, approverName: '王总', status: 2, statusDesc: '已通过', comment: '尊重个人选择', operateTime: '2026-07-06T09:00:00' },
        { nodeId: 59, nodeName: 'HR负责人审批', nodeOrder: 2, approverId: 302, approverName: '刘经理', status: 3, statusDesc: '已拒绝', comment: '当前项目工期紧张，建议延期', operateTime: '2026-07-07T10:00:00' },
      ],
    },
  },
};
