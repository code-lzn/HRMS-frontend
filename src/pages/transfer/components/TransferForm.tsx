import { CloseOutlined, SwapRightOutlined, ArrowRightOutlined } from '@ant-design/icons';
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
  Row,
  Col,
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
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#0891b2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
            <SwapRightOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
              新建调岗申请
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>部门/职位/职级/汇报人变更</div>
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
              <div style={{ width: 4, height: 16, background: '#0891b2', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>员工信息</span>
            </div>

            <Form.Item name="employeeId" label="选择员工" rules={[{ required: true, message: '请选择员工' }]}>
              <Select
                showSearch
                placeholder="搜索并选择在职员工"
                size="large"
                options={mockEmployees}
                onChange={handleEmployeeChange}
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>

            {selectedEmp && (
              <div style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: 8,
                border: '1px solid #f3f4f6',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#67e8f9',
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
                  <Tag color="cyan" style={{ marginLeft: 'auto' }}>{selectedEmp.jobLevel}</Tag>
                </div>
              </div>
            )}
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 岗位变更 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#8b5cf6', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>岗位变更</span>
            </div>

            {selectedEmp ? (
              <div style={{
                background: '#fafafa',
                borderRadius: 8,
                padding: '16px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#fff7ed', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>原部门</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{selectedEmp.department}</div>
                  </div>
                  <div style={{ color: '#0891b2', fontSize: 20 }}>
                    <ArrowRightOutlined />
                  </div>
                  <div>
                    <Form.Item name="toDepartmentId" noStyle rules={[{ required: true, message: '请选择新部门' }]}>
                      <Select
                        placeholder="选择新部门"
                        size="large"
                        options={mockDepartments.filter((d) => d.label !== selectedEmp.department)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#fff7ed', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>原职位</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{selectedEmp.position}</div>
                  </div>
                  <div style={{ color: '#0891b2', fontSize: 20 }}>
                    <ArrowRightOutlined />
                  </div>
                  <div>
                    <Form.Item name="toPositionId" noStyle>
                      <Select
                        placeholder="选择新职位（可选）"
                        size="large"
                        options={mockPositions}
                        allowClear
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#fff7ed', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>原职级</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{selectedEmp.jobLevel}</div>
                  </div>
                  <div style={{ color: '#0891b2', fontSize: 20 }}>
                    <ArrowRightOutlined />
                  </div>
                  <div>
                    <Form.Item name="toJobLevel" noStyle>
                      <Select
                        placeholder="选择新职级（可选）"
                        size="large"
                        options={jobLevels.map((l) => ({ value: l, label: l }))}
                        allowClear
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#fff7ed', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>原汇报人</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{selectedEmp.reportTo}</div>
                  </div>
                  <div style={{ color: '#0891b2', fontSize: 20 }}>
                    <ArrowRightOutlined />
                  </div>
                  <div>
                    <Form.Item name="toDirectReportId" noStyle>
                      <Select
                        placeholder="选择新汇报人（可选）"
                        size="large"
                        allowClear
                        style={{ width: '100%' }}
                        options={[
                          { value: 100, label: '陈工' }, { value: 200, label: '王总' }, { value: 300, label: '赵经理' },
                          { value: 400, label: '马总' }, { value: 500, label: '钱总监' }, { value: 600, label: '刘经理' },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#fafafa',
                borderRadius: 8,
                border: '1px dashed #e5e7eb',
                color: '#9ca3af',
              }}>
                请先选择员工以查看岗位信息对比
              </div>
            )}
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 其他信息 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#f59e0b', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>其他信息</span>
            </div>

            <Form.Item name="salaryAdjustment" label="薪资调整（可选）">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="正数为涨薪，负数为降薪"
                prefix="¥"
                step={500}
                size="large"
              />
            </Form.Item>

            <Form.Item name="reason" label="调岗原因" rules={[{ required: true, message: '请输入调岗原因' }]}>
              <TextArea
                rows={4}
                placeholder="请详细说明调岗的原因和背景..."
                maxLength={500}
                showCount
                style={{ borderRadius: 8 }}
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
          style={{ height: 44, borderRadius: 8, background: '#0891b2', borderColor: '#0891b2' }}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default TransferFormModal;
