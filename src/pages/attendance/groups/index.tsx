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
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
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
  TreeSelect,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

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
  coreStartTime: string;
  coreEndTime: string;
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

  // ---- 筛选状态 ----
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterShiftType, setFilterShiftType] = useState<number | undefined>();

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
    queryKey: ['attendance', 'groups', filterKeyword, filterShiftType],
    queryFn: async () =>
      queryAttendanceGroupsUsingGet({
        keyword: filterKeyword || undefined,
        shiftType: filterShiftType,
        page: 1,
        size: 50,
      }),
  });
  const raw = (data as any)?.data?.records;
  const list: GroupRow[] = Array.isArray(raw) ? raw : [];

  // 辅助：从两个独立时间值构建 RangePicker 的 value
  const toRange = (s?: string, e?: string) => {
    if (!s || !e) return undefined;
    return [dayjs(s, 'HH:mm'), dayjs(e, 'HH:mm')] as [any, any];
  };

  // ---- 打开新增 ----
  const handleAdd = () => {
    setModalMode('create');
    setCurrentId(undefined);
    form.resetFields();
    form.setFieldsValue({
      lateThreshold: 15,
      earlyLeaveThreshold: 15,
      restTimeRange: [dayjs('12:00', 'HH:mm'), dayjs('13:00', 'HH:mm')],
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
          workTimeRange: toRange(detail.startTime, detail.endTime),
          coreTimeRange: toRange(detail.coreStartTime, detail.coreEndTime),
          restTimeRange: toRange(detail.restStartTime, detail.restEndTime),
          flexTimeRange: toRange(detail.flexStartTime, detail.flexEndTime),
          workHours: detail.workHours,
          lateThreshold: detail.lateThreshold,
          earlyLeaveThreshold: detail.earlyLeaveThreshold,
          rules: rulesList.length > 0 ? rulesList : [],
        });
      }
    } catch {
      form.setFieldsValue({
        name: record.name,
        shiftType: record.shiftType,
        workTimeRange: toRange(record.startTime, record.endTime),
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

      // 将 dayjs 转为 HH:mm 字符串
      const fmt = (v: any) => (dayjs.isDayjs(v) ? v.format('HH:mm') : v);
      const fmtRange = (r: [any, any] | undefined) =>
        r ? ([fmt(r[0]), fmt(r[1])] as [string, string]) : undefined;

      const payload: Record<string, any> = {
        name: values.name,
        shiftType: values.shiftType,
        lateThreshold: values.lateThreshold ?? 15,
        earlyLeaveThreshold: values.earlyLeaveThreshold ?? 15,
      };

      // 弹性班提交 coreStartTime/coreEndTime，固定班/排班制提交 startTime/endTime
      if (values.shiftType === 2) {
        const cr = fmtRange(values.coreTimeRange);
        payload.coreStartTime = cr?.[0];
        payload.coreEndTime = cr?.[1];
        payload.workHours = values.workHours;
      } else {
        const wr = fmtRange(values.workTimeRange);
        payload.startTime = wr?.[0];
        payload.endTime = wr?.[1];
      }

      // 中午休息
      const rr = fmtRange(values.restTimeRange);
      payload.restStartTime = rr?.[0];
      payload.restEndTime = rr?.[1];

      // 弹性范围
      const fr = fmtRange(values.flexTimeRange);
      payload.flexStartTime = fr?.[0];
      payload.flexEndTime = fr?.[1];

      // 展开多选规则
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
      width: 140,
      ellipsis: true,
      render: (v: string) => (
        <span>
          <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 4 }} />
          <strong>{v}</strong>
        </span>
      ),
    },
    {
      title: '班次类型',
      dataIndex: 'shiftTypeDesc',
      key: 'shiftType',
      width: 80,
      align: 'center',
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
      title: '工作时间',
      key: 'workTime',
      width: 190,
      align: 'center',
      render: (_: any, record) => {
        const isFlex = record.shiftType === 2;
        const timeText = isFlex
          ? `${record.coreStartTime || '-'}~${record.coreEndTime || '-'}`
          : `${record.startTime || '-'}~${record.endTime || '-'}`;
        if (isFlex) {
          return (
            <span>
              <Tag
                color="orange"
                style={{ margin: 0, fontSize: 11, padding: '0 4px' }}
              >
                核心
              </Tag>
              <span
                style={{
                  marginLeft: 4,
                  fontVariantNumeric: 'tabular-nums' as any,
                }}
              >
                {timeText}
              </span>
            </span>
          );
        }
        return (
          <span style={{ fontVariantNumeric: 'tabular-nums' as any }}>
            {timeText}
          </span>
        );
      },
    },
    {
      title: '适用人员',
      dataIndex: 'ruleSummary',
      key: 'ruleSummary',
      width: 160,
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text title={v} style={{ fontSize: 13 }}>
          <TeamOutlined style={{ marginRight: 4 }} />
          {v || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '迟到阈值',
      dataIndex: 'lateThreshold',
      key: 'lateThreshold',
      width: 80,
      align: 'center',
      render: (v: number) =>
        v !== null && v !== undefined ? `${v} 分钟` : '-',
    },
    {
      title: '早退阈值',
      dataIndex: 'earlyLeaveThreshold',
      key: 'earlyLeaveThreshold',
      width: 80,
      align: 'center',
      render: (v: number) =>
        v !== null && v !== undefined ? `${v} 分钟` : '-',
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
          <Popconfirm
            title="确认删除该考勤组？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" shape="round">
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
          {/* 考勤组名称 */}
          <div style={{ width: 220 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              考勤组名称
            </Typography.Text>
            <Input
              placeholder="输入名称搜索"
              prefix={<SearchOutlined />}
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              allowClear
              onPressEnter={() =>
                queryClient.invalidateQueries({ queryKey: ['attendance'] })
              }
            />
          </div>

          {/* 班次类型 */}
          <div style={{ width: 150 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 4, display: 'block' }}
            >
              班次类型
            </Typography.Text>
            <Select
              placeholder="选择类型"
              options={SHIFT_TYPE_OPTIONS}
              value={filterShiftType}
              onChange={(val) => setFilterShiftType(val)}
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
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['attendance'] })
              }
            >
              搜索
            </Button>
            <Button
              onClick={() => {
                setFilterKeyword('');
                setFilterShiftType(undefined);
              }}
            >
              重置
            </Button>
          </div>
        </div>
      </Card>

      <Card
        variant="borderless"
        title="考勤组列表"
        styles={{ body: { padding: '0 24px 24px' } }}
        extra={
          <Button type="primary" shape="round" onClick={handleAdd}>
            新增考勤组
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

          {/* 弹性班：核心工作时间 + 需工作时长 */}
          {watchShiftType === 2 ? (
            <>
              <Form.Item
                name="coreTimeRange"
                label="核心工作时间"
                rules={[{ required: true, message: '请选择' }]}
              >
                <RangePicker
                  picker="time"
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
              <Form.Item
                name="workHours"
                label="需工作时长"
                rules={[{ required: true, message: '请输入工作时长' }]}
              >
                <InputNumber
                  min={1}
                  max={24}
                  addonAfter="小时"
                  style={{ width: '100%' }}
                  placeholder="如 8"
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="workTimeRange"
              label="工作时间"
              rules={[{ required: true, message: '请选择' }]}
            >
              <RangePicker
                picker="time"
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder={['上班时间', '下班时间']}
              />
            </Form.Item>
          )}

          {/* 中午休息 */}
          <Form.Item
            name="restTimeRange"
            label="中午休息"
            tooltip="非必填，默认 12:00-13:00"
          >
            <RangePicker
              picker="time"
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>

          {/* 弹性范围（仅弹性班显示） */}
          {watchShiftType === 2 && (
            <Form.Item
              name="flexTimeRange"
              label="弹性打卡范围"
              tooltip="弹性班适用，最早-最晚打卡时间"
              rules={[{ required: true, message: '请选择' }]}
            >
              <RangePicker
                picker="time"
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder={['最早打卡', '最晚打卡']}
              />
            </Form.Item>
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
