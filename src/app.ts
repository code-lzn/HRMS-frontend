import { getLoginUserUsingGet, userLogoutUsingPost } from '@/api/userController';
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
    rightRender: (initialState: any, _setInitialState: any, _runtimeConfig: any) => {
      const currentUser = initialState?.currentUser;
      if (!currentUser) {
        return React.createElement(
          'a',
          { href: '/user/login', style: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none', lineHeight: '56px' } },
          '未登录',
        );
      }
      return React.createElement('span', {
        style: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: '56px', cursor: 'pointer' },
        onClick: async () => {
          await userLogoutUsingPost();
          window.location.href = '/user/login';
        },
      }, currentUser.userName || '用户');
    },
    logout: async () => {
      await userLogoutUsingPost();
      window.location.href = '/user/login';
    },
  };
};
