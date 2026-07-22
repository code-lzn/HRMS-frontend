import { Card, Timeline, Tag, Descriptions, Empty, Spin, Typography } from 'antd';
import { FileTextOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import request from '@/libs/request';
import dayjs from 'dayjs';

const { Text } = Typography;

const BUSINESS_TYPE_TEXT: Record<string, string> = {
  ONBOARDING: '入职审批',
  REGULARIZATION: '转正审批',
  TRANSFER: '调岗审批',
  RESIGNATION: '离职审批',
  PROBATION_REMINDER: '转正提醒',
};

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  APPROVE: { color: '#52c41a', icon: <CheckCircleOutlined />, text: '通过' },
  REJECT: { color: '#ff4d4f', icon: <CloseCircleOutlined />, text: '拒绝' },
  PENDING: { color: '#faad14', icon: <ClockCircleOutlined />, text: '待审批' },
  TRANSFER: { color: '#1677ff', icon: <UserOutlined />, text: '转交' },
};

const MyChanges: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<API.MutationLogVO[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await request.get<{ code: number; data: API.MutationLogVO[]; message: string }>('/api/mutation-logs/my');
      if (res?.data) {
        setLogs(res.data);
      }
    } catch (e) { console.error('pages/MyChanges/index.tsx', e); } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="我的人事异动">
        <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
      </Card>
    );
  }

  if (!logs.length) {
    return (
      <Card title="我的人事异动">
        <Empty description="暂无人员异动记录" />
      </Card>
    );
  }

  return (
    <Card title="我的人事异动">
      <Timeline
        items={logs.map((log) => {
          const details = log.approvalDetails || [];
          const submitter = log.operatorName || '—';
          const submitTime = log.createTime ? dayjs(log.createTime).format('YYYY-MM-DD HH:mm') : '—';

          return {
            color: log.approvalStatus === 'APPROVED' ? '#52c41a' : log.approvalStatus === 'REJECTED' ? '#ff4d4f' : '#1677ff',
            dot: <FileTextOutlined style={{ fontSize: 16 }} />,
            children: (
              <div style={{ marginBottom: 8 }}>
                {/* 头部信息 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>
                      {BUSINESS_TYPE_TEXT[log.businessType || ''] || log.businessType || '人事异动'}
                    </Text>
                    <Tag style={{ marginLeft: 8 }}>{log.businessNo}</Tag>
                    <Tag color="blue">{log.deptName}</Tag>
                  </div>
                  <div>
                    <Tag color={log.approvalStatus === 'APPROVED' ? 'success' : log.approvalStatus === 'REJECTED' ? 'error' : 'processing'}>
                      {log.approvalStatus === 'APPROVED' ? '已通过' : log.approvalStatus === 'REJECTED' ? '已拒绝' : log.approvalStatus}
                    </Tag>
                  </div>
                </div>

                {/* 基本信息 */}
                <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
                  {log.employeeName && (
                    <Descriptions.Item label="涉及员工">{log.employeeName}</Descriptions.Item>
                  )}
                  <Descriptions.Item label="提交人">{submitter}</Descriptions.Item>
                  <Descriptions.Item label="提交时间">{submitTime}</Descriptions.Item>
                  <Descriptions.Item label="生效日期">
                    {log.effectDate ? dayjs(log.effectDate).format('YYYY-MM-DD') : '—'}
                  </Descriptions.Item>
                </Descriptions>

                {/* 审批流程 */}
                {details.length > 0 && (
                  <div
                    style={{
                      background: '#fafafa',
                      borderRadius: 8,
                      padding: '12px 16px',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                      审批流程
                    </Text>
                    {[...details]
                      .sort((a, b) => (a.stepOrder || 1) - (b.stepOrder || 1))
                      .map((detail, idx) => {
                        const cfg = ACTION_CONFIG[detail.action || ''] || { color: '#d9d9d9', icon: null, text: detail.action || '未知' };
                        return (
                          <div
                            key={detail.id || idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              padding: '8px 0',
                              borderBottom: idx < details.length - 1 ? '1px solid #f0f0f0' : 'none',
                            }}
                          >
                            <span style={{ color: cfg.color, marginRight: 8, marginTop: 2 }}>{cfg.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div>
                                <Text strong>{detail.nodeName || `第${detail.stepOrder}步`}</Text>
                                <Tag color={cfg.color} style={{ marginLeft: 8, fontSize: 12 }}>
                                  {cfg.text}
                                </Tag>
                              </div>
                              <div style={{ marginTop: 2 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  审批人：{detail.approverName || '系统自动分配'}
                                </Text>
                              </div>
                              {detail.comment && (
                                <div style={{ marginTop: 2 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    意见：{detail.comment}
                                  </Text>
                                </div>
                              )}
                              {detail.operateTime && (
                                <div style={{ marginTop: 2 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(detail.operateTime).format('YYYY-MM-DD HH:mm')}
                                  </Text>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ),
          };
        })}
      />
    </Card>
  );
};

export default MyChanges;
