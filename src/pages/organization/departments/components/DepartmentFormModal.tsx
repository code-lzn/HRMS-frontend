import {
  createDepartmentUsingPost,
  updateDepartmentUsingPut,
} from '@/api/departmentController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  TreeSelect,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

interface DepartmentFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  /** 编辑时的部门ID */
  deptId?: number;
  /** 初始数据（编辑时回填） */
  initialValues?: Record<string, any>;
  /** 新增子部门时自动填充的上级部门ID */
  parentId?: number;
  /** 编辑时需过滤掉的自身及子孙节点ID列表 */
  excludeIds?: number[];
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 部门新增/编辑弹窗
 * - 编辑模式下过滤自身及子孙节点防止循环引用
 * - 部门编码提供 Tooltip 格式提示
 */
const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  mode,
  deptId,
  initialValues,
  parentId,
  excludeIds,
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

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        setEmployeeOptions([]);
        if (parentId !== undefined) {
          form.setFieldValue('parentId', parentId);
        }
      }
    }
  }, [open, isEdit, initialValues, parentId, form]);

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

        <Form.Item name="parentId" label="上级部门">
          <TreeSelect
            placeholder="请选择上级部门（不选表示根部门）"
            treeData={treeSelectData}
            allowClear
            dropdownStyle={{ maxHeight: 300 }}
          />
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
