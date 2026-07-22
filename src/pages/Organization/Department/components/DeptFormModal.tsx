import {
  addDepartmentUsingPost,
  updateDepartmentUsingPut,
} from '@/api/departmentController';
import { listManagerCandidatesUsingGet } from '@/api/employeeController';
import { buildTreeSelectData, isDescendant } from '@/utils/treeUtils';
import { extractData, getErrorMessage } from '@/utils/apiHelper';
import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  TreeSelect,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
const getDeptDepth = (nodes: API.DepartmentTreeVO[], targetId: number, depth = 1): number => {
  for (const node of nodes) {
    if (node.id === targetId) return depth;
    if (node.children?.length) {
      const found = getDeptDepth(node.children, targetId, depth + 1);
      if (found > 0) return found;
    }
  }
  return -1;
};

/** 检查同级部门名称是否重复 */
const checkSiblingNameDuplicate = (
  treeData: API.DepartmentTreeVO[],
  parentId: number | undefined | null,
  name: string,
  excludeId?: number,
): boolean => {
  const siblings = parentId === null || parentId === undefined
    ? treeData
    : treeData.find((n) => n.id === parentId)?.children ?? [];
  return siblings.some(
    (s) => s.name === name && s.id !== excludeId,
  );
};

interface DeptFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  /** 编辑时传入当前部门数据 */
  editDept?: API.DepartmentTreeVO | null;
  /** 新增时的默认上级部门 */
  defaultParentId?: number;
  treeData: API.DepartmentTreeVO[];
  onClose: () => void;
  onSuccess: () => void;
}

const DeptFormModal: React.FC<DeptFormModalProps> = ({
  open,
  mode,
  editDept,
  defaultParentId,
  treeData,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<{ label: string; value: number }[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const treeSelectData = useMemo(() => buildTreeSelectData(treeData), [treeData]);

  // 加载部门负责人候选（系统管理员/HR专员/部门主管）
  const fetchManagerCandidates = useCallback(async () => {
    setEmployeeLoading(true);
    try {
      const res = await listManagerCandidatesUsingGet();
      const records = extractData<API.Employee[]>(res, []);
      setEmployeeOptions(records.map((emp) => ({
        label: `${emp.employeeName}（${emp.employeeNo}）`,
        value: emp.id!,
      })));
    } catch (e: unknown) { console.error('pages/Organization/Department/components/DeptFormModal.tsx', e); setEmployeeOptions([]); } finally {
      setEmployeeLoading(false);
    }
  }, []);

  // 打开弹窗时初始化表单
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editDept) {
      form.setFieldsValue({
        name: editDept.name,
        code: editDept.code,
        parentId: editDept.parentId,
        managerId: editDept.managerId,
        sortOrder: editDept.sortOrder ?? 0,
        description: editDept.description,
      });
      // 预填负责人选项
      if (editDept.managerId && editDept.managerName) {
        setEmployeeOptions([{ label: editDept.managerName, value: editDept.managerId }]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ parentId: defaultParentId, sortOrder: 0 });
      setEmployeeOptions([]);
    }
    // 打开弹窗时加载部门负责人候选
    fetchManagerCandidates();
  }, [open, mode, editDept, defaultParentId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 前端校验：同级名称不重复
      const parentId = values.parentId ?? null;
      // 对于编辑模式，同级指的是新parentId下的子节点
      const effectiveParentForCheck = mode === 'edit' ? (values.parentId ?? editDept?.parentId ?? null) : parentId;
      if (checkSiblingNameDuplicate(treeData, effectiveParentForCheck, values.name, mode === 'edit' ? editDept?.id : undefined)) {
        message.error('同级下已存在相同名称的部门');
        return;
      }

      // 新增时校验层级深度（不能超过5级）
      if (mode === 'add' && values.parentId) {
        const parentDepth = getDeptDepth(treeData, values.parentId);
        if (parentDepth >= 5) {
          message.error('部门层级不能超过5级');
          return;
        }
      }

      // 编辑模式下修改上级部门时的校验
      if (mode === 'edit' && editDept && values.parentId && values.parentId !== editDept.parentId) {
        // 不能将自己作为自己的上级
        if (values.parentId === editDept.id) {
          message.error('不能将自身设为上级部门');
          return;
        }
        // 新上级不能是当前部门的子孙
        if (isDescendant(treeData, editDept.id!, values.parentId)) {
          message.error('目标部门不能是当前部门的子部门');
          return;
        }
        // 检查新上级部门层级深度
        const parentDepth = getDeptDepth(treeData, values.parentId);
        if (parentDepth >= 5) {
          message.error('目标上级部门层级已达上限（5级），无法移动');
          return;
        }
      }

      setSubmitting(true);
      if (mode === 'add') {
        await addDepartmentUsingPost({
          name: values.name,
          code: values.code,
          parentId: values.parentId ?? null,
          managerId: values.managerId ?? null,
          sortOrder: values.sortOrder ?? 0,
          description: values.description,
        });
        message.success('新增部门成功');
      } else {
        await updateDepartmentUsingPut({
          id: editDept!.id,
          name: values.name,
          managerId: values.managerId ?? null,
          sortOrder: values.sortOrder ?? 0,
          description: values.description,
        });
        message.success('编辑部门成功');
      }
      onSuccess();
    } catch (e: unknown) {
      message.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <Modal
      title={isEdit ? '编辑部门' : '新增部门'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="部门名称"
          rules={[
            { required: true, message: '请输入部门名称' },
            { max: 32, message: '部门名称最长32个字符' },
          ]}
        >
          <Input placeholder="请输入部门名称" maxLength={32} />
        </Form.Item>

        <Form.Item
          name="code"
          label="部门编码"
          rules={[
            { required: true, message: '请输入部门编码' },
            { pattern: /^[A-Za-z0-9]{2}$/, message: '部门编码为2位字母或数字' },
          ]}
          extra={isEdit ? '编码创建后不可修改' : undefined}
        >
          <Input
            placeholder="请输入2位编码"
            maxLength={2}
            disabled={isEdit}
          />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级部门"
          extra={
            isEdit
              ? '如需调整上级部门，请使用「合并部门」功能'
              : undefined
          }
        >
          <TreeSelect
            treeData={treeSelectData}
            placeholder={isEdit ? '不可修改' : '请选择上级部门'}
            allowClear
            treeDefaultExpandAll={false}
            disabled={isEdit}
          />
        </Form.Item>

        <Form.Item name="managerId" label="部门负责人">
          <Select
            showSearch
            placeholder="请选择部门负责人"
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
            loading={employeeLoading}
            allowClear
            options={employeeOptions}
          />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="排序序号"
          rules={[{ required: true, message: '请输入排序序号' }]}
        >
          <InputNumber min={0} precision={0} placeholder="越小越靠前" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="部门描述"
          rules={[{ max: 128, message: '部门描述最长128个字符' }]}
        >
          <Input.TextArea placeholder="请输入部门描述" maxLength={128} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeptFormModal;
