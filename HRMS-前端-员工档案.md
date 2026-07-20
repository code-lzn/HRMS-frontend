# HRMS-前端-员工档案管理

# 1. 需求背景

> 实现员工档案的数字化统一管理，涵盖四类字段（基础信息/个人信息/工作信息/薪资合同）、高级搜索、列表展示、字段权限控制、变更历史追踪、调岗/离职流程申请。

## 1.1 项目成员

| **角色** | **成员** | **备注** |
| --- | --- | --- |
| 业务方 | - | HR部门 |
| 产品经理（PD） | - | |
| 后端技术 | - | |
| UED（设计师） | - | |
| 前端 | - | |
| 质量 | - | |

## 1.2 项目文档

PRD 文档：[HRMS.md](./HRMS.md) 第4章

UED：选填

后端系分：[HRMS-后端-员工档案管理.md](./HRMS-后端-员工档案管理.md)

# 2. 详细设计

## 2.1 前端迭代目标

1. 员工列表页：默认列表 + 高级搜索 + 分页
2. 员工档案详情页：头部信息 + Tab 切换（个人信息/工作信息/薪资合同），敏感字段脱敏
3. 员工新增页：完整表单 + 身份选择 + 字段校验
4. 员工编辑页：按角色锁定字段控制可编辑项，仅提交变更字段
5. 调岗/离职申请弹窗：从列表页快速发起
6. 变更历史：时间线展示
7. 字段权限：详情页/编辑页按角色动态控制可见和可编辑字段

## 2.2 迭代具体描述

### 2.2.1 员工列表页

**源码路径：** [src/pages/Employee/List/index.tsx](src/pages/Employee/List/index.tsx)

##### UI&交互

- 顶部高级搜索区（默认收起，点击展开）
- 使用 Ant Design `<Table>` 组件，内置分页
- 数据范围提示：部门主管（dataScope=3）显示所属数据范围 Alert
- 点击姓名进入详情页
- 每行操作列：查看 / 编辑 / 更多（调岗、离职）
- 已离职员工行灰色样式（opacity 0.6, #fafafa 背景, #999 文字）

##### 高级搜索字段

| 字段名称 | 说明 | 输入方式 | 是否必填 | 默认值 | 字段类型 | 数据源 |
| --- | --- | --- | --- | --- | --- | --- |
| 关键词 | 姓名/工号/手机号模糊 | Input | N | - | string | - |
| 部门 | 多选（部门主管自动限定） | TreeSelect multiple | N | - | number[] | `/api/departments/tree` |
| 职位 | 多选 | Select multiple + 搜索 | N | - | number[] | `/api/positions/list` |
| 在职状态 | 多选 | Select multiple | N | - | number[] | 枚举：试用期(1)/正式(2)/待离职(3)/已离职(4) |
| 入职日期 | 日期范围 | DateRangePicker | N | - | {start,end} | - |

**数据范围控制：** 部门主管（roleId=3, dataScope=3）登录时，自动通过 `getMyProfileUsingGet` 获取所属部门 ID，调用 `collectSubDeptIds` 递归收集本部门及所有下级部门 ID，限定 TreeSelect 可选范围并自动传入 `departmentIds` 参数。

##### 列表默认展示字段

| 字段 | 字段名 | 宽度 | 说明 |
| --- | --- | --- | --- |
| 姓名 | `employeeName` | 120 | 点击跳转详情 |
| 工号 | `employeeNo` | 120 | - |
| 部门 | `departmentName` | 120 | 关联查询 |
| 职位 | `positionName` | 140 | 关联查询 |
| 在职状态 | `status` | 100 | Tag：试用期(蓝)/正式(绿)/待离职(橙)/已离职(灰) |
| 入职日期 | `hireDate` | 120 | YYYY-MM-DD（截取前10位） |
| 操作 | - | 200 | 查看 / 编辑 / 更多 |

##### 操作按钮

| 按钮 | 交互 | 二次确认 | 显示控制 |
| --- | --- | --- | --- |
| 查看详情 | 跳转 /employee/detail/:id | N | 始终 |
| 编辑 | 跳转 /employee/edit/:id | N | `employee:edit` 权限 + 状态为试用期(1)/正式(2) |
| 调岗 | 打开调岗弹窗 | N | `employee:delete` 权限 + 状态为试用期/正式 |
| 离职 | 打开离职弹窗 | N | `employee:delete` 权限 + 状态为试用期/正式 |

