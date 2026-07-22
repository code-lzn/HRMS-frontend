import { deleteDepartmentUsingDelete } from '@/api/departmentController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentDetail } from '@/hooks/useDepartmentDetail';
import {
  ApartmentOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
  IdcardOutlined,
  OrderedListOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
  Tooltip,
  Typography,
  message,
} from 'antd';
import React from 'react';

/** 字段行：左图标 + label + 右 value（带底部分隔线） */
const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  last?: boolean;
}> = ({ icon, label, value, last }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid #f5f5f5',
      gap: 12,
    }}
  >
    <div
      style={{ color: '#bfbfbf', fontSize: 15, marginTop: 1, flexShrink: 0 }}
    >
      {icon}
    </div>
    <div style={{ width: 80, flexShrink: 0, color: '#8c8c8c', fontSize: 13 }}>
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
  const empCount = dept.employeeCount ?? 0;
  const canDelete = childCount === 0 && empCount === 0;
  const deleteDisabledTip =
    childCount > 0
      ? '该部门下存在子部门，请先删除子部门'
      : empCount > 0
      ? '该部门下存在在职员工，请先转移员工'
      : '';

  return (
    <div
      style={{
        padding: '24px 28px',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#fff',
      }}
    >
      {/* 头部信息卡片 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f5ff 100%)',
          borderRadius: 12,
          border: '1px solid #e6f0ff',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <ApartmentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
            <Typography.Text strong style={{ fontSize: 18, color: '#262626' }}>
              {dept.name}
            </Typography.Text>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 4,
            }}
          >
            <Typography.Text style={{ fontSize: 13, color: '#8c8c8c' }}>
              编码：{dept.code || '-'}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 13, color: '#8c8c8c' }}>
              负责人：{dept.managerName || '-'}
            </Typography.Text>
          </div>
          <Tag
            color="blue"
            style={{
              borderRadius: 10,
              padding: '0 12px',
              marginTop: 4,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <TeamOutlined style={{ marginRight: 4 }} />
            {dept.employeeCount ?? 0} 人在职
          </Tag>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button
              type="primary"
              shape="round"
              onClick={() => onAddChild(deptId)}
            >
              新增子部门
            </Button>
            <Button
              shape="round"
              style={{ color: '#1677ff', borderColor: '#1677ff' }}
              onClick={() => onEdit(deptId)}
            >
              编辑
            </Button>
            <Tooltip title={canDelete ? '' : deleteDisabledTip}>
              <span>
                <Popconfirm
                  title="确认删除该部门？"
                  onConfirm={handleDelete}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  disabled={!canDelete}
                >
                  <Button danger shape="round" disabled={!canDelete}>
                    删除
                  </Button>
                </Popconfirm>
              </span>
            </Tooltip>
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div style={{ marginBottom: 32 }}>
        <Typography.Text
          strong
          style={{ fontSize: 15, display: 'block', marginBottom: 12 }}
        >
          基本信息
        </Typography.Text>
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #f0f0f0',
            padding: '4px 20px',
          }}
        >
          <Field
            icon={<ApartmentOutlined />}
            label="部门名称"
            value={dept.name || '-'}
          />
          <Field
            icon={<IdcardOutlined />}
            label="部门编码"
            value={dept.code || '-'}
          />
          <Field
            icon={<ArrowUpOutlined />}
            label="上级部门"
            value={dept.parentName || '-'}
          />
          <Field
            icon={<UserOutlined />}
            label="部门负责人"
            value={dept.managerName || '-'}
          />
          <Field
            icon={<OrderedListOutlined />}
            label="排序序号"
            value={dept.sortOrder ?? '-'}
          />
          <Field
            icon={<FileTextOutlined />}
            label="部门描述"
            value={dept.description || '-'}
          />
          <Field
            icon={<TeamOutlined />}
            label="在职人数"
            value={
              <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 15 }}>
                {dept.employeeCount ?? 0} 人
              </span>
            }
            last
          />
        </div>
      </div>

      {/* 直属子部门 */}
      {childCount > 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong style={{ fontSize: 15 }}>
              直属子部门
            </Typography.Text>
            <Tag style={{ marginLeft: 8, borderRadius: 10, fontSize: 12 }}>
              {childCount} 个
            </Tag>
          </div>

          {dept.children && dept.children.length > 0 ? (
            <Row gutter={[12, 12]}>
              {dept.children.map((child: API.DepartmentVO, index: number) => (
                <Col span={12} key={child.id}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => child.id && onSelectChild(child.id)}
                    style={{
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      transition: 'all 0.25s',
                    }}
                    styles={{ body: { padding: '16px 18px' } }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 14px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {/* 左侧序列色条 */}
                        <span
                          style={{
                            width: 4,
                            height: 36,
                            borderRadius: 2,
                            background: [
                              '#1677ff',
                              '#52c41a',
                              '#fa8c16',
                              '#722ed1',
                              '#0ea5e9',
                            ][index % 5],
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Typography.Text
                            strong
                            style={{ fontSize: 14, color: '#262626' }}
                            ellipsis={{ tooltip: true }}
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
                                <UserOutlined
                                  style={{ marginRight: 4, fontSize: 11 }}
                                />
                                {child.managerName}
                              </Typography.Text>
                            </div>
                          )}
                        </div>
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
