# HRMS-前端-组织架构管理

# 1. 需求背景

> 实现公司多级组织架构的可视化管理，涵盖部门树管理、部门合并、职位管理、序列职级对照等核心功能，为员工档案、入转调离等模块提供组织基础数据。

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

PRD 文档：[HRMS.md](./HRMS.md) 第3章

UED：选填

后端系分：[HRMS-后端-组织架构.md](./HRMS-后端-组织架构.md)

前端公共组件系分: 选填

迭代地址: -

开发环境地址：-

测试环境地址：-

# 2. 详细设计

## 2.1 前端迭代目标

1. 部门树管理：左侧自建树组件 + 右侧部门详情 + 下级部门卡片，支持新增/编辑/删除/合并
2. 部门搜索：自下而上过滤树，子节点匹配时保留父节点
3. 部门合并：源部门+目标部门选择，校验+转移统计展示
4. 职位管理：职位列表页 + 新增/编辑职位表单
5. 序列职级对照：序列-职级对照表抽屉展示

## 2.2 迭代具体描述

### 2.2.1 部门树管理页

**源码路径：** [src/pages/Organization/Department/index.tsx](src/pages/Organization/Department/index.tsx)

##### UI&交互

- **左右分栏布局：** 左侧部门树（自建 TreeNode 组件，带连接线和层级缩进），右侧部门详情 + 下级部门卡片
- **自建树组件：** 不使用 Ant Design Tree，自定义渲染节点，包含：
  - 连接线（竖直 + 水平线表示层级关系）
  - 圆点指示器（选中时蓝色，未选中灰色）
  - 两行展示：第一行 名称 + 编码 Tag，第二行 负责人 + 人数 badge
  - hover 背景色变化（#f8fafc），选中蓝色高亮（#eff6ff + #bfdbfe 边框）
- 点击节点切换选中部门，右侧联动更新（直接从已有树数据取，无需额外请求）
- 搜索后树过滤，匹配节点及其路径自动保留
- 每层节点显示「在职人数」badge（蓝色 #2563eb）
- 搜索无结果时显示"未找到匹配的部门"

##### 前端逻辑

###### 页面布局

- 页面标题：部门管理
- 搜索框：可搜索部门名称/编码/负责人，自下而上过滤
- 工具栏按钮：合并部门 + 新增部门

###### 部门过滤函数（已修复）

**源码位置：** [src/pages/Organization/Department/index.tsx](src/pages/Organization/Department/index.tsx) 第16-33行

```typescript
/** 自下而上过滤：先递归过滤子节点，再保留匹配的父节点 */
const filterTree = (nodes, keyword) => {
  if (!keyword.trim()) return nodes;
  const kw = keyword.toLowerCase();
  const filter = (list) =>
    list.map((n) => ({ ...n, children: n.children?.length ? filter(n.children) : [] }))
      .filter((n) => n.children?.length || n.name?.toLowerCase().includes(kw) || 
              n.code?.toLowerCase().includes(kw) || n.managerName?.includes(kw));
  return filter(nodes);
};
```

> **修复说明：** 原实现是自上而下过滤，导致当父节点名称不匹配关键字时整个子树被裁剪。修复后改为先递归过滤子节点，再判断当前节点是否保留——节点匹配或存在匹配的子节点时都保留。

###### 选中节点同步逻辑

树数据刷新后（加载/编辑/新增后），通过 useEffect 从新树中递归查找之前选中的节点并更新 `selectedDept`，保持选中态不丢失。

```typescript
useEffect(() => {
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === selectedDept.id) return node;
      if (node.children?.length) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
  };
  const updated = findNode(treeData);
  if (updated) setSelectedDept(updated);
}, [treeData, selectedDept?.id]);
```

###### 右侧部门详情面板

**源码路径：** [src/pages/Organization/Department/components/DepartmentDetail.tsx](src/pages/Organization/Department/components/DepartmentDetail.tsx)

