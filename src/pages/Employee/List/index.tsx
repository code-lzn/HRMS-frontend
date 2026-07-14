import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { listEmployeesUsingGet } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import {
  DownOutlined,
  PlusOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  App,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useModel } from '@umijs/max';

const { RangePicker } = DatePicker;

/** 在职状态枚举 */
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

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

const EmployeeListPage: React.FC = () => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const userRole: string = currentUser?.userRole ?? '';

  const isHR = userRole === 'hr' || userRole === 'system_admin';
  const isDeptManager = userRole === 'dept_manager';

  const [form] = Form.useForm();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<API.EmployeeVO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 数据源
  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);

  const treeSelectData = useMemo(() => buildTreeSelectData(deptTreeData), [deptTreeData]);

  // 加载数据源
  useEffect(() => {
    (async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          getDepartmentTreeUsingGet(),
          listPositionsUsingGet({}),
        ]);
        setDeptTreeData((deptRes as any)?.data ?? []);
        setPositionOptions((posRes as any)?.data ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  // 加载列表数据
  const fetchData = useCallback(
    async (page = 1, size = 20) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: API.listEmployeesUsingGETParams = {
          page,
          size,
        };
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
        setPagination({
          current: data?.current ?? page,
          pageSize: data?.size ?? size,
          total: data?.total ?? 0,
        });
      } catch (e: any) {
        message.error(e.message ?? '加载员工列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  // 初始加载
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData(1, pagination.pageSize);
  };

  const handleTableChange = (pag: any) => {
    fetchData(pag.current, pag.pageSize);
  };

  // 列定义
  const columns: ColumnsType<API.EmployeeVO> = [
    {
      title: '姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 120,
      render: (text: string, record: API.EmployeeVO) => (
        <a onClick={() => history.push(`/employee/detail/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 120,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      render: (text: string) => text ?? '-',
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 140,
      render: (text: string) => text ?? '-',
    },
    {
      title: '在职状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number, record: API.EmployeeVO) => {
        const s = STATUS_MAP[status];
        return s ? <Tag color={s.color}>{record.statusDesc ?? s.text}</Tag> : '-';
      },
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      render: (text: string) => text ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: API.EmployeeVO) => {
        const isActive = record.status === 1 || record.status === 2;
        return (
          <Space size="small">
            <a onClick={() => history.push(`/employee/detail/${record.id}`)}>查看</a>
            {(isHR || isDeptManager) && (
              <a onClick={() => history.push(`/employee/edit/${record.id}`)}>编辑</a>
            )}
            {isHR && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'transfer',
                      label: '调岗',
                      disabled: !isActive,
                      onClick: () => message.info('调岗功能开发中'),
                    },
                    {
                      key: 'resign',
                      label: '离职',
                      disabled: !isActive,
                      danger: true,
                      onClick: () => message.info('离职功能开发中'),
                    },
                  ],
                }}
              >
                <a>
                  更多 <DownOutlined />
                </a>
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 高级搜索区 */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>高级搜索</span>
          <Button
            type="link"
            icon={searchOpen ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? '收起' : '展开'}
          </Button>
        </div>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="keyword" label="关键词" style={{ marginBottom: searchOpen ? 16 : 0 }}>
                <Input placeholder="姓名 / 工号 / 手机号" allowClear onPressEnter={handleSearch} />
              </Form.Item>
            </Col>
            {searchOpen && (
              <>
                <Col span={6}>
                  <Form.Item name="departmentIds" label="部门">
                    <TreeSelect
                      treeData={treeSelectData}
                      placeholder="请选择部门（多选）"
                      multiple
                      allowClear
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_ALL}
                      treeDefaultExpandAll={false}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="positionIds" label="职位">
                    <Select
                      mode="multiple"
                      placeholder="请选择职位（多选）"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                      }
                      options={positionOptions.map((p) => ({ value: p.id, label: p.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="statuses" label="在职状态">
                    <Select
                      mode="multiple"
                      placeholder="请选择状态"
                      allowClear
                      options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="hireDateRange" label="入职日期">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
          <Row justify="end" style={{ marginTop: searchOpen ? 0 : -8 }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* 员工列表 */}
      <Card
        size="small"
        title="员工列表"
        extra={
          isHR && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => history.push('/employee/add')}
            >
              新增员工
            </Button>
          )
        }
      >
        <Table<API.EmployeeVO>
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 960 }}
        />
      </Card>
    </div>
  );
};

export default EmployeeListPage;
