import { deleteDepartmentUsingPost } from '@/api/departmentController';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Card, Descriptions, Empty, message, Modal, Space, Tag } from 'antd';
import React, { useRef } from 'react';

interface DepartmentDetailProps {
  department: API.DepartmentTreeVO | null;
  onEdit: (dept: API.DepartmentTreeVO) => void;
  onRefreshTree: () => void;
  /** 用于查找上级部门名称 */
  treeData: API.DepartmentTreeVO[];
  canManage?: boolean;
}

/** 在树中查找部门名称 */
const findDeptName = (treeData: API.DepartmentTreeVO[], id: number | undefined): string => {
  if (id === null || id === undefined) return '-';
  const walk = (nodes: API.DepartmentTreeVO[]): string => {
    for (const node of nodes) {
      if (node.id === id) return node.name ?? '-';
      if (node.children?.length) {
        const found = walk(node.children);
        if (found !== '-') return found;
      }
    }
    return '-';
  };
  return walk(treeData);
};

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({
  department,
  onEdit,
  onRefreshTree,
  treeData,
  canManage = false,
}) => {
  const actionRef = useRef<ActionType>();

  if (!department) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Empty description="请在左侧选择一个部门" />
      </div>
    );
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确定删除该部门吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除部门「${department.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDepartmentUsingPost({ id: department.id });
          message.success('删除成功');
          onRefreshTree();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  const childrenColumns: ProColumns<API.DepartmentTreeVO>[] = [
    { title: '部门名称', dataIndex: 'name', width: 160 },
    { title: '部门编码', dataIndex: 'code', width: 100 },
    {
      title: '负责人',
      dataIndex: 'managerName',
      width: 120,
      render: (_, r) => r.managerName ?? '-',
    },
    {
      title: '在职人数',
      dataIndex: 'employeeCount',
      width: 100,
      render: (_, r) => (
        <Tag color="blue">{r.employeeCount ?? 0} 人</Tag>
      ),
    },
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    {
      title: canManage ? '操作' : '',
      width: 140,
      render: (_, record) => canManage ? (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => {
            Modal.confirm({
              title: '确定删除该部门吗？',
              icon: <ExclamationCircleOutlined />,
              content: `将删除部门「${record.name}」，此操作不可恢复。`,
              okText: '确定',
              okType: 'danger',
              cancelText: '取消',
              onOk: async () => {
                try {
                  await deleteDepartmentUsingPost({ id: record.id });
                  message.success('删除成功');
                  onRefreshTree();
                } catch (e: any) {
                  message.error(e.message ?? '删除失败');
                }
              },
            });
          }}>
            删除
          </Button>
        </Space>
      ) : null,
    },
  ];

  const parentName = findDeptName(treeData, department.parentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 部门基本信息 */}
      <Card
        title={
          <Space>
            <span>{department.name}</span>
            <Tag color="default">{department.code}</Tag>
          </Space>
        }
        extra={
          canManage ? (
            <Space>
              <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(department)}>
                编辑
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            </Space>
          ) : undefined
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="部门名称">{department.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="部门编码">{department.code ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="上级部门">{parentName}</Descriptions.Item>
          <Descriptions.Item label="部门负责人">{department.managerName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="排序序号">{department.sortOrder ?? 0}</Descriptions.Item>
          <Descriptions.Item label="在职人数">
            <Tag color="blue">{department.employeeCount ?? 0} 人</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="部门描述" span={3}>
            {department.description ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 下级部门列表 */}
      <Card title="下级部门">
        <ProTable<API.DepartmentTreeVO>
          actionRef={actionRef}
          columns={childrenColumns}
          dataSource={department.children ?? []}
          rowKey="id"
          search={false}
          pagination={false}
          toolBarRender={false}
        />
      </Card>
    </div>
  );
};

export default DepartmentDetail;
