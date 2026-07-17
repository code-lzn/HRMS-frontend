import { getCurrentPermissionsUsingGet } from '@/api/permissionController';
import { getLoginUserUsingGet, userLogoutUsingPost } from '@/api/userController';
import RightContent from '@/components/RightContent';
import React from 'react';

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

    // 1. 用户基本信息
    if (userRes.status === 'fulfilled' && userRes.value?.data) {
      const userData = userRes.value.data;
      initialState.currentUser = userData;
      initialState.name = userData.userName || '用户';
      initialState.avatar = userData.userAvatar || '';
    }

    // 2. 权限 API 数据暂存
    const permOk = permRes.status === 'fulfilled' && permRes.value?.data;
    if (permOk) {
      const pd = permRes.value.data;
      initialState.permissionCodes = pd.permissionCodes ?? [];
      initialState.dataScope = pd.dataScope ?? 5;
      initialState.dataScopeDesc = pd.dataScopeDesc ?? '';
      initialState.roleCode = pd.roleCode ?? '';
    }

    // 3. 统一规范化：确保 currentUser 与 initialState 顶层完全一致
    if (initialState.currentUser) {
      const cu = initialState.currentUser;
      const pd: any = permOk ? permRes.value.data : null;

      // 3a. 决定 roleId（唯一权威：roleName > 权限API > userAPI > 兜底5）
      const resolvedRoleId: number =
        (pd?.roleId != null ? Number(pd.roleId) : 0) ||
        Number(cu.roleId) ||
        ROLE_NAME_TO_ID[cu.roleName] ||
        5;

      // 3b. roleCode 由 roleId 推导
      const resolvedRoleCode: string =
        pd?.roleCode || cu.roleCode || ROLE_ID_TO_CODE[resolvedRoleId] || 'employee';

      // 3c. 权限码：API + user + 角色默认 三者取并集，防止后端返回不完整导致丢权限
      const defaultCodes: string[] = ROLE_DEFAULT_PERMISSIONS[resolvedRoleId] ?? [];
      const apiCodes: string[] = (pd && Array.isArray(pd.permissionCodes)) ? pd.permissionCodes : [];
      const userCodes: string[] = (cu.permissionCodes && Array.isArray(cu.permissionCodes)) ? cu.permissionCodes : [];
      const mergedCodes: string[] = [...new Set([...apiCodes, ...userCodes, ...defaultCodes])];
      const resolvedCodes: string[] = mergedCodes;

      // 3d. 写入 currentUser
      cu.roleId = resolvedRoleId;
      cu.dataScope = resolvedRoleId;    // 强制与 roleId 一致（解决 dataScope 为 1 时跳过条件判断的bug）
      cu.roleCode = resolvedRoleCode;
      cu.permissionCodes = resolvedCodes;

      // 4. 强制回写 initialState 顶层（无条件，确保与 currentUser 100% 一致）
      initialState.dataScope = resolvedRoleId;
      initialState.roleCode = resolvedRoleCode;
      initialState.permissionCodes = resolvedCodes;
      if (!initialState.dataScopeDesc) {
        initialState.dataScopeDesc = pd?.dataScopeDesc || cu.dataScopeDesc || '';
      }
    }
    // currentUser 不存在 → 未登录，保持默认值
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
