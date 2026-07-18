import { CloseOutlined, SwapRightOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
}

/** Mock 在职员工 */
const mockEmployees = [
  { value: 1001, label: '张三 (202401001)', department: '技术部', position: '前端工程师', jobLevel: 'P5', reportTo: '陈工' },
  { value: 1003, label: '王五 (202401003)', department: '运营部', position: '运营专员', jobLevel: 'S3', reportTo: '赵经理' },
  { value: 1008, label: '钱十一 (202401008)', department: '人事行政部', position: 'HR 专员', jobLevel: 'S3', reportTo: '刘经理' },
];

const mockDepartments = [
  { value: 10, label: '技术部' },
  { value: 20, label: '产品部' },
  { value: 30, label: '运营部' },
  { value: 40, label: '市场部' },
  { value: 50, label: '财务部' },
  { value: 60, label: '人事行政部' },
];

const mockPositions = [
  { value: 101, label: '前端工程师' }, { value: 102, label: '后端工程师' }, { value: 103, label: '测试工程师' },
  { value: 201, label: '产品经理' }, { value: 301, label: '运营专员' }, { value: 302, label: '运营经理' },
  { value: 401, label: '市场专员' }, { value: 402, label: '市场主管' },
  { value: 601, label: 'HR 专员' },
];

const jobLevels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'M1', 'M2', 'M3', 'M4', 'M5', 'S1', 'S2', 'S3', 'S4', 'S5'];

const TransferFormModal: React.FC<TransferFormProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<(typeof mockEmployees)[number] | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedEmp(null);
    }
  }, [open, form]);

  const handleEmployeeChange = (empId: number) => {
    const emp = mockEmployees.find((e) => e.value === empId);
    setSelectedEmp(emp || null);
  };

  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      // 前端校验：新部门不能与当前部门相同
      if (selectedEmp && values.toDepartmentId === undefined) {
        // department相同 - 实际应通过后端来判断
      }
      console.log(type === 'save' ? '保存调岗草稿:' : '提交调岗审批:', values);
      message.success(type === 'save' ? '草稿已保存' : '已提交调岗审批');
      form.resetFields();
      setSelectedEmp(null);
      onClose();
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
      width={600}
      closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>新建调岗申请</h2>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>部门/职位/职级/汇报人变更</div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={close} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Form form={form} layout="vertical">
          <Form.Item name="employeeId" label="选择员工" rules={[{ required: true, message: '请选择员工' }]}>
            <Select showSearch placeholder="搜索并选择在职员工" options={mockEmployees}
              onChange={handleEmployeeChange}
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          {/* 原信息 vs 新信息 对比 */}
          {selectedEmp && (
            <div style={{ marginBottom: 16 }}>
              <Descriptions
                title="岗位信息对比"
                column={2}
                size="small"
                bordered
                labelStyle={{ fontWeight: 500 }}
              >
                <Descriptions.Item label="原部门" contentStyle={{ background: '#fff7e6' }}>{selectedEmp.department}</Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: '#1677ff' }}>新部门</span>} contentStyle={{ background: '#e6f4ff' }}>
                  <Form.Item name="toDepartmentId" noStyle rules={[{ required: true, message: '必选' }]}>
                    <Select placeholder="选择新部门" options={mockDepartments.filter((d) => d.label !== selectedEmp.department)} style={{ width: '100%' }} />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="原职位" contentStyle={{ background: '#fff7e6' }}>{selectedEmp.position}</Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: '#1677ff' }}>新职位</span>} contentStyle={{ background: '#e6f4ff' }}>
                  <Form.Item name="toPositionId" noStyle>
                    <Select placeholder="选择新职位（可选）" options={mockPositions} allowClear style={{ width: '100%' }} />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="原职级" contentStyle={{ background: '#fff7e6' }}>{selectedEmp.jobLevel}</Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: '#1677ff' }}>新职级</span>} contentStyle={{ background: '#e6f4ff' }}>
                  <Form.Item name="toJobLevel" noStyle>
                    <Select placeholder="选择新职级（可选）" options={jobLevels.map((l) => ({ value: l, label: l }))} allowClear style={{ width: '100%' }} />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="原汇报人" contentStyle={{ background: '#fff7e6' }}>{selectedEmp.reportTo}</Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: '#1677ff' }}>新汇报人</span>} contentStyle={{ background: '#e6f4ff' }}>
                  <Form.Item name="toDirectReportId" noStyle>
                    <Select placeholder="选择新汇报人（可选）" allowClear style={{ width: '100%' }} options={[
                      { value: 100, label: '陈工' }, { value: 200, label: '王总' }, { value: 300, label: '赵经理' },
                      { value: 400, label: '马总' }, { value: 500, label: '钱总监' }, { value: 600, label: '刘经理' },
                    ]} />
                  </Form.Item>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Form.Item name="salaryAdjustment" label="薪资调整（可选）">
            <InputNumber style={{ width: '100%' }} placeholder="正数为涨薪，负数为降薪" prefix="¥" step={500} />
          </Form.Item>

          <Form.Item name="reason" label="调岗原因" rules={[{ required: true, message: '请输入调岗原因' }]}>
            <TextArea rows={4} placeholder="请详细说明调岗的原因和背景..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
        <Button block size="large" onClick={() => handleSubmit('save')} loading={submitting}>保存草稿</Button>
        <Button block size="large" type="primary" onClick={() => handleSubmit('submit')} loading={submitting}>提交审批</Button>
      </div>
    </Drawer>
  );
};

export default TransferFormModal;