> 编辑/调岗/离职按钮对已离职(status=4)和待离职(status=3)员工隐藏。已离职员工仅可查看详情。

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `GET /api/employee/list` | 员工列表（分页+高级搜索） |
| `GET /api/departments/tree` | 部门下拉数据源 |
| `GET /api/positions/list` | 职位下拉数据源 |
| `GET /api/employee/my-profile` | 获取当前用户所属部门（数据范围限定） |

---

### 2.2.2 员工详情页

**源码路径：** [src/pages/Employee/Detail/index.tsx](src/pages/Employee/Detail/index.tsx)

##### UI&交互

- 页面头部：Avatar + 姓名 + 状态 Tag + 工号 + 部门 + 职位 + 职级 Tag + 入职日期/工龄/工作地
- 4 个 Metric 指标卡片：直接汇报人 / 入职类型 / 合同类型 / 试用期待遇比例
- 三个 Tab 切换：个人信息 / 工作信息 / 薪资合同（无薪资数据时不显示）
- 按钮：返回列表 / 变更历史（`canSeeHistory`）/ 编辑档案（`canEdit`）

##### 个人信息 Tab（分左右两栏）

**基础信息（左栏）：** 工号、系统账号（脱敏）、在职状态 Tag、入职日期、创建时间

**个人信息（右栏）：** 姓名、性别、手机号、邮箱、身份证号、生日、户籍地址、现居住地址

敏感字段可见性通过 `useEmployeeFieldPermission` hook 控制：

| 字段 | 可见性 | 脱敏处理 |
| --- | --- | --- |
| 系统账号 | 始终 | `前3位***后2位` |
| 手机号 | HR/部门主管/本人 | `前3位****后4位` |
| 邮箱 | HR/部门主管/本人 | 不可见时显示 `****` |
| 身份证号 | HR/本人 | `前4位****后4位` |
| 户籍地址 | HR/本人 | 不可见时显示 `****` |
| 现居住地址 | HR/部门主管/本人 | 不可见时显示 `****` |
| 银行账号 | 薪资合同 Tab | `****后4位` |

##### 工作信息 Tab

所属部门、职位、直接汇报人、工作地点、录用类型（FULL_TIME/PART_TIME/INTERN → 中文）

##### 薪资合同 Tab

合同类型、合同到期日、试用期待遇比例、基本工资、银行账号（脱敏）、开户行

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `GET /api/employee/detail?id={id}` | 员工详情（扁平 VO，无嵌套分区） |

---

### 2.2.3 员工新增页

**源码路径：** [src/pages/Employee/Add/index.tsx](src/pages/Employee/Add/index.tsx)

##### 表单分区（左右布局）

**左侧 40% — 个人信息：**

| 字段 | 输入方式 | 必填 | 说明 |
| --- | --- | --- | --- |
| 姓名 | Input | Y | 最多32字符 |
| 性别 | Radio | Y | 男(1)/女(0) |
| 手机号 | Input | Y | 11位手机号校验 + 唯一性校验（onBlur 触发 `listEmployeesUsingGet` 搜索） |
| 邮箱 | Input | N | 邮箱格式校验 |
| 身份证号 | Input | Y | 17位数字+X，`/^\d{17}[\dXx]$/` |
| 生日 | DatePicker | N | - |
| 户籍地址 | Input | N | 最多128字符 |
| 现居住地址 | Input | N | 最多128字符 |

**右侧 60% — 工作信息 / 薪资合同 / 紧急联系人：**

**工作信息：**

| 字段 | 输入方式 | 必填 | 数据源 |
| --- | --- | --- | --- |
| 所属部门 | TreeSelect | Y | `/api/departments/tree` |
| 职位 | Select | Y | `/api/positions/list` |
| 身份（角色） | Select | Y | `/api/role/list/enabled`（排除系统管理员） |
| 直属上级 | Select + 搜索 | N | 员工列表接口，按选定部门过滤 |
| 工作地点 | Input | N | 最多64字符 |
| 入职日期 | DatePicker | Y | - |
| 录用类型 | Select | Y | FULL_TIME/PART_TIME/INTERN |

**薪资与合同：**

