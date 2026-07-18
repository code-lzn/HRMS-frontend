import { CloseOutlined, UserOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
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
  Tag,
  Divider,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  createUsingPost,
  updateDraftUsingPut,
  checkPhoneUsingGet,
  previewEmployeeNoUsingPost,
} from '@/api/onboardingController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { getPositionListUsingGet } from '@/api/positionController';
import { getEmployeeListUsingGet } from '@/api/employeeController';

interface OnboardingFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Record<string, any>;
}

interface PositionOption {
  value: number;
  label: string;
  departmentId?: number;
  probationMonths?: number;
}

interface EmployeeOption {
  value: number;
  label: string;
  departmentId?: number;
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

  const [departmentOptions, setDepartmentOptions] = useState<{ value: number; label: string }[]>([]);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  const isEdit = !!initialValues;

  // 加载字典数据
  useEffect(() => {
    if (!open) return;
    // 加载部门
    getDepartmentTreeUsingGet()
      .then((res) => {
        if (res.code === 0 && res.data) {
          const flatten = (nodes: API.DepartmentTreeNode[]): { value: number; label: string }[] => {
            const result: { value: number; label: string }[] = [];
            for (const n of nodes) {
              if (n.id != null) result.push({ value: n.id, label: n.name || '' });
              if (n.children) result.push(...flatten(n.children));
            }
            return result;
          };
          setDepartmentOptions(flatten(res.data));
        }
      })
      .catch(() => {});
    // 加载职位
    getPositionListUsingGet({ current: 1, pageSize: 500 })
      .then((res) => {
        if (res.code === 0 && res.data?.records) {
          setPositionOptions(
            res.data.records.map((p) => ({
              value: p.id || 0,
              label: p.name || '',
              departmentId: p.departmentId,
              probationMonths: p.defaultProbationMonths,
            })),
          );
        }
      })
      .catch(() => {});
    // 加载员工(汇报人)
    getEmployeeListUsingGet({ current: 1, pageSize: 500 })
      .then((res) => {
        if (res.code === 0 && res.data?.records) {
          setEmployeeOptions(
            res.data.records.map((e) => ({
              value: e.id || 0,
              label: e.name || '',
              departmentId: (e as any).departmentId,
            })),
          );
        }
      })
      .catch(() => {});
  }, [open]);

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

  // 获取部门下的职位列表
  const getPositions = (deptId?: number) => {
    if (!deptId) return positionOptions;
    return positionOptions.filter((p) => !p.departmentId || p.departmentId === deptId);
  };

  // 获取部门下的员工列表(汇报人)
  const getEmployeesByDept = (deptId?: number) => {
    if (!deptId) return employeeOptions;
    return employeeOptions.filter((e) => !e.departmentId || e.departmentId === deptId);
  };

  // 职位变更 → 自动填充试用期
  const handlePositionChange = (posId: number) => {
    setSelectedPositionId(posId);
    const pos = positionOptions.find((p) => p.value === posId);
    if (pos && pos.probationMonths) {
      form.setFieldValue('probationMonths', pos.probationMonths);
    }
  };

  // 部门变更 → 自动填充汇报人 + 生成工号预览
  const handleDepartmentChange = async (deptId: number) => {
    setSelectedDeptId(deptId);
    // 清空职位
    form.setFieldValue('positionId', undefined);
    setSelectedPositionId(undefined);
    // 自动设置汇报人为部门下第一位员工
    const emp = getEmployeesByDept(deptId)[0];
    if (emp) {
      form.setFieldValue('directReportId', emp.value);
    }
    // 预览工号
    try {
      const res = await previewEmployeeNoUsingPost({ departmentId: deptId });
      if (res.code === 0 && res.data) {
        setPreviewEmpNo((res.data as any).employeeNo || '');
      }
    } catch {
      // ignore
    }
  };

  // 录用类型变更 → 实习默认100%
  const handleHireTypeChange = (type: number) => {
    if (type === 3) {
      form.setFieldValue('probationRatio', 1.0);
    }
  };

