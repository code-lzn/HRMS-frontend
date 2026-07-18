import {
  createDepartmentUsingPost,
  getDepartmentDetailUsingGet,
  updateDepartmentUsingPut,
} from '@/api/departmentController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import {
  InfoCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  TreeSelect,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

interface EmployeeOption {
  id: number;
  name: string;
  employeeNo: string;
  departmentName: string;
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
  const { data: treeData } = useDepartmentTree();
  const queryClient = useQueryClient();

  const isEdit = mode === 'edit';

  // ---- 选择负责人弹窗 ----
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKeyword, setPickerKeyword] = useState('');
  const [pickerResults, setPickerResults] = useState<EmployeeOption[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerTotal, setPickerTotal] = useState(0);
  const [selectedManager, setSelectedManager] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const excludeIds = useMemo(() => {
    if (isEdit && deptId && treeData) {
      return collectDescendantIds(treeData, deptId);
    }
    return excludeIdsProp ?? [];
  }, [isEdit, deptId, treeData, excludeIdsProp]);

  /** 弹窗打开/关闭时回填表单 */
  useEffect(() => {
    if (!open) {
      setSelectedManager(null);
      return;
    }
    if (!editingDept) {
      if (!isEdit) {
        form.resetFields();
        setSelectedManager(null);
        if (parentId !== undefined) {
          form.setFieldValue('parentId', parentId);
        }
      }
      return;
    }
    if (isEdit) {
      form.setFieldsValue({
        name: editingDept.name,
        code: editingDept.code,
        parentId: editingDept.parentId,
        sortOrder: editingDept.sortOrder,
        description: editingDept.description,
      });
      if (editingDept.managerId && editingDept.managerName) {
        setSelectedManager({
          id: editingDept.managerId,
          name: editingDept.managerName,
        });
        form.setFieldValue('managerId', editingDept.managerId);
      } else {
        setSelectedManager(null);
        form.setFieldValue('managerId', undefined);
      }
    }
  }, [open, isEdit, editingDept, parentId, form]);

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

  /** 搜索员工（300ms 防抖） */
  const doSearch = useCallback((kw: string, page: number) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!kw) {
      setPickerResults([]);
      setPickerTotal(0);
      return;
    }
    setPickerLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await getEmployeeListUsingGet({
          keyword: kw,
          current: page,
          pageSize: 10,
        });
        const records = ((res.data as any)?.records ?? []) as any[];
        setPickerResults(
          records.map((e) => ({
            id: e.id,
            name: e.name,
            employeeNo: e.employeeNo,
            departmentName: e.departmentName,
          })),
        );
        setPickerTotal((res.data as any)?.total ?? 0);
      } catch {
        setPickerResults([]);
      } finally {
        setPickerLoading(false);
      }
    }, 300);
  }, []);

  /** 打开选择弹窗 */
  const handleOpenPicker = () => {
    setPickerKeyword('');
    setPickerResults([]);
    setPickerPage(1);
    setPickerTotal(0);
    setPickerOpen(true);
  };

  /** 搜索框输入 */
  const handlePickerSearch = (value: string) => {
    setPickerKeyword(value);
    setPickerPage(1);
    doSearch(value, 1);
  };

  /** 分页变化 */
  const handlePickerPageChange = (page: number) => {
    setPickerPage(page);
    doSearch(pickerKeyword, page);
  };

  /** 选中员工 */
  const handleSelectEmployee = (record: EmployeeOption) => {
    setSelectedManager({ id: record.id, name: record.name });
    form.setFieldValue('managerId', record.id);
    setPickerOpen(false);
  };

  /** 清除已选 */
  const handleClearManager = () => {
    setSelectedManager(null);
    form.setFieldValue('managerId', undefined);
  };

  /** 提交 */
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

  // 选人表格列
  const pickerColumns: ColumnsType<EmployeeOption> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => (
        <Space>
          <Avatar
            size={28}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#e6f7ff', color: '#1677ff' }}
          />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 110,
      render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
    },
    { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
  ];

  return (
    <>
      <Modal
        title={isEdit ? '编辑部门' : '新增部门'}
        open={open}
        onOk={handleSubmit}
        onCancel={onClose}
        confirmLoading={loading}
        destroyOnClose
        centered
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

          {/* 部门负责人：隐藏 managerId + 展示选择器 */}
          <Form.Item name="managerId" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="部门负责人">
            <Input
              placeholder="请选择部门负责人"
              value={selectedManager?.name ?? ''}
              readOnly
              style={{ cursor: 'pointer' }}
              onClick={handleOpenPicker}
              suffix={
                <Space size={4}>
                  {selectedManager && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearManager();
                      }}
                    >
                      清除
                    </Button>
                  )}
                  <Button
                    type="link"
                    size="small"
                    icon={<SearchOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPicker();
                    }}
                  >
                    选择
                  </Button>
                </Space>
              }
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

      {/* 选择负责人弹窗 */}
      <Modal
        title="选择部门负责人"
        open={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        footer={null}
        centered
        width={560}
      >
        <Input
          placeholder="输入姓名或工号搜索"
          prefix={<SearchOutlined />}
          value={pickerKeyword}
          onChange={(e) => handlePickerSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
        <Table<EmployeeOption>
          rowKey="id"
          columns={pickerColumns}
          dataSource={pickerResults}
          loading={pickerLoading}
          size="small"
          pagination={{
            current: pickerPage,
            pageSize: 10,
            total: pickerTotal,
            showSizeChanger: false,
            onChange: handlePickerPageChange,
          }}
          onRow={(record) => ({
            onClick: () => handleSelectEmployee(record),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: pickerKeyword
              ? pickerLoading
                ? '搜索中...'
                : '未找到匹配的员工'
              : '输入姓名或工号开始搜索',
          }}
        />
      </Modal>
    </>
  );
};

export default DepartmentFormModal;
