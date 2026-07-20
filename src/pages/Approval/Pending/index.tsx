import { getPendingList, approve, rejectApproval } from '@/api/approvalController';
import { BIZ_TYPE_TABS } from '@/constants';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Button, Card, Input, Select, Tag, Avatar, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ApprovalPending: React.FC = () => {
  const { refreshPendingCount } = useModel('approval');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [bizType, setBizType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyMine, setOnlyMine] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getPendingList({ current: 1, pageSize: 100 });
      let records = res?.data?.records || [];
      if (searchText) {
        records = records.filter(
          (item: any) =>
            item.applicantName?.includes(searchText) ||
            item.approvalNo?.includes(searchText) ||
            item.title?.includes(searchText),
        );
      }
      if (bizType) {
        records = records.filter((item: any) => item.bizType === bizType);
      }
      if (onlyMine) {
        records = records.filter((item: any) => item.canAct !== false);
      }
      if (statusFilter) {
        if (statusFilter === 'overdue') {
          records = records.filter(
            (item: any) => item.deadLine && dayjs().isAfter(dayjs(item.deadLine)),
          );
        }
      }
      setList(records);
      refreshPendingCount();
    } catch (e: any) {
      message.error(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [searchText, bizType, statusFilter, onlyMine]);

  const pendingCount = list.length;
  const overdueCount = list.filter(
    (item) => item.deadLine && dayjs().isAfter(dayjs(item.deadLine)),
  ).length;
  const todayApprovedCount = 0;

  const handleApprove = async (nodeId: number) => {
    setActionLoading(`approve_${nodeId}`);
    try {
      await approve(nodeId, {});
      message.success('审批通过');
      fetchList();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (nodeId: number) => {
    setActionLoading(`reject_${nodeId}`);
    try {
      await rejectApproval(nodeId, { comment: '拒绝审批' });
      message.success('已拒绝');
      fetchList();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>审批工作台</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理和处理所有待审批事项</div>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#faf7f2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#d4a373' }}>{pendingCount}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>待审批</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#f0fdf4' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#4ade80' }}>{todayApprovedCount}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>今日已审批</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fef2f2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f87171' }}>{overdueCount}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>已逾期</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <Input
          placeholder="搜索申请人或单号..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, borderRadius: 8, height: 36 }}
        />
        <Select
          value={bizType}
          onChange={(v) => setBizType(v)}
          style={{ width: 140, borderRadius: 8, height: 36 }}
          options={[
            { value: '', label: '全部类型' },
            ...BIZ_TYPE_TABS.filter((t) => t.key).map((t) => ({
              value: t.key,
              label: t.label,
            })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          style={{ width: 140, borderRadius: 8, height: 36 }}
          options={[
            { value: '', label: '全部状态' },
            { value: 'overdue', label: '已逾期' },
          ]}
        />
        <Button
          type={onlyMine ? 'primary' : 'default'}
          onClick={() => setOnlyMine(!onlyMine)}
          style={{ borderRadius: 8, height: 36 }}
        >
          {onlyMine ? '仅我的待办' : '显示全部'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : list.length === 0 ? (
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>暂无待审批事项</div>
          </Card>
        ) : (
          list.map((item) => {
            const isOverdue = item.deadLine && dayjs().isAfter(dayjs(item.deadLine));
            return (
              <Card
                key={item.nodeId}
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                hoverable
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar
                      size={52}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#6366f1', fontSize: 22 }}
                    >
                      {getInitial(item.applicantName)}
                    </Avatar>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{item.applicantName}</span>
                        <span style={{ fontSize: 13, color: '#999' }}>{item.applicantDepartment || '人力资源部'}</span>
                        <Tag
                          color="green"
                          style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', borderRadius: 4 }}
                        >
                          {item.bizTypeDesc}
                        </Tag>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
                        <span>申请：{dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
                        <span style={{ margin: '0 12px', color: '#ddd' }}>|</span>
                        <span style={{ color: isOverdue ? '#dc2626' : '#999', fontWeight: isOverdue ? 500 : 400 }}>
                          截止：{dayjs(item.deadLine).format('YYYY-MM-DD HH:mm')}
                        </span>
                        {isOverdue && (
                          <Tag color="red" style={{ marginLeft: 8, fontSize: 11, background: '#fee2e2', color: '#dc2626', borderRadius: 4 }}>已逾期</Tag>
                        )}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#999' }}>
                        当前节点：{item.nodeName}
                        {item.delegatorName && (
                          <Tag color="purple" style={{ fontSize: 11, marginLeft: 8, borderRadius: 4 }}>{item.delegatorName} 委托</Tag>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      type="text"
                      onClick={() => history.push(`/approval/detail/${item.instanceId}`)}
                      style={{ color: '#666', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 12px' }}
                    >
                      查看详情
                    </Button>
                    {item.canAct !== false ? (
                      <>
                        <Button
                          type="primary"
                          style={{ background: '#22c55e', borderColor: '#22c55e', borderRadius: 6, padding: '4px 16px' }}
                          loading={actionLoading === `approve_${item.nodeId}`}
                          onClick={() => handleApprove(item.nodeId)}
                        >
                          通过
                        </Button>
                        <Button
                          danger
                          style={{ borderRadius: 6, padding: '4px 16px', borderColor: '#fca5a5', color: '#dc2626' }}
                          loading={actionLoading === `reject_${item.nodeId}`}
                          onClick={() => handleReject(item.nodeId)}
                        >
                          拒绝
                        </Button>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: '#999', alignSelf: 'center' }}>非本人审批节点</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
};

export default ApprovalPending;
