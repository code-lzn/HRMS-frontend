import { userLogoutUsingPost } from '@/api/userController';
import { queryClient } from '@/libs/queryClient';
import {
  LogoutOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { useModel, useNavigate } from '@umijs/max';
import { Dropdown, message } from 'antd';
import { createElement } from 'react';
import HRMSAssistant from '@/components/HRMSAssistant';

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
  const initialState = {
    name: '人资管理系统',
    currentUser: undefined as API.LoginUserVO | undefined,
  };

  const currentPath = window.location.pathname;
  const publicPaths = ['/user/login'];
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
          message.success('退出成功');
          window.location.href = '/user/login';
        } catch {
          message.error('退出失败');
        }
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
