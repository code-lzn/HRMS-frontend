import React, { useState } from 'react';
import { Layout, Menu, Avatar, Badge, Typography } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  SwitcherOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'umi';

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

const HR_MENU_ITEMS = [
  { key: '/hr/onboarding', icon: <UserOutlined />, label: '入职管理' },
  { key: '/hr/probation', icon: <CheckCircleOutlined />, label: '转正管理' },
  { key: '/hr/transfer', icon: <SwitcherOutlined />, label: '调岗管理' },
  { key: '/hr/resignation', icon: <LogoutOutlined />, label: '离职管理' },
];

interface HRLayoutProps {
  children: React.ReactNode;
}

const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userName: 'HR管理员',
    email: 'hr@company.com',
    avatar: '',
  });

  const currentPath = location.pathname;
  const currentMenuKey = HR_MENU_ITEMS.find((item) => currentPath.startsWith(item.key))?.key || '/hr/onboarding';

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={64}
        style={{
          background: '#1a1a2e',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ padding: '16px 12px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: '#4a6cf7',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: collapsed ? 0 : 10,
                flexShrink: 0,
              }}
            >
              <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
            </div>
            {!collapsed && (
              <div>
                <Title level={4} style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  HR管理中台
                </Title>
                <Text style={{ fontSize: 11, color: '#8b9cb5' }}>人力资源管理系统</Text>
              </div>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentMenuKey]}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 'none',
          }}
          items={HR_MENU_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px',
            background: '#16162a',
            borderTop: '1px solid #2a2a4a',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#4a6cf7', marginRight: 10 }}
              />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
                  {currentUser.userName}
                </Text>
                <div>
                  <Text style={{ fontSize: 11, color: '#8b9cb5' }}>
                    {currentUser.email}
                  </Text>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#4a6cf7', margin: '0 auto', display: 'block' }}
            />
          )}
        </div>
      </Sider>

      <Layout style={{ background: '#f5f7fa' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>HR管理中台</Text>
            <span style={{ margin: '0 8px', color: '#d9d9d9' }}>/</span>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {HR_MENU_ITEMS.find((item) => currentPath.startsWith(item.key))?.label || '入职管理'}
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge count={3} size="small" style={{ marginRight: 16 }}>
              <BellOutlined style={{ fontSize: 20, color: '#666', cursor: 'pointer' }} />
            </Badge>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#4a6cf7', marginRight: 8 }}
              />
              <Text style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>
                {currentUser.userName}
              </Text>
            </div>
          </div>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default HRLayout;
