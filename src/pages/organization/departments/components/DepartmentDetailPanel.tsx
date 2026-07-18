import { deleteDepartmentUsingDelete } from '@/api/departmentController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentDetail } from '@/hooks/useDepartmentDetail';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Empty,
  Popconfirm,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import React from 'react';

/** 字段行：左 label + 右 value（带底部分隔线） */
const Field: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
}> = ({ label, value, last }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid #f5f5f5',
    }}
  >
    <div style={{ width: 100, flexShrink: 0, color: '#8c8c8c', fontSize: 14 }}>
      {label}
    </div>
    <div style={{ flex: 1, fontSize: 14, color: '#262626' }}>{value}</div>
  </div>
);

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
      const parentId = dept.parentId;
      await deleteDepartmentUsingDelete({ id: deptId });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.tree() });
      // 删除后跳转到父部门（根部门则清空选中）
      if (parentId) {
        onSelectChild(parentId);
      } else {
        onCancel?.();
      }
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

  const childCount = dept.childCount ?? dept.children?.length ?? 0;

  return (
    <div
      style={{
        padding: '24px 32px',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#fff',
      }}
    >
      {/* 顶部操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
      >
        {canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<PlusOutlined />} onClick={() => onAddChild(deptId)}>
              新增子部门
            </Button>
            <Button
              type="primary"
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
              <Button danger>删除</Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* 编码标题 */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Text style={{ fontSize: 14, color: '#8c8c8c' }}>
          编码：
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: 14, color: '#262626' }}>
          {dept.code || '-'}
        </Typography.Text>
      </div>

      {/* 基本信息列表 */}
      <div style={{ marginBottom: 32 }}>
        <Field label="部门名称" value={dept.name || '-'} />
        <Field label="部门编码" value={dept.code || '-'} />
        <Field label="上级部门" value={dept.parentName || '-'} />
        <Field label="部门负责人" value={dept.managerName || '-'} />
        <Field label="排序序号" value={dept.sortOrder ?? '-'} />
        <Field label="部门描述" value={dept.description || '-'} />
        <Field
          label="在职人数"
          value={
            <span style={{ color: '#1677ff', fontWeight: 500 }}>
              {dept.employeeCount ?? 0} 人
            </span>
          }
          last
        />
      </div>

      {/* 直属子部门 */}
      {childCount > 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong style={{ fontSize: 15 }}>
              直属子部门
            </Typography.Text>
            <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 14 }}>
              {childCount} 个
            </span>
          </div>

          {dept.children && dept.children.length > 0 ? (
            <Row gutter={[16, 16]}>
              {dept.children.map((child: API.DepartmentVO) => (
                <Col span={12} key={child.id}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => child.id && onSelectChild(child.id)}
                    style={{
                      borderRadius: 6,
                      cursor: 'pointer',
                      border: '1px solid #f0f0f0',
                    }}
                    bodyStyle={{ padding: '16px 20px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Typography.Text
                          strong
                          style={{ fontSize: 14, color: '#262626' }}
                          ellipsis
                        >
                          {child.name}
                        </Typography.Text>
                        {child.managerName && (
                          <div style={{ marginTop: 4 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                              ellipsis
                            >
                              {child.managerName}
                            </Typography.Text>
                          </div>
                        )}
                      </div>
                      <Tag
                        color="blue"
                        style={{
                          marginRight: 0,
                          borderRadius: 10,
                          padding: '0 10px',
                          flexShrink: 0,
                        }}
                      >
                        {child.employeeCount ?? 0}人
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailPanel;
