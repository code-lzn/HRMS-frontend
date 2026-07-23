import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Tag, Table, Space, Spin, message, Select, Alert, Modal, Form, DatePicker, TimePicker, Input, Radio } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, FieldTimeOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import usePermission from '@/hooks/usePermission';
import request from '@/libs/request';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { getCalendarUsingGet } from '@/api/attendanceController';
import { applyUsingPost1 as applyMakeupPunch } from '@/api/makeupPunchController';
import { applyUsingPost2 as applyOvertime } from '@/api/overtimeController';

// 考勤状态颜色映射表：用于表格中状态标签的颜色显示
const STATUS_COLOR_MAP: Record<string, string> = {
  NORMAL: '#52c41a',
  LATE: '#faad14',
  EARLY: '#fa8c16',
  MISSING: '#bfbfbf',
  LEAVE: '#1890ff',
  ABSENT: '#ff4d4f',
  MISS_IN: '#722ed1',
  MISS_OUT: '#1890ff',
  REST: '#87d068',
  LATE_AND_EARLY: '#ff7a45',
};

// 考勤状态文本映射表：将状态枚举值转换为中文显示
const STATUS_TEXT_MAP: Record<string, string> = {
  NORMAL: '正常',
  LATE: '迟到',
  EARLY: '早退',
  MISSING: '缺卡',
  LEAVE: '请假',
  ABSENT: '旷工',
  MISS_IN: '上班缺卡',
  MISS_OUT: '下班缺卡',
  REST: '休息',
  LATE_AND_EARLY: '迟到&早退',
};

// 考勤状态描述映射表：用于页面下方状态说明区域的详细解释
const STATUS_DESC_MAP: Record<string, string> = {
  NORMAL: '按时打卡，无异常',
  LATE: '超出规定时间15分钟内',
  EARLY: '提前15分钟内下班',
  MISSING: '当日无打卡记录',
  LEAVE: '已申请请假',
  ABSENT: '上下班打卡间隔不足两小时',
  MISS_IN: '上班未打卡，下班有记录',
  MISS_OUT: '上班已打卡，下班无记录',
  REST: '周末或节假日休息',
  LATE_AND_EARLY: '迟到且早退',
};

