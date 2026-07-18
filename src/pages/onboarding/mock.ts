import { ONBOARDING_STATUS } from '@/constants';

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

/** Mock 入职列表数据 */
export const onboardingList: OnboardingRecord[] = [
  {
    id: 1,
    name: '张三',
    phone: '138****8001',
    departmentId: 10,
    departmentName: '技术部',
    positionId: 101,
    positionName: '前端工程师',
    expectedHireDate: '2026-07-15',
    status: ONBOARDING_STATUS.DRAFT,
    statusDesc: '草稿',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-07-10T09:30:00',
    avatarColor: '#1677ff',
  },
  {
    id: 2,
    name: '李四',
    phone: '138****8002',
    departmentId: 20,
    departmentName: '产品部',
    positionId: 201,
    positionName: '产品经理',
    expectedHireDate: '2026-07-20',
    status: ONBOARDING_STATUS.PENDING,
    statusDesc: '审批中',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-07-11T14:00:00',
    avatarColor: '#eb2f96',
  },
  {
    id: 3,
    name: '王五',
    phone: '138****8003',
    departmentId: 30,
    departmentName: '运营部',
    positionId: 301,
    positionName: '运营专员',
    expectedHireDate: '2026-07-10',
    status: ONBOARDING_STATUS.APPROVED_PENDING_JOIN,
    statusDesc: '已批准待入职',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-07-05T10:00:00',
    avatarColor: '#722ed1',
  },
  {
    id: 4,
    name: '赵六',
    phone: '138****8004',
    departmentId: 40,
    departmentName: '市场部',
    positionId: 401,
    positionName: '市场专员',
    expectedHireDate: '2026-07-05',
    status: ONBOARDING_STATUS.REJECTED,
    statusDesc: '已拒绝',
    hireType: 2,
    hireTypeDesc: '兼职',
    applicantName: 'HR管理员',
    createTime: '2026-07-01T08:00:00',
    avatarColor: '#fa541c',
  },
  {
    id: 5,
    name: '孙七',
    phone: '138****8005',
    departmentId: 10,
    departmentName: '技术部',
    positionId: 102,
    positionName: '后端工程师',
    expectedHireDate: '2026-06-01',
    status: ONBOARDING_STATUS.JOINED,
    statusDesc: '已入职',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-05-20T11:00:00',
    avatarColor: '#13c2c2',
  },
  {
    id: 6,
    name: '周八',
    phone: '138****8006',
    departmentId: 50,
    departmentName: '财务部',
    positionId: 501,
    positionName: '财务分析师',
    expectedHireDate: '2026-06-15',
    status: ONBOARDING_STATUS.JOINED,
    statusDesc: '已入职',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-06-01T09:00:00',
    avatarColor: '#52c41a',
  },
  {
    id: 7,
    name: '吴九',
    phone: '138****8007',
    departmentId: 10,
    departmentName: '技术部',
    positionId: 103,
    positionName: '测试工程师',
    expectedHireDate: '2026-07-25',
    status: ONBOARDING_STATUS.PENDING,
    statusDesc: '审批中',
    hireType: 3,
    hireTypeDesc: '实习',
    applicantName: 'HR管理员',
    createTime: '2026-07-12T16:00:00',
    avatarColor: '#faad14',
  },
  {
    id: 8,
    name: '郑十',
    phone: '138****8008',
    departmentId: 60,
    departmentName: '人事行政部',
    positionId: 601,
    positionName: 'HR 专员',
    expectedHireDate: '2026-08-01',
    status: ONBOARDING_STATUS.DRAFT,
    statusDesc: '草稿',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-07-13T10:30:00',
    avatarColor: '#2f54eb',
  },
  {
    id: 9,
    name: '陈十一',
    phone: '138****8009',
    departmentId: 10,
    departmentName: '技术部',
    positionId: 104,
    positionName: '运维工程师',
    expectedHireDate: '2026-07-10',
    status: ONBOARDING_STATUS.ABANDONED,
    statusDesc: '已放弃',
    hireType: 1,
    hireTypeDesc: '全职',
    applicantName: 'HR管理员',
    createTime: '2026-07-01T09:00:00',
    avatarColor: '#722ed1',
  },
];

