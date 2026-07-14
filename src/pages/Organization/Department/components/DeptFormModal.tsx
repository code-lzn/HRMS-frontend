import {
  addDepartmentUsingPost,
  updateDepartmentUsingPut,
} from '@/api/departmentController';
import { listUserVoByPageUsingPost } from '@/api/userController';
import type { DataNode } from 'antd/es/tree';
import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  TreeSelect,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

/** 计算节点层级深度 */
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
  const [employeeOptions, setEmployeeOptions] = useState<API.EmployeeSimpleVO[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const fetchRef = useRef(0);

  const treeSelectData = useMemo(() => buildTreeSelectData(treeData), [treeData]);

  // 搜索员工（负责人）
  const fetchEmployees = useCallback(async (keyword: string) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    setEmployeeLoading(true);
    try {
      const res = await listUserVoByPageUsingPost({
        current: 1,
        pageSize: 20,
        userName: keyword,
      });
      if (fetchId === fetchRef.current) {
        const records = res?.data?.records ?? [];
        const newOptions = records.map((u) => ({
          id: u.id as number,
          employeeName: u.userName ?? '',
        }));
        setEmployeeOptions((prev) => {
          const currentIds = new Set(newOptions.map((o) => o.id));
          const existing = prev.filter((o) => !currentIds.has(o.id));
          return [...existing, ...newOptions];
        });
      }
    } catch {
      // ignore
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedFetch = useCallback((kw: string) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchEmployees(kw), 400);
  }, [fetchEmployees]);

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
        setEmployeeOptions([{ id: editDept.managerId, employeeName: editDept.managerName }]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ parentId: defaultParentId, sortOrder: 0 });
      setEmployeeOptions([]);
    }
  }, [open, mode, editDept, defaultParentId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 前端校验：同级名称不重复
      const parentId = mode === 'add' ? (values.parentId ?? null) : (editDept?.parentId ?? null);
      if (checkSiblingNameDuplicate(treeData, parentId, values.name, mode === 'edit' ? editDept?.id : undefined)) {
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
    } catch (e: any) {
      if (e.message) message.error(e.message);
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

        <Form.Item name="parentId" label="上级部门">
          <TreeSelect
            treeData={treeSelectData}
            placeholder="请选择上级部门"
            allowClear
            treeDefaultExpandAll={false}
            disabled={isEdit}
          />
        </Form.Item>

        <Form.Item name="managerId" label="部门负责人">
          <Select
            showSearch
            placeholder="请输入姓名搜索"
            filterOption={false}
            loading={employeeLoading}
            onSearch={debouncedFetch}
            allowClear
            options={employeeOptions.map((emp) => ({
              value: emp.id,
              label: `${emp.employeeName}（${emp.employeeNo}）`,
            }))}
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