| 字段 | 输入方式 | 必填 | 说明 |
| --- | --- | --- | --- |
| 合同类型 | Select | Y | 固定期限(1)/无固定期限(2)/劳务合同(3) |
| 合同到期日 | DatePicker | 条件必填 | 固定期限时必填 |
| 试用期待遇比例 | Slider | Y | 80%~100%，步长5% |
| 薪资账套 | Select | N | `/api/salary/accounts/list` |
| 基本工资 | InputNumber | Y | ¥，不可负 |
| 银行账号 | Input | N | 最多32字符 |
| 开户行 | Input | N | 最多64字符 |

**紧急联系人：**

| 字段 | 输入方式 | 必填 |
| --- | --- | --- |
| 联系人姓名 | Input | N |
| 联系人电话 | Input | N | 手机号格式校验 |

**关于 Promise.allSettled：** 新增页使用 `Promise.allSettled` 加载部门树、职位列表、薪资账套、角色列表四项数据，避免单项失败阻塞整个页面。

##### 操作按钮

| 按钮 | 交互 | 二次确认 |
| --- | --- | --- |
| 保存 | 提交 → 成功后跳转列表页 | N |
| 取消 | 返回列表 | 有未保存更改时提示"未保存的更改将丢失" |

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `POST /api/employee/add` | 新增员工 |
| `GET /api/departments/tree` | 部门下拉 |
| `GET /api/positions/list` | 职位下拉 |
| `GET /api/employee/list` | 汇报人搜索 |
| `GET /api/role/list/enabled` | 角色列表（排除系统管理员） |
| `GET /api/salary/accounts/list` | 薪资账套 |

---

### 2.2.4 员工编辑页

**源码路径：** [src/pages/Employee/Edit/index.tsx](src/pages/Employee/Edit/index.tsx)

##### UI

- 左右布局：左侧个人信息(40%) + 右侧工作信息+薪资合同(60%)
- 左侧和右侧各自独立滚动
- 顶部面包屑 + 员工姓名 + 取消/保存按钮
- `pickVal` 函数：兼容扁平 VO（API 直接返回）和嵌套 VO(apiResp.personalInfo.xxx) 两种数据格式

##### 锁定字段逻辑（`lockedFields`）

根据当前用户的 roleId 动态计算锁定字段列表：

| 权限层级 | roleId | 锁定字段 | 可编辑字段 |
| --- | --- | --- | --- |
| **管理员** | 1 | 工作信息流程字段 + 录用类型 | 个人信息全部 + 薪资合同全部 |
| **HR专员** | 2 | 工作信息流程字段 + 录用类型 | 个人信息全部 + 薪资合同全部 |
| **部门主管及以上** | 3/4/5 | 全部锁定 | 无 |

锁定字段分类：
- **流程字段**（`lockedFields`）：`departmentId`, `positionId`, `directReportId`, `workLocation`, `hireDate`
- **始终锁定**：`employmentType`
- **薪资字段**（roleId≥3 时锁定）：`contractType`, `contractExpireDate`, `probationRatio`, `accountSetId`, `baseSalary`, `bankAccount`, `bankName`
- **个人信息字段**（roleId≥3 时锁定）：`employeeName`, `gender`, `email`, `birthday`, `registeredAddress`, `currentAddress`

> 手机号(`phone`)和身份证号(`idCard`)字段在编辑页中始终不受 lockedFields 约束——没有锁定时可编辑，但当前锁定逻辑下管理员/HR 可编辑，其他角色完全锁定，所以实际不可编辑。

##### 保存逻辑

- `getChangedFields()` 对比当前值与初始值，仅提交变更字段
- 没有变时提示"没有修改任何内容"
- 只校验有变更的字段（`form.validateFields(changedKeys)`）
- 提交 `updateEmployeeUsingPut(changedFields)`，发送 `{ id, ...修改的字段 }`

##### 操作按钮

| 按钮 | 交互 | 二次确认 |
| --- | --- | --- |
| 保存 | 提交 changed fields | N |
| 取消 | 返回详情页 | Y，"未保存的更改将丢失" |

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `GET /api/employee/detail?id={id}` | 加载员工详情 |
| `GET /api/departments/tree` | 部门下拉 |
| `GET /api/positions/list` | 职位下拉 |
| `GET /api/employee/list` | 直接汇报人搜索 |
| `GET /api/salary/accounts/list` | 薪资账套 |
| `PUT /api/employee/update` | 更新员工 |

---

### 2.2.5 调岗弹窗

**源码路径：** [src/pages/Employee/List/components/TransferModal.tsx](src/pages/Employee/List/components/TransferModal.tsx)

##### 调用入口

