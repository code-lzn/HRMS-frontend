import {
  addItemUsingPost,
  updateItemUsingPut,
} from '@/api/salaryManageController';
import { Form, Input, InputNumber, message, Modal, Select, Switch } from 'antd';
import React, { useEffect, useState } from 'react';

const ITEM_TYPE_OPTIONS = [
  { label: '固定收入', value: 1 },
  { label: '变动收入', value: 2 },
  { label: '考勤扣款', value: 3 },
  { label: '社保扣除', value: 4 },
  { label: '公积金扣除', value: 5 },
  { label: '个税', value: 6 },
];

interface ItemFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  accountId: number;
  editRecord?: API.SalaryItemVO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  open,
  mode,
  accountId,
  editRecord,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editRecord) {
      form.setFieldsValue({
        name: editRecord.name,
        itemType: editRecord.itemType,
        formula: editRecord.formula,
        sortOrder: editRecord.sortOrder,
        isTaxable: editRecord.isTaxable === 1,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isTaxable: true, sortOrder: 0 });
    }
  }, [open, mode, editRecord, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: API.SalaryItemRequest = {
        name: values.name,
        itemType: values.itemType,
        formula: values.formula,
        sortOrder: values.sortOrder ?? 0,
        isTaxable: values.isTaxable ? 1 : 0,
      };

      if (mode === 'add') {
        await addItemUsingPost({ id: accountId }, payload);
        message.success('添加工资项目成功');
      } else {
        await updateItemUsingPut({ itemId: editRecord!.id! }, payload);
        message.success('编辑工资项目成功');
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
      title={mode === 'add' ? '添加工资项目' : '编辑工资项目'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="项目名称"
          rules={[
            { required: true, message: '请输入项目名称' },
            { max: 64, message: '项目名称最长64个字符' },
          ]}
        >
          <Input placeholder="如：基本工资、绩效奖金" maxLength={64} />
        </Form.Item>

        <Form.Item
          name="itemType"
          label="项目类型"
          rules={[{ required: true, message: '请选择项目类型' }]}
        >
          <Select placeholder="请选择项目类型" options={ITEM_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="formula"
          label="计算公式/规则描述"
          tooltip="如：基数×绩效系数"
          rules={[{ max: 512, message: '最长512个字符' }]}
        >
          <Input placeholder="请输入计算公式或规则描述" maxLength={512} />
        </Form.Item>

        <Form.Item name="sortOrder" label="排序序号">
          <InputNumber
            min={0}
            max={999}
            precision={0}
            style={{ width: '100%' }}
            placeholder="数字越小越靠前"
          />
        </Form.Item>

        <Form.Item name="isTaxable" label="是否计入个税" valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemFormModal;
