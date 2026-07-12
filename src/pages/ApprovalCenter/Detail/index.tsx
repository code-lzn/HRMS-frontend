import {
  approveUsingPost,
  getApprovalDetailUsingGet,
  rejectUsingPost,
  transferUsingPost,
} from '@/api/approvalController';
import { listUserVoByPageUsingPost } from '@/api/userController';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useModel, useNavigate, useParams, useSearchParams } from '@umijs/max';
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

/** 审批类型 → Tag 颜色 */
const TYPE_COLOR: Record<string, string> = {
  ONBOARDING: 'blue',
  REGULARIZATION: 'green',
  TRANSFER: 'orange',
  RESIGNATION: 'red',
  LEAVE: 'cyan',
  PATCH_CLOCK: 'purple',
  SALARY_BATCH: 'gold',
};

/** 操作颜色 */
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
  const { initialState } = useModel('@@initialState');
  const currentUserName =
    (initialState as any)?.currentUser?.userName ?? '';

  const [detail, setDetail] = useState<API.ApprovalDetailVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 审批操作 Modal 状态
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
    } catch {
      message.error('加载审批详情失败');
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // 判断当前用户是否是当前节点审批人
  const pendingNode = detail?.nodeHistory?.find(
    (n) => n.stepOrder === detail.currentStep && n.action === 'PENDING',
  );
  const isCurrentApprover =
    pendingNode?.approverName === currentUserName;

  // 搜索用户（用于转交）
  const handleUserSearch = async (keyword: string) => {
    if (!keyword) {
      setUserOptions([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const res = await listUserVoByPageUsingPost({
        current: 1,
        pageSize: 20,
        userName: keyword,
      });
      const list = res?.data?.records ?? [];
      setUserOptions(
        list.map((u) => ({ label: u.userName ?? '', value: u.id! })),
      );
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  // 通过
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveUsingPost({
        detailId: Number(detailIdFromQuery),
        comment,
      });
      message.success('审批通过');
      setApproveModalOpen(false);
      setComment('');
      loadDetail();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 拒绝
  const handleReject = async () => {
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
  };

  // 转交
  const handleTransfer = async () => {
    if (!transferUserId) {
      message.warning('请选择转交人');
      return;
    }
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
      {/* 顶部导航 */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/approval/workbench')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        返回工作台
      </Button>

      {/* 标题区 */}
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

      {/* 申请信息 */}
      <Card title="申请信息" style={{ marginBottom: 16 }}>
        <BusinessInfoCard detail={detail} />
      </Card>

      {/* 审批历史 */}
      <Card title="审批历史" style={{ marginBottom: 16 }}>
        <Timeline
          items={(detail.nodeHistory ?? []).map((node) => {
            const isCurrent = node.action === 'PENDING';
            const isCompleted = node.action !== 'PENDING';
            const color = isCurrent
              ? 'blue'
              : isCompleted
                ? 'green'
                : 'gray';

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

      {/* 审批操作（仅当前审批人可见） */}
      {isCurrentApprover &&
        detail.status !== 'APPROVED' &&
        detail.status !== 'REJECTED' && (
          <Card title="审批操作">
            <Space size={16}>
              <Button
                type="primary"
                onClick={() => setApproveModalOpen(true)}
              >
                通过
              </Button>
              <Button
                danger
                onClick={() => setRejectModalOpen(true)}
              >
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
          placeholder="请输入拒绝原因"
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
            placeholder="搜索并选择转交人"
            filterOption={false}
            onSearch={handleUserSearch}
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

  // 通用字段
  const commonItems = [
    { label: '申请人', children: applicantName ?? '-' },
    {
      label: '申请时间',
      children: applyTime
        ? dayjs(applyTime).format('YYYY-MM-DD HH:mm:ss')
        : '-',
    },
    { label: '业务编号', children: businessId ?? '-' },
    { label: '审批类型', children: <Tag color={TYPE_COLOR[businessType ?? '']}>{detail.businessTypeText}</Tag> },
  ];

  return (
    <Descriptions
      column={{ xs: 1, sm: 2, md: 2 }}
      items={commonItems}
      size="small"
    />
  );
};

export default ApprovalDetail;