员工列表页操作列 → "更多"下拉 → "调岗"（需 `employee:delete` 权限，员工状态为试用期/正式）

##### UI 结构（三区划分）

**当前信息（只读 Descriptions）：** 姓名、工号、部门、职位

**调岗信息：**

| 字段 | 说明 | 输入方式 | 必填 |
| --- | --- | --- | --- |
| 目标部门 | - | TreeSelect | Y |
| 目标职位 | - | Select（搜索） | N |
| 目标职级 | 如 P5/M2 | Input | N |
| 新直属汇报人 | 搜索在职员工 | Select（搜索） | N |
| 工作地点 | - | Input | N |
| 录用类型 | 保持不变/全职/兼职/实习 | Select | N |

**其他：**

| 字段 | 说明 | 输入方式 | 必填 |
| --- | --- | --- | --- |
| 调薪金额 | ¥，步长100 | InputNumber | N |
| 调岗原因 | - | TextArea | Y |
| 生效日期 | 默认为审批通过日期 | DatePicker | N |
| 备注 | - | TextArea | N |

##### 提交流程

```
提交申请 → submitUsingPost3 → 走审批流程 → 审批通过后后端自动更新员工信息
```

提交数据：`{ employeeId, toDeptId, toPositionId, toRankCode, toReporterId, workLocation, employmentType, salaryAdjustment, effectiveDate, reason, remark }`

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `POST /api/transfer/submit` | 提交调岗申请 |
| `GET /api/employee/list` | 加载在职员工列表（供新直属汇报人选择） |

---

### 2.2.6 离职弹窗

**源码路径：** [src/pages/Employee/List/components/ResignationModal.tsx](src/pages/Employee/List/components/ResignationModal.tsx)

##### 调用入口

员工列表页操作列 → "更多"下拉 → "离职"（需 `employee:delete` 权限，员工状态为试用期/正式）

##### UI 结构

**员工信息（只读 Descriptions）：** 姓名、工号、部门、职位、入职日期

**离职信息：**

| 字段 | 说明 | 输入方式 | 必填 |
| --- | --- | --- | --- |
| 离职日期 | 最后工作日，不可选过去日期 | DatePicker | Y |
| 离职原因大类 | 主动/被动/协商 | Select | Y |
| 离职类型 | 辞职/辞退/合同到期不续签/其他 | Select | Y |
| 详细说明 | - | TextArea | Y |
| 工作交接人 | 搜索在职员工 | Select（搜索） | Y |
| 备注 | - | TextArea | N |

**离职原因大类枚举：** `VOLUNTARY`(主动离职) / `INVOLUNTARY`(被动离职) / `NEGOTIATED`(协商离职)

**离职类型枚举：** `RESIGN`(辞职) / `DISMISS`(辞退) / `CONTRACT_EXPIRE`(合同到期不续签) / `OTHER`(其他)

##### 提交流程

```
提交申请 → submitUsingPost2 → 走审批流程 → 审批通过后后端自动改状态(3→4)
```

> **关键约束：** 提交离职申请后，前端不做乐观更新，员工状态不变。仅在审批通过后由后端自动将状态从"待离职(3)"改为"已离职(4)"。

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `POST /api/resignation/submit` | 提交离职申请 |
| `GET /api/employee/list` | 加载在职员工列表（供工作交接人选择） |

---

### 2.2.7 变更历史抽屉

**源码路径：** [src/pages/Employee/components/ChangeHistoryDrawer.tsx](src/pages/Employee/components/ChangeHistoryDrawer.tsx)

##### UI

- 右侧 Drawer，宽度 520px
- Timeline 展示：变更字段名 + 变更类型 Tag（直接编辑/流程变更/系统自动）+ 旧值→新值 + 操作人 + 时间 + 备注

##### 调用入口

详情页头部"变更历史"按钮 → 需 `canSeeHistory`（HR/部门主管）

##### 所需 API

| 接口 | 说明 |
| --- | --- |
| `GET /api/employee/change-logs?employeeId={id}&page=1&size=50` | 变更历史分页 |

---

### 2.2.8 员工表单公共组件

**源码路径：** [src/pages/Employee/components/EmployeeForm.tsx](src/pages/Employee/components/EmployeeForm.tsx)

