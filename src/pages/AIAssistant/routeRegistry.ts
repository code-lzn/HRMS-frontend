/**
 * 前端路由注册表 — 用于 AI 智能助理的路径匹配与校验
 *
 * 每个条目包含：
 *  - path:     前端实际路由
 *  - name:     菜单显示名称
 *  - keywords: 用户可能使用的搜索词（用于本地兜底匹配）
 *  - desc:     简短功能说明
 */

export interface RouteEntry {
  path: string;
  name: string;
  keywords: string[];
  desc: string;
}

export const ROUTE_REGISTRY: RouteEntry[] = [
  {
    path: '/home',
    name: '首页',
    keywords: ['首页', '主页', '工作台', 'dashboard', '首页面板'],
    desc: '系统首页工作面板',
  },
  // ---- 审批中心 ----
  {
    path: '/approval/workbench',
    name: '审批工作台',
    keywords: ['审批', '审批工作台', '待审批', '我的审批', '审批列表', '审批中心'],
    desc: '查看和处理待审批事项',
  },
  {
    path: '/approval/delegation',
    name: '委托审批',
    keywords: ['委托审批', '审批委托', '授权审批'],
    desc: '设置审批委托授权',
  },
  // ---- 考勤管理 ----
  {
    path: '/attendance/clock',
    name: '打卡中心',
    keywords: ['打卡', '签到', '打卡中心', '考勤打卡', '签入', '签出'],
    desc: '员工每日打卡签到签退',
  },
  {
    path: '/attendance/rules',
    name: '考勤规则',
    keywords: ['考勤规则', '打卡规则', '考勤制度', '考勤组', '排班'],
    desc: '配置考勤规则与考勤组',
  },
  {
    path: '/attendance/leave',
    name: '请假管理',
    keywords: ['请假', '年假', '事假', '病假', '调休', '请假申请', '请假管理', '申请请假', '假期', '休假'],
    desc: '员工请假申请与审批',
  },
  {
    path: '/attendance/statistics',
    name: '考勤统计',
    keywords: ['考勤统计', '出勤统计', '考勤报表', '出勤率'],
    desc: '考勤数据统计与分析',
  },
  // ---- 人事异动 ----
  {
    path: '/my-changes',
    name: '我的人事异动',
    keywords: ['异动', '人事异动', '我的异动', '变动记录'],
    desc: '查看个人人事异动记录',
  },
  // ---- HR中控台 ----
  {
    path: '/hr/onboarding',
    name: '入职管理',
    keywords: ['入职', '入职管理', '新员工入职', '入职流程', '新人入职', 'onboarding'],
    desc: '管理新员工入职流程',
  },
  {
    path: '/hr/probation',
    name: '转正管理',
    keywords: ['转正', '试用期', '转正管理', '转正申请', '试用期转正'],
    desc: '员工试用期转正管理',
  },
  {
    path: '/hr/transfer',
    name: '调岗管理',
    keywords: ['调岗', '岗位调动', '调岗管理', '转岗', '岗位调整'],
    desc: '员工岗位调动管理',
  },
  {
    path: '/hr/resignation',
    name: '离职管理',
    keywords: ['离职', '辞职', '离职管理', '离职流程', '离职申请', '办理离职'],
    desc: '员工离职流程管理',
  },
  // ---- 个人中心 ----
  {
    path: '/personal/profile',
    name: '我的档案',
    keywords: ['我的档案', '个人信息', '个人资料', '档案', '我的信息'],
    desc: '查看和编辑个人信息',
  },
  {
    path: '/personal/attendance',
    name: '我的考勤',
    keywords: ['我的考勤', '个人考勤', '考勤记录', '我的打卡记录'],
    desc: '查看个人考勤记录',
  },
  {
    path: '/personal/leave',
    name: '我的请假',
    keywords: ['我的请假', '请假记录', '我的假期', '剩余年假'],
    desc: '查看个人请假记录与余额',
  },
  {
    path: '/personal/salary',
    name: '我的薪资',
    keywords: ['我的薪资', '工资', '我的工资', '工资条', '薪资', '薪酬', '收入'],
    desc: '查看个人工资条',
  },
  {
    path: '/personal/security',
    name: '账号安全',
    keywords: ['账号安全', '修改密码', '安全设置', '手机号', '绑定'],
    desc: '账号安全设置',
  },
  // ---- 组织架构 ----
  {
    path: '/organization/department',
    name: '部门管理',
    keywords: ['部门', '部门管理', '组织架构', '部门列表', '公司部门'],
    desc: '管理部门组织架构',
  },
  {
    path: '/organization/position',
    name: '职位管理',
    keywords: ['职位', '岗位', '职位管理', '岗位管理', '职级'],
    desc: '管理职位与岗位体系',
  },
  // ---- 员工管理 ----
  {
    path: '/employee/list',
    name: '员工列表',
    keywords: [
      '员工', '员工列表', '员工管理', '员工花名册', '花名册',
      '人员', '职工', '同事', '所有员工', '查看员工', '员工信息',
      '在职员工', '员工查询', '员工搜索', '人员管理',
    ],
    desc: '查看和管理所有员工信息',
  },
  {
    path: '/employee/add',
    name: '新增员工',
    keywords: ['新增员工', '添加员工', '录入员工', '新员工', '入职录入'],
    desc: '录入新员工档案',
  },
  // ---- 系统管理 ----
  {
    path: '/admin/dashboard',
    name: '系统工作台',
    keywords: ['管理员', '系统管理', '后台管理', '管理后台'],
    desc: '系统管理后台工作台',
  },
  {
    path: '/admin/users',
    name: '用户管理',
    keywords: ['用户管理', '账号管理', '系统用户', '用户列表'],
    desc: '管理系统用户账号',
  },
  {
    path: '/admin/roles',
    name: '角色权限',
    keywords: ['角色', '权限', '角色管理', '权限管理', '角色权限'],
    desc: '管理角色与权限分配',
  },
  {
    path: '/admin/config',
    name: '系统配置',
    keywords: ['系统配置', '参数设置', '系统设置', '配置'],
    desc: '系统参数配置',
  },
  {
    path: '/admin/logs',
    name: '操作日志',
    keywords: ['日志', '操作日志', '审计日志', '操作记录'],
    desc: '查看系统操作日志',
  },
  // ---- 薪资管理 ----
  {
    path: '/salary-manage/account',
    name: '账套管理',
    keywords: ['账套', '薪资账套', '账套管理', '薪酬账套'],
    desc: '管理薪资核算账套',
  },
  {
    path: '/salary-manage/employee',
    name: '薪资档案',
    keywords: ['薪资档案', '员工薪资', '薪酬档案', '薪资信息'],
    desc: '管理员工薪资档案',
  },
  {
    path: '/salary-manage/batch',
    name: '月度核算',
    keywords: ['月度核算', '薪资核算', '算薪', '薪酬核算', '工资核算'],
    desc: '月度薪资批量核算',
  },
  {
    path: '/salary-manage/slip',
    name: '工资条管理',
    keywords: ['工资条', '工资单', '薪资条', '发薪', '工资发放'],
    desc: '管理与发放工资条',
  },
];

/** 所有有效路径的 Set，用于 O(1) 校验 */
export const VALID_PATHS = new Set(ROUTE_REGISTRY.map((r) => r.path));

/**
 * 根据关键词匹配最佳路由
 * 返回匹配度最高的路由条目，没有匹配返回 null
 */
export function matchRouteByKeywords(text: string): RouteEntry | null {
  let best: RouteEntry | null = null;
  let bestScore = 0;

  const lower = text.toLowerCase();

  for (const entry of ROUTE_REGISTRY) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        // 加分策略：长关键词权重更高
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          best = entry;
        }
      }
    }
  }

  return best;
}

/**
 * 查找路径对应的路由条目
 */
export function findRouteByPath(path: string): RouteEntry | undefined {
  return ROUTE_REGISTRY.find((r) => r.path === path);
}
