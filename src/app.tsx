import {
  getLoginUserUsingGet,
  userLogoutUsingPost,
} from '@/api/userController';
import HRMSAssistant from '@/components/HRMSAssistant';
import { clearCachedLoginUser, setCachedLoginUser } from '@/libs/loginCache';
import { queryClient } from '@/libs/queryClient';
import {
  CaretDownOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { useModel, useNavigate } from '@umijs/max';
import { Avatar, Dropdown, message } from 'antd';
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

  // 1. 尝试调后端恢复登录态
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

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: '系统管理员', color: '#ff7875' },
  hr: { label: 'HR专员', color: '#69b1ff' },
  dept_head: { label: '部门主管', color: '#95de64' },
  finance: { label: '财务专员', color: '#ffd666' },
  user: { label: '普通员工', color: '#262626' },
};

const RightContent: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const navigate = useNavigate();
  const currentUser = initialState?.currentUser;

  if (!currentUser) return null;

  const roleInfo = ROLE_LABELS[currentUser.userRole || ''];

  const menuItems = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#262626' }}>
            {currentUser.userName}
          </div>
          <div style={{ fontSize: 12, color: roleInfo?.color || '#8c8c8c', marginTop: 2 }}>
            {roleInfo?.label || currentUser.userRole}
          </div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: async () => {
        try {
          await userLogoutUsingPost();
        } catch {
          // 即使后端调用失败，也要清空本地状态
        }
        clearCachedLoginUser();
        queryClient.clear();
        message.success('退出成功');
        window.location.href = '/user/login';
      },
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          padding: '4px 12px 4px 4px',
          borderRadius: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <Avatar
          size={36}
          src={currentUser.userAvatar}
          icon={!currentUser.userAvatar && <UserOutlined />}
          style={{
            backgroundColor: currentUser.userAvatar
              ? undefined
              : roleInfo?.color || '#1677ff',
            flexShrink: 0,
          }}
        >
          {!currentUser.userAvatar && (currentUser.userName?.charAt(0) || 'U')}
        </Avatar>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.3,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentUser.userName}
          </span>
          <span style={{ fontSize: 12, color: roleInfo?.color || '#d9d9d9' }}>
            {roleInfo?.label || currentUser.userRole}
          </span>
        </div>
        <CaretDownOutlined
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}
        />
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
