import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

const STATUS_COLOR_MAP: Record<number, string> = {
  0: 'green',
  1: 'orange',
  2: 'orange',
  3: 'gray',
  4: 'blue',
  5: 'red',
};

const STATUS_TEXT_MAP: Record<number, string> = {
  0: '正常',
  1: '迟到',
  2: '早退',
  3: '缺卡',
  4: '请假',
  5: '旷工',
};

interface AttendanceTableProps {
  data: API.HRAttendanceVO[];
  total: number;
  pageNum: number;
  pageSize: number;
  selectedRowKeys: number[];
  onPageChange: (pageNum: number, pageSize: number) => void;
  onRowSelectionChange: (keys: number[]) => void;
  onEdit: (record: API.HRAttendanceVO) => void;
  onDetail: (record: API.HRAttendanceVO) => void;
  onDelete: (id: number) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  total,
  pageNum,
  pageSize,
  selectedRowKeys,
  onPageChange,
  onRowSelectionChange,
  onEdit,
  onDetail,
  onDelete,
}) => {
  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
    },
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: API.HRAttendanceVO, index: number) => (pageNum - 1) * pageSize + index + 1,
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 100,
    },
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 120,
    },
    {
      title: '考勤月份',
      dataIndex: 'month',
      key: 'month',
      width: 100,
    },
    {
      title: '打卡日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 120,
      render: (date: string) => date?.split(' ')[0],
      sorter: true,
    },
    {
      title: '上班打卡时间',
      dataIndex: 'punchInTime',
      key: 'punchInTime',
      width: 150,
      render: (time: string) => time?.split(' ')[1] || '-',
    },
    {
      title: '下班打卡时间',
      dataIndex: 'punchOutTime',
      key: 'punchOutTime',
      width: 150,
      render: (time: string) => time?.split(' ')[1] || '-',
    },
    {
      title: '考勤状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={STATUS_COLOR_MAP[status]}>{STATUS_TEXT_MAP[status]}</Tag>
      ),
    },
    {
      title: '迟到时长',
      dataIndex: 'lateMinutes',
      key: 'lateMinutes',
      width: 100,
      render: (minutes: number) => `${minutes || 0}分钟`,
      sorter: true,
    },
    {
      title: '早退时长',
      dataIndex: 'earlyMinutes',
      key: 'earlyMinutes',
      width: 100,
      render: (minutes: number) => `${minutes || 0}分钟`,
      sorter: true,
    },
    {
      title: '加班时长',
      dataIndex: 'overtimeHours',
      key: 'overtimeHours',
      width: 100,
      render: (hours: number) => `${hours || 0}小时`,
      sorter: true,
    },
    {
      title: '请假类型',
      dataIndex: 'leaveTypeText',
      key: 'leaveTypeText',
      width: 100,
      render: (text: string) => text || '无',
    },
    {
      title: '打卡地点',
      dataIndex: 'punchInLocation',
      key: 'punchInLocation',
      width: 120,
      render: (loc: string) => loc || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: API.HRAttendanceVO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onDetail(record)}
          >
            查看详情
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑考勤
          </Button>
          <Button
            type="text"
            icon={<ClockCircleOutlined />}
          >
            补卡申请
          </Button>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(record.id!)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => onRowSelectionChange(keys as number[]),
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection={{
        ...rowSelection,
        hideDefaultSelections: true,
      }}
      pagination={{
        total,
        current: pageNum,
        pageSize,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: (page, size) => onPageChange(page, size),
      }}
      scroll={{ x: 1400 }}
      locale={{
        emptyText: '暂无考勤数据，请切换筛选条件或导入考勤记录',
      }}
    />
  );
};

export default AttendanceTable;