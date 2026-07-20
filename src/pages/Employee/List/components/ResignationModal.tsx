import { submitUsingPost2 } from '@/api/resignationController';
import { listManagerCandidatesUsingGet } from '@/api/employeeController';
import { Button, DatePicker, Descriptions, Divider, Form, Input, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  employee: API.EmployeeVO;
  onCancel: () => void;
  onOk: () => void;
}

const ResignationModal: React.FC<Props> = ({ open, employee, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // 打开时加载部门负责人候选（用于工作交接人选择）
  useEffect(() => {
    if (open) {
      (async () => {
        setEmployeeLoading(true);
        try {
          const res = await listManagerCandidatesUsingGet();
          const records: API.Employee[] = (res as any)?.data ?? [];
          setEmpList(records.map((e) => ({
            label: `${e.employeeName}（${e.employeeNo}）`,
            value: e.id!,
          })));
        } catch {
          setEmpList([]);
        } finally {
          setEmployeeLoading(false);
        }
      })();
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await submitUsingPost2({
        employeeId: employee?.id,
        resignDate: values.resignDate?.format?.('YYYY-MM-DD') ?? values.resignDate,
        resignReasonType: values.resignReasonType,
        resignType: values.resignType,
        detailReason: values.detailReason,
        handoverPersonId: values.handoverPersonId,
        remark: values.remark ?? undefined,
      });
      message.success('离职申请已提交审批');
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
      title="离职"
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
        {/* 员工信息 */}
        <Divider plain>员工信息</Divider>
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="姓名">{employee?.employeeName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="工号">{employee?.employeeNo ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="部门">{employee?.departmentName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="职位">{employee?.positionName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="入职日期">
            {employee?.hireDate ? dayjs(employee.hireDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider plain>离职信息</Divider>

        <Form.Item
          name="resignDate"
          label="离职日期"
          rules={[{ required: true, message: '请选择离职日期' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder="选择离职日期（最后工作日）"
          />
        </Form.Item>

        <Form.Item
          name="resignReasonType"
          label="离职原因大类"
          rules={[{ required: true, message: '请选择离职原因大类' }]}
        >
          <Select placeholder="选择原因大类" options={[
            { label: '主动离职', value: 'VOLUNTARY' },
            { label: '被动离职', value: 'INVOLUNTARY' },
            { label: '协商离职', value: 'NEGOTIATED' },
          ]} />
        </Form.Item>

        <Form.Item
          name="resignType"
          label="离职类型"
          rules={[{ required: true, message: '请选择离职类型' }]}
        >
          <Select placeholder="选择离职类型" options={[
            { label: '辞职', value: 'RESIGN' },
            { label: '辞退', value: 'DISMISS' },
            { label: '合同到期不续签', value: 'CONTRACT_EXPIRE' },
            { label: '其他', value: 'OTHER' },
          ]} />
        </Form.Item>

        <Form.Item
          name="detailReason"
          label="详细说明"
          rules={[{ required: true, message: '请填写详细说明' }]}
        >
          <Input.TextArea placeholder="请详细说明离职原因" maxLength={2000} rows={3} />
        </Form.Item>

        <Form.Item
          name="handoverPersonId"
          label="工作交接人"
          rules={[{ required: true, message: '请选择工作交接人' }]}
        >
          <Select
            placeholder="搜索交接人"
            showSearch
            loading={employeeLoading}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
            options={empList}
          />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResignationModal;
