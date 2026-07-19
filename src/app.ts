import { getCurrentPermissionsUsingGet } from '@/api/permissionController';
import { getLoginUserUsingGet, userLogoutUsingPost } from '@/api/userController';
import RightContent from '@/components/RightContent';
import React from 'react';
import '@/global.css';

const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('findDOMNode') || args[0].includes('destroyOnClose'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

export async function getInitialState() {
  const initialState: any = {
    name: '未登录',
    currentUser: undefined,
    permissionCodes: [],
    dataScope: 5,
    dataScopeDesc: '',
    roleCode: '',
  };

  const ROLE_NAME_TO_ID: Record<string, number> = {
    '系统管理员': 1, 'HR专员': 2, '部门主管': 3, '财务专员': 4, '普通员工': 5,
  };
  const ROLE_ID_TO_CODE: Record<number, string> = {
    1: 'admin', 2: 'hr', 3: 'dept_head', 4: 'finance', 5: 'employee',
  };
  const ROLE_DEFAULT_PERMISSIONS: Record<number, string[]> = {
    1: ['employee:list','employee:add','employee:edit','employee:delete','employee:detail',
        'attendance:list','attendance:manage','approval:process',
        'org:manage','role:manage','system:config','system:backup'],
    2: ['employee:list','employee:add','employee:edit','employee:delete','employee:detail',
        'salary:list','salary:view','salary:audit',
        'attendance:list','attendance:manage','approval:process','org:manage'],
    3: ['employee:list','employee:detail','attendance:list','attendance:manage','approval:process'],
    4: ['salary:list','salary:view','salary:audit'],
    5: [],
  };

  try {
    const [userRes, permRes] = await Promise.allSettled([
      getLoginUserUsingGet(),
      getCurrentPermissionsUsingGet(),
    ]);

    if (userRes.status === 'fulfilled' && userRes.value?.data) {
      const userData = userRes.value.data;
      initialState.currentUser = userData;
      initialState.name = userData.userName || '用户';
      initialState.avatar = userData.userAvatar || '';
    }

    const permOk = permRes.status === 'fulfilled' && permRes.value?.data;
    if (permOk) {
      const pd = permRes.value.data;
      initialState.permissionCodes = pd.permissionCodes ?? [];
      initialState.dataScope = pd.dataScope ?? 5;
      initialState.dataScopeDesc = pd.dataScopeDesc ?? '';
      initialState.roleCode = pd.roleCode ?? '';
    }

    if (initialState.currentUser) {
      const cu = initialState.currentUser;
      const pd: any = permOk ? permRes.value.data : null;

      const resolvedRoleId: number =
        (pd?.roleId != null ? Number(pd.roleId) : 0) ||
        Number(cu.roleId) ||
        ROLE_NAME_TO_ID[cu.roleName] ||
        5;

      const resolvedRoleCode: string =
        pd?.roleCode || cu.roleCode || ROLE_ID_TO_CODE[resolvedRoleId] || 'employee';

      const defaultCodes: string[] = ROLE_DEFAULT_PERMISSIONS[resolvedRoleId] ?? [];
      const apiCodes: string[] = (pd && Array.isArray(pd.permissionCodes)) ? pd.permissionCodes : [];
      const userCodes: string[] = (cu.permissionCodes && Array.isArray(cu.permissionCodes)) ? cu.permissionCodes : [];
      const mergedCodes: string[] = [...new Set([...apiCodes, ...userCodes, ...defaultCodes])];
      const resolvedCodes: string[] = mergedCodes;

      cu.roleId = resolvedRoleId;
      cu.dataScope = resolvedRoleId;
      cu.roleCode = resolvedRoleCode;
      cu.permissionCodes = resolvedCodes;

      initialState.dataScope = resolvedRoleId;
      initialState.roleCode = resolvedRoleCode;
      initialState.permissionCodes = resolvedCodes;
      if (!initialState.dataScopeDesc) {
        initialState.dataScopeDesc = pd?.dataScopeDesc || cu.dataScopeDesc || '';
      }
    }
  } catch (error) {
    // 未登录，保持默认
  }
  return initialState;
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    headerRender: false,
    menuHeaderRender: false,
    headerHeight: 56,
    rightRender: (initialState: any, setInitialState: any, runtimeConfig: any) => {
      return React.createElement(RightContent, {
        initialState,
        setInitialState,
        runtimeConfig,
      });
    },
    logout: async () => {
      try {
        await userLogoutUsingPost();
      } catch {
        // 即使登出API失败也强制跳转登录页
      }
      window.location.href = '/user/login';
    },
  };
};
