import {
  createAttendanceGroupUsingPost,
  deleteAttendanceGroupUsingDelete,
  getAttendanceGroupDetailUsingGet,
  queryAttendanceGroupsUsingGet,
  updateAttendanceGroupUsingPut,
} from '@/api/attendanceGroupController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import {
  ATTENDANCE_RULE_TYPE_OPTIONS,
  SHIFT_TYPE_MAP,
  SHIFT_TYPE_OPTIONS,
} from '@/constants/enums';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { usePositionList } from '@/hooks/usePosition';
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
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  TreeSelect,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';

interface RuleItem {
  ruleType: number;
  targetIds: number[];
}

interface GroupRow {
  id: number;
  name: string;
  shiftType: number;
  shiftTypeDesc: string;
  startTime: string;
  endTime: string;
  lateThreshold: number;
  earlyLeaveThreshold: number;
  ruleSummary: string;
}

// ============ 规则目标选择子组件 ============

interface RuleTargetSelectProps {
  ruleType?: number;
  deptTreeData: any[];
  positionOptions: { label: string; value: number }[];
  value?: number[];
  onChange?: (value: number[]) => void;
}

const RuleTargetSelect: React.FC<RuleTargetSelectProps> = ({
  ruleType,
  deptTreeData,
  positionOptions,
  value,
  onChange,
}) => {
  // 每条规则独立维护员工搜索状态，互不干扰
  const [employeeOptions, setEmployeeOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const handleSearchEmployee = async (keyword: string) => {
    if (!keyword) {
      setEmployeeOptions([]);
      return;
    }
    try {
      const res = await getEmployeeListUsingGet({
        keyword,
        current: 1,
        pageSize: 20,
      });
      const records = (res as any)?.data?.records ?? [];
      setEmployeeOptions(
        records.map((r: any) => ({ label: r.name, value: r.id })),
      );
    } catch {
      setEmployeeOptions([]);
    }
  };
  if (ruleType === 1) {
    return (
      <TreeSelect
        placeholder="选择部门"
        treeData={deptTreeData}
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        multiple
        treeNodeFilterProp="title"
        style={{ width: '100%' }}
        maxTagCount={2}
      />
    );
  }

  if (ruleType === 2) {
    return (
      <Select
        mode="multiple"
        placeholder="选择职位"
        options={positionOptions}
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        maxTagCount={2}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '100%' }}
      />
    );
  }

  if (ruleType === 3) {
    return (
      <Select
        mode="multiple"
        placeholder="输入姓名搜索员工"
        options={employeeOptions}
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        maxTagCount={2}
        filterOption={false}
        onSearch={handleSearchEmployee}
        notFoundContent={null}
        style={{ width: '100%' }}
      />
    );
  }

  return (
    <Select placeholder="请先选择规则类型" disabled style={{ width: '100%' }} />
  );
};

