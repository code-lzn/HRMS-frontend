import { useState, useEffect } from 'react';
import { Card, Button, Tag, Table, Modal, Form, Input, Select, DatePicker, Space, message, Spin, Timeline, Radio } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import dayjs from 'dayjs';
import {
  getMyLeavesUsingGet,
  applyUsingPost,
  getBalanceUsingGet,
  cancelUsingPost,
  getApprovalProgressUsingGet,
} from '@/api/leaveController';
import { getMyMakeupPunchesUsingGet, getMakeupProgressUsingGet, cancelMakeupUsingPost } from '@/api/makeupPunchController';
import { getMyOvertimesUsingGet, cancelOvertimeUsingPost } from '@/api/overtimeController';

const LEAVE_TYPES: { value: any; label: string; color: string }[] = [
  { value: 2, label: '年假', color: '#52c41a' },
  { value: 1, label: '病假', color: '#faad14' },
  { value: 0, label: '事假', color: '#fa8c16' },
  { value: 3, label: '婚假', color: '#722ed1' },
  { value: 4, label: '产假', color: '#eb2f96' },
  { value: 5, label: '丧假', color: '#666' },
  { value: 6, label: '调休', color: '#1890ff' },
  { value: 'makeup', label: '补卡', color: '#13c2c2' },
  { value: 'overtime', label: '加班', color: '#fa541c' },
];

const APPROVAL_RULES = [
  { type: '年假/调休', condition: '≤ 3天', approver: '直接上级' },
  { type: '年假/调休', condition: '> 3天', approver: '直接上级 → 部门负责人' },
  { type: '病假/事假', condition: '≤ 1天', approver: '直接上级' },
  { type: '病假/事假', condition: '> 1天', approver: '直接上级 → 部门负责人' },
  { type: '婚假/产假/丧假', condition: '-', approver: '直接上级 → HR备案' },
];

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  approved: { color: '#52c41a', text: '已批准' },
  approving: { color: '#1890ff', text: '审批中' },
  rejected: { color: '#ff4d4f', text: '已拒绝' },
  pending: { color: '#faad14', text: '待审批' },
};

interface LeaveRecord {
  id: number;
  recordType: 'leave' | 'makeup' | 'overtime';
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  approverName: string;
  createTime: string;
  status: string;
  punchTypeText?: string;
  overtimeTypeText?: string;
}

interface LeaveBalance {
  annualRemaining: number;
  compRemaining: number;
}