/** Mock 入职详情数据 */
export const onboardingDetails: Record<number, OnboardingDetail> = {
  1: {
    ...onboardingList[0],
    gender: 1,
    genderDesc: '男',
    email: 'zhangsan@example.com',
    idCard: '3301**********1234',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.8,
    directReportId: 100,
    directReportName: '陈工（技术总监）',
    updateTime: '2026-07-10T10:00:00',
  },
  2: {
    ...onboardingList[1],
    gender: 1,
    genderDesc: '男',
    email: 'lisi@example.com',
    idCard: '3301**********5678',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.85,
    directReportId: 200,
    directReportName: '王总（产品总监）',
    approvalInstanceId: 2001,
    approvalProgress: {
      instanceId: 2001,
      currentNodeOrder: 1,
      nodes: [
        {
          nodeId: 1,
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverId: 201,
          approverName: '王总',
          status: 1,
          statusDesc: '待审批',
        },
        {
          nodeId: 2,
          nodeName: 'HR负责人审批',
          nodeOrder: 2,
          approverId: 301,
          approverName: '刘经理',
          status: 1,
          statusDesc: '待审批',
        },
      ],
    },
    updateTime: '2026-07-11T15:00:00',
  },
  3: {
    ...onboardingList[2],
    gender: 2,
    genderDesc: '女',
    email: 'wangwu@example.com',
    idCard: '3301**********9012',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 2,
    probationRatio: 1.0,
    directReportId: 300,
    directReportName: '赵经理',
    approvalInstanceId: 2002,
    approvalProgress: {
      instanceId: 2002,
      currentNodeOrder: 0,
      nodes: [
        {
          nodeId: 3,
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverId: 301,
          approverName: '赵经理',
          status: 2,
          statusDesc: '已通过',
          comment: '同意入职',
          operateTime: '2026-07-06T09:00:00',
        },
        {
          nodeId: 4,
          nodeName: 'HR负责人审批',
          nodeOrder: 2,
          approverId: 302,
          approverName: '刘经理',
          status: 2,
          statusDesc: '已通过',
          comment: '审批通过',
          operateTime: '2026-07-07T14:00:00',
        },
      ],
    },
    updateTime: '2026-07-07T14:00:00',
  },
  4: {
    ...onboardingList[3],
    gender: 2,
    genderDesc: '女',
    email: 'zhaoliu@example.com',
    idCard: '3301**********3456',
    hireType: 2,
    hireTypeDesc: '兼职',
    probationMonths: 1,
    probationRatio: 1.0,
    approvalInstanceId: 2003,
    approvalProgress: {
      instanceId: 2003,
      currentNodeOrder: 2,
      nodes: [
        {
          nodeId: 5,
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverId: 401,
          approverName: '马总',
          status: 2,
          statusDesc: '已通过',
          comment: '同意',
          operateTime: '2026-07-02T10:00:00',
        },
        {
          nodeId: 6,
          nodeName: 'HR负责人审批',
          nodeOrder: 2,
          approverId: 302,
          approverName: '刘经理',
          status: 3,
          statusDesc: '已拒绝',
          comment: '该岗位暂不开放兼职编制',
          operateTime: '2026-07-02T16:00:00',
        },
      ],
    },
    updateTime: '2026-07-02T16:00:00',
  },
  5: {
    ...onboardingList[4],
    gender: 1,
    genderDesc: '男',
    email: 'sunqi@example.com',
    idCard: '3301**********7890',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.8,
    directReportId: 100,
    directReportName: '陈工',
    employeeId: 1005,
    employeeNo: '202401005',
    actualHireDate: '2026-06-01',
    updateTime: '2026-06-01T09:00:00',
  },
  6: {
    ...onboardingList[5],
    gender: 2,
    genderDesc: '女',
    email: 'zhouba@example.com',
    idCard: '3301**********2345',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.8,
    directReportId: 500,
    directReportName: '钱总监',
    employeeId: 1006,
    employeeNo: '202402006',
    actualHireDate: '2026-06-15',
    updateTime: '2026-06-15T09:00:00',
  },
  7: {
    ...onboardingList[6],
    gender: 2,
    genderDesc: '女',
    email: 'wujiu@example.com',
    idCard: '3301**********6789',
    hireType: 3,
    hireTypeDesc: '实习',
    probationMonths: 3,
    probationRatio: 1.0,
    directReportId: 102,
    directReportName: '张工',
    approvalInstanceId: 2004,
    approvalProgress: {
      instanceId: 2004,
      currentNodeOrder: 2,
      nodes: [
        {
          nodeId: 7,
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverId: 100,
          approverName: '陈工',
          status: 2,
          statusDesc: '已通过',
          comment: '实习生岗位已确认',
          operateTime: '2026-07-13T10:00:00',
        },
        {
          nodeId: 8,
          nodeName: 'HR负责人审批',
          nodeOrder: 2,
          approverId: 302,
          approverName: '刘经理',
          status: 1,
          statusDesc: '待审批',
        },
      ],
    },
    updateTime: '2026-07-13T10:00:00',
  },
  8: {
    ...onboardingList[7],
    gender: 1,
    genderDesc: '男',
    email: 'zhengshi@example.com',
    idCard: '3301**********0123',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.85,
    directReportId: 600,
    directReportName: '刘经理',
    updateTime: '2026-07-13T10:30:00',
  },
  9: {
    ...onboardingList[8],
    gender: 1,
    genderDesc: '男',
    email: 'chenshiyi@example.com',
    idCard: '3301**********4567',
    hireType: 1,
    hireTypeDesc: '全职',
    probationMonths: 3,
    probationRatio: 0.8,
    directReportId: 100,
    directReportName: '陈工',
    approvalInstanceId: 2005,
    approvalProgress: {
      instanceId: 2005,
      currentNodeOrder: 0,
      nodes: [
        {
          nodeId: 9,
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverId: 100,
          approverName: '陈工',
          status: 2,
          statusDesc: '已通过',
          comment: '同意入职',
          operateTime: '2026-07-02T09:00:00',
        },
        {
          nodeId: 10,
          nodeName: 'HR负责人审批',
          nodeOrder: 2,
          approverId: 302,
          approverName: '刘经理',
          status: 2,
          statusDesc: '已通过',
          comment: '审批通过，待入职',
          operateTime: '2026-07-03T14:00:00',
        },
      ],
    },
    updateTime: '2026-07-05T10:00:00',
  },
};

