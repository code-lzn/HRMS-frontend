import {
  getLoginUserUsingGet,
  userLogoutUsingPost,
} from '@/api/userController';
import HRMSAssistant from '@/components/HRMSAssistant';
import { clearCachedLoginUser, setCachedLoginUser } from '@/libs/loginCache';
import { queryClient } from '@/libs/queryClient';
import { LogoutOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { useModel, useNavigate } from '@umijs/max';
import { Dropdown, message } from 'antd';
import { createElement } from 'react';

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
  const initialState: {
    name: string;
    currentUser: API.LoginUserVO | undefined;
  } = {
    name: '人资管理系统',
    currentUser: undefined,
  };

  const currentPath = window.location.pathname;
  const publicPaths = ['/user/login', '/user/register', '/user/reset-password'];

  // 1. 优先从 sessionStorage 恢复
  try {
    const cached = sessionStorage.getItem('hrms_login_user');
    if (cached) {
      initialState.currentUser = JSON.parse(cached);
      setCachedLoginUser(initialState.currentUser);
    }
  } catch {}

  // 2. sessionStorage 为空，尝试调后端（带超时）
  if (!initialState.currentUser) {
    try {
      const res: any = await Promise.race([
        getLoginUserUsingGet(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 3000);
        }),
      ]);
      if (res?.data) {
        initialState.currentUser = res.data as API.LoginUserVO;
        setCachedLoginUser(initialState.currentUser);
      }
    } catch {}
  }

  // 3. 未登录且非公开页 → 跳转登录
  if (!publicPaths.includes(currentPath) && !initialState.currentUser) {
    window.location.href = `/user/login?redirect=${encodeURIComponent(
      currentPath,
    )}`;
  }

  return initialState;
}

const RightContent: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const navigate = useNavigate();
  const currentUser = initialState?.currentUser;

  const menuItems = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        try {
          await userLogoutUsingPost();
        } catch {
          // 即使后端调用失败，也要清空本地状态
        }
        // 清空本地缓存和 React Query 缓存
        clearCachedLoginUser();
        queryClient.clear();
        message.success('退出成功');
        window.location.href = '/user/login';
      },
    },
  ];

  if (!currentUser) return null;

  return (
    <Dropdown menu={{ items: menuItems }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '0 8px',
        }}
      >
        <span style={{ fontSize: 14 }}>{currentUser.userName}</span>
      </div>
    </Dropdown>
  );
};

export const layout = () => {
  return {
    title: '人资管理系统',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    rightContentRender: () => <RightContent />,
  };
};

export function rootContainer(container: any) {
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    container,
    createElement(HRMSAssistant),
  );
}
