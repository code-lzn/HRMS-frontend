import {
  copyAccountUsingPost,
  deleteAccountUsingDelete,
  listAccountsUsingGet,
} from '@/api/salaryManageController';
import {
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import usePermission from '@/hooks/usePermission';
import AccountDetailDrawer from './components/AccountDetailDrawer';
import AccountFormModal from './components/AccountFormModal';

const { Title, Text } = Typography;
const { confirm } = Modal;

const SCOPE_TYPE_MAP: Record<number, string> = {
  1: '部门',
  2: '职位',
  3: '职级',
};

const ITEM_TYPE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '固定收入', color: 'green' },
  2: { label: '变动收入', color: 'blue' },
  3: { label: '考勤扣款', color: 'orange' },
  4: { label: '社保扣除', color: 'red' },
  5: { label: '公积金扣除', color: 'purple' },
  6: { label: '个税', color: 'default' },
};

const AccountPage: React.FC = () => {
  const { canAuditSalary } = usePermission();

  const [accounts, setAccounts] = useState<API.SalaryAccountVO[]>([]);
  const [loading, setLoading] = useState(false);

  // 展开的账套卡片 ID 集合
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // 账套弹窗
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editRecord, setEditRecord] = useState<API.SalaryAccountVO | null>(null);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAccountsUsingGet();
      setAccounts((res as any)?.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (record: API.SalaryAccountVO) => {
    confirm({
      title: '确定删除该账套吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除账套「${record.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAccountUsingDelete({ id: record.id! });
          message.success('删除成功');
          loadAccounts();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  const handleCopy = async (record: API.SalaryAccountVO) => {
    try {
      await copyAccountUsingPost({ id: record.id! });
      message.success('复制成功');
      loadAccounts();
    } catch (e: any) {
      message.error(e.message ?? '复制失败');
    }
  };

  return (
    <div>
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
            薪资账套管理
          </Title>
          <Text type="secondary">
            配置工资模板，定义薪资构成与计算规则
          </Text>
        </div>
        {canAuditSalary && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setFormMode('add');
              setEditRecord(null);
              setFormOpen(true);
            }}
          >
            新建账套
          </Button>
        )}
      </div>

      {/* 卡片列表 */}
      <Spin spinning={loading}>
        {accounts.length === 0 && !loading ? (
          <Empty description="暂无薪资账套，点击右上角新建" />
        ) : (
          <Row gutter={[16, 16]}>
            {accounts.map((account) => {
              const expanded = expandedIds.has(account.id!);
              const items = account.items ?? [];
              return (
                <Col span={24} key={account.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                    }}
                    bodyStyle={{ padding: '20px 24px' }}
                  >
                    {/* 卡片主体 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {/* 左侧：图标 + 信息 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                        {/* 图标 */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            color: '#1677ff',
                            flexShrink: 0,
                          }}
                        >
                          ¥
                        </div>

                        {/* 信息 */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 16 }}>
                              {account.name}
                            </Text>
                            <Tag color="green" style={{ borderRadius: 4 }}>
                              启用
                            </Tag>
                          </div>
                          <Space size={16} style={{ fontSize: 13, color: '#8c8c8c' }}>
                            <span>
                              适用：{SCOPE_TYPE_MAP[account.scopeType ?? 0] ?? '-'}
                              {account.scopeIds ? ` (${account.scopeIds})` : ' (全部)'}
                            </span>
                            <span>生效：{account.effectiveDate ?? '-'}</span>
                            <span>{items.length} 个工资项目</span>
                          </Space>
                        </div>
                      </div>

                      {/* 右侧：操作 */}
                      <Space size={4} style={{ flexShrink: 0 }}>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setDetailId(account.id!);
                            setDetailOpen(true);
                          }}
                        >
                          查看
                        </Button>
                        {canAuditSalary && (
                          <>
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setFormMode('edit');
                                setEditRecord(account);
                                setFormOpen(true);
                              }}
                            >
                              编辑
                            </Button>
                            <Button
                              type="link"
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => handleCopy(account)}
                            >
                              复制
                            </Button>
                            <Button
                              type="link"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(account)}
                            >
                              删除
                            </Button>
                          </>
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={expanded ? <UpOutlined /> : <DownOutlined />}
                          onClick={() => toggleExpand(account.id!)}
                          style={{ color: '#8c8c8c' }}
                        />
                      </Space>
                    </div>

                    {/* 展开：工资项目明细 */}
                    {expanded && items.length > 0 && (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        <Text
                          strong
                          style={{ fontSize: 13, marginBottom: 8, display: 'block' }}
                        >
                          工资项目明细
                        </Text>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px 24px',
                          }}
                        >
                          {/* 表头 */}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            项目名称
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            类型
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            计算规则
                          </Text>
                          {/* 数据行 */}
                          {items.map((item) => {
                            const typeInfo = ITEM_TYPE_MAP[item.itemType ?? 0];
                            return (
                              <React.Fragment key={item.id}>
                                <Text style={{ fontSize: 13 }}>{item.name}</Text>
                                <span>
                                  <Tag
                                    color={typeInfo?.color ?? 'default'}
                                    style={{ borderRadius: 4, margin: 0 }}
                                  >
                                    {typeInfo?.label ?? '-'}
                                  </Tag>
                                </span>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 13 }}
                                  ellipsis={{ tooltip: item.formula }}
                                >
                                  {item.formula || '直接取值'}
                                </Text>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {expanded && items.length === 0 && (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        <Text type="secondary">暂无工资项目</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>

      {/* 账套详情抽屉（含工资项目管理） */}
      <AccountDetailDrawer
        open={detailOpen}
        accountId={detailId}
        onClose={() => setDetailOpen(false)}
        onRefreshList={loadAccounts}
      />

      {/* 账套表单弹窗 */}
      <AccountFormModal
        open={formOpen}
        mode={formMode}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          loadAccounts();
        }}
      />
    </div>
  );
};

export default AccountPage;
