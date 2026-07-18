import {
  deletePositionUsingDelete,
  getPositionListUsingGet,
  getSequencesUsingGet,
} from '@/api/positionController';
import { queryKeys } from '@/hooks/queryKeys';
import {
  BookOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import PositionFormModal from './components/PositionFormModal';

/**
 * 序列卡片数据
 */
const SEQUENCE_CARDS = [
  {
    seq: 1,
    label: '管理序列',
    short: 'M',
    icon: <CrownOutlined />,
    color: '#722ed1',
    bg: '#f9f0ff',
    borderColor: '#d3adf7',
    description: '负责团队管理与业务决策',
    levels: ['M1 主管', 'M2 经理', 'M3 总监', 'M4 高级总监', 'M5 SVP'],
  },
  {
    seq: 2,
    label: '专业序列',
    short: 'P',
    icon: <BookOutlined />,
    color: '#1677ff',
    bg: '#e6f4ff',
    borderColor: '#91caff',
    description: '专注技术与专业能力发展',
    levels: ['P1 初级', 'P3 中级', 'P5 高级', 'P7 专家', 'P10 资深专家'],
  },
  {
    seq: 3,
    label: '支持序列',
    short: 'S',
    icon: <SafetyCertificateOutlined />,
    color: '#52c41a',
    bg: '#f6ffed',
    borderColor: '#b7eb8f',
    description: '提供职能支持与后勤保障',
    levels: ['S1 助理', 'S2 专员', 'S3 高级专员', 'S4 主管', 'S5 经理'],
  },
];

const PositionManagement: React.FC = () => {
  const access = useAccess();
  const queryClient = useQueryClient();
  const canManage = access.canManageOrganization;

  const [activeSeq, setActiveSeq] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalPositionId, setModalPositionId] = useState<number | undefined>();
  const [modalInitialValues, setModalInitialValues] = useState<
    Record<string, any>
  >({});

  // 职位列表
  const {
    data: rawList = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.positions.all,
    queryFn: async () => {
      const res = await getPositionListUsingGet({ current: 1, pageSize: 1000 });
      return ((res.data as any)?.records ?? []) as API.PositionVO[];
    },
  });

  // 序列枚举
  useQuery({
    queryKey: queryKeys.positions.sequences(),
    queryFn: async () => {
      const res = await getSequencesUsingGet();
      return (res.data ?? []) as any[];
    },
    staleTime: 60 * 1000,
  });

  // 各序列统计
  const seqStats = useMemo(() => {
    const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    rawList.forEach((p) => {
      if (p.sequence && stats[p.sequence] !== undefined) stats[p.sequence]++;
    });
    return stats;
  }, [rawList]);

  // tab 过滤
  const filtered = useMemo(() => {
    if (!activeSeq) return rawList;
    return rawList.filter((p) => p.sequence === activeSeq);
  }, [rawList, activeSeq]);

  const handleAdd = () => {
    setModalMode('create');
    setModalPositionId(undefined);
    setModalInitialValues({});
    setModalOpen(true);
  };

  const handleEdit = (record: API.PositionVO) => {
    setModalMode('edit');
    setModalPositionId(record.id);
    setModalInitialValues({
      name: record.name,
      sequence: record.sequence,
      departmentId: record.departmentId,
      levelMin: record.levelMin,
      levelMax: record.levelMax,
      defaultProbationMonths: record.defaultProbationMonths,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePositionUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    refetch();
  };

  // ---------- 列 ----------
  const columns: ColumnsType<API.PositionVO> = [
    {
      title: '职位名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string) => (
        <Typography.Text strong>{name}</Typography.Text>
      ),
    },
    {
      title: '序列',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 60,
      align: 'center',
      render: (seq: number) => {
        const card = SEQUENCE_CARDS.find((c) => c.seq === seq);
        if (!card) return null;
        return (
          <Tag
            style={{
              color: card.color,
              background: card.bg,
              border: 'none',
              fontWeight: 600,
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {card.short}
          </Tag>
        );
      },
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      render: (v: string) => v || '全公司通用',
    },
    {
      title: '职级范围',
      dataIndex: 'levelRange',
      key: 'levelRange',
      width: 120,
    },
    {
      title: '试用期',
      dataIndex: 'defaultProbationMonths',
      key: 'defaultProbationMonths',
      width: 80,
      render: (m: number) => `${m} 个月`,
    },
    {
      title: (
        <Space size={4}>
          <UserOutlined />
          <span>在职人数</span>
        </Space>
      ),
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 100,
      render: (count: number) => (
        <span style={{ fontWeight: 500 }}>{count ?? 0} 人</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        if (!canManage) return null;
        return (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该职位？"
              onConfirm={() => handleDelete(record.id!)}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* 顶部标题区 */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              职位管理
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ marginTop: 4, display: 'block' }}
            >
              管理公司职位体系与序列职级
            </Typography.Text>
          </div>
          {canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增职位
            </Button>
          )}
        </div>
      </div>

      {/* 三个序列卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {SEQUENCE_CARDS.map((card) => (
          <Col span={8} key={card.seq}>
            <Card
              hoverable
              onClick={() =>
                setActiveSeq(activeSeq === card.seq ? undefined : card.seq)
              }
              style={{
                borderTop: `3px solid ${card.color}`,
                borderRadius: 8,
                background: activeSeq === card.seq ? `${card.color}08` : '#fff',
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {card.icon}
                </div>
                <Typography.Text strong style={{ fontSize: 15 }}>
                  {card.label}
                </Typography.Text>
                <Tag
                  style={{
                    color: card.color,
                    background: card.bg,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '0 6px',
                    lineHeight: '20px',
                  }}
                >
                  {card.short}
                </Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  职级范围：{card.levels[0].charAt(0)}1 ~{' '}
                  {card.levels[card.levels.length - 1]}
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {card.levels.map((level) => (
                  <div
                    key={level}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      background: `${card.color}0d`,
                      border: `1px solid ${card.borderColor}`,
                      fontSize: 12,
                      color: card.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 第二行：职位统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {SEQUENCE_CARDS.map((card) => (
          <Col span={8} key={`stat-${card.seq}`}>
            <Card
              hoverable
              onClick={() =>
                setActiveSeq(activeSeq === card.seq ? undefined : card.seq)
              }
              style={{
                background: activeSeq === card.seq ? `${card.color}08` : '#fff',
                borderRadius: 8,
              }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {card.label} · 职位数量
                  </Typography.Text>
                  <Typography.Title
                    level={3}
                    style={{
                      margin: '8px 0 0',
                      color: card.color,
                      fontWeight: 700,
                    }}
                  >
                    {seqStats[card.seq]}
                  </Typography.Title>
                </Col>
                <Col>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {card.icon}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 列表区 */}
      <Card styles={{ body: { padding: '0 24px 24px' } }}>
        <Tabs
          activeKey={activeSeq ? String(activeSeq) : 'all'}
          onChange={(key) =>
            setActiveSeq(key === 'all' ? undefined : Number(key))
          }
          style={{ marginBottom: 0 }}
          items={[
            { key: 'all', label: `全部 (${rawList.length})` },
            ...[1, 2, 3].map((seq) => {
              const card = SEQUENCE_CARDS.find((c) => c.seq === seq)!;
              return {
                key: String(seq),
                label: `${card.label} (${seqStats[seq]})`,
              };
            }),
          ]}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>

      <PositionFormModal
        open={modalOpen}
        mode={modalMode}
        positionId={modalPositionId}
        initialValues={modalInitialValues}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PositionManagement;
