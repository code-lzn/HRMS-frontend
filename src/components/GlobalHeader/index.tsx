import { LogoutOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Button, Dropdown, Space, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import { userLogoutUsingPost } from '@/api/userController';
import './index.css';

const GlobalHeader: React.FC = () => {
  const initialInfo = useModel('@@initialState');
  const initialState = initialInfo?.initialState;
  const currentUser = initialState?.currentUser;
  const dataScopeDesc = initialState?.dataScopeDesc ?? '';

  const handleLogout = async () => {
    try {
      await userLogoutUsingPost();
    } catch (e) { console.error('components/GlobalHeader/index.tsx', e); }
    window.location.href = '/user/login';
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="global-header">
      <div className="global-header-left">
        <img
          className="global-header-logo-img"
          src="https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg"
          alt="logo"
        />
        <span className="global-header-logo">HRMS</span>
      </div>
      <div className="global-header-right">
        {currentUser && (
          <Space size={10}>
            <Tooltip title="AI 智能助理">
              <Button
                type="text"
                icon={<RobotOutlined style={{ fontSize: 18, color: '#1677ff' }} />}
                onClick={() => history.push('/ai-assistant')}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Tooltip>
            <Avatar
              size={32}
              style={{ backgroundColor: '#faad14', cursor: 'pointer' }}
              icon={<UserOutlined />}
              src={currentUser.userAvatar || undefined}
              onClick={() => history.push('/personal/profile')}
            />
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <span className="global-header-username" style={{ cursor: 'pointer' }}>
                {currentUser.userName || '系统管理员'}
              </span>
            </Dropdown>
            <span className="global-header-tag">
              {dataScopeDesc || '全量'}
            </span>
          </Space>
        )}
      </div>
    </div>
  );
};

export default GlobalHeader;
