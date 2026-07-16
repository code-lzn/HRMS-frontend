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
  try {
    // 并行请求用户信息和权限信息
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

    if (permRes.status === 'fulfilled' && permRes.value?.data) {
      const permData = permRes.value.data;
      initialState.permissionCodes = permData.permissionCodes ?? [];
      initialState.dataScope = permData.dataScope ?? 5;
      initialState.dataScopeDesc = permData.dataScopeDesc ?? '';
      initialState.roleCode = permData.roleCode ?? '';
      // 合并权限码到 currentUser，兼容通过 user 对象调用 hasPermission 的代码
      if (initialState.currentUser) {
        initialState.currentUser.permissionCodes = permData.permissionCodes ?? [];
        initialState.currentUser.dataScope = permData.dataScope ?? 5;
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
    rightRender: (initialState: any, setInitialState: any, runtimeConfig: any) => {
      return React.createElement(RightContent, {
        initialState,
        setInitialState,
        runtimeConfig,
      });
    },
    logout: async () => {
      await userLogoutUsingPost();
      window.location.href = '/user/login';
    },
  };
};
