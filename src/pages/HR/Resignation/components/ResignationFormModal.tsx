import {
  saveDraft, submitResignation, updateResignation, submitDraft,
} from '../services/resignation';
import { listEmployeesUsingGet } from '@/api/employeeController';
import type { ResignationAddRequest, ResignationVO } from '../types/resignation';
import {
  Modal, Form, Input, Select, DatePicker, message, Button, Descriptions, Divider,
} from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  editData: ResignationVO | null;
  onCancel: () => void;
  onOk: () => void;
}

const ResignationFormModal: React.FC<Props> = ({ open, editData, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const isEdit = !!editData;

  const fetchEmpList = async () => {
    try {
      const res = await listEmployeesUsingGet({ page: 1, size: 500 });
      const records = res?.data?.records ?? [];
      const active = records.filter((e: any) => e.status === 1 || e.status === 2);
      setEmpList(active.map((e: any) => ({
        label: `${e.employeeName} (${e.employeeNo || '-'})`,
        value: e.id,
      })));
    } catch { setEmpList([]); }
  };

  const handleEmpChange = async (empId: number) => {
    if (!empId) { setSelectedEmp(null); return; }
    try {
      const { getDetailUsingGet } = await import('@/api/employeeController');
      const detailRes = await getDetailUsingGet({ id: empId });
      const emp = detailRes?.data;
      setSelectedEmp(emp ?? null);
    } catch { setSelectedEmp(null); }
  };

  useEffect(() => {
    if (open) {
      fetchEmpList();
      if (editData) {
        form.setFieldsValue({
          ...editData,
          resignDate: editData.resignDate ? dayjs(editData.resignDate) : null,
        });
        setSelectedEmp({
          employeeName: editData.employeeName,
          employeeNo: editData.employeeNo,
          departmentName: editData.deptName,
          positionName: editData.positionName,
        });
      } else {
        form.resetFields();
        setSelectedEmp(null);
      }
    }
  }, [open, editData, form]);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload: ResignationAddRequest = {
        ...values,
        resignDate: values.resignDate?.format?.('YYYY-MM-DD') ?? values.resignDate,
      };
      if (isEdit) {
        await updateResignation(editData!.id, payload);
        if (submitNow) await submitDraft(editData!.id);
        message.success(submitNow ? '已提交审批' : '已保存');
      } else {
        if (submitNow) {
          await submitResignation(payload);
          message.success('已提交审批');
        } else {
          await saveDraft(payload);
          message.success('草稿已保存');
        }
      }
      onOk();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑离职申请' : '新增离职申请'}
      open={open} onCancel={onCancel} width={720} destroyOnClose draggable
      footer={isEdit ? [
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" type="primary" loading={loading} onClick={() => handleSubmit(false)}>保存</Button>,
      ] : [
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="draft" loading={loading} onClick={() => handleSubmit(false)}>保存草稿</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => handleSubmit(true)}>提交审批</Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Form.Item name="employeeId" label="选择员工"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="搜索在职员工" showSearch
            optionFilterProp="label" options={empList}
            onChange={handleEmpChange} disabled={isEdit}
          />
        </Form.Item>

        {selectedEmp && (
          <>
            <Divider plain>员工信息</Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="工号">{selectedEmp.employeeNo}</Descriptions.Item>
              <Descriptions.Item label="姓名">{selectedEmp.employeeName}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmp.departmentName}</Descriptions.Item>
              <Descriptions.Item label="职位">{selectedEmp.positionName}</Descriptions.Item>
              <Descriptions.Item label="入职日期">
                {selectedEmp.hireDate ? dayjs(selectedEmp.hireDate).format('YYYY-MM-DD') : ''}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider plain>离职信息</Divider>

        <Form.Item name="resignDate" label="离职日期"
          rules={[{ required: true, message: '必选' }]}>
          <DatePicker style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder="选择离职日期（最后工作日）"
          />
        </Form.Item>

        <Form.Item name="resignReasonType" label="离职原因大类"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择原因大类" options={[
            { label: '主动离职', value: 'VOLUNTARY' },
            { label: '被动离职', value: 'INVOLUNTARY' },
            { label: '协商离职', value: 'NEGOTIATED' },
          ]} />
        </Form.Item>

        <Form.Item name="resignType" label="离职类型"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择离职类型" options={[
            { label: '辞职', value: 'RESIGN' },
            { label: '辞退', value: 'DISMISS' },
            { label: '合同到期不续签', value: 'CONTRACT_EXPIRE' },
            { label: '其他', value: 'OTHER' },
          ]} />
        </Form.Item>

        <Form.Item name="detailReason" label="详细说明"
          rules={[{ required: true, message: '必填' }]}>
          <Input.TextArea placeholder="请详细说明离职原因" maxLength={2000} rows={3} />
        </Form.Item>

        <Form.Item name="handoverPersonId" label="工作交接人"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="搜索交接人" showSearch
            optionFilterProp="label" options={empList}
          />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResignationFormModal;
