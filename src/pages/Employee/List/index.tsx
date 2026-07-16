import {
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { listEmployeesUsingGet } from '@/api/employeeController';
import {
  listPositionsUsingGet,
} from '@/api/positionController';
import { getMyProfileUsingGet } from '@/api/employeeController';
import {
  DownOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  message,
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
import { hasPermission, getDataScope } from '@/utils/permission';

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

/** 在部门树中查找指定节点及其所有子节点 ID */
const collectSubDeptIds = (
  nodes: API.DepartmentTreeVO[],
  targetId: number,
): number[] => {
  for (const node of nodes) {
    if (node.id === targetId) {
      const ids: number[] = [];
      const walk = (n: API.DepartmentTreeVO) => {
        ids.push(n.id!);
        n.children?.forEach(walk);
      };
      walk(node);
      return ids;
    }
    if (node.children?.length) {
      const found = collectSubDeptIds(node.children, targetId);
      if (found.length) return found;
    }
  }
  return [];
};

const EmployeeListPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const dataScope = getDataScope(currentUser);
  const dataScopeDesc = initialState?.dataScopeDesc ?? '';
  const can = (code: string) => hasPermission(currentUser, code);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [form] = Form.useForm();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<API.EmployeeVO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 数据源
  const [deptTreeData, setDeptTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [positionOptions, setPositionOptions] = useState<API.PositionVO[]>([]);
  const [myDeptIds, setMyDeptIds] = useState<number[] | null>(null); // null=全部部门, []=加载中, number[]=限制的部门

  // 部门树（全量 vs 受限）
  const treeSelectData = useMemo(() => {
    if (!myDeptIds || myDeptIds.length === 0) return buildTreeSelectData(deptTreeData);
    // 过滤部门树，只保留 myDeptIds 中的节点
    const filterTree = (nodes: API.DepartmentTreeVO[]): API.DepartmentTreeVO[] =>
      nodes
        .filter((n) => myDeptIds.includes(n.id!))
        .map((n) => ({
          ...n,
          children: n.children?.length ? filterTree(n.children) : [],
        }));
    return buildTreeSelectData(filterTree(deptTreeData));
  }, [deptTreeData, myDeptIds]);

  // 加载数据源 + 数据范围
  useEffect(() => {
    (async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          getDepartmentTreeUsingGet(),
          listPositionsUsingGet({}),
        ]);
        const fullTree: API.DepartmentTreeVO[] = (deptRes as any)?.data ?? [];
        setDeptTreeData(fullTree);
        setPositionOptions((posRes as any)?.data ?? []);

        // 部门主管(dataScope=3)：获取本人部门，限制部门选择器
        if (dataScope === 3) {
          try {
            const profileRes = await getMyProfileUsingGet();
            const myDeptId = (profileRes as any)?.data?.departmentId as number | undefined;
            if (myDeptId && fullTree.length) {
              const ids = collectSubDeptIds(fullTree, myDeptId);
              setMyDeptIds(ids.length ? ids : [myDeptId]);
              // 自动预填部门过滤
              form.setFieldsValue({ departmentIds: ids.length ? ids : [myDeptId] });
            } else {
              setMyDeptIds([]);
            }
          } catch {
            setMyDeptIds([]);
          }
        } else {
          setMyDeptIds(null); // 全部部门
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // 加载列表数据
  const fetchData = useCallback(
    async (page = 1, size = 20) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const values = form.getFieldsValue();
        const params: API.listEmployeesUsingGETParams = { page, size };

        if (values.keyword) params.keyword = values.keyword;
        if (values.departmentIds?.length) {
          params.departmentIds = values.departmentIds.map(Number);
        } else if (myDeptIds && myDeptIds.length > 0) {
          // 部门主管未手动选择时，默认限制为本部门范围
          params.departmentIds = myDeptIds;
        }
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
        setErrorMsg(e.message ?? '加载员工列表失败');
        message.error(e.message ?? '加载员工列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form, myDeptIds],
  );

  // 初始加载
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => fetchData(1, pagination.pageSize);
  const handleReset = () => {
    form.resetFields();
    fetchData(1, pagination.pageSize);
  };
  const handleTableChange = (pag: any) => fetchData(pag.current, pag.pageSize);

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
      render: (text: string) => (text ? text.slice(0, 10) : '-'),
    },
    // 操作列：仅 HR/管理员可见（需要 employee:edit 或 employee:delete）
    ...(can('employee:edit') || can('employee:delete')
      ? [{
          title: '操作',
          key: 'action',
          width: 200,
          render: (_: any, record: API.EmployeeVO) => {
            const isActive = record.status === 1 || record.status === 2;
            return (
              <Space size="small">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => history.push(`/employee/detail/${record.id}`)}
                >
                  查看
                </Button>
                {can('employee:edit') && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => history.push(`/employee/edit/${record.id}`)}
                  >
                    编辑
                  </Button>
                )}
                {can('employee:delete') && isActive && (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'transfer',
                          label: '调岗',
                          onClick: () => message.info('调岗功能开发中'),
                        },
                        {
                          key: 'resign',
                          label: '离职',
                          danger: true,
                          onClick: () => message.info('离职功能开发中'),
                        },
                      ],
                    }}
                  >
                    <Button type="link" size="small">
                      更多 <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </Space>
            );
          },
        } as ColumnsType<API.EmployeeVO>[number]]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 数据范围提示 */}
      {dataScope === 3 && (
        <Alert
          message={
            <span>
              当前数据范围：<strong>{dataScopeDesc || '本部门及下属'}</strong>
              ，仅展示您管辖范围内的员工数据
            </span>
          }
          type="info"
          showIcon
          closable
          style={{ borderRadius: 10 }}
        />
      )}

      {/* 高级搜索区 */}
      <Card size="small" style={{ borderRadius: 10 }}>
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
                      placeholder={myDeptIds ? '已限定本部门范围' : '请选择部门（多选）'}
                      multiple
                      allowClear
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_ALL}
                      treeDefaultExpandAll={false}
                      disabled={!!(myDeptIds && myDeptIds.length > 0)}
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

      {/* 错误提示 */}
      {errorMsg && (
        <Card
          size="small"
          style={{
            border: '1px solid #ffccc7',
            borderRadius: 10,
            background: '#fff2f0',
          }}
          bodyStyle={{ padding: '14px 20px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            <strong style={{ color: '#ff4d4f' }}>数据加载失败：</strong>
            <span style={{ color: '#595959' }}>{errorMsg}</span>
          </span>
        </Card>
      )}

      {/* 员工列表 */}
      <Card
        size="small"
        title={
          <Space>
            <span>员工列表</span>
            {dataScope === 3 && (
              <Tag color="blue" style={{ fontWeight: 400 }}>
                {dataScopeDesc || '本部门及下属'}
              </Tag>
            )}
          </Space>
        }
        style={{ borderRadius: 10 }}
        extra={
          can('employee:add') && (
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
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <p style={{ color: '#8c8c8c', marginTop: 12, fontSize: 14 }}>
                  暂无员工数据
                </p>
                <p style={{ color: '#bfbfbf', fontSize: 12 }}>
                  {dataScope === 3
                    ? '您的部门范围内暂无员工'
                    : can('employee:add')
                      ? '点击上方「新增员工」按钮添加'
                      : '请调整筛选条件后重新搜索'}
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default EmployeeListPage;
