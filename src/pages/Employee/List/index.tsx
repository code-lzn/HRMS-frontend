import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { listEmployeesUsingGet } from '@/api/employeeController';
import { listPositionsUsingGet } from '@/api/positionController';
import {
  DownOutlined, ExclamationCircleOutlined, EyeOutlined,
  PlusOutlined, SearchOutlined, TeamOutlined, UpOutlined,
} from '@ant-design/icons';
import {
  Button, Card, Col, DatePicker, Dropdown, Form, Input, message,
  Row, Select, Space, Table, Tag, TreeSelect,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useModel } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import TransferModal from './components/TransferModal';
import ResignationModal from './components/ResignationModal';

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { value: 1, label: '试用期', color: 'blue' },
  { value: 2, label: '正式', color: 'green' },
  { value: 3, label: '待离职', color: 'orange' },
  { value: 4, label: '已离职', color: 'default' },
];

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  1: { text: '试用期', color: 'blue' },
  2: { text: '正式', color: 'green' },
  3: { text: '待离职', color: 'orange' },
  4: { text: '已离职', color: 'default' },
};

const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!, value: node.id!, title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

const EmployeeListPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const can = (code: string) => hasPermission(currentUser, code);

  const [form] = Form.useForm();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<API.EmployeeVO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [transferTarget, setTransferTarget] = useState<API.EmployeeVO | null>(null);
  const [resignTarget, setResignTarget] = useState<API.EmployeeVO | null>(null);

  const treeSelectData = useMemo(() => buildTreeSelectData(deptTreeData), [deptTreeData]);

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          getDepartmentTreeUsingGet(), listPositionsUsingGet({}),
        ]);
        setDeptTreeData((deptRes as any)?.data ?? []);
        setPositionOptions((posRes as any)?.data ?? []);
      } catch (e) { console.error('pages/Employee/List/index.tsx', e);  /* ignore */ }
    })();
  }, []);

  const fetchData = useCallback(async (page = 1, size = 20) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const values = form.getFieldsValue();
      const params: API.listEmployeesUsingGETParams = { page, size };
      if (values.keyword) params.keyword = values.keyword;
      if (values.departmentIds?.length) params.departmentIds = values.departmentIds.map(Number);
      if (values.positionIds?.length) params.positionIds = values.positionIds.map(Number);
      if (values.statuses?.length) params.statuses = values.statuses.map(Number);
      if (values.hireDateRange?.length === 2) {
        params.hireDateStart = values.hireDateRange[0].format('YYYY-MM-DD');
        params.hireDateEnd = values.hireDateRange[1].format('YYYY-MM-DD');
      }
      const res = await listEmployeesUsingGet(params);
      const data = (res as any)?.data;
      setDataSource(data?.records ?? []);
      setPagination({ current: data?.current ?? page, pageSize: data?.size ?? size, total: data?.total ?? 0 });
    } catch (e: any) {
      setErrorMsg(e.message ?? '加载失败');
      message.error(e.message ?? '加载失败');
    } finally { setLoading(false); }
  }, [form]);

  useEffect(() => { fetchData(); }, []);

  const columns: ColumnsType<API.EmployeeVO> = [
    { title: '姓名', dataIndex: 'employeeName', width: 120,
      render: (text, r) => <a onClick={() => history.push(`/employee/detail/${r.id}`)}>{text}</a> },
    { title: '工号', dataIndex: 'employeeNo', width: 120 },
    { title: '部门', dataIndex: 'departmentName', width: 120, render: (t) => t ?? '-' },
    { title: '职位', dataIndex: 'positionName', width: 140, render: (t) => t ?? '-' },
    { title: '在职状态', dataIndex: 'status', width: 100,
      render: (s, r) => { const m = STATUS_MAP[s]; return m ? <Tag color={m.color}>{r.statusDesc ?? m.text}</Tag> : '-'; } },
    { title: '入职日期', dataIndex: 'hireDate', width: 120, render: (t) => t ?? '-' },
    // 操作列：仅管理员/HR
    ...(can('employee:edit') || can('employee:delete') ? [{
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: API.EmployeeVO) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}
            onClick={() => history.push(`/employee/detail/${record.id}`)}>查看</Button>
          {can('employee:edit') && (
            <Button type="link" size="small"
              onClick={() => history.push(`/employee/edit/${record.id}`)}>编辑</Button>
          )}
          {can('employee:delete') && (
            <Dropdown menu={{ items: [
              { key: 'transfer', label: '调岗', onClick: () => setTransferTarget(record) },
              { key: 'resign', label: '离职', danger: true, onClick: () => setResignTarget(record) },
            ]}}>
              <Button type="link" size="small">更多 <DownOutlined /></Button>
            </Dropdown>
          )}
        </Space>
      ),
    } as ColumnsType<API.EmployeeVO>[number]] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small" style={{ borderRadius: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>高级搜索</span>
          <Button type="link" icon={searchOpen ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setSearchOpen(v => !v)}>{searchOpen ? '收起' : '展开'}</Button>
        </div>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="keyword" label="关键词" style={{ marginBottom: searchOpen ? 16 : 0 }}>
                <Input placeholder="姓名 / 工号 / 手机号" allowClear onPressEnter={() => fetchData()} />
              </Form.Item>
            </Col>
            {searchOpen && (<>
              <Col span={6}>
                <Form.Item name="departmentIds" label="部门">
                  <TreeSelect treeData={treeSelectData} placeholder="请选择部门" multiple allowClear
                    treeCheckable showCheckedStrategy={TreeSelect.SHOW_ALL} treeDefaultExpandAll={false} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="positionIds" label="职位">
                  <Select mode="multiple" placeholder="请选择职位" allowClear showSearch
                    filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
                    options={positionOptions.map(p => ({ value: p.id, label: p.name }))} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="statuses" label="在职状态">
                  <Select mode="multiple" placeholder="请选择状态" allowClear
                    options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hireDateRange" label="入职日期">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </>)}
          </Row>
          <Row justify="end" style={{ marginTop: searchOpen ? 0 : -8 }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchData()}>搜索</Button>
              <Button onClick={() => { form.resetFields(); fetchData(); }}>重置</Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {errorMsg && (
        <Card size="small" style={{ border: '1px solid #ffccc7', borderRadius: 10, background: '#fff2f0' }}
          bodyStyle={{ padding: '14px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            <strong style={{ color: '#ff4d4f' }}>加载失败：</strong>{errorMsg}
          </span>
        </Card>
      )}

      <Card size="small" title="员工列表" style={{ borderRadius: 10 }}
        extra={can('employee:add') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/employee/add')}>新增员工</Button>
        )}>
        <Table<API.EmployeeVO> columns={columns} dataSource={dataSource} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true,
            pageSizeOptions: ['10','20','50'], showTotal: t => `共 ${t} 条` }}
          onChange={p => fetchData(p.current, p.pageSize)} scroll={{ x: 960 }}
          locale={{ emptyText: (
            <div style={{ padding: '40px 0' }}>
              <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <p style={{ color: '#8c8c8c', marginTop: 12 }}>暂无员工数据</p>
            </div>
          )}} />
      </Card>
      {/* 调岗弹窗 */}
      <TransferModal
        open={!!transferTarget} employee={transferTarget!}
        deptTreeData={deptTreeData} positionOptions={positionOptions}
        onCancel={() => setTransferTarget(null)}
        onOk={() => { setTransferTarget(null); fetchData(); }} />

      {/* 离职弹窗 */}
      <ResignationModal
        open={!!resignTarget} employee={resignTarget!}
        onCancel={() => setResignTarget(null)}
        onOk={() => { setResignTarget(null); fetchData(); }} />
    </div>
  );
};

export default EmployeeListPage;
