import {
  createPositionUsingPost,
  updatePositionUsingPut,
} from '@/api/positionController';
import { LEVEL_RANGE_BY_SEQUENCE } from '@/constants/enums';
import { queryKeys } from '@/hooks/queryKeys';
import { useDepartmentTree } from '@/hooks/useDepartmentTree';
import { useSequences } from '@/hooks/usePosition';
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

interface PositionFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  /** 编辑时的职位ID */
  positionId?: number;
  /** 初始数据（编辑时回填） */
  initialValues?: Record<string, any>;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 职位新增/编辑弹窗
 * 核心联动：选择职位序列后，职级范围自动校验
 * M[1-5] / P[1-10] / S[1-5]，且 levelMin ≤ levelMax
 */
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
  const { data: sequencesData } = useSequences();
  const { data: treeData } = useDepartmentTree();
  const queryClient = useQueryClient();

  const isEdit = mode === 'edit';
  const [selectedSequence, setSelectedSequence] = useState<
    number | undefined
  >();

  // 序列选项
  const sequenceOptions = (sequencesData ?? []).map((s: any) => ({
    label: `${s.sequenceName} - ${s.sequenceDesc}`,
    value: s.sequence,
  }));

  // 部门树数据
  const treeSelectData = React.useMemo(() => {
    const convert = (nodes: any[]): any[] =>
      nodes.map((n: any) => ({
        title: n.name,
        value: n.id,
        children: n.children ? convert(n.children) : undefined,
      }));
    return convert(treeData ?? []);
  }, [treeData]);

  // 序列变化时联动职级范围校验
  const handleSequenceChange = (value: number) => {
    setSelectedSequence(value);
    // 重置职级字段
    form.setFieldsValue({ levelMin: undefined, levelMax: undefined });
  };

  // 获取当前序列的职级范围
  const levelRange = selectedSequence
    ? LEVEL_RANGE_BY_SEQUENCE[selectedSequence]
    : null;
  const levelMin = levelRange?.min ?? 1;
  const levelMax = levelRange?.max ?? 10;

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
          <Input placeholder="请输入职位名称" />
        </Form.Item>

        <Form.Item
          name="sequence"
          label="职位序列"
          rules={[{ required: true, message: '请选择职位序列' }]}
        >
          <Select
            placeholder="请选择职位序列"
            options={sequenceOptions}
            onChange={(val) => handleSequenceChange(val)}
          />
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
            label="职级下限"
            rules={[
              { required: true, message: '请输入职级下限' },
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
                      new Error('职级下限不能大于职级上限'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <InputNumber
              placeholder={`${levelMin}-${levelMax}`}
              style={{ width: '100%' }}
              min={levelMin}
              max={levelMax}
              precision={0}
            />
          </Form.Item>

          <Form.Item
            name="levelMax"
            label="职级上限"
            rules={[
              { required: true, message: '请输入职级上限' },
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
                      new Error('职级上限不能小于职级下限'),
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
            <InputNumber
              placeholder={`${levelMin}-${levelMax}`}
              style={{ width: '100%' }}
              min={levelMin}
              max={levelMax}
              precision={0}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          name="defaultProbationMonths"
          label="默认试用期（月）"
          rules={[
            { required: true, message: '请输入默认试用期' },
            {
              type: 'number',
              min: 1,
              max: 6,
              message: '试用期范围为1-6个月',
            },
          ]}
        >
          <InputNumber
            placeholder="请输入默认试用期（月）"
            style={{ width: '100%' }}
            min={1}
            max={6}
            precision={0}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="职位描述"
          rules={[{ max: 256, message: '最多256个字符' }]}
        >
          <TextArea rows={3} placeholder="请输入职位描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PositionFormModal;
