# 个人中心 前端实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现员工个人中心工作台，包含 5 个页面（我的档案、我的考勤、我的请假、我的薪资、账号安全）+ 全局待办红点，全部使用 Mock 数据

**Architecture:** Umi Max pages + Zustand store + services 层（先 mock）+ custom hooks。所有接口不传 userId，mock 数据集中管理，切换真实接口只需改 services 层

**Tech Stack:** React + TypeScript + Umi Max + Ant Design 5 + @antv/g2plot + Zustand + dayjs

## Global Constraints

- 所有接口不传 userId（由后端从 token 提取），前端 mock 同理不传
- 敏感字段前端直接展示后端脱敏数据，不做二次处理
- 锁定字段由后端 `editableFields`/`lockedFields` 控制
- 组件使用 Ant Design 5，图表使用 @antv/g2plot
- 路由统一在 `.umirc.ts` 中配置

---

### Task 1: 基础设施 — 路由、类型、Mock、Store

**Files:**
- Modify: `src/.umirc.ts`（实际上是 `.umirc.ts` 项目根）
- Create: `src/services/profile/typings.ts`
- Create: `src/services/profile/mock.ts`
- Create: `src/services/profile/index.ts`
- Create: `src/models/profile.ts`
- Create: `src/hooks/useProfile.ts`

> **Note:** `.umirc.ts` 位于项目根目录 `c:/Users/86151/Desktop/HRMS-frontend/.umirc.ts`

**Interfaces:**
- Produces: 所有类型定义、API 函数签名、Zustand store actions、路由路径

- [ ] **Step 1: 添加路由**

修改 `.umirc.ts`，在 `routes` 数组中添加个人中心路由：

```typescript
// 在 routes 数组末尾 (layout 页面的 children 区域)，适当位置添加：
// ========== 个人中心 ==========
{
  name: '个人中心', path: '/profile',
  routes: [
    { path: '/profile', redirect: '/profile/info' },
    { name: '我的档案', path: '/profile/info', component: './Profile' },
    { name: '我的考勤', path: '/profile/attendance', component: './Profile/Attendance' },
    { name: '我的请假', path: '/profile/leaves', component: './Profile/Leaves' },
    { name: '我的薪资', path: '/profile/salary', component: './Profile/Salary' },
    { name: '账号安全', path: '/profile/security', component: './Profile/Security' },
  ],
},
```

- [ ] **Step 2: 类型定义**

创建 `src/services/profile/typings.ts`：

```typescript
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
  yearMonth: string;
  summary: AttendanceSummary;
  days: DayItem[];
}

export interface AttendanceSummary {
  shouldWorkDays: number;
  actualWorkDays: number;
  lateCount: number;
  earlyCount: number;
  absentCount: number;
  leaveDays: number;
}

export interface DayItem {
  date: string;
  weekday: string;
  status: AttendanceStatus;
  statusDesc: string;
  clockIn: string | null;
  clockOut: string | null;
}

export type AttendanceStatus = 'NORMAL' | 'LATE' | 'EARLY' | 'ABSENT' | 'LEAVE' | 'MISSING' | 'WEEKEND';

export interface ClockResultVO {
  type: 'IN' | 'OUT';
  clockTime: string;
  status: string;
  statusDesc: string;
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
  duration: number;
  reason: string;
  status: number;       // 1=审批中 2=已通过 3=已拒绝 4=已撤回
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
```

- [ ] **Step 3: Mock 数据**

创建 `src/services/profile/mock.ts`：

```typescript
import type {
  ProfileVO, AttendanceCalendarVO, ClockResultVO,
  LeaveListVO, PayslipListItem, PayslipDetailVO,
  SalaryTrendVO, LoginLogVO, PendingCountVO,
} from './typings';

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
```

- [ ] **Step 4: API 服务层**

创建 `src/services/profile/index.ts`（当前直接 re-export mock，后续切真实接口只改此文件）：

```typescript
export {
  getProfile, updateProfile,
  getAttendanceCalendar, clock,
  getLeaves, cancelLeave,
  getSalaryList, sendSalaryVerifyCode, getSalaryDetail, getSalaryTrend,
  changePassword, changePhone, getLoginLogs, getPendingCount,
} from './mock';
```

- [ ] **Step 5: Zustand Store**

创建 `src/models/profile.ts`：

