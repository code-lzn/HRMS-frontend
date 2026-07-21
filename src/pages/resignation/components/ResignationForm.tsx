import { CloseOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Divider,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { RESIGNATION_TYPE_MAP } from '@/constants';
import { createUsingPost2 } from '@/api/resignationController';
import { getEmployeeListUsingGet } from '@/api/employeeController';

const { TextArea } = Input;

interface ResignationFormProps {
  open: boolean;
  onClose: () => void;
}

interface EmployeeOption {
  value: number;
  label: string;
  department: string;
  position: string;
}

const resignationTypeOptions = Object.entries(RESIGNATION_TYPE_MAP).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const ResignationFormModal: React.FC<ResignationFormProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeOption | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  useEffect(() => {
    if (!open) return;
    getEmployeeListUsingGet({ current: 1, pageSize: 500 })
      .then((res) => {
        if (res.code === 0 && res.data?.records) {
          setEmployeeOptions(
            res.data.records.filter((e: any) => e.status !== 4).map((e) => ({
              value: e.id || 0,
              label: `${e.name} (${e.employeeNo})`,
              department: e.departmentName || '',
              position: e.positionName || '',
            })),
          );
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedEmp(null);
    }
  }, [open, form]);

  const handleEmployeeChange = (empId: number) => {
    const emp = employeeOptions.find((e) => e.value === empId);
    setSelectedEmp(emp || null);
  };

  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const submitData = {
        employeeId: values.employeeId,
        resignationDate: values.resignationDate ? dayjs(values.resignationDate).format('YYYY-MM-DD') : undefined,
        resignationType: values.resignationType,
        reason: values.reason,
        handoverToId: values.handoverToId,
        submitDirectly: type === 'submit',
      };
      const res = await createUsingPost2(submitData);
      if (res.code === 0) {
        message.success(type === 'save' ? '草稿已保存' : '已提交离职审批');
        form.resetFields();
        setSelectedEmp(null);
        onClose();
      } else {
        message.error(res.message || '操作失败');
      }
    } catch {
      // validate error
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    form.resetFields();
    setSelectedEmp(null);
    onClose();
  };

  const handoverOptions = employeeOptions.filter((o) => o.value !== selectedEmp?.value);

  return (
    <Drawer
      open={open}
      onClose={close}
      placement="right"
      width={560}
      closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
            <LogoutOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
              新建离职申请
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>填写离职信息及工作交接安排</div>
          </div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={close} style={{ fontSize: 16, color: '#9ca3af' }} />
      </div>

      {/* Form Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Form form={form} layout="vertical" initialValues={{ resignationType: 1 }}>
          {/* 员工信息 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#ef4444', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>员工信息</span>
            </div>

            <Form.Item name="employeeId" label="选择员工" rules={[{ required: true, message: '请选择员工' }]}>
              <Select
                showSearch
                placeholder="搜索并选择在职员工"
                size="large"
                options={employeeOptions}
                onChange={handleEmployeeChange}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            {/* 员工信息自动带出 */}
            {selectedEmp && (
              <div style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: 8,
                border: '1px solid #f3f4f6',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                  }}>
                    {selectedEmp.label.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {selectedEmp.label.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {selectedEmp.department} / {selectedEmp.position}
                    </div>
                  </div>
                </div>
                <Descriptions column={2} size="small" labelStyle={{ color: '#6b7280', fontWeight: 400 }}>
                  <Descriptions.Item label="部门">{selectedEmp.department}</Descriptions.Item>
                  <Descriptions.Item label="职位">{selectedEmp.position}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 离职信息 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#f97316', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>离职信息</span>
            </div>

            <Form.Item
              name="resignationDate"
              label="离职日期（最后工作日）"
              rules={[{ required: true, message: '请选择离职日期' }]}
              getValueProps={(value) => ({ value: value ? dayjs(value) : value })}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择最后工作日"
                size="large"
                disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
              />
            </Form.Item>

            <Form.Item name="resignationType" label="离职类型" rules={[{ required: true, message: '请选择离职类型' }]}>
              <Select placeholder="请选择离职类型" size="large" options={resignationTypeOptions} />
            </Form.Item>

            <Form.Item
              name="reason"
              label="离职原因"
              rules={[{ required: true, message: '请输入离职原因' }]}
            >
              <TextArea
                rows={4}
                placeholder="请详细说明离职原因及背景..."
                maxLength={500}
                showCount
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 工作交接 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#eab308', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>工作交接</span>
            </div>

            <Form.Item
              name="handoverToId"
              label="工作交接人"
              rules={[{ required: true, message: '请选择工作交接人' }]}
            >
              <Select
                showSearch
                placeholder="搜索并选择交接人"
                size="large"
                options={handoverOptions.map((e) => ({ value: e.value, label: e.label }))}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: 12,
        background: '#fafafa',
      }}>
        <Button
          block
          size="large"
          onClick={() => handleSubmit('save')}
          loading={submitting}
          style={{ height: 44, borderRadius: 8 }}
        >
          保存草稿
        </Button>
        <Button
          block
          size="large"
          type="primary"
          danger
          onClick={() => handleSubmit('submit')}
          loading={submitting}
          style={{ height: 44, borderRadius: 8 }}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default ResignationFormModal;
