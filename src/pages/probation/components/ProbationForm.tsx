import { CloseOutlined } from '@ant-design/icons';
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
import React, { useEffect } from 'react';

const { TextArea } = Input;

interface ProbationFormProps {
  open: boolean;
  onClose: () => void;
  preselectedEmployeeId?: number;
}

/** Mock 员工数据（在职试用期员工） */
const mockProbationEmployees = [
  { value: 1005, label: '孙七 (202401005) - 技术部/后端工程师', department: '技术部', position: '后端工程师', hireDate: '2026-06-01', probationEnd: '2026-08-31', jobLevel: 'P5' },
  { value: 1006, label: '周八 (202402006) - 财务部/财务分析师', department: '财务部', position: '财务分析师', hireDate: '2026-06-15', probationEnd: '2026-09-14', jobLevel: 'P4' },
  { value: 1007, label: '吴九 (202401007) - 技术部/测试工程师', department: '技术部', position: '测试工程师', hireDate: '2026-06-10', probationEnd: '2026-09-09', jobLevel: 'P3' },
];

const ProbationFormModal: React.FC<ProbationFormProps> = ({
  open,
  onClose,
  preselectedEmployeeId,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedEmp, setSelectedEmp] = React.useState<(typeof mockProbationEmployees)[number] | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (preselectedEmployeeId) {
        const emp = mockProbationEmployees.find((e) => e.value === preselectedEmployeeId);
        if (emp) {
          form.setFieldValue('employeeId', emp.value);
          setSelectedEmp(emp);
        }
      } else {
        setSelectedEmp(null);
      }
    }
  }, [open, preselectedEmployeeId, form]);

  const handleEmployeeChange = (empId: number) => {
    const emp = mockProbationEmployees.find((e) => e.value === empId);
    setSelectedEmp(emp || null);
  };

  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      console.log(type === 'save' ? '保存草稿:' : '提交审批:', values);
      message.success(type === 'save' ? '草稿已保存' : '已提交审批');
      form.resetFields();
      setSelectedEmp(null);
      onClose();
    } catch {
      // validate error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={() => { form.resetFields(); setSelectedEmp(null); onClose(); }}
      placement="right"
      width={560}
      closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>新建转正申请</h2>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起员工转正评估</div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={() => { form.resetFields(); setSelectedEmp(null); onClose(); }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="employeeId"
            label="选择员工"
            rules={[{ required: true, message: '请选择员工' }]}
          >
            <Select
              showSearch
              placeholder="搜索并选择试用期员工"
              options={mockProbationEmployees}
              onChange={handleEmployeeChange}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* 员工信息自动带出 */}
          {selectedEmp && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="姓名">{selectedEmp.label.split('(')[0].trim()}</Descriptions.Item>
                <Descriptions.Item label="工号">{selectedEmp.label.match(/\(([^)]+)\)/)?.[1]}</Descriptions.Item>
                <Descriptions.Item label="部门">{selectedEmp.department}</Descriptions.Item>
                <Descriptions.Item label="职位">{selectedEmp.position}</Descriptions.Item>
                <Descriptions.Item label="入职日期">{selectedEmp.hireDate}</Descriptions.Item>
                <Descriptions.Item label="试用期截止">{selectedEmp.probationEnd}</Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Form.Item
            name="performanceReview"
            label="试用期表现评价"
            rules={[{ required: true, message: '请输入试用期表现评价' }]}
          >
            <TextArea rows={5} placeholder="请描述员工试用期期间的工作表现、能力评估等..." maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="salaryAdjustment" label="转正后薪资调整（可选）">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="如不需调整可留空"
              prefix="¥"
              min={0}
              step={500}
            />
          </Form.Item>
        </Form>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
        <Button block size="large" onClick={() => handleSubmit('save')} loading={submitting}>
          保存草稿
        </Button>
        <Button block size="large" type="primary" onClick={() => handleSubmit('submit')} loading={submitting}>
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default ProbationFormModal;
