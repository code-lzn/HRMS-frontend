import { CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { mockDepartments, mockEmployees, mockPositions } from '../mock';

interface OnboardingFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Record<string, any>;
}

/** 新建/编辑入职申请 Drawer */
const OnboardingFormModal: React.FC<OnboardingFormProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [actionType, setActionType] = React.useState<'save' | 'submit'>('save');
  const [selectedDeptId, setSelectedDeptId] = React.useState<number | undefined>();
  const [selectedPositionId, setSelectedPositionId] = React.useState<number | undefined>();
  const [previewEmpNo, setPreviewEmpNo] = React.useState<string>('');

  const isEdit = !!initialValues;

  // 重置表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      setPreviewEmpNo('');
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [open, initialValues, form]);

  /** 获取部门下的职位列表 */
  const getPositions = (deptId?: number) => {
    if (!deptId) return mockPositions;
    return mockPositions.filter((p) => !p.departmentId || p.departmentId === deptId);
  };

  /** 职位变更 → 自动填充试用期 */
  const handlePositionChange = (posId: number) => {
    setSelectedPositionId(posId);
    const pos = mockPositions.find((p) => p.value === posId);
    if (pos) {
      form.setFieldValue('probationMonths', pos.probationMonths);
    }
  };

  /** 部门变更 → 自动填充汇报人 + 生成工号预览 */
  const handleDepartmentChange = (deptId: number) => {
    setSelectedDeptId(deptId);
    // 清空职位
    form.setFieldValue('positionId', undefined);
    setSelectedPositionId(undefined);
    // 自动设置汇报人为部门负责人
    const manager = mockEmployees.find((e) => e.departmentId === deptId);
    if (manager) {
      form.setFieldValue('directReportId', manager.value);
    }
    // 生成工号预览
    const deptCode = String(deptId).padStart(2, '0').slice(0, 2);
    const randomSuffix = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    setPreviewEmpNo(`2024${deptCode}${randomSuffix}`);
  };

  /** 录用类型变更 → 实习默认100% */
  const handleHireTypeChange = (type: number) => {
    if (type === 3) {
      form.setFieldValue('probationRatio', 1.0);
    }
  };

  /** 手机号查重 */
  const checkPhone = async () => {
    const phone = form.getFieldValue('phone');
    if (!phone || !/^1\d{10}$/.test(phone)) return;
    // Mock 查重
    const used = ['13800000000', '13900000000'];
    if (used.includes(phone)) {
      message.warning('该手机号已被占用');
    }
  };

  /** 提交 */
  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setActionType(type);
      setSubmitting(true);
      const values = await form.validateFields();
      console.log(type === 'save' ? '保存草稿:' : '提交审批:', values);
      if (type === 'save') {
        message.success(isEdit ? '已更新草稿' : '草稿已保存');
      } else {
        message.success('已提交审批');
      }
      form.resetFields();
      onClose();
    } catch {
      // 校验失败
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      width={560}
      closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {isEdit ? '编辑入职申请' : '新建入职申请'}
          </h2>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>填写候选人基本信息</div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
      </div>

      {/* Form Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hireType: 1, probationRatio: 0.8, ...initialValues }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }, { min: 2, max: 50, message: '2-50个字符' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                <Select placeholder="请选择" options={[
                  { label: '男', value: 1 },
                  { label: '女', value: 2 },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} onBlur={checkPhone} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="idCard"
            label="身份证号"
            rules={[
              { required: true, message: '请输入18位身份证号' },
              { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' },
            ]}
          >
            <Input placeholder="请输入18位身份证号" maxLength={18} />
          </Form.Item>

          <Form.Item
            name="expectedHireDate"
            label="预计入职日期"
            rules={[{ required: true, message: '请选择预计入职日期' }]}
            getValueProps={(value) => ({ value: value ? dayjs(value) : value })}
          >
            <DatePicker style={{ width: '100%' }} placeholder="年/月/日" disabledDate={(d) => d.isBefore(dayjs().startOf('day'))} />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select
              showSearch
              placeholder="请选择部门"
              options={mockDepartments}
              onChange={handleDepartmentChange}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="positionId"
            label="职位"
            rules={[{ required: true, message: '请选择职位' }]}
          >
            <Select
              showSearch
              placeholder="请选择职位"
              options={getPositions(selectedDeptId)}
              onChange={handlePositionChange}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="hireType" label="录用类型" rules={[{ required: true, message: '请选择录用类型' }]}>
            <Segmented
              block
              options={[
                { label: '全职', value: 1 },
                { label: '兼职', value: 2 },
                { label: '实习', value: 3 },
              ]}
              onChange={(v) => handleHireTypeChange(v as number)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="probationMonths" label="试用期(月)" rules={[{ required: true, message: '请输入' }]}>
                <InputNumber min={1} max={6} style={{ width: '100%' }} placeholder="默认取职位配置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probationRatio" label="试用期薪资比例" rules={[{ required: true, message: '请输入' }]}>
                <InputNumber
                  min={0.8}
                  max={1.0}
                  step={0.05}
                  style={{ width: '100%' }}
                  formatter={(v: any) => `${(Number(v) * 100).toFixed(0)}%`}
                  parser={(v: any) => Number(v?.replace('%', '')) / 100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="directReportId" label="直接汇报人">
            <Select
              showSearch
              placeholder="默认部门负责人"
              options={mockEmployees}
              allowClear
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* 工号预览 */}
          {previewEmpNo && (
            <div style={{
              padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f',
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            }}>
              <span style={{ fontSize: 13, color: '#52c41a' }}>工号预览：</span>
              <Tag color="green" style={{ fontFamily: 'monospace' }}>{previewEmpNo}</Tag>
              <span style={{ fontSize: 12, color: '#999' }}>（实际工号在审批通过后生成）</span>
            </div>
          )}
        </Form>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
        <Button
          block
          size="large"
          onClick={() => handleSubmit('save')}
          loading={submitting && actionType === 'save'}
        >
          保存草稿
        </Button>
        <Button
          block
          size="large"
          type="primary"
          onClick={() => handleSubmit('submit')}
          loading={submitting && actionType === 'submit'}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default OnboardingFormModal;
