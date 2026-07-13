import {
  deletePositionUsingPost,
  getSequencesUsingGet,
  listPositionsUsingGet,
} from '@/api/positionController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tabs, Tag, Tooltip, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PositionFormModal from './components/PositionFormModal';
import SequenceDrawer from './components/SequenceDrawer';

const { confirm } = Modal;

const SEQUENCE_TABS = [
  { label: '全部', value: undefined },
  { label: '管理序列 (M)', value: 1 },
  { label: '专业序列 (P)', value: 2 },
  { label: '支持序列 (S)', value: 3 },
];

const SEQUENCE_TAG_COLOR: Record<number, string> = {
  1: 'blue',
  2: 'green',
  3: 'orange',
};

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): any[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

const PositionPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeSequence, setActiveSequence] = useState<number | undefined>(undefined);
  const [filterDeptId, setFilterDeptId] = useState<number | undefined>(undefined);
  const [treeData, setTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [sequences, setSequences] = useState<API.SequenceLevelVO[]>([]);

  // 弹窗状态
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editRecord, setEditRecord] = useState<API.PositionVO | null>(null);
  const [seqDrawerOpen, setSeqDrawerOpen] = useState(false);

  const treeSelectData = useMemo(() => buildTreeSelectData(treeData), [treeData]);

  /** 加载部门树和序列 */
  useEffect(() => {
    (async () => {
      try {
        const [treeRes, seqRes] = await Promise.all([
          getDepartmentTreeUsingGet(),
          getSequencesUsingGet(),
        ]);
        setTreeData((treeRes as any)?.data ?? []);
        setSequences((seqRes as any)?.data ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleDelete = (record: API.PositionVO) => {
    confirm({
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
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  const columns: ProColumns<API.PositionVO>[] = [
    { title: '职位名称', dataIndex: 'name', width: 160 },
    {
      title: '序列',
      dataIndex: 'sequenceName',
      width: 120,
      render: (_, r) => (
        <Tag color={SEQUENCE_TAG_COLOR[r.sequence ?? 0] ?? 'default'}>
          {r.sequenceName ?? '-'}
        </Tag>
      ),
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      width: 140,
      render: (_, r) => r.departmentName ?? '全公司通用',
    },
    {
      title: '职级范围',
      dataIndex: 'levelRange',
      width: 120,
      render: (_, r) => <Tag>{r.levelRange ?? '-'}</Tag>,
    },
    {
      title: '默认试用期',
      dataIndex: 'defaultProbationMonths',
      width: 100,
      render: (_, r) => (r.defaultProbationMonths ? `${r.defaultProbationMonths} 个月` : '-'),
    },
    {
      title: '职位描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      render: (_, r) =>
        r.description ? (
          <Tooltip title={r.description}>
            <span>{r.description.length > 20 ? `${r.description.slice(0, 20)}...` : r.description}</span>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setFormMode('edit');
              setEditRecord(record);
              setFormOpen(true);
            }}
          >
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<API.PositionVO>
        headerTitle="职位管理"
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        request={async () => {
          try {
            const res = await listPositionsUsingGet({
              sequence: activeSequence,
              departmentId: filterDeptId,
            });
            return {
              data: (res as any)?.data ?? [],
              success: true,
              total: (res as any)?.data?.length ?? 0,
            };
          } catch {
            return { data: [], success: false };
          }
        }}
        params={{ activeSequence, filterDeptId }}
        toolbar={{
          filter: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Tabs
                activeKey={activeSequence === undefined ? 'all' : String(activeSequence)}
                onChange={(key) => {
                  setActiveSequence(key === 'all' ? undefined : Number(key));
                }}
                size="small"
                style={{ marginBottom: 0 }}
                items={SEQUENCE_TABS.map((tab) => ({
                  key: tab.value === undefined ? 'all' : String(tab.value),
                  label: tab.label,
                }))}
              />
              <TreeSelect
                treeData={treeSelectData}
                placeholder="按部门筛选"
                allowClear
                value={filterDeptId}
                onChange={(val) => setFilterDeptId(val)}
                style={{ width: 200 }}
                treeDefaultExpandAll
              />
            </div>
          ),
          actions: [
            <Button
              key="seq"
              onClick={() => setSeqDrawerOpen(true)}
            >
              序列职级对照
            </Button>,
            <Button
              key="add"
              type="primary"
              onClick={() => {
                setFormMode('add');
                setEditRecord(null);
                setFormOpen(true);
              }}
            >
              新增职位
            </Button>,
          ],
        }}
      />

      {/* 职位表单弹窗 */}
      <PositionFormModal
        open={formOpen}
        mode={formMode}
        editRecord={editRecord}
        sequences={sequences}
        treeData={treeData}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          actionRef.current?.reload();
        }}
      />

      {/* 序列职级对照抽屉 */}
      <SequenceDrawer open={seqDrawerOpen} onClose={() => setSeqDrawerOpen(false)} />
    </div>
  );
};

export default PositionPage;
