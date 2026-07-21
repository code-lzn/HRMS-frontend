import {
  deletePositionUsingDelete,
  getPositionListUsingGet,
} from '@/api/positionController';
import { queryKeys } from '@/hooks/queryKeys';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  message,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import PositionFormModal from './components/PositionFormModal';

const { Title, Text } = Typography;

interface SequenceConfig {
  key: number;
  letter: string;
  name: string;
  fullName: string;
  color: string;
  lightColor: string;
  bgColor: string;
  levelRange: string;
  description: string;
  levels: { code: string; name: string }[];
}

const SEQUENCE_CONFIG: SequenceConfig[] = [
  {
    key: 1,
    letter: 'M',
    name: '管理序列',
    fullName: '管理序列（M序列）',
    color: '#a855f7',
    lightColor: '#e9d5ff',
    bgColor: '#faf5ff',
    levelRange: 'M1 ~ M5',
    description: '负责团队管理与业务决策',
    levels: [
      { code: 'M1', name: '主管' },
      { code: 'M2', name: '经理' },
      { code: 'M3', name: '总监' },
      { code: 'M4', name: '高级总监' },
      { code: 'M5', name: 'VP' },
    ],
  },
  {
    key: 2,
    letter: 'P',
    name: '专业序列',
    fullName: '专业序列（P序列）',
    color: '#0ea5e9',
    lightColor: '#bae6fd',
    bgColor: '#f0f9ff',
    levelRange: 'P1 ~ P10',
    description: '专注技术与专业能力发展',
    levels: [
      { code: 'P3', name: '初级' },
      { code: 'P5', name: '中级' },
      { code: 'P7', name: '高级' },
      { code: 'P9', name: '专家' },
      { code: 'P10', name: '资深专家' },
    ],
  },
  {
    key: 3,
    letter: 'S',
    name: '支持序列',
    fullName: '支持序列（S序列）',
    color: '#10b981',
    lightColor: '#a7f3d0',
    bgColor: '#f0fdf4',
    levelRange: 'S1 ~ S5',
    description: '提供职能支持与服务保障',
    levels: [
      { code: 'S1', name: '助理' },
      { code: 'S2', name: '专员' },
      { code: 'S3', name: '高级专员' },
      { code: 'S4', name: '主管' },
      { code: 'S5', name: '经理' },
    ],
  },
];

