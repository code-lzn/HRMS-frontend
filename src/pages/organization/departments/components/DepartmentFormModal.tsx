import {
  createDepartmentUsingPost,
  getDepartmentDetailUsingGet,
  updateDepartmentUsingPut,
} from '@/api/departmentController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  TreeSelect,
  message,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

const { TextArea } = Input;

interface DepartmentFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  deptId?: number;
  parentId?: number;
  excludeIds?: number[];
  onClose: () => void;
  onSuccess: () => void;
}

/** 从树中递归收集某节点自身及其所有子孙的 id */
function collectDescendantIds(
  nodes: API.DepartmentTreeNode[],
  targetId: number,
): number[] {
  for (const node of nodes) {
    if (node.id === targetId) {
      const ids: number[] = [targetId];
      const walk = (children: API.DepartmentTreeNode[]) => {
        for (const c of children) {
          ids.push(c.id!);
          if (c.children) walk(c.children);
        }
      };
      if (node.children) walk(node.children);
      return ids;
    }
    if (node.children) {
      const found = collectDescendantIds(node.children, targetId);
      if (found.length > 0) return found;
    }
  }
  return [];
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  mode,
  deptId,
  parentId,
  excludeIds: excludeIdsProp,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [searchingManager, setSearchingManager] = useState(false);
  const { data: treeData } = useDepartmentTree();
  const queryClient = useQueryClient();

  const isEdit = mode === 'edit';

  /** 编辑模式下自动拉取被编辑部门的完整数据 */
  const { data: editingDept } = useQuery({
    queryKey: queryKeys.departments.detail(deptId!),
    queryFn: async () => {
      const res = await getDepartmentDetailUsingGet({ id: deptId! });
      return res.data as API.DepartmentVO | undefined;
    },
    enabled: isEdit && !!deptId && open,
    staleTime: 0,
  });

  /** 编辑时需要排除的 id（自身 + 子孙），创建时用外部传入，编辑时自动计算 */
  const excludeIds = useMemo(() => {
    if (isEdit && deptId && treeData) {
      return collectDescendantIds(treeData, deptId);
    }
    return excludeIdsProp ?? [];
  }, [isEdit, deptId, treeData, excludeIdsProp]);

  /** 弹窗打开时回填表单 */
  useEffect(() => {
    if (!open) return;
    if (isEdit && editingDept) {
      form.setFieldsValue({
        name: editingDept.name,
        code: editingDept.code,
        parentId: editingDept.parentId,
        managerId: editingDept.managerId,
        sortOrder: editingDept.sortOrder,
        description: editingDept.description,
      });
      // 如果已有负责人，预填选项
      if (editingDept.managerId && editingDept.managerName) {
        setEmployeeOptions([
          { label: editingDept.managerName, value: editingDept.managerId },
        ]);
      }
    } else if (!isEdit) {
      form.resetFields();
      setEmployeeOptions([]);
      if (parentId !== undefined) {
        form.setFieldValue('parentId', parentId);
      }
    }
  }, [open, isEdit, editingDept, parentId, form]);

  /**
   * 将部门树转 TreeSelect 所需格式，编辑时过滤自身及子孙
   */
  const treeSelectData = React.useMemo(() => {
    const convert = (nodes: API.DepartmentTreeNode[]): any[] => {
      return nodes
        .filter((n) => !excludeIds?.includes(n.id!))
        .map((n) => ({
          title: n.name,
          value: n.id,
          children: n.children ? convert(n.children) : undefined,
        }));
    };
    return convert(treeData ?? []);
  }, [treeData, excludeIds]);

  /**
   * 远程搜索员工（部门负责人）
   */
  const searchEmployees = async (keyword: string) => {
    if (!keyword) {
      setEmployeeOptions([]);
      return;
    }
    setSearchingManager(true);
    try {
      const res = await getEmployeeListUsingGet({
        keyword,
        current: 1,
        pageSize: 20,
      });
      const list = ((res.data as any)?.records ?? []).map((e: any) => ({
        label: `${e.name} (${e.employeeNo})`,
        value: e.id,
      }));
      setEmployeeOptions(list);
    } catch {
      setEmployeeOptions([]);
    } finally {
      setSearchingManager(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit && deptId) {
        await updateDepartmentUsingPut({ id: deptId }, values);
        message.success('编辑成功');
      } else {
        await createDepartmentUsingPost(values);
        message.success('新增成功');
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.departments.tree() });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      onSuccess();
    } catch (error: any) {
      if (error?.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑部门' : '新增部门'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ sortOrder: 0 }}
      >
        <Form.Item
          name="name"
          label="部门名称"
          rules={[
            { required: true, message: '请输入部门名称' },
            { max: 64, message: '最多64个字符' },
          ]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label={
            <span>
              部门编码{' '}
              <InfoCircleOutlined
                style={{ color: '#999', cursor: 'help' }}
                title="部门编码建议采用层级格式，如一级部门01，其下二级部门0101"
              />
            </span>
          }
          rules={[
            { required: true, message: '请输入部门编码' },
            { max: 16, message: '最多16个字符' },
            { pattern: /^\d+$/, message: '仅支持纯数字' },
          ]}
        >
          <Input placeholder="如：01" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级部门"
          getValueFromEvent={(val) => val}
        >
          <TreeSelect
            placeholder="请选择上级部门"
            treeData={treeSelectData}
            allowClear
            disabled={isEdit && editingDept?.parentId === null}
            dropdownStyle={{ maxHeight: 300 }}
            notFoundContent="已是最顶层，无上级部门可选"
          />
          {isEdit && editingDept?.parentId === null && (
            <div style={{ color: '#faad14', fontSize: 12, marginTop: 4 }}>
              已是根部门，无上级部门
            </div>
          )}
        </Form.Item>

        <Form.Item name="managerId" label="部门负责人">
          <Select
            showSearch
            placeholder="请输入员工姓名搜索"
            filterOption={false}
            onSearch={searchEmployees}
            options={employeeOptions}
            allowClear
            loading={searchingManager}
            notFoundContent={null}
          />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="排序序号"
          rules={[{ required: true, message: '请输入排序序号' }]}
        >
          <InputNumber
            placeholder="请输入排序序号"
            style={{ width: '100%' }}
            min={0}
            precision={0}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="部门描述"
          rules={[{ max: 256, message: '最多256个字符' }]}
        >
          <TextArea rows={3} placeholder="请输入部门描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentFormModal;
