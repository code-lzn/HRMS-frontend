export const DEFAULT_NAME = 'Umi Max';

// ==================== 审批中心 ====================

export const BIZ_TYPE = {
  ONBOARDING: 'ONBOARDING',
  PROBATION: 'PROBATION',
  TRANSFER: 'TRANSFER',
  RESIGNATION: 'RESIGNATION',
  LEAVE: 'LEAVE',
  CARD_REPLENISH: 'CARD_REPLENISH',
  SALARY_BATCH: 'SALARY_BATCH',
} as const;

export const BIZ_TYPE_TABS = [
  { key: '', label: '全部' },
  { key: BIZ_TYPE.ONBOARDING, label: '入职审批' },
  { key: BIZ_TYPE.PROBATION, label: '转正审批' },
  { key: BIZ_TYPE.TRANSFER, label: '调岗审批' },
  { key: BIZ_TYPE.RESIGNATION, label: '离职审批' },
  { key: BIZ_TYPE.LEAVE, label: '请假审批' },
  { key: BIZ_TYPE.CARD_REPLENISH, label: '补卡审批' },
  { key: BIZ_TYPE.SALARY_BATCH, label: '薪资批次审批' },
];

export const NODE_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 3, TRANSFERRED: 4, TIMEOUT: 5 } as const;

export const INSTANCE_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 3, CANCELLED: 4 } as const;

export const NODE_STATUS_COLOR: Record<number, string> = {
  [NODE_STATUS.PENDING]: 'blue',
  [NODE_STATUS.APPROVED]: 'green',
  [NODE_STATUS.REJECTED]: 'red',
  [NODE_STATUS.TRANSFERRED]: 'orange',
  [NODE_STATUS.TIMEOUT]: 'red',
};

export const INSTANCE_STATUS_COLOR: Record<number, string> = {
  [INSTANCE_STATUS.PENDING]: 'blue',
  [INSTANCE_STATUS.APPROVED]: 'green',
  [INSTANCE_STATUS.REJECTED]: 'red',
  [INSTANCE_STATUS.CANCELLED]: 'default',
};

export const BIZ_TYPE_ROUTE_MAP: Record<string, string> = {
  [BIZ_TYPE.ONBOARDING]: '/hr-change/onboarding',
  [BIZ_TYPE.PROBATION]: '/hr-change/probation',
  [BIZ_TYPE.TRANSFER]: '/hr-change/transfer',
  [BIZ_TYPE.RESIGNATION]: '/hr-change/resignation',
  [BIZ_TYPE.LEAVE]: '/attendance/leave/detail',
  [BIZ_TYPE.CARD_REPLENISH]: '/attendance/replenish/detail',
  [BIZ_TYPE.SALARY_BATCH]: '/salary/batch/detail',
};

export const OVERDUE_HOURS = 48;

// ==================== 入转调离 ====================

/** 入职申请状态 */
export const ONBOARDING_STATUS = {
  DRAFT: 1,
  PENDING: 2,
  APPROVED_PENDING_JOIN: 3,
  JOINED: 4,
  REJECTED: 5,
  ABANDONED: 7,
} as const;