两卡片布局：

1. **部门基本信息卡片：**
   - 信息行：编码、部门名称、上级部门（从树数据递归查找）、部门负责人、排序序号、部门描述
   - 在职人数大字展示（蓝色大号数字）
   - 右上角操作按钮：编辑 + 删除（需 `org:manage` 权限）

2. **直属子部门卡片：**
   - 子部门数统计
   - 网格布局展示子部门卡片（每行2列）：名称 + 负责人 + 人数 badge
   - 无子部门时隐藏

###### 新增部门弹窗

**源码路径：** [src/pages/Organization/Department/components/DeptFormModal.tsx](src/pages/Organization/Department/components/DeptFormModal.tsx)

| 字段名称 | 说明 | 输入方式 | 是否必填 | 默认值 | 最大长度 | 输入限制 | 提示 | 数据源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 部门名称 | 如"技术部" | Input | Y | - | 32 | - | 请输入部门名称 | - |
| 部门编码 | 2位字母或数字 | Input | Y | - | 2 | `/^[A-Za-z0-9]{2}$/` | 请输入2位编码 | - |
| 上级部门 | 默认为当前选中 | TreeSelect | N | 选中部门 | - | - | 请选择上级部门 | 部门树 |
| 部门负责人 | - | Select+搜索 | N | - | - | - | 请选择负责人 | 员工列表 |
| 排序序号 | 越小越靠前 | InputNumber | Y | 0 | - | 正整数 | - | - |
| 部门描述 | 职能说明 | TextArea | N | - | 128 | - | 请输入部门描述 | - |

**前端校验拦截：**
- 部门名称不能为空
- 部门编码不能为空，`/^[A-Za-z0-9]{2}$/`
- 同级部门名称不可重复（`checkSiblingNameDuplicate`遍历兄弟节点）
- 部门层级不超过5级（`getDeptDepth`向上递归计算父节点深度）

###### 编辑部门弹窗

| 字段名称 | 输入方式 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| 部门名称 | Input | Y | 回填当前值 |
| 部门编码 | Input | - | **只读(disabled)**，创建后不可修改 |
| 上级部门 | TreeSelect | - | **只读(disabled)**，修改提示："如需调整上级部门，请使用「合并部门」功能" |
| 部门负责人 | Select+搜索 | N | 回填当前值 |
| 排序序号 | InputNumber | Y | 回填当前值 |
| 部门描述 | TextArea | N | 回填当前值 |

**编辑模式更新请求体（不包含 `parentId`）：**
```typescript
await updateDepartmentUsingPut({
  id: editDept.id,
  name: values.name,
  managerId: values.managerId ?? null,
  sortOrder: values.sortOrder ?? 0,
  description: values.description,
});
```

> 编辑模式下 `parentId` 不在 update 请求中发送，因为后端 `DepartmentUpdateRequest` 不包含 `parentId` 字段。

**编辑模式校验：**
- 修改上级部门时的校验逻辑虽保留（不能自身设为上级、不能是子孙节点、层级不超过5级），但因 `parentId` 已 disabled，这些校验实际不会触发

###### 合并部门弹窗

**源码路径：** [src/pages/Organization/Department/components/MergeDeptModal.tsx](src/pages/Organization/Department/components/MergeDeptModal.tsx)

| 字段名称 | 说明 | 输入方式 | 是否必填 | 数据源 |
| --- | --- | --- | --- | --- |
| 源部门 | 被合并 | Select（扁平列表+搜索） | Y | 部门树展开为扁平选项列表 |
| 目标部门 | 保留 | TreeSelect | Y | 部门树 |

**校验逻辑：**
- 源部门 ≠ 目标部门
- 目标部门不能是源部门的子孙节点（`isDescendant` 递归检查）
- 提交前提示"合并后源部门将被删除，其员工和子部门将全部转移至目标部门"

