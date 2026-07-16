import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, Button, message } from 'antd';
import { createAttendanceUsingPost, updateAttendanceUsingPost } from '@/api/hrAttendanceController';
import { listEmployeesUsingGet } from '@/api/employeeController';
import { useRequest } from '@umijs/max';
import dayjs from 'dayjs';

const { Option } = Select;

const LEAVE_TYPE_OPTIONS = [
  { value: '', label: '无' },
  { value: '0', label: '事假' },
  { value: '1', label: '病假' },
  { value: '2', label: '年假' },
  { value: '3', label: '婚假' },
  { value: '4', label: '产假' },
  { value: '5', label: '丧假' },
  { value: '6', label: '调休' },
];

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  record?: API.HRAttendanceVO | null;
}

const AddModal: React.FC<AddModalProps> = ({ visible, onClose, onSave, title, record }) => {
  const [form] = Form.useForm();

  const { data: employees } = useRequest(() =>
    listEmployeesUsingGet({ pageSize: 1000 }).then((r) => r?.data?.list || [])
  );

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        employeeId: record.employeeId,
        month: record.month,
        attendanceDate: dayjs(record.attendanceDate),
        punchInTime: record.punchInTime ? dayjs(record.punchInTime) : undefined,
        punchOutTime: record.punchOutTime ? dayjs(record.punchOutTime) : undefined,
        punchInLocation: record.punchInLocation,
        punchOutLocation: record.punchOutLocation,
        overtimeHours: record.overtimeHours,
        leaveType: record.leaveTypeText ? String(record.leaveTypeText === '事假' ? 0 : record.leaveTypeText === '病假' ? 1 : record.leaveTypeText === '年假' ? 2 : record.leaveTypeText === '婚假' ? 3 : record.leaveTypeText === '产假' ? 4 : record.leaveTypeText === '丧假' ? 5 : 6) : '',
        remark: record.remark,
      });
    } else if (visible && !record) {
      form.resetFields();
      form.setFieldsValue({
        month: dayjs().format('YYYY-MM'),
        attendanceDate: dayjs(),
      });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: API.HRAttendanceDTO = {
        id: record?.id,
        employeeId: values.employeeId,
        month: values.month,
        attendanceDate: values.attendanceDate?.format('YYYY-MM-DD'),
        punchInTime: values.punchInTime?.format('YYYY-MM-DD HH:mm:ss'),
        punchOutTime: values.punchOutTime?.format('YYYY-MM-DD HH:mm:ss'),
        punchInLocation: values.punchInLocation,
        punchOutLocation: values.punchOutLocation,
        overtimeHours: values.overtimeHours,
        leaveType: values.leaveType || undefined,
        remark: values.remark,
      };

      if (record) {
        await updateAttendanceUsingPost(data);
      } else {
        await createAttendanceUsingPost(data);
      }

      onSave();
    } catch (error) {
      message.error('保存失败，请检查表单');
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          保存
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="employeeId"
          label="员工"
          rules={[{ required: true, message: '请选择员工' }]}
        >
          <Select placeholder="请选择员工" showSearch optionFilterProp="children">
            {employees?.map((emp) => (
              <Option key={emp.id} value={emp.id}>
                {emp.employeeName} ({emp.employeeNo})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="month"
          label="考勤月份"
          rules={[{ required: true, message: '请选择考勤月份' }]}
        >
          <DatePicker picker="month" format="YYYY-MM" />
        </Form.Item>

        <Form.Item
          name="attendanceDate"
          label="打卡日期"
          rules={[{ required: true, message: '请选择打卡日期' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item name="punchInTime" label="上班打卡时间">
          <TimePicker format="HH:mm:ss" />
        </Form.Item>

        <Form.Item name="punchOutTime" label="下班打卡时间">
          <TimePicker format="HH:mm:ss" />
        </Form.Item>

        <Form.Item name="punchInLocation" label="上班打卡地点">
          <Input placeholder="请输入打卡地点" />
        </Form.Item>

        <Form.Item name="punchOutLocation" label="下班打卡地点">
          <Input placeholder="请输入打卡地点" />
        </Form.Item>

        <Form.Item name="overtimeHours" label="加班时长">
          <InputNumber placeholder="小时" min={0} max={24} step={0.5} />
        </Form.Item>

        <Form.Item name="leaveType" label="请假类型">
          <Select placeholder="请选择">
            {LEAVE_TYPE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;