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
    {
      path: '/',
      redirect: '/employees',
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
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api/chat': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
  utoopack: {},
});