**合并成功后展示：**
```
Modal.success({
  content: `已将 X 名员工和 Y 个子部门转移至目标部门。`
});
```

`transferredEmployees` 和 `transferredChildDepts` 来自接口返回的 `DepartmentMergeResultVO`。

###### 操作按钮

| 按钮 | 交互 | 二次确认 | 显示控制 |
| --- | --- | --- | --- |
| 新增部门 | 打开新增弹窗 | N | `org:manage` 权限（roleId 1/2） |
| 编辑部门 | 打开编辑弹窗 | N | `org:manage` 权限 |
| 删除部门 | Modal.confirm → 调用删除接口 | Y，"确定删除该部门吗？" | `org:manage` 权限 |
| 合并部门 | 打开合并弹窗 → 成功后显示转移统计 | Y，操作说明提示 | `org:manage` 权限 |

> 无 `org:manage` 权限的用户（roleId 3/4/5）仍可查看部门树和基本信息，所有操作按钮隐藏。

##### 所需API

| 接口 | 说明 | 请求方式 |
| --- | --- | --- |
| `GET /api/departments/tree` | 获取部门树（含递归人数） | 无参数 |
| `GET /api/departments/detail?id={id}` | 查询单个部门详情 | Query String |
| `POST /api/departments/add` | 新增部门 | JSON Body |
| `PUT /api/departments/update` | 编辑部门 | JSON Body（不含 parentId） |
| `POST /api/departments/delete` | 删除部门 | JSON Body `{ "id": xx }` |
| `POST /api/departments/merge` | 合并部门 | JSON Body |

---

### 2.2.2 职位列表页

**源码路径：** [src/pages/Organization/Position/index.tsx](src/pages/Organization/Position/index.tsx)

##### UI&交互

- 顶部筛选栏 + 表格列表
- 序列用 Select 筛选（M管理 / P专业 / S支持）
- 表格列：职位名称、序列、所属部门、职级范围、默认试用期、操作
- 操作按钮：新增职位 + 序列职级对照（始终显示）

##### 列表筛选

| 字段名称 | 说明 | 输入方式 | 默认值 | 数据源 |
| --- | --- | --- | --- | --- |
| 序列 | 职位序列 | Select | 全部 | 枚举：M/P/S |
| 所属部门 | 按部门过滤 | TreeSelect | 全部 | 部门树 |

##### 列表展示字段

| 字段名称 | 说明 |
| --- | --- |
| 职位名称 | 如"Java开发工程师" |
| 序列 | M管理 / P专业 / S支持 |
| 所属部门 | 为空显示"全公司通用" |
| 职级范围 | 如"P1-P10"（`levelRange`） |
| 默认试用期 | 如"3个月"（`defaultProbationMonths`） |
| 职位描述 | 超长截断 + Tooltip |

##### 操作按钮

| 按钮 | 显示控制 |
| --- | --- |
| 新增职位 | `org:manage` 权限 |
| 编辑 | `org:manage` 权限 |
| 删除 | `org:manage` 权限，二次确认 |
| 序列职级对照 | 始终显示 |

##### 所需API

| 接口 | 说明 |
| --- | --- |
| `GET /api/positions/list?sequence={x}&departmentId={x}` | 职位列表 |
| `POST /api/positions/add` | 新增职位 |
| `PUT /api/positions/update` | 编辑职位 |
| `POST /api/positions/delete` | 删除职位 |
| `GET /api/positions/sequences` | 序列职级对照 |

---

### 2.2.3 职位新增/编辑表单

**源码路径：** [src/pages/Organization/Position/components/PositionFormModal.tsx](src/pages/Organization/Position/components/PositionFormModal.tsx)

