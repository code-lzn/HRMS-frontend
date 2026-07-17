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
    { name: '用户登录', path: '/user/login', component: '../app/user/login/page' },
    { name: '用户注册', path: '/user/register', component: '../app/user/register/page' },
  ],
  npmClient: 'pnpm',
  utoopack: {},
});
