import { deleteDepartmentUsingDelete } from '@/api/departmentController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentDetail } from '@/hooks/useDepartmentDetail';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';

interface DepartmentDetailPanelProps {
  deptId: number;
  onEdit: (id: number) => void;
  onAddChild: (parentId: number) => void;
  onSelectChild: (id: number) => void;
  onCancel: () => void;
}

const DepartmentDetailPanel: React.FC<DepartmentDetailPanelProps> = ({
  deptId,
  onEdit,
  onAddChild,
  onSelectChild,
  onCancel,
}) => {
  const { data: dept, isLoading } = useDepartmentDetail(deptId);
  const queryClient = useQueryClient();
  const access = useAccess();
  const canManage = access.canManageOrganization;
  const [tab, setTab] = useState('info');

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: queryKeys.departments.list({ deptId }),
    queryFn: async () => {
      const res = await getEmployeeListUsingGet({
        departmentIds: [deptId],
        current: 1,
        pageSize: 50,
      });
      return ((res.data as any)?.records ?? []) as API.EmployeeListVO[];
    },
    enabled: tab === 'members' && !!deptId,
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dept) {
    return <Empty description="未找到部门信息" />;
  }

  const handleDelete = async () => {
    try {
      await deleteDepartmentUsingDelete({ id: deptId });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.tree() });
      onCancel();
    } catch (error: any) {
      const code = error?.code;
      if (code === 30001) {
        const children = error?.data?.childDepartments ?? [];
        const childNames = children.map((c: any) => c.name).join('、');
        message.error(`该部门下存在子部门：${childNames}，请先删除子部门`);
      } else if (code === 30002) {
        const count = error?.data?.employeeCount ?? 0;
        message.error(`该部门下有 ${count} 名在职员工，请先转移员工`);
      } else {
        message.error(error?.message || '删除失败');
      }
    }
  };

  const infoTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {dept.name}
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 14, marginTop: 4, display: 'block' }}
            >
              {dept.managerName && `${dept.managerName} `}
              {dept.employeeCount ?? 0}人
            </Typography.Text>
          </div>
          {canManage && (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onAddChild(deptId)}
              >
                新增子部门
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(deptId)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确认删除该部门？"
                onConfirm={handleDelete}
                okText="确认"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                部门名称
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>
                {dept.name || '-'}
              </Typography.Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                部门编码
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>
                {dept.code || '-'}
              </Typography.Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                上级部门
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14 }}>
                {dept.parentName || '-'}
              </Typography.Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                排序序号
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14 }}>
                {dept.sortOrder ?? '-'}
              </Typography.Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                部门负责人
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14 }}>
                {dept.managerName || '-'}
              </Typography.Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                在职人数
              </Typography.Text>
              <Typography.Text
                style={{ fontSize: 14, color: '#1677ff', fontWeight: 500 }}
              >
                {dept.employeeCount ?? 0}人
              </Typography.Text>
            </div>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                部门描述
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14 }}>
                {dept.description || '-'}
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Text strong style={{ fontSize: 16 }}>
            直属子部门
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            {dept.childCount ?? dept.children?.length ?? 0}个
          </Typography.Text>
        </div>
        {dept.children && dept.children.length > 0 ? (
          <Row gutter={[16, 16]}>
            {dept.children.map((child: API.DepartmentVO) => (
              <Col span={8} key={child.id}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => child.id && onSelectChild(child.id)}
                  style={{
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <Avatar
                      icon={<TeamOutlined />}
                      style={{ backgroundColor: '#e6f7ff', color: '#1677ff' }}
                      size={40}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Typography.Text
                          style={{ fontSize: 14, fontWeight: 500 }}
                        >
                          {child.name}
                        </Typography.Text>
                        {child.code && (
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            {child.code}
                          </Typography.Text>
                        )}
                      </div>
                      {child.managerName && (
                        <Typography.Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            display: 'block',
                          }}
                        >
                          {child.managerName}
                        </Typography.Text>
                      )}
                      <Typography.Text
                        style={{
                          fontSize: 12,
                          color: '#1677ff',
                          marginTop: 4,
                          display: 'block',
                        }}
                      >
                        {child.employeeCount ?? 0}人
                      </Typography.Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Empty
              description="暂无子部门"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </div>
  );

  const membersTab = (
    <div>
      {employeesLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : employees && employees.length > 0 ? (
        <Table
          dataSource={employees}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ marginTop: 0 }}
          columns={[
            {
              title: '姓名',
              dataIndex: 'name',
              width: 100,
              render: (name: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#e6f7ff', color: '#1677ff' }}
                    size={32}
                  />
                  <span>{name}</span>
                </div>
              ),
            },
            {
              title: '工号',
              dataIndex: 'employeeNo',
              width: 100,
            },
            {
              title: '职位',
              dataIndex: 'positionName',
              width: 120,
            },
            {
              title: '职级',
              dataIndex: 'level',
              width: 80,
            },
            {
              title: '在职状态',
              dataIndex: 'status',
              width: 100,
              render: (status: string) => {
                const statusMap: Record<
                  string,
                  { color: string; text: string }
                > = {
                  PROBATION: { color: '#faad14', text: '试用期' },
                  REGULAR: { color: '#52c41a', text: '正式' },
                  PENDING_RESIGN: { color: '#faad14', text: '待离职' },
                  RESIGNED: { color: '#d9d9d9', text: '已离职' },
                };
                const info = statusMap[status] || {
                  color: '#d9d9d9',
                  text: status,
                };
                return (
                  <span
                    style={{
                      color: info.color,
                      backgroundColor: `${info.color}15`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    {info.text}
                  </span>
                );
              },
            },
            {
              title: '入职日期',
              dataIndex: 'hireDate',
              width: 120,
            },
          ]}
        />
      ) : (
        <Card
          size="small"
          bordered={false}
          style={{ backgroundColor: '#fafafa' }}
        >
          <Empty
            description="该部门暂无员工"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'info', label: '部门信息', children: infoTab },
          { key: 'members', label: '部门成员', children: membersTab },
        ]}
        tabBarStyle={{ marginBottom: 0 }}
      />
    </div>
  );
};

export default DepartmentDetailPanel;
