import { addItemUsingPost, deleteItemUsingDelete, getAccountUsingGet, listItemsUsingGet, sortItemsUsingPut, updateItemUsingPut } from '@/api/salaryController';
import { SALARY_ITEM_TYPE_MAP, SCOPE_TYPE_MAP, TAXABLE_MAP } from '@/constants/enums';
import { ArrowLeftOutlined, PlusOutlined, BankOutlined, CalculatorOutlined, TagOutlined, UpOutlined, DownOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Card, Col, Descriptions, Empty, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

const ITEM_TYPE_COLOR_MAP: Record<number, string> = { 1: 'blue', 2: 'cyan', 3: 'orange', 4: 'red', 5: 'volcano', 6: 'magenta' };
const heroStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff' };
const statBox: React.CSSProperties = { background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', minWidth: 100 };

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = id!;
  const [account, setAccount] = useState<API.SalaryAccountVO | null>(null);
  const [items, setItems] = useState<API.SalaryItemVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<API.SalaryItemVO | null>(null);
  const [itemForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [accRes, itemRes] = await Promise.all([getAccountUsingGet(accountId), listItemsUsingGet(accountId)]);
    setAccount(accRes.data ?? null);
    setItems((itemRes.data as any) ?? []);
    setLoading(false);
  }, [accountId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddItem = () => { setEditingItem(null); itemForm.resetFields(); setItemModalOpen(true); };
  const handleEditItem = (item: API.SalaryItemVO) => { setEditingItem(item); itemForm.setFieldsValue(item); setItemModalOpen(true); };

  const handleItemModalOk = async () => {
    if (!accountId) { message.error('账套ID无效'); return; }
    try {
      const values = await itemForm.validateFields(); setSaving(true);
      if (editingItem) { await updateItemUsingPut(editingItem.id!, { ...values, id: editingItem.id }); message.success('项目已更新'); }
      else { await addItemUsingPost(accountId, values); message.success('项目已添加'); }
      setItemModalOpen(false); await fetchData();
    } catch (err: any) { if (err?.errorFields) message.warning('请填写所有必填项'); else message.error(err?.message || '操作失败'); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async (itemId: number) => { await deleteItemUsingDelete(itemId); message.success('项目已删除'); await fetchData(); };

  const handleSort = async (index: number, direction: 'up' | 'down') => {
    const ti = direction === 'up' ? index - 1 : index + 1;
    if (ti < 0 || ti >= items.length) return;
    const ni = [...items]; [ni[index], ni[ti]] = [ni[ti], ni[index]];
    await sortItemsUsingPut(accountId, { itemIds: ni.map((i) => i.id!) });
    message.success('排序已更新'); await fetchData();
  };

  const itemColumns = [
    { title: '', dataIndex: 'sortOrder', width: 70, render: (_: any, __: API.SalaryItemVO, i: number) => (
      <Space size={1}>
        <Button size="small" type="text" disabled={i === 0} onClick={() => handleSort(i, 'up')}><UpOutlined style={{ fontSize: 10 }} /></Button>
        <Button size="small" type="text" disabled={i === items.length - 1} onClick={() => handleSort(i, 'down')}><DownOutlined style={{ fontSize: 10 }} /></Button>
      </Space>
    )},
    { title: '项目名称', dataIndex: 'name', width: 180, render: (v: string) => <span style={{ fontWeight: 500 }}><CalculatorOutlined style={{ marginRight: 6, color: '#1677ff' }} />{v}</span> },
    { title: '类型', dataIndex: 'itemType', width: 100, render: (v: number) => <Tag color={ITEM_TYPE_COLOR_MAP[v] || 'default'}>{SALARY_ITEM_TYPE_MAP[v] || '-'}</Tag> },
    { title: '公式', dataIndex: 'formula', width: 160, ellipsis: true, render: (v: string) => v ? <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{v}</code> : <span style={{ color: '#ccc' }}>-</span> },
    { title: '计税', dataIndex: 'isTaxable', width: 70, render: (v: number) => <Tag color={v ? 'blue' : 'default'}>{TAXABLE_MAP[v!] || '-'}</Tag> },
    { title: '操作', key: 'action', width: 120, render: (_: any, r: API.SalaryItemVO) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditItem(r)}>编辑</Button>
        <Popconfirm title="确认删除？" description={`删除「${r.name}」？`} onConfirm={() => handleDeleteItem(r.id!)} okText="删除" okButtonProps={{ danger: true }} cancelText="取消">
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  // 按类型统计
  const typeStats: Record<number, number> = {};
  items.forEach((i) => { typeStats[i.itemType!] = (typeStats[i.itemType!] || 0) + 1; });

  return (
    <PageContainer title="账套详情" extra={<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/salary/accounts')}>返回列表</Button>} loading={loading}>
      {account && (<>
        <div style={heroStyle}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 1 }}>薪资账套</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}><BankOutlined style={{ marginRight: 8 }} />{account.name}</div>
            <Tag color="purple" style={{ marginTop: 8 }}>{SCOPE_TYPE_MAP[account.scopeType!] || '-'}</Tag>
          </div>
          <Row gutter={24}>
            <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>工资项目</div><div style={{ fontSize: 18, fontWeight: 700 }}>{items.length} 项</div></div></Col>
            <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>生效日期</div><div style={{ fontSize: 18, fontWeight: 700 }}>{account.effectiveDate ? dayjs(account.effectiveDate).format('YYYY-MM-DD') : '-'}</div></div></Col>
            <Col><div style={statBox}><div style={{ fontSize: 11, opacity: 0.7 }}>适用对象</div><div style={{ fontSize: 18, fontWeight: 700 }}>{account.scopeIds && Array.isArray(account.scopeIds) && account.scopeIds.length > 0 ? `${account.scopeIds.length} 个` : '全员'}</div></div></Col>
          </Row>
        </div>

        {/* 基本信息 + 类型分布 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={16}>
            <Card title={<span><BankOutlined style={{ marginRight: 6 }} />基本信息</span>} size="small" style={{ borderRadius: 10, borderLeft: '4px solid #1677ff' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="账套名称"><strong>{account.name}</strong></Descriptions.Item>
                <Descriptions.Item label="适用范围"><Tag color="purple">{SCOPE_TYPE_MAP[account.scopeType!] || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label="适用对象ID">{(account.scopeIds && Array.isArray(account.scopeIds) && account.scopeIds.length > 0) ? account.scopeIds.join(', ') : '全员适用'}</Descriptions.Item>
                <Descriptions.Item label="生效日期">{account.effectiveDate ? dayjs(account.effectiveDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{account.createTime ? dayjs(account.createTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{account.updateTime ? dayjs(account.updateTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title={<span><InfoCircleOutlined style={{ marginRight: 6 }} />类型分布</span>} size="small" style={{ borderRadius: 10, borderLeft: '4px solid #722ed1' }}>
              {Object.keys(typeStats).length === 0 ? <Empty description="暂无项目" /> : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(typeStats).map(([type, count]) => (
                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={ITEM_TYPE_COLOR_MAP[Number(type)]}>{SALARY_ITEM_TYPE_MAP[Number(type)]}</Tag>
                      <span style={{ fontWeight: 600 }}>{count} 项</span>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        <Card title={<span><TagOutlined style={{ marginRight: 6 }} />工资项目</span>} extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddItem} style={{ borderRadius: 6 }}>添加项目</Button>} style={{ borderRadius: 10 }}>
          {items.length === 0 ? <Empty description="暂无工资项目，请点击「添加项目」进行配置" /> : (
            <Table rowKey="id" dataSource={items} columns={itemColumns} pagination={false} size="middle" scroll={{ x: 750 }} rowClassName={(_, idx) => idx! % 2 === 0 ? 'even-row' : ''} />
          )}
        </Card>
      </>)}

      <Modal title={<span>{editingItem ? <><EditOutlined style={{ marginRight: 8 }} />编辑工资项目</> : <><PlusOutlined style={{ marginRight: 8 }} />添加工资项目</>}</span>}
        open={itemModalOpen} onOk={handleItemModalOk} onCancel={() => setItemModalOpen(false)} destroyOnClose confirmLoading={saving}
        okText={editingItem ? '保存' : '添加'} cancelText="取消" width={520}>
        <Form form={itemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="例如：基本工资、绩效奖金" />
          </Form.Item>
          <Form.Item name="itemType" label="项目类型" rules={[{ required: true, message: '请选择项目类型' }]}>
            <Select placeholder="请选择类型" options={Object.entries(SALARY_ITEM_TYPE_MAP).map(([k, v]) => ({ label: v, value: Number(k) }))} />
          </Form.Item>
          <Form.Item name="formula" label="计算公式" extra="使用 salaryItems 对象中的字段名">
            <Input placeholder="例如：baseSalary（留空则为固定金额）" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="sortOrder" label="排序号"><InputNumber min={1} style={{ width: '100%' }} placeholder="越小越靠前" /></Form.Item></Col>
            <Col span={12}><Form.Item name="isTaxable" label="是否计税"><Select options={[{ label: '计税', value: 1 }, { label: '不计税', value: 0 }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AccountDetailPage;
