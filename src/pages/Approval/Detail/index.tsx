import { getApprovalDetail, approve, rejectApproval, transferApproval } from '@/api/approvalController';
import { getEmployeeList } from '@/api/employeeController';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Card, Divider, Input, Select, Tag, Avatar, message, Modal } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ApprovalTimeline from '@/components/ApprovalTimeline';

const ApprovalDetail: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState<number | undefined>();
  const [empOptions, setEmpOptions] = useState<{ label: string; value: number }[]>([]);

  const fetchDetail = async () => {
    if (!instanceId) return;
    setLoading(true);
    try {
      const res = await getApprovalDetail(Number(instanceId));
      setDetail(res?.data || null);
    } catch (e: any) {
      message.error(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [instanceId]);

  const currentNode = detail?.nodes?.find((n: any) => n.status === 1);
  const isPending = detail?.status === 1;

  const handleApprove = async () => {
    if (!currentNode) return;
    setActionLoading('approve');
    try {
      await approve(currentNode.nodeId, {});
      message.success('审批通过');
      fetchDetail();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!currentNode || !rejectReason.trim()) return;
    setActionLoading('reject');
    try {
      await rejectApproval(currentNode.nodeId, { comment: rejectReason });
      message.success('已驳回');
      setRejectOpen(false);
      setRejectReason('');
      fetchDetail();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const handleTransfer = async () => {
    if (!currentNode || !transferUserId) return;
    setActionLoading('transfer');
    try {
      await transferApproval(currentNode.nodeId, { toApproverId: transferUserId });
      message.success('已转交');
      setTransferOpen(false);
      setTransferUserId(undefined);
      fetchDetail();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  const searchEmp = async (kw: string) => {
    if (!kw) {
      setEmpOptions([]);
      return;
    }
    try {
      const res = await getEmployeeList({ current: 1, pageSize: 20, keyword: kw });
      setEmpOptions(
        (res?.data?.records || []).map((e: any) => ({
          label: `${e.name} (${e.departmentName || ''})`,
          value: e.id,
        })),
      );
    } catch {
      setEmpOptions([]);
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 120 }}>加载中...</div>
      </PageContainer>
    );
  }

  // 根据业务类型渲染申请详情字段
  const renderBizData = (bizType: string, data: Record<string, any> | undefined) => {
    if (!data || Object.keys(data).length === 0) {
      return <div style={{ fontSize: 13, color: '#999' }}>暂无申请数据</div>;
    }

    const ONBOARDING_FIELDS = [
      ['name', '姓名'], ['genderDesc', '性别'], ['phone', '手机号'], ['email', '邮箱'],
      ['idCard', '身份证号'], ['expectedHireDate', '预计入职日期'], ['departmentName', '部门'],
      ['positionName', '职位'], ['hireTypeDesc', '录用类型'], ['probationMonths', '试用期(月)'],
      ['probationRatio', '试用期薪资比例'], ['directReportName', '直接汇报人'],
    ];
    const PROBATION_FIELDS = [
      ['employeeName', '员工姓名'], ['probationStartDate', '试用期开始'], ['probationEndDate', '试用期结束'],
      ['performanceReview', '表现评价'], ['salaryAdjustment', '薪资调整'], ['resultDesc', '转正结果'],
    ];
    const TRANSFER_FIELDS = [
      ['employeeName', '员工姓名'], ['fromDepartmentName', '原部门'], ['toDepartmentName', '新部门'],
      ['fromPositionName', '原职位'], ['toPositionName', '新职位'], ['fromJobLevel', '原职级'],
      ['toJobLevel', '新职级'], ['reason', '调岗原因'],
    ];
    const RESIGNATION_FIELDS = [
      ['employeeName', '员工姓名'], ['resignationDate', '离职日期'], ['resignationTypeDesc', '离职类型'],
      ['reason', '离职原因'], ['handoverToName', '工作交接人'],
    ];
    const LEAVE_FIELDS = [
      ['employeeName', '员工姓名'], ['leaveTypeDesc', '请假类型'], ['startTime', '开始时间'],
      ['endTime', '结束时间'], ['leaveDays', '请假天数'], ['reason', '请假事由'],
    ];

    let fields: [string, string][] = [];
    switch (bizType) {
      case 'ONBOARDING': fields = ONBOARDING_FIELDS; break;
      case 'PROBATION': fields = PROBATION_FIELDS; break;
      case 'TRANSFER': fields = TRANSFER_FIELDS; break;
      case 'RESIGNATION': fields = RESIGNATION_FIELDS; break;
      case 'LEAVE': fields = LEAVE_FIELDS; break;
      default: return <div style={{ fontSize: 13, color: '#999' }}>未知业务类型</div>;
    }

    return fields.map(([key, label]) => (
      <div key={key}>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{data[key] ?? '-'}</div>
      </div>
    ));
  };

  if (!detail) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>暂无数据</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: '审批详情',
        breadcrumbRender: () => (
          <div style={{ fontSize: 14, color: '#999' }}>
            <span onClick={() => history.push('/approval/pending')} style={{ cursor: 'pointer', color: '#6366f1', marginRight: 8 }}>审批工作台</span>
            <span>/</span>
            <span style={{ marginLeft: 8 }}>审批详情</span>
          </div>
        ),
      }}
      extra={[
        <span key="approvalNo" style={{ fontSize: 14, color: '#999' }}>{detail.approvalNo || 'APR-2024-001'}</span>,
      ]}
    >
      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#6366f1', fontSize: 28 }}
            >
              {getInitial(detail.applicantName)}
            </Avatar>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{detail.applicantName}</div>
              <div style={{ fontSize: 14, color: '#999' }}>{detail.applicantDepartment || '人力资源部'}</div>
            </div>
          </div>
          <Tag color="gold" style={{ fontSize: 13, padding: '6px 16px', background: '#fffbeb', color: '#d97706', borderRadius: 6 }}>
            {detail.statusDesc || '待审批'}
          </Tag>
        </div>
        <Divider style={{ margin: '20px 0', borderColor: '#f3f4f6' }} />
        <div style={{ display: 'flex', gap: 48 }}>
          <div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>审批类型</div>
            <Tag color="green" style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 4 }}>{detail.bizTypeDesc}</Tag>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>申请时间</div>
            <div style={{ fontSize: 14 }}>{dayjs(detail.createTime).format('YYYY-MM-DD HH:mm')}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>截止时间</div>
            <div style={{ fontSize: 14, color: '#999' }}>
              {detail.deadLine ? dayjs(detail.deadLine).format('YYYY-MM-DD HH:mm') : '-'}
            </div>
          </div>
        </div>
      </Card>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
        title={
          <div style={{ fontSize: 16, fontWeight: 600 }}>申请详情</div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {renderBizData(detail.bizType, detail.bizData)}
        </div>
      </Card>

      <Card
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}
        title={<div style={{ fontSize: 16, fontWeight: 600 }}>审批进度</div>}
      >
        <ApprovalTimeline nodes={detail.nodes} currentNodeOrder={detail.currentNodeOrder} />
      </Card>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} 
        title={
          <div style={{ fontSize: 16, fontWeight: 600 }}>审批操作</div>
        }
      >
        {isPending && currentNode ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              style={{ background: '#22c55e', borderColor: '#22c55e', borderRadius: 8, padding: '8px 24px' }}
              loading={actionLoading === 'approve'}
              onClick={handleApprove}
            >
              通过
            </Button>
            <Button
              size="large"
              icon={<CloseOutlined />}
              style={{ borderRadius: 8, padding: '8px 24px', borderColor: '#fca5a5', color: '#dc2626' }}
              onClick={() => setRejectOpen(true)}
            >
              拒绝
            </Button>
            <Button
              size="large"
              icon={<SwapOutlined />}
              style={{ borderRadius: 8, padding: '8px 24px', borderColor: '#93c5fd', color: '#2563eb' }}
              onClick={() => setTransferOpen(true)}
            >
              转交
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#999' }}>当前无待审批操作</div>
        )}
      </Card>

      <Modal
        title="审批驳回"
        open={rejectOpen}
        onOk={handleReject}
        onCancel={() => {
          setRejectOpen(false);
          setRejectReason('');
        }}
        confirmLoading={actionLoading === 'reject'}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
        style={{ borderRadius: 12 }}
      >
        <div style={{ marginBottom: 8 }}>驳回理由（必填）</div>
        <Input.TextArea rows={4} placeholder="请输入驳回理由" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
      </Modal>

      <Modal
        title="审批转交"
        open={transferOpen}
        onOk={handleTransfer}
        onCancel={() => {
          setTransferOpen(false);
          setTransferUserId(undefined);
        }}
        confirmLoading={actionLoading === 'transfer'}
        okText="确认转交"
        style={{ borderRadius: 12 }}
      >
        <div style={{ marginBottom: 8 }}>转交给</div>
        <Select
          showSearch
          placeholder="搜索并选择员工"
          filterOption={false}
          onSearch={searchEmp}
          options={empOptions}
          value={transferUserId}
          onChange={(v) => setTransferUserId(v)}
          style={{ width: '100%' }}
        />
      </Modal>
    </PageContainer>
  );
};

export default ApprovalDetail;