  // 手机号查重（使用后端 API）
  const checkPhone = async () => {
    const phone = form.getFieldValue('phone');
    if (!phone || !/^1\d{10}$/.test(phone)) return;
    try {
      const res = await checkPhoneUsingGet({ phone });
      if (res.code === 0 && res.data) {
        const data = res.data as any;
        if (data.used) {
          message.warning('该手机号已被占用');
        }
      }
    } catch {
      // ignore
    }
  };

  // 提交
  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setActionType(type);
      setSubmitting(true);
      const values = await form.validateFields();
      const submitData = {
        ...values,
        expectedHireDate: values.expectedHireDate ? dayjs(values.expectedHireDate).format('YYYY-MM-DD') : undefined,
        submitDirectly: type === 'submit',
      };

      if (isEdit && initialValues?.id) {
        const res = await updateDraftUsingPut({ id: initialValues.id }, submitData);
        if (res.code === 0) {
          message.success(type === 'save' ? '已更新草稿' : '已提交审批');
        } else {
          message.error(res.message || '操作失败');
          return;
        }
      } else {
        const res = await createUsingPost(submitData);
        if (res.code === 0) {
          message.success(type === 'save' ? '草稿已保存' : '已提交审批');
        } else {
          message.error(res.message || '操作失败');
          return;
        }
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
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
            <UserOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
              {isEdit ? '编辑入职申请' : '新建入职申请'}
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>填写候选人基本信息，提交后进入审批流程</div>
          </div>
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} style={{ fontSize: 16, color: '#9ca3af' }} />
      </div>

      {/* Form Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hireType: 1, probationRatio: 0.8, ...initialValues }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>基本信息</span>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }, { min: 2, max: 50, message: '2-50个字符' }]}>
                  <Input placeholder="请输入姓名" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                  <Select placeholder="请选择" size="large" options={[
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
              <Input placeholder="请输入手机号" maxLength={11} onBlur={checkPhone} size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="请输入邮箱地址" size="large" />
            </Form.Item>

            <Form.Item
              name="idCard"
              label="身份证号"
              rules={[
                { required: true, message: '请输入18位身份证号' },
                { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' },
              ]}
            >
              <Input placeholder="请输入18位身份证号" maxLength={18} size="large" />
            </Form.Item>
          </div>

          <Divider style={{ margin: '0 0 24px 0' }} />

          {/* 工作信息 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#10b981', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>工作信息</span>
            </div>

            <Form.Item
              name="expectedHireDate"
              label="预计入职日期"
              rules={[{ required: true, message: '请选择预计入职日期' }]}
              getValueProps={(value) => ({ value: value ? dayjs(value) : value })}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择预计入职日期" disabledDate={(d) => d.isBefore(dayjs().startOf('day'))} size="large" />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label="所属部门"
              rules={[{ required: true, message: '请选择所属部门' }]}
            >
              <Select
                showSearch
                placeholder="请选择部门"
                size="large"
                options={departmentOptions}
                onChange={handleDepartmentChange as any}
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
                size="large"
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
                size="large"
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
                  <InputNumber min={1} max={6} style={{ width: '100%' }} placeholder="默认取职位配置" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="probationRatio" label="试用期薪资比例" rules={[{ required: true, message: '请输入' }]}>
                  <InputNumber
                    min={0.8}
                    max={1.0}
                    step={0.05}
                    style={{ width: '100%' }}
                    size="large"
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
                size="large"
                options={getEmployeesByDept(selectedDeptId)}
                allowClear
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>

          {/* 工号预览 */}
          {previewEmpNo && (
            <div style={{
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
                {'✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#166534' }}>工号预览</div>
                <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
                  工号：<Tag color="success" style={{ fontFamily: 'monospace', margin: 0 }}>{previewEmpNo}</Tag>
                  <span style={{ marginLeft: 8, color: '#86efac' }}>（实际工号在审批通过后生成）</span>
                </div>
              </div>
            </div>
          )}
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
          loading={submitting && actionType === 'save'}
          style={{ height: 44, borderRadius: 8 }}
        >
          保存草稿
        </Button>
        <Button
          block
          size="large"
          type="primary"
          onClick={() => handleSubmit('submit')}
          loading={submitting && actionType === 'submit'}
          style={{ height: 44, borderRadius: 8 }}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default OnboardingFormModal;
