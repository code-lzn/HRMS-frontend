import { getEmployeeListUsingGet } from '@/api/employeeController';
import {
  createOvertimeRecordUsingPost,
  deleteOvertimeRecordUsingDelete,
  queryRecordsUsingGet1,
  updateOvertimeRecordUsingPut,
} from '@/api/overtimeRecordController';
import { ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  message,
  Modal,
  Popconfirm,
  Result,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';

interface OvertimeRow {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  isUsed: number;
  isUsedDesc: string;
  expireDate: string;
  createTime: string;
}

const IS_USED_OPTIONS = [
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
];

const OvertimeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [form] = Form.useForm();

  // ---- 筛选状态 ----
  const [filterEmployeeId, setFilterEmployeeId] = useState<
    number | undefined
  >();
  const [filterIsUsed, setFilterIsUsed] = useState<number | undefined>();

  // 筛选栏员工搜索（独立于弹窗）
  const [filterEmployeeOptions, setFilterEmployeeOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const handleFilterSearchEmployee = async (keyword: string) => {
    if (!keyword) {
      setFilterEmployeeOptions([]);
      return;
    }
    try {
      const res = await getEmployeeListUsingGet({
        keyword,
        current: 1,
        pageSize: 20,
      });
      const records = (res as any)?.data?.records ?? [];
      setFilterEmployeeOptions(
        records.map((r: any) => ({
          label: `${r.name} (${r.employeeNo})`,
          value: r.id,
        })),
      );
    } catch {
      setFilterEmployeeOptions([]);
    }
  };

  // 弹窗员工搜索（独立于筛选栏）
  const [modalEmployeeOptions, setModalEmployeeOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const handleModalSearchEmployee = async (keyword: string) => {
    if (!keyword) {
      setModalEmployeeOptions([]);
      return;
    }
    try {
      const res = await getEmployeeListUsingGet({
        keyword,
        current: 1,
        pageSize: 20,
      });
      const records = (res as any)?.data?.records ?? [];
      setModalEmployeeOptions(
        records.map((r: any) => ({
          label: `${r.name} (${r.employeeNo})`,
          value: r.id,
        })),
      );
    } catch {
      setModalEmployeeOptions([]);
    }
  };

  // ---- 列表 ----
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['overtime', 'records', filterEmployeeId, filterIsUsed],
    queryFn: async () =>
      queryRecordsUsingGet1({
        employeeId: filterEmployeeId,
        isUsed: filterIsUsed,
        page: 1,
        size: 50,
      }),
  });
  const raw = (data as any)?.data?.records;
  const list: OvertimeRow[] = Array.isArray(raw) ? raw : [];
  const queryErr = error as any;
  const isPermissionError = queryErr?.code === 40101;

  // 筛选搜索
  const handleSearch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['overtime'] });
  }, [queryClient]);

  // 重置筛选
  const handleReset = () => {
    setFilterEmployeeId(undefined);
    setFilterIsUsed(undefined);
    setFilterEmployeeOptions([]);
  };

  // 新增
  const handleAdd = () => {
    setModalMode('create');
    setCurrentId(undefined);
    form.resetFields();
    setModalEmployeeOptions([]);
    setModalOpen(true);
  };

  // 编辑
  const handleEdit = (record: OvertimeRow) => {
    setModalMode('edit');
    setCurrentId(record.id);
    form.setFieldsValue({
      employeeId: record.employeeId,
      overtimeDate: record.overtimeDate
        ? dayjs(record.overtimeDate)
        : undefined,
      timeRange:
        record.startTime && record.endTime
          ? [dayjs(record.startTime), dayjs(record.endTime)]
          : undefined,
      hours: record.hours,
    });
    setModalOpen(true);
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: Record<string, any> = {
        employeeId: values.employeeId,
        overtimeDate: dayjs.isDayjs(values.overtimeDate)
          ? values.overtimeDate.format('YYYY-MM-DD')
          : values.overtimeDate,
        startTime: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        hours:
          values.timeRange?.[0] && values.timeRange?.[1]
            ? values.timeRange[1].diff(values.timeRange[0], 'hour', true)
            : undefined,
      };

      if (modalMode === 'create') {
        await createOvertimeRecordUsingPost(payload as any);
        message.success('加班申请已提交');
      } else if (currentId) {
        await updateOvertimeRecordUsingPut({ id: currentId }, payload as any);
        message.success('加班记录已更新');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteOvertimeRecordUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  const columns: ColumnsType<OvertimeRow> = [
    {
      title: '员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '加班日期',
      dataIndex: 'overtimeDate',
      key: 'overtimeDate',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '加班时段',
      key: 'timeRange',
      width: 160,
      align: 'center',
      render: (_: any, record) => {
        const s = record.startTime
          ? dayjs(record.startTime).format('HH:mm')
          : '-';
        const e = record.endTime ? dayjs(record.endTime).format('HH:mm') : '-';
        return `${s} ~ ${e}`;
      },
    },
    {
      title: '时长',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
      align: 'center',
      render: (h: number) => (
        <strong>
          <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 4 }} />
          {h ?? 0}h
        </strong>
      ),
    },
    {
      title: '使用状态',
      dataIndex: 'isUsedDesc',
      key: 'isUsed',
      width: 90,
      align: 'center',
      render: (v: string, record) => (
        <Tag color={record.isUsed === 1 ? 'orange' : 'blue'}>
          {v || (record.isUsed === 1 ? '已使用' : '未使用')}
        </Tag>
      ),
    },
    {
      title: '有效期至',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 110,
      align: 'center',
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            shape="round"
            style={{ color: '#1677ff', borderColor: '#1677ff' }}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Tooltip
            title={record.isUsed === 1 ? '该加班记录已使用，无法删除' : ''}
          >
            <span>
              <Popconfirm
                title="确认删除该加班记录？"
                onConfirm={() => handleDelete(record.id)}
                okText="确认"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                disabled={record.isUsed === 1}
              >
                <Button
                  danger
                  size="small"
                  shape="round"
                  disabled={record.isUsed === 1}
                >
                  删除
                </Button>
              </Popconfirm>
            </span>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '加班管理',
      }}
    >
      {/* 筛选区域 */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          {/* 员工 */}
          <div style={{ width: 220 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              员工
            </Typography.Text>
            <Select
              placeholder="输入姓名搜索员工"
              options={filterEmployeeOptions}
              value={filterEmployeeId}
              onChange={(val) => setFilterEmployeeId(val)}
              allowClear
              showSearch
              filterOption={false}
              onSearch={handleFilterSearchEmployee}
              notFoundContent={null}
              style={{ width: '100%' }}
            />
          </div>

          {/* 使用状态 */}
          <div style={{ width: 150 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              使用状态
            </Typography.Text>
            <Select
              placeholder="选择状态"
              options={IS_USED_OPTIONS}
              value={filterIsUsed}
              onChange={(val) => setFilterIsUsed(val)}
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* 操作按钮 */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              paddingTop: 20,
            }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
        </div>
      </Card>

      <Card
        variant="borderless"
        title="加班记录列表"
        styles={{ body: { padding: '0 24px 24px' } }}
        extra={
          <Button type="primary" shape="round" onClick={handleAdd}>
            创建加班记录
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={isError ? [] : list}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
          }}
          locale={{
            emptyText: isError ? (
              <Result
                status={isPermissionError ? '403' : 'error'}
                title={isPermissionError ? '无权限' : '加载失败'}
                subTitle={
                  isPermissionError
                    ? '您没有权限查看加班记录，请联系管理员'
                    : '请检查后端服务'
                }
              />
            ) : (
              <Empty description="暂无加班记录" />
            ),
          }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '创建加班记录' : '编辑加班'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        centered
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {modalMode === 'create' && (
            <Form.Item
              name="employeeId"
              label="员工"
              rules={[{ required: true, message: '请选择员工' }]}
            >
              <Select
                placeholder="输入姓名搜索员工"
                options={modalEmployeeOptions}
                showSearch
                filterOption={false}
                onSearch={handleModalSearchEmployee}
                notFoundContent={null}
              />
            </Form.Item>
          )}
          <Form.Item
            name="overtimeDate"
            label="加班日期"
            rules={[{ required: true, message: '请选择加班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="加班时段"
            rules={[
              { required: true, message: '请选择加班时段' },
              {
                validator(_, value) {
                  if (!value || value.length !== 2) return Promise.resolve();
                  const [start, end] = value;
                  if (!start || !end) return Promise.resolve();
                  if (end.isAfter(start)) return Promise.resolve();
                  return Promise.reject(new Error('结束时间不能早于开始时间'));
                },
              },
            ]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default OvertimeManagement;
