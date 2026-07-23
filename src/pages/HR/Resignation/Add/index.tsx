import {
  saveDraft, submitResignation, updateResignation, submitDraft,
} from '../services/resignation';
import { listEmployeesUsingGet } from '@/api/employeeController';
import type { ResignationAddRequest, ResignationVO } from '../types/resignation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, Input, Select, DatePicker, message, Space, Descriptions, Divider, Modal,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import dayjs from 'dayjs';

const ResignationAddPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = (location.state as any)?.editData as ResignationVO | undefined;
  const isEdit = !!editData;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

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
        hireDate: undefined,
      });
    }
  }, []);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
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
      setDirty(false);
      navigate('/hr/resignation');
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
        onOk: () => navigate('/hr/resignation'),
      });
    } else {
      navigate('/hr/resignation');
    }
  };

  const inputStyle = { borderRadius: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa' }}>
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2' }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>返回列表</Button>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#000' }}>{isEdit ? '编辑离职申请' : '新增离职申请'}</span>
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

      <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>离职申请</span>}
        style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 20 } }}>
        <Form form={form} layout="vertical" onFieldsChange={() => setDirty(true)}>
          <Form.Item name="employeeId" label={<span style={{ fontSize: 13, color: '#333' }}>选择员工 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="搜索在职员工" showSearch
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
                <Descriptions.Item label="入职日期">
                  {selectedEmp.hireDate ? dayjs(selectedEmp.hireDate).format('YYYY-MM-DD') : ''}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          <Divider plain>离职信息</Divider>

          <Form.Item name="resignDate" label={<span style={{ fontSize: 13, color: '#333' }}>离职日期 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <DatePicker style={{ width: '100%', ...inputStyle }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="选择离职日期（最后工作日）"
            />
          </Form.Item>

          <Form.Item name="resignReasonType" label={<span style={{ fontSize: 13, color: '#333' }}>离职原因大类 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="选择原因大类" options={[
              { label: '主动离职', value: 'VOLUNTARY' },
              { label: '被动离职', value: 'INVOLUNTARY' },
              { label: '协商离职', value: 'NEGOTIATED' },
            ]} style={inputStyle} />
          </Form.Item>

          <Form.Item name="resignType" label={<span style={{ fontSize: 13, color: '#333' }}>离职类型 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="选择离职类型" options={[
              { label: '辞职', value: 'RESIGN' },
              { label: '辞退', value: 'DISMISS' },
              { label: '合同到期不续签', value: 'CONTRACT_EXPIRE' },
              { label: '其他', value: 'OTHER' },
            ]} style={inputStyle} />
          </Form.Item>

          <Form.Item name="detailReason" label={<span style={{ fontSize: 13, color: '#333' }}>详细说明 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必填' }]}>
            <Input.TextArea placeholder="请详细说明离职原因" maxLength={2000} rows={3} style={inputStyle} />
          </Form.Item>

          <Form.Item name="handoverPersonId" label={<span style={{ fontSize: 13, color: '#333' }}>工作交接人 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="搜索交接人" showSearch
              optionFilterProp="label" options={empList}
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item name="remark" label={<span style={{ fontSize: 13, color: '#333' }}>备注</span>}>
            <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} style={inputStyle} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResignationAddPage;
