import {
  deleteItemUsingDelete,
  getAccountDetailUsingGet,
} from '@/api/salaryManageController';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Empty, message, Modal, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import ItemFormModal from './ItemFormModal';

const ITEM_TYPE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '固定收入', color: 'blue' },
  2: { label: '变动收入', color: 'green' },
  3: { label: '考勤扣款', color: 'orange' },
  4: { label: '社保扣除', color: 'red' },
  5: { label: '公积金扣除', color: 'purple' },
  6: { label: '个税', color: 'magenta' },
};

const SCOPE_TYPE_MAP: Record<number, string> = {
  1: '部门',
  2: '职位',
  3: '职级',
};

const { confirm } = Modal;

interface AccountDetailProps {
  accountId: number | null;
  onRefreshList: () => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({ accountId, onRefreshList }) => {
  const [account, setAccount] = useState<API.SalaryAccountVO | null>(null);
  const [loading, setLoading] = useState(false);

  // 项目弹窗状态
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemFormMode, setItemFormMode] = useState<'add' | 'edit'>('add');
  const [editItem, setEditItem] = useState<API.SalaryItemVO | null>(null);

  const loadAccount = useCallback(async () => {
    if (!accountId) {
      setAccount(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getAccountDetailUsingGet({ id: accountId });
      setAccount((res as any)?.data ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  if (!accountId) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
        请从左侧列表选择一个账套
      </div>
    );
  }

  if (loading) return null;

  if (!account) {
    return <Empty description="加载失败" />;
  }

  const handleDeleteItem = (item: API.SalaryItemVO) => {
    confirm({
      title: '确定删除该工资项目吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除「${item.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteItemUsingDelete({ itemId: item.id! });
          message.success('删除成功');
          loadAccount();
          onRefreshList();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  const itemColumns: ColumnsType<API.SalaryItemVO> = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 60,
      align: 'center',
      render: (v) => v ?? '-',
    },
    { title: '项目名称', dataIndex: 'name', width: 140 },
    {
      title: '类型',
      dataIndex: 'itemType',
      width: 90,
      render: (t: number) => {
        const info = ITEM_TYPE_MAP[t];
        return <Tag color={info?.color}>{info?.label ?? '-'}</Tag>;
      },
    },
    {
      title: '公式',
      dataIndex: 'formula',
      width: 180,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '计税',
      dataIndex: 'isTaxable',
      width: 60,
      align: 'center',
      render: (v) => (v === 1 ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setItemFormMode('edit');
              setEditItem(record);
              setItemFormOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 账套基本信息 */}
      <Descriptions
        title="账套基本信息"
        column={2}
        size="small"
        bordered
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="账套名称">{account.name ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="适用范围类型">
          <Tag>{SCOPE_TYPE_MAP[account.scopeType ?? 0] ?? '-'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="适用范围ID">{account.scopeIds || '不限制'}</Descriptions.Item>
        <Descriptions.Item label="生效日期">{account.effectiveDate ?? '-'}</Descriptions.Item>
      </Descriptions>

      {/* 工资项目列表 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0 }}>工资项目列表</h4>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setItemFormMode('add');
            setEditItem(null);
            setItemFormOpen(true);
          }}
        >
          添加项目
        </Button>
      </div>
      <Table<API.SalaryItemVO>
        columns={itemColumns}
        dataSource={account.items ?? []}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{ emptyText: '暂无工资项目，请点击"添加项目"' }}
      />

      {/* 工资项目表单弹窗 */}
      <ItemFormModal
        open={itemFormOpen}
        mode={itemFormMode}
        accountId={accountId}
        editRecord={editItem}
        onClose={() => setItemFormOpen(false)}
        onSuccess={() => {
          setItemFormOpen(false);
          loadAccount();
        }}
      />
    </div>
  );
};

export default AccountDetail;
