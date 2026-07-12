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
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
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
      name: '审批中心',
      path: '/approval',
      routes: [
        { path: '/approval', redirect: '/approval/workbench' },
        { name: '审批工作台', path: '/approval/workbench', component: './ApprovalCenter/Workbench' },
        { name: '审批详情', path: '/approval/detail/:recordId', component: './ApprovalCenter/Detail', hideInMenu: true },
        { name: '委托审批', path: '/approval/delegation', component: './ApprovalCenter/Delegation' },
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
});
