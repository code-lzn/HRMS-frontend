import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'HRMS',
  },
  routes: [
    { path: '/', redirect: '/employees' },
    { name: '首页', path: '/home', component: './Home' },
    { name: '权限演示', path: '/access', component: './Access' },
    { name: ' CRUD 示例', path: '/table', component: './Table' },
    // ========== 审批中心 ==========
    {
      name: '审批中心',
      path: '/approval',
      routes: [
        { path: '/approval', redirect: '/approval/pending' },
        {
          name: '待办审批',
          path: '/approval/pending',
          component: './Approval/Pending',
        },
        {
          name: '已办审批',
          path: '/approval/processed',
          component: './Approval/Processed',
        },
        {
          name: '审批详情',
          path: '/approval/detail/:instanceId',
          component: './Approval/Detail',
          hideInMenu: true,
        },
        {
          name: '委托审批管理',
          path: '/approval/delegate',
          component: './Approval/Delegate',
        },
      ],
    },
    // ========== 员工档案 ==========
    {
      name: '员工档案',
      path: '/employees',
      component: './employees/list',
      access: 'canSeeEmployees',
    },
    {
      name: '员工详情',
      path: '/employees/:id',
      component: './employees/detail',
      hideInMenu: true,
      access: 'canSeeEmployees',
    },
    {
      name: '员工编辑',
      path: '/employees/:id/edit',
      component: './employees/edit',
      hideInMenu: true,
      access: 'canSeeEmployees',
    },
    // ========== 组织架构 ==========
    {
      name: '组织架构',
      path: '/organization',
      access: 'canSeeEmployees',
      routes: [
        {
          name: '部门管理',
          path: '/organization/departments',
          component: './organization/departments',
        },
        {
          name: '职位管理',
          path: '/organization/positions',
          component: './organization/positions',
        },
      ],
    },
    // ========== 薪资管理 ==========
    {
      name: '薪资管理',
      path: '/salary',
      access: 'canViewSalary',
      routes: [
        {
          name: '薪资账套',
          path: '/salary/accounts',
          component: './salary/accounts',
        },
        {
          name: '账套详情',
          path: '/salary/accounts/:id',
          component: './salary/accounts/detail',
          hideInMenu: true,
        },
        {
          name: '员工薪资',
          path: '/salary/employees',
          component: './salary/employees',
        },
        {
          name: '员工薪资详情',
          path: '/salary/employees/:employeeId',
          component: './salary/employees/detail',
          hideInMenu: true,
        },
        {
          name: '编辑薪资档案',
          path: '/salary/employees/:employeeId/edit',
          component: './salary/employees/edit',
          hideInMenu: true,
        },
        {
          name: '薪资核算',
          path: '/salary/batches',
          component: './salary/batches',
        },
        {
          name: '核算详情',
          path: '/salary/batches/:batchId',
          component: './salary/batches/detail',
          hideInMenu: true,
        },
        {
          name: '薪资统计',
          path: '/salary/statistics',
          component: './salary/statistics',
        },
      ],
    },
    // ========== 工资条（所有员工可见） ==========
    {
      name: '我的工资条',
      path: '/salary/payslips',
      component: './salary/payslips',
      access: 'canViewPayslip',
    },
    {
      name: '工资条详情',
      path: '/salary/payslips/:id',
      component: './salary/payslips/detail',
      hideInMenu: true,
      access: 'canViewPayslip',
    },
    // ========== 入转调离管理 ==========
    {
      name: '入转调离管理',
      path: '/hr-change',
      access: 'canSeeEmployees',
      routes: [
        { path: '/hr-change', redirect: '/hr-change/onboarding' },
        {
          name: '入职管理',
          path: '/hr-change/onboarding',
          component: './onboarding',
        },
        {
          name: '入职详情',
          path: '/hr-change/onboarding/:id',
          component: './onboarding/detail',
          hideInMenu: true,
        },
        {
          name: '转正管理',
          path: '/hr-change/probation',
          component: './probation',
        },
        {
          name: '转正详情',
          path: '/hr-change/probation/:id',
          component: './probation/detail',
          hideInMenu: true,
        },
        {
          name: '调岗管理',
          path: '/hr-change/transfer',
          component: './transfer',
        },
        {
          name: '调岗详情',
          path: '/hr-change/transfer/:id',
          component: './transfer/detail',
          hideInMenu: true,
        },
        {
          name: '离职管理',
          path: '/hr-change/resignation',
          component: './resignation',
        },
        {
          name: '离职详情',
          path: '/hr-change/resignation/:id',
          component: './resignation/detail',
          hideInMenu: true,
        },
      ],
    },
    // ========== 考勤管理 ==========
    {
      name: '考勤管理',
      path: '/attendance',
      access: 'canSeeEmployees',
      routes: [
        { path: '/attendance', redirect: '/attendance/clock' },
        {
          name: '考勤打卡',
          path: '/attendance/clock',
          component: './attendance/clock',
        },
        {
          name: '考勤组',
          path: '/attendance/groups',
          component: './attendance/groups',
        },
        {
          name: '考勤统计',
          path: '/attendance/statistics',
          component: './attendance/statistics',
        },
        {
          name: '请假管理',
          path: '/attendance/leave',
          component: './attendance/leave',
        },
        {
          name: '加班管理',
          path: '/attendance/overtime',
          component: './attendance/overtime',
        },
        {
          name: '工作日设置',
          path: '/attendance/workday-settings',
          component: './attendance/workday-settings',
        },
      ],
    },
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
        { name: '修改密码', path: '/profile/security/password', component: './Profile/Security/Password', hideInMenu: true },
        { name: '修改手机号', path: '/profile/security/phone', component: './Profile/Security/Phone', hideInMenu: true },
      ],
    },
    // ========== 原有页面 ==========
    {
      name: '首页',
      path: '/home',
      component: './Home',
      access: 'canSeeEmployees',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
      access: 'canSeeEmployees',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
      access: 'canSeeEmployees',
    },
    {
      name: '用户登录',
      path: '/user/login',
      component: '../app/user/login/page',
      layout: false,
    },
    {
      name: '重置密码',
      path: '/user/reset-password',
      component: '../app/user/reset-password/page',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api/chat': {
      target: 'http://10.9.110.197:8000',
      changeOrigin: true,
    },
  },
  utoopack: {},
});