// 打卡中心组件：实现打卡操作、考勤记录查询、补卡/加班申请功能
const Attendance: React.FC = () => {
  // 获取用户权限信息（是否管理员、角色码、数据范围）
  const { isAdmin, roleCode, dataScope } = usePermission();
  // 当前时间状态：用于页面右上角实时时钟显示
  const [currentTime, setCurrentTime] = useState(new Date());
  // 当前选中月份：用于筛选考勤记录
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  // 当前选中部门ID：管理员/HR用于筛选指定部门的考勤记录
  const [selectedDept, setSelectedDept] = useState<string>('');
  // 部门列表：用于部门下拉框选项
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  // 分页状态：当前页码
  const [pageNum, setPageNum] = useState(1);
  // 分页状态：每页显示数量
  const [pageSize, setPageSize] = useState(20);
  // 今日打卡状态：包含上班/下班是否已打卡及打卡时间
  const [todayStatus, setTodayStatus] = useState<{ inDone: boolean; inTime: string; outDone: boolean; outTime: string }>({
    inDone: false,
    inTime: '',
    outDone: false,
    outTime: '',
  });

  // 定时器：每秒更新当前时间，实现实时时钟效果
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer); // 组件卸载时清除定时器
  }, []);

  // 初始化数据：组件挂载时获取今日打卡状态、部门列表和日历数据
  useEffect(() => {
    fetchTodayStatus();
    fetchDepartmentList();
    loadCalendarData(currentMonth);
  }, []);

  // 获取部门列表：递归遍历部门树，构建下拉框选项
  const fetchDepartmentList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      if (res.code === 0 && res.data) {
        const options: { value: string; label: string }[] = [];
        const traverse = (nodes: any[]) => {
          nodes.forEach(node => {
            options.push({ value: node.id, label: node.name });
            if (node.children) {
              traverse(node.children); // 递归处理子部门
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

  // 获取今日打卡状态：调用后端接口查询用户当天的上班/下班打卡记录
  const fetchTodayStatus = async () => {
    try {
      const data = await request.get('/api/attendance/today');
      if (data.code === 0 && data.data) {
        const d = data.data;
        setTodayStatus({
          inDone: d.punchInTime !== null && d.punchInTime !== undefined,
          inTime: d.punchInTime ? dayjs(d.punchInTime).format('HH:mm') : '',
          outDone: d.punchOutTime !== null && d.punchOutTime !== undefined,
          outTime: d.punchOutTime ? dayjs(d.punchOutTime).format('HH:mm') : '',
        });
      }
    } catch (e) {
      console.error('获取今日打卡状态失败', e);
    }
  };

  // 打卡操作：提交上班/下班打卡请求，成功后刷新今日状态
  const handlePunch = async (type: 'in' | 'out') => {
    try {
      const data = await request.post('/api/attendance/punch', {
        punchType: type === 'in' ? 0 : 1, // 0=上班打卡，1=下班打卡
      });
      if (data.code === 0) {
        message.success(type === 'in' ? '上班打卡成功' : '下班打卡成功');
        fetchTodayStatus(); // 刷新打卡状态
      }
    } catch (e: any) {
      message.error(e.message || '打卡失败');
    }
  };

  // 部门筛选可见性：管理员或部门主管(dataScope<=3)可以看到部门筛选
  const showDeptFilter = isAdmin || dataScope <= 3;

  // 判断是否为管理员或部门主管：决定数据查询接口路径
  const isAdminOrManager = isAdmin || dataScope <= 3;

  // 考勤数据状态：包含考勤记录列表和总数
  const [attendanceData, setAttendanceData] = useState<{ list: any[]; total: number }>({ list: [], total: 0 });
  // 数据加载状态：控制页面加载动画
  const [loading, setLoading] = useState(false);
  // 数据加载错误状态：用于显示错误提示
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ===== 补卡申请相关状态 =====
  const [makeupModalOpen, setMakeupModalOpen] = useState(false); // 补卡弹窗开关
  const [makeupForm] = Form.useForm(); // 补卡表单实例
  const [makeupLoading, setMakeupLoading] = useState(false); // 补卡提交加载状态
  const [makeupAvailableDates, setMakeupAvailableDates] = useState<string[]>([]); // 可补卡日期列表

  // ===== 加班申请相关状态 =====
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false); // 加班弹窗开关
  const [overtimeForm] = Form.useForm(); // 加班表单实例
  const [overtimeLoading, setOvertimeLoading] = useState(false); // 加班提交加载状态

  // 加载日历数据：获取指定月份可补卡日期列表
  const loadCalendarData = useCallback(async (month: string) => {
    try {
      const res = await getCalendarUsingGet({ month });
      if (res?.code === 0 && res.data) {
        setMakeupAvailableDates(res.data.makeupAvailableDates || []);
      }
    } catch (e) { console.error('pages/Attendance/index.tsx', e);  /* ignore */ }
  }, []);

  // 获取考勤数据：根据用户角色调用不同接口
  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 兜底操作：管理员/HR确保当天考勤记录已生成
      if (isAdminOrManager) {
        try {
          await request.post('/api/attendance/ensure-today');
        } catch (e) {
          // 静默失败，不影响主流程
        }
      }

      if (isAdminOrManager) {
        // 管理员/HR路径：调用HR考勤列表接口，支持部门筛选和分页
        const queryParams: Record<string, any> = { month: currentMonth, pageNum, pageSize };
        if (selectedDept) {
          queryParams.departmentId = selectedDept;
        }
        const result = await request.get('/api/hr/attendance/list', { params: queryParams });
        setAttendanceData({ list: result.data?.list || [], total: result.data?.total || 0 });
      } else {
        // 普通员工路径：调用个人考勤记录接口
        const result = await request.get('/api/attendance/records', { params: { month: currentMonth } });
        setAttendanceData({ list: result.data || [], total: (result.data || []).length });
      }
    } catch (e: any) {
      console.error('[Attendance] fetch error:', e);
      setFetchError(e.message || '获取考勤数据失败');
    } finally {
      setLoading(false);
    }
  }, [isAdminOrManager, currentMonth, selectedDept, pageNum, pageSize]);

  // 监听数据刷新依赖：当查询条件变化时重新获取考勤数据
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // 上一月切换：重置页码并切换到上一个月
  const handlePrevMonth = useCallback(() => {
    setPageNum(1);
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM'));
  }, [currentMonth]);

  // 下一月切换：重置页码并切换到下一个月
  const handleNextMonth = useCallback(() => {
    setPageNum(1);
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format('YYYY-MM'));
  }, [currentMonth]);

  // 部门切换：重置页码并设置选中部门
  const handleDeptChange = useCallback((value: string) => {
    setPageNum(1);
    setSelectedDept(value);
  }, []);

  // 考勤表格列配置：定义表格显示的列及渲染方式
  const columns = [
    {
      title: '日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 120,
      render: (date: string) => date?.split(' ')[0] || '-', // 只显示日期部分
    },
    {
      title: '姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 120,
    },
    {
      title: '上班时间',
      dataIndex: 'punchInTime',
      key: 'punchInTime',
      width: 120,
      render: (time: string) => time?.split(' ')[1] || '-', // 只显示时间部分
    },
    {
      title: '下班时间',
      dataIndex: 'punchOutTime',
      key: 'punchOutTime',
      width: 120,
      render: (time: string) => time?.split(' ')[1] || '-', // 只显示时间部分
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string | number) => {
        // 状态可能是数字或字符串，统一转换为字符串key
        const statusKey = typeof status === 'number'
          ? ['NORMAL', 'LATE', 'EARLY', 'MISSING', 'LEAVE', 'ABSENT', 'MISS_IN', 'MISS_OUT', 'REST', 'LATE_AND_EARLY'][status] || 'NORMAL'
          : status;
        return <Tag color={STATUS_COLOR_MAP[statusKey]}>{STATUS_TEXT_MAP[statusKey]}</Tag>;
      },
    },
  ];

  // 打卡按钮可见性：非管理员或普通员工(dataScope=5)可以看到打卡按钮
  const showPunchButtons = !isAdmin || dataScope === 5;

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>打卡中心</h1>
            <span style={{ color: '#999', fontSize: 14, marginTop: 4, display: 'block' }}>
              {dayjs().format('YYYY年M月D日')} {['日', '一', '二', '三', '四', '五', '六'][dayjs().day()]}
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#333', fontFamily: 'monospace' }}>
            {dayjs(currentTime).format('HH:mm:ss')}
          </div>
        </div>

        {showPunchButtons && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>上班打卡</div>
                {todayStatus.inDone ? (
                  <div>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{todayStatus.inTime}</div>
                    <div style={{ color: '#999', fontSize: 14, marginTop: 4 }}>今日上班打卡已完成</div>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{ 
                      width: 100, 
                      height: 100, 
                      backgroundColor: '#1890ff', 
                      borderColor: '#1890ff',
                      fontSize: 18,
                      fontWeight: 600,
                      boxShadow: '0 4px 20px rgba(24, 144, 255, 0.3)'
                    }}
                    onClick={() => handlePunch('in')}
                  >
                    <><ClockCircleOutlined style={{ fontSize: 32, marginBottom: 4 }} /><br />点击打卡</>
                  </Button>
                )}
                <div style={{ color: '#999', fontSize: 12, marginTop: 12 }}>
                  {todayStatus.inDone ? '今日上班打卡已完成' : '今日尚未上班打卡'}
                </div>
              </div>
            </Card>

            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>下班打卡</div>
                {todayStatus.outDone ? (
                  <div>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{todayStatus.outTime}</div>
                    <div style={{ color: '#999', fontSize: 14, marginTop: 4 }}>今日下班打卡已完成</div>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{ 
                      width: 100, 
                      height: 100, 
                      backgroundColor: '#722ed1', 
                      borderColor: '#722ed1',
                      fontSize: 18,
                      fontWeight: 600,
                      boxShadow: '0 4px 20px rgba(114, 46, 209, 0.3)'
                    }}
                    onClick={() => handlePunch('out')}
                  >
                    <><ClockCircleOutlined style={{ fontSize: 32, marginBottom: 4 }} /><br />点击打卡</>
                  </Button>
                )}
                <div style={{ color: '#999', fontSize: 12, marginTop: 12 }}>
                  {todayStatus.outDone ? '今日下班打卡已完成' : '今日尚未下班打卡'}
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>打卡状态说明</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_TEXT_MAP).map(([key, text]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={STATUS_COLOR_MAP[key]} style={{ fontWeight: 500 }}>{text}</Tag>
                <span style={{ color: '#666', fontSize: 13 }}>{STATUS_DESC_MAP[key]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CalendarOutlined style={{ fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>{currentMonth} 打卡记录</span>
            </div>
            <Space>
              {showDeptFilter && (
                <Select
                  placeholder="选择部门"
                  style={{ width: 150 }}
                  value={selectedDept}
                  onChange={handleDeptChange}
                  allowClear
                >
                  <Select.Option value="">全部部门</Select.Option>
                  {departments.map(dept => (
                    <Select.Option key={dept.value} value={dept.value}>
                      {dept.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
              <Button onClick={handlePrevMonth}>上月</Button>
              <Button onClick={handleNextMonth}>下月</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                if (makeupAvailableDates.length > 0) {
                  makeupForm.setFieldsValue({
                    punchDate: dayjs(makeupAvailableDates[0]),
                  });
                }
                setMakeupModalOpen(true);
              }}>
                申请补卡
              </Button>
              <Button icon={<FieldTimeOutlined />} onClick={() => setOvertimeModalOpen(true)}>
                申请加班
              </Button>
            </Space>
          </div>

          {fetchError && (
            <Alert
              type="error"
              message={`数据加载失败: ${fetchError}`}
              closable
              style={{ marginBottom: 16 }}
              onClose={() => setFetchError(null)}
            />
          )}
          <div style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
            当前角色: {isAdminOrManager ? '管理员/HR' : '普通员工'} |
            数据范围: {dataScope} |
            记录总数: {attendanceData.total}
          </div>
          <Table
            columns={columns}
            dataSource={attendanceData.list}
            rowKey="id"
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              total: attendanceData.total,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, size) => {
                setPageNum(page);
                setPageSize(size);
              },
            }}
            locale={{
              emptyText: '暂无打卡记录',
            }}
            style={{ borderRadius: 8 }}
          />
        </Card>

        {/* 申请补卡 Modal */}
        <Modal
          title="申请补卡"
          open={makeupModalOpen}
          onOk={async () => {
            try {
              const values = await makeupForm.validateFields();
              setMakeupLoading(true);
              await applyMakeupPunch({
                punchDate: values.punchDate.format('YYYY-MM-DD'),
                punchTime: values.punchTime?.format('HH:mm'),
                punchType: values.punchType,
                reason: values.reason,
              });
              message.success('补卡申请已提交');
              setMakeupModalOpen(false);
              makeupForm.resetFields();
              loadCalendarData(currentMonth);
            } catch (e: any) {
              if (e.message) message.error(e.message);
            } finally {
              setMakeupLoading(false);
            }
          }}
          onCancel={() => {
            setMakeupModalOpen(false);
            makeupForm.resetFields();
          }}
          confirmLoading={makeupLoading}
          destroyOnClose
        >
          <Form form={makeupForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="punchDate"
              label="补卡日期"
              rules={[{ required: true, message: '请选择补卡日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current >= dayjs().startOf('day')}
              />
            </Form.Item>
            <Form.Item
              name="punchType"
              label="打卡类型"
              rules={[{ required: true, message: '请选择打卡类型' }]}
            >
              <Radio.Group>
                <Radio value={0}>上班打卡</Radio>
                <Radio value={1}>下班打卡</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="punchTime"
              label="打卡时间"
              rules={[{ required: true, message: '请选择打卡时间' }]}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item
              name="reason"
              label="补卡原因"
              rules={[{ required: true, message: '请输入补卡原因' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入补卡原因" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 申请加班 Modal */}
        <Modal
          title="申请加班"
          open={overtimeModalOpen}
          onOk={async () => {
            try {
              const values = await overtimeForm.validateFields();
              setOvertimeLoading(true);
              const hours = values.endTime.diff(values.startTime, 'hour', true);
              await applyOvertime({
                overtimeDate: values.overtimeDate.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                overtimeHours: Math.round(hours * 10) / 10,
                overtimeType: values.overtimeType,
                reason: values.reason,
              });
              message.success('加班申请已提交');
              setOvertimeModalOpen(false);
              overtimeForm.resetFields();
            } catch (e: any) {
              if (e.message) message.error(e.message);
            } finally {
              setOvertimeLoading(false);
            }
          }}
          onCancel={() => {
            setOvertimeModalOpen(false);
            overtimeForm.resetFields();
          }}
          confirmLoading={overtimeLoading}
          destroyOnClose
        >
          <Form form={overtimeForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="overtimeDate"
              label="加班日期"
              rules={[{ required: true, message: '请选择加班日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="起止时间" required>
              <Space style={{ display: 'flex' }}>
                <Form.Item
                  name="startTime"
                  noStyle
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="开始时间" />
                </Form.Item>
                <Form.Item
                  name="endTime"
                  noStyle
                  rules={[{ required: true, message: '请选择结束时间' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="结束时间" />
                </Form.Item>
              </Space>
            </Form.Item>
            <Form.Item
              name="overtimeType"
              label="加班类型"
              rules={[{ required: true, message: '请选择加班类型' }]}
              initialValue={0}
            >
              <Radio.Group>
                <Radio value={0}>工作日加班</Radio>
                <Radio value={1}>休息日加班</Radio>
                <Radio value={2}>节假日加班</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="reason"
              label="加班原因"
              rules={[{ required: true, message: '请输入加班原因' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入加班原因" />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Attendance;