import {
  saveDraft, submitRegularization, updateRegularization, submitDraft,
} from '../services/regularization';
import { listEmployeesUsingGet } from '@/api/employeeController';
import type { RegularizationAddRequest, RegularizationVO } from '../types/regularization';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, Input, Select, InputNumber, message, Space, Descriptions, Divider, Modal,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import dayjs from 'dayjs';

const RegularizationAddPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = (location.state as any)?.editData as RegularizationVO | undefined;
  const isEdit = !!editData;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [probationMonths, setProbationMonths] = useState(3);

  const resultValue = Form.useWatch('result', form);

  const fetchEmpList = async () => {
    try {
      const res = await listEmployeesUsingGet({ page: 1, size: 200 });
      const records = res?.data?.records ?? [];
      const probEmployees = records.filter((e: any) => e.status === 1);
      setEmpList(probEmployees.map((e: any) => ({
        label: `${e.employeeName} (${e.employeeNo || '-'})`,
        value: e.id,
      })));
    } catch { setEmpList([]); }
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
      } catch { setSelectedEmp(null); }
    };
    fetchEmp();
  };

  useEffect(() => {
    fetchEmpList();
    if (editData) {
      form.setFieldsValue({ ...editData });
      setSelectedEmp({
        employeeName: editData.employeeName,
        employeeNo: editData.employeeNo,
        departmentName: editData.deptName,
        positionName: editData.positionName,
        hireDate: editData.probationStartDate,
      });
    }
  }, []);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
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
      setDirty(false);
      navigate('/hr/probation');
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (dirty) {
      Modal.confirm({
        title: '未保存的更改将丢失', content: '确定要离开吗？已填写的信息将不会保存。',
        okText: '确定离开', cancelText: '继续填写', okType: 'danger',
        onOk: () => navigate('/hr/probation'),
      });
    } else {
      navigate('/hr/probation');
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

  const inputStyle = { borderRadius: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa' }}>
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2' }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>返回列表</Button>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#000' }}>{isEdit ? '编辑转正申请' : '新增转正申请'}</span>
          </Space>
          <Space>
            <Button style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>取消</Button>
            {isEdit ? (
              <Button type="primary" loading={submitting} style={{ borderRadius: 6, background: '#1677ff' }} onClick={() => handleSubmit(false)}>保存</Button>
            ) : (
              <>
                <Button style={{ borderRadius: 6, borderColor: '#d9d9d9' }} loading={submitting} onClick={() => handleSubmit(false)}>保存草稿</Button>
                <Button type="primary" loading={submitting} style={{ borderRadius: 6, background: '#1677ff' }} onClick={() => handleSubmit(true)}>提交审批</Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>转正申请</span>}
        style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 20 } }}>
        <Form form={form} layout="vertical" onFieldsChange={() => setDirty(true)}>
          <Form.Item name="employeeId" label={<span style={{ fontSize: 13, color: '#333' }}>选择员工 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="搜索试用期员工" showSearch
              optionFilterProp="label" options={empList}
              onChange={handleEmpChange} disabled={isEdit}
              style={inputStyle}
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

          <Form.Item name="evaluation" label={<span style={{ fontSize: 13, color: '#333' }}>试用期表现评价 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必填' }]}>
            <Input.TextArea placeholder="请填写试用期表现评价" maxLength={2000} rows={4} style={inputStyle} />
          </Form.Item>

          <Form.Item name="probationScore" label={<span style={{ fontSize: 13, color: '#333' }}>考核分数</span>}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%', ...inputStyle }}
              placeholder="0~100 分，可选" />
          </Form.Item>

          <Form.Item name="result" label={<span style={{ fontSize: 13, color: '#333' }}>转正评估结果</span>}>
            <Select placeholder="请选择" allowClear style={inputStyle}>
              <Select.Option value="PASS">通过 - 按期转正</Select.Option>
              <Select.Option value="EXTEND">延长试用期</Select.Option>
            </Select>
          </Form.Item>

          {resultValue === 'EXTEND' && (
            <Form.Item name="extendedMonths" label={<span style={{ fontSize: 13, color: '#333' }}>延长月数 <span style={{ color: '#ff4d4f' }}>*</span></span>}
              rules={[{ required: true, message: '请输入延长月数' }]}>
              <InputNumber min={1} max={12} step={1} style={{ width: '100%', ...inputStyle }}
                placeholder="请输入延长试用月数" />
            </Form.Item>
          )}

          <Form.Item name="salaryAdjustment" label={<span style={{ fontSize: 13, color: '#333' }}>转正后薪资调整</span>}>
            <InputNumber style={{ width: '100%', ...inputStyle }} prefix="¥"
              placeholder="正数加薪/负数降薪，如无需调整可留空" />
          </Form.Item>

          <Form.Item name="adjustRemark" label={<span style={{ fontSize: 13, color: '#333' }}>调整说明</span>}>
            <Input placeholder="薪资调整原因" maxLength={256} style={inputStyle} />
          </Form.Item>

          <Form.Item name="remark" label={<span style={{ fontSize: 13, color: '#333' }}>备注</span>}>
            <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} style={inputStyle} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegularizationAddPage;