被 Add 和 Edit 页共同使用的表单组件，包含四分区 Card：
- **个人信息：** 姓名/性别/手机号/邮箱/身份证号/生日/户籍地址/现居住地址
- **工作信息：** 所属部门/职位/直属上级/工作地点/入职日期/录用类型 + 新增时显示"身份"字段
- **薪资与合同：** 合同类型/合同到期日/试用期待遇比例/基本工资/银行账号/开户行
- **紧急联系人：** 联系人姓名/联系人电话

Props 接口：
```typescript
interface EmployeeFormProps {
  mode: 'add' | 'edit';
  form: FormInstance;
  lockedFields?: string[];
  departmentTreeData: API.DepartmentTreeVO[];
  positionOptions: API.PositionVO[];
  roleOptions?: { label: string; value: number }[];
}
```

> **说明：** Add 页和 Edit 页虽然都使用四分区结构，但当前实现中各自维护独立的表单代码（未统一使用 EmployeeForm 组件）。Add 页使用左右两列布局（40%+60%），Edit 页使用同样的布局但增加了 lockedFields 逻辑。

---

## 2.3 菜单与权限变动

### 权限体系

通过 `src/utils/permission.ts` 统一管理，基于 roleId 或后端返回的 `permissionCodes`。

#### 角色对照

| roleId | 角色 | roleCode |
|-------|------|----------|
| 1 | 系统管理员 | admin |
| 2 | HR专员 | hr |
| 3 | 部门主管 | dept_head |
| 4 | 财务专员 | finance |
| 5 | 普通员工 | employee |

#### 权限码 fallback 对照（permissionCodes 为空时）

| roleId | 拥有的权限 |
|-------|-----------|
| 1(admin) | `employee:list`, `employee:add`, `employee:edit`, `employee:delete`, `employee:detail`, `attendance:list`, `attendance:manage`, `approval:process`, `org:manage`, `role:manage`, `system:config`, `system:backup` |
| 2(hr) | `employee:list`, `employee:add`, `employee:edit`, `employee:delete`, `employee:detail`, `salary:list`, `salary:view`, `salary:audit`, `attendance:list`, `attendance:manage`, `approval:process`, `org:manage` |
| 3(dept_head) | `employee:list`, `employee:detail`, `attendance:list`, `attendance:manage`, `approval:process` |
| 4(finance) | `salary:list`, `salary:view`, `salary:audit` |
| 5(employee) | 无 |

#### 页面访问与操作控制

| 菜单路径 | 访问权限 | 操作权限 | 备注 |
| --- | --- | --- | --- |
| 员工管理 > 员工列表 | `employee:list`(1/2/3) | 新增：`employee:add`(1/2) | 查看始终显示 |
| | | 编辑：`employee:edit`(1/2) | 部门主管(3)无 `employee:edit`，但在列表行中通过状态(试用期/正式)和 `hasPermission` 双重控制 |
| | | 调岗/离职：`employee:delete`(1/2) | 仅状态为试用期/正式时显示 |
| 员工管理 > 员工详情 | `employee:list` | 编辑：`employee:edit` | 字段级可见性由 `useEmployeeFieldPermission` 控制 |
| | | 变更历史：`canSeeHistory` | HR/部门主管可见 |
| 员工管理 > 员工新增 | `employee:add`(1/2) | - | |
| 员工管理 > 员工编辑 | `employee:edit`(1/2/3) | 锁定字段由 `lockedFields` 控制 | 管理员/HR 可编辑除流程字段外所有字段 |

#### 详情页字段可见性矩阵（useEmployeeFieldPermission）

| 敏感区域 | 管理员(admin) | HR(hr) | 部门主管(dept_head) | 财务(finance) | 普通员工(employee) |
| --- | :-: | :-: | :-: | :-: | :-: |
| 手机号/邮箱/现居住地址 | ✓ | ✓ | ✓(本人时) | ✗ | ✓(仅本人) |
| 身份证号 | ✓ | ✓ | ✗ | ✗ | ✓(仅本人) |
| 户籍地址 | ✓ | ✓ | ✗ | ✗ | ✓(仅本人) |
| 薪资合同 Tab | ✓ | ✓ | ✗ | ✓ | ✓(仅本人) |
| 编辑按钮 | ✓ | ✓ | ✗ | ✗ | ✓(仅本人) |
| 变更历史 | ✓ | ✓ | ✓ | ✗ | ✗ |

> 当前 `isSelf` 判定方式：`currentUser?.userName === detail?.employeeName`（通过姓名匹配，不精确）。

#### 编辑页锁定字段矩阵

