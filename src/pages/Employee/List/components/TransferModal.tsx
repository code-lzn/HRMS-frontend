import { submitUsingPost3 } from '@/api/transferController';
import { listManagerCandidatesUsingGet } from '@/api/employeeController';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/utils/employeeConstants';
import {
  Button, Col, DatePicker, Form, Input, InputNumber,
  message, Modal, Row, Select, TreeSelect,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { extractData, getErrorMessage } from '@/utils/apiHelper';

interface Props {
  open: boolean;
  employee: API.EmployeeVO;
  deptTreeData: API.DepartmentTreeVO[];
  positionOptions: API.PositionVO[];
  onCancel: () => void;
  onOk: () => void;
}

const TransferModal: React.FC<Props> = ({
  open, employee, deptTreeData, positionOptions, onCancel, onOk,
}) => {
  const [form] = Form.useForm();
  const targetDeptId = Form.useWatch('toDeptId', form);
  const filteredPositionOptions = useMemo(() => {
    if (!targetDeptId) return positionOptions;
    return positionOptions.filter(
      (p) => p.departmentId === targetDeptId || p.departmentId == null,
    );
  }, [positionOptions, targetDeptId]);
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<{ label: string; value: number }[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmployeeLoading(true);
    listManagerCandidatesUsingGet()
      .then((res) => {
        const records = extractData<API.Employee[]>(res, []);
        setEmployeeOptions(records.map((e) => ({
          label: `${e.employeeName}（${e.employeeNo}）`,
          value: e.id!,
        })));
      })
      .catch((e: unknown) => {
        console.error('pages/Employee/List/components/TransferModal.tsx', e);
        message.error(getErrorMessage(e, '加载数据失败'));
        setEmployeeOptions([]);
      })
      .finally(() => setEmployeeLoading(false));
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await submitUsingPost3({
        employeeId: employee?.id,
        toDeptId: values.toDeptId,
        toPositionId: values.toPositionId ?? undefined,
        toRankCode: values.toRankCode ?? undefined,
        toReporterId: values.toReporterId ?? undefined,
        workLocation: values.workLocation ?? undefined,
        employmentType: values.employmentType ?? undefined,
        salaryAdjustment: values.salaryAdjustment ?? undefined,
        effectiveDate: values.effectiveDate?.format?.('YYYY-MM-DD') ?? values.effectiveDate,
        reason: values.reason,
        remark: values.remark ?? undefined,
      });
      message.success('调岗申请已提交审批');
      form.resetFields();
      onOk();
    } catch (e: unknown) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="调岗"
      open={open}
      onCancel={handleCancel}
      width={640}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          提交审批
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        {/* 当前员工信息 - 紧凑展示 */}
        <div style={{
          display: 'flex', gap: 16, padding: '10px 14px',
          background: '#f9fafb', borderRadius: 6, marginBottom: 16, fontSize: 13,
        }}>
          <span><strong>姓名：</strong>{employee?.employeeName ?? '-'}</span>
          <span><strong>工号：</strong>{employee?.employeeNo ?? '-'}</span>
          <span><strong>部门：</strong>{employee?.departmentName ?? '-'}</span>
          <span><strong>职位：</strong>{employee?.positionName ?? '-'}</span>
        </div>

        {/* 调岗信息 - 两列布局 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="toDeptId" label="目标部门" rules={[{ required: true, message: '请选择目标部门' }]}>
              <TreeSelect
                treeData={deptTreeData}
                placeholder="请选择目标部门"
                treeDefaultExpandAll
                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="toPositionId" label="目标职位（可选）">
              <Select
                placeholder="请选择"
                showSearch allowClear
                optionFilterProp="label"
                options={filteredPositionOptions.map((p) => ({ label: p.name, value: p.id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="toRankCode" label="目标职级（可选）">
              <Input placeholder="如 P5、M2" maxLength={8} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="toReporterId" label="新直属汇报人（可选）">
              <Select
                placeholder="请选择" showSearch allowClear
                loading={employeeLoading}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
                options={employeeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="workLocation" label="工作地点（可选）">
              <Input placeholder="请输入" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="employmentType" label="录用类型（可选）">
              <Select placeholder="保持不变" allowClear options={EMPLOYMENT_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="salaryAdjustment" label="调薪金额（可选）">
              <InputNumber min={0} step={100} style={{ width: '100%' }} prefix="¥" placeholder="如无需调整" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="effectiveDate" label="生效日期（可选）">
              <DatePicker style={{ width: '100%' }} placeholder="默认为审批通过日期" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="reason" label="调岗原因" rules={[{ required: true, message: '请填写调岗原因' }]}>
          <Input.TextArea placeholder="请填写调岗原因" maxLength={256} rows={2} />
        </Form.Item>

        <Form.Item name="remark" label="备注（可选）">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferModal;
