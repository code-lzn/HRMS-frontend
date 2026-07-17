import { CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Segmented,
  Select,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface OnboardingFormModalProps {
  open: boolean;
  onClose: () => void;
  /** 草稿初始值（编辑草稿时使用） */
  initialValues?: Record<string, any>;
}

/** 新建/编辑入职申请 Drawer（右侧滑出） */
const OnboardingFormModal: React.FC<OnboardingFormModalProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  /** 操作类型：save-保存草稿，submit-提交审批 */
  const [actionType, setActionType] = React.useState<'save' | 'submit'>('save');

  /** 关闭 Drawer */
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  /** 提交表单，根据 actionType 区分行为 */
  const handleSubmit = async (type: 'save' | 'submit') => {
    try {
      setActionType(type);
      setSubmitting(true);
      const values = await form.validateFields();
      console.log(type === 'save' ? '保存草稿:' : '提交审批:', values);
      if (type === 'save') {
        message.success(initialValues ? '已更新草稿' : '草稿已保存');
      } else {
        message.success('已提交审批');
      }
      form.resetFields();
      onClose();
    } catch {
      // 校验失败
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      width={520}
      closable={false}
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column' },
      }}
      title={null}
    >
      {/* Drawer 顶部：标题 + 关闭按钮 */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {initialValues ? '编辑入职申请' : '新建入职申请'}
          </h2>
          <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
            填写候选人基本信息
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          style={{ marginTop: -4 }}
        />
      </div>

      {/* Drawer 中部：表单 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            employmentType: 'fulltime',
            ...initialValues,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <span>
                    姓名 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={
                  <span>
                    性别 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select
                  placeholder="请选择"
                  options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label={
              <span>
                手机号 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span>
                邮箱 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="idCard"
            label={
              <span>
                身份证号 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: '请输入18位身份证号' },
              { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' },
            ]}
          >
            <Input placeholder="请输入18位身份证号" maxLength={18} />
          </Form.Item>

          <Form.Item
            name="expectedHireDate"
            label={
              <span>
                预计入职日期 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            rules={[{ required: true, message: '请选择预计入职日期' }]}
            getValueProps={(value) => ({ value: value ? dayjs(value) : value })}
          >
            <DatePicker style={{ width: '100%' }} placeholder="年/月/日" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label={
                  <span>
                    所属部门 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: '请选择所属部门' }]}
              >
                <Select
                  placeholder="请选择"
                  options={[
                    { label: '技术部', value: 'tech' },
                    { label: '产品部', value: 'product' },
                    { label: '运营部', value: 'operation' },
                    { label: '市场部', value: 'marketing' },
                    { label: '人事行政部', value: 'hr' },
                    { label: '财务部', value: 'finance' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label={
                  <span>
                    职位 <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: '请选择职位' }]}
              >
                <Select
                  placeholder="请选择"
                  options={[
                    { label: '前端工程师', value: 'frontend' },
                    { label: '后端工程师', value: 'backend' },
                    { label: '测试工程师', value: 'qa' },
                    { label: '产品经理', value: 'pm' },
                    { label: '运营专员', value: 'operation' },
                    { label: '市场专员', value: 'marketing' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="employmentType"
            label={
              <span>
                录用类型 <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            rules={[{ required: true, message: '请选择录用类型' }]}
          >
            <Segmented
              block
              options={[
                { label: '全职', value: 'fulltime' },
                { label: '兼职', value: 'parttime' },
                { label: '实习', value: 'intern' },
              ]}
            />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea
              rows={3}
              placeholder="请输入备注（选填）"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </div>

      {/* Drawer 底部：操作按钮 */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          gap: 12,
        }}
      >
        <Button
          block
          size="large"
          onClick={() => handleSubmit('save')}
          loading={submitting && actionType === 'save'}
        >
          保存草稿
        </Button>
        <Button
          block
          size="large"
          type="primary"
          onClick={() => handleSubmit('submit')}
          loading={submitting && actionType === 'submit'}
        >
          提交审批
        </Button>
      </div>
    </Drawer>
  );
};

export default OnboardingFormModal;