| 功能字段 | 管理员(1) | HR(2) | 部门主管(3) | 其它(4/5) |
| --- | :-: | :-: | :-: | :-: |
| 个人信息（姓名/性别/邮箱等） | ✓ | ✓ | ✗ | ✗ |
| 手机号/身份证号 | ✓ | ✓ | ✗ | ✗ |
| 所属部门/职位/直属上级/工作地点/入职日期 | ✗ | ✗ | ✗ | ✗ |
| 录用类型 | ✗ | ✗ | ✗ | ✗ |
| 薪资合同字段 | ✓ | ✓ | ✗ | ✗ |

> ✓ = 可编辑, ✗ = 锁定(disabled)

---

## 2.4 模块划分与工作量评估

| 模块 | 细节 | 开发 | 联调 | 自测 |
| --- | --- | --- | --- | --- |
| 员工列表页 | 高级搜索 + Table + 分页 + 数据范围 | 2 | 1 | 0.5 |
| 员工详情页 | 头部+指标 + Tab切换 + 字段权限 + 敏感脱敏 | 2 | 1 | 0.5 |
| 员工新增页 | 四分区表单 + 身份选择 + 薪资账套 | 2 | 1 | 0.5 |
| 员工编辑页 | 动态表单 + 锁定字段 + 变更字段提交 | 2 | 0.5 | 0.5 |
| 调岗弹窗 | 三区表单 + 提交审批 | 1 | 0.5 | 0.5 |
| 离职弹窗 | 员工信息 + 离职表单 + 提交审批 | 1 | 0.5 | 0.5 |
| 变更历史 | Timeline 抽屉 | 0.5 | 0.5 | 0 |

\[20260713~~20260714\] 系分编写/修订
\[20260714~~20260715\] 系分评审
\[20260716~~20260718\] 实现列表/详情/新增/编辑页
\[20260719~~20260720\] 实现调岗/离职弹窗 + 权限控制
\[20260720~~20260722\] 联调
\[20260722~~20260724\] 测试

# 3. 监控和埋点

- 员工搜索埋点（关键词 + 筛选条件组合）
- 员工详情查看埋点
- 员工新增/编辑/删除操作埋点
- 调岗/离职申请提交埋点

# 4. 发布计划

- 预发验证：各角色字段可见性/可编辑性、敏感字段脱敏、高级搜索组合、调岗/离职流程
- 灰度发布：先开放给 HR 角色
- 回滚方案：回滚前端版本，后端兼容

# 5. 其他

## 5.1 风险评估

- 字段权限矩阵复杂，需逐角色验证详情页和编辑页
- 编辑页的 `lockedFields` 逻辑基于 roleId 而非 permissionCodes，若权限系统切换为动态 codes 需同步更新
- `useEmployeeFieldPermission` 中 `isSelf` 判定通过姓名匹配不精确，需后端返回当前登录用户 employeeId
- 调岗/离职流程提交流程：前端仅提交申请，状态变更由后端审批流程驱动——联调时需确认审批回调逻辑
- 新增页使用 `Promise.allSettled` 而非 `Promise.all`，避免单个接口失败阻塞页面

## 5.2 变更记录

| **日期** | **版本** | **修订说明** | **作者** |
| --- | --- | --- | --- |
| 2026-07-10 | 1.0 | 初稿 | - |
| 2026-07-13 | 1.2 | 补全四类字段定义、高级搜索、字段权限、变更历史 | - |
| 2026-07-14 | 1.3 | 同步后端：移除 jobLevel 列表字段、移除 salaryProfileId/hireType 表单字段 | - |
| 2026-07-15 | 1.4 | 同步后端 v1.4：详情页改用扁平 VO 无分区嵌套、新增响应仅返回 id | - |
| 2026-07-16 | 1.5 | 统一权限系统：新增 permission.ts，基于 roleId 的 hasPermission | - |
| 2026-07-16 | 1.6 | 新增员工时增加「身份」选择，入职日期改回必填 | - |
| 2026-07-18 | 1.7 | 实现编辑页 lockedFields 三层级锁定（管理员/HR/其他） | - |
| 2026-07-19 | 1.8 | 新增调岗弹窗（transferModal）和离职弹窗（resignationModal） | - |
| 2026-07-20 | 1.9 | 新增 useEmployeeFieldPermission 字段可见性 hook，详情页 Tab 切换重构；提交离职/调岗仅创建申请，状态由审批驱动 | - |
