import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Tag, Table, Space, Spin, message, Select } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import dayjs from 'dayjs';
import usePermission from '@/hooks/usePermission';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';

const STATUS_COLOR_MAP: Record<string, string> = {
  NORMAL: '#52c41a',
  LATE: '#faad14',
  EARLY: '#fa8c16',
  MISSING: '#bfbfbf',
  LEAVE: '#1890ff',
  ABSENT: '#ff4d4f',
  MISS_IN: '#722ed1',
  MISS_OUT: '#1890ff',
};

const STATUS_TEXT_MAP: Record<string, string> = {
  NORMAL: '正常',
  LATE: '迟到',
  EARLY: '早退',
  MISSING: '缺卡',
  LEAVE: '请假',
  ABSENT: '旷工',
  MISS_IN: '上班缺卡',
  MISS_OUT: '下班缺卡',
};

const STATUS_DESC_MAP: Record<string, string> = {
  NORMAL: '按时打卡，无异常',
  LATE: '超出规定时间15分钟内',
  EARLY: '提前15分钟内下班',
  MISSING: '当日无打卡记录',
  LEAVE: '已申请请假',
  ABSENT: '超出阈值超过15分钟',
  MISS_IN: '上班未打卡，下班有记录',
  MISS_OUT: '上班已打卡，下班无记录',
};

const Attendance: React.FC = () => {
  const { isAdmin, roleCode, dataScope } = usePermission();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [todayStatus, setTodayStatus] = useState<{ inDone: boolean; inTime: string; outDone: boolean; outTime: string }>({
    inDone: false,
    inTime: '',
    outDone: false,
    outTime: '',
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTodayStatus();
    fetchDepartmentList();
  }, []);

  const fetchDepartmentList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      if (res.code === 0 && res.data) {
        const options: { value: string; label: string }[] = [];
        const traverse = (nodes: any[]) => {
          nodes.forEach(node => {
            options.push({ value: node.id, label: node.name });
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

  const fetchTodayStatus = async () => {
    try {
      const res = await fetch('/api/attendance/today');
      const data = await res.json();
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

  const handlePunch = async (type: 'in' | 'out') => {
    try {
      const res = await fetch('/api/attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ punchType: type === 'in' ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.code === 0) {
        message.success(type === 'in' ? '上班打卡成功' : '下班打卡成功');
        fetchTodayStatus();
      } else {
        message.error(data.message || '打卡失败');
      }
    } catch (e) {
      message.error('打卡失败');
    }
  };

  const queryParams = new URLSearchParams();
  queryParams.set('month', currentMonth);
  if (selectedDept) {
    queryParams.set('departmentId', selectedDept);
  }

  const { data, loading, run } = useRequest(
    async () => {
      const res = await fetch(`/api/hr/attendance/list?${queryParams.toString()}`);
      const result = await res.json();
      return result.data;
    },
    {
      refreshOnWindowFocus: false,
      onError: () => message.error('获取考勤数据失败'),
    }
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM'));
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format('YYYY-MM'));
  }, [currentMonth]);

  const columns = [
    {
      title: '日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 120,
      render: (date: string) => date?.split(' ')[0] || '-',
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
      render: (time: string) => time?.split(' ')[1] || '-',
    },
    {
      title: '下班时间',
      dataIndex: 'punchOutTime',
      key: 'punchOutTime',
      width: 120,
      render: (time: string) => time?.split(' ')[1] || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string | number) => {
        const statusKey = typeof status === 'number' 
          ? ['NORMAL', 'LATE', 'EARLY', 'MISSING', 'LEAVE', 'ABSENT', 'MISS_IN', 'MISS_OUT'][status] || 'NORMAL'
          : status;
        return <Tag color={STATUS_COLOR_MAP[statusKey]}>{STATUS_TEXT_MAP[statusKey]}</Tag>;
      },
    },
  ];

  const showDeptFilter = isAdmin || dataScope <= 3;
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
                  onChange={setSelectedDept}
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
              <Button type="primary" icon={<PlusOutlined />}>
                申请补卡 (1/2)
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={data?.list || []}
            rowKey="id"
            pagination={{
              total: data?.total || 0,
              pageSize: 20,
              showTotal: (total) => `共 ${total} 条`,
            }}
            locale={{
              emptyText: '暂无打卡记录',
            }}
            style={{ borderRadius: 8 }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default Attendance;