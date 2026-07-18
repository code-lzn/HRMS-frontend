import { useState, useEffect } from 'react';
import { Card, Button, Tag, Table, Modal, Form, Input, Select, Space, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import {
  getAllGroupsUsingGet,
  createGroupUsingPost,
  updateGroupUsingPut,
  deleteGroupUsingDelete,
} from '@/api/attendanceRuleController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';

const WORKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  '0': { label: '固定班', color: '#1890ff' },
  '1': { label: '弹性班', color: '#722ed1' },
  '2': { label: '排班制', color: '#fa8c16' },
};

const RULES = [
  { condition: '上班打卡时间 ≤ 规定时间', result: '正常', color: '#52c41a' },
  { condition: '规定时间 < 上班打卡时间 ≤ 规定时间+阈值', result: '迟到', color: '#faad14' },
  { condition: '上班打卡时间 > 规定时间+阈值', result: '旷工', color: '#ff4d4f' },
  { condition: '下班打卡时间 ≥ 规定时间', result: '正常', color: '#52c41a' },
  { condition: '规定时间-阈值 ≤ 下班打卡时间 < 规定时间', result: '早退', color: '#fa8c16' },
  { condition: '下班打卡时间 < 规定时间-阈值', result: '旷工', color: '#ff4d4f' },
  { condition: '当日无打卡记录', result: '缺勤', color: '#ff4d4f' },
];

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

const RuleConfig: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedWorkdays, setSelectedWorkdays] = useState<string[]>(['周一', '周二', '周三', '周四', '周五']);
  const [form] = Form.useForm();
  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchDepartments();
  }, []);

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

  const handleAddGroup = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

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

  const handleDeleteGroup = async (id: number) => {
    try {
      const res = await deleteGroupUsingDelete({ id });
      if (res.code === 0) {
        message.success('删除成功');
        fetchGroups();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

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
        data.id = editingId;
        await updateGroupUsingPut(data);
        message.success('更新成功');
      } else {
        await createGroupUsingPost(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchGroups();
    } catch (e: any) {
      if (e?.errorFields) {
        // form validation error, don't show message, fields will highlight
        return;
      }
      console.error('提交失败:', e);
      message.error(e?.message || '提交失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>考勤规则配置</h1>
          <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>管理考勤组、工作日及打卡规则</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
          新增考勤组
        </Button>
      </div>

      <Spin spinning={loading}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
          {groups.map((group) => {
            const typeInfo = TYPE_MAP[group.shiftType] || { label: '未知', color: '#999' };
            return (
              <Card key={group.id} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{group.groupName}</div>
                  </div>
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditGroup(group)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteGroup(group.id)} />
                  </Space>
                </div>
                <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
                  {group.workStartTime} - {group.workEndTime}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  {group.departments.length > 0 ? group.departments.join('、') : '未分配部门'} · {group.employeeCount}人
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>迟到阈值 {group.lateThreshold}min</div>
              </Card>
            );
          })}
        </div>
      </Spin>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>工作日设置</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {WORKDAYS.map((day) => (
              <Button
                key={day}
                type={selectedWorkdays.includes(day) ? 'primary' : 'default'}
                shape="round"
                onClick={() => {
                  if (selectedWorkdays.includes(day)) {
                    setSelectedWorkdays(selectedWorkdays.filter((d) => d !== day));
                  } else {
                    setSelectedWorkdays([...selectedWorkdays, day]);
                  }
                }}
              >
                {day}
              </Button>
            ))}
          </div>
          <div style={{ padding: 12, backgroundColor: '#fffbe6', borderRadius: 8, fontSize: 13, color: '#ad8b00' }}>
            法定节假日需提前在系统中配置，配置后将自动排除在工作日之外。
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
    </div>
  );
};

export default RuleConfig;
