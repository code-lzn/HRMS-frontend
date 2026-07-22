import { useState, useEffect } from 'react';
import { Card, Button, Tag, Table, Modal, Form, Input, Select, Space, Spin, message, DatePicker, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import {
  getAllGroupsUsingGet,
  createGroupUsingPost,
  updateGroupUsingPut,
  deleteGroupUsingDelete,
  getAllHolidaysUsingGet,
  createHolidayUsingPost,
  updateHolidayUsingPut,
  deleteHolidayUsingDelete,
} from '@/api/attendanceRuleController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import usePermission from '@/hooks/usePermission';
import dayjs from 'dayjs';

// 考勤类型映射表：将考勤组类型转换为显示文本和颜色
const SHIFT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  '0': { label: '固定班', color: '#1890ff' },
  '1': { label: '弹性班', color: '#722ed1' },
  '2': { label: '排班制', color: '#fa8c16' },
};

// 节假日类型映射表：将节假日类型转换为显示文本和颜色
const HOLIDAY_TYPE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '法定节假日', color: '#ff4d4f' },
  1: { label: '调休上班日', color: '#52c41a' },
  2: { label: '公司自定义假期', color: '#fa8c16' },
};

// 打卡规则配置：定义考勤判定规则（条件→结果→颜色）
const RULES = [
  { condition: '上班打卡时间 ≤ 规定时间', result: '正常', color: '#52c41a' },
  { condition: '规定时间 < 上班打卡时间 ≤ 规定时间+阈值', result: '迟到', color: '#faad14' },
  { condition: '上班打卡时间 > 规定时间+阈值', result: '旷工', color: '#ff4d4f' },
  { condition: '下班打卡时间 ≥ 规定时间', result: '正常', color: '#52c41a' },
  { condition: '规定时间-阈值 ≤ 下班打卡时间 < 规定时间', result: '早退', color: '#fa8c16' },
  { condition: '下班打卡时间 < 规定时间-阈值', result: '旷工', color: '#ff4d4f' },
  { condition: '当日无打卡记录', result: '缺勤', color: '#ff4d4f' },
];

// 考勤组数据接口定义
interface AttendanceGroup {
  id: number;
  groupName: string;
  shiftType: string;
  workStartTime: string;
  workEndTime: string;
  lateThreshold: number;
  earlyThreshold: number;
  employeeCount: number;
  departments: string[];
  departmentIds: number[];
}

