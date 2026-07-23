# 考勤管理模块 - 前端分析文档

---

## 1. 需求分析

### 1.1 业务背景

考勤管理是企业人力资源管理的核心模块之一，主要用于记录员工出勤情况、管理请假流程、统计考勤数据等。

### 1.2 功能需求

| 序号 | 功能模块 | 功能描述 | 对应页面 |
|:---:|:--------|:--------|:--------|
| 1 | 打卡中心 | 上班/下班打卡、补卡申请、加班申请、考勤记录查询 | [Attendance/index.tsx](file:///d:/java/projectone/HRMS-frontend/src/pages/Attendance/index.tsx) |
| 2 | 规则配置 | 考勤组管理、节假日配置、打卡规则说明 | [Attendance/RuleConfig.tsx](file:///d:/java/projectone/HRMS-frontend/src/pages/Attendance/RuleConfig.tsx) |
| 3 | 请假管理 | 请假申请、假期余额查询、审批进度查看、补卡/加班记录 | [Attendance/LeaveManagement.tsx](file:///d:/java/projectone/HRMS-frontend/src/pages/Attendance/LeaveManagement.tsx) |
| 4 | 考勤统计 | 个人考勤统计、部门考勤统计、图表可视化展示 | [Attendance/Statistics.tsx](file:///d:/java/projectone/HRMS-frontend/src/pages/Attendance/Statistics.tsx) |

### 1.3 角色权限需求

| 角色 | 数据范围(dataScope) | 可执行操作 |
|:-----|:-------------------|:----------|
| 系统管理员 | ALL(1) | 查看所有部门考勤、管理考勤规则、审批权限 |
| 部门主管 | DEPARTMENT(2) | 查看本部门考勤、审批本部门请假 |
| 普通员工 | SELF(5) | 个人打卡、个人请假、个人统计查看 |

---

## 2. 架构设计

### 2.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|:-----|:-----|:-----|:-----|
| 框架 | React | 18.x | UI组件框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| UI组件 | Ant Design | 5.x | 企业级UI组件库 |
| 图表 | ECharts | 5.x | 数据可视化 |
| 路由 | UmiJS | 3.x | 应用框架及路由 |
| 日期处理 | Day.js | 1.x | 轻量级日期库 |
| 请求封装 | Axios | - | HTTP请求 |

### 2.2 模块结构

```
src/pages/Attendance/
├── index.tsx              # 打卡中心（主页面）
├── RuleConfig.tsx         # 规则配置页面
├── LeaveManagement.tsx    # 请假管理页面
└── Statistics.tsx         # 考勤统计页面
```

### 2.3 状态管理架构

```
┌─────────────────────────────────────────────────────────────┐
│                      React Component                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ useState     │  │ useEffect    │  │ useCallback       │  │
│  │ (本地状态)   │  │ (副作用)     │  │ (缓存函数)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │             │
│         ▼                 ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    request (Axios封装)                │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API层 (@/api/*Controller)               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 功能模块详细设计

### 3.1 打卡中心（index.tsx）

#### 3.1.1 核心功能

| 功能点 | 实现方式 | 说明 |
|:-------|:---------|:-----|
| 实时时钟 | `useEffect` + `setInterval` | 每秒更新显示当前时间 |
| 今日打卡状态 | `fetchTodayStatus()` | 调用 `/api/attendance/today` |
| 上班/下班打卡 | `handlePunch('in'/'out')` | 调用 `/api/attendance/punch` |
| 补卡申请 | `applyMakeupPunch()` | 调用补卡接口 |
| 加班申请 | `applyOvertime()` | 调用加班接口 |
| 考勤记录查询 | `fetchAttendanceData()` | 管理员/HR调用 `/api/hr/attendance/list`，员工调用 `/api/attendance/records` |

#### 3.1.2 状态定义

| 状态名称 | 类型 | 初始值 | 作用 |
|:---------|:-----|:-------|:-----|
| `currentTime` | `Date` | `new Date()` | 实时时钟显示 |
| `currentMonth` | `string` | `dayjs().format('YYYY-MM')` | 当前筛选月份 |
| `selectedDept` | `string` | `''` | 选中的部门ID |
| `todayStatus` | `{inDone, inTime, outDone, outTime}` | `{false, '', false, ''}` | 今日打卡状态 |
| `attendanceData` | `{list, total}` | `{[], 0}` | 考勤记录数据 |

#### 3.1.3 考勤状态枚举

| 状态码 | 枚举值 | 显示文本 | 颜色 | 说明 |
|:------|:-------|:--------|:-----|:-----|
| 0 | NORMAL | 正常 | #52c41a | 按时打卡 |
| 1 | LATE | 迟到 | #faad14 | 超出规定时间15分钟内 |
| 2 | EARLY | 早退 | #fa8c16 | 提前15分钟内下班 |
| 3 | MISSING | 缺卡 | #bfbfbf | 当日无打卡记录 |
| 4 | LEAVE | 请假 | #1890ff | 已申请请假 |
| 5 | ABSENT | 旷工 | #ff4d4f | 上下班间隔不足2小时 |
| 6 | MISS_IN | 上班缺卡 | #722ed1 | 上班未打卡 |
| 7 | MISS_OUT | 下班缺卡 | #1890ff | 下班未打卡 |
| 8 | REST | 休息 | #87d068 | 周末或节假日 |
| 9 | LATE_AND_EARLY | 迟到&早退 | #ff7a45 | 迟到且早退 |

---

### 3.2 规则配置（RuleConfig.tsx）

#### 3.2.1 核心功能

| 功能点 | 实现方式 | 说明 |
|:-------|:---------|:-----|
| 考勤组列表 | `fetchGroups()` | 调用 `getAllGroupsUsingGet()` |
| 新增考勤组 | `handleAddGroup()` → `createGroupUsingPost()` | 创建新考勤组 |
| 编辑考勤组 | `handleEditGroup()` → `updateGroupUsingPut()` | 更新考勤组信息 |
| 删除考勤组 | `handleDeleteGroup()` → `deleteGroupUsingDelete()` | 删除考勤组 |
| 节假日配置 | `fetchHolidays()` | 调用 `getAllHolidaysUsingGet()` |

#### 3.2.2 考勤组类型

| 类型码 | 显示文本 | 颜色 | 说明 |
|:------|:--------|:-----|:-----|
| 0 | 固定班 | #1890ff | 固定上下班时间 |
| 1 | 弹性班 | #722ed1 | 灵活上下班时间 |
| 2 | 排班制 | #fa8c16 | 根据排班表执行 |

#### 3.2.3 节假日类型

| 类型码 | 显示文本 | 颜色 | 说明 |
|:------|:--------|:-----|:-----|
| 0 | 法定节假日 | #ff4d4f | 全国统一假期 |
| 1 | 调休上班日 | #52c41a | 周末上班补工作日 |
| 2 | 公司自定义假期 | #fa8c16 | 公司内部假期 |

#### 3.2.4 打卡规则

| 条件 | 结果 | 颜色 |
|:-----|:-----|:-----|
| 上班打卡时间 ≤ 规定时间 | 正常 | #52c41a |
| 规定时间 < 上班打卡时间 ≤ 规定时间+阈值 | 迟到 | #faad14 |
| 上班打卡时间 > 规定时间+阈值 | 旷工 | #ff4d4f |
| 下班打卡时间 ≥ 规定时间 | 正常 | #52c41a |
| 规定时间-阈值 ≤ 下班打卡时间 < 规定时间 | 早退 | #fa8c16 |
| 下班打卡时间 < 规定时间-阈值 | 旷工 | #ff4d4f |
| 当日无打卡记录 | 缺勤 | #ff4d4f |

---

### 3.3 请假管理（LeaveManagement.tsx）

#### 3.3.1 核心功能

| 功能点 | 实现方式 | 说明 |
|:-------|:---------|:-----|
| 假期余额查询 | `fetchLeaveBalance()` | 调用 `getBalanceUsingGet()` |
| 请假记录查询 | `fetchLeaveRecords()` | 同时获取请假、补卡、加班记录 |
| 审批进度查看 | `handleViewProgress()` | 调用对应审批进度接口 |
| 取消申请 | `handleCancel()` | 调用对应取消接口 |

#### 3.3.2 请假类型

| 类型码 | 显示文本 | 颜色 |
|:------|:--------|:-----|
| 2 | 年假 | #52c41a |
| 1 | 病假 | #faad14 |
| 0 | 事假 | #fa8c16 |
| 3 | 婚假 | #722ed1 |
| 4 | 产假 | #eb2f96 |
| 5 | 丧假 | #666 |
| 6 | 调休 | #1890ff |
| makeup | 补卡 | #13c2c2 |
| overtime | 加班 | #fa541c |

#### 3.3.3 审批规则

| 请假类型+天数 | 审批人 |
|:-------------|:-------|
| 年假/调休 ≤ 3天 | 直接上级 |
| 年假/调休 > 3天 | 直接上级 → 部门负责人 |
| 病假/事假 ≤ 1天 | 直接上级 |
| 病假/事假 > 1天 | 直接上级 → 部门负责人 |
| 婚假/产假/丧假 | 直接上级 → HR备案 |

---

### 3.4 考勤统计（Statistics.tsx）

#### 3.4.1 核心功能

| 功能点 | 个人视图 | 管理员视图 |
|:-------|:--------|:----------|
| 统计卡片 | 个人8项指标 | - |
| 考勤日历 | 显示每日状态 | - |
| 出勤率趋势图 | 近3个月 | 近6个月 |
| 每日状态柱状图 | 当月每日状态 | - |
| 请假类型饼图 | - | 当月请假占比 |
| 部门迟到早退柱状图 | - | 各部门对比 |
| 部门统计表格 | - | 各部门指标 |

#### 3.4.2 个人统计指标

| 指标 | 说明 |
|:-----|:-----|
| 应出勤天数 | 当月应出勤总天数 |
| 实际出勤 | 正常+迟到+早退天数 |
| 迟到次数 | 迟到天数 |
| 早退次数 | 早退天数 |
| 旷工天数 | 旷工天数 |
| 请假天数 | 总请假天数 |
| 加班时长 | 加班小时数 |
| 年假余额 | 剩余年假天数 |

---

## 4. 接口设计

### 4.1 打卡相关接口

| 接口路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|:--------|:-----|:-----|:--------|:---------|
| `/api/attendance/today` | GET | 获取今日打卡状态 | - | `{punchInTime, punchOutTime}` |
| `/api/attendance/punch` | POST | 提交打卡 | `{punchType: 0/1}` | 成功/失败 |
| `/api/attendance/records` | GET | 个人考勤记录 | `{month}` | 记录列表 |
| `/api/hr/attendance/list` | GET | HR考勤列表 | `{month, departmentId, pageNum, pageSize}` | `{list, total}` |
| `/api/attendance/calendar` | GET | 日历数据 | `{month}` | `{makeupAvailableDates}` |

### 4.2 补卡相关接口

| 接口路径 | 方法 | 功能 | 请求参数 |
|:--------|:-----|:-----|:--------|
| `/api/makeup-punch/apply` | POST | 申请补卡 | `{punchDate, punchTime, punchType, reason}` |

### 4.3 加班相关接口

| 接口路径 | 方法 | 功能 | 请求参数 |
|:--------|:-----|:-----|:--------|
| `/api/overtime/apply` | POST | 申请加班 | `{overtimeDate, startTime, endTime, overtimeHours, overtimeType, reason}` |

### 4.4 规则配置接口

| 接口路径 | 方法 | 功能 | 请求参数 |
|:--------|:-----|:-----|:--------|
| `/api/attendance-rule/groups` | GET | 获取考勤组列表 | - |
| `/api/attendance-rule/groups` | POST | 创建考勤组 | `{groupName, shiftType, workStartTime, workEndTime, lateThreshold, earlyThreshold, departmentIds}` |
| `/api/attendance-rule/groups` | PUT | 更新考勤组 | `{id, groupName, ...}` |
| `/api/attendance-rule/groups/{id}` | DELETE | 删除考勤组 | `{id}` |
| `/api/attendance-rule/holidays` | GET | 获取节假日列表 | - |
| `/api/attendance-rule/holidays` | POST | 创建节假日 | `{holidayDate, holidayType, holidayName, description}` |

### 4.5 请假相关接口

| 接口路径 | 方法 | 功能 | 请求参数 |
|:--------|:-----|:-----|:--------|
| `/api/leave/my` | GET | 获取我的请假记录 | - |
| `/api/leave/apply` | POST | 申请请假 | `{leaveType, startDate, endDate, days, reason, handoverPerson, timeSlot}` |
| `/api/leave/balance` | GET | 获取假期余额 | - |
| `/api/leave/approval-progress` | GET | 获取审批进度 | `{id}` |
| `/api/leave/cancel` | POST | 取消申请 | `{id}` |

### 4.6 统计相关接口

| 接口路径 | 方法 | 功能 | 请求参数 |
|:--------|:-----|:-----|:--------|
| `/api/attendance-stats/department` | GET | 部门统计 | `{month}` |
| `/api/attendance-stats/leave-type-distribution` | GET | 请假类型分布 | `{month, departmentId}` |
| `/api/attendance-stats/trend` | GET | 出勤率趋势 | `{departmentId, months, endMonth}` |
| `/api/attendance-stats/late-early-ranking` | GET | 迟到早退排行 | `{month, departmentId}` |
| `/api/attendance-stats/personal` | GET | 个人统计 | `{month}` |
| `/api/attendance-stats/personal-trend` | GET | 个人趋势 | `{months}` |

---

## 5. 关键技术实现

### 5.1 权限控制

```typescript
const { isAdmin, roleCode, dataScope } = usePermission();
const isAdminOrManager = isAdmin || dataScope <= 3;
const showDeptFilter = isAdmin || dataScope <= 3;
```

**逻辑说明**：
- `dataScope <= 3`：管理员和部门主管可以查看部门数据
- `dataScope === 5`：普通员工只能查看个人数据
- 根据角色动态显示/隐藏功能按钮和筛选器

### 5.2 数据请求策略

**管理员/HR路径**：
```typescript
const result = await request.get('/api/hr/attendance/list', { 
  params: { month, departmentId, pageNum, pageSize } 
});
```

**普通员工路径**：
```typescript
const result = await request.get('/api/attendance/records', { 
  params: { month } 
});
```

### 5.3 ECharts图表渲染

```typescript
useEffect(() => {
  if (!chartRef1.current) return;
  const chart = echarts.init(chartRef1.current);
  chart.setOption({ /* 配置项 */ });
  return () => chart.dispose(); // 组件卸载时销毁
}, [data]);
```

### 5.4 日期处理

使用 `dayjs` 进行日期格式化和计算：
- `dayjs().format('YYYY-MM')`：获取当前月份
- `dayjs(date).format('HH:mm')`：格式化时间
- `dayjs(date).subtract(1, 'month')`：上一个月

---

## 6. 流程说明

### 6.1 打卡流程

```
用户点击打卡按钮
        │
        ▼
┌───────────────────────┐
│ handlePunch('in'/'out')│
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ POST /api/attendance/ │
│ punch { punchType }   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ 后端记录打卡时间到     │
│ attendance表          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ 返回成功/失败          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ message.success/error │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ fetchTodayStatus()    │
│ 刷新今日打卡状态       │
└──────────┬────────────┘
           │
           ▼
    页面更新显示
```

### 6.2 请假申请流程

```
用户填写请假表单
        │
        ▼
┌───────────────────────┐
│ handleSubmit()        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ form.validateFields() │
│ 表单校验              │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ POST /api/leave/apply │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ 创建请假记录 +         │
│ 创建审批流程           │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ 返回审批状态          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ fetchLeaveRecords()   │
│ fetchLeaveBalance()   │
│ 刷新列表和余额        │
└───────────────────────┘
```

---

## 7. 代码优化建议

### 7.1 代码结构优化

**问题**：Attendance模块采用扁平结构，缺少services、types、components目录

**建议**：参考HR模块结构进行重构：
```
Attendance/
├── index.tsx              # 打卡中心
├── components/            # 公共组件
│   ├── PunchCard.tsx      # 打卡卡片
│   ├── AttendanceTable.tsx # 考勤表格
│   └── StatusLegend.tsx   # 状态图例
├── services/              # API封装
│   └── attendance.ts      # 考勤相关接口
├── types/                 # 类型定义
│   └── attendance.ts      # 数据接口定义
├── RuleConfig.tsx         # 规则配置
├── LeaveManagement.tsx    # 请假管理
└── Statistics.tsx         # 考勤统计
```

### 7.2 状态管理优化

**问题**：各页面独立管理状态，缺少全局状态共享

**建议**：使用UmiJS的model或Zustand进行状态管理，减少重复请求和状态同步问题。

### 7.3 代码复用优化

**问题**：四个页面中存在大量相似的样式和逻辑

**建议**：
- 提取公共样式常量
- 封装通用表格列配置
- 创建通用弹窗组件

---

## 8. 总结

考勤管理模块前端实现了完整的考勤业务流程，包括：
- **打卡中心**：实时时钟、打卡操作、记录查询、补卡/加班申请
- **规则配置**：考勤组管理、节假日配置、打卡规则展示
- **请假管理**：余额查询、请假/补卡/加班记录、审批进度跟踪
- **考勤统计**：个人/管理员双视图、多维度图表展示

技术亮点：
1. **角色权限动态控制**：根据dataScope自动切换数据查询接口和界面展示
2. **图表可视化**：使用ECharts实现多维度数据展示
3. **响应式布局**：使用Ant Design Grid系统实现自适应布局
4. **TypeScript类型安全**：完整的类型定义和接口约束
