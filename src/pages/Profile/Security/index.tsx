import { useEffect, useState } from 'react';
import { Card } from 'antd';
import { SafetyOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { LoginLogVO } from '@/services/profile/typings';
import { getLoginLogs } from '@/services/profile';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LoginLogVO[]>([]);

  useEffect(() => { getLoginLogs().then(setLogs).catch(() => {}); }, []);

  const menuItems = [
    {
      key: 'password',
      title: '修改密码',
      desc: '定期更换密码以保障账号安全',
      icon: '🔒',
      bgColor: '#eef2ff',
      iconColor: '#6366f1',
      actionColor: '#6366f1',
      onClick: () => navigate('/profile/security/password'),
    },
    {
      key: 'phone',
      title: '修改手机号',
      desc: '更换绑定的手机号码',
      icon: '📱',
      bgColor: '#f0fdf4',
      iconColor: '#22c55e',
      actionColor: '#22c55e',
      onClick: () => navigate('/profile/security/phone'),
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>账号安全</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理您的账号安全设置</div>
          </div>
        ),
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {menuItems.map((item) => (
          <Card
            key={item.key}
            hoverable
            onClick={item.onClick}
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{item.desc}</div>
              </div>
              <ArrowRightOutlined style={{ fontSize: 16, color: '#d1d5db' }} />
            </div>
          </Card>
        ))}
      </div>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyOutlined style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>登录日志</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                background: '#f9fafb',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: log.result === 1 ? '#22c55e' : '#ef4444',
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{log.loginTime}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {log.ipAddress} · {log.device}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: log.result === 1 ? '#22c55e' : '#ef4444',
                }}
              >
                {log.resultDesc}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无登录日志</div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
