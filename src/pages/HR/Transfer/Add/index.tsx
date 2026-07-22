import {
  saveDraft, submitTransfer, updateTransfer, submitDraft,
} from '../services/transfer';
import { listEmployeesUsingGet } from '@/api/employeeController';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { listPositionsUsingGet } from '@/api/positionController';
import type { TransferAddRequest, TransferVO } from '../types/transfer';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, Input, Select, InputNumber, DatePicker, message, Space, Descriptions, Divider, Spin, Modal,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import dayjs from 'dayjs';

const TransferAddPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = (location.state as any)?.editData as TransferVO | undefined;
  const isEdit = !!editData;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [empList, setEmpList] = useState<{ label: string; value: number }[]>([]);
  const [deptList, setDeptList] = useState<{ label: string; value: number }[]>([]);
  const [posList, setPosList] = useState<{ label: string; value: number }[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    Promise.all([fetchEmpList(), fetchDeptList(), fetchPosList()]).finally(() => setLoading(false));
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
    }
  }, []);

  const handleSubmit = async (submitNow: boolean) => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
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
      setDirty(false);
      navigate('/hr/transfer');
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
        onOk: () => navigate('/hr/transfer'),
      });
    } else {
      navigate('/hr/transfer');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;

  const inputStyle = { borderRadius: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa' }}>
      <Card style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8edf2' }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }} onClick={handleCancel}>返回列表</Button>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#000' }}>{isEdit ? '编辑调岗申请' : '新增调岗申请'}</span>
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

      <Card title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>调岗申请</span>}
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

          <Form.Item name="toDeptId" label={<span style={{ fontSize: 13, color: '#333' }}>新部门 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="选择新部门" showSearch
              optionFilterProp="label" options={deptList}
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item name="toPositionId" label={<span style={{ fontSize: 13, color: '#333' }}>新职位 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="选择新职位" showSearch
              optionFilterProp="label" options={posList}
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item name="toRankCode" label={<span style={{ fontSize: 13, color: '#333' }}>新职级</span>}>
            <Input placeholder="如 P5、M2（可选）" maxLength={8} style={inputStyle} />
          </Form.Item>

          <Form.Item name="toReporterId" label={<span style={{ fontSize: 13, color: '#333' }}>新直属汇报人</span>}>
            <Select placeholder="搜索员工（可选）" showSearch allowClear
              optionFilterProp="label" options={empList}
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item name="workLocation" label={<span style={{ fontSize: 13, color: '#333' }}>工作地点</span>}>
            <Input placeholder="如 上海、北京（可选）" maxLength={64} style={inputStyle} />
          </Form.Item>

          <Form.Item name="employmentType" label={<span style={{ fontSize: 13, color: '#333' }}>入职类型 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必选' }]}>
            <Select placeholder="选择入职类型" style={inputStyle}>
              <Select.Option value="FULL_TIME">全职</Select.Option>
              <Select.Option value="PART_TIME">兼职</Select.Option>
              <Select.Option value="INTERN">实习</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="salaryAdjustment" label={<span style={{ fontSize: 13, color: '#333' }}>调岗调薪金额</span>}>
            <InputNumber min={0} step={100} style={{ width: '100%', ...inputStyle }}
              prefix="¥" placeholder="如无需调整可留空" />
          </Form.Item>

          <Form.Item name="reason" label={<span style={{ fontSize: 13, color: '#333' }}>调岗原因 <span style={{ color: '#ff4d4f' }}>*</span></span>}
            rules={[{ required: true, message: '必填' }]}>
            <Input.TextArea placeholder="请填写调岗原因" maxLength={256} rows={3} style={inputStyle} />
          </Form.Item>

          <Form.Item name="effectiveDate" label={<span style={{ fontSize: 13, color: '#333' }}>生效日期</span>}>
            <DatePicker style={{ width: '100%', ...inputStyle }} placeholder="默认为审批通过日期" />
          </Form.Item>

          <Form.Item name="remark" label={<span style={{ fontSize: 13, color: '#333' }}>备注</span>}>
            <Input.TextArea placeholder="单据备注" maxLength={512} rows={2} style={inputStyle} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TransferAddPage;
