import { getProcessedList } from '@/api/approvalController';
import { BIZ_TYPE_TABS, NODE_STATUS } from '@/constants';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Input, Select, Tag, Avatar, message, Pagination } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ApprovalProcessed: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [bizType, setBizType] = useState('');
  const [stats, setStats] = useState({ today: 0, month: 0, rejected: 0 });
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchList = async (page?: number, size?: number) => {
    const p = page ?? current;
    const s = size ?? pageSize;
    setLoading(true);
    try {
      const hasClientFilter = !!searchText;
      const querySize = hasClientFilter ? 1000 : s;
      const queryPage = hasClientFilter ? 1 : p;
      const res = await getProcessedList({ bizType: bizType || undefined, current: queryPage, pageSize: querySize } as any);
      let records = res?.data?.records || [];
      if (searchText) {
        records = records.filter((item: any) =>
          item.applicantName?.includes(searchText) ||
          item.title?.includes(searchText));
      }
      const filteredTotal = records.length;
      if (hasClientFilter) {
        const start = (p - 1) * s;
        records = records.slice(start, start + s);
      }
      setList(records);
      setTotal(hasClientFilter ? filteredTotal : (res?.data?.total || records.length));
    } catch (e: any) {
      message.error(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1, pageSize); setCurrent(1); }, [searchText, bizType]);
  useEffect(() => { fetchList(); }, [current, pageSize]);

  useEffect(() => {
    getProcessedList({ current: 1, pageSize: 1000 } as any).then(res => {
      const all = res?.data?.records || [];
      setStats({
        today: all.filter((i: any) => i.nodeStatus === 2 && dayjs(i.operateTime).isSame(dayjs(), 'day')).length,
        month: all.filter((i: any) => i.nodeStatus === 2 && dayjs(i.operateTime).isSame(dayjs(), 'month')).length,
        rejected: all.filter((i: any) => i.nodeStatus === 3).length,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchList();
  }, [current, pageSize]);

  const todayApprovedCount = stats.today;
  const monthApprovedCount = stats.month;
  const rejectedCount = stats.rejected;

  const resultColor: Record<number, string> = {
    [NODE_STATUS.APPROVED]: 'green',
    [NODE_STATUS.REJECTED]: 'red',
    [NODE_STATUS.TRANSFERRED]: 'blue',
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>已办审批</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>查看已处理的审批记录</div>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
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
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#eff6ff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#60a5fa' }}>{monthApprovedCount}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>本月已通过</div>
            </div>
          </div>
        </Card>
        <Card
          style={{ flex: 1, borderRadius: 12, border: 'none', boxShadow: 'none', background: '#fee2e2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f87171' }}>{rejectedCount}</div>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>已拒绝</div>
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : list.length === 0 ? (
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>暂无已办审批记录</div>
          </Card>
        ) : (
          list.map((item) => (
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
                      <span>审批时间：{dayjs(item.operateTime).format('YYYY-MM-DD HH:mm')}</span>
                      <span style={{ margin: '0 12px', color: '#ddd' }}>|</span>
                      <span style={{ color: '#999' }}>当前节点：{item.nodeName}</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#999' }}>
                      {item.comment && (
                        <span>审批意见：{item.comment}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Tag
                    color={resultColor[item.nodeStatus ?? 0] || 'default'}
                    style={{ fontSize: 12, borderRadius: 4, padding: '4px 12px' }}
                  >
                    {item.nodeStatusDesc}
                  </Tag>
                  <Button
                    type="text"
                    onClick={() => history.push(`/approval/detail/${item.instanceId}`)}
                    style={{ color: '#666', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 12px' }}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination current={current} pageSize={pageSize} total={total}
          onChange={(p, s) => { setCurrent(p); setPageSize(s); }}
          showSizeChanger showTotal={(t) => `共 ${t} 条`} />
      </div>
    </PageContainer>
  );
};

export default ApprovalProcessed;
