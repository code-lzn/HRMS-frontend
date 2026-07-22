import { mergeDepartmentsUsingPost } from '@/api/departmentController';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Form, message, Modal, Select, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { buildTreeSelectData, flattenTree, isDescendant } from '@/utils/treeUtils';
import { extractData, getErrorMessage } from '@/utils/apiHelper';

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
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const sourceOptions = useMemo(() => flattenTree(treeData), [treeData]);
  const targetTreeData = useMemo(
    () => buildTreeSelectData(treeData),
    [treeData],
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
      const mergeResult = extractData<API.DepartmentMergeResultVO>(res, {});
      Modal.success({
        title: '合并成功',
        icon: <ExclamationCircleOutlined />,
        content: `已将 ${mergeResult?.transferredEmployees ?? 0} 名员工和 ${mergeResult?.transferredChildDepts ?? 0} 个子部门转移至目标部门。`,
      });
      onSuccess();
    } catch (e: unknown) {
      message.error(getErrorMessage(e));
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
