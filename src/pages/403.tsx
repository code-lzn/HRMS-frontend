import { history, useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const ForbiddenPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const dataScopeDesc = initialState?.dataScopeDesc ?? '';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: 40,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)',
      }}
    >
      <Result
        status="403"
        title={
          <span style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a' }}>
            暂无访问权限
          </span>
        }
        subTitle={
          <span style={{ color: '#8c8c8c', fontSize: 14 }}>
            {dataScopeDesc
              ? `您当前的角色是「${dataScopeDesc}」，无法访问该页面。如需开通权限，请联系系统管理员。`
              : '您没有权限访问该页面，如需开通权限，请联系系统管理员。'}
          </span>
        }
        extra={[
          <Button
            key="home"
            type="primary"
            size="large"
            onClick={() => history.push('/home')}
            style={{ borderRadius: 8 }}
          >
            返回首页
          </Button>,
          <Button
            key="back"
            size="large"
            onClick={() => history.back()}
            style={{ borderRadius: 8 }}
          >
            返回上一页
          </Button>,
        ]}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '60px 80px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          maxWidth: 600,
        }}
      />
    </div>
  );
};

export default ForbiddenPage;
