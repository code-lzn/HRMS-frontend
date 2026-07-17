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
  Descriptions,
  Result,
  Spin,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { ProbationDetail, probationDetails } from '../mock';

const ProbationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ProbationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDetail(id ? probationDetails[Number(id)] || null : null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

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
    <PageContainer onBack={() => history.push('/hr-change/probation')} title="转正详情">
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
    </PageContainer>
  );
};

export default ProbationDetailPage;
