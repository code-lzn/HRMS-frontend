import ApprovalTimeline from '@/components/ApprovalTimeline';
import DesensitizedText from '@/components/DesensitizedText';
import {
  ONBOARDING_STATUS,
  ONBOARDING_STATUS_COLOR,
  ONBOARDING_STATUS_MAP,
} from '@/constants';
import { GENDER_MAP, HIRE_TYPE_MAP } from '@/constants/enums';
import { PageContainer } from '@ant-design/pro-components';
import { history, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Result,
  Row,
  Spin,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { OnboardingDetail as OnboardingDetailType } from '../mock';
import {
  getDetailUsingGet1,
  submitToApprovalUsingPost,
  cancelUsingPost1,
  confirmJoinUsingPost,
  abandonUsingPost,
  deleteDraftUsingDelete,
} from '@/api/onboardingController';

const OnboardingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const access = useAccess();
  const [detail, setDetail] = useState<OnboardingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmForm] = Form.useForm();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getDetailUsingGet1({ id: Number(id) })
      .then((res) => {
        if (res.code === 0 && res.data) {
          setDetail(res.data as unknown as OnboardingDetailType);
        } else {
          setDetail(null);
        }
      })
      .catch(() => {
        message.error('获取入职详情失败');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isHR = access.isHR || access.isAdmin;
  const isCreator = true; // Mock: 当前用户视为申请人

  const doAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      setActionLoading(successMsg);
      const res = await action();
      if (res.code === 0) {
        message.success(successMsg);
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  // 提交审批
  const handleSubmit = () => {
    Modal.confirm({
      title: '确认提交审批',
      content: '提交后不可修改，确定要提交该入职申请吗？',
      onOk: () => doAction(
        () => submitToApprovalUsingPost({ id: Number(id) }),
        '已提交审批',
      ),
    });
  };

  // 撤回
  const handleCancel = () => {
    Modal.confirm({
      title: '确认撤回',
      content: '撤回后该入职申请将变更为草稿状态',
      onOk: () => doAction(
        () => cancelUsingPost1({ id: Number(id) }),
        '已撤回',
      ),
    });
  };

  // 确认入职
  const handleConfirmJoin = async () => {
    try {
      const values = await confirmForm.validateFields();
      doAction(
        () => confirmJoinUsingPost({ id: Number(id), actualHireDate: values.actualHireDate.format('YYYY-MM-DD') }),
        `已确认入职，实际到岗日期：${values.actualHireDate.format('YYYY-MM-DD')}`,
      );
      setConfirmOpen(false);
    } catch {
      // validateFields error
    }
  };

  // 放弃入职
  const handleAbandon = () => {
    Modal.confirm({
      title: '确认放弃入职',
      content: '操作不可恢复，确定要放弃该候选人的入职吗？',
      okButtonProps: { danger: true },
      onOk: () => doAction(
        () => abandonUsingPost({ id: Number(id) }),
        '已标记放弃入职',
      ),
    });
  };

  // 删除草稿
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后将不可恢复，确定要删除该草稿吗？',
      okButtonProps: { danger: true },
      onOk: () => doAction(
        () => deleteDraftUsingDelete({ id: Number(id) }),
        '已删除',
      ).then(() => history.push('/hr-change/onboarding')),
    });
  };

  // Loading
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 120 }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  // Not found
  if (!detail) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="加载失败"
          subTitle="无法获取入职申请信息，请检查ID是否正确"
          extra={<Button onClick={() => history.push('/hr-change/onboarding')}>返回列表</Button>}
        />
      </PageContainer>
    );
  }

  const status = detail.status;
  const isDraft = status === ONBOARDING_STATUS.DRAFT;
  const isPending = status === ONBOARDING_STATUS.PENDING;
  const isApprovedPending = status === ONBOARDING_STATUS.APPROVED_PENDING_JOIN;
  const isJoined = status === ONBOARDING_STATUS.JOINED;
  const isRejected = status === ONBOARDING_STATUS.REJECTED;
  const isAbandoned = status === ONBOARDING_STATUS.ABANDONED;
  const canSubmit = isDraft && isCreator;
  const canCancel = isPending && isCreator;
  const canConfirm = isApprovedPending;
  const canAbandon = isApprovedPending;
  const canEdit = isDraft && isCreator;
  const canDelete = isDraft && isCreator;

  return (
    <PageContainer
      onBack={() => history.push('/hr-change/onboarding')}
      title="入职详情"
      extra={
        isJoined
          ? undefined
          : [
              canEdit && (
                <Button key="edit" onClick={() => message.info('编辑功能待实现')}>
                  编辑
                </Button>
              ),
              canDelete && (
                <Button key="delete" danger onClick={handleDelete}>
                  删除
                </Button>
              ),
              canSubmit && (
                <Button key="submit" type="primary" onClick={handleSubmit}>
                  提交审批
                </Button>
              ),
              canCancel && (
                <Button key="cancel" onClick={handleCancel}>
                  撤回
                </Button>
              ),
              canConfirm && (
                <Button
                  key="confirm"
                  type="primary"
                  onClick={() => setConfirmOpen(true)}
                >
                  确认入职
                </Button>
              ),
              canAbandon && (
                <Button key="abandon" danger onClick={handleAbandon}>
                  放弃入职
                </Button>
              ),
            ]
      }
    >
      {/* 基本信息卡片 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="姓名">{detail.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{GENDER_MAP[detail.gender] || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">
            <DesensitizedText type="phone" text={detail.phone} hasPermission={isHR} />
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">{detail.email}</Descriptions.Item>
          <Descriptions.Item label="身份证号" span={2}>
            <DesensitizedText type="idCard" text={detail.idCard} hasPermission={isHR} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 工作信息卡片 */}
      <Card title="工作信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="所属部门">{detail.departmentName}</Descriptions.Item>
          <Descriptions.Item label="职位">{detail.positionName}</Descriptions.Item>
          <Descriptions.Item label="录用类型">
            <Tag>{detail.hireTypeDesc}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="预计入职日期">{detail.expectedHireDate}</Descriptions.Item>
          <Descriptions.Item label="试用期">{`${detail.defaultProbationMonths ?? detail.probationMonths ?? '-'}个月`}</Descriptions.Item>
          <Descriptions.Item label="试用期薪资比例">{`${((detail.probationRatio ?? 0) * 100).toFixed(0)}%`}</Descriptions.Item>
          <Descriptions.Item label="直接汇报人" span={2}>
            {detail.directReportName || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 状态信息卡片 */}
      <Card title="状态信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="状态">
            <Tag color={ONBOARDING_STATUS_COLOR[status]}>{ONBOARDING_STATUS_MAP[status]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="申请人">{detail.applicantName}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{detail.updateTime || '-'}</Descriptions.Item>
          {detail.employeeNo && (
            <Descriptions.Item label="工号">
              <span style={{ fontFamily: 'monospace' }}>{detail.employeeNo}</span>
            </Descriptions.Item>
          )}
          {detail.actualHireDate && (
            <Descriptions.Item label="实际入职日期">{detail.actualHireDate}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 审批进度 */}
      {(isPending || isApprovedPending || isRejected || isAbandoned) && detail.approvalProgress && (
        <Card title="审批进度" style={{ marginBottom: 16 }}>
          <ApprovalTimeline
            nodes={detail.approvalProgress.nodes}
            currentNodeOrder={detail.approvalProgress.currentNodeOrder}
          />
        </Card>
      )}

      {/* 确认入职弹窗 */}
      <Modal
        title="确认入职"
        open={confirmOpen}
        onOk={handleConfirmJoin}
        onCancel={() => setConfirmOpen(false)}
        confirmLoading={actionLoading === 'confirm'}
        destroyOnClose
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item
            name="actualHireDate"
            label="实际到岗日期"
            rules={[{ required: true, message: '请选择实际到岗日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default OnboardingDetailPage;
