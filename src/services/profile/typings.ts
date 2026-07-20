// ========== 我的档案 ==========
export interface ProfileVO {
  employeeId: number;
  employeeNo: string;
  name: string;
  gender: number;
  genderDesc: string;
  phone: string;
  email: string;
  idCard: string;
  birthday?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  departmentName: string;
  positionName: string;
  jobLevel?: string;
  status: number;
  statusDesc: string;
  hireDate: string;
  editableFields: string[];
  lockedFields: string[];
}

export interface ProfileUpdateDTO {
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

// ========== 我的考勤 ==========
export interface AttendanceCalendarVO {
  year: number;
  month: number;
  summary: AttendanceSummary;
  days: DayItem[];
}

export interface AttendanceSummary {
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  cardMissingDays: number;
  leaveDays: number;
}

export interface DayItem {
  date: string;
  dayType?: number;
  dayTypeDesc?: string;
  startStatus?: number;
  startStatusDesc?: string;
  endStatus?: number;
  endStatusDesc?: string;
  hasLeave?: boolean;
  clockIn: string | null;
  clockOut: string | null;
}

export type AttendanceStatus = 'NORMAL' | 'LATE' | 'EARLY' | 'ABSENT' | 'LEAVE' | 'MISSING' | 'WEEKEND';

export interface ClockResultVO {
  attendanceDate?: string;
  clockType?: number;
  clockTypeDesc?: string;
  actualTime?: string;
  status?: number;
  statusDesc?: string;
  scheduledTime?: string;
}

// ========== 我的请假 ==========
export interface LeaveListVO {
  total: number;
  records: LeaveRecord[];
}

export interface LeaveRecord {
  id: number;
  leaveType: number;
  leaveTypeDesc: string;
  startTime: string;
  endTime: string;
  leaveDays: number;
  reason: string;
  status: number;
  statusDesc: string;
  approvalProgress: ApprovalProgress;
  createTime: string;
}

export interface ApprovalProgress {
  currentNodeOrder: number;
  nodes: ApprovalNode[];
}

export interface ApprovalNode {
  nodeName: string;
  nodeOrder: number;
  approverName: string;
  status: number;
  statusDesc: string;
}

// ========== 我的薪资 ==========
export interface PayslipListItem {
  id: number;
  yearMonth: string;
  netSalary: number;
  status: number;
  statusDesc: string;
  hasViewed: boolean;
}

export interface PayslipDetailVO {
  id: number;
  yearMonth: string;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  income: { basicSalary: number; allowance: number; bonus: number; totalIncome: number };
  deductions: { leaveDeduction: number; pensionInsurance: number; medicalInsurance: number; unemploymentInsurance: number; housingFund: number; incomeTax: number; totalDeduction: number };
  netSalary: number;
}

export interface SalaryTrendVO {
  months: string[];
  netSalaries: number[];
}

// ========== 账号安全 ==========
export interface PasswordChangeDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PhoneChangeDTO {
  newPhone: string;
  verifyCode: string;
}

export interface LoginLogVO {
  id: number;
  loginTime: string;
  ipAddress: string;
  device: string;
  result: number;
  resultDesc: string;
}

export interface PendingCountVO {
  leaveApprovalResult: number;
  newSalaryAvailable: number;
  total: number;
}
