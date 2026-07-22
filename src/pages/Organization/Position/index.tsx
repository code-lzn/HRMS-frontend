import {
  deletePositionUsingPost,
  getSequencesUsingGet,
  listPositionsUsingGet,
} from '@/api/positionController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Card, Col, message, Modal, Row, Space, Tabs, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import { extractData, getErrorMessage } from '@/utils/apiHelper';
import { COLORS, SEQUENCE_COLORS, SEQUENCE_DATA, SEQUENCE_STATS } from '../styles';
import PositionFormModal from './components/PositionFormModal';

/** 序列数值 → 编码映射 */
const SEQ_CODE_MAP: Record<number, string> = { 1: 'M', 2: 'P', 3: 'S' };

// Tab 映射
const TAB_MAP: Record<string, number | undefined> = {
  all: undefined,
  m: 1,
  p: 2,
  s: 3,
};

const PositionPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const canManage = hasPermission(currentUser, 'org:manage');

  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [positions, setPositions] = useState<API.PositionVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [sequences, setSequences] = useState<API.SequenceLevelVO[]>([]);
  const [treeData, setTreeData] = useState<API.DepartmentTreeVO[]>([]);

  // 弹窗状态
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editRecord, setEditRecord] = useState<API.PositionVO | null>(null);

  /** 加载数据 */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: API.listPositionsUsingGETParams = {};
      const seqVal = TAB_MAP[activeTab];
      if (seqVal !== undefined) params.sequence = seqVal;
      const res = await listPositionsUsingGet(params);
      setPositions(extractData<API.PositionVO[]>(res, []));
    } catch (e: unknown) {
      console.error('pages/Organization/Position/index.tsx', e);
      message.error(getErrorMessage(e, '加载职位列表失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [activeTab]);

  /** 加载部门树和序列数据 */
  useEffect(() => {
    (async () => {
      try {
        const [treeRes, seqRes] = await Promise.all([
          getDepartmentTreeUsingGet(),
          getSequencesUsingGet(),
        ]);
        setTreeData(extractData<API.DepartmentTreeVO[]>(treeRes, []));
        setSequences(extractData<API.SequenceLevelVO[]>(seqRes, []));
      } catch (e: unknown) { console.error('pages/Organization/Position/index.tsx', e);
        message.error(getErrorMessage(e, '加载基础数据失败'));
      }
    })();
  }, []);

  /** 统计卡片数据 */
  const statsData = useMemo(() => {
    return SEQUENCE_STATS.map((stat) => ({
      ...stat,
      count: positions.filter((p) => SEQ_CODE_MAP[p.sequence ?? -1] === stat.code).length,
    }));
  }, [positions]);

  /** 删除确认 */
  const handleDelete = (record: API.PositionVO) => {
    Modal.confirm({
      title: '确定删除该职位吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除职位「${record.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePositionUsingPost({ id: record.id });
          message.success('删除成功');
          setCurrentPage(1);
          fetchData();
        } catch (e: unknown) {
          message.error(getErrorMessage(e, '删除失败'));
        }
      },
    });
  };

  /** 新增 */
  const handleAdd = () => {
    setFormMode('add');
    setEditRecord(null);
    setFormOpen(true);
  };

  /** 编辑 */
  const handleEdit = (record: API.PositionVO) => {
    setFormMode('edit');
    setEditRecord(record);
    setFormOpen(true);
  };

  /** 弹窗保存成功 */
  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchData();
  };

  // ===== 表格列定义 =====
  const columns: ProColumns<API.PositionVO>[] = useMemo(() => [
    {
      title: '职位名称',
      dataIndex: 'name',
      width: 150,
      render: (text) => <span style={{ fontWeight: 500, color: COLORS.textPrimary }}>{text}</span>,
    },
    {
      title: '序列',
      dataIndex: 'sequenceName',
      width: 100,
      render: (_, record) => {
        const code = SEQ_CODE_MAP[record.sequence ?? -1];
        const c = SEQUENCE_COLORS[code];
        if (!c) return <Tag>{record.sequenceName ?? '-'}</Tag>;
        return (
          <Tag
            style={{
              background: c.lightBg,
              color: c.color,
              border: `1px solid ${c.border}`,
              borderRadius: 9999,
              padding: '2px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {record.sequenceName}
          </Tag>
        );
      },
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      width: 130,
      render: (text) => text || <span style={{ color: COLORS.textMuted }}>全公司通用</span>,
    },
    {
      title: '职级范围',
      dataIndex: 'levelRange',
      width: 110,
      render: (text) => (
        <Tag style={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          {text ?? '-'}
        </Tag>
      ),
    },
    {
      title: '试用期',
      dataIndex: 'defaultProbationMonths',
      width: 80,
      render: (text) => `${text ?? '-'}个月`,
    },
    {
      title: '操作',
      width: 130,
      fixed: 'right' as const,
      render: (_, record) =>
        canManage ? (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              style={{ color: COLORS.primaryBlue, padding: '4px 8px' }}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: '4px 8px' }}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Space>
        ) : null,
    },
  ], [canManage]);

  // ===== Tab 配置 =====
  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'm', label: '管理序列' },
    { key: 'p', label: '专业序列' },
    { key: 's', label: '支持序列' },
  ];

  return (
    <div>
      {/* ===== 页面标题 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', margin: 0 }}>
            职位管理
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            管理公司职位体系与职级对照
          </p>
        </div>
        {canManage && (
          <Button type="primary" onClick={handleAdd}>
            新增职位
          </Button>
        )}
      </div>

      {/* ===== 统计卡片 ===== */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {statsData.map((stat) => (
          <Col span={8} key={stat.code}>
            <Card
              style={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Tag
                  style={{
                    borderRadius: 9999,
                    padding: '2px 12px',
                    fontSize: 12,
                    fontWeight: 500,
                    background: stat.lightBg,
                    color: stat.color,
                    border: `1px solid ${stat.color}22`,
                  }}
                >
                  {stat.label}
                </Tag>
                <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>
                  {stat.count}
                </span>
              </div>
              <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 500, marginTop: 8 }}>
                {stat.name}
              </div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  职级范围：{stat.levelRange}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {(() => {
                    const seqInfo = SEQUENCE_DATA[stat.code as keyof typeof SEQUENCE_DATA];
                    return seqInfo?.levels.map((level) => (
                      <Tag
                        key={level}
                        style={{
                          fontSize: 10, lineHeight: '18px', padding: '0 6px',
                          borderRadius: 4, margin: 0,
                          background: stat.lightBg,
                          color: stat.color,
                          border: `1px solid ${stat.color}33`,
                        }}
                        title={seqInfo.levelLabels?.[level] ?? level}
                      >
                        {level}
                      </Tag>
                    ));
                  })()}
                </div>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {({ M: '负责管理团队与业务决策', P: '负责专业技术与创新研发', S: '提供职能支持与后勤保障' })[stat.code] ?? ''}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== 数据表格 ===== */}
      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Tabs */}
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #e2e8f0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            items={tabItems}
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Table */}
        <ProTable<API.PositionVO>
          columns={columns}
          dataSource={positions}
          rowKey="id"
          search={false}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: 10,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `共 ${total} 条`,
          }}
          toolBarRender={false}
          options={false}
          style={{ padding: '0 4px' }}
        />
      </Card>

      {/* ===== 新增/编辑职位弹窗 ===== */}
      <PositionFormModal
        open={formOpen}
        mode={formMode}
        editRecord={editRecord}
        sequences={sequences}
        treeData={treeData}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default PositionPage;
