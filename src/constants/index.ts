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
  [BIZ_TYPE.ONBOARDING]: '/onboarding/detail',
  [BIZ_TYPE.PROBATION]: '/probation/detail',
  [BIZ_TYPE.TRANSFER]: '/transfer/detail',
  [BIZ_TYPE.RESIGNATION]: '/resignation/detail',
  [BIZ_TYPE.LEAVE]: '/attendance/leave/detail',
  [BIZ_TYPE.CARD_REPLENISH]: '/attendance/replenish/detail',
  [BIZ_TYPE.SALARY_BATCH]: '/salary/batch/detail',
};

export const OVERDUE_HOURS = 48;
