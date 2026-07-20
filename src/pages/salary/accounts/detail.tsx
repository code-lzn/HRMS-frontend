import {
  addItemUsingPost,
  deleteItemUsingDelete,
  getAccountUsingGet,
  listItemsUsingGet,
  sortItemsUsingPut,
  updateItemUsingPut,
} from '@/api/salaryController';
import {
  SALARY_ITEM_TYPE_MAP,
  SCOPE_TYPE_MAP,
  TAXABLE_MAP,
} from '@/constants/enums';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = id!;
  const [account, setAccount] = useState<API.SalaryAccountVO | null>(null);
  const [items, setItems] = useState<API.SalaryItemVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<API.SalaryItemVO | null>(null);
  const [itemForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [accRes, itemRes] = await Promise.all([
      getAccountUsingGet(accountId),
      listItemsUsingGet(accountId),
    ]);
    setAccount(accRes.data ?? null);
    setItems((itemRes.data as any) ?? []);
    setLoading(false);
  }, [accountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setItemModalOpen(true);
  };

  const handleEditItem = (item: API.SalaryItemVO) => {
    setEditingItem(item);
    itemForm.setFieldsValue(item);
    setItemModalOpen(true);
  };

  const handleItemModalOk = async () => {
    if (!accountId) {
      message.error('账套ID无效，请返回列表重新进入');
      return;
    }
    try {
      const values = await itemForm.validateFields();
      console.log('[addItem] form values:', values, 'accountId:', accountId);
      if (editingItem) {
        await updateItemUsingPut(editingItem.id!, { ...values, id: editingItem.id });
        message.success('更新成功');
      } else {
        await addItemUsingPost(accountId, values);
        message.success('添加成功');
      }
      setItemModalOpen(false);
      await fetchData();
    } catch (err: any) {
      // Ant Design validateFields 失败时返回 { errorFields, values }
      if (err?.errorFields) {
        message.warning('请填写所有必填项');
      } else {
        message.error(err?.message || '操作失败');
      }
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    await deleteItemUsingDelete(itemId);
    message.success('删除成功');
    await fetchData();
  };

  const handleSort = async (sortedIds: number[]) => {
    await sortItemsUsingPut(accountId, { itemIds: sortedIds });
    message.success('排序已保存');
    await fetchData();
  };

  const itemColumns = [
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 160,
      render: (_: any, record: API.SalaryItemVO, index: number) => (
        <Space>
          <Button
            size="small"
            type="text"
            disabled={index === 0}
            onClick={() => {
              const newItems = [...items];
              [newItems[index], newItems[index - 1]] = [
                newItems[index - 1],
                newItems[index],
              ];
              handleSort(newItems.map((i) => i.id!));
            }}
          >
            ↑
          </Button>
          <Button
            size="small"
            type="text"
            disabled={index === items.length - 1}
            onClick={() => {
              const newItems = [...items];
              [newItems[index], newItems[index + 1]] = [
                newItems[index + 1],
                newItems[index],
              ];
              handleSort(newItems.map((i) => i.id!));
            }}
          >
            ↓
          </Button>
          {record.name}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'itemType',
      width: 100,
      render: (_: any, record: API.SalaryItemVO) => (
        <Tag>{SALARY_ITEM_TYPE_MAP[record.itemType!] || '-'}</Tag>
      ),
    },
    { title: '计算公式', dataIndex: 'formula', width: 160, ellipsis: true },
    {
      title: '计税',
      dataIndex: 'isTaxable',
      width: 60,
      render: (_: any, record: API.SalaryItemVO) => (
        <Tag color={record.isTaxable ? 'blue' : 'default'}>
          {TAXABLE_MAP[record.isTaxable!] || '-'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: API.SalaryItemVO) => (
        <Space>
          <a onClick={() => handleEditItem(record)}>编辑</a>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDeleteItem(record.id!)}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="账套详情"
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/salary/accounts')}
        >
          返回列表
        </Button>
      }
      loading={loading}
    >
      {account && (
        <>
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={3} bordered size="small">
              <Descriptions.Item label="账套名称">
                {account.name}
              </Descriptions.Item>
              <Descriptions.Item label="适用范围">
                <Tag>{SCOPE_TYPE_MAP[account.scopeType!] || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生效日期">
                {account.effectiveDate
                  ? dayjs(account.effectiveDate).format('YYYY-MM-DD')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="适用范围ID">
                {account.scopeIds}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {account.createTime
                  ? dayjs(account.createTime).format('YYYY-MM-DD HH:mm')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {account.updateTime
                  ? dayjs(account.updateTime).format('YYYY-MM-DD HH:mm')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="工资项目"
            extra={
              <Button type="primary" size="small" onClick={handleAddItem}>
                添加项目
              </Button>
            }
          >
            <Table
              rowKey="id"
              dataSource={items}
              columns={itemColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}

      <Modal
        title={editingItem ? '编辑工资项目' : '添加工资项目'}
        open={itemModalOpen}
        onOk={handleItemModalOk}
        onCancel={() => setItemModalOpen(false)}
        destroyOnClose
      >
        <Form form={itemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="如：基本工资" />
          </Form.Item>
          <Form.Item
            name="itemType"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select
              options={Object.entries(SALARY_ITEM_TYPE_MAP).map(([k, v]) => ({
                label: v,
                value: Number(k),
              }))}
            />
          </Form.Item>
          <Form.Item name="formula" label="计算公式">
            <Input placeholder="如：baseSalary" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isTaxable" label="是否计税">
            <Select
              options={[
                { label: '计税', value: 1 },
                { label: '不计税', value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AccountDetailPage;
