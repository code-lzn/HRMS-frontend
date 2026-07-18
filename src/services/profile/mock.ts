import type {
  ProfileVO, AttendanceCalendarVO, ClockResultVO,
  LeaveListVO, PayslipListItem, PayslipDetailVO,
  SalaryTrendVO, LoginLogVO, PendingCountVO,
} from './typings';

/**
 * Global Constraints:
 * - All API endpoints under /api/v1/profile/*
 * - No userId parameter in any function (backend extracts from token)
 * - Use Ant Design 5 components
 * - Mock delay 300-800ms
 */

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// --- 我的档案 ---
export const mockProfile: ProfileVO = {
  employeeId: 1001,
  employeeNo: '202401005',
  name: '张三',
  gender: 1,
  genderDesc: '男',
  phone: '138****1234',
  email: 'zhangsan@example.com',
  idCard: '3301**********1234',
  birthday: '1995-06-15',
  address: '浙江省杭州市西湖区',
  emergencyContact: '张父',
  emergencyPhone: '139****5678',
  departmentName: '技术部',
  positionName: 'Java开发工程师',
  jobLevel: 'P5',
  status: 2,
  statusDesc: '正式',
  hireDate: '2024-01-15',
  editableFields: ['email', 'address', 'emergencyContact', 'emergencyPhone'],
  lockedFields: ['name', 'phone', 'idCard', 'departmentName', 'positionName', 'jobLevel'],
};

export async function getProfile(): Promise<ProfileVO> {
  await delay();
  return { ...mockProfile };
}

export async function updateProfile(_data: any): Promise<void> {
  await delay(300);
}

