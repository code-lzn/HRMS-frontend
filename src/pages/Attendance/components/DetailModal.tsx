import React from 'react';
import { Modal, Card, Descriptions, Tag } from 'antd';

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

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  record?: API.HRAttendanceVO | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ visible, onClose, record }) => {
  if (!record) return null;

  return (
    <Modal
      title="考勤详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Card title="员工信息" style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="工号">{record.employeeNo}</Descriptions.Item>
          <Descriptions.Item label="姓名">{record.employeeName}</Descriptions.Item>
          <Descriptions.Item label="部门">{record.deptName}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="打卡数据" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="考勤月份">{record.month}</Descriptions.Item>
          <Descriptions.Item label="打卡日期">
            {record.attendanceDate?.split(' ')[0]}
          </Descriptions.Item>
          <Descriptions.Item label="上班时间">
            {record.punchInTime?.split(' ')[1] || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="下班时间">
            {record.punchOutTime?.split(' ')[1] || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="上班地点">
            {record.punchInLocation || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="下班地点">
            {record.punchOutLocation || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="考勤统计" style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="考勤状态">
            <Tag color={STATUS_COLOR_MAP[record.status!]}>
              {STATUS_TEXT_MAP[record.status!]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="迟到时长">
            {record.lateMinutes || 0}分钟
          </Descriptions.Item>
          <Descriptions.Item label="早退时长">
            {record.earlyMinutes || 0}分钟
          </Descriptions.Item>
          <Descriptions.Item label="加班时长">
            {record.overtimeHours || 0}小时
          </Descriptions.Item>
          <Descriptions.Item label="请假类型" span={2}>
            {record.leaveTypeText || '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {record.remark && (
        <Card title="备注">
          <p style={{ margin: 0 }}>{record.remark}</p>
        </Card>
      )}

      <Card title="操作记录" size="small" style={{ marginTop: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="创建时间">
            {record.createTime}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {record.updateTime}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Modal>
  );
};

export default DetailModal;