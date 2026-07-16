import {
  saveDraft, submitTransfer, updateTransfer, submitDraft,
} from '../services/transfer';
import { listEmployeesUsingGet } from '@/api/employeeController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { listPositionsUsingGet } from '@/api/positionController';
import type { TransferAddRequest, TransferVO } from '../types/transfer';
import {
  Modal, Form, Input, Select, InputNumber, DatePicker, message, Button, Descriptions, Divider,
} from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  editData: TransferVO | null;
  onCancel: () => void;
  onOk: () => void;
}

const TransferFormModal: React.FC<Props> = ({ open, editData, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [deptList, setDeptList] = useState<{ label: string; value: number }[]>([]);
  const [posList, setPosList] = useState<{ label: string; value: number }[]>([]);
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

  const fetchDeptList = async () => {
    try {
      const res = await getDepartmentTreeUsingGet();
      const data = res?.data ?? [];
      const flatten = (tree: any[]): { label: string; value: number }[] => {
        let result: { label: string; value: number }[] = [];
        tree.forEach((node) => {
          result.push({ label: node.name, value: node.id });
          if (node.children?.length) result = result.concat(flatten(node.children));
        });
        return result;
      };
      setDeptList(flatten(data));
    } catch { setDeptList([]); }
  };

  const fetchPosList = async () => {
    try {
      const res = await listPositionsUsingGet({});
      const data = res?.data ?? [];
      setPosList(data.map((p: any) => ({ label: p.name, value: p.id })));
    } catch { setPosList([]); }
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
      fetchDeptList();
      fetchPosList();
      if (editData) {
        form.setFieldsValue({
          ...editData,
          effectiveDate: editData.effectiveDate ? dayjs(editData.effectiveDate) : null,
        });
        setSelectedEmp({
          employeeName: editData.employeeName,
          employeeNo: editData.employeeNo,
          departmentName: editData.fromDeptName,
          positionName: editData.toPositionName,
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
      const payload: TransferAddRequest = {
        ...values,
        effectiveDate: values.effectiveDate?.format?.('YYYY-MM-DD') ?? values.effectiveDate,
      };
      if (isEdit) {
        await updateTransfer(editData!.id, payload);
        if (submitNow) await submitDraft(editData!.id);
        message.success(submitNow ? '已提交审批' : '已保存');
      } else {
        if (submitNow) {
          await submitTransfer(payload);
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
      title={isEdit ? '编辑调岗申请' : '新增调岗申请'}
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
            <Divider plain>当前信息</Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="工号">{selectedEmp.employeeNo}</Descriptions.Item>
              <Descriptions.Item label="姓名">{selectedEmp.employeeName}</Descriptions.Item>
              <Descriptions.Item label="当前部门">{selectedEmp.departmentName}</Descriptions.Item>
              <Descriptions.Item label="当前职位">{selectedEmp.positionName}</Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider plain>调岗信息</Divider>

        <Form.Item name="toDeptId" label="新部门"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择新部门" showSearch
            optionFilterProp="label" options={deptList}
          />
        </Form.Item>

        <Form.Item name="toPositionId" label="新职位">
          <Select placeholder="选择新职位（可选）" showSearch
            optionFilterProp="label" options={posList} allowClear
          />
        </Form.Item>

        <Form.Item name="toRankCode" label="新职级">
          <Input placeholder="如 P5、M2（可选）" maxLength={8} />
        </Form.Item>

        <Form.Item name="toReporterId" label="新直属汇报人">
          <Select placeholder="搜索员工（可选）" showSearch allowClear
            optionFilterProp="label" options={empList}
          />
        </Form.Item>

        <Form.Item name="salaryAdjustment" label="调岗调薪金额">
          <InputNumber min={0} step={100} style={{ width: '100%' }}
            prefix="¥" placeholder="如无需调整可留空" />
        </Form.Item>

        <Form.Item name="reason" label="调岗原因"
          rules={[{ required: true, message: '必填' }]}>
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

export default TransferFormModal;
