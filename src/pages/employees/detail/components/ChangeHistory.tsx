import { CHANGE_TYPE_MAP } from '@/constants/enums';
import { Button, Card, Drawer, Space, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

/**
 * 变更历史组件
 * 底部展示最近3条，点击"查看全部"打开 Drawer 分页查看
 */
const ChangeHistory: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // TODO: 接入真实变更历史接口
  const changes: any[] = [];
  const recentChanges = changes.slice(0, 3);

  return (
    <>
      <Card title="变更历史" style={{ marginBottom: 16 }}>
        {recentChanges.length > 0 ? (
          <>
            <Timeline
              items={recentChanges.map((item) => ({
                children: (
                  <div>
                    <Space size={8}>
                      <span style={{ fontWeight: 500 }}>{item.fieldName}</span>
                      <Tag
                        color={
                          CHANGE_TYPE_MAP[item.changeType]?.color || 'default'
                        }
                      >
                        {CHANGE_TYPE_MAP[item.changeType]?.text ||
                          item.changeType}
                      </Tag>
                    </Space>
                    <div style={{ marginTop: 4 }}>
                      {item.oldValue} → {item.newValue}
                    </div>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                      {item.operatorName} ·{' '}
                      {dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                ),
              }))}
            />
            {changes.length > 3 && (
              <Button type="link" onClick={() => setDrawerOpen(true)}>
                查看全部
              </Button>
            )}
          </>
        ) : (
          <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
            暂无变更记录
          </div>
        )}
      </Card>

      {/* 变更历史 Drawer */}
      <Drawer
        title="变更历史"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
      >
        <Timeline
          items={changes.map((item) => ({
            children: (
              <div>
                <Space size={8}>
                  <span style={{ fontWeight: 500 }}>{item.fieldName}</span>
                  <Tag
                    color={CHANGE_TYPE_MAP[item.changeType]?.color || 'default'}
                  >
                    {CHANGE_TYPE_MAP[item.changeType]?.text || item.changeType}
                  </Tag>
                </Space>
                <div style={{ marginTop: 4 }}>
                  {item.oldValue} → {item.newValue}
                </div>
                <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                  {item.operatorName} ·{' '}
                  {dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            ),
          }))}
        />
      </Drawer>
    </>
  );
};

export default ChangeHistory;