| 字段 | 输入方式 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 职位名称 | Input | Y | - | 最多32字符 |
| 职位序列 | Select | Y | P | M/P/S |
| 所属部门 | TreeSelect | N | - | 空=全公司通用 |
| 职级下限 | Select | Y | - | 从 `levels` 联动过滤 |
| 职级上限 | Select | Y | - | 从 `levels` 联动过滤 |
| 默认试用期(月) | InputNumber | Y | 3 | 1-12 |
| 职位描述 | TextArea | N | - | 最多256字符 |

**校验：** 职级下限不能高于职级上限（比较 `levels` 数组中的 index）。

---

### 2.2.4 序列职级对照表

**源码路径：** [src/pages/Organization/Position/components/SequenceDrawer.tsx](src/pages/Organization/Position/components/SequenceDrawer.tsx)

右侧 Drawer 展示三列卡片布局：管理序列 M（M1-M5）、专业序列 P（P1-P10）、支持序列 S（S1-S5）。

数据源：`GET /api/positions/sequences`

---

## 2.3 菜单与权限变动

权限体系统一通过 `src/utils/permission.ts` 管理：

| 菜单路径 | 查看权限 | 操作权限 |
| --- | --- | --- |
| 组织架构 > 部门管理 | `org:view`（所有登录用户） | `org:manage`（roleId 1/2） |
| 组织架构 > 职位管理 | `org:view`（所有登录用户） | `org:manage`（roleId 1/2） |

`org:manage` 通过 `hasPermission(currentUser, 'org:manage')` 判断，对应 roleId 1（管理员）和 2（HR专员）。

---

## 2.4 模块划分与工作量评估

| 模块 | 细节 | 开发 | 联调 | 自测 |
| --- | --- | --- | --- | --- |
| 部门树管理页 | 自建树组件 + 详情面板 + 新增/编辑/合并弹窗 | 3 | 0.5 | 0.5 |
| 职位列表页 | 列表 + 筛选 + 新增/编辑弹窗 | 1.5 | 0.5 | 0.5 |
| 序列职级对照 | 抽屉展示 | 0.5 | 0 | 0 |

\[20260710~~20260711\] 系分编写
\[20260711~~20260712\] 系分评审
\[20260713~~20260715\] 实现部门树管理页
\[20260715~~20260717\] 实现职位列表页 + 序列对照
\[20260718\] 修复部门搜索（自下而上过滤）& 编辑部门上级字段禁用
\[20260719~~20260720\] 联调 + 测试

# 3. 监控和埋点

- 部门新增/编辑/删除/合并操作埋点
- 职位新增/编辑/删除操作埋点

# 4. 发布计划

- 预发验证：部门树展开/折叠、新增5级部门边界、搜索过滤准确性、合并统计展示、职位职级级联
- 灰度发布：先开放给HR角色
- 回滚方案：回滚前端版本，后端兼容

# 5. 其他

## 5.1 风险评估

- 部门树数据量较大时（500+节点），自建 TreeNode 组件递归渲染性能需关注——当前未使用虚拟滚动
- 部门合并涉及员工批量转移，转移统计数据来自接口返回，前端仅展示
- 部门编码创建后不可修改（创建时需谨慎）
- 编辑部门时 `parentId` 已禁用，如需调整上级部门需走合并流程——此为产品设计约束
- 部门搜索过滤器已修复为自下而上模式，确保子节点匹配时父节点保留

## 5.2 变更记录

| **日期** | **版本** | **修订说明** | **作者** |
| --- | --- | --- | --- |
| 2026-07-10 | 1.0 | 初稿 | - |
| 2026-07-12 | 1.1 | 同步后端API：路径、请求方式、响应字段 | - |
| 2026-07-16 | 1.2 | 统一权限系统：org:view / org:manage | - |
| 2026-07-18 | 1.3 | 修复 filterTree 自下而上搜索；编辑部门上级字段禁用+合并部门提示；新增合并部门弹窗完整实现 | - |
| 2026-07-20 | 1.4 | 补充自建 TreeNode 组件文档、选中节点同步逻辑、DepartmentDetail 两卡片布局 | - |
