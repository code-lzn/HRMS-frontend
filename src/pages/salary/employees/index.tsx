import { getEmployeeSalaryUsingGet } from '@/api/salaryController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Space } from 'antd';
import React from 'react';

const EmployeeSalaryList: React.FC = () => {
  const columns: ProColumns<any>[] = [
    { title: '工号', dataIndex: 'employeeNo', width: 120, search: false },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      render: (_, record) => (
        <a onClick={() => history.push(`/salary/employees/${record.id}`)}>
          {record.name}
        </a>
      ),
    },
    { title: '部门', dataIndex: 'departmentName', width: 140, search: false },
    { title: '职位', dataIndex: 'positionName', width: 140, search: false },
    {
      title: '操作',
      key: 'action',
      width: 150,
      search: false,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <a onClick={() => history.push(`/salary/employees/${record.id}`)}>
            薪资详情
          </a>
          <a onClick={() => history.push(`/salary/employees/${record.id}/edit`)}>
            编辑
          </a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<any>
        headerTitle="员工薪资档案"
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 8 }}
        columns={columns}
        request={async (params) => {
          const res = await getEmployeeListUsingGet({
            current: params.current,
            pageSize: params.pageSize,
            keyword: params.keyword,
            departmentId: params.departmentId,
            status: params.status,
          } as any);
          return {
            data: (res.data as any)?.records ?? [],
            success: true,
            total: (res.data as any)?.total ?? 0,
          };
        }}
      />
    </PageContainer>
  );
};

export default EmployeeSalaryList;