```typescript
import { useState, useCallback } from 'react';
import * as profileService from '@/services/profile';
import type { ProfileVO, PendingCountVO } from '@/services/profile/typings';

export default function useProfileModel() {
  const [profile, setProfile] = useState<ProfileVO | null>(null);
  const [pendingCount, setPendingCount] = useState<PendingCountVO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    const data = await profileService.getPendingCount();
    setPendingCount(data);
  }, []);

  return { profile, pendingCount, loading, fetchProfile, fetchPendingCount, setProfile };
}
```

- [ ] **Step 6: 验证路由生效**

运行 `npm run dev`，确认侧边栏出现"个人中心"菜单项，子菜单 5 项均可点击（页面暂时空白 404 或报错），但不影响启动。

---

### Task 2: 我的档案页

**Files:**
- Create: `src/pages/Profile/index.tsx`

**Interfaces:**
- Consumes: `useProfileModel` from `@/models/profile`, type `ProfileVO` from `@/services/profile/typings`
- Produces: 页面组件，可独立访问 `/profile/info`

- [ ] **Step 1: 实现档案查看/编辑页面**

创建 `src/pages/Profile/index.tsx`：

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Descriptions, Button, Input, DatePicker, Tag, Space, Card, message, Modal, Tooltip } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { ProfileVO, ProfileUpdateDTO } from '@/services/profile/typings';
import { getProfile, updateProfile } from '@/services/profile';
import dayjs from 'dayjs';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileUpdateDTO>({});
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileUpdateDTO>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = () => {
    setEditData({
      email: profile?.email,
      address: profile?.address,
      emergencyContact: profile?.emergencyContact,
      emergencyPhone: profile?.emergencyPhone,
    });
    setOriginalData({
      email: profile?.email,
      address: profile?.address,
      emergencyContact: profile?.emergencyContact,
      emergencyPhone: profile?.emergencyPhone,
    });
    setEditing(true);
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(editData) !== JSON.stringify(originalData);
    if (hasChanges) {
      Modal.confirm({
        title: '确认取消',
        content: '修改尚未保存，确定要取消吗？',
        onOk: () => { setEditing(false); setEditData({}); },
      });
    } else {
      setEditing(false);
      setEditData({});
    }
  };

  const handleSave = async () => {
    await updateProfile(editData);
    message.success('保存成功');
    setEditing(false);
    fetchData();
  };

  const isLocked = (field: string) => profile?.lockedFields?.includes(field);

  const renderField = (label: string, field: keyof ProfileVO | 'birthday', value: any, locked: boolean) => {
    if (editing && !locked) {
      if (field === 'birthday') {
        return <DatePicker value={editData.birthday ? dayjs(editData.birthday) : null} onChange={(d) => setEditData({ ...editData, birthday: d?.format('YYYY-MM-DD') })} />;
      }
      return <Input value={editData[field as keyof ProfileUpdateDTO] || ''} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} />;
    }
    return locked ? (
      <Tooltip title="如需修改请联系 HR">
        <span style={{ color: '#999', cursor: 'not-allowed' }}>{value ?? '-'}</span>
      </Tooltip>
    ) : (
      <span>{value ?? '-'}</span>
    );
  };

  if (!profile) return <Card loading={loading} />;

  return (
    <Card
      title="我的档案"
      extra={
        editing ? (
          <Space>
            <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>保存</Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>取消</Button>
          </Space>
        ) : (
          <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
        )
      }
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="工号">{profile.employeeNo}</Descriptions.Item>
        <Descriptions.Item label="姓名">{renderField('姓名', 'name', profile.name, isLocked('name'))}</Descriptions.Item>
        <Descriptions.Item label="性别">{profile.genderDesc}</Descriptions.Item>
        <Descriptions.Item label="手机号">{renderField('手机号', 'phone', profile.phone, true)}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{renderField('邮箱', 'email', profile.email, false)}</Descriptions.Item>
        <Descriptions.Item label="身份证号">{renderField('身份证号', 'idCard', profile.idCard, true)}</Descriptions.Item>
        <Descriptions.Item label="生日">{renderField('生日', 'birthday', profile.birthday, false)}</Descriptions.Item>
        <Descriptions.Item label="现居住地址">{renderField('现居住地址', 'address', profile.address, false)}</Descriptions.Item>
        <Descriptions.Item label="紧急联系人">{renderField('紧急联系人', 'emergencyContact', profile.emergencyContact, false)}</Descriptions.Item>
        <Descriptions.Item label="紧急联系人电话">{renderField('紧急联系人电话', 'emergencyPhone', profile.emergencyPhone, false)}</Descriptions.Item>
        <Descriptions.Item label="所属部门">{renderField('所属部门', 'departmentName', profile.departmentName, isLocked('departmentName'))}</Descriptions.Item>
        <Descriptions.Item label="职位">{renderField('职位', 'positionName', profile.positionName, isLocked('positionName'))}</Descriptions.Item>
        <Descriptions.Item label="职级">{renderField('职级', 'jobLevel', profile.jobLevel, isLocked('jobLevel'))}</Descriptions.Item>
        <Descriptions.Item label="在职状态">
          <Tag color={profile.status === 2 ? 'green' : profile.status === 1 ? 'blue' : 'red'}>{profile.statusDesc}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="入职日期">{profile.hireDate}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
```

- [ ] **Step 2: 验证**

运行 `npm run dev`，访问 `/profile/info`，确认档案卡片正常渲染，编辑/保存/取消交互正常。

---

### Task 3: 我的考勤页

**Files:**
- Create: `src/pages/Profile/Attendance/index.tsx`

**Interfaces:**
- Consumes: `getAttendanceCalendar`, `clock` from `@/services/profile`
- Produces: 考勤页面 `/profile/attendance`

- [ ] **Step 1: 实现考勤页面**

创建 `src/pages/Profile/Attendance/index.tsx`：

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Calendar, Statistic, Row, Col, Space, Tag, message, Badge, Popover } from 'antd';
import { ClockCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AttendanceCalendarVO, ClockResultVO, AttendanceStatus, DayItem } from '@/services/profile/typings';
import { getAttendanceCalendar, clock } from '@/services/profile';

const STATUS_MAP: Record<AttendanceStatus, { color: string; label: string; dot: string }> = {
  NORMAL: { color: '#52c41a', label: '正常', dot: '●' },
  LATE: { color: '#fa8c16', label: '迟到', dot: '●' },
  EARLY: { color: '#fa8c16', label: '早退', dot: '●' },
  ABSENT: { color: '#f5222d', label: '旷工', dot: '●' },
  LEAVE: { color: '#1890ff', label: '请假', dot: '●' },
  MISSING: { color: '#bfbfbf', label: '缺卡', dot: '●' },
  WEEKEND: { color: '#d9d9d9', label: '休息日', dot: '-' },
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [data, setData] = useState<AttendanceCalendarVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [todayRecord, setTodayRecord] = useState<DayItem | null>(null);

  const fetchData = useCallback(async (month: dayjs.Dayjs) => {
    setLoading(true);
    try {
      const ym = month.format('YYYY-MM');
      const res = await getAttendanceCalendar(ym);
      setData(res);
      const today = dayjs().format('YYYY-MM-DD');
      const td = res.days.find((d) => d.date === today);
      setTodayRecord(td || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

  const handleClock = async (type: 'IN' | 'OUT') => {
    setClocking(true);
    try {
      const res: ClockResultVO = await clock(type);
      message.success(`${res.statusDesc} (${dayjs(res.clockTime).format('HH:mm:ss')})`);
      fetchData(currentMonth);
    } catch (err: any) {
      message.error(err?.response?.data?.message || '打卡失败');
    } finally {
      setClocking(false);
    }
  };

  const cellRender = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const day = data?.days.find((d) => d.date === dateStr);
    const isToday = dateStr === dayjs().format('YYYY-MM-DD');

    if (!day) return null;

    const statusInfo = STATUS_MAP[day.status] || { color: '#999', label: day.status, dot: '●' };

    const popContent = day.status !== 'WEEKEND' ? (
      <div style={{ minWidth: 120 }}>
        <p><strong>{day.date}</strong> ({day.weekday})</p>
        <p>状态: <Tag color={statusInfo.color}>{day.statusDesc}</Tag></p>
        {day.clockIn && <p>上班: {day.clockIn}</p>}
        {day.clockOut && <p>下班: {day.clockOut}</p>}
      </div>
    ) : null;

    return (
      <Popover content={popContent}>
        <div style={{ textAlign: 'center', padding: '4px 0', background: isToday ? '#e6f7ff' : undefined }}>
          <div style={{ fontSize: 12, color: statusInfo.color }}>{statusInfo.dot}</div>
          <div style={{ fontSize: 14 }}>{date.date()}</div>
        </div>
      </Popover>
    );
  };

  const now = dayjs();

  return (
    <div>
      {/* 打卡区 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{now.format('YYYY年MM月DD日')}</div>
            <div style={{ color: '#999' }}>{now.format('dddd')}</div>
          </Col>
          <Col>
            <Space size="large">
              <Badge status={todayRecord?.clockIn ? 'success' : 'default'} text={
                todayRecord?.clockIn ? `上班: ${todayRecord.clockIn}` : '上班未打卡'
              } />
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => handleClock('IN')}
                loading={clocking}
                disabled={clocking || !!todayRecord?.clockIn}
                type={todayRecord?.clockIn ? 'default' : 'primary'}
              >
                {todayRecord?.clockIn ? '已打卡' : '上班打卡'}
              </Button>
              <Badge status={todayRecord?.clockOut ? 'success' : 'default'} text={
                todayRecord?.clockOut ? `下班: ${todayRecord.clockOut}` : '下班未打卡'
              } />
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => handleClock('OUT')}
                loading={clocking}
                disabled={clocking || !!todayRecord?.clockOut}
                type={todayRecord?.clockOut ? 'default' : 'primary'}
              >
                {todayRecord?.clockOut ? '已打卡' : '下班打卡'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计区 */}
      {data?.summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}><Card><Statistic title="应出勤" value={data.summary.shouldWorkDays} suffix="天" /></Card></Col>
          <Col span={4}><Card><Statistic title="实际出勤" value={data.summary.actualWorkDays} suffix="天" /></Card></Col>
          <Col span={4}><Card><Statistic title="迟到" value={data.summary.lateCount} suffix="次" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
          <Col span={4}><Card><Statistic title="早退" value={data.summary.earlyCount} suffix="次" /></Card></Col>
          <Col span={4}><Card><Statistic title="旷工" value={data.summary.absentCount} suffix="天" valueStyle={{ color: '#f5222d' }} /></Card></Col>
          <Col span={4}><Card><Statistic title="请假" value={data.summary.leaveDays} suffix="天" /></Card></Col>
        </Row>
      )}

      {/* 日历区 */}
      <Card
        title={`考勤日历`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} />
            <span>{currentMonth.format('YYYY年MM月')}</span>
            <Button icon={<ArrowRightOutlined />} onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} />
            <Button type="link">补卡申请</Button>
          </Space>
        }
      >
        <Calendar
          fullscreen
          value={currentMonth}
          onPanelChange={(d) => setCurrentMonth(d)}
          cellRender={cellRender}
          loading={loading}
        />
        {/* 图例 */}
        <Row gutter={16} style={{ marginTop: 12 }}>
          {Object.entries(STATUS_MAP).slice(0, 6).map(([key, val]) => (
            <Col key={key}><span style={{ color: val.color }}>{val.dot}</span> {val.label}</Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 验证**

访问 `/profile/attendance`，确认打卡区、统计区、日历区正常渲染。切换月份，点击打卡按钮测试交互。

---

### Task 4: 我的请假页

**Files:**
- Create: `src/pages/Profile/Leaves/index.tsx`

**Interfaces:**
- Consumes: `getLeaves`, `cancelLeave` from `@/services/profile`
- Produces: 请假页面 `/profile/leaves`

- [ ] **Step 1: 实现请假页面**

创建 `src/pages/Profile/Leaves/index.tsx`：

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Tabs, Button, message, Modal, Tooltip } from 'antd';
import type { LeaveRecord } from '@/services/profile/typings';
import { getLeaves, cancelLeave } from '@/services/profile';

const STATUS_TABS = [
  { key: '', tab: '全部' },
  { key: '1', tab: '审批中' },
  { key: '2', tab: '已通过' },
  { key: '3', tab: '已拒绝' },
  { key: '4', tab: '已撤回' },
];

const STATUS_MAP: Record<number, { color: string }> = {
  1: { color: 'processing' },
  2: { color: 'success' },
  3: { color: 'error' },
  4: { color: 'default' },
};

const LEAVE_TYPE_MAP: Record<number, string> = {
  1: '年假', 2: '病假', 3: '事假', 4: '婚假', 5: '产假', 6: '丧假', 7: '调休',
};

export default function LeavesPage() {
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const fetchData = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const res = await getLeaves({ status: status ? Number(status) : undefined });
      setData(res.records);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

  const handleCancel = (record: LeaveRecord) => {
    Modal.confirm({
      title: '确认取消申请',
      content: `确定要取消 ${record.leaveTypeDesc} 申请吗？`,
      onOk: async () => {
        await cancelLeave(record.id);
        message.success('已取消');
        fetchData(activeTab);
      },
    });
  };

  const columns = [
    { title: '请假类型', dataIndex: 'leaveType', key: 'leaveType', render: (_: any, r: LeaveRecord) => <Tag>{r.leaveTypeDesc}</Tag> },
    { title: '起止时间', key: 'time', render: (_: any, r: LeaveRecord) => `${r.startTime} ~ ${r.endTime}` },
    { title: '天数', dataIndex: 'duration', key: 'duration', render: (v: number) => `${v}天` },
    { title: '事由', dataIndex: 'reason', key: 'reason', render: (v: string) => <Tooltip title={v}>{v.length > 15 ? v.slice(0, 15) + '...' : v}</Tooltip> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (_: any, r: LeaveRecord) => <Tag color={STATUS_MAP[r.status]?.color}>{r.statusDesc}</Tag> },
    { title: '审批进度', key: 'progress', render: (_: any, r: LeaveRecord) => {
      const nodes = r.approvalProgress?.nodes || [];
      const done = nodes.filter((n) => n.status === 2).length;
      return `${done}/${nodes.length} 已完成`;
    }},
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: (v: string) => v.slice(0, 16).replace('T', ' ') },
    {
      title: '操作', key: 'action',
      render: (_: any, r: LeaveRecord) => r.status === 1 ? (
        <Button type="link" danger onClick={() => handleCancel(r)}>取消申请</Button>
      ) : null,
    },
  ];

  return (
    <Card title="我的请假">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={STATUS_TABS} />
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
    </Card>
  );
}
```

- [ ] **Step 2: 验证**

访问 `/profile/leaves`，确认 Tab 切换、列表渲染、取消申请交互正常。

---

### Task 5: 我的薪资页

**Files:**
- Create: `src/pages/Profile/Salary/index.tsx`

**Interfaces:**
- Consumes: `getSalaryList`, `getSalaryDetail`, `sendSalaryVerifyCode`, `getSalaryTrend` from `@/services/profile`
- Produces: 薪资页面 `/profile/salary`

**Note:** `@antv/g2plot` 需要先安装：`npm install @antv/g2plot`

- [ ] **Step 1: 安装 g2plot**

```bash
cd c:/Users/86151/Desktop/HRMS-frontend && npm install @antv/g2plot
```

- [ ] **Step 2: 实现薪资页面**

创建 `src/pages/Profile/Salary/index.tsx`：

```tsx
import { useEffect, useState, useRef } from 'react';
import { Card, Timeline, Button, Modal, Descriptions, Input, Tabs, Badge, message, Space, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Line } from '@antv/g2plot';
import type { PayslipListItem, PayslipDetailVO, SalaryTrendVO } from '@/services/profile/typings';
import { getSalaryList, getSalaryDetail, sendSalaryVerifyCode, getSalaryTrend } from '@/services/profile';

export default function SalaryPage() {
  const [list, setList] = useState<PayslipListItem[]>([]);
  const [trend, setTrend] = useState<SalaryTrendVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detail, setDetail] = useState<PayslipDetailVO | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'sms' | 'password'>('sms');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [targetId, setTargetId] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSalaryList().then(setList);
    getSalaryTrend().then((d) => { setTrend(d); });
  }, []);

  // 折线图渲染
  useEffect(() => {
    if (!trend || !chartRef.current) return;
    const chart = new Line(chartRef.current, {
      data: trend.months.map((m, i) => ({ month: m, salary: trend.netSalaries[i] })),
      xField: 'month',
      yField: 'salary',
      smooth: true,
      point: { size: 5, shape: 'circle' },
      tooltip: { formatter: (d: any) => ({ name: '实发工资', value: `¥${d.salary.toLocaleString()}` }) },
      yAxis: { label: { formatter: (v: string) => `¥${(Number(v) / 1000).toFixed(0)}k` } },
      color: '#1890ff',
      area: { style: { fill: 'l(270) 0:#ffffff 1:#91d5ff' } },
    });
    chart.render();
    return () => { chart.destroy(); };
  }, [trend]);

  const handleViewDetail = (item: PayslipListItem) => {
    if (!item.hasViewed) {
      setTargetId(item.id);
      setVerifyVisible(true);
      return;
    }
    showDetail(item.id);
  };

  const showDetail = async (id: number, code?: string) => {
    const d = await getSalaryDetail(id, code);
    setDetail(d);
    setDetailVisible(true);
    setVerifyVisible(false);
    setVerifyCode('');
    setPassword('');
  };

  const handleSendCode = async () => {
    if (!targetId) return;
    await sendSalaryVerifyCode(targetId);
    message.success('验证码已发送');
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const handleVerify = async () => {
    if (verifyMethod === 'password' && !password) { message.error('请输入密码'); return; }
    if (verifyMethod === 'sms' && !verifyCode) { message.error('请输入验证码'); return; }
    try {
      await showDetail(targetId!, verifyMethod === 'password' ? password : verifyCode);
    } catch {
      message.error('验证失败');
    }
  };

  return (
    <div>
      {/* 趋势图 */}
      <Card title="薪资趋势" style={{ marginBottom: 16 }}>
        <div ref={chartRef} style={{ height: 300 }} />
      </Card>

      {/* 工资条列表 */}
      <Card title="工资条">
        <Timeline
          items={list.map((item) => ({
            color: item.hasViewed ? 'gray' : 'blue',
            dot: !item.hasViewed ? <Badge dot /> : undefined,
            children: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {item.yearMonth} — <strong>¥{item.netSalary.toLocaleString()}</strong>
                  <span style={{ marginLeft: 8, color: '#999' }}>({item.statusDesc})</span>
                </span>
                <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(item)}>查看</Button>
              </div>
            ),
          }))}
        />
      </Card>

      {/* 工资条详情 */}
      <Modal title={`${detail?.yearMonth} 工资条`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={500}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工">{detail.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{detail.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="部门">{detail.departmentName}</Descriptions.Item>
          </Descriptions>
        )}
        {detail && (
          <>
            <Divider>收入</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="基本工资">¥{detail.income.basicSalary.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="岗位津贴">¥{detail.income.allowance.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="绩效奖金">¥{detail.income.bonus.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应发)" ><strong>¥{detail.income.totalIncome.toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider>扣除</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="事假扣款">¥{Math.abs(detail.deductions.leaveDeduction).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="养老保险">¥{Math.abs(detail.deductions.pensionInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="医疗保险">¥{Math.abs(detail.deductions.medicalInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="失业保险">¥{Math.abs(detail.deductions.unemploymentInsurance).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="住房公积金">¥{Math.abs(detail.deductions.housingFund).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="个人所得税">¥{Math.abs(detail.deductions.incomeTax).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="小计(应扣)"><strong style={{ color: '#f5222d' }}>-¥{Math.abs(detail.deductions.totalDeduction).toLocaleString()}</strong></Descriptions.Item>
            </Descriptions>
            <Divider>实发</Divider>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', textAlign: 'center' }}>
              ¥{detail.netSalary.toLocaleString()}
            </div>
          </>
        )}
      </Modal>

      {/* 二次验证弹窗 */}
      <Modal title="身份验证" open={verifyVisible} onCancel={() => setVerifyVisible(false)} onOk={handleVerify} okText="验证">
        <Tabs activeKey={verifyMethod} onChange={(k) => setVerifyMethod(k as 'sms' | 'password')}
          items={[
            { key: 'sms', label: '短信验证码', children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input placeholder="6位验证码" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} />
                <Button block onClick={handleSendCode} disabled={countdown > 0}>{countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}</Button>
              </Space>
            )},
            { key: 'password', label: '登录密码', children: (
              <Input.Password placeholder="请输入登录密码" value={password} onChange={(e) => setPassword(e.target.value)} />
            )},
          ]}
        />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 3: 验证**

访问 `/profile/salary`，确认折线图、工资条列表、详情 Modal、二次验证弹窗正常。

---

### Task 6: 账号安全页

**Files:**
- Create: `src/pages/Profile/Security/index.tsx`

**Interfaces:**
- Consumes: `changePassword`, `changePhone`, `getLoginLogs` from `@/services/profile`
- Produces: 账号安全页面 `/profile/security`

- [ ] **Step 1: 实现账号安全页面**

创建 `src/pages/Profile/Security/index.tsx`：

```tsx
import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Timeline, Progress, Space } from 'antd';
import type { LoginLogVO } from '@/services/profile/typings';
import { changePassword, changePhone, getLoginLogs } from '@/services/profile';

