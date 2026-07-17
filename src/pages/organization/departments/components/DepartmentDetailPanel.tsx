import { deleteDepartmentUsingDelete } from '@/api/departmentController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentDetail } from '@/hooks/useDepartmentDetail';
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  message,
} from 'antd';
import React from 'react';

interface DepartmentDetailPanelProps {
  deptId: number;
  onEdit: (id: number) => void;
  onAddChild: (parentId: number) => void;
}

/**
 * 右侧部门详情面板
 * 展示部门基本信息、统计数据、子部门列表和操作按钮
 */
const DepartmentDetailPanel: React.FC<DepartmentDetailPanelProps> = ({
  deptId,
  onEdit,
  onAddChild,
}) => {
  const { data, isLoading } = useDepartmentDetail(deptId);
  const queryClient = useQueryClient();
  const access = useAccess();

  const dept = data;

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
    } catch (error: any) {
      const code = error?.code;
      if (code === 30001) {
        // 有子部门
        const children = error?.data?.childDepartments ?? [];
        const childNames = children.map((c: any) => c.name).join('、');
        message.error(`该部门下存在子部门：${childNames}，请先删除子部门`);
      } else if (code === 30002) {
        // 有在职员工
        const count = error?.data?.employeeCount ?? 0;
        message.error(`该部门下有 ${count} 名在职员工，请先转移员工`);
      } else {
        message.error(error?.message || '删除失败');
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="部门名称">
            {dept.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="部门编码">
            {dept.code || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="上级部门">
            {dept.parentName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="部门负责人">
            {dept.managerName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="排序序号">
            {dept.sortOrder ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dept.createTime ? dept.createTime.substring(0, 10) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="部门描述" span={2}>
            {dept.description || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="部门人数（含子部门）"
              value={dept.employeeCount ?? 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="直接子部门数量"
              value={dept.childCount ?? 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 直接子部门列表 */}
      {dept.children && dept.children.length > 0 && (
        <Card title="子部门" style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            {dept.children.map((child: API.DepartmentVO) => (
              <Col span={8} key={child.id}>
                <Card size="small" hoverable style={{ cursor: 'pointer' }}>
                  <div style={{ fontWeight: 500 }}>{child.name}</div>
                  <div style={{ color: '#999', fontSize: 13 }}>
                    {child.employeeCount ?? 0} 人
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 操作按钮 */}
      {access.canManageOrganization && (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(deptId)}
          >
            编辑
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => onAddChild(deptId)}>
            新增子部门
          </Button>
          <Popconfirm
            title="确认删除该部门？"
            description="删除后不可恢复，请确认"
            onConfirm={handleDelete}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )}
    </div>
  );
};

export default DepartmentDetailPanel;
