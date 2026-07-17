/** 入职申请状态枚举 */
export type OnboardingStatus =
  | 'draft' // 草稿
  | 'approving' // 审批中
  | 'approved' // 已批准待入职
  | 'rejected' // 已拒绝
  | 'onboarded'; // 已入职

/** 入职状态中文映射 */
export const OnboardingStatusMap: Record<OnboardingStatus, string> = {
  draft: '草稿',
  approving: '审批中',
  approved: '已批准待入职',
  rejected: '已拒绝',
  onboarded: '已入职',
};

/** 入职申请记录 */
export interface OnboardingRecord {
  id: number;
  name: string;
  phone: string;
  avatarColor: string;
  department: string;
  position: string;
  employmentType: string; // 全职/兼职/实习
  expectedHireDate: string; // 预计入职日期
  status: OnboardingStatus;
}

/** Mock 数据 */
export const onboardingList: OnboardingRecord[] = [
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    avatarColor: '#1677ff',
    department: '技术部',
    position: '前端工程师',
    employmentType: '全职',
    expectedHireDate: '2026-07-15',
    status: 'draft',
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    avatarColor: '#eb2f96',
    department: '产品部',
    position: '产品经理',
    employmentType: '全职',
    expectedHireDate: '2026-07-20',
    status: 'approving',
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138003',
    avatarColor: '#722ed1',
    department: '运营部',
    position: '运营专员',
    employmentType: '全职',
    expectedHireDate: '2026-07-10',
    status: 'approved',
  },
  {
    id: 4,
    name: '赵六',
    phone: '13800138004',
    avatarColor: '#fa541c',
    department: '市场部',
    position: '市场专员',
    employmentType: '兼职',
    expectedHireDate: '2026-07-05',
    status: 'rejected',
  },
  {
    id: 5,
    name: '孙七',
    phone: '13800138005',
    avatarColor: '#13c2c2',
    department: '技术部',
    position: '后端工程师',
    employmentType: '全职',
    expectedHireDate: '2026-06-01',
    status: 'onboarded',
  },
  {
    id: 6,
    name: '周八',
    phone: '13800138006',
    avatarColor: '#52c41a',
    department: '财务部',
    position: '财务分析师',
    employmentType: '全职',
    expectedHireDate: '2026-06-15',
    status: 'onboarded',
  },
  {
    id: 7,
    name: '吴九',
    phone: '13800138007',
    avatarColor: '#faad14',
    department: '技术部',
    position: '测试工程师',
    employmentType: '实习',
    expectedHireDate: '2026-07-25',
    status: 'approving',
  },
  {
    id: 8,
    name: '郑十',
    phone: '13800138008',
    avatarColor: '#2f54eb',
    department: '人事行政部',
    position: 'HR 专员',
    employmentType: '全职',
    expectedHireDate: '2026-08-01',
    status: 'draft',
  },
];
