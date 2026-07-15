import { userLogoutUsingPost } from '@/api/userController';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { Avatar, Button, Dropdown, Space, Spin } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';

interface RightContentProps {
  initialState: any;
  setInitialState: any;
  runtimeConfig: any;
}

const RightContent: React.FC<RightContentProps> = ({
  initialState,
  setInitialState,
  runtimeConfig,
}) => {
  // 正在加载初始状态
  if (!initialState) {
    return <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />;
  }

  const currentUser = initialState.currentUser;

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

  // 已登录 - 头像 + 下拉菜单
  const items: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await userLogoutUsingPost();
        window.location.href = '/user/login';
      },
    },
  ];

  return (
    <Dropdown menu={{ items }}>
      <Space style={{ cursor: 'pointer' }}>
        <Avatar
          size="small"
          src={currentUser.userAvatar}
          icon={!currentUser.userAvatar && <UserOutlined />}
        />
        <span>{currentUser.userName}</span>
      </Space>
    </Dropdown>
  );
};

export default RightContent;
