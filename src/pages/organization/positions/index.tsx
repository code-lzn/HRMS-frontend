import {
  deletePositionUsingDelete,
  getPositionListUsingGet,
} from '@/api/positionController';
import SequenceTag from '@/components/SequenceTag';
import { queryKeys } from '@/hooks/queryKeys';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import PositionFormModal from './components/PositionFormModal';

/**
 * 职位管理页面
 * 搜索栏 + ProTable + 分页 + 新增/编辑弹窗
 */
const PositionManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalPositionId, setModalPositionId] = useState<number | undefined>();
  const [modalInitialValues, setModalInitialValues] = useState<
    Record<string, any>
  >({});

  // 工具栏操作
  const handleAdd = () => {
    setModalMode('create');
    setModalPositionId(undefined);
    setModalInitialValues({});
    setModalOpen(true);
  };

  const handleEdit = (record: API.PositionVO) => {
    setModalMode('edit');
    setModalPositionId(record.id);
    setModalInitialValues({
      name: record.name,
      sequence: record.sequence,
      departmentId: record.departmentId,
      levelMin: record.levelMin,
      levelMax: record.levelMax,
      defaultProbationMonths: record.defaultProbationMonths,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePositionUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      actionRef.current?.reload();
    } catch (error: any) {
      const code = error?.code;
      if (code === 30011) {
        const count = error?.data?.employeeCount ?? 0;
        message.error(`该职位下有 ${count} 名在职员工关联，请先调整员工职位`);
      } else {
        message.error(error?.message || '删除失败');
      }
    }
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<API.PositionVO>[] = [
    {
      title: '职位名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '职位序列',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 160,
      search: false,
      render: (_, record) => <SequenceTag sequence={record.sequence!} />,
    },
    {
      title: '职级范围',
      dataIndex: 'levelRange',
      key: 'levelRange',
      width: 120,
      search: false,
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      search: false,
      render: (_, record) => record.departmentName || '全公司通用',
    },
    {
      title: '默认试用期',
      dataIndex: 'defaultProbationMonths',
      key: 'defaultProbationMonths',
      width: 120,
      search: false,
      render: (_, record) => `${record.defaultProbationMonths}个月`,
    },
    {
      title: '职位描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      search: false,
      ellipsis: true,
      render: (_, record) => record.description || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      search: false,
      render: (_, record) =>
        record.createTime
          ? record.createTime.replace('T', ' ').substring(0, 16)
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      search: false,
      render: (_, record) => {
        if (!access.canManageOrganization) return null;
        return (
          <Space>
            <a onClick={() => handleEdit(record)}>编辑</a>
            <Popconfirm
              title="确认删除该职位？"
              onConfirm={() => handleDelete(record.id!)}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.PositionVO>
        headerTitle="职位列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, keyword, sequence, departmentId } = params;
          const res = await getPositionListUsingGet({
            current,
            pageSize,
            keyword,
            sequence: sequence as number | undefined,
            departmentId: departmentId as number | undefined,
          });
          return {
            data: (res.data as any)?.records ?? [],
            success: true,
            total: (res.data as any)?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          access.canManageOrganization && (
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增职位
            </Button>
          ),
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
      />

      <PositionFormModal
        open={modalOpen}
        mode={modalMode}
        positionId={modalPositionId}
        initialValues={modalInitialValues}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
};

export default PositionManagement;
