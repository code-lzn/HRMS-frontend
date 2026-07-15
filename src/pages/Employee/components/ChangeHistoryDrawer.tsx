import { getChangeLogsUsingGet } from '@/api/employeeController';
import { Drawer, Empty, message, Spin, Tag, Timeline, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const CHANGE_TYPE_MAP: Record<string, { text: string; color: string }> = {
  DIRECT_EDIT: { text: '直接编辑', color: 'blue' },
  FLOW_CHANGE: { text: '流程变更', color: 'green' },
  SYSTEM: { text: '系统自动', color: 'default' },
};

interface ChangeHistoryDrawerProps {
  open: boolean;
  employeeId: number | undefined;
  onClose: () => void;
}

const ChangeHistoryDrawer: React.FC<ChangeHistoryDrawerProps> = ({
  open,
  employeeId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<API.EmployeeChangeLogVO[]>([]);

  const fetchLogs = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await getChangeLogsUsingGet({ employeeId, page: 1, size: 50 });
      const data = (res as any)?.data;
      setRecords(data?.records ?? []);
    } catch (e: any) {
      message.error(e.message ?? '加载变更历史失败');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (open && employeeId) {
      fetchLogs();
    }
  }, [open, employeeId, fetchLogs]);

  return (
    <Drawer
      title="变更历史"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Empty description="暂无变更记录" />
        ) : (
          <Timeline
            items={records.map((log) => {
              const ct = CHANGE_TYPE_MAP[log.changeType ?? ''];
              return {
                key: log.id,
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{log.fieldDesc ?? log.fieldName}</Text>
                      {ct && (
                        <Tag color={ct.color} style={{ marginLeft: 8 }}>
                          {log.changeTypeDesc ?? ct.text}
                        </Tag>
                      )}
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      <Text delete style={{ color: '#999' }}>{log.oldValue ?? '空'}</Text>
                      {' → '}
                      <Text>{log.newValue ?? '空'}</Text>
                    </div>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                      {log.operatorName && <span>操作人：{log.operatorName} · </span>}
                      {log.createTime}
                    </div>
                    {log.remark && (
                      <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                        备注：{log.remark}
                      </div>
                    )}
                  </div>
                ),
              };
            })}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default ChangeHistoryDrawer;
