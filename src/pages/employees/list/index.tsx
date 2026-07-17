import { getEmployeeListUsingGet } from '@/api/employeeController';
import ExportButton from '@/components/ExportButton';
import StatusTag from '@/components/StatusTag';
import { useStatuses } from '@/hooks/useStatuses';
import { ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space, message } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef } from 'react';

/**
 * 员工列表页
 * 6个筛选项 + 8列表格 + 导出Excel
 */
const EmployeeList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  // 在职状态选项
  const { data: statusList } = useStatuses();
  const statusOptions = useMemo(
    () =>
      (statusList ?? []).map((s: any) => ({
        label: s.statusName,
        value: s.status,
      })),
    [statusList],
  );

  // 导出
  const handleExport = async () => {
    message.info('导出功能需要后端提供文件下载接口');
  };

  const columns: ProColumns<API.EmployeeListVO>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (_, record) => (
        <a onClick={() => history.push(`/employees/${record.id}`)}>
          {record.name}
        </a>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 130,
      render: (_, record) => (
        <span style={{ fontFamily: 'monospace' }}>{record.employeeNo}</span>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 140,
      ellipsis: true,
      render: (_, record) => (
        <span title={record.departmentName}>{record.departmentName}</span>
      ),
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <span title={record.positionName}>{record.positionName}</span>
      ),
    },
    {
      title: '职级',
      dataIndex: 'jobLevel',
      key: 'jobLevel',
      width: 80,
    },
    {
      title: '在职状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => <StatusTag status={record.status!} />,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        statusOptions.map((s) => [s.value, { text: s.label }]),
      ),
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      sorter: true,
      render: (_, record) =>
        record.hireDate ? dayjs(record.hireDate).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => {
        const isActive = record.status === 1 || record.status === 2;
        const menuItems: MenuProps['items'] = [];

        if (access.canTransferOrResign) {
          menuItems.push({
            key: 'transfer',
            label: '调岗',
            disabled: !isActive,
          });
          menuItems.push({
            key: 'resign',
            label: '离职',
            disabled: !isActive,
          });
        }

        return (
          <Space>
            <a onClick={() => history.push(`/employees/${record.id}`)}>
              查看详情
            </a>
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
    <PageContainer>
      <ProTable<API.EmployeeListVO>
        headerTitle="员工列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          span: 8,
        }}
        columns={columns}
        request={async (params, sort) => {
          const {
            current,
            pageSize,
            keyword,
            departmentIds,
            positionIds,
            statuses: statusesParam,
            jobLevels,
            hireDateRange,
          } = params as any;
          const res = await getEmployeeListUsingGet({
            current,
            pageSize,
            keyword,
            departmentIds: departmentIds as number[] | undefined,
            positionIds: positionIds as number[] | undefined,
            statuses: statusesParam as number[] | undefined,
            jobLevels: jobLevels as string[] | undefined,
            hireDateStart: hireDateRange?.[0],
            hireDateEnd: hireDateRange?.[1],
            sortField: Object.keys(sort)?.[0],
            sortOrder: Object.values(sort)?.[0] as string | undefined,
          });

          return {
            data: (res.data as any)?.records ?? [],
            success: true,
            total: (res.data as any)?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <ExportButton key="export" onExport={handleExport} />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default EmployeeList;
