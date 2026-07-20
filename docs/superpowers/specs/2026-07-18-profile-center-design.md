# 个人中心 - 前端设计方案

**日期**: 2026-07-18  
**来源**: 人资管理系统-PRD.md §9 + 个人中心-前端系分.md + 个人中心-后端系分.md + 表结构.md  
**状态**: 已确认

---

## 1. 概述

实现员工个人中心工作台，包含 5 个页面 + 1 个全局导航红点，所有接口仅操作本人数据（前端不传 userId，后端从 token 提取）。

| 页面 | 路由 | 组件 |
|------|------|------|
| 我的档案 | `/profile/info` | `./Profile` |
| 我的考勤 | `/profile/attendance` | `./Profile/Attendance` |
| 我的请假 | `/profile/leaves` | `./Profile/Leaves` |
| 我的薪资 | `/profile/salary` | `./Profile/Salary` |
| 账号安全 | `/profile/security` | `./Profile/Security` |

---

## 2. 技术决策

- **框架**: React + TypeScript + Umi Max
- **组件库**: Ant Design 5 + Pro Components
- **状态管理**: Zustand（`src/models/profile.ts`）
- **图表**: @antv/g2plot（折线图）
- **请求**: umi-request（`src/services/profile/` 封装，先用 mock）
- **日期**: dayjs

---

## 3. 目录结构

```
src/
├── pages/Profile/
│   ├── index.tsx              # 我的档案
│   ├── Attendance/
│   │   └── index.tsx          # 我的考勤
│   ├── Leaves/
│   │   └── index.tsx          # 我的请假
│   ├── Salary/
│   │   └── index.tsx          # 我的薪资
│   └── Security/
│       └── index.tsx          # 账号安全
├── models/
│   └── profile.ts             # 个人中心 Zustand store
├── services/
│   └── profile/
│       ├── index.ts           # API 函数
│       ├── mock.ts            # Mock 数据和延迟模拟
│       └── typings.ts         # 类型定义
└── hooks/
    ├── useProfile.ts          # 档案 CRUD hook
    ├── useAttendance.ts       # 考勤 hook
    ├── useLeaves.ts           # 请假 hook
    └── useSalary.ts           # 薪资 hook
```

---

## 4. 路由

在 `.umirc.ts` 的 `routes` 数组中添加：

```ts
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
}
```

---

## 5. 数据层设计

### 5.1 类型定义 (`services/profile/typings.ts`)

```typescript
// 我的档案
interface ProfileVO {
  employeeId: number; employeeNo: string; name: string;
  gender: number; genderDesc: string; phone: string;
  email: string; idCard: string; birthday?: string;
  address?: string; emergencyContact?: string; emergencyPhone?: string;
  departmentName: string; positionName: string; jobLevel?: string;
  status: number; statusDesc: string; hireDate: string;
  editableFields: string[]; lockedFields: string[];
}
interface ProfileUpdateDTO { email?: string; address?: string; emergencyContact?: string; emergencyPhone?: string; }

// 我的考勤
interface AttendanceCalendarVO {
  yearMonth: string;
  summary: { shouldWorkDays: number; actualWorkDays: number; lateCount: number; earlyCount: number; absentCount: number; leaveDays: number };
  days: DayItem[];
}
interface DayItem { date: string; weekday: string; status: string; statusDesc: string; clockIn: string | null; clockOut: string | null; }
interface ClockResultVO { type: string; clockTime: string; status: string; statusDesc: string; }

// 我的请假
interface LeaveListVO { total: number; records: LeaveRecord[]; }
interface LeaveRecord { id: number; leaveType: number; leaveTypeDesc: string; startTime: string; endTime: string; duration: number; reason: string; status: number; statusDesc: string; approvalProgress: any; createTime: string; }

// 我的薪资
interface PayslipListItem { id: number; yearMonth: string; netSalary: number; status: number; statusDesc: string; hasViewed: boolean; }
interface PayslipDetailVO { id: number; yearMonth: string; employeeName: string; employeeNo: string; departmentName: string; income: IncomeBlock; deductions: DeductionBlock; netSalary: number; }
interface IncomeBlock { basicSalary: number; allowance: number; bonus: number; totalIncome: number; }
interface DeductionBlock { leaveDeduction: number; pensionInsurance: number; medicalInsurance: number; unemploymentInsurance: number; housingFund: number; incomeTax: number; totalDeduction: number; }
interface SalaryTrendVO { months: string[]; netSalaries: number[]; }

// 账号安全
interface PasswordChangeDTO { oldPassword: string; newPassword: string; confirmPassword: string; }
interface PhoneChangeDTO { newPhone: string; verifyCode: string; }
interface LoginLogVO { id: number; loginTime: string; ipAddress: string; device: string; result: number; resultDesc: string; }
interface PendingCountVO { leaveApprovalResult: number; newSalaryAvailable: number; total: number; }
```

### 5.2 API 函数 (`services/profile/index.ts`)

14 个接口，全部先用 mock 实现：

