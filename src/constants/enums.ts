/**
 * 枚举映射常量
 * 包含在职状态、职位序列、合同类型等业务枚举
 */

// ==================== 员工在职状态 ====================
export const EMPLOYEE_STATUS_MAP: Record<number, string> = {
  1: '试用期',
  2: '正式',
  3: '待离职',
  4: '已离职',
};

export const STATUS_COLOR_MAP: Record<number, string> = {
  1: 'blue',
  2: 'green',
  3: 'orange',
  4: 'default',
};

// ==================== 性别 ====================
export const GENDER_MAP: Record<number, string> = {
  1: '男',
  2: '女',
};

// ==================== 入职类型 ====================
export const HIRE_TYPE_MAP: Record<number, string> = {
  1: '全职',
  2: '兼职',
  3: '实习',
};

// ==================== 合同类型 ====================
export const CONTRACT_TYPE_MAP: Record<number, string> = {
  1: '固定期限',
  2: '无固定期限',
  3: '劳务合同',
};

// ==================== 职位序列 ====================
export const SEQUENCE_MAP: Record<
  number,
  { name: string; desc: string; color: string }
> = {
  1: { name: 'M', desc: '管理序列', color: 'blue' },
  2: { name: 'P', desc: '专业序列', color: 'green' },
  3: { name: 'S', desc: '支持序列', color: 'default' },
};

// ==================== 变更类型 ====================
export const CHANGE_TYPE_MAP: Record<string, { text: string; color: string }> =
  {
    DIRECT_EDIT: { text: '直接编辑', color: 'blue' },
    FLOW_CHANGE: { text: '流程变更', color: 'orange' },
    SYSTEM: { text: '系统操作', color: 'default' },
  };

// ==================== 序列职级范围联动 ====================
export const LEVEL_RANGE_BY_SEQUENCE: Record<
  number,
  { min: number; max: number; prefix: string }
> = {
  1: { min: 1, max: 5, prefix: 'M' },
  2: { min: 1, max: 10, prefix: 'P' },
  3: { min: 1, max: 5, prefix: 'S' },
};

// ==================== 锁定字段提示文案 ====================
export const LOCKED_FIELD_MESSAGES: Record<string, string> = {
  phone: '修改手机号需走申请流程，请联系HR',
  idCard: '身份证号不可编辑',
  departmentName: '修改部门需走调岗流程',
  departmentId: '修改部门需走调岗流程',
  positionName: '修改职位需走调岗流程',
  positionId: '修改职位需走调岗流程',
  jobLevel: '修改职级需走调岗流程',
  directReportName: '修改汇报关系需走调岗流程',
  directReportId: '修改汇报关系需走调岗流程',
  workLocation: '修改工作地点需走调岗流程',
};

// ==================== 考勤班次类型 ====================
export const SHIFT_TYPE_MAP: Record<number, string> = {
  1: '固定班',
  2: '弹性班',
  3: '排班制',
};

export const SHIFT_TYPE_OPTIONS = [
  { label: '固定班', value: 1 },
  { label: '弹性班', value: 2 },
  { label: '排班制', value: 3 },
];

// ==================== 考勤规则类型 ====================
export const ATTENDANCE_RULE_TYPE_MAP: Record<number, string> = {
  1: '按部门',
  2: '按职位',
  3: '按个人',
};

export const ATTENDANCE_RULE_TYPE_OPTIONS = [
  { label: '按部门', value: 1 },
  { label: '按职位', value: 2 },
  { label: '按个人', value: 3 },
];

// ==================== 角色常量 ====================
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  DEPT_HEAD: 'dept_head',
  FINANCE: 'finance',
  EMPLOYEE: 'employee',
} as const;
