import { userLogoutUsingPost } from '@/api/userController';
import {
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useModel } from '@umijs/max';
import { Avatar, Button, Dropdown, Space, Spin, Tag } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';

interface RightContentProps {
  initialState: any;
  setInitialState: any;
  runtimeConfig: any;
}

/** dataScope → 角色颜色映射 */
const ROLE_COLOR_MAP: Record<number, string> = {
  1: 'red',
  2: 'blue',
  3: 'green',
  4: 'orange',
  5: 'default',
};

const RightContent: React.FC<RightContentProps> = ({
  initialState,
  setInitialState,
  runtimeConfig,
}) => {
  // 正在加载初始状态
  if (!initialState) {
    return <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />;
  }

  const currentUser = initialState?.currentUser;
  const dataScope = initialState?.dataScope ?? 5;
  const dataScopeDesc = initialState?.dataScopeDesc ?? '';

  // 未登录
  if (!currentUser) {
    return (
      <Link to="/user/login">
        <Button type="primary" size="small" icon={<UserOutlined />}>
          登录
        </Button>
      </Link>
    );
  }

  // 已登录 - 角色标签 + 头像 + 下拉菜单
  const menuItems: MenuProps['items'] = [
    {
      key: 'role',
      icon: <SafetyCertificateOutlined />,
      label: (
        <span>
          当前角色：
          <Tag color={ROLE_COLOR_MAP[dataScope] ?? 'default'} style={{ marginLeft: 4 }}>
            {dataScopeDesc || currentUser.roleName || '普通用户'}
          </Tag>
        </span>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        try {
          await userLogoutUsingPost();
        } catch {
          // 即使登出API失败也强制跳转登录页
        }
        window.location.href = '/user/login';
      },
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }}>
      <Space style={{ cursor: 'pointer' }}>
        <Avatar
          size="small"
          src={currentUser.userAvatar}
          icon={!currentUser.userAvatar && <UserOutlined />}
        />
        <span>{currentUser.userName}</span>
        <Tag
          color={ROLE_COLOR_MAP[dataScope] ?? 'default'}
          style={{ marginLeft: 0, lineHeight: '20px', fontSize: 11 }}
        >
          {dataScopeDesc || currentUser.roleName || '普通用户'}
        </Tag>
      </Space>
    </Dropdown>
  );
};

export default RightContent;
