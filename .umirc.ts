import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: { title: '@umijs/max' },
  routes: [
    { path: '/', redirect: '/home' },
    { name: '首页', path: '/home', component: './Home' },
    { name: '权限演示', path: '/access', component: './Access' },
    { name: ' CRUD 示例', path: '/table', component: './Table' },
    // ========== 审批中心 ==========
    {
      name: '审批中心', path: '/approval',
      routes: [
        { path: '/approval', redirect: '/approval/pending' },
        { name: '待办审批', path: '/approval/pending', component: './Approval/Pending' },
        { name: '已办审批', path: '/approval/processed', component: './Approval/Processed' },
        { name: '审批详情', path: '/approval/detail/:instanceId', component: './Approval/Detail', hideInMenu: true },
        { name: '委托审批管理', path: '/approval/delegate', component: './Approval/Delegate' },
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
    // ========== 入职管理 ==========
    {
      name: '入职管理',
      path: '/onboarding',
      component: './onboarding',
      access: 'canSeeEmployees',
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
      name: '用户注册',
      path: '/user/register',
      component: '../app/user/register/page',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  utoopack: {},
});
