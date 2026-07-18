import {
  TRANSFER_STATUS,
} from '@/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Modal,
  Row,
  Col,
  Avatar,
  Tag,
  message,
  Tabs,
  Table,
  Input,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import TransferFormModal from './components/TransferForm';
import { TransferRecord, TransferHistoryItem } from './mock';
import { listUsingGet3, getHistoryUsingGet } from '@/api/transferController';

const STATUS_BG_COLORS: Record<number, string> = {
  [TRANSFER_STATUS.DRAFT]: '#f9fafb',
  [TRANSFER_STATUS.PENDING]: '#fef3c7',
  [TRANSFER_STATUS.EFFECTIVE]: '#dcfce7',
};

const STATUS_TEXT_COLORS: Record<number, string> = {
  [TRANSFER_STATUS.DRAFT]: '#6b7280',
  [TRANSFER_STATUS.PENDING]: '#d97706',
  [TRANSFER_STATUS.EFFECTIVE]: '#16a34a',
};

const STATUS_LABEL_COLORS: Record<number, { bg: string; color: string }> = {
  [TRANSFER_STATUS.DRAFT]: { bg: '#f3f4f6', color: '#6b7280' },
  [TRANSFER_STATUS.PENDING]: { bg: '#fef3c7', color: '#d97706' },
  [TRANSFER_STATUS.EFFECTIVE]: { bg: '#dcfce7', color: '#16a34a' },
  [TRANSFER_STATUS.REJECTED]: { bg: '#fee2e2', color: '#dc2626' },
};

const TransferPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEmpId, setHistoryEmpId] = useState<number | undefined>();

  const [stats, setStats] = useState({ pending: 0, effective: 0, rejected: 0, total: 0 });
  const [historyData, setHistoryData] = useState<TransferHistoryItem[]>([]);

  const loadStats = async () => {
    try {
      const res = await listUsingGet3({ current: 1, pageSize: 10000 });
      if (res.code === 0 && res.data?.records) {
        const records = res.data.records;
        setStats({
          pending: records.filter((i) => i.status === TRANSFER_STATUS.PENDING).length,
          effective: records.filter((i) => i.status === TRANSFER_STATUS.EFFECTIVE).length,
          rejected: records.filter((i) => i.status === TRANSFER_STATUS.REJECTED).length,
          total: res.data.total || 0,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getInitial = (name: string) => name?.charAt(0) || '?';

  const handleViewHistory = (empId: number) => {
    setHistoryEmpId(empId);
    setHistoryOpen(true);
  };

  const columns: ProColumns<TransferRecord>[] = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            style={{ backgroundColor: '#0891b2', fontSize: 16, fontWeight: 600 }}
          >
            {getInitial(record.employeeName)}
          </Avatar>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
              }}
              onClick={() => history.push(`/hr-change/transfer/${record.id}`)}
            >
              {record.employeeName}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{record.employeeNo}</div>
          </div>
        </div>
      ),
    },
    {
      title: '原部门',
      dataIndex: 'fromDepartmentName',
      key: 'fromDepartmentName',
      width: 120,
    },
    {
      title: '新部门',
      dataIndex: 'toDepartmentName',
      key: 'toDepartmentName',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#0891b2', fontWeight: 500 }}>{record.toDepartmentName}</span>
      ),
    },
    {
      title: '原职位',
      dataIndex: 'fromPositionName',
      key: 'fromPositionName',
      width: 130,
    },
    {
      title: '新职位',
      dataIndex: 'toPositionName',
      key: 'toPositionName',
      width: 130,
      render: (_, record) => (
        <span style={{ color: '#0891b2' }}>{record.toPositionName}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const color = STATUS_LABEL_COLORS[record.status] || STATUS_LABEL_COLORS[1];
        return (
          <Tag
            style={{
              background: color.bg,
              color: color.color,
              borderRadius: 4,
              fontSize: 12,
              margin: 0,
              border: 'none',
              padding: '2px 10px',
            }}
          >
            {record.statusDesc}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            type="link"
            size="small"
            onClick={() => history.push(`/hr-change/transfer/${record.id}`)}
            style={{ color: '#0891b2', padding: 0 }}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewHistory(record.employeeId)}
            style={{ color: '#6b7280', padding: 0 }}
          >
            调岗历史
          </Button>
        </div>
      ),
    },
  ];

  const statCards = [
    {
      label: '草稿',
      count: stats.total - stats.pending - stats.effective - stats.rejected,
      bgColor: STATUS_BG_COLORS[TRANSFER_STATUS.DRAFT],
      textColor: STATUS_TEXT_COLORS[TRANSFER_STATUS.DRAFT],
    },
    {
      label: '审批中',
      count: stats.pending,
      bgColor: STATUS_BG_COLORS[TRANSFER_STATUS.PENDING],
      textColor: STATUS_TEXT_COLORS[TRANSFER_STATUS.PENDING],
    },
    {
      label: '已生效',
      count: stats.effective,
      bgColor: STATUS_BG_COLORS[TRANSFER_STATUS.EFFECTIVE],
      textColor: STATUS_TEXT_COLORS[TRANSFER_STATUS.EFFECTIVE],
    },
    {
      label: '已拒绝',
      count: stats.rejected,
      bgColor: '#fee2e2',
      textColor: '#dc2626',
    },
  ];

  useEffect(() => {
    if (historyOpen && historyEmpId) {
      getHistoryUsingGet({ employeeId: historyEmpId, current: 1, pageSize: 100 })
        .then((res) => {
          if (res.code === 0 && res.data?.records) {
            setHistoryData(res.data.records as unknown as TransferHistoryItem[]);
          } else {
            setHistoryData([]);
          }
        })
        .catch(() => setHistoryData([]));
    }
  }, [historyOpen, historyEmpId]);

  return (
    <PageContainer
      header={{
        title: (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>调岗管理</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>管理员工调岗申请与审批流程</div>
          </div>
        ),
        extra: [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: '#0891b2',
              borderColor: '#0891b2',
              borderRadius: 8,
              padding: '6px 16px',
              height: 'auto',
            }}
          >
            新建调岗申请
          </Button>,
        ],
      }}
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col span={6} key={card.label}>
            <Card
              style={{
                background: card.bgColor,
                border: 'none',
                borderRadius: 12,
                boxShadow: 'none',
              }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: card.textColor }}>{card.count}</div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#fff',
                    opacity: 0.8,
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 12, background: '#fafafa', padding: '8px 12px', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Input.Search
          placeholder="搜索员工姓名/工号"
          allowClear
          onSearch={(v) => { setKeyword(v); actionRef.current?.reload(); }}
          style={{ width: 280 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>
      </div>

      <ProTable<TransferRecord>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, status } = params as any;
          const tabMap: Record<string, number> = {
            draft: TRANSFER_STATUS.DRAFT,
            pending: TRANSFER_STATUS.PENDING,
            effective: TRANSFER_STATUS.EFFECTIVE,
            rejected: TRANSFER_STATUS.REJECTED,
          };
          const apiParams: API.listUsingGET3Params = {
            current,
            pageSize,
            keyword,
            status: activeTab !== 'all' ? tabMap[activeTab] : status,
          };
          try {
            const res = await listUsingGet3(apiParams);
            if (res.code === 0 && res.data) {
              return { data: (res.data.records || []) as TransferRecord[], success: true, total: res.data.total || 0 };
            }
            return { data: [] as TransferRecord[], success: true, total: 0 };
          } catch {
            message.error('获取调岗列表失败');
            return { data: [] as TransferRecord[], success: true, total: 0 };
          }
        }}
        toolBarRender={false}
        toolbar={{
          actions: [
            <Tabs
              key="tabs"
              activeKey={activeTab}
              onChange={(k) => {
                setActiveTab(k);
                actionRef.current?.reload();
              }}
              items={[
                { key: 'all', label: <>全部 <Badge count={stats.total} showZero color="#0891b2" /></> },
                { key: 'draft', label: <>草稿 <Badge count={stats.total - stats.pending - stats.effective - stats.rejected} showZero color="#9ca3af" /></> },
                { key: 'pending', label: <>审批中 <Badge count={stats.pending} showZero color="#f59e0b" /></> },
                { key: 'effective', label: <>已生效 <Badge count={stats.effective} showZero color="#22c55e" /></> },
                { key: 'rejected', label: <>已拒绝 <Badge count={stats.rejected} showZero color="#ef4444" /></> },
              ]}
            />,
          ],
        }}
        cardProps={{
          style: { borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
        }}
      />

      <TransferFormModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Modal
        title="调岗历史"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        width={800}
        footer={null}
      >
        {historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无调岗记录</div>
        ) : (
          <Table
            dataSource={historyData}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '原部门', dataIndex: 'fromDepartmentName', width: 100 },
              {
                title: '新部门',
                dataIndex: 'toDepartmentName',
                width: 100,
                render: (v: string) => <span style={{ color: '#0891b2' }}>{v}</span>,
              },
              { title: '原职位', dataIndex: 'fromPositionName', width: 110 },
              {
                title: '新职位',
                dataIndex: 'toPositionName',
                width: 110,
                render: (v: string) => <span style={{ color: '#0891b2' }}>{v}</span>,
              },
              { title: '原职级', dataIndex: 'fromJobLevel', width: 70 },
              { title: '新职级', dataIndex: 'toJobLevel', width: 70 },
              { title: '生效日期', dataIndex: 'transferDate', width: 110 },
              { title: '原因', dataIndex: 'reason', ellipsis: true },
            ]}
            size="small"
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default TransferPage;
