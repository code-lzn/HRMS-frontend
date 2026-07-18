import {
  createAttendanceGroupUsingPost,
  deleteAttendanceGroupUsingDelete,
  queryAttendanceGroupsUsingGet,
  updateAttendanceGroupUsingPut,
} from '@/api/attendanceGroupController';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Result,
  Space,
  Table,
  Tag,
  TimePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

interface GroupRow {
  id: number;
  name: string;
  workStartTime: string;
  workEndTime: string;
  flexibleMinutes: number;
  memberCount: number;
  remark?: string;
}

const AttendanceGroups: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [form] = Form.useForm();

  // 列表
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', 'groups'],
    queryFn: async () => queryAttendanceGroupsUsingGet({ page: 1, size: 50 }),
  });
  const raw = (data as any)?.data?.records;
  const list: GroupRow[] = Array.isArray(raw) ? raw : [];

  // 打开新增
  const handleAdd = () => {
    setModalMode('create');
    setCurrentId(undefined);
    form.resetFields();
    setModalOpen(true);
  };

  // 打开编辑
  const handleEdit = (record: GroupRow) => {
    setModalMode('edit');
    setCurrentId(record.id);
    form.setFieldsValue({
      name: record.name,
      workStartTime: record.workStartTime,
      workEndTime: record.workEndTime,
      flexibleMinutes: record.flexibleMinutes,
      memberCount: record.memberCount,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'create') {
        await createAttendanceGroupUsingPost(values as any);
        message.success('考勤组创建成功');
      } else if (currentId) {
        await updateAttendanceGroupUsingPut({ id: currentId }, values as any);
        message.success('考勤组更新成功');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'groups'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteAttendanceGroupUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'groups'] });
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  const columns: ColumnsType<GroupRow> = [
    {
      title: '考勤组名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <strong>{v}</strong>
        </Space>
      ),
    },
    {
      title: '上班时间',
      dataIndex: 'workStartTime',
      key: 'workStartTime',
      width: 120,
      render: (v: string) => <Tag color="blue">{v || '-'}</Tag>,
    },
    {
      title: '下班时间',
      dataIndex: 'workEndTime',
      key: 'workEndTime',
      width: 120,
      render: (v: string) => <Tag color="purple">{v || '-'}</Tag>,
    },
    {
      title: '弹性(分钟)',
      dataIndex: 'flexibleMinutes',
      key: 'flexibleMinutes',
      width: 120,
      align: 'center',
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      align: 'center',
      render: (n: number) => (
        <Space>
          <TeamOutlined />
          {n ?? 0}
        </Space>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该考勤组？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '考勤组',
      }}
    >
      <Card
        bordered={false}
        title="考勤组列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增考勤组
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : list}
          loading={isLoading}
          locale={{
            emptyText: isError ? (
              <Result
                status="error"
                title="加载失败"
                subTitle="请检查后端服务是否运行"
              />
            ) : (
              <Empty description="暂无考勤组" />
            ),
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增考勤组' : '编辑考勤组'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        centered
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="考勤组名称"
            rules={[{ required: true, message: '请输入考勤组名称' }]}
          >
            <Input placeholder="如：研发中心" />
          </Form.Item>
          <Form.Item
            name="workStartTime"
            label="上班时间"
            rules={[{ required: true, message: '请选择上班时间' }]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择上班时间"
            />
          </Form.Item>
          <Form.Item
            name="workEndTime"
            label="下班时间"
            rules={[{ required: true, message: '请选择下班时间' }]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择下班时间"
            />
          </Form.Item>
          <Form.Item
            name="flexibleMinutes"
            label="弹性时间(分钟)"
            initialValue={0}
          >
            <InputNumber
              min={0}
              max={120}
              style={{ width: '100%' }}
              placeholder="允许的弹性打卡分钟数"
            />
          </Form.Item>
          <Form.Item name="memberCount" label="成员数(可选)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="考勤组说明" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AttendanceGroups;
