import { submitUsingPost2 } from '@/api/resignationController';
import { listManagerCandidatesUsingGet } from '@/api/employeeController';
import { Button, Col, DatePicker, Form, Input, message, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { extractData, getErrorMessage } from '@/utils/apiHelper';

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

  useEffect(() => {
    if (!open) return;
    setEmployeeLoading(true);
    listManagerCandidatesUsingGet()
      .then((res) => {
        const records = extractData<API.Employee[]>(res, []);
        setEmpList(records.map((e) => ({
          label: `${e.employeeName}（${e.employeeNo}）`,
          value: e.id!,
        })));
      })
      .catch((e: unknown) => {
        console.error('pages/Employee/List/components/ResignationModal.tsx', e);
        message.error(getErrorMessage(e, '加载数据失败'));
        setEmpList([]);
      })
      .finally(() => setEmployeeLoading(false));
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
      title="离职"
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
          <span><strong>入职日期：</strong>
            {employee?.hireDate ? dayjs(employee.hireDate).format('YYYY-MM-DD') : '-'}
          </span>
        </div>

        {/* 离职信息 - 两列布局 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="resignDate" label="离职日期" rules={[{ required: true, message: '请选择离职日期' }]}>
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                placeholder="选择离职日期（最后工作日）"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="resignReasonType" label="离职原因大类" rules={[{ required: true, message: '请选择离职原因大类' }]}>
              <Select placeholder="选择原因大类" options={[
                { label: '主动离职', value: 'VOLUNTARY' },
                { label: '被动离职', value: 'INVOLUNTARY' },
                { label: '协商离职', value: 'NEGOTIATED' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="resignType" label="离职类型" rules={[{ required: true, message: '请选择离职类型' }]}>
              <Select placeholder="选择离职类型" options={[
                { label: '辞职', value: 'RESIGN' },
                { label: '辞退', value: 'DISMISS' },
                { label: '合同到期不续签', value: 'CONTRACT_EXPIRE' },
                { label: '其他', value: 'OTHER' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="handoverPersonId" label="工作交接人" rules={[{ required: true, message: '请选择工作交接人' }]}>
              <Select
                placeholder="搜索交接人" showSearch
                loading={employeeLoading}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
                options={empList}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="detailReason" label="详细说明" rules={[{ required: true, message: '请填写详细说明' }]}>
          <Input.TextArea placeholder="请详细说明离职原因" maxLength={2000} rows={2} />
        </Form.Item>

        <Form.Item name="remark" label="备注（可选）">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResignationModal;