| 函数名 | 方法 | 路径 |
|--------|------|------|
| `getProfile` | GET | `/api/v1/profile` |
| `updateProfile` | PUT | `/api/v1/profile` |
| `getAttendanceCalendar` | GET | `/api/v1/profile/attendance` |
| `clockIn` / `clockOut` | POST | `/api/v1/profile/attendance/clock` |
| `getLeaves` | GET | `/api/v1/profile/leaves` |
| `cancelLeave` | POST | `/api/v1/profile/leaves/{id}/cancel` |
| `getSalaryList` | GET | `/api/v1/profile/salaries` |
| `sendSalaryVerifyCode` | POST | `/api/v1/profile/salaries/{id}/verify` |
| `getSalaryDetail` | GET | `/api/v1/profile/salaries/{id}` |
| `getSalaryTrend` | GET | `/api/v1/profile/salary-trend` |
| `changePassword` | PUT | `/api/v1/profile/password` |
| `changePhone` | PUT | `/api/v1/profile/phone` |
| `getLoginLogs` | GET | `/api/v1/profile/login-logs` |
| `getPendingCount` | GET | `/api/v1/profile/pending-count` |

Mock 实现方式：每个函数返回 `Promise.resolve(mockData)` 包装模拟延迟 300-800ms。

### 5.3 Zustand Store (`models/profile.ts`)

```typescript
interface ProfileState {
  pendingCount: PendingCountVO | null;
  profile: ProfileVO | null;
  fetchPendingCount: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}
```

---

## 6. 页面组件设计

### 6.1 我的档案 (`pages/Profile/index.tsx`)

**布局**: Descriptions 卡片 + 编辑/保存/取消按钮

**字段展示**:
| 字段 | 展示 | 可编辑 |
|------|------|--------|
| 工号、姓名、性别、手机号(脱敏)、身份证号(脱敏) | 文本 | 只读 |
| 邮箱、生日、现居住地址、紧急联系人、紧急联系人电话 | 文本→Input | 可编辑 |
| 所属部门、职位、职级、在职状态(Tag)、入职日期 | 文本 | 锁定(Tooltip) |

**交互**:
- 查看模式（默认）：所有字段只读，"编辑"按钮
- 编辑模式："编辑"→"保存"+"取消"，可编辑字段变 Input/DatePicker
- 锁定字段旁 `Tooltip` 提示"如需修改请联系 HR"
- 取消编辑有修改时 `Modal.confirm` 二次确认

### 6.2 我的考勤 (`pages/Profile/Attendance/index.tsx`)

**布局**: 打卡区（顶部）+ 统计区（4个 Statistic 卡片）+ 日历区（Calendar 组件）

**打卡区**:
- 当天日期 + 上班/下班打卡按钮
- 已打卡：按钮变灰显示打卡时间 + 状态 Tag
- 点击后按钮立即 disabled，返回后恢复（防抖）

**日历区**:
- `Calendar` 组件的 `cellRender` 自定义，按日期状态标记色点：
  - 绿色 ○ 正常 | 橙色 ○ 迟到/早退 | 红色 ○ 旷工 | 蓝色 ○ 请假 | 灰色 ○ 缺卡
- 点击日期展示当日详情 Popover
- 右上角"补卡申请"按钮

### 6.3 我的请假 (`pages/Profile/Leaves/index.tsx`)

**布局**: Tabs（全部/审批中/已通过/已拒绝/已撤回）+ Table

**Table 列**: 请假类型(Tag)、起止时间、天数、事由(截断+Tooltip)、状态(Tag)、审批进度、创建时间、操作

**操作**: "取消申请"按钮（仅审批中显示），`Modal.confirm` 二次确认

### 6.4 我的薪资 (`pages/Profile/Salary/index.tsx`)

**布局**: 折线图（顶部 AntV）+ 工资条 Timeline/List（中部）

**折线图**: `@antv/g2plot` Line，平滑曲线，tooltip 显示 ¥{金额}，渐变填充

**工资条列表**: 每条显示月份、实发金额、状态、未查看红点

**工资条详情**: Modal 展示收入/扣除/实发表格

**二次验证弹窗**（`hasViewed=false` 时触发）:
- 两种方式：短信验证码（60s倒计时）/ 登录密码
- 验证成功 → 显示详情
- 验证失败 → 错误提示，3 次后锁定提示

### 6.5 账号安全 (`pages/Profile/Security/index.tsx`)

**修改密码**: 旧密码 + 新密码 + 确认新密码，密码强度指示器（弱/中/强），提交

**修改手机号**: 新手机号 + 验证码（60s 倒计时按钮），提交

**登录日志**: Timeline 列表，展示时间、IP、设备、结果

---

## 7. Mock 数据策略

所有 mock 数据集中在 `services/profile/mock.ts`：

- 模拟一个"张三"员工的数据：技术部、Java 开发工程师、P5、正式
- 考勤日历：当月日期列表，混合正常/迟到/缺卡/请假/周末状态
- 请假列表：5-8 条不同状态的请假记录
- 工资条：近 6 个月数据（实发 12000-15500）
- 登录日志：近 10 条

切换真实接口时：将 `services/profile/index.ts` 中 `import { mockXxx } from './mock'` 改为真实 `request()` 调用。

---

## 8. 实现顺序

1. **基础设施**: 路由 + typings + mock 数据 + Zustand store
2. **我的档案**: 最独立、逻辑最简单
3. **我的考勤**: Calendar 定制 + 打卡交互
4. **我的请假**: Tabs + Table + 分页
5. **我的薪资**: 折线图 + Timeline + 二次验证弹窗
6. **账号安全**: 三个 Form + 密码强度 + 验证码倒计时
7. **待办红点**: 全局导航角标 + 轮询