const AttendanceGroups: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [form] = Form.useForm();
  const watchShiftType = Form.useWatch('shiftType', form);

  // ---- 数据源（用于规则选择） ----
  const { data: treeData } = useDepartmentTree();
  const { data: positionPage } = usePositionList({ current: 1, pageSize: 999 });
  const positionOptions = (positionPage?.records ?? []).map((p) => ({
    label: p.name,
    value: p.id,
  }));

  // 部门树选项
  const deptTreeSelectData = React.useMemo(() => {
    const convert = (nodes: any[]): any[] =>
      nodes.map((n: any) => ({
        title: n.name,
        value: n.id,
        children: n.children?.length ? convert(n.children) : undefined,
      }));
    return convert(treeData ?? []);
  }, [treeData]);

  // ---- 列表 ----
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', 'groups'],
    queryFn: async () => queryAttendanceGroupsUsingGet({ page: 1, size: 50 }),
  });
  const raw = (data as any)?.data?.records;
  const list: GroupRow[] = Array.isArray(raw) ? raw : [];

  // ---- 打开新增 ----
  const handleAdd = () => {
    setModalMode('create');
    setCurrentId(undefined);
    form.resetFields();
    form.setFieldsValue({
      lateThreshold: 15,
      earlyLeaveThreshold: 15,
      restStartTime: dayjs('12:00', 'HH:mm'),
      restEndTime: dayjs('13:00', 'HH:mm'),
      rules: [],
    });
    setModalOpen(true);
  };

  // ---- 打开编辑 ----
  const handleEdit = async (record: GroupRow) => {
    setModalMode('edit');
    setCurrentId(record.id);
    try {
      const res = await getAttendanceGroupDetailUsingGet({ id: record.id });
      const detail = (res as any)?.data as API.AttendanceGroupVO | undefined;
      if (detail) {
        // 将后端 rules 按 ruleType 分组，每组一条规则（多选 targetIds）
        const groupedRules: Record<number, number[]> = {};
        (detail.rules || []).forEach((r: any) => {
          const rt = r.ruleType;
          if (!groupedRules[rt]) groupedRules[rt] = [];
          groupedRules[rt].push(r.targetId);
        });
        const rulesList = Object.entries(groupedRules).map(
          ([ruleType, targetIds]) => ({
            ruleType: Number(ruleType),
            targetIds,
          }),
        );

        form.setFieldsValue({
          name: detail.name,
          shiftType: detail.shiftType,
          startTime: detail.startTime
            ? dayjs(detail.startTime, 'HH:mm')
            : undefined,
          endTime: detail.endTime ? dayjs(detail.endTime, 'HH:mm') : undefined,
          restStartTime: detail.restStartTime
            ? dayjs(detail.restStartTime, 'HH:mm')
            : undefined,
          restEndTime: detail.restEndTime
            ? dayjs(detail.restEndTime, 'HH:mm')
            : undefined,
          flexStartTime: detail.flexStartTime
            ? dayjs(detail.flexStartTime, 'HH:mm')
            : undefined,
          flexEndTime: detail.flexEndTime
            ? dayjs(detail.flexEndTime, 'HH:mm')
            : undefined,
          lateThreshold: detail.lateThreshold,
          earlyLeaveThreshold: detail.earlyLeaveThreshold,
          rules: rulesList.length > 0 ? rulesList : [],
        });
      }
    } catch {
      // 接口暂不可用时用列表数据兜底
      form.setFieldsValue({
        name: record.name,
        shiftType: record.shiftType,
        startTime: record.startTime
          ? dayjs(record.startTime, 'HH:mm')
          : undefined,
        endTime: record.endTime ? dayjs(record.endTime, 'HH:mm') : undefined,
        lateThreshold: record.lateThreshold,
        earlyLeaveThreshold: record.earlyLeaveThreshold,
        rules: [],
      });
    }
    setModalOpen(true);
  };

  // ---- 提交 ----
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 将 dayjs TimePicker 值转为 HH:mm 字符串
      const fmt = (v: any) => (dayjs.isDayjs(v) ? v.format('HH:mm') : v);
      const payload: Record<string, any> = {
        name: values.name,
        shiftType: values.shiftType,
        startTime: fmt(values.startTime),
        endTime: fmt(values.endTime),
        restStartTime: values.restStartTime
          ? fmt(values.restStartTime)
          : undefined,
        restEndTime: values.restEndTime ? fmt(values.restEndTime) : undefined,
        flexStartTime: values.flexStartTime
          ? fmt(values.flexStartTime)
          : undefined,
        flexEndTime: values.flexEndTime ? fmt(values.flexEndTime) : undefined,
        lateThreshold: values.lateThreshold ?? 15,
        earlyLeaveThreshold: values.earlyLeaveThreshold ?? 15,
      };

      // 将多选规则展开为后端需要的单个 targetId 规则列表
      const expandRules = (rules: RuleItem[] | undefined) => {
        if (!rules || rules.length === 0) return [];
        const result: { ruleType: number; targetId: number }[] = [];
        rules.forEach((rule) => {
          (rule.targetIds || []).forEach((targetId) => {
            result.push({ ruleType: rule.ruleType, targetId });
          });
        });
        return result;
      };

      // 规则处理：编辑模式不传 rules 则不更新规则
      const expandedRules = expandRules(values.rules);
      if (expandedRules.length > 0) {
        payload.rules = expandedRules;
      } else if (modalMode === 'create') {
        payload.rules = [];
      }

      if (modalMode === 'create') {
        await createAttendanceGroupUsingPost(payload as any);
        message.success('考勤组创建成功');
      } else if (currentId) {
        await updateAttendanceGroupUsingPut({ id: currentId }, payload as any);
        message.success('考勤组更新成功');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'groups'] });
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  // ---- 删除 ----
  const handleDelete = async (id: number) => {
    try {
      await deleteAttendanceGroupUsingDelete({ id });
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'groups'] });
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  // ---- 表格列 ----
  const columns: ColumnsType<GroupRow> = [
    {
      title: '考勤组名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (v: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <strong>{v}</strong>
        </Space>
      ),
    },
    {
      title: '班次类型',
      dataIndex: 'shiftTypeDesc',
      key: 'shiftType',
      width: 100,
      render: (v: string, record) => (
        <Tag
          color={
            record.shiftType === 2
              ? 'orange'
              : record.shiftType === 3
              ? 'purple'
              : 'blue'
          }
        >
          {v || SHIFT_TYPE_MAP[record.shiftType] || '-'}
        </Tag>
      ),
    },
    {
      title: '上班时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      align: 'center',
      render: (v: string) => v || '-',
    },
    {
      title: '下班时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      align: 'center',
      render: (v: string) => v || '-',
    },
    {
      title: '适用人员',
      dataIndex: 'ruleSummary',
      key: 'ruleSummary',
      width: 180,
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text title={v}>
          <TeamOutlined style={{ marginRight: 6 }} />
          {v || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '迟到阈值',
      dataIndex: 'lateThreshold',
      key: 'lateThreshold',
      width: 100,
      align: 'center',
      render: (v: number) =>
        v !== null && v !== undefined ? `${v} 分钟` : '-',
    },
    {
      title: '早退阈值',
      dataIndex: 'earlyLeaveThreshold',
      key: 'earlyLeaveThreshold',
      width: 100,
      align: 'center',
      render: (v: number) =>
        v !== null && v !== undefined ? `${v} 分钟` : '-',
    },
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
        title: '考勤规则配置',
      }}
    >
      <Card
        bordered={false}
        title="考勤组列表"
        styles={{ body: { padding: '0 24px 24px' } }}
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
          scroll={{ x: 1080 }}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (t) => `共 ${t} 条`,
          }}
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
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          initialValues={{
            lateThreshold: 15,
            earlyLeaveThreshold: 15,
          }}
        >
          {/* 考勤组名称 */}
          <Form.Item
            name="name"
            label="考勤组名称"
            rules={[{ required: true, message: '请输入考勤组名称' }]}
          >
            <Input placeholder='如"标准工时组"、"弹性工时组"' />
          </Form.Item>

          {/* 班次类型 */}
          <Form.Item
            name="shiftType"
            label="班次类型"
            rules={[{ required: true, message: '请选择班次类型' }]}
          >
            <Select placeholder="请选择班次类型" options={SHIFT_TYPE_OPTIONS} />
          </Form.Item>

          {/* 上班时间 + 下班时间 */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="startTime"
              label="上班时间"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="如 09:00"
              />
            </Form.Item>
            <Form.Item
              name="endTime"
              label="下班时间"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="如 18:00"
              />
            </Form.Item>
          </div>

          {/* 中午休息 */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="restStartTime"
              label="中午休息（开始）"
              style={{ flex: 1 }}
              tooltip="非必填，默认 12:00"
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="12:00"
              />
            </Form.Item>
            <Form.Item
              name="restEndTime"
              label="中午休息（结束）"
              style={{ flex: 1 }}
              tooltip="非必填，默认 13:00"
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="13:00"
              />
            </Form.Item>
          </div>

          {/* 弹性范围（仅弹性班显示） */}
          {watchShiftType === 2 && (
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="flexStartTime"
                label="弹性范围（最早打卡）"
                style={{ flex: 1 }}
                tooltip="弹性班适用，最早可打卡时间"
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder="如 07:00"
                />
              </Form.Item>
              <Form.Item
                name="flexEndTime"
                label="弹性范围（最晚打卡）"
                style={{ flex: 1 }}
                tooltip="弹性班适用，最晚可打卡时间"
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder="如 10:00"
                />
              </Form.Item>
            </div>
          )}

          {/* 迟到阈值 + 早退阈值 */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="lateThreshold"
              label="迟到阈值"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入' }]}
              tooltip="超过此刻钟算迟到"
            >
              <InputNumber
                min={0}
                max={120}
                addonAfter="分钟"
                style={{ width: '100%' }}
                placeholder="默认 15 分钟"
              />
            </Form.Item>
            <Form.Item
              name="earlyLeaveThreshold"
              label="早退阈值"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入' }]}
              tooltip="早于此刻钟算早退"
            >
              <InputNumber
                min={0}
                max={120}
                addonAfter="分钟"
                style={{ width: '100%' }}
                placeholder="默认 15 分钟"
              />
            </Form.Item>
          </div>

          {/* 适用人员 */}
          <Form.List
            name="rules"
            rules={
              modalMode === 'create'
                ? [
                    {
                      validator: async (_, rules) => {
                        if (!rules || rules.length === 0) {
                          return Promise.reject(
                            new Error('请至少添加一个适用人员规则'),
                          );
                        }
                      },
                    },
                  ]
                : undefined
            }
          >
            {(fields, { add, remove }, { errors }) => (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Typography.Text>
                    适用人员
                    {modalMode === 'create' && (
                      <Typography.Text type="danger"> *</Typography.Text>
                    )}
                  </Typography.Text>
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => add({ ruleType: 1, targetIds: [] })}
                  >
                    添加规则
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 8,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* 规则类型 */}
                    <Form.Item
                      {...restField}
                      name={[name, 'ruleType']}
                      style={{ width: 130, marginBottom: 0 }}
                      rules={[{ required: true, message: '请选择类型' }]}
                    >
                      <Select
                        placeholder="选择类型"
                        options={ATTENDANCE_RULE_TYPE_OPTIONS}
                        onChange={() => {
                          // 切换类型时清空已选目标
                          const rules = form.getFieldValue('rules') || [];
                          rules[name] = { ...rules[name], targetIds: [] };
                          form.setFieldValue('rules', rules);
                        }}
                      />
                    </Form.Item>

                    {/* 目标选择（多选） */}
                    <Form.Item
                      {...restField}
                      name={[name, 'targetIds']}
                      style={{ flex: 1, marginBottom: 0 }}
                      rules={[{ required: true, message: '请选择目标' }]}
                    >
                      <RuleTargetSelect
                        ruleType={form.getFieldValue([
                          'rules',
                          name,
                          'ruleType',
                        ])}
                        deptTreeData={deptTreeSelectData}
                        positionOptions={positionOptions}
                      />
                    </Form.Item>

                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ marginTop: 4 }}
                      onClick={() => remove(name)}
                    />
                  </div>
                ))}

                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AttendanceGroups;
