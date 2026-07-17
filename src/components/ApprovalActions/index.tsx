import { approve, cancelApproval, rejectApproval, transferApproval } from '@/api/approvalController';
import { getEmployeeList } from '@/api/employeeController';
import { CheckOutlined, CloseOutlined, RollbackOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select } from 'antd';
import { useState } from 'react';

export interface ApprovalActionsProps {
  nodeId?: number;
  instanceId?: number;
  isCurrentApprover?: boolean;
  isApplicant?: boolean;
  currentNodeOrder?: number;
  instanceStatus?: number;
  onSuccess?: () => void;
}

type ActionType = 'approve' | 'reject' | 'transfer' | 'cancel';

const ApprovalActions: React.FC<ApprovalActionsProps> = ({ nodeId, instanceId, isCurrentApprover = false, isApplicant = false, currentNodeOrder, instanceStatus, onSuccess }) => {
  const [actionLoading, setActionLoading] = useState<Record<ActionType, boolean>>({ approve: false, reject: false, transfer: false, cancel: false });
  const [modalOpen, setModalOpen] = useState<ActionType | null>(null);
  const [form] = Form.useForm();
  const [empOptions, setEmpOptions] = useState<{ label: string; value: number }[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  const showActions = isCurrentApprover && nodeId;
  const showCancel = isApplicant && currentNodeOrder === 1 && instanceStatus === 1 && instanceId;
  if (!showActions && !showCancel) return null;

  const handleAction = async (type: ActionType) => {
    setActionLoading((p) => ({ ...p, [type]: true }));
    try {
      const v = form.getFieldsValue();
      if (type === 'approve' && nodeId) { await approve(nodeId, { comment: v.comment }); message.success('审批通过'); }
      else if (type === 'reject' && nodeId) { await rejectApproval(nodeId, { comment: v.comment }); message.success('已拒绝'); }
      else if (type === 'transfer' && nodeId) { await transferApproval(nodeId, { toApproverId: v.toApproverId, comment: v.comment }); message.success('已转交'); }
      else if (type === 'cancel' && instanceId) { await cancelApproval(instanceId); message.success('已撤回'); }
      setModalOpen(null); form.resetFields(); onSuccess?.();
    } catch (e: any) {
      const msg = e?.message || '操作失败';
      message.error(msg);
      if (msg?.includes('40004') || msg?.includes('已被处理')) onSuccess?.();
    } finally { setActionLoading((p) => ({ ...p, [type]: false })); }
  };

  const openModal = (type: ActionType) => {
    if (type === 'cancel') { Modal.confirm({ title: '确认撤回', content: '确定要撤回该申请吗？', onOk: () => handleAction('cancel') }); return; }
    form.resetFields(); setModalOpen(type);
  };

  const searchEmp = async (kw: string) => {
    if (!kw) { setEmpOptions([]); return; }
    setEmpLoading(true);
    try {
      const res = await getEmployeeList({ current: 1, pageSize: 20, name: kw });
      setEmpOptions((res?.data?.records || []).map((e: any) => ({ label: `${e.name} (${e.employeeNo}) - ${e.departmentName || ''}`, value: e.id })));
    } catch { setEmpOptions([]); } finally { setEmpLoading(false); }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        {showActions && <>
          <Button type="primary" icon={<CheckOutlined />} loading={actionLoading.approve} onClick={() => openModal('approve')}>通过</Button>
          <Button danger icon={<CloseOutlined />} loading={actionLoading.reject} onClick={() => openModal('reject')}>拒绝</Button>
          <Button icon={<SwapOutlined />} loading={actionLoading.transfer} onClick={() => openModal('transfer')}>转交</Button>
        </>}
        {showCancel && <Button icon={<RollbackOutlined />} loading={actionLoading.cancel} onClick={() => openModal('cancel')}>撤回</Button>}
      </div>
      <Modal title="审批通过" open={modalOpen === 'approve'} onOk={() => handleAction('approve')} onCancel={() => setModalOpen(null)} confirmLoading={actionLoading.approve} destroyOnClose>
        <Form form={form} layout="vertical"><Form.Item name="comment" label="审批意见（选填）"><Input.TextArea rows={3} placeholder="请输入审批意见" /></Form.Item></Form>
      </Modal>
      <Modal title="审批拒绝" open={modalOpen === 'reject'} onOk={() => handleAction('reject')} onCancel={() => setModalOpen(null)} confirmLoading={actionLoading.reject} destroyOnClose>
        <Form form={form} layout="vertical"><Form.Item name="comment" label="拒绝理由（必填）" rules={[{ required: true, message: '请输入拒绝理由' }]}><Input.TextArea rows={3} placeholder="请输入拒绝理由" /></Form.Item></Form>
      </Modal>
      <Modal title="审批转交" open={modalOpen === 'transfer'} onOk={() => handleAction('transfer')} onCancel={() => setModalOpen(null)} confirmLoading={actionLoading.transfer} destroyOnClose>
        <Form form={form} layout="vertical"><Form.Item name="toApproverId" label="转交给" rules={[{ required: true, message: '请选择转交人' }]}><Select showSearch placeholder="搜索并选择员工" filterOption={false} onSearch={searchEmp} options={empOptions} loading={empLoading} /></Form.Item><Form.Item name="comment" label="转交说明（选填）"><Input.TextArea rows={3} placeholder="请输入转交说明" /></Form.Item></Form>
      </Modal>
    </>
  );
};

export default ApprovalActions;
