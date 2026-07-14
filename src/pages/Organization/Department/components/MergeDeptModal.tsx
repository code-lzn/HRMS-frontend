import { mergeDepartmentsUsingPost } from '@/api/departmentController';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Form, App, Modal, Select, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

/** 将部门树转为扁平列表（用于 Select） */
const flattenTree = (nodes: API.DepartmentTreeVO[]): { label: string; value: number }[] => {
  const result: { label: string; value: number }[] = [];
  const walk = (list: API.DepartmentTreeVO[], prefix = '') => {
    for (const node of list) {
      const label = prefix ? `${prefix} / ${node.name}` : (node.name ?? '');
      result.push({ label, value: node.id! });
      if (node.children?.length) walk(node.children, label);
    }
  };
  walk(nodes);
  return result;
};

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (
  nodes: API.DepartmentTreeVO[],
  excludeId?: number,
): any[] =>
  nodes
    .filter((n) => n.id !== excludeId)
    .map((node) => ({
      key: node.id!,
      value: node.id!,
      title: node.name,
      children: node.children?.length ? buildTreeSelectData(node.children, excludeId) : [],
    }));

/** 检查 targetId 是否是 sourceId 的子孙节点 */
const isDescendant = (
  nodes: API.DepartmentTreeVO[],
  sourceId: number,
  targetId: number,
): boolean => {
  const findSource = (list: API.DepartmentTreeVO[]): API.DepartmentTreeVO | undefined => {
    for (const node of list) {
      if (node.id === sourceId) return node;
      if (node.children?.length) {
        const found = findSource(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  const sourceNode = findSource(nodes);
  if (!sourceNode) return false;
  const containsTarget = (list: API.DepartmentTreeVO[]): boolean => {
    for (const node of list) {
      if (node.id === targetId) return true;
      if (node.children?.length && containsTarget(node.children)) return true;
    }
    return false;
  };
  return containsTarget(sourceNode.children ?? []);
};

interface MergeDeptModalProps {
  open: boolean;
  selectedDeptId: number | undefined;
  treeData: API.DepartmentTreeVO[];
  onClose: () => void;
  onSuccess: () => void;
}

const MergeDeptModal: React.FC<MergeDeptModalProps> = ({
  open,
  selectedDeptId,
  treeData,
  onClose,
  onSuccess,
}) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const sourceOptions = useMemo(() => flattenTree(treeData), [treeData]);
  const targetTreeData = useMemo(
    () => buildTreeSelectData(treeData, selectedDeptId),
    [treeData, selectedDeptId],
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { sourceDeptId, targetDeptId } = values;

      if (sourceDeptId === targetDeptId) {
        message.error('源部门与目标部门不能相同');
        return;
      }

      if (isDescendant(treeData, sourceDeptId, targetDeptId)) {
        message.error('目标部门不能是源部门的子部门');
        return;
      }

      setSubmitting(true);
      const res = await mergeDepartmentsUsingPost({ sourceDeptId, targetDeptId });
      const mergeResult = (res as any)?.data as API.DepartmentMergeResultVO | undefined;
      modal.success({
        title: '合并成功',
        icon: <ExclamationCircleOutlined />,
        content: `已将 ${mergeResult?.transferredEmployees ?? 0} 名员工和 ${mergeResult?.transferredChildDepts ?? 0} 个子部门转移至目标部门。`,
      });
      onSuccess();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="合并部门"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={520}
    >
      <div style={{ marginBottom: 16, color: '#faad14' }}>
        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
        合并后源部门将被删除，其员工和子部门将全部转移至目标部门。
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="sourceDeptId"
          label="源部门（被合并）"
          rules={[{ required: true, message: '请选择源部门' }]}
        >
          <Select
            placeholder="请选择源部门"
            options={sourceOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="targetDeptId"
          label="目标部门（保留）"
          rules={[{ required: true, message: '请选择目标部门' }]}
        >
          <TreeSelect
            treeData={targetTreeData}
            placeholder="请选择目标部门"
            treeDefaultExpandAll
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MergeDeptModal;
