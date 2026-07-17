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
      redirect: '/employees',
    },
    // ========== 员工档案 ==========
    {
      name: '员工档案',
      path: '/employees',
      component: './employees/list',
    },
    {
      name: '员工详情',
      path: '/employees/:id',
      component: './employees/detail',
      hideInMenu: true,
    },
    {
      name: '员工编辑',
      path: '/employees/:id/edit',
      component: './employees/edit',
      hideInMenu: true,
    },
    // ========== 组织架构 ==========
    {
      name: '组织架构',
      path: '/organization',
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
    // ========== 原有页面 ==========
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
      name: '用户登录',
      path: '/user/login',
      component: '../app/user/login/page',
    },
    {
      name: '用户注册',
      path: '/user/register',
      component: '../app/user/register/page',
    },
  ],
  npmClient: 'pnpm',
  utoopack: {},
});
