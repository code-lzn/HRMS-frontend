import {
  deleteItemUsingDelete,
  getAccountDetailUsingGet,
} from '@/api/salaryManageController';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
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

interface AccountDetailDrawerProps {
  open: boolean;
  accountId: number | null;
  onClose: () => void;
  onRefreshList: () => void;
}

const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({
  open,
  accountId,
  onClose,
  onRefreshList,
}) => {
  const [account, setAccount] = useState<API.SalaryAccountVO | null>(null);
  const [loading, setLoading] = useState(false);

  // 项目弹窗
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemFormMode, setItemFormMode] = useState<'add' | 'edit'>('add');
  const [editItem, setEditItem] = useState<API.SalaryItemVO | null>(null);

  useEffect(() => {
    if (!open || !accountId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await getAccountDetailUsingGet({ id: accountId });
        setAccount((res as any)?.data ?? null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [open, accountId]);

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
          // 重新加载
          const res = await getAccountDetailUsingGet({ id: accountId! });
          setAccount((res as any)?.data ?? null);
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
    { title: '项目名称', dataIndex: 'name', width: 130 },
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
      title: '公式/规则',
      dataIndex: 'formula',
      width: 160,
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
      width: 120,
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
    <>
      <Drawer
        title="账套详情"
        open={open}
        onClose={onClose}
        width={640}
      >
        <Spin spinning={loading}>
          {!account ? (
            <Empty description="加载失败" />
          ) : (
            <>
              <Descriptions
                title="基本信息"
                column={2}
                size="small"
                bordered
                style={{ marginBottom: 24 }}
              >
                <Descriptions.Item label="账套名称">
                  {account.name ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="适用范围类型">
                  <Tag>{SCOPE_TYPE_MAP[account.scopeType ?? 0] ?? '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="适用ID">
                  {account.scopeIds || '不限制'}
                </Descriptions.Item>
                <Descriptions.Item label="生效日期">
                  {account.effectiveDate ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {account.createTime ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {account.updateTime ?? '-'}
                </Descriptions.Item>
              </Descriptions>

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
                  icon={<PlusOutlined />}
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
                locale={{ emptyText: '暂无工资项目' }}
              />
            </>
          )}
        </Spin>
      </Drawer>

      <ItemFormModal
        open={itemFormOpen}
        mode={itemFormMode}
        accountId={accountId!}
        editRecord={editItem}
        onClose={() => setItemFormOpen(false)}
        onSuccess={() => {
          setItemFormOpen(false);
          // 重新加载
          if (accountId) {
            getAccountDetailUsingGet({ id: accountId }).then((res) => {
              setAccount((res as any)?.data ?? null);
            });
          }
        }}
      />
    </>
  );
};

export default AccountDetailDrawer;
