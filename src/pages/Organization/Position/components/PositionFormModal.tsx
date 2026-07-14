import {
  addPositionUsingPost,
  updatePositionUsingPut,
} from '@/api/positionController';
import { Form, Input, InputNumber, App, Modal, Radio, Select, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

const SEQUENCE_OPTIONS = [
  { label: '管理序列 (M)', value: 1 },
  { label: '专业序列 (P)', value: 2 },
  { label: '支持序列 (S)', value: 3 },
];

/** 将部门树转为 TreeSelect 数据 */
const buildTreeSelectData = (nodes: API.DepartmentTreeVO[]): any[] =>
  nodes.map((node) => ({
    key: node.id!,
    value: node.id!,
    title: node.name,
    children: node.children?.length ? buildTreeSelectData(node.children) : [],
  }));

interface PositionFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  editRecord?: API.PositionVO | null;
  sequences: API.SequenceLevelVO[];
  treeData: API.DepartmentTreeVO[];
  onClose: () => void;
  onSuccess: () => void;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  mode,
  editRecord,
  sequences,
  treeData,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<number>(2);

  const treeSelectData = useMemo(() => buildTreeSelectData(treeData), [treeData]);

  // 当前序列对应的职级列表
  const currentLevels = useMemo(() => {
    const seq = sequences.find((s) => s.sequence === selectedSequence);
    return seq?.levels ?? [];
  }, [sequences, selectedSequence]);

  // 打开弹窗时初始化
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editRecord) {
      form.setFieldsValue({
        name: editRecord.name,
        sequence: editRecord.sequence,
        departmentId: editRecord.departmentId,
        levelMin: editRecord.levelMin,
        levelMax: editRecord.levelMax,
        defaultProbationMonths: editRecord.defaultProbationMonths ?? 3,
        description: editRecord.description,
      });
      setSelectedSequence(editRecord.sequence ?? 2);
    } else {
      form.resetFields();
      form.setFieldsValue({ sequence: 2, defaultProbationMonths: 3 });
      setSelectedSequence(2);
    }
  }, [open, mode, editRecord, form]);

  const handleSequenceChange = (val: number) => {
    setSelectedSequence(val);
    // 清空职级选择
    form.setFieldsValue({ levelMin: undefined, levelMax: undefined });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 校验职级下限 <= 上限
      if (values.levelMin && values.levelMax && currentLevels.length > 0) {
        const minIdx = currentLevels.indexOf(values.levelMin);
        const maxIdx = currentLevels.indexOf(values.levelMax);
        if (minIdx === -1 || maxIdx === -1) {
          message.error('职级不在对应序列范围内');
          return;
        }
        if (minIdx > maxIdx) {
          message.error('职级下限不能高于职级上限');
          return;
        }
      }

      setSubmitting(true);
      if (mode === 'add') {
        await addPositionUsingPost({
          name: values.name,
          sequence: values.sequence,
          departmentId: values.departmentId ?? null,
          levelMin: values.levelMin,
          levelMax: values.levelMax,
          defaultProbationMonths: values.defaultProbationMonths ?? 3,
          description: values.description,
        });
        message.success('新增职位成功');
      } else {
        await updatePositionUsingPut({
          id: editRecord!.id,
          name: values.name,
          sequence: values.sequence,
          departmentId: values.departmentId ?? null,
          levelMin: values.levelMin,
          levelMax: values.levelMax,
          defaultProbationMonths: values.defaultProbationMonths ?? 3,
          description: values.description,
        });
        message.success('编辑职位成功');
      }
      onSuccess();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增职位' : '编辑职位'}
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
          label="职位名称"
          rules={[
            { required: true, message: '请输入职位名称' },
            { max: 32, message: '职位名称最长32个字符' },
          ]}
        >
          <Input placeholder="请输入职位名称" maxLength={32} />
        </Form.Item>

        <Form.Item
          name="sequence"
          label="职位序列"
          rules={[{ required: true, message: '请选择职位序列' }]}
        >
          <Radio.Group options={SEQUENCE_OPTIONS} onChange={(e) => handleSequenceChange(e.target.value)} />
        </Form.Item>

        <Form.Item name="departmentId" label="所属部门">
          <TreeSelect
            treeData={treeSelectData}
            placeholder="不选则为全公司通用"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="levelMin"
          label="职级下限"
          rules={[{ required: true, message: '请选择职级下限' }]}
        >
          <Select placeholder="请选择" options={currentLevels.map((l) => ({ label: l, value: l }))} />
        </Form.Item>

        <Form.Item
          name="levelMax"
          label="职级上限"
          rules={[{ required: true, message: '请选择职级上限' }]}
        >
          <Select placeholder="请选择" options={currentLevels.map((l) => ({ label: l, value: l }))} />
        </Form.Item>

        <Form.Item
          name="defaultProbationMonths"
          label="默认试用期（月）"
          rules={[{ required: true, message: '请输入试用期月数' }]}
        >
          <InputNumber min={1} max={12} precision={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="职位描述"
          rules={[{ max: 256, message: '职位描述最长256个字符' }]}
        >
          <Input.TextArea placeholder="请输入职位描述" maxLength={256} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PositionFormModal;
