import { getEmployeeListUsingGet } from '@/api/employeeController';
import ExportButton from '@/components/ExportButton';
import StatusTag from '@/components/StatusTag';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { usePositionList } from '@/hooks/usePosition';
import { useStatuses } from '@/hooks/useStatuses';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { history, useAccess } from '@umijs/max';
import type { MenuProps } from 'antd';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  Select,
  Space,
  Table,
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface EmployeeRow {
  id: number;
  employeeNo: string;
  name: string;
  departmentName: string;
  positionName: string;
  jobLevel: string;
  status: number;
  statusDesc: string;
  hireDate: string;
}

const EmployeeList: React.FC = () => {
  const access = useAccess();

  // ---- 筛选状态 ----
  const [keyword, setKeyword] = useState('');
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [positionIds, setPositionIds] = useState<number[]>([]);
  const [statuses, setStatuses] = useState<number[]>([]);
  const [hireDateRange, setHireDateRange] = useState<[string, string] | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ---- 数据源 ----
  const { data: treeData } = useDepartmentTree();
  const { data: positionPage } = usePositionList({ current: 1, pageSize: 999 });
  const { data: statusList } = useStatuses();

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 部门树选项
  const deptTreeSelectData = useMemo(() => {
    const convert = (nodes: any[]): any[] =>
      nodes.map((n: any) => ({
        title: n.name,
        value: n.id,
        children: n.children?.length ? convert(n.children) : undefined,
      }));
    return convert(treeData ?? []);
  }, [treeData]);

  // 职位选项
  const positionOptions = useMemo(
    () =>
      (positionPage?.records ?? []).map((p) => ({
        label: p.name,
        value: p.id,
      })),
    [positionPage],
  );

  // 状态选项
  const statusTagOptions = useMemo(
    () =>
      (statusList ?? []).map((s: any) => ({
        label: s.statusName,
        value: s.status,
      })),
    [statusList],
  );

  // ---- 请求列表 ----
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployeeListUsingGet({
        keyword: keyword || undefined,
        departmentIds: departmentIds.length ? departmentIds : undefined,
        positionIds: positionIds.length ? positionIds : undefined,
        statuses: statuses.length ? statuses : undefined,
        hireDateStart: hireDateRange?.[0],
        hireDateEnd: hireDateRange?.[1],
        current: page,
        pageSize,
      });
      setEmployees(((res.data as any)?.records ?? []) as EmployeeRow[]);
      setTotal((res.data as any)?.total ?? 0);
    } catch {
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    keyword,
    departmentIds,
    positionIds,
    statuses,
    hireDateRange,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ---- 重置 ----
  const handleReset = () => {
    setKeyword('');
    setDepartmentIds([]);
    setPositionIds([]);
    setStatuses([]);
    setHireDateRange(null);
    setPage(1);
  };

  // ---- 导出 ----
  const handleExport = async () => {
    message.info('导出功能需要后端提供文件下载接口');
  };

  // ---- 列 ----
  const columns: ColumnsType<EmployeeRow> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string, record) => (
        <a onClick={() => history.push(`/employees/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 130,
      render: (v: string) => (
        <Typography.Text code style={{ fontSize: 13 }}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => <StatusTag status={status} />,
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const isActive = record.status === 1 || record.status === 2;
        const menuItems: MenuProps['items'] = [];

        if (access.canTransferOrResign) {
          menuItems.push({
            key: 'transfer',
            label: '调岗',
            disabled: !isActive,
            onClick: () =>
              history.push(`/hr-change/transfer?employeeId=${record.id}`),
          });
          menuItems.push({
            key: 'resign',
            label: '离职',
            disabled: !isActive,
            onClick: () =>
              history.push(`/hr-change/resignation?employeeId=${record.id}`),
          });
        }

        return (
          <Space>
            <a onClick={() => history.push(`/employees/${record.id}`)}>查看</a>
            <a onClick={() => history.push(`/employees/${record.id}/edit`)}>
              编辑
            </a>
            {menuItems.length > 0 && (
              <Dropdown menu={{ items: menuItems }}>
                <a>更多</a>
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* 标题 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          员工列表
        </Typography.Title>
        <Space>
          <ExportButton onExport={handleExport} />
          <Button icon={<ReloadOutlined />} onClick={fetchEmployees}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 搜索区域 */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          {/* 关键词 */}
          <div style={{ width: 220 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              关键词
            </Typography.Text>
            <Input
              placeholder="姓名/工号/手机号"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              onPressEnter={() => {
                setPage(1);
                fetchEmployees();
              }}
            />
          </div>

          {/* 部门 */}
          <div style={{ width: 240 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              部门
            </Typography.Text>
            <TreeSelect
              placeholder="选择部门"
              treeData={deptTreeSelectData}
              value={departmentIds}
              onChange={(val) => {
                setDepartmentIds(val);
                setPage(1);
              }}
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              allowClear
              maxTagCount={2}
              style={{ width: '100%' }}
            />
          </div>

          {/* 职位 */}
          <div style={{ width: 200 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              职位
            </Typography.Text>
            <Select
              mode="multiple"
              placeholder="选择职位"
              options={positionOptions}
              value={positionIds}
              onChange={(val) => {
                setPositionIds(val);
                setPage(1);
              }}
              allowClear
              maxTagCount={2}
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>

          {/* 入职日期 */}
          <div style={{ width: 260 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              入职日期
            </Typography.Text>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={
                hireDateRange
                  ? [dayjs(hireDateRange[0]), dayjs(hireDateRange[1])]
                  : null
              }
              onChange={(dates) => {
                if (dates?.[0] && dates?.[1]) {
                  setHireDateRange([
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD'),
                  ]);
                } else {
                  setHireDateRange(null);
                }
                setPage(1);
              }}
            />
          </div>

          {/* 在职状态 */}
          <div style={{ width: 200 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              在职状态
            </Typography.Text>
            <Select
              mode="multiple"
              placeholder="选择状态"
              options={statusTagOptions}
              value={statuses}
              onChange={(val) => {
                setStatuses(val);
                setPage(1);
              }}
              allowClear
              maxTagCount={2}
              style={{ width: '100%' }}
            />
          </div>

          {/* 操作按钮 */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              paddingTop: 20,
            }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                setPage(1);
                fetchEmployees();
              }}
            >
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
        </div>
      </Card>

      {/* 表格 */}
      <Card styles={{ body: { padding: '0 24px 24px' } }}>
        <Table<EmployeeRow>
          rowKey="id"
          columns={columns}
          dataSource={employees}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default EmployeeList;
