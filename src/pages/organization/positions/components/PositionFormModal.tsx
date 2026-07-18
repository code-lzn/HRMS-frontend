import {
  createPositionUsingPost,
  updatePositionUsingPut,
} from '@/api/positionController';
import { LEVEL_RANGE_BY_SEQUENCE } from '@/constants/enums';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Input, Modal, Select, TreeSelect, message } from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

interface PositionFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  positionId?: number;
  initialValues?: Record<string, any>;
  onClose: () => void;
  onSuccess: () => void;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  mode,
  positionId,
  initialValues,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: treeData } = useDepartmentTree();
  const queryClient = useQueryClient();

  const isEdit = mode === 'edit';
  const [selectedSequence, setSelectedSequence] = useState<
    number | undefined
  >();

  const treeSelectData = React.useMemo(() => {
    const convert = (nodes: any[]): any[] =>
      nodes.map((n: any) => ({
        title: n.name,
        value: n.id,
        children: n.children ? convert(n.children) : undefined,
      }));
    return convert(treeData ?? []);
  }, [treeData]);

  const handleSequenceChange = (value: number) => {
    setSelectedSequence(value);
    form.setFieldsValue({ levelMin: undefined, levelMax: undefined });
  };

  const levelRange = selectedSequence
    ? LEVEL_RANGE_BY_SEQUENCE[selectedSequence]
    : null;
  const levelMin = levelRange?.min ?? 1;
  const levelMax = levelRange?.max ?? 10;
  const levelPrefix = levelRange?.prefix ?? '';

  const levelOptions = React.useMemo(() => {
    const options: { label: string; value: number }[] = [];
    for (let i = levelMin; i <= levelMax; i++) {
      options.push({ label: `${levelPrefix}${i}`, value: i });
    }
    return options;
  }, [levelMin, levelMax, levelPrefix]);

  const probationOptions = [
    { label: '1个月', value: 1 },
    { label: '2个月', value: 2 },
    { label: '3个月', value: 3 },
    { label: '6个月', value: 6 },
  ];

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues) {
        form.setFieldsValue(initialValues);
        setSelectedSequence(initialValues.sequence);
      } else {
        form.resetFields();
        setSelectedSequence(undefined);
        form.setFieldsValue({ defaultProbationMonths: 3 });
      }
    }
  }, [open, isEdit, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit && positionId) {
        await updatePositionUsingPut({ id: positionId }, values);
        message.success('编辑成功');
      } else {
        await createPositionUsingPost(values);
        message.success('新增成功');
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
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
      title={isEdit ? '编辑职位' : '新增职位'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      width={560}
      centered
      footer={[
        <button
          type="button"
          key="cancel"
          onClick={onClose}
          style={{
            marginRight: 12,
            padding: '8px 24px',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          取消
        </button>,
        <button
          type="button"
          key="save"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: '#1677ff',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          保存
        </button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ defaultProbationMonths: 3 }}
      >
        <Form.Item
          name="name"
          label="职位名称"
          rules={[
            { required: true, message: '请输入职位名称' },
            { max: 64, message: '最多64个字符' },
          ]}
        >
          <Input placeholder="如：Java开发工程师" />
        </Form.Item>

        <Form.Item
          name="sequence"
          label="职位序列"
          rules={[{ required: true, message: '请选择职位序列' }]}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { value: 1, name: 'M 序列', desc: '管理序列', color: '#7c3aed' },
              { value: 2, name: 'P 序列', desc: '专业序列', color: '#06b6d4' },
              { value: 3, name: 'S 序列', desc: '支持序列', color: '#10b981' },
            ].map((item) => {
              const isSelected = form.getFieldValue('sequence') === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => {
                    form.setFieldValue('sequence', item.value);
                    handleSequenceChange(item.value);
                  }}
                  style={{
                    flex: 1,
                    padding: '16px 8px',
                    textAlign: 'center',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    backgroundColor: isSelected ? `${item.color}15` : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: isSelected ? item.color : '#333',
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#999',
                      marginTop: 4,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </Form.Item>

        <Form.Item name="departmentId" label="所属部门">
          <TreeSelect
            placeholder="请选择所属部门（不选表示全公司通用）"
            treeData={treeSelectData}
            allowClear
            dropdownStyle={{ maxHeight: 300 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Form.Item
            name="levelMin"
            label="最小职级"
            rules={[
              { required: true, message: '请选择最小职级' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null)
                    return Promise.resolve();
                  if (value < levelMin || value > levelMax) {
                    return Promise.reject(
                      new Error(`当前序列职级范围为 ${levelMin}-${levelMax}`),
                    );
                  }
                  const lmax = form.getFieldValue('levelMax');
                  if (lmax !== undefined && value > lmax) {
                    return Promise.reject(
                      new Error('最小职级不能大于最大职级'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <Select placeholder="请选择" options={levelOptions} />
          </Form.Item>

          <Form.Item
            name="levelMax"
            label="最大职级"
            rules={[
              { required: true, message: '请选择最大职级' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null)
                    return Promise.resolve();
                  if (value < levelMin || value > levelMax) {
                    return Promise.reject(
                      new Error(`当前序列职级范围为 ${levelMin}-${levelMax}`),
                    );
                  }
                  const lmin = form.getFieldValue('levelMin');
                  if (lmin !== undefined && value < lmin) {
                    return Promise.reject(
                      new Error('最大职级不能小于最小职级'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{
              display: 'inline-block',
              width: 'calc(50% - 8px)',
              marginLeft: 16,
            }}
          >
            <Select placeholder="请选择" options={levelOptions} />
          </Form.Item>
        </Form.Item>

        <Form.Item
          name="defaultProbationMonths"
          label="默认试用期"
          rules={[
            { required: true, message: '请选择默认试用期' },
            {
              type: 'number',
              min: 1,
              max: 6,
              message: '试用期范围为1-6个月',
            },
          ]}
        >
          <Select placeholder="请选择" options={probationOptions} />
        </Form.Item>

        <Form.Item
          name="description"
          label="职位描述"
          rules={[{ max: 256, message: '最多256个字符' }]}
        >
          <TextArea rows={3} placeholder="请输入岗位职责说明..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PositionFormModal;
