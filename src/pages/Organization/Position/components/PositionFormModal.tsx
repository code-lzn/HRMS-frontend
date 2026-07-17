import {
  addPositionUsingPost,
  updatePositionUsingPut,
} from '@/api/positionController';
import {
  DeploymentUnitOutlined,
  SafetyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Col, Form, Input, message, Modal, Row, Select, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { COLORS } from '../../styles';

/** 序列选项配置 */
const SEQUENCE_OPTIONS = [
  {
    value: 1,
    label: '管理序列',
    subLabel: 'M序列',
    color: '#8b5cf6',
    icon: <TeamOutlined style={{ fontSize: 20, color: '#fff' }} />,
    range: 'M1-M5',
  },
  {
    value: 2,
    label: '专业序列',
    subLabel: 'P序列',
    color: '#2563eb',
    icon: <DeploymentUnitOutlined style={{ fontSize: 20, color: '#fff' }} />,
    range: 'P1-P10',
  },
  {
    value: 3,
    label: '支持序列',
    subLabel: 'S序列',
    color: '#10b981',
    icon: <SafetyOutlined style={{ fontSize: 20, color: '#fff' }} />,
    range: 'S1-S5',
  },
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
        defaultProbationMonths: editRecord.defaultProbationMonths ?? 6,
        description: editRecord.description,
      });
      setSelectedSequence(editRecord.sequence ?? 2);
    } else {
      form.resetFields();
      form.setFieldsValue({ sequence: 2, defaultProbationMonths: 6 });
      setSelectedSequence(2);
    }
  }, [open, mode, editRecord, form]);

  /** 点击卡片选择序列 */
  const handleCardClick = (value: number) => {
    setSelectedSequence(value);
    form.setFieldValue('sequence', value);
    // 切换序列时清空职级选择
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
      const body = {
        name: values.name,
        sequence: values.sequence,
        departmentId: values.departmentId ?? null,
        levelMin: values.levelMin,
        levelMax: values.levelMax,
        defaultProbationMonths: values.defaultProbationMonths ?? 6,
        description: values.description,
      };

      if (mode === 'add') {
        await addPositionUsingPost(body);
        message.success('新增职位成功');
      } else {
        await updatePositionUsingPut({ ...body, id: editRecord!.id });
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
      title={
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'add' ? '新增职位' : '编辑职位'}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
      centered
      styles={{ mask: { background: 'rgba(0,0,0,0.45)' } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 8 }}
        requiredMark="optional"
      >
        {/* 职位名称 */}
        <Form.Item
          name="name"
          label="职位名称"
          rules={[
            { required: true, message: '请输入职位名称' },
            { max: 32, message: '职位名称最长32个字符' },
          ]}
        >
          <Input
            placeholder="如：Java开发工程师"
            maxLength={32}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        {/* 职位序列 - 卡片式单选 */}
        <Form.Item
          name="sequence"
          label="职位序列"
          rules={[{ required: true, message: '请选择职位序列' }]}
        >
          <Row gutter={12}>
            {SEQUENCE_OPTIONS.map((opt) => {
              const isSelected = selectedSequence === opt.value;
              return (
                <Col span={8} key={opt.value}>
                  <div
                    onClick={() => handleCardClick(opt.value)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: isSelected
                        ? `2px solid ${COLORS.primaryBlue}`
                        : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#94a3b8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    {/* 图标 */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: opt.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {opt.icon}
                    </div>
                    {/* 序列名 */}
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: isSelected ? COLORS.primaryBlue : COLORS.textPrimary,
                      }}
                    >
                      {opt.label}
                    </div>
                    {/* 子标签 */}
                    <div
                      style={{
                        fontSize: 12,
                        color: isSelected ? COLORS.primaryBlue : COLORS.textMuted,
                      }}
                    >
                      {opt.subLabel}
                    </div>
                    {/* 范围标签 */}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 500,
                        background: isSelected ? COLORS.primaryBlue : '#f1f5f9',
                        color: isSelected ? '#fff' : COLORS.textMuted,
                      }}
                    >
                      {opt.range}
                    </span>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Form.Item>

        {/* 所属部门 */}
        <Form.Item name="departmentId" label="所属部门">
          <TreeSelect
            treeData={treeSelectData}
            placeholder="全公司通用"
            allowClear
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        {/* 职级范围 */}
        <Form.Item label="职级范围" required>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="levelMin"
                rules={[{ required: true, message: '请选择职级下限' }]}
                noStyle
              >
                <Select
                  placeholder="最小职级"
                  options={currentLevels.map((l) => ({ label: l, value: l }))}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="levelMax"
                rules={[{ required: true, message: '请选择职级上限' }]}
                noStyle
              >
                <Select
                  placeholder="最大职级"
                  options={currentLevels.map((l) => ({ label: l, value: l }))}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {/* 默认试用期 */}
        <Form.Item
          name="defaultProbationMonths"
          label="默认试用期"
          rules={[{ required: true, message: '请选择默认试用期' }]}
        >
          <Select
            placeholder="请选择"
            options={[
              { label: '1个月', value: 1 },
              { label: '2个月', value: 2 },
              { label: '3个月', value: 3 },
              { label: '6个月', value: 6 },
            ]}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        {/* 职位描述 */}
        <Form.Item
          name="description"
          label="职位描述"
          rules={[{ max: 256, message: '职位描述最长256个字符' }]}
        >
          <Input.TextArea
            placeholder="请输入岗位职责说明..."
            maxLength={256}
            rows={3}
            style={{ borderRadius: 6, minHeight: 100 }}
          />
        </Form.Item>
      </Form>

      {/* 底部按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16,
          marginTop: 8,
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 400,
          }}
        >
          取消
        </button>
        <button
          onClick={handleOk}
          disabled={submitting}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: submitting ? '#93c5fd' : COLORS.primaryBlue,
            color: '#fff',
            fontSize: 14,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </Modal>
  );
};

export default PositionFormModal;
