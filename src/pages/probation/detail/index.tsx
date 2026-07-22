import ApprovalTimeline from '@/components/ApprovalTimeline';
import {
  PROBATION_RESULT,
  PROBATION_RESULT_COLOR,
  PROBATION_RESULT_MAP,
  PROBATION_STATUS,
  PROBATION_STATUS_COLOR,
  PROBATION_STATUS_MAP,
} from '@/constants';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Modal,
  Radio,
  Result,
  Space,
  Spin,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { ProbationDetail } from '../mock';
import { getDetailUsingGet2, handleResultUsingPost } from '@/api/probationController';

const ProbationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ProbationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [handleOpen, setHandleOpen] = useState(false);
  const [handleResult, setHandleResult] = useState<number>(PROBATION_RESULT.PASS);
  const [extendedDate, setExtendedDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getDetailUsingGet2({ id: Number(id) })
      .then((res) => {
        if (res.code === 0 && res.data) {
          setDetail(res.data as unknown as ProbationDetail);
        } else {
          setDetail(null);
        }
      })
      .catch(() => {
        message.error('获取转正详情失败');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const refreshDetail = () => {
    if (!id) return;
    getDetailUsingGet2({ id: Number(id) })
      .then((res) => {
        if (res.code === 0 && res.data) {
          setDetail(res.data as unknown as ProbationDetail);
        }
      })
      .catch(() => message.error('刷新详情失败'));
  };

  const submitHandleResult = async () => {
    if (handleResult === PROBATION_RESULT.EXTEND && !extendedDate) {
      message.warning('请选择延长后的试用期截止日期');
      return;
    }
    setSubmitting(true);
    try {
      const res = await handleResultUsingPost(
        { id: Number(id) },
        {
          result: handleResult,
          extendedEndDate: handleResult === PROBATION_RESULT.EXTEND ? extendedDate : undefined,
        },
      );
      if (res.code === 0) {
        message.success('处理成功');
        setHandleOpen(false);
        refreshDetail();
      } else {
        message.error(res.message || '处理失败');
      }
    } catch {
      message.error('处理失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer><div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div></PageContainer>
    );
  }

  if (!detail) {
    return (
      <PageContainer>
        <Result status="error" title="加载失败" subTitle="无法获取转正申请信息"
          extra={<Button onClick={() => history.push('/hr-change/probation')}>返回列表</Button>} />
      </PageContainer>
    );
  }

  const hasResult = detail.result !== undefined && detail.result !== null;

  return (
    <PageContainer
      onBack={() => history.push('/hr-change/probation')}
      title="转正详情"
      extra={
        detail.status === PROBATION_STATUS.REJECTED ? (
          <Button type="primary" onClick={() => setHandleOpen(true)}>
            处理结果
          </Button>
        ) : undefined
      }
    >
      {/* 员工信息 */}
      <Card title="员工信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="员工姓名">{detail.employeeName}</Descriptions.Item>
          <Descriptions.Item label="工号">
            <span style={{ fontFamily: 'monospace' }}>{detail.employeeNo}</span>
          </Descriptions.Item>
          <Descriptions.Item label="部门">{detail.departmentName}</Descriptions.Item>
          <Descriptions.Item label="职位">{detail.positionName}</Descriptions.Item>
          <Descriptions.Item label="职级">{detail.jobLevel || '-'}</Descriptions.Item>
          <Descriptions.Item label="入职日期">{detail.hireDate}</Descriptions.Item>
          <Descriptions.Item label="试用期开始">{detail.probationStartDate}</Descriptions.Item>
          <Descriptions.Item label="试用期结束">{detail.probationEndDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 转正评估 */}
      <Card title="转正评估" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="试用期表现评价">
            {detail.performanceReview || <span style={{ color: '#999' }}>暂无评价内容</span>}
          </Descriptions.Item>
          {detail.salaryAdjustment !== undefined && detail.salaryAdjustment !== null && (
            <Descriptions.Item label="薪资调整">
              <span style={{ color: '#52c41a', fontWeight: 500 }}>+¥{detail.salaryAdjustment.toLocaleString()}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 状态信息 */}
      <Card title="状态信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="审批状态">
            <Tag color={PROBATION_STATUS_COLOR[detail.status]}>
              {PROBATION_STATUS_MAP[detail.status]}
            </Tag>
          </Descriptions.Item>
          {hasResult && (
            <Descriptions.Item label="转正结果">
              <Tag color={PROBATION_RESULT_COLOR[detail.result!]}>
                {PROBATION_RESULT_MAP[detail.result!]}
              </Tag>
            </Descriptions.Item>
          )}
          {detail.extendedEndDate && (
            <Descriptions.Item label="延长后试用期截止" span={2}>{detail.extendedEndDate}</Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">{detail.createTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 审批进度 */}
      {detail.approvalProgress && (
        <Card title="审批进度" style={{ marginBottom: 16 }}>
          <ApprovalTimeline
            nodes={detail.approvalProgress.nodes}
            currentNodeOrder={detail.approvalProgress.currentNodeOrder}
          />
        </Card>
      )}

      {/* 处理结果弹窗 */}
      <Modal
        title="处理转正结果"
        open={handleOpen}
        onCancel={() => setHandleOpen(false)}
        onOk={submitHandleResult}
        confirmLoading={submitting}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>处理方式</div>
          <Radio.Group
            value={handleResult}
            onChange={(e) => setHandleResult(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value={PROBATION_RESULT.PASS}>
                <span style={{ color: '#16a34a', fontWeight: 500 }}>通过</span>
                <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>覆盖审批结果，员工转为正式</span>
              </Radio>
              <Radio value={PROBATION_RESULT.EXTEND}>
                <span style={{ color: '#d97706', fontWeight: 500 }}>延长试用</span>
                <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>延长试用期后再评估</span>
              </Radio>
              <Radio value={PROBATION_RESULT.FAIL}>
                <span style={{ color: '#dc2626', fontWeight: 500 }}>不通过</span>
                <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>转正失败，自动创建离职草稿</span>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
        {handleResult === PROBATION_RESULT.EXTEND && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>延长后试用期截止日期</div>
            <DatePicker
              style={{ width: '100%' }}
              value={extendedDate ? dayjs(extendedDate) : null}
              onChange={(_, dateStr) => setExtendedDate(dateStr as string)}
              placeholder="请选择新的试用期截止日期"
            />
          </div>
        )}
        {handleResult === PROBATION_RESULT.FAIL && (
          <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
            确认不通过后，系统将自动为该员工创建一份"辞退"类型的离职草稿，请在离职管理中完善并提交。
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProbationDetailPage;
