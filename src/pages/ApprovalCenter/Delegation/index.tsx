import {
  cancelDelegationUsingPost,
  createDelegationUsingPost,
  getMyDelegationsUsingGet,
} from '@/api/approvalController';
import { listUserVoByPageUsingPost } from '@/api/userController';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Form, message, Modal, Select, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

/** 审批类型枚举 */
const BUSINESS_TYPE_OPTIONS = [
  { label: '入职审批', value: 'ONBOARDING' },
  { label: '转正审批', value: 'REGULARIZATION' },
  { label: '调岗审批', value: 'TRANSFER' },
  { label: '离职审批', value: 'RESIGNATION' },
  { label: '请假审批', value: 'LEAVE' },
  { label: '补卡审批', value: 'PATCH_CLOCK' },
  { label: '薪资审批', value: 'SALARY_BATCH' },
];

const ApprovalDelegation: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  /** 加载用户列表（可传 keyword 搜索） */
  const loadUsers = async (keyword?: string) => {
    setUserSearchLoading(true);
    try {
      const res = await listUserVoByPageUsingPost({
        current: 1,
        pageSize: 50,
        userName: keyword || undefined,
      });
      const list = res?.data?.records ?? [];
      setUserOptions(
        list.map((u) => ({ label: u.userName ?? '', value: u.id! })),
      );
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  /** 打开新建委托弹窗 */
  const openCreateModal = () => {
    loadUsers();
    setCreateModalOpen(true);
  };

  const columns: ProColumns<API.ApprovalDelegationVO>[] = [
    {
      title: '被委托人',
      dataIndex: 'delegateName',
      width: 120,
    },
    {
      title: '委托类型',
      dataIndex: 'businessTypes',
      width: 200,
      render: (_, r) => {
        if (!r.businessTypes) return <Tag>全部</Tag>;
        return r.businessTypes.split(',').map((t) => <Tag key={t}>{t}</Tag>);
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, r) =>
        r.status === 1 ? (
          <Tag color="success">生效中</Tag>
        ) : (
          <Tag color="default">已取消</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, r) =>
        r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) =>
        record.status === 1 ? (
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleCancel(record.id!)}
          >
            取消
          </Button>
        ) : null,
    },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createDelegationUsingPost({
        delegateId: values.delegateId,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        businessTypes: values.businessTypes?.join(',') ?? '',
      });
      message.success('委托创建成功');
      setCreateModalOpen(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消此委托吗？',
      onOk: async () => {
        try {
          await cancelDelegationUsingPost({ id });
          message.success('已取消');
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e.message || '取消失败');
        }
      },
    });
  };

  return (
    <div>
      <ProTable<API.ApprovalDelegationVO>
        headerTitle="委托审批"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          try {
            const res = await getMyDelegationsUsingGet();
            return {
              data: res?.data ?? [],
              success: true,
              total: res?.data?.length ?? 0,
            };
          } catch {
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={openCreateModal}
          >
            新建委托
          </Button>,
        ]}
      />

      <Modal
        title="新建委托"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="delegateId"
            label="被委托人"
            rules={[{ required: true, message: '请选择被委托人' }]}
          >
            <Select
              showSearch
              placeholder="搜索并选择被委托人"
              filterOption={false}
              onSearch={(val) => loadUsers(val)}
              loading={userSearchLoading}
              options={userOptions}
              notFoundContent="暂无用户"
              defaultActiveFirstOption={false}
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="委托时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              disabledDate={(current) =>
                current && current.isBefore(dayjs().startOf('day'))
              }
            />
          </Form.Item>
          <Form.Item
            name="businessTypes"
            label="委托类型"
            extra="不选则委托所有类型"
          >
            <Select
              mode="multiple"
              options={BUSINESS_TYPE_OPTIONS}
              placeholder="请选择（不选=全部）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalDelegation;