// 考勤规则配置组件：管理考勤组、节假日和打卡规则
const RuleConfig: React.FC = () => {
  // 获取用户权限（是否管理员）
  const { isAdmin } = usePermission();

  // ===== 考勤组相关状态 =====
  const [modalVisible, setModalVisible] = useState(false); // 考勤组弹窗开关
  const [confirmLoading, setConfirmLoading] = useState(false); // 考勤组提交加载状态
  const [form] = Form.useForm(); // 考勤组表单实例
  const [groups, setGroups] = useState<AttendanceGroup[]>([]); // 考勤组列表
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]); // 部门列表
  const [loading, setLoading] = useState(true); // 考勤组加载状态
  const [editingId, setEditingId] = useState<number | null>(null); // 当前编辑的考勤组ID

  // ===== 节假日配置相关状态 =====
  const [holidays, setHolidays] = useState<any[]>([]); // 节假日列表
  const [holidayModalOpen, setHolidayModalOpen] = useState(false); // 节假日弹窗开关
  const [holidayForm] = Form.useForm(); // 节假日表单实例
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null); // 当前编辑的节假日ID
  const [holidayLoading, setHolidayLoading] = useState(false); // 节假日加载状态

  // 初始化数据：组件挂载时获取考勤组、部门和节假日数据
  useEffect(() => {
    fetchGroups();
    fetchDepartments();
    fetchHolidays();
  }, []);

  // 获取考勤组列表：调用后端接口获取所有考勤组数据
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getAllGroupsUsingGet();
      if (res.code === 0 && res.data) {
        setGroups(res.data.map((g: any) => ({
          id: g.id,
          groupName: g.groupName,
          shiftType: String(g.shiftType),
          workStartTime: g.workStartTime,
          workEndTime: g.workEndTime,
          lateThreshold: g.lateThreshold ?? 15,
          earlyThreshold: g.earlyThreshold ?? 15,
          employeeCount: g.employeeCount || 0,
          departments: g.departmentNames || [],
          departmentIds: g.departmentIds || [],
        })));
      }
    } catch (e) {
      console.error('获取考勤组列表失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 获取部门列表：递归遍历部门树，构建下拉框选项
  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      if (res.code === 0 && res.data) {
        const options: { value: string; label: string }[] = [];
        const traverse = (nodes: any[]) => {
          nodes.forEach((node: any) => {
            options.push({ value: String(node.id), label: node.name });
            if (node.children) {
              traverse(node.children);
            }
          });
        };
        traverse(res.data);
        setDepartments(options);
      }
    } catch (e) {
      console.error('获取部门列表失败:', e);
    }
  };

  // 添加考勤组：清空表单并打开弹窗
  const handleAddGroup = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑考勤组：填充表单数据并打开弹窗
  const handleEditGroup = (group: AttendanceGroup) => {
    setEditingId(group.id);
    form.setFieldsValue({
      name: group.groupName,
      type: group.shiftType,
      startTime: group.workStartTime,
      endTime: group.workEndTime,
      lateThreshold: group.lateThreshold,
      earlyThreshold: group.earlyThreshold || 15,
      departmentIds: group.departmentIds || [],
    });
    setModalVisible(true);
  };

  // 删除考勤组：调用后端接口删除指定考勤组
  const handleDeleteGroup = async (id: number) => {
    try {
      const res = await deleteGroupUsingDelete({ id });
      if (res.code === 0) {
        message.success('删除成功');
        fetchGroups(); // 刷新列表
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 提交考勤组：根据是否有editingId判断是新增还是更新
  const handleSubmit = async () => {
    setConfirmLoading(true);
    try {
      const values = await form.validateFields();
      const data: Record<string, any> = {
        groupName: values.name,
        shiftType: Number(values.type),
        workStartTime: values.startTime,
        workEndTime: values.endTime,
        lateThreshold: values.lateThreshold,
        earlyThreshold: values.earlyThreshold,
        departmentIds: values.departmentIds || [],
      };

      if (editingId) {
        // 更新考勤组
        data.id = editingId;
        await updateGroupUsingPut(data);
        message.success('更新成功');
      } else {
        // 新增考勤组
        await createGroupUsingPost(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchGroups(); // 刷新列表
    } catch (e: any) {
      if (e?.errorFields) {
        // 表单校验失败，字段会自动高亮，不显示额外提示
        return;
      }
      console.error('提交失败:', e);
      message.error(e?.message || '提交失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  // ========== 节假日配置相关方法 ==========

  // 获取节假日列表：调用后端接口获取所有节假日配置
  const fetchHolidays = async () => {
    setHolidayLoading(true);
    try {
      const res = await getAllHolidaysUsingGet();
      if (res.code === 0 && res.data) {
        setHolidays(res.data);
      }
    } catch (e) {
      console.error('获取节假日配置失败:', e);
    } finally {
      setHolidayLoading(false);
    }
  };

  // 添加节假日：清空表单并打开弹窗
  const handleAddHoliday = () => {
    setEditingHolidayId(null);
    holidayForm.resetFields();
    setHolidayModalOpen(true);
  };

  // 编辑节假日：填充表单数据并打开弹窗
  const handleEditHoliday = (record: any) => {
    setEditingHolidayId(record.id);
    holidayForm.setFieldsValue({
      holidayDate: dayjs(record.holidayDate),
      holidayType: record.holidayType,
      holidayName: record.holidayName,
      description: record.description,
    });
    setHolidayModalOpen(true);
  };

  // 删除节假日：调用后端接口删除指定节假日
  const handleDeleteHoliday = async (id: number) => {
    try {
      const res = await deleteHolidayUsingDelete({ id });
      if (res.code === 0) {
        message.success('删除成功');
        fetchHolidays(); // 刷新列表
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 提交节假日：根据是否有editingHolidayId判断是新增还是更新
  const handleHolidaySubmit = async () => {
    try {
      const values = await holidayForm.validateFields();
      const data: any = {
        holidayDate: values.holidayDate.format('YYYY-MM-DD'),
        holidayType: values.holidayType,
        holidayName: values.holidayName,
        description: values.description || '',
      };

      if (editingHolidayId) {
        // 更新节假日
        data.id = editingHolidayId;
        await updateHolidayUsingPut(data);
        message.success('更新成功');
      } else {
        // 新增节假日
        await createHolidayUsingPost(data);
        message.success('添加成功');
      }

      setHolidayModalOpen(false);
      fetchHolidays(); // 刷新列表
    } catch (e: any) {
      if (e?.errorFields) return; // 表单校验失败
      message.error(e?.message || '操作失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>考勤规则配置</h1>
          <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>管理考勤组、工作日及打卡规则</span>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
            新增考勤组
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
          {groups.map((group) => {
            const typeInfo = SHIFT_TYPE_MAP[group.shiftType] || { label: '未知', color: '#999' };
            return (
              <Card key={group.id} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{group.groupName}</div>
                  </div>
                  {isAdmin && (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => handleEditGroup(group)} />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteGroup(group.id)} />
                    </Space>
                  )}
                </div>
                <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
                  {group.workStartTime} - {group.workEndTime}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  {group.departments.length > 0 ? group.departments.join('、') : '未分配部门'} · {group.employeeCount}人
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  迟到阈值 {group.lateThreshold}min
                </div>
              </Card>
            );
          })}
        </div>
      </Spin>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 16 }}>工作日设置</div>
            {isAdmin && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddHoliday}>
                添加日期
              </Button>
            )}
          </div>
          <Spin spinning={holidayLoading}>
            {holidays.length > 0 ? (
              <Table
                dataSource={holidays}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '日期',
                    dataIndex: 'holidayDate',
                    width: 110,
                    render: (d: string) => d?.split(' ')[0] || d,
                  },
                  {
                    title: '类型',
                    dataIndex: 'holidayType',
                    width: 120,
                    render: (t: number) => {
                      const info = HOLIDAY_TYPE_MAP[t];
                      return <Tag color={info?.color}>{info?.label || t}</Tag>;
                    },
                  },
                  { title: '名称', dataIndex: 'holidayName', ellipsis: true },
                  ...(isAdmin ? [{
                    title: '操作',
                    width: 100,
                    render: (_: any, record: any) => (
                      <Space size={0}>
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditHoliday(record)} />
                        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteHoliday(record.id)}>
                          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    ),
                  }] : []),
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>暂无节假日配置</div>
            )}
          </Spin>
          <div style={{ padding: 12, backgroundColor: '#fffbe6', borderRadius: 8, fontSize: 13, color: '#ad8b00', marginTop: 16 }}>
            默认周一至周五为工作日；在此可配置法定节假日（休息）、调休上班日（周末上班）、公司自定义假期（休息）。
          </div>
        </Card>

        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>打卡规则说明</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RULES.map((rule, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#666' }}>{rule.condition}</span>
                <Tag color={rule.color}>{rule.result}</Tag>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', fontSize: 13, color: '#999' }}>
            补卡申请：每月最多2次，需审批通过后生效。
          </div>
        </Card>
      </div>

      <Modal
        title={editingId ? '编辑考勤组' : '新增考勤组'}
        open={modalVisible}
        confirmLoading={confirmLoading}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="考勤组名称" name="name" rules={[{ required: true, message: '请输入考勤组名称' }]}>
            <Input placeholder="请输入考勤组名称" />
          </Form.Item>
          <Form.Item label="考勤类型" name="type" rules={[{ required: true, message: '请选择考勤类型' }]}>
            <Select>
              <Select.Option value="0">固定班</Select.Option>
              <Select.Option value="1">弹性班</Select.Option>
              <Select.Option value="2">排班制</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="上班时间" name="startTime" rules={[{ required: true, message: '请输入上班时间' }]}>
            <Input placeholder="如：09:00" />
          </Form.Item>
          <Form.Item label="下班时间" name="endTime" rules={[{ required: true, message: '请输入下班时间' }]}>
            <Input placeholder="如：18:00" />
          </Form.Item>
          <Form.Item label="迟到阈值(分钟)" name="lateThreshold" rules={[{ required: true, message: '请输入迟到阈值' }]}>
            <Input type="number" placeholder="15" />
          </Form.Item>
          <Form.Item label="早退阈值(分钟)" name="earlyThreshold" rules={[{ required: true, message: '请输入早退阈值' }]}>
            <Input type="number" placeholder="15" />
          </Form.Item>
          <Form.Item label="分配部门" name="departmentIds">
            <Select
              mode="multiple"
              placeholder="选择要分配的部门"
              allowClear
              options={departments}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingHolidayId ? '编辑日期配置' : '添加日期配置'}
        open={holidayModalOpen}
        onCancel={() => setHolidayModalOpen(false)}
        onOk={handleHolidaySubmit}
        destroyOnClose
      >
        <Form form={holidayForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="holidayDate"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="holidayType"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              {Object.entries(HOLIDAY_TYPE_MAP).map(([key, val]) => (
                <Select.Option key={key} value={Number(key)}>
                  <Tag color={val.color}>{val.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="holidayName"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="如：元旦、春节调休" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleConfig;
