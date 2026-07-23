import {
  saveDraft, submitRegularization, updateRegularization, submitDraft,
} from '../services/regularization';
import { listEmployeesUsingGet } from '@/api/employeeController';
import type { RegularizationAddRequest, RegularizationVO } from '../types/regularization';
import {
  Drawer, Form, Input, Select, InputNumber, message, Button, Descriptions, Divider,
} from 'antd';
import { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  editData: RegularizationVO | null;
  onCancel: () => void;
  onOk: () => void;
}

const RegularizationFormModal: React.FC<Props> = ({ open, editData, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [probationMonths, setProbationMonths] = useState(3);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isEdit = !!editData;

  const fetchEmpList = async (keyword?: string) => {
    setSearchLoading(true);
    try {
      const res = await listEmployeesUsingGet({ keyword, page: 1, size: 50 });
      const records = res?.data?.records ?? [];
      const probEmployees = records.filter((e: any) => e.status === 1);
      setEmpList(probEmployees.map((e: any) => ({
        label: `${e.employeeName} (${e.employeeNo || '-'})`,
        value: e.id,
      })));
    } catch (e) { console.error('pages/HR/Probation/components/RegularizationFormModal.tsx', e); setEmpList([]); }
    finally { setSearchLoading(false); }
  };

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => { fetchEmpList(value); }, 300);
  };

  const handleEmpChange = (empId: number) => {
    if (!empId) { setSelectedEmp(null); return; }
    const fetchEmp = async () => {
      try {
        const { getDetailUsingGet } = await import('@/api/employeeController');
        const detailRes = await getDetailUsingGet({ id: empId });
        const emp = detailRes?.data;
        setSelectedEmp(emp ?? null);
        if (emp) {
          form.setFieldsValue({
            probationStartDate: emp.hireDate ? dayjs(emp.hireDate).format('YYYY-MM-DD') : '',
          });
          setProbationMonths(emp.probationMonth ?? 3);
        }
      } catch (e) { console.error('pages/HR/Probation/components/RegularizationFormModal.tsx', e); setSelectedEmp(null); }
    };
    fetchEmp();
  };

  useEffect(() => {
    if (open) {
      if (editData) {
        form.setFieldsValue({ ...editData });
        setEmpList([{ label: `${editData.employeeName} (${editData.employeeNo || '-'})`, value: editData.employeeId }]);
        setSelectedEmp({
          employeeName: editData.employeeName,
          employeeNo: editData.employeeNo,
          departmentName: editData.deptName,
          positionName: editData.positionName,
          hireDate: editData.probationStartDate,
        });
      } else {
        form.resetFields();
        setSelectedEmp(null);
        setProbationMonths(3);
        fetchEmpList();
      }
    }
  }, [open, editData, form]);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload: RegularizationAddRequest = { ...values };
      if (isEdit) {
        await updateRegularization(editData!.id, payload);
        if (submitNow) await submitDraft(editData!.id);
        message.success(submitNow ? '已提交审批' : '已保存');
      } else {
        if (submitNow) {
          await submitRegularization(payload);
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

  const calcProbEnd = () => {
    if (!selectedEmp?.hireDate) return '';
    return dayjs(selectedEmp.hireDate).add(probationMonths, 'month').format('YYYY-MM-DD');
  };

  const calcRemaining = () => {
    if (!selectedEmp?.hireDate) return '';
    const end = dayjs(selectedEmp.hireDate).add(probationMonths, 'month');
    return `${end.diff(dayjs(), 'day')} 天`;
  };

  const resultValue = Form.useWatch('result', form);

  return (
    <Drawer
      title={isEdit ? '编辑转正申请' : '新增转正申请'}
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
          <Select placeholder="搜索试用期员工" showSearch
            filterOption={false} onSearch={handleSearch} loading={searchLoading}
            options={empList}
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
              <Descriptions.Item label="试用期开始">
                {selectedEmp.hireDate ? dayjs(selectedEmp.hireDate).format('YYYY-MM-DD') : ''}
              </Descriptions.Item>
              <Descriptions.Item label="试用期截止(预估)">{calcProbEnd()}</Descriptions.Item>
              <Descriptions.Item label="剩余天数">{calcRemaining()}</Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider plain>转正评估</Divider>

        <Form.Item name="evaluation" label="试用期表现评价"
          rules={[{ required: true, message: '必填' }]}>
          <Input.TextArea placeholder="请填写试用期表现评价" maxLength={2000} rows={4} />
        </Form.Item>

        <Form.Item name="probationScore" label="考核分数">
          <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }}
            placeholder="0~100 分，可选" />
        </Form.Item>

        <Form.Item name="result" label="转正评估结果">
          <Select placeholder="请选择" allowClear>
            <Select.Option value="PASS">通过 - 按期转正</Select.Option>
            <Select.Option value="EXTEND">延长试用期</Select.Option>
          </Select>
        </Form.Item>

        {resultValue === 'EXTEND' && (
          <Form.Item name="extendedMonths" label="延长月数"
            rules={[{ required: true, message: '请输入延长月数' }]}>
            <InputNumber min={1} max={12} step={1} style={{ width: '100%' }}
              placeholder="请输入延长试用月数" />
          </Form.Item>
        )}

        <Form.Item name="salaryAdjustment" label="转正后薪资调整">
          <InputNumber style={{ width: '100%' }} prefix="¥"
            placeholder="正数加薪/负数降薪，如无需调整可留空" />
        </Form.Item>

        <Form.Item name="adjustRemark" label="调整说明">
          <Input placeholder="薪资调整原因" maxLength={256} />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default RegularizationFormModal;