// --- 我的考勤 ---
function generateMonthDays(yearMonth: string): AttendanceCalendarVO {
  const [y, m] = yearMonth.split('-').map(Number);
  const days: AttendanceCalendarVO['days'] = [];
  const totalDays = new Date(y, m, 0).getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  let actualDays = 0, lateCount = 0, earlyCount = 0, absentCount = 0, leaveDays = 0;

  for (let d = 1; d <= totalDays; d++) {
    const date = `${yearMonth}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const weekday = weekdays[dayOfWeek];

    let status: string, statusDesc: string, clockIn: string | null = null, clockOut: string | null = null;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'WEEKEND';
      statusDesc = '休息日';
    } else if (d === 3) {
      status = 'LATE'; statusDesc = '迟到'; clockIn = '09:20'; clockOut = '18:00'; lateCount++; actualDays++;
    } else if (d === 8) {
      status = 'LEAVE'; statusDesc = '请假'; leaveDays++; actualDays++;
    } else if (d === 15) {
      status = 'MISSING'; statusDesc = '缺卡'; actualDays++;
    } else if (d > 20 && d % 2 === 0) {
      // 模拟未来日期无数据
      status = 'NORMAL'; statusDesc = '-'; actualDays++;
    } else {
      status = 'NORMAL'; statusDesc = '正常'; clockIn = '08:55'; clockOut = '18:05'; actualDays++;
    }

    days.push({ date, weekday, status, statusDesc, clockIn, clockOut });
  }

  return {
    yearMonth,
    summary: {
      shouldWorkDays: 23,
      actualWorkDays: actualDays,
      lateCount,
      earlyCount,
      absentCount,
      leaveDays,
    },
    days,
  };
}

export async function getAttendanceCalendar(yearMonth: string): Promise<AttendanceCalendarVO> {
  await delay();
  return generateMonthDays(yearMonth);
}

let clockedIn = false;
export async function clock(type: 'IN' | 'OUT'): Promise<ClockResultVO> {
  await delay(300);
  if (type === 'IN' && clockedIn) {
    throw { response: { data: { code: 50010, message: '今日已打卡' } } };
  }
  clockedIn = type === 'IN';
  return { type, clockTime: new Date().toISOString(), status: 'NORMAL', statusDesc: type === 'IN' ? '打卡成功' : '打卡成功' };
}

// --- 我的请假 ---
export async function getLeaves(_params?: { status?: number; page?: number; size?: number }): Promise<LeaveListVO> {
  await delay();
  return {
    total: 5,
    records: [
      { id: 1, leaveType: 1, leaveTypeDesc: '年假', startTime: '2026-07-15 09:00', endTime: '2026-07-16 18:00', duration: 2, reason: '家庭事务', status: 1, statusDesc: '审批中', approvalProgress: { currentNodeOrder: 1, nodes: [{ nodeName: '直接上级审批', nodeOrder: 1, approverName: '李四', status: 1, statusDesc: '待审批' }] }, createTime: '2026-07-10T09:00:00' },
      { id: 2, leaveType: 2, leaveTypeDesc: '病假', startTime: '2026-06-20 09:00', endTime: '2026-06-20 18:00', duration: 1, reason: '感冒发烧', status: 2, statusDesc: '已通过', approvalProgress: { currentNodeOrder: 2, nodes: [] }, createTime: '2026-06-18T14:00:00' },
      { id: 3, leaveType: 3, leaveTypeDesc: '事假', startTime: '2026-06-05 09:00', endTime: '2026-06-05 12:00', duration: 0.5, reason: '个人私事', status: 3, statusDesc: '已拒绝', approvalProgress: { currentNodeOrder: 1, nodes: [] }, createTime: '2026-06-04T10:00:00' },
      { id: 4, leaveType: 1, leaveTypeDesc: '年假', startTime: '2026-05-10 09:00', endTime: '2026-05-10 18:00', duration: 1, reason: '休息', status: 4, statusDesc: '已撤回', approvalProgress: { currentNodeOrder: 1, nodes: [] }, createTime: '2026-05-09T08:00:00' },
      { id: 5, leaveType: 7, leaveTypeDesc: '调休', startTime: '2026-05-20 09:00', endTime: '2026-05-20 18:00', duration: 1, reason: '加班调休', status: 2, statusDesc: '已通过', approvalProgress: { currentNodeOrder: 2, nodes: [] }, createTime: '2026-05-18T16:00:00' },
    ],
  };
}

export async function cancelLeave(_id: number): Promise<void> {
  await delay(300);
}

// --- 我的薪资 ---
export async function getSalaryList(): Promise<PayslipListItem[]> {
  await delay();
  return [
    { id: 6, yearMonth: '2026-07', netSalary: 12980, status: 5, statusDesc: '已发放', hasViewed: false },
    { id: 5, yearMonth: '2026-06', netSalary: 12500, status: 5, statusDesc: '已发放', hasViewed: true },
    { id: 4, yearMonth: '2026-05', netSalary: 12500, status: 5, statusDesc: '已发放', hasViewed: true },
    { id: 3, yearMonth: '2026-04', netSalary: 12000, status: 5, statusDesc: '已发放', hasViewed: true },
    { id: 2, yearMonth: '2026-03', netSalary: 12000, status: 5, statusDesc: '已发放', hasViewed: true },
    { id: 1, yearMonth: '2026-02', netSalary: 12000, status: 5, statusDesc: '已发放', hasViewed: true },
  ];
}

export async function sendSalaryVerifyCode(_id: number): Promise<void> {
  await delay(500);
}

export async function getSalaryDetail(_id: number, _code?: string): Promise<PayslipDetailVO> {
  await delay();
  return {
    id: 6, yearMonth: '2026-07', employeeName: '张三', employeeNo: '202401005', departmentName: '技术部',
    income: { basicSalary: 10000, allowance: 2000, bonus: 3600, totalIncome: 15600 },
    deductions: { leaveDeduction: -500, pensionInsurance: -640, medicalInsurance: -160, unemploymentInsurance: -40, housingFund: -960, incomeTax: -320, totalDeduction: -2620 },
    netSalary: 12980,
  };
}

export async function getSalaryTrend(): Promise<SalaryTrendVO> {
  await delay();
  return {
    months: ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'],
    netSalaries: [12000, 12000, 12500, 12500, 12500, 12980],
  };
}

// --- 账号安全 ---
export async function changePassword(_data: any): Promise<void> {
  await delay(300);
}

export async function changePhone(_data: any): Promise<void> {
  await delay(300);
}

export async function getLoginLogs(): Promise<LoginLogVO[]> {
  await delay();
  return [
    { id: 10, loginTime: '2026-07-18T08:55:00', ipAddress: '192.168.1.100', device: 'Chrome / Windows', result: 1, resultDesc: '成功' },
    { id: 9, loginTime: '2026-07-17T18:30:00', ipAddress: '192.168.1.100', device: 'Chrome / Windows', result: 1, resultDesc: '成功' },
    { id: 8, loginTime: '2026-07-17T08:10:00', ipAddress: '10.0.0.15', device: 'Safari / iPhone', result: 1, resultDesc: '成功' },
    { id: 7, loginTime: '2026-07-16T21:00:00', ipAddress: '192.168.1.100', device: 'Chrome / Windows', result: 0, resultDesc: '失败' },
    { id: 6, loginTime: '2026-07-16T09:00:00', ipAddress: '192.168.1.100', device: 'Chrome / Windows', result: 1, resultDesc: '成功' },
  ];
}

export async function getPendingCount(): Promise<PendingCountVO> {
  await delay(300);
  return { leaveApprovalResult: 2, newSalaryAvailable: 1, total: 3 };
}