function PasswordStrength(password: string): { percent: number; status: 'exception' | 'active' | 'success'; text: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (score >= 3) return { percent: 100, status: 'success', text: '强' };
  if (score >= 2) return { percent: 60, status: 'active', text: '中' };
  return { percent: 30, status: 'exception', text: '弱' };
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<LoginLogVO[]>([]);
  const [pwdForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [pwdStrength, setPwdStrength] = useState<ReturnType<typeof PasswordStrength> | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getLoginLogs().then(setLogs); }, []);

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await changePassword(values);
      message.success('密码修改成功，请重新登录');
      pwdForm.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (values: any) => {
    setLoading(true);
    try {
      await changePhone(values);
      message.success('手机号修改成功');
      phoneForm.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const strength = pwdStrength;
  const pwdValue = Form.useWatch('newPassword', pwdForm);

  return (
    <div>
      {/* 修改密码 */}
      <Card title="修改密码" style={{ marginBottom: 16 }}>
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 400 }}>
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度至少8位' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需包含大小写字母和数字' },
          ]}>
            <Input.Password onChange={(e) => setPwdStrength(PasswordStrength(e.target.value))} />
          </Form.Item>
          {strength && pwdValue && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={strength.percent} status={strength.status} format={() => strength.text} size="small" />
            </div>
          )}
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={loading}>修改密码</Button></Form.Item>
        </Form>
      </Card>

      {/* 修改手机号 */}
      <Card title="修改手机号" style={{ marginBottom: 16 }}>
        <Form form={phoneForm} layout="vertical" onFinish={handleChangePhone} style={{ maxWidth: 400 }}>
          <Form.Item name="newPhone" label="新手机号" rules={[
            { required: true, message: '请输入新手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
            <Input />
          </Form.Item>
          <Form.Item label="验证码">
            <Space>
              <Form.Item name="verifyCode" noStyle rules={[{ required: true, message: '请输入验证码' }]}>
                <Input placeholder="6位验证码" maxLength={6} style={{ width: 150 }} />
              </Form.Item>
              <Button onClick={sendCode} disabled={countdown > 0}>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
            </Space>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={loading}>修改手机号</Button></Form.Item>
        </Form>
      </Card>

      {/* 登录日志 */}
      <Card title="登录日志">
        <Timeline
          items={logs.map((log) => ({
            color: log.result === 1 ? 'green' : 'red',
            children: (
              <div>
                <div>{log.loginTime} — {log.resultDesc}</div>
                <div style={{ color: '#999', fontSize: 12 }}>{log.ipAddress} | {log.device}</div>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 验证**

访问 `/profile/security`，确认三个 Card 区域渲染正常，密码强度指示、验证码倒计时交互正常。

---

### Task 7: 待办红点 + 全局导航

**Files:**
- Create: `src/hooks/usePendingCount.ts`（或直接在 `src/models/profile.ts` 扩展）

**Implementation:**
- 在 `app.tsx` 或 layout 中调用 `getPendingCount`，30 秒轮询
- 侧边栏"个人中心"菜单项显示 Badge 角标
- 点击后清除红点

**Note:** Umi Max 的菜单配置在 `.umirc.ts` 中，Ant Design Pro Layout 支持 menu 的 `icon` 和 `badge`。简化为：在 Profile 相关页面组件挂载时拉取待办数，不做复杂轮询。

- [ ] **Step 1: 简化实现**

通过 `useProfileModel` 中的 `fetchPendingCount` 即可获待办数。在 app.tsx 中添加全局轮询过于侵入，先不做。后续需要时再加。

---

### Task 8: 整体验证 + cleanup

- [ ] **Step 1: 运行 `npm run dev`** — 确认无编译错误，5 个页面均可访问
- [ ] **Step 2: 提交代码**

```bash
git add .
git commit -m "feat: 实现个人中心前端（我的档案/考勤/请假/薪资/账号安全），Mock 数据开发"
```