export const ONBOARDING_STATUS_MAP: Record<number, string> = {
  [ONBOARDING_STATUS.DRAFT]: '草稿',
  [ONBOARDING_STATUS.PENDING]: '审批中',
  [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: '已批准待入职',
  [ONBOARDING_STATUS.JOINED]: '已入职',
  [ONBOARDING_STATUS.REJECTED]: '已拒绝',
  [ONBOARDING_STATUS.ABANDONED]: '已放弃',
};

export const ONBOARDING_STATUS_COLOR: Record<number, string> = {
  [ONBOARDING_STATUS.DRAFT]: 'default',
  [ONBOARDING_STATUS.PENDING]: 'processing',
  [ONBOARDING_STATUS.APPROVED_PENDING_JOIN]: 'blue',
  [ONBOARDING_STATUS.JOINED]: 'success',
  [ONBOARDING_STATUS.REJECTED]: 'error',
  [ONBOARDING_STATUS.ABANDONED]: 'default',
};

/** 转正申请状态 */
export const PROBATION_STATUS = {
  DRAFT: 1,
  PENDING: 2,
  COMPLETED: 3,
  REJECTED: 4,
} as const;

export const PROBATION_STATUS_MAP: Record<number, string> = {
  [PROBATION_STATUS.DRAFT]: '草稿',
  [PROBATION_STATUS.PENDING]: '审批中',
  [PROBATION_STATUS.COMPLETED]: '已完成',
  [PROBATION_STATUS.REJECTED]: '已拒绝',
};

export const PROBATION_STATUS_COLOR: Record<number, string> = {
  [PROBATION_STATUS.DRAFT]: 'default',
  [PROBATION_STATUS.PENDING]: 'processing',
  [PROBATION_STATUS.COMPLETED]: 'success',
  [PROBATION_STATUS.REJECTED]: 'error',
};

/** 转正结果 */
export const PROBATION_RESULT = {
  PASS: 1,
  EXTEND: 2,
  FAIL: 3,
} as const;

export const PROBATION_RESULT_MAP: Record<number, string> = {
  [PROBATION_RESULT.PASS]: '通过',
  [PROBATION_RESULT.EXTEND]: '延长试用',
  [PROBATION_RESULT.FAIL]: '不通过',
};

export const PROBATION_RESULT_COLOR: Record<number, string> = {
  [PROBATION_RESULT.PASS]: 'success',
  [PROBATION_RESULT.EXTEND]: 'warning',
  [PROBATION_RESULT.FAIL]: 'error',
};

/** 调岗申请状态 */
export const TRANSFER_STATUS = {
  DRAFT: 1,
  PENDING: 2,
  EFFECTIVE: 3,
  REJECTED: 4,
} as const;

export const TRANSFER_STATUS_MAP: Record<number, string> = {
  [TRANSFER_STATUS.DRAFT]: '草稿',
  [TRANSFER_STATUS.PENDING]: '审批中',
  [TRANSFER_STATUS.EFFECTIVE]: '已生效',
  [TRANSFER_STATUS.REJECTED]: '已拒绝',
};

export const TRANSFER_STATUS_COLOR: Record<number, string> = {
  [TRANSFER_STATUS.DRAFT]: 'default',
  [TRANSFER_STATUS.PENDING]: 'processing',
  [TRANSFER_STATUS.EFFECTIVE]: 'success',
  [TRANSFER_STATUS.REJECTED]: 'error',
};

/** 离职申请状态 */
export const RESIGNATION_STATUS = {
  DRAFT: 1,
  PENDING: 2,
  APPROVED: 3,
  RESIGNED: 4,
  REJECTED: 5,
} as const;

export const RESIGNATION_STATUS_MAP: Record<number, string> = {
  [RESIGNATION_STATUS.DRAFT]: '草稿',
  [RESIGNATION_STATUS.PENDING]: '审批中',
  [RESIGNATION_STATUS.APPROVED]: '待离职',
  [RESIGNATION_STATUS.RESIGNED]: '已离职',
  [RESIGNATION_STATUS.REJECTED]: '已拒绝',
};

export const RESIGNATION_STATUS_COLOR: Record<number, string> = {
  [RESIGNATION_STATUS.DRAFT]: 'default',
  [RESIGNATION_STATUS.PENDING]: 'processing',
  [RESIGNATION_STATUS.APPROVED]: 'warning',
  [RESIGNATION_STATUS.RESIGNED]: 'default',
  [RESIGNATION_STATUS.REJECTED]: 'error',
};

/** 离职类型 */
export const RESIGNATION_TYPE = {
  VOLUNTARY: 1,
  DISMISSAL: 2,
  CONTRACT_EXPIRE: 3,
  OTHER: 4,
} as const;

export const RESIGNATION_TYPE_MAP: Record<number, string> = {
  [RESIGNATION_TYPE.VOLUNTARY]: '辞职',
  [RESIGNATION_TYPE.DISMISSAL]: '辞退',
  [RESIGNATION_TYPE.CONTRACT_EXPIRE]: '合同到期不续签',
  [RESIGNATION_TYPE.OTHER]: '其他',
};