const PositionManagement: React.FC = () => {
  const access = useAccess();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalPositionId, setModalPositionId] = useState<number | undefined>();
  const [modalInitialValues, setModalInitialValues] = useState<
    Record<string, any>
  >({});

  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchSequence, setSearchSequence] = useState<number | undefined>();

  const {
    data: positionPage,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.positions.list({}),
    queryFn: async () => {
      const res = await getPositionListUsingGet({ pageSize: 999 });
      return res.data as any;
    },
  });
  const queryErr = queryError as any;
  const isPermissionError = queryErr?.code === 40101;

  const allPositions: any[] = positionPage?.records ?? [];

  const filtered = useMemo(() => {
    return allPositions.filter((p) => {
      if (searchKeyword && !p.name?.includes(searchKeyword)) return false;
      if (searchSequence !== undefined && p.sequence !== searchSequence)
        return false;
      return true;
    });
  }, [allPositions, searchKeyword, searchSequence]);

  const seqStats = useMemo(() => {
    const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    allPositions.forEach((p) => {
      const seq = p.sequence;
      if (seq && stats[seq] !== undefined) {
        stats[seq]++;
      }
    });
    return stats;
  }, [allPositions]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
  };

  const handleReset = () => {
    setKeyword('');
    setSearchKeyword('');
    setSearchSequence(undefined);
  };

  const handleAdd = () => {
    setModalMode('create');
    setModalPositionId(undefined);
    setModalInitialValues({});
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
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

  const getSequenceTag = (seq: number) => {
    const cfg = SEQUENCE_CONFIG.find((s) => s.key === seq);
    if (!cfg) return <Tag color="default">{seq}</Tag>;
    return (
      <Tag
        style={{
          backgroundColor: cfg.bgColor,
          color: cfg.color,
          border: 'none',
          borderRadius: 12,
          padding: '2px 12px',
          fontWeight: 600,
        }}
      >
        {cfg.letter}序列
      </Tag>
    );
  };

  const columns: ColumnsType<any> = [
    { title: '职位名称', dataIndex: 'name', key: 'name', width: 160 },
    {
      title: '序列',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 120,
      align: 'center',
      render: (v: number) => getSequenceTag(v),
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 140,
      ellipsis: true,
      render: (_: any, r: any) => r.departmentName || '全公司通用',
    },
    {
      title: '职级范围',
      dataIndex: 'levelRange',
      key: 'levelRange',
      width: 130,
    },
    {
      title: '试用期',
      dataIndex: 'defaultProbationMonths',
      key: 'defaultProbationMonths',
      width: 80,
      align: 'center',
      render: (v: number) => (v ? `${v}个月` : '-'),
    },
    {
      title: '在职人数',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 90,
      align: 'center',
      render: (v: number) => v ?? 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (!access.canManageOrganization) return null;
        return (
          <Space>
            <Button
              size="small"
              shape="round"
              style={{ color: '#1677ff', borderColor: '#1677ff' }}
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
              <Button danger size="small" shape="round">
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: '24px 32px',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          职位管理
        </Title>
        <Space>
          {access.canManageOrganization && (
            <Button type="primary" shape="round" onClick={handleAdd}>
              新增职位
            </Button>
          )}
        </Space>
      </div>

      {/* 上部：序列统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {SEQUENCE_CONFIG.map((seq) => (
          <Col xs={24} sm={12} md={8} key={seq.key}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s',
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16,
                }}
              >
                <Tag
                  style={{
                    backgroundColor: seq.bgColor,
                    color: seq.color,
                    border: 'none',
                    borderRadius: 12,
                    padding: '4px 14px',
                    fontWeight: 600,
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  {seq.letter}序列
                </Tag>
                <Text
                  strong
                  style={{
                    fontSize: 32,
                    color: '#262626',
                    lineHeight: 1,
                    fontWeight: 600,
                  }}
                >
                  {seqStats[seq.key] ?? 0}
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16, color: '#262626' }}>
                  {seq.name}
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                  职级：{seq.levelRange}
                </Text>
              </div>
              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                {seq.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 中部：筛选 + 职位列表 */}
      <Card
        bordered={false}
        style={{
          marginBottom: 16,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索职位名称"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="所属序列"
              value={searchSequence}
              onChange={(v) => setSearchSequence(v)}
              allowClear
              style={{ width: '100%' }}
              options={SEQUENCE_CONFIG.map((s) => ({
                value: s.key,
                label: s.name,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : filtered}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
          }}
          locale={{
            emptyText: isError ? (
              <Result
                status={isPermissionError ? '403' : 'error'}
                title={isPermissionError ? '无权限' : '加载失败'}
                subTitle={
                  isPermissionError
                    ? '您没有权限查看职位数据，请联系管理员'
                    : '请检查后端服务'
                }
              />
            ) : (
              <Empty description="暂无职位数据" />
            ),
          }}
        />
      </Card>

      {/* 下部：职位序列职级对照表 */}
      <Card
        bordered={false}
        title={
          <Text strong style={{ fontSize: 16, fontWeight: 600 }}>
            职位序列职级对照表
          </Text>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[16, 16]}>
          {SEQUENCE_CONFIG.map((seq) => (
            <Col xs={24} sm={12} md={8} key={seq.key}>
              <div
                style={{
                  backgroundColor: seq.bgColor,
                  borderRadius: 8,
                  padding: '20px',
                  border: `1px solid ${seq.lightColor}`,
                  height: '100%',
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 15, color: seq.color }}>
                    {seq.fullName}
                  </Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, color: '#595959' }}>
                    职级范围：{seq.levelRange}
                  </Text>
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {seq.levels.map((level) => (
                    <div
                      key={level.code}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: seq.color,
                          flexShrink: 0,
                        }}
                      />
                      <Text style={{ fontSize: 14, color: '#262626' }}>
                        <span style={{ fontWeight: 600 }}>{level.code}</span>
                        {level.name}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <PositionFormModal
        open={modalOpen}
        mode={modalMode}
        positionId={modalPositionId}
        initialValues={modalInitialValues}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
        }}
      />
    </div>
  );
};

export default PositionManagement;
