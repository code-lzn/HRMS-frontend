import {
  saveDraft, submitTransfer, updateTransfer, submitDraft,
} from '../services/transfer';
import { listEmployeesUsingGet } from '@/api/employeeController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { listPositionsUsingGet } from '@/api/positionController';
import type { TransferAddRequest, TransferVO } from '../types/transfer';
import {
  Drawer, Form, Input, Select, InputNumber, DatePicker, message, Button, Descriptions, Divider,
} from 'antd';
import { useEffect, useState, useRef } from 'react';
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [deptList, setDeptList] = useState<{ label: string; value: number }[]>([]);
  const [posList, setPosList] = useState<{ label: string; value: number }[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isEdit = !!editData;

  const fetchEmpList = async (keyword?: string) => {
    setSearchLoading(true);
    try {
      const res = await listEmployeesUsingGet({ keyword, page: 1, size: 50 });
      const records = res?.data?.records ?? [];
      const active = records.filter((e: any) => e.status === 1 || e.status === 2);
      setEmpList(active.map((e: any) => ({
        label: `${e.employeeName} (${e.employeeNo || '-'})`,
        value: e.id,
      })));
    } catch (e) { console.error('pages/HR/Transfer/components/TransferFormModal.tsx', e); setEmpList([]); }
    finally { setSearchLoading(false); }
  };

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => { fetchEmpList(value); }, 300);
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
    } catch (e) { console.error('pages/HR/Transfer/components/TransferFormModal.tsx', e); setDeptList([]); }
  };

  const fetchPosList = async () => {
    try {
      const res = await listPositionsUsingGet({});
      const data = res?.data ?? [];
      setPosList(data.map((p: any) => ({ label: p.name, value: p.id })));
    } catch (e) { console.error('pages/HR/Transfer/components/TransferFormModal.tsx', e); setPosList([]); }
  };

  const handleEmpChange = async (empId: number) => {
    if (!empId) { setSelectedEmp(null); return; }
    try {
      const { getDetailUsingGet } = await import('@/api/employeeController');
      const detailRes = await getDetailUsingGet({ id: empId });
      const emp = detailRes?.data;
      setSelectedEmp(emp ?? null);
    } catch (e) { console.error('pages/HR/Transfer/components/TransferFormModal.tsx', e); setSelectedEmp(null); }
  };

  useEffect(() => {
    if (open) {
      fetchDeptList();
      fetchPosList();
      if (editData) {
        form.setFieldsValue({
          ...editData,
          effectiveDate: editData.effectiveDate ? dayjs(editData.effectiveDate) : null,
        });
        setEmpList([{ label: `${editData.employeeName} (${editData.employeeNo || '-'})`, value: editData.employeeId }]);
        setSelectedEmp({
          employeeName: editData.employeeName,
          employeeNo: editData.employeeNo,
          departmentName: editData.fromDeptName,
          positionName: editData.toPositionName,
        });
      } else {
        form.resetFields();
        setSelectedEmp(null);
        fetchEmpList();
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
    <Drawer
      title={isEdit ? '编辑调岗申请' : '新增调岗申请'}
      open={open} onClose={onCancel} width={640} destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          {isEdit ? [
            <Button key="cancel" onClick={onCancel}>取消</Button>,
            <Button key="save" type="primary" loading={loading} onClick={() => handleSubmit(false)} style={{ marginLeft: 8 }}>保存</Button>,
          ] : [
            <Button key="cancel" onClick={onCancel}>取消</Button>,
            <Button key="draft" loading={loading} onClick={() => handleSubmit(false)} style={{ marginLeft: 8 }}>保存草稿</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={() => handleSubmit(true)} style={{ marginLeft: 8 }}>提交审批</Button>,
          ]}
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Form.Item name="employeeId" label="选择员工"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="搜索在职员工" showSearch
            filterOption={false} onSearch={handleSearch} loading={searchLoading}
            options={empList}
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

        <Form.Item name="toPositionId" label="新职位"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择新职位" showSearch
            optionFilterProp="label" options={posList}
          />
        </Form.Item>

        <Form.Item name="toRankCode" label="新职级">
          <Input placeholder="如 P5、M2（可选）" maxLength={8} />
        </Form.Item>

        <Form.Item name="toReporterId" label="新直属汇报人">
          <Select placeholder="搜索员工（可选）" showSearch allowClear
            filterOption={false} onSearch={handleSearch} loading={searchLoading}
            options={empList}
          />
        </Form.Item>

        <Form.Item name="workLocation" label="工作地点">
          <Input placeholder="如 上海、北京（可选）" maxLength={64} />
        </Form.Item>

        <Form.Item name="employmentType" label="入职类型"
          rules={[{ required: true, message: '必选' }]}>
          <Select placeholder="选择入职类型">
            <Select.Option value="FULL_TIME">全职</Select.Option>
            <Select.Option value="PART_TIME">兼职</Select.Option>
            <Select.Option value="INTERN">实习</Select.Option>
          </Select>
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
    </Drawer>
  );
};

export default TransferFormModal;
