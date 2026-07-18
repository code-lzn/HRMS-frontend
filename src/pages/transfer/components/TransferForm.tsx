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
import { createUsingPost3 } from '@/api/transferController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { getPositionListUsingGet } from '@/api/positionController';

const { TextArea } = Input;

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
}

interface EmployeeOption {
  value: number;
  label: string;
  department: string;
  position: string;
  jobLevel: string;
  reportTo: string;
}

const jobLevels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'M1', 'M2', 'M3', 'M4', 'M5', 'S1', 'S2', 'S3', 'S4', 'S5'];

const TransferFormModal: React.FC<TransferFormProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeOption | null>(null);

  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ value: number; label: string }[]>([]);
  const [positionOptions, setPositionOptions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getEmployeeListUsingGet({ current: 1, pageSize: 500 }),
      getDepartmentTreeUsingGet(),
      getPositionListUsingGet({ current: 1, pageSize: 500 }),
    ])
      .then(([empRes, deptRes, posRes]) => {
        if (empRes.code === 0 && empRes.data?.records) {
          setEmployeeOptions(
            empRes.data.records.map((e) => ({
              value: e.id || 0,
              label: `${e.name} (${e.employeeNo})`,
              department: e.departmentName || '',
              position: e.positionName || '',
              jobLevel: e.jobLevel || '',
              reportTo: '',
            })),
          );
        }
        if (deptRes.code === 0 && deptRes.data) {
          const flatten = (nodes: API.DepartmentTreeNode[]): { value: number; label: string }[] => {
            const result: { value: number; label: string }[] = [];
            for (const n of nodes) {
              if (n.id != null) result.push({ value: n.id, label: n.name || '' });
              if (n.children) result.push(...flatten(n.children));
            }
            return result;
          };
          setDepartmentOptions(flatten(deptRes.data));
        }
        if (posRes.code === 0 && posRes.data?.records) {
          setPositionOptions(
            posRes.data.records.map((p) => ({
              value: p.id || 0,
              label: p.name || '',
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
        toDepartmentId: values.toDepartmentId,
        toPositionId: values.toPositionId,
        toJobLevel: values.toJobLevel,
        toDirectReportId: values.toDirectReportId,
        salaryAdjustment: values.salaryAdjustment,
        reason: values.reason,
        submitDirectly: type === 'submit',
      };
      const res = await createUsingPost3(submitData);
      if (res.code === 0) {
        message.success(type === 'save' ? '草稿已保存' : '已提交调岗审批');
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
                options={employeeOptions}
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
                        options={departmentOptions.filter((d) => d.label !== selectedEmp.department)}
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
                        options={positionOptions}
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
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{selectedEmp.reportTo || '-'}</div>
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
                        options={employeeOptions.map((e) => ({ value: e.value, label: e.label.split('(')[0].trim() }))}
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
