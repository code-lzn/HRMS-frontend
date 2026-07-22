import {
  approveUsingPost,
  getApprovalDetailUsingGet,
  rejectUsingPost,
  transferUsingPost,
} from '@/api/approvalController';
import { getTransferableUsersUsingGet } from '@/api/onboardingController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

const TYPE_COLOR: Record<string, string> = {
  ONBOARDING: 'blue',
  REGULARIZATION: 'green',
  TRANSFER: 'orange',
  RESIGNATION: 'red',
  LEAVE: 'cyan',
  PATCH_CLOCK: 'purple',
  SALARY_BATCH: 'gold',
};

const ACTION_COLOR: Record<string, string> = {
  APPROVE: 'green',
  REJECT: 'red',
  TRANSFER: 'orange',
  PENDING: 'blue',
};

const ApprovalDetail: React.FC = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const [searchParams] = useSearchParams();
  const detailIdFromQuery = searchParams.get('detailId');
  const [detail, setDetail] = useState<API.ApprovalDetailVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [transferUserId, setTransferUserId] = useState<number | undefined>();
  const [userOptions, setUserOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const res = await getApprovalDetailUsingGet({
        recordId: Number(recordId),
      });
      setDetail(res?.data ?? null);
    } catch (e) { console.error('pages/ApprovalCenter/Detail/index.tsx', e); message.error('加载审批详情失败'); } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const pendingNode = detail?.nodeHistory?.find(
    (n) => n.stepOrder === detail.currentStep && n.action === 'PENDING',
  );
  // 审批中即显示操作按钮，权限由后端校验
  const canOperate = detail?.status === 'APPROVING';

  const handleUserSearch = async () => {
    setUserSearchLoading(true);
    try {
      const res = await getTransferableUsersUsingGet();
      const list = res?.data ?? [];
      setUserOptions(
        list.map((u) => ({
          label: (
            <span>
              <div>{u.userName ?? ''}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{u.userRoleName ?? ''}</div>
            </span>
          ),
          value: u.id!,
        })),
      );
    } catch (e) { console.error('pages/ApprovalCenter/Detail/index.tsx', e); setUserOptions([]); } finally {
      setUserSearchLoading(false);
    }
  };

  const handleApprove = () => {
    setApproveModalOpen(false);
    Modal.confirm({
      title: '确认审批通过',
      content: '确定要通过此审批吗？',
      onOk: async () => {
        setActionLoading(true);
        try {
          await approveUsingPost({
            detailId: Number(detailIdFromQuery),
            comment,
          });
          message.success('审批通过');
          setComment('');
          loadDetail();
        } catch (e: any) {
          message.error(e.message || '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = () => {
    if (!comment.trim()) {
      message.warning('请输入拒绝原因');
      return;
    }
    Modal.confirm({
      title: '确认拒绝',
      content: '确定要拒绝此审批吗？',
      onOk: async () => {
        setActionLoading(true);
        try {
          await rejectUsingPost({
            detailId: Number(detailIdFromQuery),
            comment,
          });
          message.success('已拒绝');
          setRejectModalOpen(false);
          setComment('');
          loadDetail();
        } catch (e: any) {
          message.error(e.message || '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleTransfer = () => {
    if (!transferUserId) {
      message.warning('请选择转交人');
      return;
    }
    Modal.confirm({
      title: '确认转交',
      content: '确定要将此审批转交给他人吗？',
      onOk: async () => {
        setActionLoading(true);
        try {
          await transferUsingPost({
            detailId: Number(detailIdFromQuery),
            targetUserId: transferUserId,
            comment,
          });
          message.success('已转交');
          setTransferModalOpen(false);
          setComment('');
          setTransferUserId(undefined);
          loadDetail();
        } catch (e: any) {
          message.error(e.message || '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return <div style={{ textAlign: 'center', padding: 100 }}>审批记录不存在</div>;
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/approval/workbench')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        返回工作台
      </Button>

      <Card style={{ marginBottom: 16 }}>
        <Space align="center">
          <Tag color={TYPE_COLOR[detail.businessType ?? ''] ?? 'default'}>
            {detail.businessTypeText}
          </Tag>
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {detail.businessTypeText}
          </span>
          <Tag>{detail.statusText}</Tag>
        </Space>
      </Card>

      {/* 申请信息 — 按类型动态渲染 */}
      <Card title="申请信息" style={{ marginBottom: 16 }}>
        <BusinessInfoCard detail={detail} />
      </Card>

      <Card title="审批历史" style={{ marginBottom: 16 }}>
        <Timeline
          items={(detail.nodeHistory ?? []).map((node) => {
            const isCurrent = node.action === 'PENDING';
            const color = isCurrent ? 'blue' : node.action !== 'PENDING' ? 'green' : 'gray';

            return {
              color,
              children: (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {node.nodeName} — {node.approverName}
                    {node.isDelegated === 1 && node.delegatedByName && (
                      <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>
                        {node.approverName} 代 {node.delegatedByName} 审批
                      </Tag>
                    )}
                    {isCurrent && (
                      <Tag color="processing" style={{ marginLeft: 8 }}>
                        当前
                      </Tag>
                    )}
                  </div>
                  {node.actionText && (
                    <div style={{ marginTop: 4 }}>
                      <Tag color={ACTION_COLOR[node.action ?? '']}>
                        {node.actionText}
                      </Tag>
                      {node.operateTime &&
                        ` · ${dayjs(node.operateTime).format('YYYY-MM-DD HH:mm')}`}
                    </div>
                  )}
                  {node.comment && (
                    <div
                      style={{
                        color: '#666',
                        fontSize: 13,
                        marginTop: 4,
                        background: '#fafafa',
                        padding: '6px 10px',
                        borderRadius: 4,
                      }}
                    >
                      {node.isDelegated !== 1 ? '意见' : '备注'}：{node.comment}
                    </div>
                  )}
                </div>
              ),
            };
          })}
        />
      </Card>

      {canOperate && (
          <Card title="审批操作">
            <Space size={16}>
              <Button type="primary" onClick={() => setApproveModalOpen(true)}>
                通过
              </Button>
              <Button danger onClick={() => setRejectModalOpen(true)}>
                拒绝
              </Button>
              <Button onClick={() => setTransferModalOpen(true)}>
                转交
              </Button>
            </Space>
          </Card>
        )}

      {/* 通过 Modal */}
      <Modal
        title="审批通过"
        open={approveModalOpen}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalOpen(false);
          setComment('');
        }}
        confirmLoading={actionLoading}
      >
        <div style={{ marginBottom: 12 }}>
          <p><strong>审批类型：</strong>{detail.businessTypeText}</p>
          <p><strong>申请人：</strong>{detail.applicantName}</p>
          <p><strong>当前节点：</strong>{pendingNode?.nodeName}</p>
        </div>
        <Input.TextArea
          rows={3}
          placeholder="审批意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>

      {/* 拒绝 Modal */}
      <Modal
        title="审批拒绝"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setComment('');
        }}
        confirmLoading={actionLoading}
      >
        <div style={{ marginBottom: 12 }}>
          <p><strong>审批类型：</strong>{detail.businessTypeText}</p>
          <p><strong>申请人：</strong>{detail.applicantName}</p>
          <p><strong>当前节点：</strong>{pendingNode?.nodeName}</p>
        </div>
        <Input.TextArea
          rows={3}
          placeholder="请输入拒绝原因（必填）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>

      {/* 转交 Modal */}
      <Modal
        title="审批转交"
        open={transferModalOpen}
        onOk={handleTransfer}
        onCancel={() => {
          setTransferModalOpen(false);
          setComment('');
          setTransferUserId(undefined);
        }}
        confirmLoading={actionLoading}
      >
        <div style={{ marginBottom: 12 }}>
          <p><strong>审批类型：</strong>{detail.businessTypeText}</p>
          <p><strong>申请人：</strong>{detail.applicantName}</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            转交人 <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Select
            showSearch
            placeholder="选择转交人"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onDropdownVisibleChange={() => handleUserSearch()}
            loading={userSearchLoading}
            options={userOptions}
            value={transferUserId}
            onChange={(val) => setTransferUserId(val)}
            style={{ width: '100%' }}
          />
        </div>
        <Input.TextArea
          rows={3}
          placeholder="转交原因（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
};

/** 按审批类型动态渲染申请信息 */
const BusinessInfoCard: React.FC<{ detail: API.ApprovalDetailVO }> = ({
  detail,
}) => {
  const { businessType, applicantName, applyTime, businessId } = detail;

  const commonFields = (
    <>
      <Descriptions.Item label="申请人">{applicantName ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="申请时间">
        {applyTime ? dayjs(applyTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="业务编号">{businessId ?? '-'}</Descriptions.Item>
    </>
  );

  switch (businessType) {
    case 'ONBOARDING':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.ONBOARDING}>入职审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'REGULARIZATION':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.REGULARIZATION}>转正审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'TRANSFER':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.TRANSFER}>调岗审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'RESIGNATION':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.RESIGNATION}>离职审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'LEAVE':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.LEAVE}>请假审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'PATCH_CLOCK':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.PATCH_CLOCK}>补卡审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    case 'SALARY_BATCH':
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
          <Descriptions.Item label="审批类型">
            <Tag color={TYPE_COLOR.SALARY_BATCH}>薪资审批</Tag>
          </Descriptions.Item>
        </Descriptions>
      );

    default:
      return (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          {commonFields}
        </Descriptions>
      );
  }
};

export default ApprovalDetail;
