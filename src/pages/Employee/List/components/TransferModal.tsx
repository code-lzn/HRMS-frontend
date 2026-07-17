import { submitUsingPost3 } from '@/api/transferController';
import { Button, DatePicker, Descriptions, Divider, Form, Input, InputNumber, message, Modal, Select, TreeSelect } from 'antd';
import React from 'react';

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
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await submitUsingPost3({
        employeeId: employee?.id,
        toDeptId: values.toDeptId,
        toPositionId: values.toPositionId ?? undefined,
        effectiveDate: values.effectiveDate?.format?.('YYYY-MM-DD') ?? values.effectiveDate,
        reason: values.reason,
        remark: values.remark ?? undefined,
        salaryAdjustment: values.salaryAdjustment ?? undefined,
        toReporterId: values.toReporterId ?? undefined,
      });
      message.success('调岗申请已提交审批');
      form.resetFields();
      onOk();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
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
      draggable
      footer={[
        <Button key="cancel" onClick={handleCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          提交审批
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        {/* 当前信息 */}
        <Divider plain>当前信息</Divider>
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="姓名">{employee?.employeeName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="工号">{employee?.employeeNo ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="部门">{employee?.departmentName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="职位">{employee?.positionName ?? '-'}</Descriptions.Item>
        </Descriptions>

        <Divider plain>调岗信息</Divider>

        <Form.Item name="toDeptId" label="目标部门" rules={[{ required: true, message: '请选择目标部门' }]}>
          <TreeSelect
            treeData={deptTreeData}
            placeholder="请选择目标部门"
            treeDefaultExpandAll
            fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          />
        </Form.Item>

        <Form.Item name="toPositionId" label="目标职位">
          <Select
            placeholder="请选择目标职位（可选）"
            showSearch
            allowClear
            optionFilterProp="label"
            options={positionOptions.map((p) => ({ label: p.name, value: p.id }))}
          />
        </Form.Item>

        <Form.Item name="toReporterId" label="新直属汇报人">
          <Select
            placeholder="搜索员工（可选）"
            showSearch
            allowClear
            optionFilterProp="label"
            disabled
            // 可后续扩展：加载员工列表供选择
          />
        </Form.Item>

        <Form.Item name="salaryAdjustment" label="调岗调薪金额">
          <InputNumber
            min={0}
            step={100}
            style={{ width: '100%' }}
            prefix="¥"
            placeholder="如无需调整可留空"
          />
        </Form.Item>

        <Form.Item name="reason" label="调岗原因" rules={[{ required: true, message: '请填写调岗原因' }]}>
          <Input.TextArea placeholder="请填写调岗原因" maxLength={256} rows={3} />
        </Form.Item>

        <Form.Item name="effectiveDate" label="生效日期">
          <DatePicker style={{ width: '100%' }} placeholder="默认为审批通过日期" />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferModal;
