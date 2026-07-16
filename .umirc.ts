import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    // {
    //   name: '权限演示',
    //   path: '/access',
    //   component: './Access',
    // },
    {
      name: '审批中心',
      path: '/approval',
      access: 'canSeeApprovalMenu',
      routes: [
        { path: '/approval', redirect: '/approval/workbench' },
        { name: '审批工作台', path: '/approval/workbench', component: './ApprovalCenter/Workbench' },
        { name: '审批详情', path: '/approval/detail/:recordId', component: './ApprovalCenter/Detail', hideInMenu: true },
        { name: '委托审批', path: '/approval/delegation', component: './ApprovalCenter/Delegation' },
      ],
    },
    {
      name: '我的人事异动',
      path: '/my-changes',
      component: './MyChanges',
    },
    {
      name: 'HR中控台',
      path: '/hr',
      access: 'canSeeHRConsole',
      routes: [
        { path: '/hr', redirect: '/hr/onboarding' },
        { name: '入职办理', path: '/hr/onboarding', component: './HR/Onboarding' },
        { name: '转正管理', path: '/hr/probation', component: './HR/Probation' },
        { name: '调岗管理', path: '/hr/transfer', component: './HR/Transfer' },
        { name: '离职管理', path: '/hr/resignation', component: './HR/Resignation' },
      ],
    },
    {
      name: '个人中心',
      path: '/personal',
      routes: [
        { path: '/personal', redirect: '/personal/profile' },
        { name: '我的档案', path: '/personal/profile', component: './PersonalCenter/Profile' },
        { name: '我的考勤', path: '/personal/attendance', component: './PersonalCenter/Attendance' },
        { name: '我的请假', path: '/personal/leave', component: './PersonalCenter/Leave' },
        { name: '我的薪资', path: '/personal/salary', component: './PersonalCenter/Salary' },
        { name: '账号安全', path: '/personal/security', component: './PersonalCenter/Security' },
      ],
    },
    {
      name: '组织架构',
      path: '/organization',
      access: 'canSeeOrgMenu',
      routes: [
        { path: '/organization', redirect: '/organization/department' },
        { name: '部门管理', path: '/organization/department', component: './Organization/Department' },
        { name: '职位管理', path: '/organization/position', component: './Organization/Position' },
      ],
    },
    {
      name: '员工管理',
      path: '/employee',
      access: 'canSeeEmployeeMenu',
      routes: [
        { path: '/employee', redirect: '/employee/list' },
        { name: '员工列表', path: '/employee/list', component: './Employee/List' },
        { name: '员工详情', path: '/employee/detail/:id', component: './Employee/Detail', hideInMenu: true },
        { name: '新增员工', path: '/employee/add', component: './Employee/Add', hideInMenu: true },
        { name: '编辑员工', path: '/employee/edit/:id', component: './Employee/Edit', hideInMenu: true },
      ],
    },
    {
      name: '中台管理系统',
      path: '/admin',
      access: 'canAdmin',
      routes: [
        { path: '/admin', redirect: '/admin/dashboard' },
        { name: '仪表盘', path: '/admin/dashboard', component: './Dashboard' },
        { name: '用户管理', path: '/admin/users', component: './Admin/UserManage' },
        { name: '角色权限', path: '/admin/roles', component: './Admin/RolePermission' },
        { name: '系统配置', path: '/admin/config', component: './Admin/SystemConfig' },
        { name: '操作日志', path: '/admin/logs', component: './Admin/OperationLog' },
      ],
    },
    {
      name: '薪资管理',
      path: '/salary-manage',
      access: 'canSeeSalaryMenu',
      routes: [
        { path: '/salary-manage', redirect: '/salary-manage/account' },
        { name: '账套管理', path: '/salary-manage/account', component: './SalaryManage/Account' },
        { name: '薪资档案', path: '/salary-manage/employee', component: './SalaryManage/Employee' },
        { name: '月度核算', path: '/salary-manage/batch', component: './SalaryManage/Batch' },
      ],
    },
    {
      name: '用户登录',
      path: '/user/login',
      component: '../app/user/login/page',
      layout: false,
    },
    {
      name: '用户注册',
      path: '/user/register',
      component: '../app/user/register/page',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  utoopack: {},
  // proxy: {
  //   '/api': {
  //     target: 'http://localhost:8123',
  //     changeOrigin: true,
  //   },
  // },
});