/** Mock 部门数据 */
export const mockDepartments = [
  { value: 10, label: '技术部' },
  { value: 20, label: '产品部' },
  { value: 30, label: '运营部' },
  { value: 40, label: '市场部' },
  { value: 50, label: '财务部' },
  { value: 60, label: '人事行政部' },
];

/** Mock 职位数据 */
export const mockPositions = [
  { value: 101, label: '前端工程师', departmentId: 10, probationMonths: 3, sequence: 2 },
  { value: 102, label: '后端工程师', departmentId: 10, probationMonths: 3, sequence: 2 },
  { value: 103, label: '测试工程师', departmentId: 10, probationMonths: 3, sequence: 2 },
  { value: 201, label: '产品经理', departmentId: 20, probationMonths: 3, sequence: 2 },
  { value: 301, label: '运营专员', departmentId: 30, probationMonths: 2, sequence: 3 },
  { value: 401, label: '市场专员', departmentId: 40, probationMonths: 2, sequence: 3 },
  { value: 501, label: '财务分析师', departmentId: 50, probationMonths: 3, sequence: 2 },
  { value: 601, label: 'HR 专员', departmentId: 60, probationMonths: 3, sequence: 3 },
];

/** Mock 员工列表（选择汇报人用） */
export const mockEmployees = [
  { value: 100, label: '陈工（技术总监）', departmentId: 10 },
  { value: 102, label: '张工（后端负责人）', departmentId: 10 },
  { value: 200, label: '王总（产品总监）', departmentId: 20 },
  { value: 300, label: '赵经理（运营经理）', departmentId: 30 },
  { value: 400, label: '马总（市场总监）', departmentId: 40 },
  { value: 500, label: '钱总监（财务总监）', departmentId: 50 },
  { value: 600, label: '刘经理（HR经理）', departmentId: 60 },
];
