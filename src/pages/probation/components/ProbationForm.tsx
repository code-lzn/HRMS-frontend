import { CloseOutlined, TrophyOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  Tag,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { createUsingPost1 } from '@/api/probationController';
import { getEmployeeListUsingGet } from '@/api/employeeController';

const { TextArea } = Input;

interface ProbationFormProps {
  open: boolean;
  onClose: () => void;
  preselectedEmployeeId?: number;
}

interface EmployeeOption {
  value: number;
  label: string;
  department: string;
  position: string;
  hireDate: string;
  probationEnd: string;
  jobLevel: string;
  employeeName: string;
  employeeNo: string;
}

const ProbationFormModal: React.FC<ProbationFormProps> = ({
  open,
  onClose,
  preselectedEmployeeId,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeOption | null>(null);

  useEffect(() => {
    if (!open) return;
    getEmployeeListUsingGet({ current: 1, pageSize: 500 })
      .then((res) => {
        if (res.code === 0 && res.data?.records) {
          setEmployeeOptions(
            res.data.records.filter((e: any) => e.status === 1).map((e) => ({
              value: e.id || 0,
              label: `${e.name} (${e.employeeNo}) - ${e.departmentName}/${e.positionName}`,
              department: e.departmentName || '',
              position: e.positionName || '',
              hireDate: e.hireDate || '',
              probationEnd: '',
              jobLevel: e.jobLevel || '',
              employeeName: e.name || '',
              employeeNo: e.employeeNo || '',
            })),
          );
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (preselectedEmployeeId) {
        const emp = employeeOptions.find((e) => e.value === preselectedEmployeeId);
        if (emp) {
          form.setFieldValue('employeeId', emp.value);
          setSelectedEmp(emp);
        }
      } else {
        setSelectedEmp(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedEmployeeId, form]);

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
        performanceReview: values.performanceReview,
        salaryAdjustment: values.salaryAdjustment,
        submitDirectly: type === 'submit',
      };
      const res = await createUsingPost1(submitData);
      if (res.code === 0) {
        message.success(type === 'save' ? '草稿已保存' : '已提交审批');
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
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
            <TrophyOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
              新建转正申请
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>发起员工转正评估</div>
          </div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={close} style={{ fontSize: 16, color: '#9ca3af' }} />
      </div>

      {/* Form Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Form form={form} layout="vertical">
          {/* 员工信息 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#22c55e', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>员工信息</span>
            </div>

            <Form.Item
              name="employeeId"
              label="选择员工"
              rules={[{ required: true, message: '请选择员工' }]}
            >
              <Select
                showSearch
                placeholder="搜索并选择试用期员工"
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
                    background: '#86efac',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                  }}>
                    {selectedEmp.employeeName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {selectedEmp.employeeName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {selectedEmp.department} / {selectedEmp.position}
                    </div>
                  </div>
                  <Tag color="green" style={{ marginLeft: 'auto' }}>{selectedEmp.jobLevel}</Tag>
                </div>
                <Descriptions column={2} size="small" labelStyle={{ color: '#6b7280', fontWeight: 400 }}>
                  <Descriptions.Item label="工号">{selectedEmp.employeeNo}</Descriptions.Item>
                  <Descriptions.Item label="部门">{selectedEmp.department}</Descriptions.Item>
                  <Descriptions.Item label="职位">{selectedEmp.position}</Descriptions.Item>
                  <Descriptions.Item label="职级">{selectedEmp.jobLevel}</Descriptions.Item>
                  <Descriptions.Item label="入职日期">{selectedEmp.hireDate}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 评估信息 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>评估信息</span>
            </div>

            <Form.Item
              name="performanceReview"
              label="试用期表现评价"
              rules={[{ required: true, message: '请输入试用期表现评价' }]}
            >
              <TextArea
                rows={5}
                placeholder="请描述员工试用期期间的工作表现、能力评估等..."
                maxLength={500}
                showCount
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item name="salaryAdjustment" label="转正后薪资调整（可选）">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="如不需调整可留空"
                prefix="¥"
                min={0}
                step={500}
                size="large"
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
          onClick={() => handleSubmit('submit')}
          loading={submitting}
          style={{ height: 44, borderRadius: 8, background: '#22c55e', borderColor: '#22c55e' }}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default ProbationFormModal;
