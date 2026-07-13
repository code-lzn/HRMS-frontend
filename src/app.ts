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
  };
  try {
    const res = await getLoginUserUsingGet();
    if (res.data) {
      initialState.currentUser = res.data;
      initialState.name = res.data.userName || '用户';
      initialState.avatar = res.data.userAvatar || '';
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