const LeaveManagement: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({ annualRemaining: 0, compRemaining: 0 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);

  useEffect(() => {
    fetchLeaveRecords();
    fetchLeaveBalance();
  }, []);

  const fetchLeaveRecords = async () => {
    try {
      const [leaveRes, makeupRes, overtimeRes] = await Promise.all([
        getMyLeavesUsingGet(),
        getMyMakeupPunchesUsingGet(),
        getMyOvertimesUsingGet(),
      ]);

      const leaveList: LeaveRecord[] = (leaveRes.code === 0 && leaveRes.data ? leaveRes.data : []).map((r: any) => ({
        id: r.id,
        recordType: 'leave' as const,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        days: r.days ?? r.totalDays ?? 0,
        reason: r.reason,
        approverName: r.employeeName || '待分配',
        overtimeTypeText: (r as any).timeSlotText,
        createTime: r.createTime,
        status: r.status === 1 ? 'approved' : (r.status === 2 ? 'rejected' : (r.status === 0 ? 'approving' : 'pending')),
      }));

      const makeupList: LeaveRecord[] = (makeupRes.code === 0 && makeupRes.data ? makeupRes.data : []).map((r: any) => ({
        id: r.id,
        recordType: 'makeup' as const,
        leaveType: 'makeup',
        startDate: r.punchDate,
        endDate: r.punchDate,
        days: 0.5,
        reason: r.reason,
        approverName: r.employeeName || '待分配',
        createTime: r.createTime,
        status: r.status === 1 ? 'approved' : (r.status === 2 ? 'rejected' : (r.status === 0 ? 'approving' : 'pending')),
        punchTypeText: r.punchTypeText,
      }));

      const overtimeList: LeaveRecord[] = (overtimeRes.code === 0 && overtimeRes.data ? overtimeRes.data : []).map((r: any) => ({
        id: r.id,
        recordType: 'overtime' as const,
        leaveType: 'overtime',
        startDate: r.overtimeDate,
        endDate: r.overtimeDate,
        days: r.overtimeHours ?? 0,
        reason: r.reason,
        approverName: r.employeeName || '待分配',
        createTime: r.createTime,
        status: r.status === 1 ? 'approved' : (r.status === 2 ? 'rejected' : (r.status === 0 ? 'approving' : 'pending')),
        overtimeTypeText: r.overtimeTypeText,
      }));

      const merged = [...leaveList, ...makeupList, ...overtimeList].sort((a, b) =>
        (b.createTime || '').localeCompare(a.createTime || ''),
      );
      setLeaveRecords(merged);
    } catch (e) {
      console.error('获取记录失败:', e);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await getBalanceUsingGet();
      if (res.code === 0 && res.data) {
        setLeaveBalance({
          annualRemaining: res.data.annualRemaining || 0,
          compRemaining: res.data.compRemaining || 0,
        });
      }
    } catch (e) {
      console.error('获取假期余额失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => navigate('/personal/leave');

  const handleViewProgress = async (record: LeaveRecord) => {
    setSelectedRecord(record);
    setProgressOpen(true);
    try {
      if (record.recordType === 'makeup') {
        const res = await getMakeupProgressUsingGet({ id: record.id });
        setProgressData(res?.data ?? null);
      } else {
        const res = await getApprovalProgressUsingGet({ id: record.id });
        setProgressData(res?.data ?? null);
      }
    } catch {
      setProgressData(null);
    }
  };

  const handleCancel = async (record: LeaveRecord) => {
    try {
      let res: any;
      if (record.recordType === 'makeup') {
        res = await cancelMakeupUsingPost({ id: record.id });
      } else if (record.recordType === 'overtime') {
        res = await cancelOvertimeUsingPost({ id: record.id });
      } else {
        res = await cancelUsingPost({ id: record.id });
      }
      if (res.code === 0) {
        message.success('已取消申请');
        fetchLeaveRecords();
        fetchLeaveBalance();
      }
    } catch (e) {
      message.error('取消失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        leaveType: values.type,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        days: values.days,
        reason: values.reason,
        handoverPerson: values.handover,
        timeSlot: values.timeSlot ?? 0,
      };

      const res = await applyUsingPost(data);
      if (res.code === 0) {
        message.success('请假申请已提交');
        setModalVisible(false);
        fetchLeaveRecords();
        fetchLeaveBalance();
      }
    } catch (e) {
      console.error('提交失败:', e);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>请假管理</h1>
          <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>查看余额、申请请假、跟踪审批进度</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleApply}>
          申请请假
        </Button>
      </div>

      <Spin spinning={loading}>
        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>假期余额</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 120 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid #e6f7ff', position: 'relative', marginBottom: 12 }}>
                <div style={{ width: '60%', height: '60%', borderRadius: '50%', background: `conic-gradient(#1890ff 0% ${Math.min(leaveBalance.annualRemaining * 10, 100)}%, transparent ${Math.min(leaveBalance.annualRemaining * 10, 100)}%)`, position: 'absolute', top: '20%', left: '20%' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{leaveBalance.annualRemaining}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>天</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>年假余额</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid #f3e8ff', position: 'relative', marginBottom: 12 }}>
                <div style={{ width: '60%', height: '60%', borderRadius: '50%', background: `conic-gradient(#722ed1 0% ${Math.min(leaveBalance.compRemaining * 10, 100)}%, transparent ${Math.min(leaveBalance.compRemaining * 10, 100)}%)`, position: 'absolute', top: '20%', left: '20%' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{leaveBalance.compRemaining}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>天</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>调休余额</div>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>审批流规则</div>
          <Table
            columns={[
              { title: '请假类型+天数', dataIndex: 'type', key: 'type', render: (t, r) => `${r.type} ${r.condition}` },
              { title: '审批人', dataIndex: 'approver', key: 'approver' },
            ]}
            dataSource={APPROVAL_RULES}
            pagination={false}
            bordered
          />
        </Card>

        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>请假记录</div>
          {leaveRecords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaveRecords.map((record) => {
                const typeInfo = LEAVE_TYPES.find((t) => t.value === record.leaveType);
                const statusInfo = STATUS_MAP[record.status] || { color: '#999', text: '未知' };
                const isMakeup = record.recordType === 'makeup';
                const isOvertime = record.recordType === 'overtime';
                return (
                  <div key={`${record.recordType}-${record.id}`} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: `${typeInfo?.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarOutlined style={{ fontSize: 24, color: typeInfo?.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Tag color={typeInfo?.color}>
                            {isMakeup ? `${typeInfo?.label}(${record.punchTypeText})`
                              : isOvertime ? `${typeInfo?.label}(${record.overtimeTypeText})`
                              : typeInfo?.label}
                          </Tag>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>
                            {isMakeup ? record.startDate
                              : isOvertime ? record.startDate
                              : `${record.startDate} ~ ${record.endDate}`}
                          </span>
                          {record.overtimeTypeText && record.overtimeTypeText !== '全天' && (
                            <Tag color="orange">{record.overtimeTypeText}</Tag>
                          )}
                          <span style={{ fontSize: 14, color: '#999' }}>
                            {isOvertime ? `${record.days}h` : (isMakeup ? '' : `共${record.days}天`)}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>事由：{record.reason}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>申请人：{record.approverName} · 申请时间：{record.createTime}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>
                        <Space>
                          {!isOvertime && (
                            <Button type="link" size="small" onClick={() => handleViewProgress(record)}>查看进度</Button>
                          )}
                          {(record.status === 'approving' || record.status === 'pending') && (
                            <Button size="small" danger onClick={() => handleCancel(record)}>撤回</Button>
                          )}
                        </Space>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
              <CalendarOutlined style={{ fontSize: 48, marginBottom: 12 }} />
              <div>暂无请假记录</div>
            </div>
          )}
        </Card>
      </Spin>

      <Modal
        title="审批进度"
        open={progressOpen}
        onCancel={() => setProgressOpen(false)}
        footer={null}
        width={500}
      >
        {selectedRecord && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>{selectedRecord.recordType === 'makeup' ? '补卡类型' : '请假类型'}：</strong>
              <Tag color={LEAVE_TYPES.find(t => t.value === selectedRecord.leaveType)?.color}>
                {selectedRecord.recordType === 'makeup'
                  ? `补卡(${selectedRecord.punchTypeText})`
                  : LEAVE_TYPES.find(t => t.value === selectedRecord.leaveType)?.label}
              </Tag>
            </p>
            <p><strong>时间：</strong>
              {selectedRecord.recordType === 'makeup'
                ? selectedRecord.startDate
                : `${selectedRecord.startDate} ~ ${selectedRecord.endDate}（${selectedRecord.days}天）`}
            </p>
            <p><strong>原因：</strong>{selectedRecord.reason}</p>
            <p><strong>状态：</strong>
              <Tag color={STATUS_MAP[selectedRecord.status]?.color}>{STATUS_MAP[selectedRecord.status]?.text}</Tag>
            </p>
          </div>
        )}
        <Timeline
          items={(progressData?.progressNodes ?? []).map((node: any) => ({
            color: node.status === 0 ? 'green' : node.status === 1 ? 'blue' : 'gray',
            children: (
              <div>
                <div style={{ fontWeight: 500 }}>{node.nodeName}</div>
                {node.operatorName && (
                  <div style={{ color: '#666', fontSize: 13 }}>
                    {node.operatorName}
                    {node.operateTime && ` · ${dayjs(node.operateTime).format('YYYY-MM-DD HH:mm')}`}
                  </div>
                )}
                {node.comment && (
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    {node.status === 2 ? '原因：' : '意见：'}{node.comment}
                  </div>
                )}
              </div>
            ),
          }))}
        />
      </Modal>

      <Modal
        title="申请请假"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="请假类型" name="type" rules={[{ required: true, message: '请选择请假类型' }]}>
            <Select>
              {LEAVE_TYPES.map((t) => (
                <Select.Option key={t.value} value={t.value}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item label="开始时间" name="startDate" rules={[{ required: true, message: '请选择开始时间' }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="结束时间" name="endDate" rules={[{ required: true, message: '请选择结束时间' }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item label="时段" name="timeSlot" initialValue={0}>
            <Radio.Group>
              <Radio value={0}>全天</Radio>
              <Radio value={1}>上午</Radio>
              <Radio value={2}>下午</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="请假天数" name="days">
            <Input disabled style={{ backgroundColor: '#f5f5f5' }} placeholder="根据起止日期自动计算" />
          </Form.Item>

          <Form.Item label="请假事由" name="reason" rules={[{ required: true, message: '请输入请假事由' }]}>
            <Input.TextArea rows={3} placeholder="请输入请假事由" />
          </Form.Item>

          <Form.Item label="工作交接人" name="handover">
            <Select placeholder="请选择工作交接人" showSearch
              filterOption={(input: string, option: any) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
